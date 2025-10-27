import React, { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import './AgentButton.css';

function AgentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get booking context from URL or localStorage if available
  const getBookingContext = () => {
    // Try to get from localStorage (if user just made a search)
    const searchLocation = localStorage.getItem('searchLocation') || 'Paris';
    const searchStartDate = localStorage.getItem('searchStartDate') || '2025-11-01';
    const searchEndDate = localStorage.getItem('searchEndDate') || '2025-11-05';
    const searchGuests = localStorage.getItem('searchGuests') || '2';

    return {
      location: searchLocation,
      dates: {
        startDate: searchStartDate,
        endDate: searchEndDate
      },
      partyType: 'family', // Can be determined from context
      guests: parseInt(searchGuests)
    };
  };

  // Handle keyboard events (Escape to close)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setResponse(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const bookingContext = getBookingContext();

      const res = await axios.post('http://localhost:8000/ai-agent/plan', {
        query: query,
        bookingContext: bookingContext,
        preferences: {
          budget: 'medium',
          interests: ['sightseeing', 'food', 'culture'],
          mobilityNeeds: [],
          dietaryFilters: []
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minutes timeout
      });

      setResponse(res.data);
    } catch (err) {
      console.error('AI Agent Error:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. The AI is taking too long to respond. Please try again.');
      } else if (err.response) {
        setError(err.response.data?.message || 'Failed to get recommendations from AI Agent');
      } else if (err.request) {
        setError('Cannot connect to AI Agent. Make sure the Python server is running on http://localhost:8000');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick action buttons
  const handleQuickAction = (quickQuery) => {
    setQuery(quickQuery);
  };

  const quickActions = [
    "What should I pack for this trip?",
    "Recommend family-friendly activities",
    "Find vegetarian restaurants",
    "Create a day-by-day itinerary"
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        className="agent-button"
        onClick={handleOpen}
        aria-label="Open AI Travel Assistant"
      >
        <span className="agent-icon">AI</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="agent-backdrop" 
          onClick={handleClose}
          aria-hidden="true"
        ></div>
      )}

      {/* Side Panel */}
      <div 
        className={`agent-panel ${isOpen ? 'agent-panel-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-panel-title"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="agent-panel-header">
          <h5 id="agent-panel-title" className="mb-0">AI Travel Assistant</h5>
          <button 
            className="btn-close" 
            onClick={handleClose}
            aria-label="Close AI Travel Assistant"
          ></button>
        </div>

        {/* Body */}
        <div className="agent-panel-body">
          {/* Introduction */}
          {!response && !loading && (
            <div className="mb-4">
              <p className="text-muted">
                Ask me anything about your trip! I can help with itineraries, 
                packing lists, restaurant recommendations, and more.
              </p>
              
              {/* Quick Actions */}
              <div className="mb-3">
                <small className="text-muted d-block mb-2">Quick actions:</small>
                <div className="d-flex flex-wrap gap-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleQuickAction(action)}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Query Form */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-3">
              <label htmlFor="aiQuery" className="form-label">
                Your Question
              </label>
              <textarea
                id="aiQuery"
                className="form-control"
                rows="3"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., We're visiting Paris with kids, need vegetarian restaurants and museum recommendations"
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Thinking...
                </>
              ) : (
                'Get Recommendations'
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* AI Response */}
          {response && (
            <div className="ai-response">
              {/* Day-by-Day Plan */}
              {response.dayByDayPlan && response.dayByDayPlan.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-primary mb-3">Day-by-Day Itinerary</h6>
                  {response.dayByDayPlan.map((day, idx) => (
                    <div key={idx} className="card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">Day {day.day}</h6>
                        <div className="mb-2">
                          <strong>Morning:</strong>
                          <p className="mb-1 small">{day.morning}</p>
                        </div>
                        <div className="mb-2">
                          <strong>Afternoon:</strong>
                          <p className="mb-1 small">{day.afternoon}</p>
                        </div>
                        <div>
                          <strong>Evening:</strong>
                          <p className="mb-0 small">{day.evening}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Activities */}
              {response.activities && response.activities.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-primary mb-3">Recommended Activities</h6>
                  <div className="row">
                    {response.activities.slice(0, 6).map((activity, idx) => (
                      <div key={idx} className="col-12 mb-3">
                        <div className="card">
                          <div className="card-body">
                            <h6 className="card-title">{activity.title}</h6>
                            <p className="card-text small mb-2">{activity.description}</p>
                            <div className="d-flex flex-wrap gap-1 mb-2">
                              {activity.tags && activity.tags.map((tag, i) => (
                                <span key={i} className="badge bg-secondary">{tag}</span>
                              ))}
                            </div>
                            <div className="small text-muted">
                              <div>Duration: {activity.duration}</div>
                              <div>Price: {activity.priceTier}</div>
                              {activity.wheelchairAccessible && (
                                <div className="text-success">Wheelchair accessible</div>
                              )}
                              {activity.childFriendly && (
                                <div className="text-info">Child-friendly</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Restaurants */}
              {response.restaurants && response.restaurants.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-primary mb-3">Restaurant Recommendations</h6>
                  {response.restaurants.slice(0, 5).map((restaurant, idx) => (
                    <div key={idx} className="card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">{restaurant.name}</h6>
                        <p className="card-text small mb-2">{restaurant.description}</p>
                        <div className="small">
                          <div><strong>Cuisine:</strong> {restaurant.cuisine}</div>
                          <div><strong>Price:</strong> {restaurant.priceTier}</div>
                          {restaurant.dietaryOptions && restaurant.dietaryOptions.length > 0 && (
                            <div>
                              <strong>Dietary options:</strong>{' '}
                              {restaurant.dietaryOptions.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Packing Checklist */}
              {response.packingChecklist && response.packingChecklist.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-primary mb-3">Packing Checklist</h6>
                  <ul className="list-group">
                    {response.packingChecklist.map((item, idx) => (
                      <li key={idx} className="list-group-item">
                        <input 
                          type="checkbox" 
                          className="form-check-input me-2" 
                          id={`pack-${idx}`}
                        />
                        <label htmlFor={`pack-${idx}`} className="small">
                          {item}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Local Context */}
              {response.localContext && (
                <div className="mb-4">
                  <h6 className="text-primary mb-3">Local Information</h6>
                  
                  {/* Weather */}
                  {response.localContext.weather && (
                    <div className="card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">Weather</h6>
                        <p className="small mb-1">
                          <strong>Temperature:</strong> {response.localContext.weather.temperature}
                        </p>
                        <p className="small mb-1">
                          <strong>Conditions:</strong> {response.localContext.weather.conditions}
                        </p>
                        <p className="small mb-0">
                          <strong>Tip:</strong> {response.localContext.weather.recommendation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Events */}
                  {response.localContext.events && response.localContext.events.length > 0 && (
                    <div className="card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">Local Events</h6>
                        {response.localContext.events.map((event, idx) => (
                          <div key={idx} className="mb-2">
                            <strong className="small">{event.name}</strong>
                            {event.description && (
                              <p className="small mb-0 text-muted">{event.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transportation */}
                  {response.localContext.transportation && (
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">Transportation</h6>
                        <p className="small mb-0">
                          {response.localContext.transportation.recommendation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* New Query Button */}
              <button 
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  setResponse(null);
                  setQuery('');
                  setError(null);
                }}
              >
                Ask Another Question
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AgentButton;