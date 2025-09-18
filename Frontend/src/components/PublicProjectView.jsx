import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Dashboard.css';
import taalosLogo from '../assets/taalos logo.png';

const PublicProjectView = () => {
  const { shareToken } = useParams();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

  const [projectData, setProjectData] = useState(null);
  const [skillsData, setSkillsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjectData();
  }, [shareToken]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/project/share/${shareToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Project not found or sharing not enabled');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Set project data
      setProjectData({
        id: data.id,
        title: data.name || data.title,
        status: data.status,
        createdOn: data.createdAt || data.createdOn,
        startDate: data.startDate,
        endDate: data.endDate,
        assignedContractor: data.assignedContractor || null,
        workModel: data.workModel,
        hourlyRate: data.hourlyRate,
        availability: data.availability,
        location: data.location,
        description: data.description,
        estimatedHours: data.estimatedHours,
        budget: data.budget,
        color: data.color,
        type: data.type,
        tool: data.tool
      });

      // Set skills data
      setSkillsData({
        skillsRequired: data.type || 'Not specified',
        certificationNeeded: data.certificationNeeded || data.certifications || data.certificationNeeds || data.certificationsRequired || 'No specific certifications required',
        softwareTools: data.tool || 'Not specified'
      });

    } catch (error) {
      console.error('Error fetching project data:', error);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="public-project-container">
        <div className="public-project-header">
          <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
          <span className="header-title">taalos</span>
          <div className="header-divider"></div>
          <span className="header-page">Shared Project</span>
        </div>
        <div className="public-project-content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading project data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-project-container">
        <div className="public-project-header">
          <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
          <span className="header-title">taalos</span>
          <div className="header-divider"></div>
          <span className="header-page">Shared Project</span>
        </div>
        <div className="public-project-content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return null;
  }

  return (
    <div className="public-project-container">
      {/* Header */}
      <div className="public-project-header">
        <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
        <span className="header-title">taalos</span>
        <div className="header-divider"></div>
        <span className="header-page">Shared Project</span>
      </div>

      {/* Content */}
      <div className="public-project-content">
        <div className="view-project-container">
          {/* Header Section */}
          <div className="view-project-header">
            <div className="project-title-section">
              <h1>Project <strong>Details</strong></h1>
            </div>
          </div>

          {/* Content Grid */}
          <div className="project-content-grid">
            {/* Left Column - Project Details */}
            <div className="project-details-column">
              <div className="project-info-card">
                <div className="info-row">
                  <span className="info-label">Project Title</span>
                  <span className="info-value">{projectData.title}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status</span>
                  <span className="info-value">
                    <span className="status-badge" style={{
                      backgroundColor: projectData.status?.toLowerCase() === 'active' ? '#d4edda' : 
                                      projectData.status?.toLowerCase() === 'pending' ? '#fff3cd' : 
                                      projectData.status?.toLowerCase() === 'closed' ? '#f8d7da' : '#e2e3e5',
                      color: projectData.status?.toLowerCase() === 'active' ? '#155724' : 
                            projectData.status?.toLowerCase() === 'pending' ? '#856404' : 
                            projectData.status?.toLowerCase() === 'closed' ? '#721c24' : '#495057',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {projectData.status}
                    </span>
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Created On</span>
                  <span className="info-value">{formatDate(projectData.createdOn)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Start Date - End Date</span>
                  <span className="info-value">{formatDate(projectData.startDate)} - {formatDate(projectData.endDate)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Work Model</span>
                  <span className="info-value">{projectData.workModel || 'Not specified'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Rate</span>
                  <span className="info-value">{projectData.hourlyRate || 'Not specified'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Availability Needed</span>
                  <span className="info-value">{projectData.availability || 'Not specified'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Location</span>
                  <span className="info-value">{projectData.location || 'Not specified'}</span>
                </div>
                {projectData.budget && (
                  <div className="info-row">
                    <span className="info-label">Budget</span>
                    <span className="info-value">${projectData.budget}</span>
                  </div>
                )}
                {projectData.estimatedHours && (
                  <div className="info-row">
                    <span className="info-label">Estimated Hours</span>
                    <span className="info-value">{projectData.estimatedHours} hours</span>
                  </div>
                )}
              </div>

              {/* Project Description */}
              <div className="project-description-card">
                <h3>Project Description</h3>
                <div className="description-content">
                  {projectData.description || 'No description provided'}
                </div>
              </div>
            </div>

            {/* Right Column - Skills & Requirements */}
            <div className="project-sidebar-column">
              {/* Skills & Requirements */}
              <div className="skills-requirements-card">
                <h3>Skills & <strong>Requirements</strong></h3>
                {skillsData ? (
                  <div className="skills-section">
                    <div className="skill-row">
                      <span className="skill-label">Skills Required</span>
                      <span className="skill-value">{skillsData.skillsRequired || 'Not specified'}</span>
                    </div>
                    <div className="skill-row">
                      <span className="skill-label">Certification Needed</span>
                      <span className="skill-value">{skillsData.certificationNeeded || 'No specific certifications required'}</span>
                    </div>
                    <div className="skill-row">
                      <span className="skill-label">Software Tools</span>
                      <span className="skill-value">{skillsData.softwareTools || 'Not specified'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="skills-section">
                    <p>Loading skills data...</p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="contact-info-card">
                <h3>Interested?</h3>
                <div className="contact-content">
                  <p>This project is shared publicly for viewing purposes.</p>
                  <p>To apply or get more information, please contact the project owner directly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .public-project-container {
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .public-project-header {
          display: flex;
          align-items: center;
          padding: 1rem 2rem;
          background-color: white;
          border-bottom: 1px solid #e9ecef;
          gap: 1rem;
        }

        .header-logo {
          height: 32px;
          width: auto;
        }

        .header-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #000000;
        }

        .header-divider {
          width: 1px;
          height: 24px;
          background-color: #000000;
        }

        .header-page {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .public-project-content {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .contact-info-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-top: 1.5rem;
        }

        .contact-info-card h3 {
          margin: 0 0 1rem 0;
          color: #000000;
          font-size: 1.1rem;
        }

        .contact-content p {
          margin: 0.5rem 0;
          color: #6c757d;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default PublicProjectView;