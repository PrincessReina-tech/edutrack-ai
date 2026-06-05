import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseManagement from './CourseManagement';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  const navigate = useNavigate();
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseLoading, setCourseLoading] = useState(false);

const [newStudent, setNewStudent] = useState({
  name: '',
  email: '',
  password: '',
});
const [showCourses, setShowCourses] = useState(false);
const [showEditStudent, setShowEditStudent] = useState(false);
const [editStudent, setEditStudent] = useState({ id: null, name: '', email: '' });
const [showEditModal, setShowEditModal] = useState(false);


  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = { authorization: `Bearer ${token}` };
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/students', { headers }),
        axios.get('http://localhost:5000/api/admin/overview', { headers }),
      ]);
      setStudents(studentsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
  try {
    setCourseLoading(true);

    const res = await axios.get(
      'http://localhost:5000/api/admin/courses',
      { headers }
    );

    setCourses(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error(err);
    setCourses([]); // prevents crash like .map is not a function
  } finally {
    setCourseLoading(false);
  }
};

  const fetchStudentDetails = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/students/${id}`,
        { headers }
      );
      setSelectedStudent(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (student) => {
  setEditStudent({
    id: student.id,
    name: student.name,
    email: student.email,
  });

  setShowEditModal(true);
};

  const handleAddStudent = async () => {
  try {
    await axios.post(
      'http://localhost:5000/api/admin/students',
      newStudent,
      { headers }
    );

    setShowAddStudent(false);
    setNewStudent({ name: '', email: '', password: '' });
    fetchData();
    // SUCCESS MESSAGE
    toast.success('Student Added successfully');
  } catch (err) {
    console.error(err);
    toast.error('Failed to add student');
  }
};

  const deleteStudent = async (id) => {
  const confirmDelete = window.confirm(
    'Are you sure you want to delete this student?'
  );

  if (!confirmDelete) return;

  try {
    await axios.delete(
      `http://localhost:5000/api/admin/students/${id}`,
      { headers }
    );

    fetchData();
    // SUCCESS MESSAGE
    toast.success('Student deleted successfully ');
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete student');
  }
};

const updateStudent = async () => {
  try {
    await axios.put(
      `http://localhost:5000/api/admin/students/${editStudent.id}`,
      {
        name: editStudent.name,
        email: editStudent.email,
      },
      { headers }
    );

    setShowEditModal(false);
    fetchData();

    // SUCCESS MESSAGE
    toast.success('Student updated successfully ');
  } catch (err) {
    console.error(err);
    toast.error('Failed to update student');
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRiskColor = (risk) => {
    if (risk === 'Low') return '#3B6D11';
    if (risk === 'Medium') return '#854F0B';
    if (risk === 'High') return '#A32D2D';
    return '#888';
  };

  const getRiskBg = (risk) => {
    if (risk === 'Low') return '#EAF3DE';
    if (risk === 'Medium') return '#FAEEDA';
    if (risk === 'High') return '#FCEBEB';
    return 'rgba(255,255,255,0.1)';
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'All' || s.risk_level === filterRisk;
    return matchesSearch && matchesRisk;
  });

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <p style={styles.loadingIcon}>🛡️</p>
          <p style={styles.loadingText}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

<ToastContainer
  position="top-right"
  autoClose={2500}
  hideProgressBar
  newestOnTop
  closeOnClick
  pauseOnHover
  draggable
  theme="dark"
/>

      {/* NAVBAR */}
      <div style={{
        ...styles.navbar,
        padding: isMobile ? '12px 16px' : '16px 32px',
      }}>
        <h1 style={styles.brandName}>
          EduTrack<span style={styles.dot}>.</span>
        </h1>
        <div style={styles.navCenter}>
          <span style={styles.adminBadge}>🛡️ Admin Panel</span>
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

        {/* WELCOME */}
        <div style={styles.welcomeRow}>
          <div>
            <h2 style={styles.welcomeTitle}>Admin Dashboard 🛡️</h2>
            <p style={styles.welcomeSub}>
              Monitor and manage all student performance
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
     <button style={styles.refreshBtn} onClick={fetchData}>
    🔄 Refresh
    </button>

    <button
    style={styles.addBtn}
    onClick={() => setShowAddStudent(true)}
    >
    ➕ Add Student
    </button>

   <button
  style={styles.addBtn}
  onClick={() => {
    setShowCourses(true)
  }}
>
  📚 Manage Courses
</button>
    </div>
        </div>

        {/* OVERVIEW STATS */}
        {stats && (
          <div style={{
            ...styles.statsGrid,
            gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr 1fr',
          }}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Total Students</p>
              <p style={styles.statValue}>{stats.total_students || 0}</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Avg Predicted GPA</p>
              <p style={styles.statValue}>{stats.avg_predicted_gpa || 'N/A'}</p>
            </div>
            <div style={{ ...styles.statCard, borderColor: 'rgba(59,109,17,0.3)' }}>
              <p style={styles.statLabel}>Low Risk</p>
              <p style={{ ...styles.statValue, color: '#3B6D11' }}>
                {stats.low_risk || 0}
              </p>
            </div>
            <div style={{ ...styles.statCard, borderColor: 'rgba(133,79,11,0.3)' }}>
              <p style={styles.statLabel}>Medium Risk</p>
              <p style={{ ...styles.statValue, color: '#854F0B' }}>
                {stats.medium_risk || 0}
              </p>
            </div>
            <div style={{ ...styles.statCard, borderColor: 'rgba(163,45,45,0.3)' }}>
              <p style={styles.statLabel}>High Risk</p>
              <p style={{ ...styles.statValue, color: '#A32D2D' }}>
                {stats.high_risk || 0}
              </p>
            </div>
          </div>
        )}

        <div style={styles.managementCard}>
    <h3 style={styles.cardTitle}>Course Management</h3>

    <p style={styles.managementText}>
    Add, edit and remove courses offered in the system.
    </p>

    <button
    style={styles.addBtn}
    onClick={() => {
  setShowCourses(true)
}}
    >
    📚 Open Course Manager
   </button>
   </div>

        {/* MAIN GRID */}
        <div style={{
          ...styles.mainGrid,
          flexDirection: isMobile ? 'column' : 'row',
        }}>

          {/* STUDENTS TABLE */}
          <div style={styles.tableCard}>
            <div style={styles.tableCardHeader}>
              <h3 style={styles.cardTitle}>All Students</h3>
              <span style={styles.cardSub}>
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* SEARCH AND FILTER */}
            <div style={{
              ...styles.searchRow,
              flexDirection: isMobile ? 'column' : 'row',
            }}>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="All">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>

            {/* TABLE */}
            {filteredStudents.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyIcon}>👥</p>
                <p style={styles.emptyTitle}>No students found</p>
                <p style={styles.emptySub}>
                  No students match your search criteria
                </p>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <div style={{
                  ...styles.tableHeader,
                  gridTemplateColumns: isMobile
                    ? '2fr 1fr 0.8fr'
                    : '2fr 1fr 0.8fr 0.8fr 0.6fr',
                }}>
                  <span>Student</span>
                  <span>GPA</span>
                  <span>Risk</span>
                  {!isMobile && <span>Courses</span>}
                  {!isMobile && <span>Action</span>}
                </div>
                {filteredStudents.map((s) => (
                  <div key={s.id}>
                    <div style={{
                      ...styles.tableRow,
                      gridTemplateColumns: isMobile
                        ? '2fr 1fr 0.8fr'
                        : '2fr 1fr 0.8fr 0.8fr 0.6fr',
                      backgroundColor: selectedStudent?.student?.id === s.id
                        ? 'rgba(24,95,165,0.1)'
                        : 'transparent',
                    }}>
                      <div>
                        <div style={styles.studentName}>{s.name}</div>
                        <div style={styles.studentEmail}>{s.email}</div>
                      </div>
                      <span style={styles.gpaValue}>
                        {s.predicted_gpa || 'N/A'}
                      </span>
                      <span>
                        {s.risk_level ? (
                          <div style={{
                            ...styles.riskBadge,
                            color: getRiskColor(s.risk_level),
                            backgroundColor: getRiskBg(s.risk_level),
                          }}>
                            {s.risk_level}
                          </div>
                        ) : (
                          <div style={{
                            ...styles.riskBadge,
                            color: '#888',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                          }}>
                            N/A
                          </div>
                        )}
                      </span>
                      {!isMobile && (
                        <span style={styles.coursesCount}>
                          {s.total_courses} courses
                        </span>
                      )}
                      {!isMobile && (
                        <div style={{ display: 'flex', gap: '6px' }}>
          <button
        style={styles.viewBtn}
       onClick={() => fetchStudentDetails(s.id)}
     >
    View
    </button>

     <button
  style={styles.editBtn}
  onClick={() => openEditModal(s)}
>
  Edit
</button>

     <button
    style={styles.deleteBtn}
    onClick={() => deleteStudent(s.id)}
    >
    Delete
    </button>
    </div>
                      )}
                    </div>
                    {isMobile && (
                      <div style={styles.mobileActionRow}>
                        <span style={styles.coursesCount}>
                          {s.total_courses} courses
                        </span>
                        <button
                          style={styles.viewBtn}
                          onClick={() => fetchStudentDetails(s.id)}
                        >
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STUDENT DETAILS PANEL */}
          {selectedStudent && (
            <div style={styles.detailsCard}>
              <div style={styles.detailsHeader}>
                <h3 style={styles.cardTitle}>Student Details</h3>
                <button
                  style={styles.closeBtn}
                  onClick={() => setSelectedStudent(null)}
                >
                  ✕
                </button>
              </div>

              {/* STUDENT INFO */}
              <div style={styles.studentInfo}>
                <div style={styles.studentAvatar}>
                  {selectedStudent.student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={styles.detailName}>
                    {selectedStudent.student.name}
                  </p>
                  <p style={styles.detailEmail}>
                    {selectedStudent.student.email}
                  </p>
                </div>
              </div>

              {/* GPA AND RISK */}
              <div style={styles.detailStats}>
                <div style={styles.detailStat}>
                  <p style={styles.detailStatLabel}>Current GPA</p>
                  <p style={styles.detailStatValue}>
                    {selectedStudent.currentGPA}
                  </p>
                </div>
                <div style={styles.detailStat}>
                  <p style={styles.detailStatLabel}>Predicted GPA</p>
                  <p style={styles.detailStatValue}>
                    {selectedStudent.student.predicted_gpa || 'N/A'}
                  </p>
                </div>
                <div style={styles.detailStat}>
                  <p style={styles.detailStatLabel}>Risk Level</p>
                  <div style={{
                    ...styles.riskBadge,
                    color: getRiskColor(selectedStudent.student.risk_level),
                    backgroundColor: getRiskBg(selectedStudent.student.risk_level),
                    display: 'inline-block',
                    marginTop: '4px',
                  }}>
                    {selectedStudent.student.risk_level || 'N/A'}
                  </div>
                </div>
              </div>

              {/* GRADES */}
              <div style={styles.detailGrades}>
                <p style={styles.detailGradesTitle}>Grades</p>
                {selectedStudent.grades.length === 0 ? (
                  <p style={styles.noGrades}>No grades recorded yet</p>
                ) : (
                  selectedStudent.grades.map((g) => (
                    <div key={g.id} style={styles.gradeRow}>
                      <div>
                        <div style={styles.gradeCourse}>{g.course_code}</div>
                        <div style={styles.gradeSemester}>{g.semester}</div>
                      </div>
                      <div style={styles.gradeRight}>
                        <span style={styles.gradeScore}>{g.score}%</span>
                        <div style={{
                          ...styles.gradeBadge,
                          color: g.score >= 70 ? '#3B6D11' : g.score >= 50 ? '#854F0B' : '#A32D2D',
                          backgroundColor: g.score >= 70 ? '#EAF3DE' : g.score >= 50 ? '#FAEEDA' : '#FCEBEB',
                        }}>
                          {g.grade}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 👇 ADD MODAL RIGHT HERE */}
    {showAddStudent && (
      <div style={styles.modalOverlay}>
        <div style={styles.modalCard}>

          <div style={styles.modalHeader}>
            <h3 style={styles.cardTitle}>Add Student</h3>
            <button
              style={styles.closeBtn}
              onClick={() => setShowAddStudent(false)}
            >
              ✕
            </button>
          </div>

          <input
            style={styles.searchInput}
            placeholder="Full Name"
            value={newStudent.name}
            onChange={(e) =>
              setNewStudent({ ...newStudent, name: e.target.value })
            }
          />

          <input
            style={styles.searchInput}
            placeholder="Email"
            value={newStudent.email}
            onChange={(e) =>
              setNewStudent({ ...newStudent, email: e.target.value })
            }
          />

          <input
            style={styles.searchInput}
            placeholder="Password"
            type="password"
            value={newStudent.password}
            onChange={(e) =>
              setNewStudent({ ...newStudent, password: e.target.value })
            }
          />

          <button style={styles.addBtn} onClick={handleAddStudent}>
            ➕ Create Student
          </button>

        </div>
      </div>
    )}

    {showCoursesModal && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalCard}>

      <div style={styles.modalHeader}>
        <h3 style={styles.cardTitle}>Course Management</h3>
        <button
          style={styles.closeBtn}
          onClick={() => setShowCoursesModal(false)}
        >
          ✕
        </button>
      </div>

      {courseLoading ? (
        <p style={{ color: '#fff' }}>Loading courses...</p>
      ) : (
        <div>
          {courses.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>
              No courses found
            </p>
          ) : (
            courses.map((c) => (
              <div key={c.id} style={styles.courseRow}>
                <div>
                  <div style={{ color: '#fff', fontSize: '13px' }}>
                    {c.course_code} - {c.course_name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                    {c.credit_hours} credits
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  </div>
)}

{showCourses && (
  <CourseManagement onClose={() => setShowCourses(false)} />
)}

{showEditModal && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalCard}>

      <div style={styles.modalHeader}>
        <h3 style={styles.cardTitle}>Edit Student</h3>
        <button
          style={styles.closeBtn}
          onClick={() => setShowEditModal(false)}
        >
          ✕
        </button>
      </div>

      <input
        style={styles.searchInput}
        value={editStudent.name}
        onChange={(e) =>
          setEditStudent({ ...editStudent, name: e.target.value })
        }
      />

      <input
        style={styles.searchInput}
        value={editStudent.email}
        onChange={(e) =>
          setEditStudent({ ...editStudent, email: e.target.value })
        }
      />

      <button style={styles.addBtn} onClick={updateStudent}>
        Save Changes
      </button>

    </div>
  </div>
)}
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
    textAlign: 'center',
  },
  loadingIcon: {
    fontSize: '40px',
    marginBottom: '12px',
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
  navCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  adminBadge: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '50px',
    padding: '6px 16px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
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
    maxWidth: '1200px',
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
  refreshBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(90deg, #185FA5, #0F9B8E)',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '20px',
    backdropFilter: 'blur(10px)',
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  mainGrid: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
  },
  tableCard: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
  },
  tableCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
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
  searchRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px',
  },
  searchInput: {
    flex: 1,
    padding: '10px 16px',
    fontSize: '13px',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: '50px',
    outline: 'none',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    boxSizing: 'border-box',
  },
  filterSelect: {
    padding: '10px 16px',
    fontSize: '13px',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: '50px',
    outline: 'none',
    background: '#1a1a2e',
    color: '#fff',
    cursor: 'pointer',
    appearance: 'none',
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
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  studentName: {
    fontSize: '13px',
    color: '#fff',
    fontWeight: '500',
  },
  studentEmail: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '2px',
  },
  gpaValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },
  riskBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: '600',
  },
  coursesCount: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  viewBtn: {
    padding: '5px 12px',
    background: 'rgba(24,95,165,0.3)',
    border: '1px solid rgba(24,95,165,0.4)',
    borderRadius: '50px',
    color: '#378ADD',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  mobileActionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 14px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  detailsCard: {
    width: '320px',
    flexShrink: 0,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
  },
  detailsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontSize: '12px',
  },
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    padding: '16px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '12px',
  },
  studentAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #185FA5, #0F9B8E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
  },
  detailName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 4px',
  },
  detailEmail: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    margin: 0,
  },
  detailStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
    marginBottom: '20px',
  },
  detailStat: {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '10px',
    padding: '12px',
    textAlign: 'center',
  },
  detailStatLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '6px',
  },
  detailStatValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  detailGrades: {
    marginTop: '4px',
  },
  detailGradesTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '12px',
  },
  noGrades: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    padding: '20px 0',
  },
  gradeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  gradeCourse: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#fff',
  },
  gradeSemester: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '2px',
  },
  gradeRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  gradeScore: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
  },
  gradeBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: '700',
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
  },
  addBtn: {
  padding: '10px 20px',
  background: 'linear-gradient(90deg,#0F9B8E,#185FA5)',
  color: '#fff',
  border: 'none',
  borderRadius: '50px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
},

editBtn: {
  padding: '5px 10px',
  background: 'rgba(15,155,142,0.15)',
  border: '1px solid rgba(15,155,142,0.3)',
  borderRadius: '50px',
  color: '#0F9B8E',
  cursor: 'pointer',
  fontSize: '11px',
},

deleteBtn: {
  padding: '5px 10px',
  background: 'rgba(163,45,45,0.15)',
  border: '1px solid rgba(163,45,45,0.3)',
  borderRadius: '50px',
  color: '#ff6b6b',
  cursor: 'pointer',
  fontSize: '11px',
},

managementCard: {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  backdropFilter: 'blur(10px)',
},

managementText: {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '13px',
  marginBottom: '16px',
},

modalOverlay: {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999,
},

modalCard: {
  width: '400px',
  maxHeight: '70vh',
  overflowY: 'auto',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '16px',
  padding: '20px',
  backdropFilter: 'blur(15px)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
},

modalHeader: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
},

courseRow: {
  padding: '10px',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
},

};


export default AdminDashboard;

