import React, { useState } from 'react';
import './RejectionReasonPopup.css';

const RejectionReasonPopup = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  userType = 'contractor', 
  userName = '', 
  isLoading = false 
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate rejection reason
    if (!rejectionReason.trim()) {
      setErrors({ rejectionReason: 'Rejection reason is required' });
      return;
    }

    if (rejectionReason.trim().length < 10) {
      setErrors({ rejectionReason: 'Rejection reason must be at least 10 characters long' });
      return;
    }

    setErrors({});
    onSubmit(rejectionReason.trim());
  };

  const handleClose = () => {
    setRejectionReason('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="rejection-popup-overlay">
      <div className="rejection-popup">
        <div className="rejection-popup-header">
          <h3>Reject {userType === 'contractor' ? 'Contractor' : 'Client'}</h3>
          <button 
            className="rejection-popup-close-btn" 
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <div className="rejection-popup-content">
          <p className="rejection-popup-description">
            You are about to reject {userName ? `${userName}'s` : `this ${userType}'s`} profile. 
            Please provide a detailed reason for rejection that will help them understand 
            what needs to be improved.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="rejectionReason">
                Rejection Reason <span className="required">*</span>
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={errors.rejectionReason ? 'error' : ''}
                placeholder="Please provide a detailed reason for rejection..."
                rows={5}
                disabled={isLoading}
                maxLength={500}
              />
              {errors.rejectionReason && (
                <span className="error-message">{errors.rejectionReason}</span>
              )}
              <div className="character-count">
                {rejectionReason.length}/500 characters
              </div>
            </div>
            
            <div className="rejection-popup-actions">
              <button 
                type="button" 
                className="rejection-popup-cancel-btn"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="rejection-popup-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RejectionReasonPopup;