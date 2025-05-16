
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/auth.css';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getModeFromQuery = () => {
      const queryParams = new URLSearchParams(location.search);
      return queryParams.get('mode') === 'signup' ? false : true;
    };

    setIsLogin(getModeFromQuery());
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';
    const url = `http://localhost:5000/api/auth/${endpoint}`;

    setLoading(true);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.message?.toLowerCase() || '';
        if (message.includes('already exists') || message.includes('already registered')) {
          throw new Error('Credentials already exist, try using other details');
        } else if (message.includes('invalid credentials')) {
          throw new Error('Invalid credentials, please try again');
        } else {
          throw new Error(data.message || 'Something went wrong.');
        }
      }

      if (data.access_token && data.user) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        alert(`${isLogin ? 'Login' : 'Signup'} successful!`);
        navigate('/');
        window.location.reload();
      } else {
        throw new Error('Authentication failed: Invalid response from server.');
      }
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    const newMode = isLogin ? 'signup' : 'login';
    navigate(`/auth?mode=${newMode}`);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2>{isLogin ? 'Log in' : 'Sign up'}</h2>
        {localError && <div className="auth-error">{localError}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="auth-button" disabled={loading} >
            {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : isLogin ? 'Log in' : 'Sign up'}
          </button>
        </form>
        <p className="auth-toggle-text">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={toggleMode} className="auth-toggle-link" id="auth-btn">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}


