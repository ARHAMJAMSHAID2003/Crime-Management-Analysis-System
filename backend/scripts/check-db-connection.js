const oracledb = require("oracledb");
require("dotenv").config();

async function checkConnection() {
  let conn;
  try {
    const required = ["DB_USER", "DB_PASSWORD", "DB_CONNECTION_STRING"];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }

    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    const result = await conn.execute("SELECT 'DB_OK' AS STATUS FROM DUAL", [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    console.log("Oracle DB connected successfully");
    console.log(result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("Oracle DB connection check failed:", err.message);
    process.exit(1);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

checkConnection();
