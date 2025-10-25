import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function OwnerProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/owner/profile');
        setProfile(res.data);
      } catch (err) {
        alert('Failed to load profile.');
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/owner/profile', profile);
      if (res.data.success) {
        alert('Profile updated!');
        setEditing(false);
      } else {
        alert('Update failed.');
      }
    } catch (err) {
      alert('Error updating profile.');
    }
  };

  return (
    <main className="container mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="text-center mb-4">Owner Profile</h2>

      {!editing ? (
        <div className="border p-4 rounded">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone || 'Not set'}</p>
          <button className="btn btn-outline-primary mt-3" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="border p-4 rounded">
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="text"
              className="form-control"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-success me-2">Save</button>
          <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      )}
    </main>
  );
}

export default OwnerProfile;