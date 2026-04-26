const {
  listAllSuspects,
  getSuspectById,
  createSuspect,
  updateSuspect,
  deleteSuspect,
} = require("../models/SuspectModel");
const oracledb = require("oracledb");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Helper to safely JSON-clone and drop circular refs
const safeClone = (data) => {
  const seen = new WeakSet();
  return JSON.parse(
    JSON.stringify(data, (_k, v) => {
      if (typeof v === "object" && v !== null) {
        if (seen.has(v)) return undefined;
        seen.add(v);
      }
      return v;
    })
  );
};

/**
 * Get all suspects with optional filters
 */
async function getAllSuspects(req, res) {
  try {
    const filters = {
      status: req.query.status,
      hasCriminalRecord: req.query.hasCriminalRecord === "true" ? true : req.query.hasCriminalRecord === "false" ? false : undefined,
      searchName: req.query.searchName,
    };
    const suspects = await listAllSuspects(filters);
    res.json({ data: safeClone(suspects) });
  } catch (err) {
    console.error("Error fetching suspects:", err);
    res.status(500).json({ message: "Error fetching suspects", error: err.message });
  }
}

/**
 * Get suspect by ID with crime history
 */
async function getSuspect(req, res) {
  try {
    const suspectId = parseInt(req.params.id);
    const suspectData = await getSuspectById(suspectId);
    if (!suspectData) {
      return res.status(404).json({ message: "Suspect not found" });
    }
    res.json({ data: suspectData });
  } catch (err) {
    console.error("Error fetching suspect:", err);
    res.status(500).json({ message: "Error fetching suspect", error: err.message });
  }
}

/**
 * Create a new suspect (Officer only)
 */
async function addSuspect(req, res) {
  try {
    await createSuspect(req.body);
    res.status(201).json({ message: "Suspect created successfully" });
  } catch (err) {
    console.error("Error creating suspect:", err);
    res.status(500).json({ message: "Error creating suspect", error: err.message });
  }
}

/**
 * Update a suspect (Officer only)
 */
async function updateSuspectHandler(req, res) {
  try {
    const suspectId = parseInt(req.params.id);
    await updateSuspect(suspectId, req.body);
    res.json({ message: "Suspect updated successfully" });
  } catch (err) {
    console.error("Error updating suspect:", err);
    res.status(500).json({ message: "Error updating suspect", error: err.message });
  }
}

/**
 * Delete a suspect (Officer only)
 */
async function deleteSuspectHandler(req, res) {
  try {
    const suspectId = parseInt(req.params.id);
    const result = await deleteSuspect(suspectId);
    if (result.rowsAffected > 0) {
      res.json({ message: "Suspect deleted successfully" });
    } else {
      res.status(404).json({ message: "Suspect not found" });
    }
  } catch (err) {
    console.error("Error deleting suspect:", err);
    res.status(500).json({ message: "Error deleting suspect", error: err.message });
  }
}

module.exports = {
  getAllSuspects,
  getSuspect,
  addSuspect,
  updateSuspectHandler,
  deleteSuspectHandler,
  arrestSuspect,
};

/**
 * POST /suspects/:id/arrest
 * Marks suspect as Arrested, fetches linked victims, sends notification emails.
 */
async function arrestSuspect(req, res) {
  const suspectId = parseInt(req.params.id);
  const { arrestDate, arrestLocation, notes, caseNumber } = req.body;

  let conn;
  try {
    conn = await oracledb.getConnection();

    // 1. Fetch suspect record
    const suspectResult = await conn.execute(
      `SELECT Suspect_ID, Name, Status FROM Suspect WHERE Suspect_ID = :id`,
      { id: suspectId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!suspectResult.rows || suspectResult.rows.length === 0) {
      return res.status(404).json({ message: "Suspect not found" });
    }
    const suspect = suspectResult.rows[0];
    const previousStatus = suspect.STATUS || suspect.Status;

    // 2. Update suspect status to Arrested
    await conn.execute(
      `UPDATE Suspect SET Status = 'Arrested' WHERE Suspect_ID = :id`,
      { id: suspectId },
      { autoCommit: true }
    );

    // 2a. Update Crime.Status to 'Closed' for all crimes linked to this suspect
    await conn.execute(
      `UPDATE Crime SET Status = 'Closed'
       WHERE Crime_ID IN (SELECT Crime_ID FROM Crime_Suspect WHERE Suspect_ID = :id)`,
      { id: suspectId },
      { autoCommit: true }
    );

    // 2b. Update Crime_Report.Report_Status to 'Resolved' for all reports linked to those crimes
    await conn.execute(
      `UPDATE Crime_Report SET Report_Status = 'Resolved'
       WHERE Report_ID IN (
         SELECT rc.Report_ID FROM Report_Crime rc
         JOIN Crime_Suspect cs ON rc.Crime_ID = cs.Crime_ID
         WHERE cs.Suspect_ID = :id
       )`,
      { id: suspectId },
      { autoCommit: true }
    );

    // 2c. Close investigations where ALL linked crimes are now 'Closed'
    //     (An investigation with multiple crimes only closes when every crime is resolved)
    await conn.execute(
      `UPDATE Investigation SET
         Status = 'Closed',
         Outcome = 'Solved',
         Close_Date = SYSDATE
       WHERE Investigation_ID IN (
         -- Investigations that contain at least one crime linked to this suspect
         SELECT DISTINCT ic.Investigation_ID
         FROM Investigation_Crime ic
         JOIN Crime_Suspect cs ON ic.Crime_ID = cs.Crime_ID
         WHERE cs.Suspect_ID = :id
       )
       AND Investigation_ID NOT IN (
         -- Exclude investigations that still have at least one open crime
         SELECT ic2.Investigation_ID
         FROM Investigation_Crime ic2
         JOIN Crime c2 ON ic2.Crime_ID = c2.Crime_ID
         WHERE c2.Status != 'Closed'
       )`,
      { id: suspectId },
      { autoCommit: true }
    );

    // 3. Find all victims linked via crimes linked to this suspect
    const victimsResult = await conn.execute(
      `SELECT DISTINCT v.Victim_ID, v.Name, v.Email, v.Contact_Info,
              c.Crime_ID, cs.Role AS Suspect_Role
       FROM Crime_Suspect cs
       JOIN Crime c ON cs.Crime_ID = c.Crime_ID
       JOIN Crime_Victim cv ON cv.Crime_ID = c.Crime_ID
       JOIN Victim v ON cv.Victim_ID = v.Victim_ID
       WHERE cs.Suspect_ID = :suspectId AND v.Email IS NOT NULL`,
      { suspectId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const victims = victimsResult.rows || [];

    // 4. Send emails to each victim
    const notifiedVictims = [];
    const emailErrors = [];

    if (victims.length > 0 && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      for (const victim of victims) {
        const victimName = victim.NAME || victim.name;
        const victimEmail = victim.EMAIL || victim.email;
        const role = victim.SUSPECT_ROLE || victim.suspect_role || "suspect";
        const crimeId = victim.CRIME_ID || victim.crime_id;

        const subject = `Arrest Update — Case ${caseNumber || `Crime #${crimeId}`}`;
        const text = `Dear ${victimName},\n\nWe are writing to inform you that the ${role} in your case (Crime #${crimeId}) has been arrested.\n\nSuspect: ${suspect.NAME || suspect.name}\nArrest Date: ${arrestDate || "N/A"}\nArrest Location: ${arrestLocation || "N/A"}\n${notes ? `Notes: ${notes}\n` : ""}\nThis is an automated notification from the Crime Management Analysis System (CMAS).\n\n— CMAS Team`;

        try {
          await transporter.sendMail({
            from: `"CMAS Notifications" <${process.env.EMAIL_USER}>`,
            to: victimEmail,
            subject,
            text,
          });
          notifiedVictims.push({ name: victimName, email: victimEmail, status: "sent" });
        } catch (mailErr) {
          emailErrors.push({ name: victimName, email: victimEmail, error: mailErr.message });
          notifiedVictims.push({ name: victimName, email: victimEmail, status: "failed" });
        }
      }
    } else {
      // No email config — still return victim list for UI display
      for (const victim of victims) {
        notifiedVictims.push({
          name: victim.NAME || victim.name,
          email: victim.EMAIL || victim.email,
          status: "no_email_config",
        });
      }
    }

    res.json({
      message: "Suspect marked as Arrested",
      suspect: {
        id: suspectId,
        name: suspect.NAME || suspect.name,
        previousStatus,
        newStatus: "Arrested",
      },
      notifiedVictims,
      emailErrors,
    });
  } catch (err) {
    console.error("Error arresting suspect:", err);
    res.status(500).json({ message: "Error arresting suspect", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

