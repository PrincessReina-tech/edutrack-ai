import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function AnimatedCounter({ target, duration, suffix, startCounting }) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
  if (!startCounting) {
    setCount(0);
    return;
  }

  let start = 0;

  const increment = target / (duration / 16);

  const timer = setInterval(() => {
    start += increment;

    if (start >= target) {
      setCount(target);
      clearInterval(timer);
    } else {
      setCount(Math.floor(start));
    }
  }, 16);

  return () => clearInterval(timer);
}, [startCounting, target, duration]);

  return <span>{count}{suffix}</span>;
}

function Home() {
  const navigate = useNavigate();
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [featureVisible, setFeaturesVisible] = useState(false);
  const featuresRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      setStatsVisible(entry.isIntersecting);
    },
    { threshold: 0.3 }
  );

  if (statsRef.current) {
    observer.observe(statsRef.current);
  }

  return () => observer.disconnect();
}, []);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setFeaturesVisible(true);
      }
    },
    { threshold: 0.2 }
  );

  if (featuresRef.current) {
    observer.observe(featuresRef.current);
  }

  return () => observer.disconnect();
}, []);

  return (
    <div style={styles.page}>

      {/* BG ORBS */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <h1 style={styles.brand}>
          EduTrack<span style={styles.dot}>.</span>
        </h1>
        <div style={styles.navBtns}>
          <button className="glow-btn" style={styles.btnOutline} onClick={() => navigate('/login')}>
            Sign in
          </button>
          <button className="glow-btn" style={styles.btnPrimary} onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        ...styles.hero,
        padding: isMobile ? '50px 24px 40px' : '80px 40px 60px',
      }}>
        <div style={styles.heroBadge}>
          <div style={styles.badgeDot} />
          AI-Powered Academic Intelligence
        </div>

        <h2 style={{
          ...styles.heroTitle,
          fontSize: isMobile ? '34px' : '52px',
        }}>
          Track your grades.<br />
          Predict your{' '}
          <span style={styles.grad}>future.</span>
        </h2>

        <p style={styles.heroSub}>
          EduTrack AI uses machine learning to analyze your academic
          performance and predict your GPA before results are out.
          Stay ahead, act early.
        </p>

        <div style={styles.heroBtns}>
          <button className="glow-btn" style={styles.heroBtnPrimary} onClick={() => navigate('/register')}>
            Get Started Free →
          </button>
          <button className="glow-btn" style={styles.heroBtnOutline} onClick={() => navigate('/login')}>
            Sign in
          </button>
        </div>

        {/* STATS */}
        <div ref={statsRef} style={{
          ...styles.statsRow,
          gap: isMobile ? '24px' : '60px',
        }}>
         {[
  { target: 500, suffix: '+', label: 'Students tracked', animation: 'slideLeft' },
  { target: 98, suffix: '%', label: 'Prediction accuracy', animation: 'slideUp' },
  { target: 3, suffix: 'x', label: 'Faster feedback', animation: 'slideDown' },
  { target: 6, suffix: '', label: 'Courses monitored', animation: 'slideRight' },
].map((s) => (
  <div
  key={s.label}
  className={`${statsVisible ? s.animation : ''} stat-card`}
  style={styles.statItem}
>
              <div style={styles.statNum}>
                <AnimatedCounter
                  target={s.target}
                  duration={2000}
                  suffix={s.suffix}
                  startCounting={statsVisible}
                />
              </div>
              <div style={styles.statLbl}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section
        ref={featuresRef}  
        style={{
        ...styles.section,
        padding: isMobile ? '40px 24px' : '60px 60px',
      }}>
        <h3 style={styles.sectionTitle}>Everything you need</h3>
        <p style={styles.sectionSub}>
          Powerful tools to help you stay on top of your academics
        </p>
        <div style={{
          ...styles.featuresGrid,
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
        }}>
          {[
            { icon: '📊', color: 'rgba(24,95,165,0.25)', title: 'Real-time Grade Tracking', desc: 'Enter your scores after each assessment and watch your GPA update instantly across all courses.' },
            { icon: '🤖', color: 'rgba(15,155,142,0.25)', title: 'AI GPA Prediction', desc: 'Our machine learning model predicts your end-of-semester GPA based on your current performance.' },
            { icon: '⚠️', color: 'rgba(239,159,39,0.25)', title: 'Early Risk Detection', desc: 'Get alerted early if you are at risk of poor performance so you can take action before it is too late.' },
            { icon: '📈', color: 'rgba(24,95,165,0.25)', title: 'Performance Charts', desc: 'Visualize your academic progress with beautiful charts showing trends across semesters and courses.' },
            { icon: '🛡️', color: 'rgba(15,155,142,0.25)', title: 'Admin Dashboard', desc: 'Lecturers and admins can monitor all students, view predictions and identify at-risk students early.' },
            { icon: '💡', color: 'rgba(163,45,45,0.25)', title: 'Smart Recommendations', desc: 'Receive personalized AI recommendations on how to improve your academic performance each semester.' },
          ].map((f) => (
            <div
  key={f.title}
  className={`${featureVisible ? 'fadeUp' : ''} featureCardHover`}
  style={styles.featureCard}
>
              <div style={{ ...styles.featureIcon, background: f.color }}>
                {f.icon}
              </div>
              <div style={styles.featureTitle}>{f.title}</div>
              <div style={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{
        ...styles.section,
        padding: isMobile ? '40px 24px' : '60px 60px',
        textAlign: 'center',
      }}>
        <h3 style={styles.sectionTitle}>How it works</h3>
        <p style={styles.sectionSub}>Get started in minutes</p>
        <div style={{
          ...styles.stepsRow,
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          {[
            { num: '01', icon: '📝', title: 'Create your account', desc: 'Register as a student or admin in seconds' },
            { num: '02', icon: '📊', title: 'Enter your grades', desc: 'Add your course scores each semester' },
            { num: '03', icon: '🤖', title: 'Get AI predictions', desc: 'Receive instant GPA forecasts and risk alerts' },
            { num: '04', icon: '🚀', title: 'Improve and grow', desc: 'Take action before it is too late' },
          ].map((s, i) => (
            <div key={s.num} style={styles.stepWrapper}>
              <div style={styles.stepCard}>
                <div style={styles.stepNum}>{s.num}</div>
                <div style={styles.stepIcon}>{s.icon}</div>
                <div style={styles.stepTitle}>{s.title}</div>
                <div style={styles.stepDesc}>{s.desc}</div>
              </div>
              {i < 3 && !isMobile && (
                <div style={styles.stepArrow}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section style={{
        ...styles.section,
        padding: isMobile ? '40px 24px' : '40px 60px',
      }}>
        <div style={styles.testimonialCard}>
          <div style={styles.quoteIcon}>"</div>
          <p style={styles.testimonialText}>
            EduTrack AI helped me identify my weak areas early and
            improve my GPA from 2.8 to 3.6 in just one semester.
            The AI predictions were incredibly accurate!
          </p>
          <div style={styles.testimonialAuthor}>
            <div style={styles.testimonialAvatar}>PR</div>
            <div>
              <div style={styles.testimonialName}>Princess Reina</div>
              <div style={styles.testimonialRole}>
                Final year, Computer Engineering
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        ...styles.ctaSection,
        margin: isMobile ? '0 24px 60px' : '0 60px 60px',
        padding: isMobile ? '40px 24px' : '60px 40px',
      }}>
        <h3 style={{
          ...styles.ctaTitle,
          fontSize: isMobile ? '22px' : '30px',
        }}>
          Ready to take control of your academics? 🎓
        </h3>
        <p style={styles.ctaSub}>
          Join hundreds of students already using EduTrack AI to stay ahead
        </p>
        <button
          className="glow-btn"
          style={styles.heroBtnPrimary}
          onClick={() => navigate('/register')}
        >
          Create Free Account →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © 2025 EduTrack AI — Intelligent Academic Performance System
        </p>
      </footer>

    </div>
  );
}

const styles = {
 page: {
  minHeight: '100vh',
  width: '100%',
  maxWidth: '100vw',
  overflowX: 'hidden',
  position: 'relative',
  background:
    'linear-gradient(-45deg, #0a0a1a, #111b35, #0f2435, #0a0a1a)',
  backgroundSize: '400% 400%',
  animation: 'gradientMove 15s ease infinite',
},
  orb1: {
    position: 'absolute',
    top: '-150px',
    right: '-150px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(24,95,165,0.2) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    bottom: '100px',
    left: '-150px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(15,155,142,0.2) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    width: '100%',
    boxSizing: 'border-box',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(20px)',
    background: 'rgba(10,10,26,0.8)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  brand: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  dot: {
    background: 'linear-gradient(90deg, #378ADD, #0F9B8E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navBtns: {
    display: 'flex',
    gap: '12px',
  },
  btnOutline: {
    padding: '8px 20px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '50px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    cursor: 'pointer',
    background: 'transparent',
  },
  btnPrimary: {
    padding: '8px 20px',
    border: 'none',
    borderRadius: '50px',
    color: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
    background: 'linear-gradient(90deg, #185FA5, #0F9B8E)',
    fontWeight: '600',
  },
  hero: {
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    width: '100%',
    boxSizing: 'border-box',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: '99px',
    padding: '6px 16px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '24px',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#0F9B8E',
    flexShrink: 0,
  },
  heroTitle: {
    fontWeight: '700',
    color: '#fff',
    lineHeight: '1.2',
    marginBottom: '20px',
  },
  grad: {
    background: 'linear-gradient(90deg, #378ADD, #0F9B8E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: '1.8',
    maxWidth: '520px',
    margin: '0 auto 32px',
  },
  heroBtns: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '56px',
    flexWrap: 'wrap',
  },
  heroBtnPrimary: {
    padding: '14px 32px',
    border: 'none',
    borderRadius: '50px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'linear-gradient(90deg, #185FA5, #0F9B8E)',
    boxShadow: '0 8px 32px rgba(24,95,165,0.35)',
  },
  heroBtnOutline: {
    padding: '14px 32px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '50px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'transparent',
  },
 statsRow: {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
  width: '100%',
  boxSizing: 'border-box',
  marginBottom: '20px',
},
 statItem: {
  textAlign: 'center',
  minWidth: '140px',
  padding: '24px',
  borderRadius: '22px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(18px)',
  transition: 'all 0.35s ease',
},
  statNum: {
    fontSize: '36px',
    fontWeight: '700',
    background: 'linear-gradient(90deg, #378ADD, #0F9B8E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1.2,
  },
  statLbl: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '4px',
  },
  section: {
    position: 'relative',
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
    textAlign: 'center',
  },
  sectionSub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '32px',
    textAlign: 'center',
  },
  featuresGrid: {
    display: 'grid',
    gap: '16px',
  },
 featureCard: {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '24px',
  backdropFilter: 'blur(16px)',
  transition: 'all 0.35s ease',
  cursor: 'pointer',
},
  featureIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    marginBottom: '14px',
  },
  featureTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px',
  },
  featureDesc: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    lineHeight: '1.7',
  },
  stepsRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'center',
  },
 stepWrapper: {
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  minWidth: 0,
  width: '100%',
},
  stepCard: {
    flex: 1,
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px 16px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
  },
  stepNum: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#0F9B8E',
    letterSpacing: '0.1em',
    marginBottom: '10px',
  },
  stepIcon: {
    fontSize: '28px',
    marginBottom: '10px',
  },
  stepTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '6px',
  },
  stepDesc: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    lineHeight: '1.6',
  },
  stepArrow: {
    fontSize: '20px',
    color: 'rgba(255,255,255,0.2)',
    padding: '0 4px',
    flexShrink: 0,
  },
  testimonialCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '40px',
    backdropFilter: 'blur(10px)',
    maxWidth: '640px',
    margin: '0 auto',
    textAlign: 'center',
  },
  quoteIcon: {
    fontSize: '60px',
    lineHeight: 1,
    background: 'linear-gradient(90deg, #378ADD, #0F9B8E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  },
  testimonialText: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.8',
    fontStyle: 'italic',
    marginBottom: '24px',
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'center',
  },
  testimonialAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #185FA5, #0F9B8E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    flexShrink: 0,
  },
  testimonialName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    textAlign: 'left',
  },
  testimonialRole: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'left',
  },
  ctaSection: {
    background: 'linear-gradient(135deg, rgba(24,95,165,0.15), rgba(15,155,142,0.15))',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    zIndex: 1,
  },
  ctaTitle: {
    fontWeight: '700',
    color: '#fff',
    marginBottom: '10px',
  },
  ctaSub: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '28px',
  },
  footer: {
    textAlign: 'center',
    padding: '24px 40px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    position: 'relative',
    zIndex: 1,
  },
  footerText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)',
  },
};

export default Home;