const db = require('../config/db');

// ADD COURSE
const addCourse = (req, res) => {
  const { course_code, course_name, credit_hours } = req.body;

  db.query(
    'INSERT INTO courses (course_code, course_name, credit_hours) VALUES (?, ?, ?)',
    [course_code, course_name, credit_hours],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error adding course' });
      res.json({ message: 'Course added successfully' });
    }
  );
};

// GET COURSES
const getCourses = (req, res) => {
  db.query('SELECT * FROM courses', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching courses' });
    res.json(results);
  });
};

// UPDATE COURSE
const updateCourse = (req, res) => {
  const { id } = req.params;
  const { course_code, course_name, credit_hours } = req.body;

  db.query(
    'UPDATE courses SET course_code=?, course_name=?, credit_hours=? WHERE id=?',
    [course_code, course_name, credit_hours, id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error updating course' });
      res.json({ message: 'Course updated successfully' });
    }
  );
};

// DELETE COURSE
const deleteCourse = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM courses WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting course' });
    res.json({ message: 'Course deleted successfully' });
  });
};

module.exports = {
  addCourse,
  getCourses,
  updateCourse,
  deleteCourse
};