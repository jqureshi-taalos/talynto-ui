import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import notificationService from '../services/notificationService';
import './Dashboard.css';

const AssignProjectPopup = ({ isOpen, onClose, contractorId, onAssignSuccess }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

  useEffect(() => {
    if (isOpen) {
      fetchAvailableProjects();
    }
  }, [isOpen]);

  const fetchAvailableProjects = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      if (!token) {
        authService.logout();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/project/available-for-assignment`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        setError('Failed to fetch available projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleAssignProject = async () => {
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }

    try {
      setIsAssigning(true);
      setError('');
      const token = authService.getToken();
      if (!token) {
        authService.logout();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/project/assign-contractor-to-project`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contractorId: contractorId,
          projectId: selectedProject
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Get project and contractor names for notification
        const selectedProjectData = projects.find(p => p.id === parseInt(selectedProject));
        const projectName = selectedProjectData?.name || 'Unknown Project';
        
        onAssignSuccess(result.message || 'Contractor assigned to project successfully');
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to assign contractor to project');
      }
    } catch (error) {
      console.error('Error assigning contractor:', error);
      setError('Error assigning contractor to project');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedProject('');
    setError('');
    onClose();
  };

  const selectedProjectData = projects.find(p => p.id === parseInt(selectedProject));

  if (!isOpen) return null;

  return (
    <div className="assign-project-popup-overlay">
      <div className="assign-project-popup">
        <div className="popup-header">
          <h2>Assign To Project</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="popup-content">
          {loading ? (
            <div className="loading-message">Loading available projects...</div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="projectSelect">Select Project:</label>
                <select
                  id="projectSelect"
                  value={selectedProject}
                  onChange={handleProjectSelect}
                  className="project-select"
                >
                  <option value="">Select project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProjectData && (
                <div className="project-description">
                  <h3>Project Description:</h3>
                  <p>{selectedProjectData.description || 'No description available'}</p>
                  <div className="project-details">
                    <p><strong>Estimated Hours:</strong> {selectedProjectData.estimatedHours} hours</p>
                    {selectedProjectData.budget && (
                      <p><strong>Budget:</strong> ${selectedProjectData.budget}</p>
                    )}
                    {selectedProjectData.hourlyRate && (
                      <p><strong>Hourly Rate:</strong> ${selectedProjectData.hourlyRate}</p>
                    )}
                  </div>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
            </>
          )}
        </div>

        <div className="popup-footer">
          <button className="cancel-button" onClick={handleClose}>
            Back
          </button>
          <button 
            className="assign-button" 
            onClick={handleAssignProject}
            disabled={!selectedProject || isAssigning || loading}
          >
            {isAssigning ? 'Assigning...' : 'Assign Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignProjectPopup;