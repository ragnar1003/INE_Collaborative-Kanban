import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, password });
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Register</button>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}

export default Register;