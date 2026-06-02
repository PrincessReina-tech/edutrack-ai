const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  getAllStudents,
  getStudentDetails,
  getOverviewStats,
  createStudent,
  updateStudent,
  deleteStudent,
  addCourse,
  getAllCourses,
  deleteCourse,
} = require('../controllers/adminController');

// All routes protected — admin only
router.get('/students', verifyToken, getAllStudents);
router.get('/students/:id', verifyToken, getStudentDetails);
router.get('/overview', verifyToken, getOverviewStats);
router.post('/students', verifyToken, createStudent);
router.put('/students/:id', verifyToken, updateStudent);
router.delete('/students/:id', verifyToken, deleteStudent);
//router.post('/courses', verifyToken, addCourse);
router.get('/courses', verifyToken, getAllCourses);
//router.delete('/courses/:id', verifyToken, deleteCourse);*/

module.exports = router;