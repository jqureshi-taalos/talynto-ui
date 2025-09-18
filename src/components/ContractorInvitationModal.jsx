import React, { useState } from 'react';
import authService from '../services/authService';
import { getAvatarUrl } from '../utils/avatarUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

const ContractorInvitationModal = ({ isOpen, onClose, invitation, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
  const [descOpen, setDescOpen] = useState(true);

  if (!isOpen || !invitation) return null;

  const project = invitation.project || {};
  const client = invitation.client || {};

  const updateInvitationStatus = async (action) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!acceptDisclaimer && action === 'accept') {
        setError('Please accept the disclaimer to proceed');
        setLoading(false);
        return;
      }
      
      const token = authService.getToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/project/invitations/${invitation.id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ action })
      });
      
      if (res.status === 401) { 
        authService.logout(); 
        setError('Authentication failed');
        return; 
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = 'Failed to update invitation status';
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          switch (res.status) {
            case 400:
              errorMessage = 'Invalid request. Please try again.';
              break;
            case 403:
              errorMessage = 'You do not have permission to perform this action.';
              break;
            case 404:
              errorMessage = 'Invitation not found.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = 'Failed to update invitation status.';
          }
        }
        
        throw new Error(errorMessage);
      }
      
      onStatusUpdate && onStatusUpdate();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getClientName = (clientId) => {
    const names = ['David White', 'Shawn Brown', 'John Smith', 'Sarah Johnson'];
    return names[clientId % names.length] || `Client ${clientId}`;
  };

  const formatId = (id) => {
    if (!id && id !== 0) return '#0001';
    return `#${String(id).padStart(4, '0')}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999
      }} onClick={onClose} />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '0',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1000
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8f9fa'
        }}>
          <h2 style={{ 
            margin: 0,
            fontSize: '24px',
            fontWeight: '400',
            color: '#212529'
          }}>
            Job <strong>Request</strong>
          </h2>
          <div style={{ 
            fontSize: '14px',
            color: '#6c757d'
          }}>
            <span>Project ID</span>
            <span style={{ 
              marginLeft: '8px',
              color: '#adb5bd',
              fontWeight: '500'
            }}>
              {formatId(project.id)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{
          padding: '24px',
          overflow: 'auto',
          maxHeight: 'calc(90vh - 200px)'
        }}>
          {/* Client Info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '24px'
          }}>
            <img
              src={getAvatarUrl({ name: getClientName(project.clientId || 1) }, 48)}
              alt="Client"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#212529'
            }}>
              {getClientName(project.clientId || 1)}
            </span>
          </div>

          {/* Project Info Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '12px 16px',
              borderRadius: '4px'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#6c757d',
                marginBottom: '4px',
                fontWeight: '600'
              }}>
                Project Type
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#495057',
                fontWeight: '500'
              }}>
                {project.projectType || project.type || 'BI DEVELOPMENT'}
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '12px 16px',
              borderRadius: '4px'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#6c757d',
                marginBottom: '4px',
                fontWeight: '600'
              }}>
                Hourly Rate
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#495057',
                fontWeight: '500'
              }}>
                ${project.hourlyRate || '100'}/HR
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '12px 16px',
              borderRadius: '4px'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#6c757d',
                marginBottom: '4px',
                fontWeight: '600'
              }}>
                Project Title
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#495057',
                fontWeight: '500'
              }}>
                {project.name || 'Q3 FINANCIAL AUDIT'}
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '12px 16px',
              borderRadius: '4px'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#6c757d',
                marginBottom: '4px',
                fontWeight: '600'
              }}>
                Date
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#495057',
                fontWeight: '500'
              }}>
                {formatDate(project.startDate)} - {formatDate(project.endDate) || '19 JULY'}
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div style={{ 
            borderRadius: '4px', 
            overflow: 'hidden', 
            marginBottom: '24px'
          }}>
            <button
              onClick={() => setDescOpen(!descOpen)}
              style={{ 
                width: '100%', 
                textAlign: 'left', 
                background: '#5bc0de', 
                color: '#fff', 
                padding: '12px 16px', 
                border: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}
            >
              <span>PROJECT DESCRIPTION</span>
              <span style={{ 
                transform: descOpen ? 'rotate(180deg)' : 'none', 
                transition: 'transform 0.2s',
                fontSize: '12px'
              }}>
                ▼
              </span>
            </button>
            {descOpen && (
              <div style={{ 
                background: '#fff', 
                padding: '16px', 
                color: '#495057',
                fontSize: '14px',
                lineHeight: '1.5',
                border: '1px solid #dee2e6',
                borderTop: 'none'
              }}>
                {project.description || 'Project description will be provided here with all the necessary details about the scope, requirements, and deliverables for this project.'}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#212529',
              marginBottom: '12px'
            }}>
              Disclaimer
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              lineHeight: '1.5',
              marginBottom: '16px'
            }}>
              By inviting a contractor/freelancer, you acknowledge that this platform serves only as a facilitator and does not guarantee the contractor's performance, deliverables, or compliance. All agreements, negotiations, and outcomes are the responsibility of the client and the contractor.
            </p>
          </div>

          {/* Acknowledgement */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#212529',
              marginBottom: '12px'
            }}>
              Acknowledgement
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              lineHeight: '1.5',
              marginBottom: '16px'
            }}>
              I understand that by proceeding, I am initiating a project invitation and that the contractor/freelancer may choose to accept or decline. I confirm that I have reviewed the project details and accept responsibility for the accuracy of the information shared.
            </p>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#495057'
            }}>
              <input 
                type="checkbox" 
                checked={acceptDisclaimer} 
                onChange={(e) => setAcceptDisclaimer(e.target.checked)}
                style={{ 
                  margin: 0,
                  transform: 'scale(1.1)'
                }}
              />
              Accept The Disclaimer
            </label>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: '#f8f9fa'
        }}>
          <button
            onClick={() => updateInvitationStatus('reject')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#6c757d',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1
            }}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Reject'}
          </button>
          <button
            onClick={() => updateInvitationStatus('accept')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#5bc0de',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: (loading || !acceptDisclaimer) ? 0.6 : 1
            }}
            disabled={loading || !acceptDisclaimer}
          >
            {loading ? 'Processing...' : 'Accept Invite'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ContractorInvitationModal;