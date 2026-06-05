const db = require('../config/db');
const axios = require('axios');

const getPrediction = (req, res) => {
  const student_id = req.user.id;

  // Get all grades for this student
  db.query(
    `SELECT g.score, c.credit_hours
     FROM grades g
     JOIN courses c ON g.course_id = c.id
     WHERE g.student_id = ?`,
    [student_id],
    async (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      if (results.length === 0) {
        return res.status(400).json({
          message: 'No grades found. Please add grades first '
        });
      }

      // Calculate average score
     // Calculate weighted GPA the same way as current GPA
const totalScore = results.reduce((sum, r) => sum + parseFloat(r.score), 0);
const avgScore = parseFloat((totalScore / results.length).toFixed(1));

// Calculate actual current GPA using credit hours
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

const currentGPA = parseFloat((totalPoints / totalCredits).toFixed(2));

// Calculate total credit hours
      const totalCreditHours = results.reduce((sum, r) => sum + parseInt(r.credit_hours), 0);

      // Calculate participation and resources based on grades entered
      const participation = parseFloat(Math.min((results.length / 6) * 100, 100).toFixed(1));
      const resources = parseFloat(Math.min((results.length / 6) * 90, 100).toFixed(1));
      const attendance = parseFloat(Math.min(75 + (results.length * 2), 100).toFixed(1));

      console.log('Sending to ML service:', {
        avg_score: avgScore,
        attendance,
        participation,
        resources,
        total_credit_hours: totalCreditHours,
      });

      try {
        // Call Flask ML service
        const mlResponse = await axios.post(
          'http://localhost:5001/predict',
          {
            avg_score: avgScore,
            current_gpa: currentGPA,
            attendance: attendance,
            participation: participation,
            resources: resources,
            total_credit_hours: totalCreditHours,
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
          }
        );

        const prediction = mlResponse.data;

        // Override risk level based on your school's actual GPA scale
const gpa = parseFloat(prediction.predicted_gpa);
let correctedRisk;
if (gpa >= 3.0) correctedRisk = 'Low';
else if (gpa >= 2.0) correctedRisk = 'Medium';
else correctedRisk = 'High';

// Override recommendation too
let correctedRecommendation;
if (correctedRisk === 'Low') {
  correctedRecommendation = 'You are performing excellently! Keep up the great work and maintain your study habits.';
} else if (correctedRisk === 'Medium') {
  correctedRecommendation = 'You are performing moderately. Consider improving your attendance and participation to boost your GPA.';
} else {
  correctedRecommendation = 'You are at high risk of poor performance. Please seek academic support and improve your study habits immediately.';
}

        // Save prediction to database
        db.query(
          `INSERT INTO predictions (student_id, predicted_gpa, risk_level)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE
           predicted_gpa = VALUES(predicted_gpa),
           risk_level = VALUES(risk_level),
           predicted_at = CURRENT_TIMESTAMP`,
          [student_id, prediction.predicted_gpa, correctedRisk],
          (err) => {
            if (err) console.log('Error saving prediction:', err);
          }
        );

       res.json({
          predicted_gpa: prediction.predicted_gpa,
          risk_level: correctedRisk,
          risk_probabilities: prediction.risk_probabilities,
          recommendation: correctedRecommendation,
          avg_score: avgScore,
          current_gpa: currentGPA,
          total_courses: results.length,
          attendance: attendance,
          participation: participation,
        });

      } catch (mlErr) {
        console.error('ML Service error:', mlErr.message, mlErr.code, mlErr.response?.data);
        return res.status(500).json({
          message: 'ML service unavailable. Make sure Flask is running '
        });
      }
    }
  );
};

module.exports = { getPrediction };