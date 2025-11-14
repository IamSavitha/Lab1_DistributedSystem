import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PropertyCard from '../../components/PropertyCard';

function TravelerDashboard() {
  // Search filters
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);

  // Search results
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // ✅ 方案A修复：删除自动搜索
  // 初始加载时不执行搜索，只有用户点击Search按钮才搜索
  useEffect(() => {
    // 不再自动调用 handleSearch()
    setSearched(false);
  }, []);

  // Handle property search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Search button clicked!');
    console.log('Search params:', { location, startDate, endDate, guests });
    
    setLoading(true);
    setSearched(true);
    
    try {
      console.log('Sending request to /properties/search...');
      const res = await api.get('/properties/search', {
        params: { location, startDate, endDate, guests },
      });
      console.log('✅ Search results received:', res.data);
      
      // Backend returns { success, count, properties: [...] } or just [...]
      const propertyList = res.data.properties || res.data;
      console.log('Setting results:', propertyList);
      setResults(propertyList);
    } catch (err) {
      console.error('❌ Search failed:', err);
      alert('Search failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Find Your Perfect Stay</h2>

      {/* Search Form */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="City, Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Check-in</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Check-out</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Guests</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-1 d-flex align-items-end">
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Searching for properties...</p>
        </div>
      )}

      {/* Search Results */}
      {!loading && searched && (
        <div>
          <h4 className="mb-3">
            Available Properties ({results.length})
          </h4>
          {results.length === 0 ? (
            <div className="alert alert-info">
              No properties found. Try adjusting your search filters.
            </div>
          ) : (
            <div className="row">
              {results.map((property) => (
                <div key={property.id} className="col-md-4 mb-4">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Initial State - No Search Yet */}
      {!loading && !searched && (
        <div className="text-center my-5">
          <i className="bi bi-search" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          <p className="text-muted mt-3">
            Enter your travel details above to search for properties
          </p>
        </div>
      )}
    </div>
  );
}

export default TravelerDashboard;
