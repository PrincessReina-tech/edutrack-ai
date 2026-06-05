const mysql = require('mysql2');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

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

const conn = connection.promise();

async function run() {
  try {
    await conn.connect();
    console.log('Connected to Aiven MySQL ✅');

    const queries = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    credit_hours INT DEFAULT 3
  )`,
  `CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    score DECIMAL(5,2),
    grade VARCHAR(5),
    semester VARCHAR(20),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
  )`,
  `CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    predicted_gpa DECIMAL(3,2),
    risk_level ENUM('Low','Medium','High'),
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id)
  )`,
  // Create unique index without IF NOT EXISTS; handle duplicate error below
  `CREATE UNIQUE INDEX unique_student ON predictions(student_id)`,
  `INSERT IGNORE INTO courses (course_code, course_name, credit_hours) VALUES
    ('CEC 430', 'Introduction to Full Stack Web Dev', 4),
    ('CEC 418', 'Software Construction and Evolution', 4),
    ('CEC 416', 'Information System and Security', 3),
    ('EEC 330', 'Statistics and Probabilities', 3),
    ('CEC 434', 'Data Visualization', 4),
    ('FRE 101', 'French', 2)`
];

for (let i = 0; i < queries.length; i++) {
  try {
    await conn.query(queries[i]);
    console.log(`Query ${i + 1} executed successfully ✅`);
  } catch (err) {
    // ignore duplicate-index error, log others
    if (err && (err.code === 'ER_DUP_KEYNAME' || err.errno === 1396 || err.code === 'ER_INDEX_EXISTS')) {
      console.log(`Query ${i + 1}: index already exists — skipping ✅`);
    } else {
      console.error(`Query ${i + 1} failed:`, err.message);
    }
  }
}

console.log('All queries processed.');

  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    connection.end();
  }
}

run();