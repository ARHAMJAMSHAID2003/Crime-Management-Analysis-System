const oracledb = require("oracledb");

/**
 * Gets all crime reports with filters
 * @param {Object} filters - Optional filters (status, victimId, dateFrom, dateTo)
 * @returns {Promise<Array>} Array of crime report records
 */
async function listAllCrimeReports(filters = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let sql = `
      SELECT 
        cr.Report_ID AS report_id,
        cr.Reported_By_Victim_ID AS victim_id,
        cr.Reported_By_Name AS reported_by,
        cr.Date_Reported AS date_reported,
        cr.Report_Details AS details,
        cr.Report_Status AS status,
        v.Name AS victim_name,
        v.Email AS victim_email,
        CASE 
          WHEN cr.Reported_By_Victim_ID IS NOT NULL THEN 'Registered Victim'
          WHEN cr.Reported_By_Name = 'Anonymous' THEN 'Anonymous Report'
          ELSE 'Citizen Report'
        END AS report_type
      FROM Crime_Report cr
      LEFT JOIN Victim v ON cr.Reported_By_Victim_ID = v.Victim_ID
      WHERE 1=1
    `;
    const binds = {};

    if (filters.status) {
      sql += " AND cr.Report_Status = :status";
      binds.status = filters.status;
    }
    if (filters.victimId) {
      sql += " AND cr.Reported_By_Victim_ID = :victimId";
      binds.victimId = filters.victimId;
    }
    if (filters.dateFrom) {
      sql += " AND cr.Date_Reported >= :dateFrom";
      binds.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      sql += " AND cr.Date_Reported <= :dateTo";
      binds.dateTo = filters.dateTo;
    }

    sql += " ORDER BY cr.Date_Reported DESC";

    const result = await conn.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT  // 👈 ADD THIS!
    });
    
    return result.rows;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Gets crime report by ID with linked crimes
 * @param {number} reportId - The report ID
 * @returns {Promise<Object>} Report record with linked crimes
 */
async function getCrimeReportById(reportId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // Get report details
    const reportResult = await conn.execute(
      `SELECT 
        cr.Report_ID AS report_id,
        cr.Reported_By_Victim_ID AS victim_id,
        cr.Reported_By_Name AS reported_by,
        cr.Date_Reported AS date_reported,
        cr.Report_Details AS details,
        cr.Report_Status AS status,
        v.Name AS victim_name,
        v.Email AS victim_email,
        v.Contact_Info AS victim_contact,
        CASE 
          WHEN cr.Reported_By_Victim_ID IS NOT NULL THEN 'Registered Victim'
          WHEN cr.Reported_By_Name = 'Anonymous' THEN 'Anonymous Report'
          ELSE 'Citizen Report'
        END AS report_type
      FROM Crime_Report cr
      LEFT JOIN Victim v ON cr.Reported_By_Victim_ID = v.Victim_ID
      WHERE cr.Report_ID = :reportId`,
      { reportId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (reportResult.rows.length === 0) {
      return null;
    }

    // Get linked crimes
    const crimesResult = await conn.execute(
      `SELECT 
        c.Crime_ID AS crime_id,
        TO_CHAR(c.Date_Occurred, 'YYYY-MM-DD') AS date_occurred,
        c.Description AS crime_description,
        c.Status AS crime_status,
        ct.Type_Name AS crime_type,
        TO_CHAR(rc.Link_Date, 'YYYY-MM-DD HH24:MI:SS') AS linked_on,
        rc.Notes AS link_notes
      FROM Report_Crime rc
      JOIN Crime c ON rc.Crime_ID = c.Crime_ID
      LEFT JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
      WHERE rc.Report_ID = :reportId`,
      { reportId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // For each linked crime, attach suspects and investigation details
    for (const crime of crimesResult.rows) {
      const suspectsRes = await conn.execute(
        `SELECT s.Name, s.Status, cs.Role
         FROM Crime_Suspect cs
         JOIN Suspect s ON cs.Suspect_ID = s.Suspect_ID
         WHERE cs.Crime_ID = :crimeId`,
        { crimeId: crime.CRIME_ID },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      crime.SUSPECTS = suspectsRes.rows.map(s => ({
        Name: s.NAME,
        Status: s.STATUS,
        Role: s.ROLE
      }));

      // Fetch linked investigation for this crime
      const invRes = await conn.execute(
        `SELECT i.Investigation_ID, i.Case_Number, i.Status AS inv_status,
                i.Outcome, TO_CHAR(i.Start_Date, 'YYYY-MM-DD') AS start_date,
                TO_CHAR(i.Close_Date, 'YYYY-MM-DD') AS close_date,
                i.Notes, o.Name AS lead_officer
         FROM Investigation_Crime ic
         JOIN Investigation i ON ic.Investigation_ID = i.Investigation_ID
         LEFT JOIN Officer o ON i.Lead_Officer_ID = o.Officer_ID
         WHERE ic.Crime_ID = :crimeId
         ORDER BY i.Start_Date DESC
         FETCH FIRST 1 ROWS ONLY`,
        { crimeId: crime.CRIME_ID },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      crime.INVESTIGATION = invRes.rows.length > 0 ? {
        investigationId: invRes.rows[0].INVESTIGATION_ID,
        caseNumber: invRes.rows[0].CASE_NUMBER,
        status: invRes.rows[0].INV_STATUS,
        outcome: invRes.rows[0].OUTCOME,
        startDate: invRes.rows[0].START_DATE,
        closeDate: invRes.rows[0].CLOSE_DATE,
        notes: invRes.rows[0].NOTES,
        leadOfficer: invRes.rows[0].LEAD_OFFICER
      } : null;

      // Fetch evidence for this crime
      const evidenceRes = await conn.execute(
        `SELECT e.Evidence_ID, e.Type, e.Date_Collected, e.Description,
                o.Name AS collected_by_name
         FROM Evidence e
         LEFT JOIN Officer o ON e.Collected_By = o.Officer_ID
         WHERE e.Crime_ID = :crimeId
         ORDER BY e.Date_Collected ASC`,
        { crimeId: crime.CRIME_ID },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      crime.EVIDENCE = await Promise.all(evidenceRes.rows.map(async (ev) => {
        let descText = '';
        if (ev.DESCRIPTION && typeof ev.DESCRIPTION.getData === 'function') {
          try { descText = await ev.DESCRIPTION.getData(); } catch (_) { descText = ''; }
        } else if (typeof ev.DESCRIPTION === 'string') {
          descText = ev.DESCRIPTION;
        }
        // Extract last chain-of-custody action keyword from description
        const actions = ['RELEASED', 'STORED', 'ANALYZED', 'TRANSFERRED', 'COLLECTED'];
        let currentStatus = 'Collected';
        for (const action of actions) {
          if (descText.toUpperCase().includes(action)) { currentStatus = action.charAt(0) + action.slice(1).toLowerCase(); break; }
        }
        return {
          evidenceId: ev.EVIDENCE_ID,
          type: ev.TYPE,
          dateCollected: ev.DATE_COLLECTED ? new Date(ev.DATE_COLLECTED).toISOString().split('T')[0] : null,
          collectedBy: ev.COLLECTED_BY_NAME || 'Unknown',
          currentStatus
        };
      }));
    }

    return {
      report: reportResult.rows[0],
      linked_crimes: crimesResult.rows,
      total_linked_crimes: crimesResult.rows.length
    };
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Creates a new crime report
 * @param {Object} reportData - The report data
 */
async function createCrimeReport(reportData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // Get the next Report_ID from sequence
    const seqResult = await conn.execute(
      `SELECT crime_report_seq.NEXTVAL AS NEXT_ID FROM DUAL`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const reportId = seqResult.rows[0].NEXT_ID;
    
    const result = await conn.execute(
      `INSERT INTO Crime_Report (
        Report_ID, Reported_By_Victim_ID, Reported_By_Name, Report_Details, Report_Status
      ) VALUES (
        :reportId, :victimId, :reportedByName, :reportDetails, :reportStatus
      )`,

      {
        reportId,
        victimId: reportData.victimId || null,
        reportedByName: reportData.reportedByName || null,
        reportDetails: reportData.reportDetails,
        reportStatus: reportData.reportStatus || "Pending Review",
      },
      { autoCommit: true }
    );
    
    return { ...result, reportId };
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Creates a crime report and automatically creates a linked crime using stored procedure
 * This uses sp_create_crime_report which handles report creation, crime creation, and linking in one transaction
 * @param {Object} reportData - The report data including crimeTypeId, dateOccurred, locationId
 * @returns {Promise<Object>} Object with reportId and crimeId
 */
async function createCrimeReportWithAutoCrime(reportData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // Validate required fields for auto-crime creation
    if (!reportData.crimeTypeId) {
      throw new Error("crimeTypeId is required for auto-crime creation");
    }
    if (!reportData.dateOccurred) {
      throw new Error("dateOccurred is required for auto-crime creation");
    }
    if (!reportData.locationId) {
      throw new Error("locationId is required for auto-crime creation");
    }
    
    // Call stored procedure
    const result = await conn.execute(
      `BEGIN
        sp_create_crime_report(
          :victimId, :reportedByName, :reportDetails,
          :crimeTypeId, :dateOccurred, :locationId,
          :reportId, :crimeId
        );
      END;`,
      {
        victimId: reportData.victimId || null,
        reportedByName: reportData.reportedByName || null,
        reportDetails: reportData.reportDetails,
        crimeTypeId: reportData.crimeTypeId,
        dateOccurred: reportData.dateOccurred,
        locationId: reportData.locationId,
        reportId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        crimeId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );
    
    return {
      reportId: result.outBinds.reportId,
      crimeId: result.outBinds.crimeId
    };
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Updates crime report status
 * @param {number} reportId - The report ID
 * @param {Object} updateData - The update data
 */
async function updateCrimeReport(reportId, updateData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let fieldsToUpdate = [];
    let values = { reportId };

    if (updateData.reportStatus) {
      fieldsToUpdate.push("Report_Status = :reportStatus");
      values.reportStatus = updateData.reportStatus;
    }
    if (updateData.reportDetails) {
      fieldsToUpdate.push("Report_Details = :reportDetails");
      values.reportDetails = updateData.reportDetails;
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields provided to update");
    }

    const sql = `UPDATE Crime_Report SET ${fieldsToUpdate.join(", ")} WHERE Report_ID = :reportId`;
    const result = await conn.execute(sql, values, { autoCommit: true });
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Links a crime report to a crime
 * @param {number} reportId - The report ID
 * @param {number} crimeId - The crime ID
 * @param {string} notes - Optional notes
 */
async function linkReportToCrime(reportId, crimeId, notes) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `INSERT INTO Report_Crime (Report_ID, Crime_ID, Notes)
       VALUES (:reportId, :crimeId, :notes)`,
      { reportId, crimeId, notes: notes || null },
      { autoCommit: true }
    );
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Deletes a crime report
 * @param {number} reportId - The report ID
 */
async function deleteCrimeReport(reportId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `DELETE FROM Crime_Report WHERE Report_ID = :reportId`,
      { reportId },
      { autoCommit: true }
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

module.exports = {
  listAllCrimeReports,
  getCrimeReportById,
  createCrimeReport,
  createCrimeReportWithAutoCrime,
  updateCrimeReport,
  linkReportToCrime,
  deleteCrimeReport,
};

