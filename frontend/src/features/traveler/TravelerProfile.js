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
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch traveler profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/traveler/profile');
        console.log('Profile response:', res.data);  // Debug log

        const travelerData = res.data.traveler;
        setProfile({
          name: travelerData.name || '',
          email: travelerData.email || '',
          phone: travelerData.phone || '',
          about: travelerData.about || '',
          city: travelerData.city || '',
          state: travelerData.state || '',
          country: travelerData.country || '',
          languages: travelerData.languages || '',
          gender: travelerData.gender || '',
          avatar_url: travelerData.profile_image || '',
        });
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

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB.');
      return;
    }

    setNewImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!newImage) {
      alert('Please select an image first.');
      return;
    }

    setUploading(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;

        try {
          const res = await api.post('/traveler/profile/image', {
            imageData: base64Image
          });

          if (res.data.success) {
            // Update profile with new image
            setProfile((prev) => ({
              ...prev,
              avatar_url: res.data.imageUrl
            }));
            setNewImage(null);
            setImagePreview(null);

            // Clear the file input
            const fileInput = document.getElementById('imageUpload');
            if (fileInput) fileInput.value = '';

            alert('Image uploaded successfully.');
          }
        } catch (err) {
          console.error('Image upload failed:', err);
          alert('Image upload failed: ' + (err.response?.data?.error || err.message));
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        alert('Failed to read image file.');
        setUploading(false);
      };

      reader.readAsDataURL(newImage);
    } catch (err) {
      console.error('Image processing failed:', err);
      alert('Failed to process image.');
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <main className="container mt-5">
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

              {/* Image Preview */}
              {imagePreview && (
                <div className="text-center mb-3">
                  <p className="text-muted mb-2">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="rounded-circle"
                    width="120"
                    height="120"
                    style={{ objectFit: 'cover', border: '2px solid #007bff' }}
                  />
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="imageUpload" className="form-label">
                  Choose a new profile image
                </label>
                <input
                  type="file"
                  id="imageUpload"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={uploading}
                />
                <small className="form-text text-muted">
                  Maximum file size: 2MB. Supported formats: JPEG, PNG, GIF, WebP
                </small>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleImageUpload}
                disabled={!newImage || uploading}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Uploading...
                  </>
                ) : (
                  'Upload Image'
                )}
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

                {/* Email - Read Only */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    value={profile.email}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#e9ecef' }}
                  />
                  <small className="form-text text-muted">
                    Email cannot be changed
                  </small>
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
