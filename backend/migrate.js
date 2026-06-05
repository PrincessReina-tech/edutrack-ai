const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

// LOCAL DATABASE (Workbench MySQL)
const localDb = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// AIVEN DATABASE (still kept separate via AIVEN vars)
const cloudDb = mysql.createPool({
  host: process.env.AIVEN_DB_HOST,
  port: process.env.AIVEN_DB_PORT,
  user: process.env.AIVEN_DB_USER,
  password: process.env.AIVEN_DB_PASSWORD,
  database: process.env.AIVEN_DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function migrateTable(tableName) {
  console.log(`\nMigrating ${tableName}...`);

  const [rows] = await localDb.query(`SELECT * FROM ${tableName}`);

  if (rows.length === 0) {
    console.log(`${tableName} is empty. Skipping.`);
    return;
  }

  for (let row of rows) {
    const columns = Object.keys(row).join(", ");
    const values = Object.values(row);
    const placeholders = values.map(() => "?").join(", ");

    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

    try {
      await cloudDb.query(sql, values);
    } catch (err) {
      console.error(`Error inserting into ${tableName}:`, err.message);
    }
  }

  console.log(`Migrated ${rows.length} records into ${tableName}`);
}

async function runMigration() {
  try {
    console.log("Starting migration...");

    await migrateTable("users");
    await migrateTable("grades");
    await migrateTable("predictions");

    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runMigration();