import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddStudent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        'https://edutrack-ai-production-502d.up.railway.app/api/admin/students',
        { name, email, password },
        { headers: { authorization: `Bearer ${token}` } }
      );

      alert('Student created successfully');
      navigate('/admin');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating student');
    }
  };

  return (
    <div style={{ padding: 20, color: 'white' }}>
      <h2>Add Student</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Create Student</button>
      </form>
    </div>
  );
}

export default AddStudent;