import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function OwnerProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/profile');
      console.log('Profile API response:', res.data);
      
      // Handle different response formats
      let ownerData;
      if (res.data.owner) {
        // Response is { success: true, owner: {...} }
        ownerData = res.data.owner;
      } else if (res.data.name || res.data.email) {
        // Response is directly { name: "...", email: "..." }
        ownerData = res.data;
      } else {
        console.error('Unexpected response format:', res.data);
        ownerData = {};
      }

      // Set profile with defaults to avoid undefined values
      setProfile({
        name: ownerData.name || '',
        email: ownerData.email || '',
        phone: ownerData.phone || '',
      });

      console.log('Profile set to:', {
        name: ownerData.name || '',
        email: ownerData.email || '',
        phone: ownerData.phone || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      alert('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/owner/profile', profile);
      console.log('Update response:', res.data);
      
      if (res.data.success || res.status === 200) {
        alert('Profile updated!');
        setEditing(false);
        // Refresh profile data
        fetchProfile();
      } else {
        alert('Update failed.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <main className="container mt-5" style={{ maxWidth: '600px' }}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="text-center mb-4">Owner Profile</h2>

      {!editing ? (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="mb-3">
              <label className="text-muted small">Name</label>
              <p className="fs-5 mb-0">{profile.name || 'Not set'}</p>
            </div>
            <div className="mb-3">
              <label className="text-muted small">Email</label>
              <p className="fs-5 mb-0">{profile.email || 'Not set'}</p>
            </div>
            <div className="mb-3">
              <label className="text-muted small">Phone</label>
              <p className="fs-5 mb-0">{profile.phone || 'Not set'}</p>
            </div>
            <button className="btn btn-primary mt-3" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  className="form-control"
                  placeholder="Enter phone number"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success flex-grow-1">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setEditing(false);
                    // Reset form to original data
                    fetchProfile();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default OwnerProfile;
