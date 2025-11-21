import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginOwner } from '../../features/owner/ownerSlice';
import api from '../../services/api';

function OwnerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Debug: check Redux state
  const ownerState = useSelector(state => state.owner);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/owner/login', { email, password });
      
      console.log('=== LOGIN DEBUG ===');
      console.log('1. API Response:', res.data);
      console.log('2. Token:', res.data.token);
      console.log('3. Owner:', res.data.owner);
      console.log('4. Before dispatch - Redux state:', ownerState);
      console.log('5. Before dispatch - localStorage:', localStorage.getItem('owner_token'));
      
      // Dispatch login action to Redux store with token and owner info
      dispatch(loginOwner({
        owner: res.data.owner,
        token: res.data.token
      }));
      
      console.log('6. After dispatch - Redux state:', ownerState);
      console.log('7. After dispatch - localStorage:', localStorage.getItem('owner_token'));
      
      // Wait a bit for Redux to update
      setTimeout(() => {
        console.log('8. After timeout - localStorage:', localStorage.getItem('owner_token'));
        alert('Login successful!');
        navigate('/owner/dashboard');
      }, 100);
      
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="text-center mb-4">Owner Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="text-center mt-3">
          <p className="text-muted">
            Don't have an account? <a href="/owner/signup">Sign up</a>
          </p>
        </div>
      </form>
    </main>
  );
}

export default OwnerLogin;
