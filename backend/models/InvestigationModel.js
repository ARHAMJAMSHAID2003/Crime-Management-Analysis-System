const oracledb = require("oracledb");

/**
 * Gets all investigations with filters
 * @param {Object} filters - Optional filters (status, outcome, leadOfficerId)
 * @returns {Promise<Array>} Array of investigation records
 */
async function listAllInvestigations(filters = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let sql = `
      SELECT 
        i.Investigation_ID,
        i.Case_Number,
        i.Lead_Officer_ID,
        o.Name AS Lead_Officer_Name,
        i.Start_Date,
        i.Close_Date,
        i.Status,
        i.Outcome,
        i.Notes,
        (SELECT COUNT(*) FROM Investigation_Crime ic WHERE ic.Investigation_ID = i.Investigation_ID) AS Linked_Crimes_Count,
        (SELECT LISTAGG(ic.Crime_ID, ', ') WITHIN GROUP (ORDER BY ic.Crime_ID) FROM Investigation_Crime ic WHERE ic.Investigation_ID = i.Investigation_ID) AS Linked_Crime_IDs
      FROM Investigation i
      LEFT JOIN Officer o ON i.Lead_Officer_ID = o.Officer_ID
      WHERE 1=1
    `;
    const binds = {};

    if (filters.status) {
      sql += " AND i.Status = :status";
      binds.status = filters.status;
    }
    if (filters.outcome) {
      sql += " AND i.Outcome = :outcome";
      binds.outcome = filters.outcome;
    }
    if (filters.leadOfficerId) {
      sql += " AND i.Lead_Officer_ID = :leadOfficerId";
      binds.leadOfficerId = filters.leadOfficerId;
    }

    sql += " ORDER BY i.Start_Date DESC";

    const result = await conn.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
 * Gets investigation by ID with linked crimes
 * @param {number} investigationId - The investigation ID
 * @returns {Promise<Object>} Investigation record with linked crimes
 */
async function getInvestigationById(investigationId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // Get investigation details
    const investigationResult = await conn.execute(
      `SELECT 
        i.*,
        o.Name AS Lead_Officer_Name,
        o.Email AS Lead_Officer_Email
      FROM Investigation i
      LEFT JOIN Officer o ON i.Lead_Officer_ID = o.Officer_ID
      WHERE i.Investigation_ID = :investigationId`,
      { investigationId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (investigationResult.rows.length === 0) {
      return null;
    }

    // Get linked crimes
    const crimesResult = await conn.execute(
      `SELECT 
        c.Crime_ID,
        c.Date_Occurred,
        c.Description,
        c.Status,
        ct.Type_Name AS Crime_Type,
        ic.Link_Date
      FROM Investigation_Crime ic
      JOIN Crime c ON ic.Crime_ID = c.Crime_ID
      LEFT JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
      WHERE ic.Investigation_ID = :investigationId
      ORDER BY c.Date_Occurred DESC`,
      { investigationId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return {
      investigation: investigationResult.rows[0],
      linkedCrimes: crimesResult.rows,
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
 * Creates a new investigation
 * @param {Object} investigationData - The investigation data
 */
async function createInvestigation(investigationData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // Convert date string to Date object if needed
    let startDate = investigationData.startDate;
    if (typeof startDate === 'string') {
      startDate = new Date(startDate);
    } else if (!startDate) {
      startDate = new Date();
    }
    
    let closeDate = investigationData.closeDate;
    if (closeDate && typeof closeDate === 'string') {
      closeDate = new Date(closeDate);
    }
    
    // Generate unique Investigation_ID and Case_Number using sequence
    // Get next sequence value for both ID and case number
    const seqResult = await conn.execute(
      `SELECT investigation_seq.NEXTVAL AS NEXT_ID FROM DUAL`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const nextId = seqResult.rows[0].NEXT_ID;
    
    // Generate case number: INV-YYYY-<sequence>
    const year = new Date().getFullYear();
    const caseNumber = `INV-${year}-${String(nextId).padStart(6, '0')}`;
    
    console.log(`🔢 Creating investigation with ID=${nextId}, Case=${caseNumber}`);
    
    // Insert with explicit Investigation_ID to avoid trigger consuming another sequence value
    await conn.execute(
      `INSERT INTO Investigation (Investigation_ID, Case_Number, Lead_Officer_ID, Start_Date, Close_Date, Status, Outcome, Notes)
       VALUES (:investigationId, :caseNumber, :leadOfficerId, :startDate, :closeDate, :status, :outcome, :notes)`,
      {
        investigationId: nextId,
        caseNumber: caseNumber,
        leadOfficerId: investigationData.leadOfficerId || null,
        startDate: startDate,
        closeDate: closeDate || null,
        status: investigationData.status || "Active",
        outcome: investigationData.outcome || "Pending",
        notes: investigationData.notes || null,
      },
      { autoCommit: true }
    );
    
    console.log(`✅ Investigation created successfully: ID=${nextId}`);
    
    // Return investigation details
    return {
      investigationId: nextId,
      caseNumber: caseNumber
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
 * Updates an investigation
 * @param {number} investigationId - The investigation ID
 * @param {Object} updateData - The update data
 */
async function updateInvestigation(investigationId, updateData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let fieldsToUpdate = [];
    let values = { investigationId };

    if (updateData.status) {
      fieldsToUpdate.push("Status = :status");
      values.status = updateData.status;
    }
    if (updateData.outcome) {
      fieldsToUpdate.push("Outcome = :outcome");
      values.outcome = updateData.outcome;
    }
    if (updateData.leadOfficerId !== undefined) {
      fieldsToUpdate.push("Lead_Officer_ID = :leadOfficerId");
      values.leadOfficerId = updateData.leadOfficerId;
    }
    if (updateData.closeDate !== undefined) {
      fieldsToUpdate.push("Close_Date = :closeDate");
      if (updateData.closeDate && typeof updateData.closeDate === 'string') {
        values.closeDate = new Date(updateData.closeDate);
      } else {
        values.closeDate = updateData.closeDate;
      }
    }
    if (updateData.notes !== undefined) {
      fieldsToUpdate.push("Notes = :notes");
      values.notes = updateData.notes;
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields provided to update");
    }

    const sql = `UPDATE Investigation SET ${fieldsToUpdate.join(", ")} WHERE Investigation_ID = :investigationId`;
    await conn.execute(sql, values, { autoCommit: true });
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Links a crime to an investigation
 * @param {number} investigationId - The investigation ID
 * @param {number} crimeId - The crime ID
 */
async function linkCrimeToInvestigation(investigationId, crimeId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `INSERT INTO Investigation_Crime (Investigation_ID, Crime_ID)
       VALUES (:investigationId, :crimeId)`,
      { investigationId, crimeId },
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
 * Deletes an investigation
 * @param {number} investigationId - The investigation ID
 */
async function deleteInvestigation(investigationId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `DELETE FROM Investigation WHERE Investigation_ID = :investigationId`,
      { investigationId },
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

/**
 * Assigns an investigation to an officer using stored procedure
 * @param {number} investigationId - The investigation ID
 * @param {number} officerId - The officer ID to assign
 * @returns {Promise<string>} Status message (SUCCESS or ERROR message)
 */
async function assignInvestigationToOfficer(investigationId, officerId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `BEGIN
        sp_assign_investigation(:investigationId, :officerId, :status);
      END;`,
      {
        investigationId,
        officerId,
        status: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
      },
      { autoCommit: true }
    );
    
    const status = result.outBinds.status;
    if (status && status.startsWith('ERROR')) {
      throw new Error(status);
    }
    
    return status || 'SUCCESS';
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Gets all officers assigned to an investigation team
 */
async function getInvestigationTeam(investigationId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT io.Officer_ID, o.Name, o.Email, io.Role, TO_CHAR(io.Assigned_Date, 'YYYY-MM-DD') AS Assigned_Date
       FROM Investigation_Officer io
       JOIN Officer o ON io.Officer_ID = o.Officer_ID
       WHERE io.Investigation_ID = :investigationId
       ORDER BY io.Assigned_Date`,
      { investigationId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } catch (err) { throw err; } finally { if (conn) await conn.close(); }
}

/**
 * Adds an officer to an investigation team
 */
async function addTeamMember(investigationId, officerId, role) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `INSERT INTO Investigation_Officer (Investigation_ID, Officer_ID, Role, Assigned_Date)
       VALUES (:investigationId, :officerId, :role, SYSDATE)`,
      { investigationId, officerId, role: role || 'Field Officer' },
      { autoCommit: true }
    );
  } catch (err) { throw err; } finally { if (conn) await conn.close(); }
}

/**
 * Removes an officer from an investigation team
 */
async function removeTeamMember(investigationId, officerId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `DELETE FROM Investigation_Officer WHERE Investigation_ID = :investigationId AND Officer_ID = :officerId`,
      { investigationId, officerId },
      { autoCommit: true }
    );
  } catch (err) { throw err; } finally { if (conn) await conn.close(); }
}

module.exports = {
  listAllInvestigations,
  getInvestigationById,
  createInvestigation,
  updateInvestigation,
  linkCrimeToInvestigation,
  deleteInvestigation,
  assignInvestigationToOfficer,
  getInvestigationTeam,
  addTeamMember,
  removeTeamMember,
};

