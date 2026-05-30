import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';

// Calculate GPA per semester from grades
const getSemesterGPA = (grades) => {
  const semesterMap = {};

  grades.forEach((g) => {
    if (!semesterMap[g.semester]) {
      semesterMap[g.semester] = { totalPoints: 0, totalCredits: 0 };
    }

    let gradePoint;
    if (g.score >= 90) gradePoint = 4.0;
    else if (g.score >= 80) gradePoint = 3.7;
    else if (g.score >= 75) gradePoint = 3.3;
    else if (g.score >= 70) gradePoint = 3.0;
    else if (g.score >= 65) gradePoint = 2.7;
    else if (g.score >= 60) gradePoint = 2.3;
    else if (g.score >= 55) gradePoint = 2.0;
    else if (g.score >= 50) gradePoint = 1.0;
    else gradePoint = 0.0;

    semesterMap[g.semester].totalPoints += gradePoint * g.credit_hours;
    semesterMap[g.semester].totalCredits += g.credit_hours;
  });

  return Object.keys(semesterMap).map((semester) => ({
    semester,
    gpa: (semesterMap[semester].totalPoints / semesterMap[semester].totalCredits).toFixed(2),
  }));
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [gpaData, setGpaData] = useState({ gpa: 0, totalCourses: 0 });
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);

    const fetchData = async () => {
      try {
        const headers = { authorization: `Bearer ${token}` };
        const [gpaRes, gradesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/grades/my-gpa', { headers }),
          axios.get('http://localhost:5000/api/grades/my-grades', { headers }),
        ]);
        setGpaData(gpaRes.data);
        setGrades(gradesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRiskLevel = (gpa) => {
    if (gpa >= 3.0) return { label: 'Low Risk', color: '#3B6D11', bg: '#EAF3DE' };
    if (gpa >= 2.0) return { label: 'Medium Risk', color: '#854F0B', bg: '#FAEEDA' };
    return { label: 'High Risk', color: '#A32D2D', bg: '#FCEBEB' };
  };

  const risk = getRiskLevel(parseFloat(gpaData.gpa));
  const isMobile = window.innerWidth <= 768;

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <p style={styles.loadingText}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <div style={styles.navbar}>
        <h1 style={styles.brandName}>
          EduTrack<span style={styles.dot}>.</span>
        </h1>
        <div style={styles.navLinks}>
          <span style={{ ...styles.navLink, ...styles.navLinkActive }}
            onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span style={styles.navLink}
            onClick={() => navigate('/grades')}>Grades</span>
          <span style={styles.navLink}
            onClick={() => navigate('/prediction')}>Prediction</span>
        </div>
        <div style={styles.navRight}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={styles.userName}>{user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.content}>

        {/* WELCOME */}
        <div style={styles.welcomeRow}>
          <div>
            <h2 style={styles.welcomeTitle}>
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h2>
            <p style={styles.welcomeSub}>
              Here's your academic performance overview
            </p>
          </div>
          <button
            style={styles.addGradeBtn}
            onClick={() => navigate('/grades')}
          >
            + Add Grades
          </button>
        </div>

        {/* METRIC CARDS */}
        <div style={{
          ...styles.metricsGrid,
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
        }}>
          <div style={styles.metricCard}>
            <p style={styles.metricLabel}>Current GPA</p>
            <p style={styles.metricValue}>{gpaData.gpa}</p>
            <p style={styles.metricSub}>Out of 4.0</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricLabel}>Total Courses</p>
            <p style={styles.metricValue}>{gpaData.totalCourses}</p>
            <p style={styles.metricSub}>Graded so far</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricLabel}>Risk Level</p>
            <div style={{
              ...styles.riskBadge,
              color: risk.color,
              backgroundColor: risk.bg,
            }}>
              {risk.label}
            </div>
            <p style={styles.metricSub}>Based on GPA</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricLabel}>Predicted GPA</p>
            <p style={styles.metricValue}>
              {gpaData.gpa > 0
                ? (parseFloat(gpaData.gpa) + 0.1).toFixed(2)
                : 'N/A'}
            </p>
            <p style={styles.metricSub}>AI estimate</p>
          </div>
        </div>

        {/* GRADES TABLE */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>My Grades</h3>
            <span style={styles.cardSub}>
              {grades.length} course{grades.length !== 1 ? 's' : ''} recorded
            </span>
          </div>
          {grades.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>📚</p>
              <p style={styles.emptyTitle}>No grades yet</p>
              <p style={styles.emptySub}>
                Click "Add Grades" to record your first grade
              </p>
              <button
                style={styles.addGradeBtn}
                onClick={() => navigate('/grades')}
              >
                + Add Grades
              </button>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <div style={styles.tableHeader}>
                <span>Course</span>
                <span>Code</span>
                <span>Score</span>
                <span>Grade</span>
                <span>Semester</span>
                <span>Credits</span>
              </div>
              {grades.map((g) => (
                <div key={g.id} style={styles.tableRow}>
                  <span style={styles.courseName}>{g.course_name}</span>
                  <span style={styles.courseCode}>{g.course_code}</span>
                  <span style={styles.score}>{g.score}%</span>
                  <span>
                    <div style={{
                      ...styles.gradeBadge,
                      backgroundColor: g.score >= 70 ? '#EAF3DE' : g.score >= 50 ? '#FAEEDA' : '#FCEBEB',
                      color: g.score >= 70 ? '#3B6D11' : g.score >= 50 ? '#854F0B' : '#A32D2D',
                    }}>
                      {g.grade}
                    </div>
                  </span>
                  <span style={styles.semester}>{g.semester}</span>
                  <span style={styles.credits}>{g.credit_hours} cr</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHARTS — SIDE BY SIDE */}
        <div style={styles.chartsContainer}>

          {/* BAR CHART */}
          <div style={{ ...styles.card, flex: 1, minWidth: 0 }}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Score per Course</h3>
              <span style={styles.cardSub}>Current grades</span>
            </div>
            {grades.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyIcon}>📊</p>
                <p style={styles.emptyTitle}>No data yet</p>
                <p style={styles.emptySub}>Add grades to see your chart</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={grades.map((g) => ({
                    name: g.course_code,
                    score: g.score,
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} angle={-30} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                    formatter={(value) => [`${value}%`, 'Score']}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#378ADD" />
                      <stop offset="100%" stopColor="#0F9B8E" />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="score" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* LINE CHART */}
          <div style={{ ...styles.card, flex: 1, minWidth: 0 }}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>GPA per Semester</h3>
              <span style={styles.cardSub}>Performance trend</span>
            </div>
            {grades.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyIcon}>📈</p>
                <p style={styles.emptyTitle}>No data yet</p>
                <p style={styles.emptySub}>Add grades to see your trend</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={getSemesterGPA(grades)}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="semester" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} angle={-30} textAnchor="end" />
                  <YAxis domain={[0, 4]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                    formatter={(value) => [value, 'GPA']}
                  />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                  <Line type="monotone" dataKey="gpa" stroke="#378ADD" strokeWidth={2.5} dot={{ fill: '#0F9B8E', strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0a0a1a',
    backgroundImage: `
      radial-gradient(ellipse at 80% 20%, rgba(15,155,142,0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 20% 80%, rgba(24,95,165,0.2) 0%, transparent 50%)
    `,
  },
  loadingPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a1a',
  },
  loadingCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '40px 60px',
  },
  loadingText: {
    color: '#fff',
    fontSize: '16px',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    background: 'rgba(10,10,26,0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    flexWrap: 'wrap',
    gap: '12px',
  },
  brandName: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  dot: {
    background: 'linear-gradient(90deg, #378ADD, #0F9B8E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    gap: '24px',
  },
  navLink: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  navLinkActive: {
    color: '#fff',
    fontWeight: '600',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #185FA5, #0F9B8E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
  },
  userName: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
  },
  logoutBtn: {
    padding: '6px 14px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '50px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '12px',
    cursor: 'pointer',
  },
  content: {
    padding: '32px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  welcomeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 4px',
  },
  welcomeSub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    margin: 0,
  },
  addGradeBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(90deg, #185FA5, #0F9B8E)',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  metricsGrid: {
    display: 'grid',
    gap: '16px',
    marginBottom: '24px',
  },
  metricCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '20px',
    backdropFilter: 'blur(10px)',
  },
  metricLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 4px',
  },
  metricSub: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.3)',
    margin: 0,
  },
  riskBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '99px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  cardSub: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 0.8fr 0.6fr 1fr 0.6fr',
    gap: '12px',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
    marginBottom: '8px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 0.8fr 0.6fr 1fr 0.6fr',
    gap: '12px',
    padding: '12px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  courseName: {
    fontSize: '13px',
    color: '#fff',
    fontWeight: '500',
  },
  courseCode: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  score: {
    fontSize: '13px',
    color: '#fff',
    fontWeight: '600',
  },
  gradeBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: '700',
  },
  semester: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  credits: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px',
  },
  emptySub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '20px',
  },
chartsContainer: {
    display: 'flex',
    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
    gap: '16px',
    marginTop: '24px',
    alignItems: 'stretch',
  },
};

export default Dashboard;