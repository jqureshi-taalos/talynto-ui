import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import adminDashboardService from '../services/adminDashboardService';
import ProfileAvatar from './ProfileAvatar';
import taalosLogo from '../assets/taalos logo.png';
import DashboardIcon from './DashboardIcon';
import ProjectManagementIcon from './ProjectManagementIcon';
import UserManagementIcon from './UserManagementIcon';
import InvoicesIcon from './InvoicesIcon';
import NotificationsIcon from './NotificationsIcon';
import SettingsIcon from './SettingsIcon';
import ConfigurationIcon from './ConfigurationIcon';
import LogoutIcon from './LogoutIcon';
import HeaderNotificationIcon from './HeaderNotificationIcon';
import './Dashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    adminInfo: null,
    pendingContractors: [],
    rejectedInvoices: [],
    loading: true,
    error: null
  });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [openDropdownType, setOpenDropdownType] = useState(null); // 'contractor' | 'invoice'
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      const [stats, adminInfo, pendingContractors, rejectedInvoices] = await Promise.all([
        adminDashboardService.getDashboardStats(),
        adminDashboardService.getAdminUserInfo(),
        adminDashboardService.getPendingContractors(7),
        adminDashboardService.getRejectedInvoices(8)
      ]);

      // Debug: Log the data to see what fields are available
      console.log('Pending contractors data:', pendingContractors);
      console.log('Rejected invoices data:', rejectedInvoices);

      setDashboardData({
        stats,
        adminInfo,
        pendingContractors,
        rejectedInvoices,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
    }
  };


  const handleDropdownToggle = (e, id, type) => {
    e.stopPropagation();
    if (openDropdownId === id && openDropdownType === type) {
      setOpenDropdownId(null);
      setOpenDropdownType(null);
    } else {
      setOpenDropdownId(id);
      setOpenDropdownType(type);
    }
  };

  const handleDropdownItemClick = (e, action, item, type) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    setOpenDropdownType(null);

    if (action === 'view') {
      if (type === 'contractor') {
        // Use the database ID for contractor
        const contractorId = item.id || item.userId || item.contractorId;
        navigate(`/admin-user-management/contractor/${contractorId}?status=${item.status || 'pending'}&tab=contractor`);
      } else if (type === 'invoice') {
        // Use the database record ID, not the invoice number
        const invoiceId = item.invoiceId || item.InvoiceId;
        console.log('Navigating to invoice:', invoiceId, 'Full item:', item);
        navigate(`/admin-invoice/${invoiceId}?source=dashboard`);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
        setOpenDropdownType(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdownId]);
  if (!user || dashboardData.loading) {
    return <div className="loading">Loading...</div>;
  }

  if (dashboardData.error) {
    return <div className="error">Error: {dashboardData.error}</div>;
  }

  const handleStatCardClick = (statType) => {
    switch (statType) {
      case 'Total Projects':
      case 'Active Projects':
      case 'Pending Projects':
        navigate('/admin-project-management');
        break;
      case 'New User Requests':
        navigate('/admin-user-management');
        break;
      case 'Total Contractor':
        navigate('/admin-user-management?tab=contractor');
        break;
      case 'Total Clients':
        navigate('/admin-user-management?tab=client');
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    // Don't manually navigate - authService.logout() handles redirect
  };

  const sidebarItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/admin-dashboard', active: true },
    { id: 'user-management', icon: <UserManagementIcon />, label: 'User Management', path: '/admin-user-management' },
    { id: 'project-management', icon: <ProjectManagementIcon />, label: 'Project Management', path: '/admin-project-management' },
    { id: 'invoices', icon: <InvoicesIcon />, label: 'Invoices', path: '/admin-invoices' },
    // { id: 'contractor-intake', icon: '📝', label: 'Contractor Intake', path: '/admin-contractor-intake' },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notifications', path: '/admin-notifications' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/admin-settings' },
    { id: 'configuration', icon: <ConfigurationIcon />, label: 'Configuration', path: '/admin-configuration' }
  ];

  const stats = dashboardData.stats ? [
    { title: "Total Projects", value: dashboardData.stats.totalProjects.toString(), subtitle: "Across All Clients", bgColor: "#4fc3f7", isHighlighted: true },
    { title: "Active Projects", value: dashboardData.stats.activeProjects.toString(), subtitle: "Active Projects", bgColor: "#ffffff" },
    { title: "Pending Projects", value: dashboardData.stats.pendingProjects.toString().padStart(2, '0'), subtitle: "Awaiting Assignment", bgColor: "#ffffff" },
    { title: "New User Requests", value: dashboardData.stats.newUserRequests.toString().padStart(2, '0'), subtitle: "Pending Approvals (Clients/Contractors)", bgColor: "#ffffff" },
    { title: "Total Contractor", value: dashboardData.stats.totalContractors.toString(), subtitle: "Active in the System", bgColor: "#ffffff" },
    { title: "Total Clients", value: dashboardData.stats.totalClients.toString(), subtitle: "Approved Client Accounts", bgColor: "#ffffff" }
  ] : [];

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
          <span className="header-title">taalos</span>
          <div className="header-divider"></div>
          <span className="header-page">Dashboard</span>
        </div>
        <div className="header-right">
          <div className="notification-icon" onClick={() => navigate('/admin-notifications')} style={{ cursor: 'pointer' }}><HeaderNotificationIcon /></div>
          <div className="user-profile">
            <div>
              <div className="user-name">
                {dashboardData.adminInfo?.name || 'Admin'}
              </div>
              <div className="user-role">
                {user?.role || 'Super Admin'}
              </div>
            </div>
            <ProfileAvatar
              user={{
                id: user?.id,
                firstName: user?.firstName,
                lastName: user?.lastName,
                email: user?.email
              }}
              size={40}
              className="user-avatar"
            />
          </div>
        </div>
      </header>

      <div className="admin-content">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {sidebarItems.map(item => (
            <div
              key={item.id}
              className={`sidebar-item ${item.active ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </div>
          ))}
          <div className="sidebar-item" onClick={handleLogout}>
            <span className="sidebar-icon"><LogoutIcon /></span>
            <span className="sidebar-label">Logout</span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <div className="dashboard-container-admin">
            {/* Welcome Section */}
            <div className="admin-welcome-section">
              <h1>Welcome In, <span className="admin-name">{dashboardData.adminInfo?.name || 'Admin Name'}</span></h1>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats-grid">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`admin-stat-card ${stat.isHighlighted ? 'highlighted' : ''}`}
                  style={{ backgroundColor: stat.bgColor, cursor: 'pointer' }}
                  onClick={() => handleStatCardClick(stat.title)}
                >
                  <div className="stat-title">{stat.title}</div>
                  <div className="stat-number">{stat.value}</div>
                  <div className="stat-subtitle">{stat.subtitle}</div>
                </div>
              ))}
            </div>

            {/* Tables Section */}
            <div className="admin-tables-section">
              {/* Pending Contractor Intake */}
              <div className="admin-table-container">
                <h2>Pending Contractor Intake</h2>
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date Submitted</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.pendingContractors.map((contractor, index) => (
                      <tr key={contractor.id}>
                        <td>
                          <div className="contractor-info">
                            <ProfileAvatar
                              user={{
                                id: contractor.id,
                                firstName: contractor.firstName,
                                lastName: contractor.lastName,
                                name: contractor.name,
                                email: contractor.email
                              }}
                              size={32}
                              className="contractor-avatar"
                            />
                            <span className="contractor-name">{contractor.name}</span>
                          </div>
                        </td>
                        <td>{contractor.dateSubmitted}</td>
                        <td>
                          <div className="actions-menu" style={{ position: 'relative' }}>
                            <button
                              className="actions-trigger" // "action-menu-btn"
                              onClick={(e) => handleDropdownToggle(e, contractor.id, 'contractor')}
                            // style={{
                            //   background: '#f8f9fa',
                            //   border: '1px solid #000000',
                            //   cursor: 'pointer',
                            //   fontSize: '14px',
                            //   padding: '6px 10px',
                            //   borderRadius: '4px',
                            //   color: '#000000'
                            // }}
                            >
                              ⋯
                            </button>
                            {openDropdownId === contractor.id && openDropdownType === 'contractor' && (
                              <div
                                className="actions-dropdown"
                              // style={{
                              //   position: 'absolute',
                              //   top: '100%',
                              //   right: '0',
                              //   backgroundColor: 'white',
                              //   border: '1px solid #000000',
                              //   borderRadius: '4px',
                              //   boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              //   zIndex: 1000,
                              //   minWidth: '150px'
                              // }}
                              >
                                <div
                                  className="dropdown-item"
                                  onClick={(e) => handleDropdownItemClick(e, 'view', contractor, 'contractor')}
                                  style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f0f0f0'
                                  }}
                                >
                                  View
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rejected Invoices */}
              <div className="admin-table-container">
                <h2>Rejected Invoices (Client Side)</h2>
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Project Name</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.rejectedInvoices.map((invoice, index) => (
                      <tr key={invoice.invoiceId || invoice.InvoiceId || index}>
                        <td><span className="invoice-id">{invoice.id}</span></td>
                        <td>{invoice.projectName}</td>
                        <td>{invoice.amount}</td>
                        <td>
                          <div className="actions-menu" style={{ position: 'relative' }}>
                            <button
                              className="actions-trigger" // "action-menu-btn"
                              onClick={(e) => handleDropdownToggle(e, invoice.invoiceId || invoice.InvoiceId, 'invoice')}
                            // style={{
                            //   background: '#f8f9fa',
                            //   border: '1px solid #000000',
                            //   cursor: 'pointer',
                            //   fontSize: '14px',
                            //   padding: '6px 10px',
                            //   borderRadius: '4px',
                            //   color: '#000000'
                            // }}
                            >
                              ⋯
                            </button>
                            {openDropdownId === (invoice.invoiceId || invoice.InvoiceId) && openDropdownType === 'invoice' && (
                              <div
                                className="actions-dropdown"
                              // style={{
                              //   position: 'absolute',
                              //   top: '100%',
                              //   right: '0',
                              //   backgroundColor: 'white',
                              //   border: '1px solid #000000',
                              //   borderRadius: '4px',
                              //   boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              //   zIndex: 1000,
                              //   minWidth: '150px'
                              // }}
                              >
                                <div
                                  className="dropdown-item"
                                  onClick={(e) => handleDropdownItemClick(e, 'view', invoice, 'invoice')}
                                  style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f0f0f0'
                                  }}
                                >
                                  View
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;