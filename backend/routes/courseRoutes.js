const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  addCourse,
  getCourses,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

router.get('/', (req, res) => {
  res.json({ message: "Courses route working" });
});
// COURSES CRUD
router.post('/', verifyToken, addCourse);
router.get('/', verifyToken, getCourses);
router.put('/:id', verifyToken, updateCourse);
router.delete('/:id', verifyToken, deleteCourse);

module.exports = router;