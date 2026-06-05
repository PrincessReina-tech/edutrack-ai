import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Grades() {
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [formData, setFormData] = useState({
    course_id: '',
    score: '',
    semester: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = { authorization: `Bearer ${token}` };
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [coursesRes, gradesRes] = await Promise.all([
        axios.get('https://edutrack-ai-production-502d.up.railway.app/api/grades/courses', { headers }),
        axios.get('https://edutrack-ai-production-502d.up.railway.app/api/grades/my-grades', { headers }),
      ]);
      setCourses(coursesRes.data);
      setGrades(gradesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'https://edutrack-ai-production-502d.up.railway.app/api/grades/add',
        formData,
        { headers }
      );
      setIsError(false);
      setMessage(res.data.message);
      setFormData({ course_id: '', score: '', semester: '' });
      fetchAll();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Error adding grade');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://edutrack-ai-production-502d.up.railway.app/api/grades/delete/${id}`,
        { headers }
      );
      setIsError(false);
      setMessage('Grade deleted successfully');
      fetchAll();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setIsError(true);
      setMessage('Error deleting grade');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const semesters = [
    'Semester 1', 'Semester 2', 
  ];

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <p style={styles.loadingText}>Loading grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <div style={{
        ...styles.navbar,
        padding: isMobile ? '12px 16px' : '16px 32px',
      }}>
        <h1 style={styles.brandName}>
          EduTrack<span style={styles.dot}>.</span>
        </h1>
        <div style={{
          ...styles.navLinks,
          gap: isMobile ? '12px' : '24px',
        }}>
          <span style={styles.navLink}
            onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span style={{ ...styles.navLink, ...styles.navLinkActive }}
            onClick={() => navigate('/grades')}>Grades</span>
          <span style={styles.navLink}
            onClick={() => navigate('/prediction')}>Prediction</span>
        </div>
        <div style={styles.navRight}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {!isMobile && (
            <span style={styles.userName}>{user?.name}</span>
          )}
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{
        ...styles.content,
        padding: isMobile ? '16px' : '32px',
      }}>

        {/* WELCOME ROW */}
        <div style={styles.welcomeRow}>
          <div>
            <h2 style={styles.welcomeTitle}>My Grades 📝</h2>
            <p style={styles.welcomeSub}>Add and manage your course grades</p>
          </div>
          
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={isError ? styles.errorMsg : styles.successMsg}>
            {message}
          </div>
        )}

        {/* MAIN GRID */}
        <div style={{
          ...styles.mainGrid,
          flexDirection: isMobile ? 'column' : 'row',
        }}>

          {/* ADD GRADE FORM */}
          <div style={{
            ...styles.formCard,
            width: isMobile ? '100%' : '320px',
          }}>
            <h3 style={styles.cardTitle}>Add New Grade</h3>
            <span style={styles.cardSub}>Enter your course score below</span>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Course</label>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course_code} — {c.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Score (%)</label>
                <input
                  type="number"
                  name="score"
                  value={formData.score}
                  onChange={handleChange}
                  placeholder="Enter score (0 - 100)"
                  min="0"
                  max="100"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Semester</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select semester</option>
                  {semesters.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button style={styles.submitBtn} type="submit">
                + Add Grade
              </button>
            </form>

            {/* GRADE SCALE */}
            <div style={styles.gradeScale}>
              <p style={styles.gradeScaleTitle}>Grade Scale</p>
              {[
                { range: '80 - 100', grade: 'A', color: '#3B6D11' },
                { range: '70 - 79', grade: 'B+', color: '#3B6D11' },
                { range: '60 - 69', grade: 'B', color: '#3B6D11' },
                { range: '55 - 59', grade: 'C+', color: '#854F0B' },
                { range: '50 - 54', grade: 'C', color: '#854F0B' },
                { range: '45 - 49', grade: 'D', color: '#A32D2D' },
                { range: '40 - 44', grade: 'D+', color: '#A32D2D' },
                { range: 'Below 40', grade: 'F', color: '#A32D2D' },
              ].map((g) => (
                <div key={g.grade} style={styles.gradeScaleRow}>
                  <span style={styles.gradeScaleRange}>{g.range}</span>
                  <span style={{
                    ...styles.gradeBadge,
                    color: g.color,
                    backgroundColor: g.color === '#3B6D11'
                      ? '#EAF3DE' : g.color === '#854F0B'
                      ? '#FAEEDA' : '#FCEBEB',
                  }}>
                    {g.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GRADES TABLE */}
          <div style={{
            ...styles.tableCard,
            width: isMobile ? '100%' : 'auto',
          }}>
            <div style={styles.tableHeader2}>
              <h3 style={styles.cardTitle}>My Grades</h3>
              <span style={styles.cardSub}>
                {grades.length} grade{grades.length !== 1 ? 's' : ''} recorded
              </span>
            </div>

            {grades.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyIcon}>📚</p>
                <p style={styles.emptyTitle}>No grades yet</p>
                <p style={styles.emptySub}>Add your first grade using the form</p>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                {/* TABLE HEADER */}
                <div style={{
                  ...styles.tableHeader,
                  gridTemplateColumns: isMobile
                    ? '2fr 0.8fr 0.6fr 0.5fr'
                    : '2fr 0.8fr 0.6fr 1fr 0.5fr',
                }}>
                  <span>Course</span>
                  <span>Score</span>
                  <span>Grade</span>
                  {!isMobile && <span>Semester</span>}
                  <span>Del</span>
                </div>

                {/* TABLE ROWS */}
                {grades.map((g) => (
                  <div key={g.id}>
                    <div style={{
                      ...styles.tableRow,
                      gridTemplateColumns: isMobile
                        ? '2fr 0.8fr 0.6fr 0.5fr'
                        : '2fr 0.8fr 0.6fr 1fr 0.5fr',
                    }}>
                      <div>
                        <div style={styles.courseName}>{g.course_name}</div>
                        <div style={styles.courseCode}>{g.course_code}</div>
                      </div>
                      <span style={styles.score}>{g.score}%</span>
                      <span>
                        <div style={{
                          ...styles.gradeBadge,
                          backgroundColor: g.score >= 70
                            ? '#EAF3DE' : g.score >= 50
                            ? '#FAEEDA' : '#FCEBEB',
                          color: g.score >= 70
                            ? '#3B6D11' : g.score >= 50
                            ? '#854F0B' : '#A32D2D',
                        }}>
                          {g.grade}
                        </div>
                      </span>
                      {!isMobile && (
                        <span style={styles.semester}>{g.semester}</span>
                      )}
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(g.id)}
                      >
                        🗑️
                      </button>
                    </div>
                    {/* SHOW SEMESTER BELOW ROW ON MOBILE */}
                    {isMobile && (
                      <div style={styles.mobileRow}>
                        <span style={styles.mobileSemester}>{g.semester}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
  },
  navLink: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
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
    maxWidth: '1100px',
    margin: '0 auto',
  },
  welcomeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
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
  backBtn: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '50px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    cursor: 'pointer',
  },
  successMsg: {
    backgroundColor: 'rgba(59,109,17,0.2)',
    color: '#6FCF3D',
    padding: '12px 20px',
    borderRadius: '50px',
    fontSize: '13px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid rgba(59,109,17,0.3)',
  },
  errorMsg: {
    backgroundColor: 'rgba(163,45,45,0.2)',
    color: '#FF6B6B',
    padding: '12px 20px',
    borderRadius: '50px',
    fontSize: '13px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid rgba(163,45,45,0.3)',
  },
  mainGrid: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
  },
  formCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  tableCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
    flex: 1,
    boxSizing: 'border-box',
    overflowX: 'auto',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 4px',
  },
  cardSub: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '20px',
    display: 'block',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldGroup: {
    marginBottom: '14px',
  },
  fieldLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    display: 'block',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '11px 16px',
    fontSize: '13px',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: '50px',
    outline: 'none',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '11px 16px',
    fontSize: '13px',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: '50px',
    outline: 'none',
    background: '#1a1a2e',
    color: '#fff',
    boxSizing: 'border-box',
    cursor: 'pointer',
    appearance: 'none',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(90deg, #185FA5, #0F9B8E)',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  gradeScale: {
    marginTop: '24px',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  gradeScaleTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '10px',
  },
  gradeScaleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  gradeScaleRange: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  gradeBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: '700',
  },
  tableHeader2: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  tableHeader: {
    display: 'grid',
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
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '2px',
  },
  score: {
    fontSize: '13px',
    color: '#fff',
    fontWeight: '600',
  },
  semester: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  deleteBtn: {
    background: 'rgba(163,45,45,0.2)',
    border: '1px solid rgba(163,45,45,0.3)',
    borderRadius: '8px',
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  mobileRow: {
    padding: '4px 14px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  mobileSemester: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
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
};

export default Grades;