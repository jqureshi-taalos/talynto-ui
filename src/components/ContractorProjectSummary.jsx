import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ContractorProjectSummary.css';
import ContractorDashboardLayout from './ContractorDashboardLayout';
import authService from '../services/authService';
import { debugApiRequest } from '../utils/apiTest';
import BackLinkIcon from './BackLinkIcon'
const ContractorProjectSummary = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);
  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = authService.getToken();
      if (!token) {
        setError('No authentication token found');
        return;
      }
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
      const fullUrl = `${API_BASE_URL}/dashboard/contractor/project/${projectId}`;
      console.log('Fetching project details from:', fullUrl);
      const result = await debugApiRequest(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!result.success) {
        if (result.status === 401) {
          authService.logout();
          navigate('/login');
          return;
        }
        if (result.status === 404) {
          setError('Project not found or access denied');
          return;
        }
        throw new Error(`API request failed: ${result.error || result.text}`);
      }
      console.log('@Rs issue (result.data) ===>', result.data)
      setProjectData(result.data);
    } catch (error) {
      console.error('Error fetching project data:', error);
      setError(error.message);
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Using fallback mock data due to API error');
        setProjectData({
          name: 'Q3 Financial Audit',
          status: 'Active',
          client: {
            name: 'David White',
            avatar: 'DW'
          },
          startDate: '22/5/2025',
          endDate: '28/5/2025',
          workModel: 'REMOTE',
          location: 'US Based',
          hourlyRate: '$80/Hr',
          projectType: 'BI DEVELOPMENT',
          color: '#4EC1EF',
          description: 'We\'re preparing for our upcoming Q3 financial audit and need support with pre-audit documentation and reconciliation tasks. The contractor will assist in preparing audit schedules, gathering supporting documents, and working closely with our internal accounting team. Familiarity with SOX compliance and internal control frameworks is required. Experience using QuickBooks, NetSuite, or Workiva will be considered a strong asset.',
          expertiseRequired: ['TAX', 'SOX'],
          certificationNeeded: ['CPA', 'CFA'],
          softwareTools: ['QuickBooks', 'Xero']
        });
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    navigate('/contractor-projects');
  };
  const handleChatWithClient = () => {
    // Navigate to contractor messages page with specific client chat opened
    const clientId = projectData?.clientId || projectData?.client?.id;
    if (clientId) {
      navigate('/contractor-messages', { state: { openChatWithClient: clientId } });
    } else {
      navigate('/contractor-messages');
    }
  };
  const handleSubmitInvoice = () => {
    // Convert date format from DD/MM/YYYY to YYYY-MM-DD for HTML date inputs
    const formatDateForInput = (dateStr) => {
      if (!dateStr) return '';
      const parts = dateStr.split('/');
      if (parts.length !== 3) return '';
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    // Pass project data to the submit invoice page
    navigate('/contractor/submit-invoice', {
      state: {
        prePopulateData: {
          projectId: projectId,
          projectName: projectData.name,
          ratePerHour: projectData.hourlyRate?.replace('$', '').replace('/Hr', '') || '',
          startDate: formatDateForInput(projectData.startDate),
          endDate: formatDateForInput(projectData.endDate)
        }
      }
    });
  };

  // @final getStatusColor function added and remove existing badge functions
  const getStatusColor = (status, styles = {}) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          ...styles,
          backgroundColor: '#FFF8D8',
          color: '#DDB70B'
        };
      case 'accepted':
        return {
          ...styles,
          backgroundColor: '#E2FFD8',
          color: '#5DBD39'
        };
      case 'rejected':
        return {
          ...styles,
          backgroundColor: '#FFE0DE',
          color: '#D72E20'
        };
      case 'paid':
        return {
          ...styles,
          backgroundColor: '#E6E5FF',
          color: '#2320D7'
        };
      case 'active':
        return {
          ...styles,
          backgroundColor: '#E2FFD8',
          color: '#5DBD39'
        };
      default:
        return {
          ...styles,
          backgroundColor: '#FFE0DE',
          color: '#D72E20'
        };
    }
  };

  const renderBadges = (items) => {
    if (!items || items.length === 0) return (
      <span className="requirement-badge no-data">No data available</span>
    );
    return items.map((item, index) => (
      <span key={index} className="requirement-badge">
        {item}
      </span>
    ));
  };
  if (loading) {
    return (
      <ContractorDashboardLayout>
        <div className="project-summary-container">
          <div className="loading">Loading project details...</div>
        </div>
      </ContractorDashboardLayout>
    );
  }
  if (error) {
    return (
      <ContractorDashboardLayout>
        <div className="project-summary-container">
          <div className="error-message">
            <h3>Error loading project details</h3>
            <p>{error}</p>
            <button onClick={fetchProjectData} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </ContractorDashboardLayout>
    );
  }
  if (!projectData) {
    return (
      <ContractorDashboardLayout>
        <div className="project-summary-container">
          <div className="error-message">
            <h3>Project not found</h3>
            <p>The requested project could not be found or you don't have access to it.</p>
            <button onClick={handleBack} className="retry-btn">
              Back to Projects
            </button>
          </div>
        </div>
      </ContractorDashboardLayout>
    );
  }
  return (
    <ContractorDashboardLayout>
      <div className="project-summary-page">
        {/* Header Section */}
        <div className="project-summary-header">
          <h1>Project <span className="header-bold">Summary</span></h1>
          <div className="header-actions">
            <button className="back-link" onClick={handleBack}>
              <BackLinkIcon /> Back
            </button>
            {projectData.status?.toLowerCase() !== 'closed' && (
              <>
                <button className="chat-btn" onClick={handleChatWithClient}>
                  Chat with Client
                </button>
                {projectData.status?.toLowerCase() === 'active' && (
                  <button className="submit-invoice-btn" onClick={handleSubmitInvoice}>
                    Submit Invoice
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {/* Main Content Card */}
        <div className="project-summary-card">
          <div className="project-summary-content">
            {/* Left Column - Project Details */}
            <div className="project-details-column">
              <div className="project-name-section">
                <div className="project-name-label">Project Name</div>
                <div className="project-name-with-status">
                  <h2 className="project-name">{projectData.name}</h2>
                  <span
                    className='status-badge'
                    style={getStatusColor(projectData.status)}
                  >
                    {projectData.status}
                  </span>
                </div>
              </div>
              <div className="project-info-list">
                <div className="info-row">
                  <span className="info-label">Start Date:</span>
                  <span className="info-value">{projectData.startDate}</span>
                </div>
                {projectData.status?.toLowerCase() === 'closed' && (
                  <div className="info-row">
                    <span className="info-label">End Date:</span>
                    <span className="info-value">{projectData.endDate}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Work Model:</span>
                  <span className="info-value">{projectData.workModel}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{projectData.location}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Hourly Rate:</span>
                  <span className="info-value">{projectData.hourlyRate}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Project Type:</span>
                  <span className="info-value">{projectData.projectType || 'BI DEVELOPMENT'}</span>
                </div>
              </div>
              <div className="client-profile-section">
                <div className="client-label">Client Profile:</div>
                <div className="client-profile">
                  <div className="client-avatar">{projectData.client?.avatar || 'N/A'}</div>
                  <span className="client-name">{projectData.client?.name || 'Unknown Client'}</span>
                </div>
              </div>
            </div>
            {/* Right Column - Description & Requirements */}
            <div className="project-requirements-column">
              {/* Project Description */}
              {projectData.description && (
                <div className="project-description-section">
                  <h3 className="section-title">Project Description</h3>
                  <p className="project-description">{projectData.description}</p>
                </div>
              )}
              {/* Requirements Section */}
              <div className="requirements-section">
                <h3 className="section-title">Requirements & Expectations</h3>
                <div className="requirement-row">
                  <span className="requirement-label">Expertise Required:</span>
                  <div className="requirement-badges">
                    {renderBadges(projectData.expertiseRequired)}
                  </div>
                </div>
                <div className="requirement-row">
                  <span className="requirement-label">Certification Needed:</span>
                  <div className="requirement-badges">
                    {renderBadges(projectData.certificationNeeded)}
                  </div>
                </div>
                <div className="requirement-row">
                  <span className="requirement-label">Software Tools:</span>
                  <div className="requirement-badges">
                    {renderBadges(projectData.softwareTools)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContractorDashboardLayout>
  );
};
export default ContractorProjectSummary;