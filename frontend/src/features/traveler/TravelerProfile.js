import React, { useEffect, useState } from 'react';
import api from '../../services/api';

// Country options for dropdown
const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
  'France', 'Spain', 'Italy', 'Japan', 'China', 'India', 'Brazil',
  'Mexico', 'South Korea', 'Netherlands', 'Sweden', 'Switzerland',
  'Other'
];

function TravelerProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    about: '',
    city: '',
    state: '',
    country: '',
    languages: '',
    gender: '',
    avatar_url: '',
  });
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch traveler profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/traveler/profile');
        setProfile(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load profile:', err);
        alert('Failed to load profile.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle profile update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put('/traveler/profile', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        about: profile.about,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        languages: profile.languages,
        gender: profile.gender,
      });
      alert('Profile updated successfully.');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Update failed. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!newImage) {
      alert('Please select an image first.');
      return;
    }
    const formData = new FormData();
    formData.append('image', newImage);
    try {
      const res = await api.post('/traveler/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfile((prev) => ({ ...prev, avatar_url: res.data.imageUrl }));
      setNewImage(null);
      alert('Image uploaded successfully.');
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Image upload failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <main className="container mt-5">
        <p className="text-center">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">Traveler Profile</h2>
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Profile Image */}
          <div className="text-center mb-4">
            <img
              src={profile.avatar_url || 'https://via.placeholder.com/150'}
              alt="Traveler profile"
              className="rounded-circle"
              width="150"
              height="150"
              style={{ objectFit: 'cover', border: '3px solid #ddd' }}
            />
          </div>

          {/* Image Upload Section */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Update Profile Picture</h5>
              <div className="mb-3">
                <label htmlFor="imageUpload" className="form-label">
                  Choose a new profile image
                </label>
                <input
                  type="file"
                  id="imageUpload"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files[0])}
                />
              </div>
              <button
                className="btn btn-outline-secondary"
                onClick={handleImageUpload}
                disabled={!newImage}
              >
                Upload Image
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Personal Information</h5>
              <form onSubmit={handleUpdate} aria-label="Traveler profile form">
                {/* Name */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
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
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-control"
                    placeholder="e.g., +1 (555) 123-4567"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>

                {/* About Me */}
                <div className="mb-3">
                  <label htmlFor="about" className="form-label">
                    About Me
                  </label>
                  <textarea
                    id="about"
                    className="form-control"
                    rows="4"
                    placeholder="Tell us about yourself..."
                    value={profile.about || ''}
                    onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                  />
                </div>

                {/* Location Section */}
                <h6 className="mt-4 mb-3">Location</h6>
                <div className="row">
                  {/* City */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      className="form-control"
                      placeholder="e.g., San Francisco"
                      value={profile.city || ''}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    />
                  </div>

                  {/* State (Abbreviated) */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="state" className="form-label">
                      State (Abbreviated)
                    </label>
                    <input
                      type="text"
                      id="state"
                      className="form-control"
                      placeholder="e.g., CA"
                      maxLength="2"
                      value={profile.state || ''}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value.toUpperCase() })}
                    />
                    <small className="form-text text-muted">Use 2-letter abbreviation</small>
                  </div>
                </div>

                {/* Country (Dropdown) */}
                <div className="mb-3">
                  <label htmlFor="country" className="form-label">
                    Country
                  </label>
                  <select
                    id="country"
                    className="form-select"
                    value={profile.country || ''}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Languages */}
                <div className="mb-3">
                  <label htmlFor="languages" className="form-label">
                    Languages
                  </label>
                  <input
                    type="text"
                    id="languages"
                    className="form-control"
                    placeholder="e.g., English, Spanish, French"
                    value={profile.languages || ''}
                    onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
                  />
                  <small className="form-text text-muted">
                    Separate multiple languages with commas
                  </small>
                </div>

                {/* Gender */}
                <div className="mb-3">
                  <label htmlFor="gender" className="form-label">
                    Gender
                  </label>
                  <select
                    id="gender"
                    className="form-select"
                    value={profile.gender || ''}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default TravelerProfile;