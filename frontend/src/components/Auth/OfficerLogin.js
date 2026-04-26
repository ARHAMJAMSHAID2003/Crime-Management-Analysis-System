import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { authAPI } from '../../services/api';
import './Auth.css';

const OfficerLogin = ({ setIsAuthenticated, setRole }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.officerLogin(email, password);
      
      // Store token and user info
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('role', 'OFFICER');
      setIsAuthenticated(true);
      setRole('OFFICER');

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Logged in successfully',
        timer: 1500,
        showConfirmButton: false,
      });

      navigate('/dashboard');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Invalid email or password',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🛑️ MehfoozPakistan</h1>
          <p>Savdaan Rahiye, Satark Rahiye</p>
          <div style={{ marginTop: '10px', padding: '8px 16px', background: '#f8fafb', borderRadius: '4px', fontSize: '0.85rem', color: '#325a77', fontWeight: '600', border: '1px solid #e1e4e8' }}>
            👮 Officer Login Portal
          </div>
        </div>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="officer@police.gov.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary full-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="auth-footer">
          <p>Not an officer? <a href="/login/victim">Login as Victim/Witness</a></p>
        </div>
      </div>
    </div>
  );
};

export default OfficerLogin;







