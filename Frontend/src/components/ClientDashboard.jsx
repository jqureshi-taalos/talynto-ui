import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { getAvatarUrl } from '../utils/avatarUtils';
import ProfileAvatar from './ProfileAvatar';
import messageNotificationService from '../services/messageNotificationService';
import HiredContractorsPopup from './HiredContractorsPopup';
import TaalosRecommendationsPopup from './TaalosRecommendationsPopup';
import DashboardIcon from './DashboardIcon';
import ProjectsIcon from './ProjectsIcon';
import taalosLogo from '../assets/taalos logo.png';
import InvoicesIcon from './InvoicesIcon';
import NotificationsIcon from './NotificationsIcon';
import ProfileSettingsIcon from './ProfileSettingsIcon';
import LogoutIcon from './LogoutIcon';
import FindTalentIcon from './FindTalentIcon';
import HeaderNotificationIcon from './HeaderNotificationIcon'
import MessagesIcon from './MessagesIcon';
import NeedHelpIcon from './NeedHelpIcon'
import './Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

const ClientDashboard = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState({
    stats: { allProjects: 0, activeProjects: 0, pendingProjects: 0, closedProjects: 0 },
    projects: [],
    shortlistedTalent: [],
    matchedContractors: []
  });
  const [pendingProjectContractors, setPendingProjectContractors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showHiredContractorsPopup, setShowHiredContractorsPopup] = useState(false);
  const [showTaalosRecommendationsPopup, setShowTaalosRecommendationsPopup] = useState(false);
  const [showMessageNotification, setShowMessageNotification] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    console.log('Current user in ClientDashboard:', currentUser);
    console.log('User role:', currentUser?.role);

    if (currentUser && currentUser.role && currentUser.role.toLowerCase() === 'client') {
      setUser(currentUser);
      fetchDashboardData();
    } else {
      console.log('Redirecting to unauthorized - User role does not match Client');
      navigate('/unauthorized');
    }
  }, [navigate]);

  // Add effect to refresh user data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.role && currentUser.role.toLowerCase() === 'client') {
          setUser(currentUser);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/client`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DEBUG - Dashboard data:', data);
        console.log('🔍 DEBUG - Matched contractors:', data.matchedContractors);
        console.log('🔍 DEBUG - Shortlisted talent (hired contractors):', data.shortlistedTalent);
        console.log('🔍 DEBUG - Recent projects:', data.recentProjects);

        setDashboardData({
          stats: data.stats,
          projects: data.recentProjects,
          shortlistedTalent: data.shortlistedTalent,
          matchedContractors: data.matchedContractors
        });

        // Fetch contractors for pending projects
        await fetchPendingProjectContractors();
      } else if (response.status === 401) {
        authService.logout();
        navigate('/login');
      } else {
        console.error('Failed to fetch dashboard data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProjectContractors = async () => {
    try {
      const token = authService.getToken();

      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/client/pending-projects-contractors?contractorsPerProject=3`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DEBUG - Pending project contractors data:', data);
        setPendingProjectContractors(data);
      } else {
        console.error('Failed to fetch pending project contractors');
      }
    } catch (error) {
      console.error('Error fetching pending project contractors:', error);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleAddNewProject = () => {
    navigate('/create-project');
  };

  const handleViewProfile = (contractorId) => {
    navigate(`/client-wishlist-view-profile/${contractorId}`, { state: { from: 'dashboard' } });
  };

  const handleMessage = () => {
    navigate('/messages');
  };

  const handleStatCardClick = (statType) => {
    switch (statType) {
      case 'All Projects':
        navigate('/projects');
        break;
      case 'Active Projects':
        navigate('/projects', { state: { tab: 'active' } });
        break;
      case 'Pending Projects':
        navigate('/projects', { state: { tab: 'pending' } });
        break;
      case 'Closed Projects':
        navigate('/projects', { state: { tab: 'closed' } });
        break;
      default:
        break;
    }
  };

  const handleShowHiredContractorsPopup = () => {
    setShowHiredContractorsPopup(true);
  };

  const handleCloseHiredContractorsPopup = () => {
    setShowHiredContractorsPopup(false);
  };

  const handleShowTaalosRecommendationsPopup = () => {
    setShowTaalosRecommendationsPopup(true);
  };

  const handleCloseTaalosRecommendationsPopup = () => {
    setShowTaalosRecommendationsPopup(false);
  };

  // Initialize message notifications
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.role && currentUser.role.toLowerCase() === 'client') {
      // Start message notification service
      messageNotificationService.startListening();

      // Add listener for message events
      const removeListener = messageNotificationService.addListener((eventType, data) => {
        if (eventType === 'unreadCountChanged') {
          setUnreadMessageCount(data.count);
        } else if (eventType === 'newMessage') {
          // Show brief notification animation for new messages
          setShowMessageNotification(true);
          setTimeout(() => setShowMessageNotification(false), 3000);
        }
      });

      // Get initial unread count
      setUnreadMessageCount(messageNotificationService.getUnreadCount());

      return () => {
        removeListener();
        messageNotificationService.stopListening();
      };
    }
  }, [user]);


  const getStatusColor = (status) => {
    const styles = {
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.8rem',
      fontWeight: '500'
    }
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

  const menuItems = [
    { id: '', icon: <DashboardIcon />, label: 'Dashboard', path: '/dashboard' },
    { id: 'projects', icon: <ProjectsIcon />, label: 'My Projects', path: '/projects' },
    { id: 'talent', icon: <FindTalentIcon />, label: 'Find Talent', path: '/talent' },
    { id: 'invoices', icon: <InvoicesIcon />, label: 'Invoice Requests', path: '/invoices' },
    { id: 'messages', icon: <MessagesIcon />, label: 'Messages', path: '/messages' },
    { id: 'settings', icon: <ProfileSettingsIcon />, label: 'Profile Settings', path: '/settings' },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notifications', path: '/notifications' }
  ];

  const renderDashboardContent = () => {
    return (
      <>
        <h1 className="welcome-title">Welcome In, <span className="client-name">{user.firstName} {user.lastName || ''}</span></h1>

        <div className="stats-grid">
          <div className="stat-card all-projects" style={{ cursor: 'pointer' }} onClick={() => handleStatCardClick('All Projects')}>
            <div className="stat-content">
              <h3>All Projects</h3>
              <div className="stat-number">{dashboardData.stats.allProjects}</div>
            </div>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleStatCardClick('Active Projects')}>
            <div className="stat-content">
              <h3>Active Projects</h3>
              <div className="stat-number">{dashboardData.stats.activeProjects}</div>
            </div>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleStatCardClick('Pending Projects')}>
            <div className="stat-content">
              <h3>Pending Projects</h3>
              <div className="stat-number">{dashboardData.stats.pendingProjects}</div>
            </div>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleStatCardClick('Closed Projects')}>
            <div className="stat-content">
              <h3>Closed Projects</h3>
              <div className="stat-number">{dashboardData.stats.closedProjects}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-three-cards client-dashboard">
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Hired Contractors</h2>
              <button className="view-all-btn" onClick={handleShowHiredContractorsPopup}>View All</button>
            </div>
            <div className="card-content">
              {dashboardData.shortlistedTalent.map(person => {
                console.log('🔍 DEBUG - Hired contractor person object:', person);
                console.log('🔍 DEBUG - ProfilePictureData:', person.ProfilePictureData);
                console.log('🔍 DEBUG - profilePictureData:', person.profilePictureData);
                const avatarUrl = getAvatarUrl(person, 50);
                console.log('🔍 DEBUG - Generated avatar URL:', avatarUrl);
                return (
                  <div key={person.id} className="hired-contractor-card">
                    <div className="contractor-info c-contractor-info">
                      <div className='c-contractor-row'>
                        <div className='c-contractor-details'>
                          <div className="contractor-avatar">
                            <img
                              src={avatarUrl}
                              alt={person.name}
                              className="profile-avatar"
                              onLoad={(e) => {
                                console.log(`🔍 DEBUG - Profile picture loaded successfully for ${person.name} from: ${e.target.src}`);
                              }}
                              onError={(e) => {
                                console.log(`🔍 DEBUG - Profile picture failed to load for ${person.name} from: ${e.target.src}`);
                                // Fallback to UI Avatars if database image fails
                                const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=50&background=random&color=fff&bold=true&format=svg`;
                                if (e.target.src !== fallbackUrl) {
                                  console.log(`🔍 DEBUG - Falling back to generated avatar: ${fallbackUrl}`);
                                  e.target.src = fallbackUrl;
                                }
                              }}
                            />
                          </div>
                          <div>
                            <div className="contractor-name">{person.name}</div>
                            <div className="contractor-actions">
                              <button
                                className="action-btn view-profile"
                                onClick={() => handleViewProfile(person.id)}
                              >
                                View Profile
                              </button>
                              <span className="action-separator">|</span>
                              <button
                                className="action-btn message"
                                onClick={handleMessage}
                              >
                                Message
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="contractor-tags">
                          <span className="tag">{person.qualifications ? person.qualifications.split(',')[0].trim() : 'CPA'}</span>
                          <span className="tag">{person.skills ? person.skills.split(',')[0].trim() : 'QuickBooks'}</span>
                          <span className="tag">{person.workModel || 'Remote'}</span>
                          <span className="tag">{person.availability ? `${person.availability} Hours/week` : '20 Hours/week'}</span>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>Projects</h2>
              <button className="new-btn" onClick={handleAddNewProject}>+ New</button>
            </div>
            <div className="card-content">
              <div className="dashboard-projects-table">
                <div className="projects-table">
                  <div className="table-header">
                    <div className="header-cell project-name-header">Project</div>
                    <div className="header-cell">Project Type</div>
                    <div className="header-cell">Actual Hours Worked</div>
                  </div>
                  {dashboardData.projects.map(project => (
                    <div key={project.id} className="table-row">
                      <div className="table-cell project-name-cell">
                        <div className="project-name">{project.name}</div>
                        <div
                          className="status-badge"
                          style={getStatusColor(project.status?.toLowerCase())}
                        >
                          {project.status || 'Active'}
                        </div>
                      </div>
                      <div className="table-cell project-type-cell">
                        {project.type || 'BI Development'}
                      </div>
                      <div className="table-cell project-hours-cell">
                        {project.status?.toLowerCase() === 'pending' ? '-' : (project.hours || '-')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>Taalos Recommendation</h2>
              <button className="view-all-btn" onClick={handleShowTaalosRecommendationsPopup}>View All</button>
            </div>
            <div className="card-content">
              {/* Show matched contractors from both sources */}
              {(() => {
                // Combine contractors from both sources
                const allContractors = [];

                // Add contractors from general matching
                if (dashboardData.matchedContractors && dashboardData.matchedContractors.length > 0) {
                  allContractors.push(...dashboardData.matchedContractors);
                }

                // Add contractors from project-specific matching
                if (Object.keys(pendingProjectContractors).length > 0) {
                  Object.values(pendingProjectContractors).forEach(contractors => {
                    allContractors.push(...contractors);
                  });
                }

                // Remove duplicates based on contractor ID
                const uniqueContractors = allContractors.filter((contractor, index, self) =>
                  index === self.findIndex(c => c.id === contractor.id)
                );

                return uniqueContractors.length > 0 ? (
                  uniqueContractors.map(person => (
                    <div key={person.id} className="hired-contractor-card">
                      <div className="contractor-info c-contractor-info">
                        <div className='c-contractor-row'>
                          <div className='c-contractor-details'>
                            <div className="contractor-avatar">
                              <img src={getAvatarUrl(person)} alt={person.name} />
                            </div>
                            <div>
                              <div className="contractor-name">{person.name}</div>
                              <div className="contractor-actions">
                                <button
                                  className="action-btn view-profile"
                                  onClick={() => handleViewProfile(person.id)}
                                >
                                  View Profile
                                </button>
                                <span className="action-separator">|</span>
                                <button
                                  className="action-btn message"
                                  onClick={handleMessage}
                                >
                                  Message
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="contractor-tags">
                            <span className="tag">{person.qualifications ? person.qualifications.split(',')[0].trim() : 'CPA'}</span>
                            <span className="tag">{person.skills ? person.skills.split(',')[0].trim() : 'QuickBooks'}</span>
                            <span className="tag">{person.workModel || 'Remote'}</span>
                            <span className="tag">{person.availability ? `${person.availability} Hours/week` : '20 Hours/week'}</span>
                          </div>
                        </div>
                      </div>


                      {/* <div className="contractor-avatar">
                        <img src={getAvatarUrl(person)} alt={person.name} />
                      </div>
                      <div className="contractor-info client-contractor-info">
                        <div className="contractor-name">{person.name}</div>
                        <div className="contractor-actions">
                          <button
                            className="action-btn view-profile"
                            onClick={() => handleViewProfile(person.id)}
                          >
                            View Profile
                          </button>
                          <span className="action-separator">|</span>
                          <button
                            className="action-btn message"
                            onClick={handleMessage}
                          >
                            Message
                          </button>
                        </div>
                        <div className="contractor-tags">
                          <span className="tag">{person.qualifications ? person.qualifications.split(',')[0].trim() : 'CPA'}</span>
                          <span className="tag">{person.skills ? person.skills.split(',')[0].trim() : 'QuickBooks'}</span>
                          <span className="tag">{person.workModel || 'Remote'}</span>
                          <span className="tag">{person.availability ? `${person.availability} Hours/week` : '20 Hours/week'}</span>
                        </div>
                      </div> */}
                    </div>
                  ))
                ) : null;
              })()}

              {/* Show message if no recommendations */}
              {(!dashboardData.matchedContractors || dashboardData.matchedContractors.length === 0) &&
                Object.keys(pendingProjectContractors).length === 0 && (
                  <div style={{ textAlign: 'center', color: '#000000', fontSize: '14px', padding: '20px' }}>
                    No contractor recommendations available. Create a pending project to see matched contractors.
                  </div>
                )}
            </div>
          </div>
        </div >
      </>
    );
  };

  const DashboardHome = () => renderDashboardContent();


  if (!user || loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
          <span className="header-title">taalos</span>
          <div className="header-divider"></div>
          <span className="header-page">Dashboard</span>
        </div>
        <div className="header-right">
          <div className="help-section">
            <span className="help-icon"><NeedHelpIcon /></span>
            <span className="help-text">Get Help from Taalos</span>
          </div>
          <div
            className={`message-notification-icon ${showMessageNotification ? 'pulse' : ''}`}
            onClick={() => navigate('/messages')}

            title={`${unreadMessageCount} unread messages`}
          >
            <MessagesIcon fill="#000000" />
            {unreadMessageCount > 0 && (
              <span className="message-badge">{unreadMessageCount > 99 ? '99+' : unreadMessageCount}</span>
            )}
          </div>
          <div className="notification-icon" onClick={() => navigate('/notifications')}><HeaderNotificationIcon /></div>
          <div className="user-profile">
            <div>
              <div className="user-name">{user.firstName} {user.lastName || ''}</div>
              <div className="user-role">Client</div>
            </div>
            <img
              src={getAvatarUrl(user, 40)}
              alt={`${user.firstName} ${user.lastName || ''}`}
              className="user-avatar"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.target.style.display = 'none';
                const fallback = e.target.nextSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div
              className="user-avatar-fallback"
              style={{ display: 'none' }}
            >
              {user.firstName?.[0]}{user.lastName?.[0] || ''}
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {menuItems.map(item => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                end={item.id === ''}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="sidebar-icon"><LogoutIcon /></span>
            <span className="sidebar-label">Logout</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="dashboard-content">
            {renderDashboardContent()}
          </div>
        </main>
      </div>

      {/* Hired Contractors Popup */}
      <HiredContractorsPopup
        isOpen={showHiredContractorsPopup}
        onClose={handleCloseHiredContractorsPopup}
      />

      {/* Taalos Recommendations Popup */}
      <TaalosRecommendationsPopup
        isOpen={showTaalosRecommendationsPopup}
        onClose={handleCloseTaalosRecommendationsPopup}
      />
    </div>
  );
};

export default ClientDashboard;