import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';

const AssignContractorModal = ({ isOpen, onClose, project, onAssignSuccess }) => {
  const [contractors, setContractors] = useState([]);
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [assignedContractorName, setAssignedContractorName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadContractors();
      setSelectedContractorId('');
      setError(null);
      setSuccess(null);
      setAssignedContractorName('');
    }
  }, [isOpen]);

  const loadContractors = async () => {
    try {
      setLoading(true);
      setError(null);
      const contractorsData = await adminService.getAvailableContractorsForAssignment();
      console.log('Received contractors data:', contractorsData);
      console.log('Number of contractors received:', contractorsData?.length || 0);
      setContractors(contractorsData);
    } catch (error) {
      console.error('Error loading contractors:', error);
      setError('Failed to load available contractors: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignContractor = async () => {
    if (!selectedContractorId) {
      setError('Please select a contractor to assign.');
      return;
    }

    try {
      setAssigning(true);
      setError(null);
      
      // Find the selected contractor's name
      const selectedContractor = contractors.find(c => c.id.toString() === selectedContractorId);
      const contractorName = selectedContractor ? selectedContractor.name : 'the contractor';
      
      const response = await adminService.assignContractorToProject(parseInt(selectedContractorId), project.id);
      
      // Show success message
      setSuccess(`${contractorName} has been successfully assigned to "${project.name}".`);
      setAssignedContractorName(contractorName);
      
      // Call success callback to refresh the project list
      onAssignSuccess();
      
      // Close modal after a brief delay to show success message
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error assigning contractor:', error);
      setError('Failed to assign contractor: ' + error.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedContractorId('');
    setError(null);
    setSuccess(null);
    setAssignedContractorName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '500px',
        border: '1px solid #e9ecef',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        {/* Modal Header */}
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '30px', 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#000000'
        }}>
          Assign to Project
        </h2>

        {/* Project Info */}
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', color: '#000000', marginBottom: '5px' }}>
            Project: {project?.name}
          </h3>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            color: '#000000'
          }}>
            Loading available contractors...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: '12px', 
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        {/* Success State */}
        {success && (
          <div style={{ 
            background: '#d4edda', 
            color: '#155724', 
            padding: '15px', 
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>✅ Assignment Successful!</div>
            <div style={{ fontSize: '14px' }}>{success}</div>
          </div>
        )}

        {/* Contractor Selection */}
        {!loading && !error && !success && (
          <>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontSize: '16px', 
                fontWeight: '500',
                color: '#000000'
              }}>
                Select Contractor
              </label>
              <select
                value={selectedContractorId}
                onChange={(e) => setSelectedContractorId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #000000',
                  borderRadius: '4px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">-- Select Contractor --</option>
                {contractors.map((contractor) => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.name} - {contractor.email}
                    {contractor.jobTitle ? ` (${contractor.jobTitle})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Subtitle */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '30px',
              fontSize: '14px',
              color: '#000000'
            }}>
              Showing contractor list (suggested contractors)
            </div>

            {/* No Contractors Available */}
            {contractors.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                marginBottom: '25px',
                color: '#000000'
              }}>
                No contractors available for assignment.
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px' 
        }}>
          {success ? (
            /* Success state - show only close button */
            <button
              onClick={handleClose}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#28a745',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Close
            </button>
          ) : (
            /* Normal state - show back and assign buttons */
            <>
              <button
                onClick={handleClose}
                disabled={assigning}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #000000',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa',
                  color: '#000000',
                  cursor: assigning ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Back
              </button>
              <button
                onClick={handleAssignContractor}
                disabled={!selectedContractorId || assigning || loading || error}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: selectedContractorId && !assigning && !loading && !error ? '#28a745' : '#6c757d',
                  color: 'white',
                  cursor: selectedContractorId && !assigning && !loading && !error ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                {assigning ? 'Assigning...' : 'Assign Project'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignContractorModal;