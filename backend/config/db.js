const oracledb = require("oracledb");
require("dotenv").config();

function validateEnv() {
  const required = ["DB_USER", "DB_PASSWORD", "DB_CONNECTION_STRING"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

async function initialize() {
  try {
    validateEnv();

    // Reuse existing pool if already initialized.
    try {
      const existingPool = oracledb.getPool("cpas_pool");
      if (existingPool) {
        console.log("Using existing OracleDB pool");
        return existingPool;
      }
    } catch (_err) {
      // No pool exists yet, proceed to create one.
    }

    await oracledb.createPool({
      poolAlias: "cpas_pool",
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      poolMin: Number(process.env.DB_POOL_MIN || 1),
      poolMax: Number(process.env.DB_POOL_MAX || 10),
      poolIncrement: Number(process.env.DB_POOL_INCREMENT || 1),
    });
    console.log("Connected to OracleDB");
  } catch (err) {
    console.error("OracleDB connection failed:", err.message);
    throw err;
  }
}

async function closePool() {
  try {
    const pool = oracledb.getPool("cpas_pool");
    await pool.close(10);
    console.log("OracleDB pool closed");
  } catch (_err) {
    // Pool may not exist; ignore in shutdown paths.
  }
}

module.exports = { initialize, closePool };
