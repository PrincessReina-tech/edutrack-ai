import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://edutrack-ai-production-502d.up.railway.app/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setIsError(false);
setMessage('Login successful! Redirecting...');
const role = res.data.user.role;
setTimeout(() => {
  if (role === 'admin') {
    navigate('/admin');
  } else {
    navigate('/dashboard');
  }
}, 2000);
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* LEFT PANEL */}
        <div style={styles.leftPanel}>
          <div style={styles.overlay} />
          <div style={styles.leftContent}>
            <h1 style={styles.brandName}>EduTrack<span style={styles.dot}>.</span></h1>
            <div style={styles.heroArea}>
              <h2 style={styles.heroTitle}>
                Your grades.<br />Your future.<br />
                <span style={styles.heroGradient}>Predicted.</span>
              </h2>
              <p style={styles.heroSub}>
                Stay ahead of your academic performance with
                real-time tracking and AI-powered predictions.
              </p>
            </div>
            <div style={styles.statsGrid}>
              {[
                { num: '98%', lbl: 'Prediction accuracy' },
                { num: '500+', lbl: 'Students tracked' },
                { num: '3x', lbl: 'Faster feedback' },
                { num: '24/7', lbl: 'Always available' },
              ].map((s) => (
                <div key={s.lbl} style={styles.statCard}>
                  <div style={styles.statNum}>{s.num}</div>
                  <div style={styles.statLbl}>{s.lbl}</div>
                </div>
              ))}
            </div>
            <div style={styles.pillsRow}>
              {[
                { label: 'GPA Prediction', color: '#0F9B8E' },
                { label: 'Risk Detection', color: '#185FA5' },
                { label: 'Grade Tracking', color: '#EF9F27' },
              ].map((p) => (
                <div key={p.label} style={styles.pill}>
                  <div style={{ ...styles.pillDot, background: p.color }} />
                  {p.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.rightPanel}>
          <p style={styles.eyebrow}>Welcome back</p>
          <h2 style={styles.formHeading}>Sign in to EduTrack</h2>
          <p style={styles.formSub}>Enter your credentials to continue</p>

          {message && (
            <div style={isError ? styles.errorMsg : styles.successMsg}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FloatInput label="Email address" name="email" type="email"
              value={formData.email} onChange={handleChange} />
            <FloatInput label="Password" name="password" type="password"
              value={formData.password} onChange={handleChange} />

            <div style={styles.forgotRow}>
              <span style={styles.forgotLink}>Forgot password?</span>
            </div>

            <button style={styles.btnGrad} type="submit">Sign in →</button>
          </form>

          <div style={styles.orRow}>
            <div style={styles.orLine} />
            <span style={styles.orText}>or continue with</span>
            <div style={styles.orLine} />
          </div>

          <div style={styles.socialRow}>
            <button style={styles.socialBtn}>🌐 Google</button>
            <button style={styles.socialBtn}>🐙 GitHub</button>
          </div>

          <p style={styles.switchLink}>
            Don't have an account?{' '}
            <span style={styles.switchSpan} onClick={() => navigate('/register')}>
              Create one free
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}

// Floating Label Input Component
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
      radial-gradient(ellipse at 20% 20%, rgba(24,95,165,0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(15,155,142,0.35) 0%, transparent 50%),
      radial-gradient(ellipse at 60% 10%, rgba(55,138,221,0.2) 0%, transparent 40%)
    `,
    padding: '20px',
  },
container: {
    display: 'flex',
    width: '100%',
    maxWidth: '950px',
    minHeight: '580px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(24,95,165,0.15)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
 leftPanel: {
    flex: 1.1,
    position: 'relative',
    background: 'rgba(10,10,26,0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '44px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderRight: '1px solid rgba(255,255,255,0.05)',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: `
      radial-gradient(circle at 80% 10%, rgba(24,95,165,0.5) 0%, transparent 50%),
      radial-gradient(circle at 10% 90%, rgba(15,155,142,0.4) 0%, transparent 50%)
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
  heroArea: {},
  heroTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    lineHeight: '1.3',
    marginBottom: '12px',
  },
  heroGradient: {
    background: 'linear-gradient(90deg, #378ADD, #0F9B8E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: '1.8',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '14px 16px',
  },
  statNum: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#fff',
  },
  statLbl: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '2px',
  },
  pillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  pill: {
    padding: '6px 14px',
    borderRadius: '99px',
    border: '0.5px solid rgba(255,255,255,0.15)',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.55)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  pillDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
rightPanel: {
    flex: 1,
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '44px 40px',
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
    marginBottom: '28px',
  },
  forgotRow: {
    textAlign: 'right',
    marginBottom: '16px',
    marginTop: '-8px',
  },
  forgotLink: {
    fontSize: '12px',
    color: '#185FA5',
    fontWeight: '500',
    cursor: 'pointer',
  },
  btnGrad: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(90deg, #185FA5, #0F9B8E)',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },
  orRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '18px 0',
  },
  orLine: {
    flex: 1,
    height: '1px',
    background: '#ebebeb',
  },
  orText: {
    fontSize: '11px',
    color: '#ccc',
  },
  socialRow: {
    display: 'flex',
    gap: '10px',
  },
  socialBtn: {
    flex: 1,
    padding: '10px',
    border: '1.5px solid #ebebeb',
    borderRadius: '50px',
    background: '#fff',
    fontSize: '12px',
    color: '#555',
    cursor: 'pointer',
    fontWeight: '500',
  },
  switchLink: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#999',
    marginTop: '18px',
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

export default Login;