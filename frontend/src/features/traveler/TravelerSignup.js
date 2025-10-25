import React, { useState } from 'react';
import api from '../../services/api';

function TravelerSignup() {
  // Local state for form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle signup form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/traveler/signup', {
        name,
        email,
        password,
      });
      alert('Signup successful. Please log in.');
      // Optionally redirect to login page
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please check your information.');
    }
  };

  return (
    <main className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Traveler Signup</h2>
          <form onSubmit={handleSignup} aria-label="Traveler signup form">
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-success w-100">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default TravelerSignup;