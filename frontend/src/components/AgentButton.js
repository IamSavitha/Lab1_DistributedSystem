import React, { useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import './AgentButton.css'; // We'll create this CSS file

function AgentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Toggle panel visibility
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset when opening
      setError(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Call AI Agent API
  const handleAsk = async () => {
    if (!query.trim()) {
      setError('Please enter a question.');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Call your Python FastAPI AI Agent endpoint
      const res = await axios.post('http://localhost:8000/ai-agent/plan', {
        query: query,
        // You can add more context here based on user's bookings
        bookingContext: {
          // location: 'Paris',
          // dates: { startDate: '2025-11-01', endDate: '2025-11-05' },
          // partyType: 'couple',
        },
        preferences: {
          budget: 'medium',
          interests: [],
          mobilityNeeds: [],
          dietaryFilters: [],
        },
      });

      setResponse(res.data);
    } catch (err) {
      console.error('AI Agent error:', err);
      if (err.response) {
        setError(`Error: ${err.response.data.detail || 'Failed to get response from AI Agent'}`);
      } else if (err.request) {
        setError('Cannot connect to AI Agent service. Make sure the Python FastAPI server is running on http://localhost:8000');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  // Render the response
  const renderResponse = () => {
    if (!response) return null;

    return (
      <div className="mt-3">
        <Alert variant="success">
          <Alert.Heading>AI Travel Assistant Response</Alert.Heading>
          
          {/* Day-by-day plan */}
          {response.dayByDayPlan && response.dayByDayPlan.length > 0 && (
            <div className="mb-3">
              <h6>Daily Itinerary:</h6>
              {response.dayByDayPlan.map((day, index) => (
                <div key={index} className="mb-3 p-2 border rounded">
                  <strong>Day {index + 1}</strong>
                  {day.morning && (
                    <div className="mt-1">
                      <small className="text-muted">Morning:</small> {day.morning}
                    </div>
                  )}
                  {day.afternoon && (
                    <div className="mt-1">
                      <small className="text-muted">Afternoon:</small> {day.afternoon}
                    </div>
                  )}
                  {day.evening && (
                    <div className="mt-1">
                      <small className="text-muted">Evening:</small> {day.evening}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Activity cards */}
          {response.activities && response.activities.length > 0 && (
            <div className="mb-3">
              <h6>Recommended Activities:</h6>
              {response.activities.map((activity, index) => (
                <div key={index} className="card mb-2">
                  <div className="card-body p-2">
                    <h6 className="card-title mb-1">{activity.title}</h6>
                    {activity.address && (
                      <p className="mb-1"><small>📍 {activity.address}</small></p>
                    )}
                    <div className="d-flex gap-2 mb-1">
                      {activity.priceTier && (
                        <span className="badge bg-success">{activity.priceTier}</span>
                      )}
                      {activity.duration && (
                        <span className="badge bg-info">{activity.duration}</span>
                      )}
                      {activity.wheelchairAccessible && (
                        <span className="badge bg-primary">Wheelchair Accessible</span>
                      )}
                      {activity.childFriendly && (
                        <span className="badge bg-warning">Child Friendly</span>
                      )}
                    </div>
                    {activity.tags && activity.tags.length > 0 && (
                      <div>
                        {activity.tags.map((tag, i) => (
                          <span key={i} className="badge bg-secondary me-1">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Restaurant recommendations */}
          {response.restaurants && response.restaurants.length > 0 && (
            <div className="mb-3">
              <h6>Restaurant Recommendations:</h6>
              {response.restaurants.map((restaurant, index) => (
                <div key={index} className="card mb-2">
                  <div className="card-body p-2">
                    <strong>{restaurant.name}</strong>
                    {restaurant.cuisine && <span> - {restaurant.cuisine}</span>}
                    {restaurant.address && (
                      <div><small>📍 {restaurant.address}</small></div>
                    )}
                    {restaurant.dietaryOptions && restaurant.dietaryOptions.length > 0 && (
                      <div className="mt-1">
                        {restaurant.dietaryOptions.map((option, i) => (
                          <span key={i} className="badge bg-success me-1">{option}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Packing checklist */}
          {response.packingChecklist && response.packingChecklist.length > 0 && (
            <div className="mb-3">
              <h6>Packing Checklist:</h6>
              <ul className="mb-0">
                {response.packingChecklist.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* If response is just a string */}
          {typeof response === 'string' && (
            <p className="mb-0">{response}</p>
          )}

          {/* If response has a message field */}
          {response.message && (
            <p className="mb-0">{response.message}</p>
          )}
        </Alert>
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="agent-button"
        onClick={handleToggle}
        aria-label="Open AI Travel Assistant"
        title="AI Travel Assistant"
      >
        AI
      </button>

      {/* Backdrop */}
      {isOpen && <div className="agent-backdrop" onClick={handleClose}></div>}

      {/* Side Panel */}
      <div className={`agent-panel ${isOpen ? 'agent-panel-open' : ''}`}>
        {/* Header */}
        <div className="agent-panel-header">
          <h5 className="mb-0">AI Travel Assistant</h5>
          <button 
            className="btn-close" 
            onClick={handleClose}
            aria-label="Close"
          ></button>
        </div>

        {/* Body */}
        <div className="agent-panel-body">
          <p className="text-muted">
            Ask me anything about your trip! I can help with itineraries, activities, restaurants, and packing.
          </p>
          
          {/* Input Area */}
          <div className="mb-3">
            <label className="form-label">What do you need help with?</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="e.g., I'm visiting Paris for 3 days with my family. We love museums and good food. Can you suggest an itinerary?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>

          <button 
            className="btn btn-primary w-100 mb-3"
            onClick={handleAsk}
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
              'Ask AI'
            )}
          </button>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="text-center my-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2 text-muted">Generating your travel plan...</p>
            </div>
          )}

          {/* Response */}
          {renderResponse()}
        </div>
      </div>
    </>
  );
}

export default AgentButton;