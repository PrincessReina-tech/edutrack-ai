import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [activeTab, setActiveTab] = useState('student');
  const [studentData, setStudentData] = useState({
    firstName: '', lastName: '', email: '', matricule: '', password: '',
  });
  const [adminData, setAdminData] = useState({
    firstName: '', lastName: '', email: '', staffId: '', department: '', password: '', accessCode: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleStudentChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const handleAdminChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = activeTab === 'student'
        ? {
            name: `${studentData.firstName} ${studentData.lastName}`,
            email: studentData.email,
            password: studentData.password,
            role: 'student',
          }
       : {
    name: `${adminData.firstName} ${adminData.lastName}`,
    email: adminData.email,
    password: adminData.password,
    role: 'admin',
    accessCode: adminData.accessCode,
  };

      const res = await axios.post('http://localhost:5000/api/auth/register', payload);
      setIsError(false);
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  const isStudent = activeTab === 'student';

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* LEFT PANEL */}
        <div style={styles.leftPanel}>
          <div style={styles.overlay} />
          <div style={styles.leftContent}>
            <h1 style={styles.brandName}>
              EduTrack<span style={styles.dot}>.</span>
            </h1>
            <div>
              <div style={styles.stepsLabel}>How it works</div>
              {[
                { icon: '📝', title: 'Create your account', desc: 'Register as a student or admin in seconds' },
                { icon: '📊', title: 'Enter your grades', desc: 'Add your course scores each semester' },
                { icon: '🤖', title: 'Get AI predictions', desc: 'Receive instant GPA forecasts and risk alerts' },
                { icon: '🚀', title: 'Improve and grow', desc: 'Take action before it is too late' },
              ].map((s) => (
                <div key={s.title} style={styles.step}>
                  <div style={styles.stepIcon}>{s.icon}</div>
                  <div>
                    <div style={styles.stepTitle}>{s.title}</div>
                    <div style={styles.stepDesc}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.testimonial}>
              <p style={styles.testimonialText}>
                "EduTrack helped me spot my weak areas early. My GPA went from 2.8 to 3.6 in just one semester!"
              </p>
              <div style={styles.tAuthor}>
                <div style={styles.avatar}>PR</div>
                <div>
                  <div style={styles.tName}>Princess Reina</div>
                  <div style={styles.tRole}>Final year, Computer Engineering</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.rightPanel}>
          <p style={styles.eyebrow}>Get started free</p>
          <h2 style={styles.formHeading}>Create your account</h2>
          <p style={styles.formSub}>Join hundreds of users already on EduTrack</p>

          {/* TABS */}
          <div style={styles.tabsWrapper}>
            <button
              style={{
                ...styles.tab,
                background: isStudent
                  ? 'linear-gradient(90deg, #185FA5, #378ADD)'
                  : 'transparent',
                color: isStudent ? '#fff' : '#999',
                boxShadow: isStudent
                  ? '0 4px 12px rgba(24,95,165,0.3)'
                  : 'none',
              }}
              onClick={() => { setActiveTab('student'); setMessage(''); }}
            >
              🎓 Student
            </button>
            <button
              style={{
                ...styles.tab,
                background: !isStudent
                  ? 'linear-gradient(90deg, #0F9B8E, #185FA5)'
                  : 'transparent',
                color: !isStudent ? '#fff' : '#999',
                boxShadow: !isStudent
                  ? '0 4px 12px rgba(15,155,142,0.3)'
                  : 'none',
              }}
              onClick={() => { setActiveTab('admin'); setMessage(''); }}
            >
              🛡️ Admin
            </button>
          </div>

          {message && (
            <div style={isError ? styles.errorMsg : styles.successMsg}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isStudent ? (
              <>
                <div style={styles.nameRow}>
                  <FloatInput label="First name" name="firstName" type="text"
                    value={studentData.firstName} onChange={handleStudentChange}
                    isStudent={true} />
                  <FloatInput label="Last name" name="lastName" type="text"
                    value={studentData.lastName} onChange={handleStudentChange}
                    isStudent={true} />
                </div>
                <FloatInput label="Email address" name="email" type="email"
                  value={studentData.email} onChange={handleStudentChange}
                  isStudent={true} />
                <FloatInput label="Matricule number" name="matricule" type="text"
                  value={studentData.matricule} onChange={handleStudentChange}
                  isStudent={true} />
                <FloatInput label="Password" name="password" type="password"
                  value={studentData.password} onChange={handleStudentChange}
                  isStudent={true} />
                <button style={styles.btnStudent} type="submit">
                  Create Student Account →
                </button>
              </>
            ) : (
              <>
                <div style={styles.nameRow}>
                  <FloatInput label="First name" name="firstName" type="text"
                    value={adminData.firstName} onChange={handleAdminChange}
                    isStudent={false} />
                  <FloatInput label="Last name" name="lastName" type="text"
                    value={adminData.lastName} onChange={handleAdminChange}
                    isStudent={false} />
                </div>
                <FloatInput label="Email address" name="email" type="email"
                  value={adminData.email} onChange={handleAdminChange}
                  isStudent={false} />
                <FloatInput label="Staff ID" name="staffId" type="text"
                  value={adminData.staffId} onChange={handleAdminChange}
                  isStudent={false} />
                <FloatInput label="Department" name="department" type="text"
                  value={adminData.department} onChange={handleAdminChange}
                  isStudent={false} />
                <FloatInput label="Password" name="password" type="password"
                  value={adminData.password} onChange={handleAdminChange}
                  isStudent={false} />
                <FloatInput label="Admin access code" name="accessCode" type="password"
                  value={adminData.accessCode} onChange={handleAdminChange}
                  isStudent={false} />
                <button style={styles.btnAdmin} type="submit">
                  Create Admin Account →
                </button>
              </>
            )}
          </form>

          <p style={styles.terms}>
            By registering you agree to our{' '}
            <span style={styles.termsLink}>Terms</span> and{' '}
            <span style={styles.termsLink}>Privacy Policy</span>
          </p>
          <p style={styles.switchLink}>
            Already have an account?{' '}
            <span style={styles.switchSpan} onClick={() => navigate('/login')}>
              Sign in here
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}

// Floating Label Input
function FloatInput({ label, name, type, value, onChange, isStudent }) {
  const [focused, setFocused] = useState(false);
  const isFloated = focused || value !== '';
  const activeColor = isStudent === false ? '#0F9B8E' : '#185FA5';

  // Calculate gap width based on label length
  const gapWidth = label.length * 7 + 16;

  return (
    <div style={inputStyles.group}>
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50px',
        pointerEvents: 'none',
        border: `1.5px solid ${focused ? activeColor : '#ddd'}`,
        transition: 'border-color 0.2s',
        WebkitMask: isFloated
          ? `linear-gradient(#fff 0 0) top left / 18px 100% no-repeat,
             linear-gradient(#fff 0 0) top right / calc(100% - 18px - ${gapWidth}px) 100% no-repeat,
             linear-gradient(#fff 0 0) bottom / 100% calc(100% - 1.5px) no-repeat`
          : 'none',
        mask: isFloated
          ? `linear-gradient(#fff 0 0) top left / 18px 100% no-repeat,
             linear-gradient(#fff 0 0) top right / calc(100% - 18px - ${gapWidth}px) 100% no-repeat,
             linear-gradient(#fff 0 0) bottom / 100% calc(100% - 1.5px) no-repeat`
          : 'none',
      }} />
      <input
        style={{
          ...inputStyles.input,
          border: 'none',
          outline: 'none',
        }}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
      />
      <label style={{
        ...inputStyles.label,
        top: isFloated ? '0px' : '50%',
        transform: 'translateY(-50%)',
        fontSize: isFloated ? '10px' : '13px',
        color: focused ? activeColor : '#aaa',
        fontWeight: isFloated ? '700' : '400',
        letterSpacing: isFloated ? '0.06em' : '0',
        textTransform: isFloated ? 'uppercase' : 'none',
        background: 'transparent',
      }}>
        {label}
      </label>
    </div>
  );
}

const inputStyles = {
  group: {
    position: 'relative',
    marginBottom: '16px',
    flex: 1,
  },
  input: {
    width: '100%',
    padding: '14px 20px',
    fontSize: '14px',
    border: '1.5px solid #ddd',
    borderRadius: '50px',
    outline: 'none',
    background: 'transparent',
    color: '#0a0a1a',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  label: {
    position: 'absolute',
    left: '20px',
    pointerEvents: 'none',
    transition: 'all 0.2s ease',
    background: 'transparent',
    padding: '0 6px',
    borderRadius: '2px',
  },
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a1a',
    backgroundImage: `
      radial-gradient(ellipse at 80% 20%, rgba(15,155,142,0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 20% 80%, rgba(24,95,165,0.35) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(55,138,221,0.15) 0%, transparent 40%)
    `,
    padding: '20px',
  },
  container: {
    display: 'flex',
    width: '100%',
    maxWidth: '950px',
    minHeight: '620px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(24,95,165,0.15)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  leftPanel: {
    flex: 1,
    position: 'relative',
    background: 'rgba(10,10,26,0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '44px 40px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: '1px solid rgba(255,255,255,0.05)',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: `
      radial-gradient(circle at 10% 10%, rgba(15,155,142,0.45) 0%, transparent 50%),
      radial-gradient(circle at 90% 90%, rgba(24,95,165,0.4) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
  leftContent: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    height: '100%',
    justifyContent: 'space-between',
  },
  brandName: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.5px',
    margin: 0,
  },
  dot: {
    background: 'linear-gradient(90deg, #378ADD, #0F9B8E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  stepsLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '18px',
  },
  step: {
    display: 'flex',
    gap: '14px',
    marginBottom: '18px',
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.08)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    flexShrink: 0,
  },
  stepTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '3px',
  },
  stepDesc: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    lineHeight: '1.6',
  },
  testimonial: {
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    padding: '18px 20px',
  },
  testimonialText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.7',
    fontStyle: 'italic',
    margin: 0,
  },
  tAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '12px',
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #185FA5, #0F9B8E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: '#fff',
    flexShrink: 0,
  },
  tName: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  tRole: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
  },
  rightPanel: {
    flex: 1.2,
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#0F9B8E',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  formHeading: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0a0a1a',
    marginBottom: '6px',
  },
  formSub: {
    fontSize: '13px',
    color: '#999',
    marginBottom: '16px',
  },
  tabsWrapper: {
    display: 'flex',
    background: '#f0f4f8',
    borderRadius: '50px',
    padding: '4px',
    marginBottom: '20px',
  },
  tab: {
    flex: 1,
    padding: '9px',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'center',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
  },
  nameRow: {
    display: 'flex',
    gap: '10px',
  },
  btnStudent: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(90deg, #185FA5, #378ADD)',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
  },
  btnAdmin: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(90deg, #0F9B8E, #185FA5)',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
  },
  terms: {
    fontSize: '11px',
    color: '#bbb',
    textAlign: 'center',
    marginTop: '12px',
  },
  termsLink: {
    color: '#0F9B8E',
    cursor: 'pointer',
  },
  switchLink: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#999',
    marginTop: '10px',
  },
  switchSpan: {
    color: '#185FA5',
    fontWeight: '600',
    cursor: 'pointer',
  },
  successMsg: {
    backgroundColor: '#EAF3DE',
    color: '#3B6D11',
    padding: '10px 14px',
    borderRadius: '50px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  errorMsg: {
    backgroundColor: '#FCEBEB',
    color: '#A32D2D',
    padding: '10px 14px',
    borderRadius: '50px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'center',
  },
};

export default Register;