const mysql = require('mysql2');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const tableName = process.argv[2];

if (!tableName) {
  console.log('Usage: node view-table.js <table_name>');
  process.exit();
}

const connection = mysql.createConnection({
  host: process.env.AIVEN_DB_HOST,
  port: process.env.AIVEN_DB_PORT,
  user: process.env.AIVEN_DB_USER,
  password: process.env.AIVEN_DB_PASSWORD,
  database: process.env.AIVEN_DB_NAME,
  ssl: {
    ca: fs.readFileSync('./ca.pem')
  }
});

connection.query(`SELECT * FROM ${tableName}`, (err, results) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log(`\nContents of table: ${tableName}\n`);
    console.table(results);
  }

  connection.end();
});