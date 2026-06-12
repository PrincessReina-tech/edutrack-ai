const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const gradesRoutes = require('./routes/gradesRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courseRoutes');
const studentAdminRoutes = require('./routes/studentAdminRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "https://edutrack-ai-lyart.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/courses', courseRoutes);
app.use('/api/admin', studentAdminRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'EduTrack AI Backend is running! ' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});