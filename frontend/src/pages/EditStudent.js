import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState({
    name: '',
    email: ''
  });

  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const headers = {
    authorization: `Bearer ${token}`
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  const fetchStudent = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/students/${id}`,
        { headers }
      );

      setStudent({
        name: res.data.student.name,
        email: res.data.student.email
      });

      setLoading(false);

    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value
    });
  };

  const updateStudent = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/students/${id}`,
        student,
        { headers }
      );

      alert('Student updated successfully ');
      navigate('/admin'); // go back to dashboard

    } catch (err) {
      console.error(err);
      alert('Failed to update student');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', color: '#fff' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a1a',
      color: '#fff',
      padding: '40px'
    }}>
      <h1>Edit Student</h1>

      <div style={{ marginTop: '20px' }}>
        <input
          name="name"
          value={student.name}
          onChange={handleChange}
          placeholder="Name"
          style={inputStyle}
        />

        <input
          name="email"
          value={student.email}
          onChange={handleChange}
          placeholder="Email"
          style={inputStyle}
        />

        <button onClick={updateStudent} style={buttonStyle}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  display: 'block',
  width: '300px',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '8px',
  border: '1px solid #444',
  background: '#1a1a2e',
  color: '#fff'
};

const buttonStyle = {
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  background: '#185FA5',
  color: '#fff',
  cursor: 'pointer'
};

export default EditStudent;