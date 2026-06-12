import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts';

function Prediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    fetchPrediction();
  }, []);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://edutrack-ai-production-502d.up.railway.app/api/prediction/predict', {
        headers: { authorization: `Bearer ${token}` },
      });
      setPrediction(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching prediction');
    } finally {
      setLoading(false);
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
    return '#A32D2D';
  };

  const getRiskBg = (risk) => {
    if (risk === 'Low') return 'rgba(59,109,17,0.2)';
    if (risk === 'Medium') return 'rgba(133,79,11,0.2)';
    return 'rgba(163,45,45,0.2)';
  };

  const getRiskEmoji = (risk) => {
    if (risk === 'Low') return '🟢';
    if (risk === 'Medium') return '🟡';
    return '🔴';
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <p style={styles.loadingIcon}>🤖</p>
          <p style={styles.loadingText}>Analyzing your performance...</p>
          <p style={styles.loadingSubText}>Our AI is calculating your prediction</p>
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
          <span style={styles.navLink}
            onClick={() => navigate('/grades')}>Grades</span>
          <span style={{ ...styles.navLink, ...styles.navLinkActive }}
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
            <h2 style={styles.welcomeTitle}>AI Prediction 🤖</h2>
            <p style={styles.welcomeSub}>
              Based on your current grades and performance
            </p>
          </div>
          <button style={styles.refreshBtn} onClick={fetchPrediction}>
            🔄 Refresh
          </button>
        </div>

        {error ? (
          <div style={styles.errorCard}>
            <p style={styles.errorIcon}>⚠️</p>
            <p style={styles.errorTitle}>{error}</p>
            <p style={styles.errorSub}>
              Please add some grades first then come back here
            </p>
            <button
              style={styles.addGradeBtn}
              onClick={() => navigate('/grades')}
            >
              + Add Grades
            </button>
          </div>
        ) : prediction && (
          <>
            {/* TOP CARDS */}
            <div style={{
              ...styles.topCards,
              flexDirection: isMobile ? 'column' : 'row',
            }}>

              {/* GPA CARD */}
              <div style={styles.gpaCard}>
                <p style={styles.cardLabel}>Predicted GPA</p>
                <p style={styles.gpaValue}>
                {prediction.predicted_gpa === 0 ? '0.00' : prediction.predicted_gpa}
                </p>
                <p style={styles.gpaMax}>out of 4.0</p>
                <div style={styles.gpaBar}>
                  <div style={{
                    ...styles.gpaBarFill,
                    width: `${(prediction.predicted_gpa / 4.0) * 100}%`,
                  }} />
                </div>
              </div>

              {/* RISK CARD */}
              <div style={{
                ...styles.riskCard,
                backgroundColor: getRiskBg(prediction.risk_level),
                border: `1px solid ${getRiskColor(prediction.risk_level)}40`,
              }}>
                <p style={styles.cardLabel}>Risk Level</p>
                <p style={styles.riskEmoji}>
                  {getRiskEmoji(prediction.risk_level)}
                </p>
                <p style={{
                  ...styles.riskValue,
                  color: getRiskColor(prediction.risk_level),
                }}>
                  {prediction.risk_level} Risk
                </p>
                <p style={styles.riskSub}>
                  Based on {prediction.total_courses} courses
                </p>
              </div>

              {/* AVERAGE SCORE CARD */}
              <div style={styles.scoreCard}>
                <p style={styles.cardLabel}>Average Score</p>
                <p style={styles.scoreValue}>{prediction.avg_score}%</p>
                <p style={styles.scoreSub}>Across all courses</p>
                <div style={styles.gpaBar}>
                  <div style={{
                    ...styles.gpaBarFill,
                    width: `${prediction.avg_score}%`,
                    background: 'linear-gradient(90deg, #378ADD, #0F9B8E)',
                  }} />
                </div>
              </div>

            </div>

            {/* RECOMMENDATION */}
            <div style={styles.recommendationCard}>
              <div style={styles.recommendationHeader}>
                <span style={styles.recommendationIcon}>💡</span>
                <h3 style={styles.recommendationTitle}>AI Recommendation</h3>
              </div>
              <p style={styles.recommendationText}>
                {prediction.predicted_gpa === 0
                 ? '⚠️ Your current scores indicate a failing GPA. You need to significantly improve your performance across all courses. Please seek immediate academic support.'
                 : prediction.recommendation}
                   </p>
            </div>

            {/* CHARTS ROW */}
            <div style={{
              ...styles.chartsRow,
              flexDirection: isMobile ? 'column' : 'row',
            }}>

              {/* RISK PROBABILITIES PIE CHART */}
              <div style={{ ...styles.chartCard, flex: 1 }}>
                <h3 style={styles.chartTitle}>Risk Probability</h3>
                <p style={styles.chartSub}>Likelihood of each risk level</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Low Risk', value: prediction.risk_probabilities.Low },
                        { name: 'Medium Risk', value: prediction.risk_probabilities.Medium },
                        { name: 'High Risk', value: prediction.risk_probabilities.High },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="#3B6D11" />
                      <Cell fill="#EF9F27" />
                      <Cell fill="#A32D2D" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1a1a2e',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#fff',
                      }}
                      formatter={(value) => [`${value}%`, '']}
                    />
                    <Legend
                      wrapperStyle={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* PERFORMANCE METRICS */}
              <div style={{ ...styles.chartCard, flex: 1 }}>
                <h3 style={styles.chartTitle}>Performance Metrics</h3>
                <p style={styles.chartSub}>Your academic indicators</p>
                <div style={styles.metricsList}>
                  {[
                    { label: 'Average Score', value: prediction.avg_score, max: 100, color: '#378ADD' },
                    { label: 'Attendance', value: prediction.attendance, max: 100, color: '#0F9B8E' },
                    { label: 'Participation', value: prediction.participation, max: 100, color: '#EF9F27' },
                    { label: 'Predicted GPA', value: (prediction.predicted_gpa / 4.0 * 100).toFixed(1), max: 100, color: '#3B6D11' },
                  ].map((m) => (
                    <div key={m.label} style={styles.metricItem}>
                      <div style={styles.metricLabelRow}>
                        <span style={styles.metricLabel}>{m.label}</span>
                        <span style={{ ...styles.metricValue, color: m.color }}>
                          {m.value}%
                        </span>
                      </div>
                      <div style={styles.metricBar}>
                        <div style={{
                          ...styles.metricBarFill,
                          width: `${m.value}%`,
                          background: m.color,
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </>
        )}

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
    textAlign: 'center',
  },
  loadingIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  loadingText: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  loadingSubText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '13px',
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
  errorCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  errorTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px',
  },
  errorSub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '20px',
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
  topCards: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
  },
  gpaCard: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
  },
  cardLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '12px',
  },
  gpaValue: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 4px',
    background: 'linear-gradient(90deg, #378ADD, #0F9B8E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  gpaMax: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '16px',
  },
  gpaBar: {
    height: '6px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  gpaBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #185FA5, #0F9B8E)',
    borderRadius: '99px',
    transition: 'width 0.5s ease',
  },
  riskCard: {
    flex: 1,
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
    textAlign: 'center',
  },
  riskEmoji: {
    fontSize: '36px',
    margin: '8px 0',
  },
  riskValue: {
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  riskSub: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
  },
  scoreCard: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
  },
  scoreValue: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 4px',
  },
  scoreSub: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '16px',
  },
  recommendationCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    backdropFilter: 'blur(10px)',
  },
  recommendationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  recommendationIcon: {
    fontSize: '20px',
  },
  recommendationTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  recommendationText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.7',
    margin: 0,
  },
  chartsRow: {
    display: 'flex',
    gap: '16px',
  },
  chartCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 4px',
  },
  chartSub: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '16px',
  },
  metricsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '8px',
  },
  metricItem: {},
  metricLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  metricLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
  },
  metricValue: {
    fontSize: '13px',
    fontWeight: '600',
  },
  metricBar: {
    height: '6px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.5s ease',
  },
};

export default Prediction;