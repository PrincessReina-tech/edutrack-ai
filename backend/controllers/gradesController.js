const db = require('../config/db');

// Helper function
const calculateGrade = (score) => {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 55) return 'C+';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D+';
  if (score >= 40) return 'D';
  return 'F';
};

// Get all courses
const getCourses = (req, res) => {
  db.query('SELECT * FROM courses', (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
};

// Add a grade
const addGrade = (req, res) => {
  const { course_id, score, semester } = req.body;
  const student_id = req.user.id;

  const grade = calculateGrade(Number(score));

  db.query(
    'SELECT * FROM grades WHERE student_id = ? AND course_id = ? AND semester = ?',
    [student_id, course_id, semester],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      if (results.length > 0) {
        return res.status(400).json({
          message: 'Grade already exists for this course and semester ❌',
        });
      }

      db.query(
        'INSERT INTO grades (student_id, course_id, score, grade, semester) VALUES (?, ?, ?, ?, ?)',
        [student_id, course_id, score, grade, semester],
        (err) => {
          if (err) {
            return res.status(500).json({ message: 'Error adding grade' });
          }

          res.status(201).json({
            message: 'Grade added successfully ✅',
            grade,
          });
        }
      );
    }
  );
};

// Get grades for logged in student
const getMyGrades = (req, res) => {
  const student_id = req.user.id;

  db.query(
    `SELECT g.id,
            c.course_code,
            c.course_name,
            c.credit_hours,
            g.score,
            g.grade,
            g.semester
     FROM grades g
     JOIN courses c ON g.course_id = c.id
     WHERE g.student_id = ?
     ORDER BY g.semester, c.course_code`,
    [student_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      // Always recalculate grade from score
      const updatedResults = results.map((row) => ({
        ...row,
        grade: calculateGrade(Number(row.score)),
      }));

      res.json(updatedResults);
    }
  );
};

// Get GPA for logged in student
const getMyGPA = (req, res) => {
  const student_id = req.user.id;

  db.query(
    `SELECT g.score, c.credit_hours
     FROM grades g
     JOIN courses c ON g.course_id = c.id
     WHERE g.student_id = ?`,
    [student_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length === 0) {
        return res.json({ gpa: 0, totalCourses: 0 });
      }

      let totalPoints = 0;
      let totalCredits = 0;

      results.forEach((row) => {
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

      const gpa = (totalPoints / totalCredits).toFixed(2);

      res.json({
        gpa,
        totalCourses: results.length,
      });
    }
  );
};

// Delete a grade
const deleteGrade = (req, res) => {
  const student_id = req.user.id;
  const { id } = req.params;

  db.query(
    'DELETE FROM grades WHERE id = ? AND student_id = ?',
    [id, student_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          message: 'Grade not found ❌',
        });
      }

      res.json({
        message: 'Grade deleted successfully ✅',
      });
    }
  );
};

module.exports = {
  getCourses,
  addGrade,
  getMyGrades,
  getMyGPA,
  deleteGrade,
};