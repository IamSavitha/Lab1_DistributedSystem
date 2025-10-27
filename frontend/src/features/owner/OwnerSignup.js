import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function OwnerSignup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',  // 添加 location
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Validate password length
    if (form.password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    // Validate location
    if (!form.location.trim()) {
      alert('Location is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/owner/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
        location: form.location,  // 发送 location
      });
      
      if (res.data.success) {
        alert('Signup successful! Please login.');
        navigate('/owner/login');
      } else {
        alert(res.data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during signup:', err);
      const errorMsg = err.response?.data?.message || 'Error during signup. Email may already be in use.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="text-center mb-4">Owner Signup</h2>
      <p className="text-center text-muted mb-4">
        Create an account to list your properties
      </p>
      
      <form onSubmit={handleSignup}>
        {/* Name */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Full Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="name"
            className="form-control"
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoComplete="name"
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email Address <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
        </div>

        {/* Location */}
        <div className="mb-3">
          <label htmlFor="location" className="form-label">
            Location <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="location"
            className="form-control"
            placeholder="e.g., San Francisco, CA"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
            autoComplete="address-level2"
          />
          <small className="form-text text-muted">
            City and state where you manage properties
          </small>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password <span className="text-danger">*</span>
          </label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Create a password (min 6 characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="new-password"
            minLength="6"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password <span className="text-danger">*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="form-control"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
            autoComplete="new-password"
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn btn-success w-100" 
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Owner Account'}
        </button>

        {/* Login Link */}
        <div className="text-center mt-3">
          <p className="text-muted">
            Already have an account? <a href="/owner/login">Login here</a>
          </p>
        </div>
      </form>
    </main>
  );
}

export default OwnerSignup;
