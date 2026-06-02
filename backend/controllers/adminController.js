const db = require('../config/db');

// Get all students with their GPA and risk level
const getAllStudents = (req, res) => {
db.query(
`SELECT 
  u.id,
  u.name,
  u.email,
  u.created_at,

  COUNT(DISTINCT g.id) as total_courses,
  ROUND(AVG(g.score), 1) as avg_score,

  COALESCE(MAX(p.predicted_gpa), 0) as predicted_gpa,
  COALESCE(MAX(p.risk_level), 'N/A') as risk_level,
  MAX(p.predicted_at) as predicted_at

 FROM users u
 LEFT JOIN grades g ON u.id = g.student_id
 LEFT JOIN predictions p ON u.id = p.student_id
 WHERE u.role = 'student'
 GROUP BY u.id, u.name, u.email, u.created_at
 ORDER BY u.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      res.json(results);
    }
  );
};

// Get single student details
const getStudentDetails = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT 
      u.id,
      u.name,
      u.email,
      u.created_at,
      p.predicted_gpa,
      p.risk_level,
      p.predicted_at
     FROM users u
     LEFT JOIN predictions p ON u.id = p.student_id
     WHERE u.id = ? AND u.role = 'student'`,
    [id],
    (err, userResults) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (userResults.length === 0) return res.status(404).json({ message: 'Student not found' });

      // Get student grades
      db.query(
        `SELECT g.id, c.course_code, c.course_name, c.credit_hours,
         g.score, g.grade, g.semester
         FROM grades g
         JOIN courses c ON g.course_id = c.id
         WHERE g.student_id = ?
         ORDER BY g.semester, c.course_code`,
        [id],
        (err, gradeResults) => {
          if (err) return res.status(500).json({ message: 'Database error' });

          // Calculate GPA
          let totalPoints = 0;
          let totalCredits = 0;

          gradeResults.forEach((row) => {
            let gradePoint;
            if (row.score >= 80) gradePoint = 4.0;
            else if (row.score >= 70) gradePoint = 3.5;
            else if (row.score >= 60) gradePoint = 3.0;
            else if (row.score >= 55) gradePoint = 2.5;
            else if (row.score >= 50) gradePoint = 2.0;
            else if (row.score >= 45) gradePoint = 1.5;
            else if (row.score >= 40) gradePoint = 1.0;
            else gradePoint = 0.0;

            totalPoints += gradePoint * row.credit_hours;
            totalCredits += row.credit_hours;
          });

          const currentGPA = totalCredits > 0
            ? parseFloat((totalPoints / totalCredits).toFixed(2))
            : 0;

          res.json({
            student: userResults[0],
            grades: gradeResults,
            currentGPA,
          });
        }
      );
    }
  );
};

// Get admin overview stats
const getOverviewStats = (req, res) => {
  db.query(
    `SELECT
      COUNT(DISTINCT u.id) as total_students,
      COUNT(DISTINCT CASE WHEN p.risk_level = 'High' THEN u.id END) as high_risk,
      COUNT(DISTINCT CASE WHEN p.risk_level = 'Medium' THEN u.id END) as medium_risk,
      COUNT(DISTINCT CASE WHEN p.risk_level = 'Low' THEN u.id END) as low_risk,
      ROUND(AVG(p.predicted_gpa), 2) as avg_predicted_gpa
     FROM users u
     LEFT JOIN predictions p ON u.id = p.student_id
     WHERE u.role = 'student'`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(results[0]);
    }
  );
};


const bcrypt = require('bcryptjs');

const createStudent = (req, res) => {
  const { name, email, password } = req.body;

  // check if user exists
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (results.length > 0) {
        return res.status(400).json({ message: "Student already exists" });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')",
        [name, email, hashedPassword],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Error creating student" });

          res.json({ message: "Student created successfully" });
        }
      );
    }
  );
};

const updateStudent = (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  db.query(
    'UPDATE users SET name=?, email=? WHERE id=?',
    [name, email, id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error updating student' });
      res.json({ message: 'Student updated successfully' });
    }
  );
};

const deleteStudent = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM users WHERE id = ? AND role = 'student'",
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json({ message: 'Student deleted successfully' });
    }
  );
};

const getAllCourses = (req, res) => {
  db.query(
    `SELECT id, course_code, course_name, credit_hours FROM courses`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.json(results);
    }
  );
};


module.exports = {
  getAllStudents,
  getStudentDetails,
  getOverviewStats,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllCourses
};