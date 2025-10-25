import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginTraveler } from './travelerSlice';
import api from '../../services/api';

function TravelerLogin() {
  const dispatch = useDispatch();

  // Local state for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/traveler/login', {
        email,
        password,
      });

      // Dispatch login action to Redux store
      dispatch(loginTraveler(response.data));
      alert('Login successful');
      // Redirect or navigate to dashboard if needed
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <main className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Traveler Login</h2>
          <form onSubmit={handleLogin} aria-label="Traveler login form">
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
            <button type="submit" className="btn btn-primary w-100">
              Log In
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default TravelerLogin;