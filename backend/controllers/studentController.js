const db = require('../config/db');

// UPDATE STUDENT
const updateStudent = (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  db.query(
    'UPDATE users SET name=?, email=? WHERE id=? AND role="student"',
    [name, email, id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error updating student' });
      res.json({ message: 'Student updated successfully' });
    }
  );
};

// DELETE STUDENT
const deleteStudent = (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM users WHERE id=? AND role="student"',
    [id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error deleting student' });
      res.json({ message: 'Student deleted successfully' });
    }
  );
};

module.exports = { updateStudent, deleteStudent };