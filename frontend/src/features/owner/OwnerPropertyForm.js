import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

function OwnerPropertyForm() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(propertyId);

  const [form, setForm] = useState({
    name: '',
    location: '',
    price: '',
    imageUrl: '',
    description: '',
  });

  useEffect(() => {
    if (isEdit) {
      const fetchProperty = async () => {
        try {
          const res = await api.get(`/owner/properties/${propertyId}`);
          setForm(res.data);
        } catch (err) {
          alert('Failed to load property.');
        }
      };
      fetchProperty();
    }
  }, [propertyId, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/owner/properties/${propertyId}`, form);
        alert('Property updated!');
      } else {
        await api.post('/owner/properties', form);
        alert('Property created!');
      }
      navigate('/owner/properties');
    } catch (err) {
      alert('Error saving property.');
    }
  };

  return (
    <main className="container mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="text-center mb-4">
        {isEdit ? 'Edit Property' : 'Add New Property'}
      </h2>
      <form onSubmit={handleSubmit} className="border p-4 rounded">
        <div className="mb-3">
          <label className="form-label">Property Name</label>
          <input
            type="text"
            className="form-control"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Location</label>
          <input
            type="text"
            className="form-control"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Price per Night</label>
          <input
            type="number"
            className="form-control"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Image URL</label>
          <input
            type="text"
            className="form-control"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="4"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          {isEdit ? 'Update Property' : 'Create Property'}
        </button>
      </form>
    </main>
  );
}

export default OwnerPropertyForm;