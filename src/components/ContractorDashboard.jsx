import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Dashboard.css';
import ContractorDashboardLayout from './ContractorDashboardLayout';
import { debugApiRequest } from '../utils/apiTest';
import streamChatService from '../services/streamChatService';

const ContractorDashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.role === 'Contractor') {
      setUser(currentUser);
      fetchDashboardData();
      loadConversations();
    } else {
      navigate('/unauthorized');
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
      const fullUrl = `${API_BASE_URL}/dashboard/contractor`;

      console.log('Fetching contractor dashboard from:', fullUrl);
      console.log('Using token:', token ? 'Token present' : 'No token');

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

        throw new Error(`API request failed: ${result.error || result.text}`);
      }

      setDashboardData(result.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);

      // Fallback to mock data for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Using fallback mock data due to API error');
        setDashboardData({
          stats: {
            totalProjects: 4,
            activeProjects: 3,
            completedProjects: 1,
            totalHoursLogged: 162
          },
          recentProjects: [
            { id: 1, name: 'Q3 Financial Audit', status: 'Active', workedHours: '36 Hrs', estimatedHours: '40 Hrs', projectType: 'Audit', actualHoursWorked: null },
            { id: 2, name: 'Year-End Tax Review', status: 'Closed', workedHours: '30 Hrs', estimatedHours: '30 Hrs', projectType: 'Tax Services', actualHoursWorked: 28 },
            { id: 3, name: 'Database Migration', status: 'Closed', workedHours: '50 Hrs', estimatedHours: '45 Hrs', projectType: 'Development', actualHoursWorked: 45 },
            { id: 4, name: 'System Integration', status: 'Pending', workedHours: '0 Hrs', estimatedHours: '20 Hrs', projectType: 'Integration', actualHoursWorked: null }
          ],
          recentInvoices: [
            { id: 1, name: 'Q3 Financial Audit', status: 'Approved', amount: '$5000', color: '#4EC1EF' },
            { id: 2, name: 'IPO Readiness', status: 'Pending', amount: '$6000', color: '#9013FE' }
          ],
          profileInfo: {
            name: user ? `${user.firstName} ${user.lastName}` : 'John Contractor',
            status: 'Active',
            availability: '30 Hrs/Week',
            rating: 4.8,
            reviewCount: 25,
            jobTitle: 'Senior Financial Analyst',
            isVerified: true
          }
        });
        setError(null); // Clear error when using fallback
      }
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const hiringClients = await streamChatService.getContacts();
      setConversations(hiringClients.slice(0, 4)); // Show only first 4 conversations
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Fallback to empty array if loading fails
      setConversations([]);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#4EC1EF', '#4EC1EF', '#FF6B6B', '#4ECDC4', '#45B7D1',
      '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

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
  const handleStatCardClick = (statType) => {
    switch (statType) {
      case 'Total Projects':
      case 'Active Projects':
      case 'Completed Projects':
        navigate('/contractor-projects');
        break;
      case 'Total Hours Logged':
        navigate('/contractor-invoices');
        break;
      default:
        break;
    }
  };

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner">
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="error-message">
          <h3>Error loading dashboard data</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Retry
          </button>
        </div>
      );
    }

    if (!dashboardData) {
      return <div className="loading">No data available</div>;
    }

    return (
      <>
        {/* Contractor Header */}
        <div className="contractor-dashboard-header">
          <div className="contractor-welcome">
            <h1>Welcome Back,<span className="contractor-dashboard-name">{dashboardData.profileInfo.name}!</span> <span className="contractor-dashboard-status">{dashboardData.profileInfo.status}</span>
            </h1>
            <div className="availability-info">
              <h3>Availability:</h3> {dashboardData.profileInfo.availability}
            </div>
          </div>
          <button
            className="edit-profile-btn"
            onClick={() => navigate('/contractor-edit-profile')}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="13" cy="13" r="12.5" stroke="white" />
              <path
                d="M15.6278 11.2847L9.04603 17.8664L7.96457 16.785L14.5463 10.2032L8.74538 10.2032L8.74538 8.67405H17.157V17.0856L15.6278 17.0856L15.6278 11.2847Z"
                fill="white"
              />
            </svg>
            Edit Profile
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card all-projects" style={{ cursor: 'pointer' }} onClick={() => handleStatCardClick('Total Projects')}>
            <div className="stat-content">
              <h3>Total Projects</h3>
              <div className="stat-number">{dashboardData.stats.totalProjects}</div>
            </div>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleStatCardClick('Active Projects')}>
            <div className="stat-content">
              <h3>Active Projects</h3>
              <div className="stat-number">{dashboardData.stats.activeProjects}</div>
            </div>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleStatCardClick('Completed Projects')}>
            <div className="stat-content">
              <h3>Completed Projects</h3>
              <div className="stat-number">{dashboardData.stats.completedProjects}</div>
            </div>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleStatCardClick('Total Hours Logged')}>
            <div className="stat-content">
              <h3>Total Hours Logged</h3>
              <div className="stat-number">{dashboardData.stats.totalHoursLogged}<span className="stat-unit">Hrs</span></div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="content-sections">
          <div className="content-section">
            <div className="section-header">
              <h2>Invoices</h2>
              <button className="new-btn" onClick={() => navigate('/contractor-invoices')}>View All</button>
            </div>
            <div className="projects-list">
              {dashboardData.recentInvoices && dashboardData.recentInvoices.length > 0 ? (
                dashboardData.recentInvoices.map(invoice => (
                  <div key={invoice.id} className="project-item">
                    <div className="project-info">
                      <div className="project-name" style={{ textAlign: 'left' }}>{invoice.name}</div>
                      <div className="project-meta">
                        <span
                          // @final status badge class added with getStatusColor function call.
                          className="project-status"
                          style={getStatusColor(invoice.status, {
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          })}
                        >
                          {invoice.status}
                        </span>
                        <span className="project-amount">{invoice.amount}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No invoices available</div>
              )}
            </div>
          </div>

          <div className="content-section">
            <div className="section-header">
              <h2>Projects</h2>
              <button className="new-btn" onClick={() => navigate('/contractor-projects')}>View All</button>
            </div>
            <div className="projects-table">
              {dashboardData.recentProjects && dashboardData.recentProjects.length > 0 ? (
                <>
                  {/* Table Header */}
                  <div className="projects-table-header">
                    <div className="project-column-header">Project Name & Status</div>
                    <div className="project-type-header">Project Type</div>
                    <div className="hours-worked-header">Actual Hours Worked</div>
                  </div>

                  {/* Table Rows */}
                  {dashboardData.recentProjects.map(project => (
                    <div key={project.id} className="project-table-row">
                      <div className="project-name-status-column">
                        <div className="project-name">{project.name}</div>
                        <span
                          // @final status badge class added with getStatusColor function call.
                          className="status-badge"
                          style={getStatusColor(project.status, {
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            marginTop: '4px',
                            display: 'inline-block',
                            width: 'auto'
                          })}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="project-type-column">
                        <span className="project-type">{project.projectType || 'N/A'}</span>
                      </div>
                      <div className="hours-worked-column">
                        <span className="hours-worked">
                          {project.status?.toLowerCase() === 'closed' ?
                            (project.actualHoursWorked ? `${project.actualHoursWorked} Hrs` : '0 Hrs') :
                            '-'
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="no-data">No projects available</div>
              )}
            </div>
          </div>

          <div className="content-section">
            <div className="section-header">
              <h2>Messages</h2>
              <button className="new-btn" onClick={() => navigate('/contractor-messages')}><svg width="20" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.0615 1.92236C16.5461 1.92243 17.0108 2.11496 17.3535 2.45752L21.543 6.646C21.7128 6.81576 21.8475 7.0179 21.9395 7.23975C22.0313 7.46148 22.0791 7.69895 22.0791 7.93896C22.0791 8.1791 22.0314 8.41731 21.9395 8.63916C21.8475 8.86091 21.7127 9.06223 21.543 9.23193L11.6855 19.0923L11.6055 19.1724H20.25C20.5359 19.1724 20.8105 19.2856 21.0127 19.4878C21.2148 19.69 21.3281 19.9646 21.3281 20.2505C21.328 20.5361 21.2146 20.8101 21.0127 21.0122C20.8105 21.2144 20.5359 21.3286 20.25 21.3286H4.5C4.01515 21.3286 3.54987 21.1353 3.20703 20.7925C2.86447 20.4498 2.67198 19.9851 2.67188 19.5005V15.3101C2.67125 15.0701 2.71869 14.8325 2.81055 14.6108C2.90244 14.3891 3.03683 14.1873 3.20703 14.0181H3.20801L14.7686 2.45752C15.1114 2.1148 15.5768 1.92236 16.0615 1.92236ZM4.82812 15.4497V19.1724H8.55078L16.4727 11.2505L12.75 7.52783L4.82812 15.4497ZM14.2773 6.00049L17.9668 9.68994L18 9.72217L18.0332 9.68994L19.7861 7.93701L16.0635 4.21436L14.2773 6.00049Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="0.09375" />
              </svg>
              </button>
            </div>
            <div className="messages-list">
              {conversations.length > 0 ? conversations.map(contact => (
                <div key={contact.id} className="message-item">
                  <div className="message-left">
                    <div
                      className="message-avatar"
                      style={{
                        backgroundColor: getAvatarColor(contact.name),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.8rem'
                      }}
                    >
                      {getInitials(contact.name)}
                    </div>
                    <div className="message-content">
                      <div className="message-sender">{contact.name}</div>
                      <div className="message-text">{contact.lastMessage || 'No messages yet'}</div>
                    </div>
                  </div>
                  <div className="message-right">
                    <div className="message-time">{contact.time || 'Now'}</div>
                  </div>
                  {contact.unread > 0 && <div className="message-badge">{contact.unread}</div>}
                </div>
              )) : (
                <div className="no-data">No conversations available</div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <ContractorDashboardLayout>
      <div className="dashboard-content">
        {renderDashboardContent()}
      </div>
    </ContractorDashboardLayout>
  );
};

export default ContractorDashboard;