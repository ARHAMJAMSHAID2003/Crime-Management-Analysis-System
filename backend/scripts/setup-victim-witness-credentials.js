/**
 * Script to generate emails and passwords for existing Victims and Witnesses
 * This will:
 * 1. Generate emails for Victims/Witnesses that don't have them
 * 2. Set hashed passwords
 * 3. Output credentials to a file for distribution
 * 
 * Usage: node scripts/setup-victim-witness-credentials.js
 */

const oracledb = require("oracledb");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

// Default password for all users (they should change it on first login)
const DEFAULT_PASSWORD = "changeme123";

async function setupCredentials() {
  let conn;
  try {
    // Connect to database
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    console.log("✅ Connected to database");
    console.log("🔐 Setting up credentials for Victims and Witnesses...\n");

    // Hash the default password once
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    
    const credentials = {
      victims: [],
      witnesses: [],
      timestamp: new Date().toISOString(),
    };

    // ============================================
    // VICTIMS
    // ============================================
    console.log("👥 Processing Victims...");
    
    // Get all victims
    const victimsResult = await conn.execute(
      `SELECT Victim_ID, Name, Email FROM Victim ORDER BY Victim_ID`
    );
    
    let victimsUpdated = 0;
    let victimsWithEmail = 0;
    
    for (const victim of victimsResult.rows) {
      const victimId = victim[0];
      const name = victim[1];
      let email = victim[2];
      
      // Generate email if doesn't exist
      if (!email) {
        email = `victim${victimId}@cpas.local`;
        await conn.execute(
          `UPDATE Victim SET Email = :email WHERE Victim_ID = :victimId`,
          { email, victimId },
          { autoCommit: false }
        );
      } else {
        victimsWithEmail++;
      }
      
      // Set password if doesn't exist
      const checkPassword = await conn.execute(
        `SELECT Password FROM Victim WHERE Victim_ID = :victimId`,
        { victimId }
      );
      
      if (!checkPassword.rows[0] || !checkPassword.rows[0][0]) {
        await conn.execute(
          `UPDATE Victim SET Password = :password WHERE Victim_ID = :victimId`,
          { password: hashedPassword, victimId },
          { autoCommit: false }
        );
        victimsUpdated++;
      }
      
      credentials.victims.push({
        id: victimId,
        name: name,
        email: email,
        password: DEFAULT_PASSWORD,
        type: 'Victim'
      });
    }
    
    await conn.commit();
    console.log(`   ✅ Processed ${victimsResult.rows.length} victims`);
    console.log(`   📧 Generated ${victimsResult.rows.length - victimsWithEmail} new emails`);
    console.log(`   🔐 Set ${victimsUpdated} passwords\n`);

    // ============================================
    // WITNESSES
    // ============================================
    console.log("👁️  Processing Witnesses...");
    
    // Get all witnesses
    const witnessesResult = await conn.execute(
      `SELECT Witness_ID, Name, Email FROM Witness ORDER BY Witness_ID`
    );
    
    let witnessesUpdated = 0;
    let witnessesWithEmail = 0;
    
    for (const witness of witnessesResult.rows) {
      const witnessId = witness[0];
      const name = witness[1];
      let email = witness[2];
      
      // Generate email if doesn't exist
      if (!email) {
        email = `witness${witnessId}@cpas.local`;
        await conn.execute(
          `UPDATE Witness SET Email = :email WHERE Witness_ID = :witnessId`,
          { email, witnessId },
          { autoCommit: false }
        );
      } else {
        witnessesWithEmail++;
      }
      
      // Set password if doesn't exist
      const checkPassword = await conn.execute(
        `SELECT Password FROM Witness WHERE Witness_ID = :witnessId`,
        { witnessId }
      );
      
      if (!checkPassword.rows[0] || !checkPassword.rows[0][0]) {
        await conn.execute(
          `UPDATE Witness SET Password = :password WHERE Witness_ID = :witnessId`,
          { password: hashedPassword, witnessId },
          { autoCommit: false }
        );
        witnessesUpdated++;
      }
      
      credentials.witnesses.push({
        id: witnessId,
        name: name,
        email: email,
        password: DEFAULT_PASSWORD,
        type: 'Witness'
      });
    }
    
    await conn.commit();
    console.log(`   ✅ Processed ${witnessesResult.rows.length} witnesses`);
    console.log(`   📧 Generated ${witnessesResult.rows.length - witnessesWithEmail} new emails`);
    console.log(`   🔐 Set ${witnessesUpdated} passwords\n`);

    // ============================================
    // SAVE CREDENTIALS TO FILES
    // ============================================
    const outputDir = path.join(__dirname, '..', 'credentials');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save as JSON
    const jsonFile = path.join(outputDir, 'user-credentials.json');
    fs.writeFileSync(jsonFile, JSON.stringify(credentials, null, 2));
    console.log(`📄 Saved credentials to: ${jsonFile}`);

    // Save as CSV for easy distribution
    const csvFile = path.join(outputDir, 'user-credentials.csv');
    let csvContent = 'Type,ID,Name,Email,Password\n';
    
    credentials.victims.forEach(v => {
      csvContent += `Victim,${v.id},"${v.name}",${v.email},${v.password}\n`;
    });
    
    credentials.witnesses.forEach(w => {
      csvContent += `Witness,${w.id},"${w.name}",${w.email},${w.password}\n`;
    });
    
    fs.writeFileSync(csvFile, csvContent);
    console.log(`📄 Saved CSV to: ${csvFile}`);

    // Save as readable text file
    const txtFile = path.join(outputDir, 'user-credentials.txt');
    let txtContent = '='.repeat(70) + '\n';
    txtContent += 'CPAS - User Credentials\n';
    txtContent += '='.repeat(70) + '\n';
    txtContent += `Generated: ${new Date().toLocaleString()}\n`;
    txtContent += `Default Password: ${DEFAULT_PASSWORD}\n`;
    txtContent += `⚠️  Users should change their password on first login!\n\n`;
    
    txtContent += '\n' + '='.repeat(70) + '\n';
    txtContent += 'VICTIMS\n';
    txtContent += '='.repeat(70) + '\n';
    credentials.victims.forEach(v => {
      txtContent += `\nID: ${v.id}\n`;
      txtContent += `Name: ${v.name}\n`;
      txtContent += `Email: ${v.email}\n`;
      txtContent += `Password: ${v.password}\n`;
      txtContent += '-'.repeat(70) + '\n';
    });
    
    txtContent += '\n' + '='.repeat(70) + '\n';
    txtContent += 'WITNESSES\n';
    txtContent += '='.repeat(70) + '\n';
    credentials.witnesses.forEach(w => {
      txtContent += `\nID: ${w.id}\n`;
      txtContent += `Name: ${w.name}\n`;
      txtContent += `Email: ${w.email}\n`;
      txtContent += `Password: ${w.password}\n`;
      txtContent += '-'.repeat(70) + '\n';
    });
    
    fs.writeFileSync(txtFile, txtContent);
    console.log(`📄 Saved readable text to: ${txtFile}\n`);

    // Summary
    console.log('='.repeat(70));
    console.log('✅ CREDENTIALS SETUP COMPLETE!');
    console.log('='.repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   Victims: ${credentials.victims.length}`);
    console.log(`   Witnesses: ${credentials.witnesses.length}`);
    console.log(`   Default Password: ${DEFAULT_PASSWORD}`);
    console.log(`\n📁 Credentials saved to: backend/credentials/`);
    console.log(`\n⚠️  IMPORTANT:`);
    console.log(`   - Share credentials with users securely`);
    console.log(`   - Users should change password on first login`);
    console.log(`   - Email format: victim{ID}@cpas.local or witness{ID}@cpas.local\n`);

  } catch (err) {
    console.error("❌ Error:", err);
    if (conn) {
      await conn.rollback();
    }
    process.exit(1);
  } finally {
    if (conn) {
      await conn.close();
      console.log("🔒 Database connection closed");
    }
  }
}

// Run the script
if (require.main === module) {
  setupCredentials()
    .then(() => {
      console.log("✅ Script completed successfully");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Script failed:", err);
      process.exit(1);
    });
}

module.exports = { setupCredentials };

