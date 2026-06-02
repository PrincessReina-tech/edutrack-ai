const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

const {
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

router.put('/students/:id', verifyToken, updateStudent);
router.delete('/students/:id', verifyToken, deleteStudent);

module.exports = router;