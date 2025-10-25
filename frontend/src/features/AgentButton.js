import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

function AgentButton() {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  // Toggle modal visibility
  const handleOpen = () => setShow(true);
  const handleClose = () => setShow(false);

  // Simulate AI response (replace with actual API call if needed)
  const handleAsk = async () => {
    if (!query.trim()) return;
    // Simulated response
    setResponse(`Great question! Here's what I suggest for: "${query}"`);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="btn btn-danger rounded-circle position-fixed"
        style={{ bottom: '30px', right: '30px', width: '60px', height: '60px', zIndex: 1000 }}
        onClick={handleOpen}
        aria-label="Open AI assistant"
      >
        🤖
      </button>

      {/* Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ask Agent AI</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label htmlFor="queryInput" className="form-label">What do you need help with?</label>
          <input
            type="text"
            id="queryInput"
            className="form-control mb-3"
            placeholder="e.g. Best places in Paris"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="primary" onClick={handleAsk} className="w-100">
            Ask
          </Button>
          {response && (
            <div className="mt-3 alert alert-info" role="alert">
              {response}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AgentButton;