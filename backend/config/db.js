const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const fs = require('fs');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: fs.readFileSync('./ca.pem')
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.log('Database connection failed ', err);
  } else {
    console.log('Connected to MySQL Database ');
    connection.release();
  }
});

module.exports = pool;