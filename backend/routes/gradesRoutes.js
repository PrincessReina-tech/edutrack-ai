const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  getCourses,
  addGrade,
  getMyGrades,
  getMyGPA,
  deleteGrade
} = require('../controllers/gradesController');

// All routes protected by verifyToken middleware
router.get('/courses', verifyToken, getCourses);
router.post('/add', verifyToken, addGrade);
router.get('/my-grades', verifyToken, getMyGrades);
router.get('/my-gpa', verifyToken, getMyGPA);
router.delete('/delete/:id', verifyToken, deleteGrade);

module.exports = router;