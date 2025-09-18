import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import authService from '../services/authService';
import ProfileAvatar from './ProfileAvatar';
import taalosLogo from '../assets/taalos logo.png';
import DashboardIcon from './DashboardIcon';
import UserManagementIcon from './UserManagementIcon';
import ProjectManagementIcon from './ProjectManagementIcon';
import InvoicesIcon from './InvoicesIcon';
import NotificationsIcon from './NotificationsIcon';
import SettingsIcon from './SettingsIcon';
import ConfigurationIcon from './ConfigurationIcon';
import LogoutIcon from './LogoutIcon';
import HeaderNotificationIcon from './HeaderNotificationIcon'
import ConfigItemsTable from './ConfigItemsTable'
import './Dashboard.css';

const AdminConfiguration = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState('expertise');
  const [currentItem, setCurrentItem] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [configSections, setConfigSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState({});
  const [totalPages, setTotalPages] = useState({});

  const sidebarItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/admin-dashboard' },
    { id: 'user-management', icon: <UserManagementIcon />, label: 'User Management', path: '/admin-user-management' },
    { id: 'project-management', icon: <ProjectManagementIcon />, label: 'Project Management', path: '/admin-project-management' },
    { id: 'invoices', icon: <InvoicesIcon />, label: 'Invoices', path: '/admin-invoices' },
    // { id: 'contractor-intake', icon: '📝', label: 'Contractor Intake', path: '/admin-contractor-intake' },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notifications', path: '/admin-notifications' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/admin-settings' },
    { id: 'configuration', icon: <ConfigurationIcon />, label: 'Configuration', path: '/admin-configuration', active: true }
  ];

  // Load configuration data from API
  useEffect(() => {
    loadConfigurationData();
  }, []);

  const loadConfigurationData = async () => {
    try {
      setLoading(true);
      const categories = await adminService.getAllConfigurationCategories();

      if (!categories || categories.length === 0) {
        throw new Error('No configuration categories found. Please check if the database is properly seeded.');
      }

      const sectionsData = {};
      const pagesData = {};
      const totalPagesData = {};

      categories.forEach(category => {
        sectionsData[category.name] = {
          id: category.id,
          title: category.displayName,
          items: category.items || [],
          addLabel: `Add ${category.displayName.replace('Manage ', '')}`
        };
        pagesData[category.name] = 1;
        totalPagesData[category.name] = Math.ceil((category.items?.length || 0) / 3); // 3 items per page
      });

      setConfigSections(sectionsData);
      setCurrentPage(pagesData);
      setTotalPages(totalPagesData);
      setError(null);
    } catch (err) {
      setError('Failed to load configuration data: ' + err.message);
      console.error('Error loading configuration:', err);
      // Don't set any fallback data - force the user to fix the API/database issue
      setConfigSections({});
      setCurrentPage({});
      setTotalPages({});
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (section) => {
    setCurrentSection(section);
    setNewItemName('');
    setShowAddModal(true);
  };

  const handleEdit = (section, item) => {
    setCurrentSection(section);
    setCurrentItem(item);
    setNewItemName(item.name);
    setShowEditModal(true);
  };

  const handleDelete = (section, item) => {
    setCurrentSection(section);
    setCurrentItem(item);
    setShowDeleteModal(true);
  };

  const confirmAdd = async () => {
    try {
      const sectionData = configSections[currentSection];
      if (!sectionData) return;

      await adminService.createConfigurationItem(
        sectionData.id,
        newItemName.trim(),
        '', // description
        0   // sortOrder
      );

      // Reload configuration data
      await loadConfigurationData();

      setShowAddModal(false);
      setNewItemName('');
      setError(null);
    } catch (err) {
      setError('Failed to add item: ' + err.message);
      console.error('Error adding item:', err);
    }
  };

  const confirmEdit = async () => {
    try {
      if (!currentItem) return;

      await adminService.updateConfigurationItem(
        currentItem.id,
        newItemName.trim(),
        currentItem.description || '',
        currentItem.sortOrder || 0,
        true // isActive
      );

      // Reload configuration data
      await loadConfigurationData();

      setShowEditModal(false);
      setNewItemName('');
      setCurrentItem(null);
      setError(null);
    } catch (err) {
      setError('Failed to edit item: ' + err.message);
      console.error('Error editing item:', err);
    }
  };

  const confirmDelete = async () => {
    try {
      if (!currentItem) return;

      await adminService.deleteConfigurationItem(currentItem.id);

      // Reload configuration data
      await loadConfigurationData();

      setShowDeleteModal(false);
      setCurrentItem(null);
      setError(null);
    } catch (err) {
      setError('Failed to delete item: ' + err.message);
      console.error('Error deleting item:', err);
    }
  };

  const handlePageChange = (sectionKey, page) => {
    setCurrentPage(prev => ({ ...prev, [sectionKey]: page }));
  };

  const getPaginatedItems = (items, page) => {
    const itemsPerPage = 3;
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };


  // @add openDropdownId state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  // @add close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdownId]);
  // @add handleDropdownToggle method
  const handleDropdownToggle = (e, itemId) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === itemId ? null : itemId);
  };
  // @add getDropdownStyle
  const getDropdownStyle = (lastItem) => {
    return {
      position: 'absolute',
      top: lastItem ? 'auto' : '100%',
      bottom: lastItem ? '100%' : 'auto'
    };
  };


  const renderConfigSection = (sectionKey, section) => (
    < div key={sectionKey} className="config-section" >
      <div className="config-section-header">
        <h3>{section.title}</h3>
        <button
          className="add-btn"
          onClick={() => handleAdd(sectionKey)}
        >
          {section.addLabel}
        </button>
      </div>

      <div className="config-section-content">
        <div className="config-items-grid">
          {getPaginatedItems(section.items, currentPage[sectionKey] || 1).map((item, index) => {
            const lastOnView = section.items.length >= 2 ? index % 3 !== 2 : true;
            const notLastItem = section.items[section.items.length - 1].id !== item.id;
            return (
              <div key={item.id} className="config-item" style={{ borderBottom: lastOnView && notLastItem ? "2px solid #DEDEDE" : "none" }}>
                <div className="config-item-info">
                  <span className="config-item-name">{item.name}</span>
                  <div className="config-item-actions">
                    {/* @add dropdown menu */}
                    <div className="actions-menu" style={{ position: 'relative' }}>
                      <button
                        className="actions-trigger"
                        onClick={(e) => handleDropdownToggle(e, item.id)}
                      >
                        ⋯
                      </button>
                      {openDropdownId === item.id && (
                        <div
                          className="actions-dropdown"
                          style={getDropdownStyle(!lastOnView)}
                        >
                          <div
                            className="dropdown-item"
                            onClick={() => handleEdit(sectionKey, item)}
                          >
                            Edit
                          </div>
                          <div
                            className="dropdown-item"
                            onClick={() => handleDelete(sectionKey, item)}
                          >
                            Delete
                          </div>
                        </div>
                      )}
                    </div>
                    {/* @remove buttons and add dropdown */}
                    {/* <span className="item-count">Actions</span>
                  <div className="config-item-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(sectionKey, item)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(sectionKey, item)}
                    >
                      Delete
                    </button>
                  </div> */}
                  </div>
                </div>

                {/* @remove - not in ui */}
                {/* <div className="availability-info">
                <span className="availability-label">Status</span>
                <span className="availability-actions">{item.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="availability-ranges">
                <span className="range">Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                <span className="range">Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
              </div> */}
              </div>
            )
          })}
        </div>

        {/* <ConfigItemsTable
          section={section}
          sectionKey={sectionKey}
          currentPage={currentPage}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          getPaginatedItems={getPaginatedItems}
        /> */}

        {totalPages[sectionKey] > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages[sectionKey] }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-btn ${currentPage[sectionKey] === page ? 'active' : ''}`}
                onClick={() => handlePageChange(sectionKey, page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div >
  );

  if (loading) {
    return (
      <div className="admin-layout">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
            <span className="header-title">taalos</span>
            <div className="header-divider"></div>
            <span className="header-page">Configuration</span>
          </div>
          <div className="header-right">
            <div className="notification-icon" onClick={() => navigate('/admin-notifications')} style={{ cursor: 'pointer' }}><HeaderNotificationIcon /></div>
            <div className="user-profile">
              <div>
                <div className="user-name">Taalos</div>
                <div className="user-role">Super Admin</div>
              </div>
              <ProfileAvatar
                user={{
                  id: authService.getCurrentUser()?.id,
                  firstName: authService.getCurrentUser()?.firstName,
                  lastName: authService.getCurrentUser()?.lastName,
                  email: authService.getCurrentUser()?.email
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
            <div className="sidebar-item" onClick={() => navigate('/admin-login')}>
              <span className="sidebar-icon"><LogoutIcon /></span>
              <span className="sidebar-label">Logout</span>
            </div>
          </aside>

          <main className="admin-main">
            <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
              <p style={{ fontSize: '18px', color: '#000000' }}>Loading configuration data...</p>
              <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>Please wait while we fetch the latest configuration settings.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show message if no configuration data is available
  if (!loading && Object.keys(configSections).length === 0) {
    return (
      <div className="admin-layout">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
            <span className="header-title">taalos</span>
            <div className="header-divider"></div>
            <span className="header-page">Configuration</span>
          </div>
          <div className="header-right">
            <div className="notification-icon" onClick={() => navigate('/admin-notifications')} style={{ cursor: 'pointer' }}><HeaderNotificationIcon /></div>
            <div className="user-profile">
              <div>
                <div className="user-name">Taalos</div>
                <div className="user-role">Super Admin</div>
              </div>
              <ProfileAvatar
                user={{
                  id: authService.getCurrentUser()?.id,
                  firstName: authService.getCurrentUser()?.firstName,
                  lastName: authService.getCurrentUser()?.lastName,
                  email: authService.getCurrentUser()?.email
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
            <div className="sidebar-item" onClick={() => navigate('/admin-login')}>
              <span className="sidebar-icon"><LogoutIcon /></span>
              <span className="sidebar-label">Logout</span>
            </div>
          </aside>

          <main className="admin-main">
            <div className="no-data-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
              <h3 style={{ color: '#000000', marginBottom: '10px' }}>No Configuration Data Available</h3>
              <p style={{ fontSize: '14px', color: '#999', textAlign: 'center', maxWidth: '500px', lineHeight: '1.5' }}>
                The configuration system couldn't load any data. This usually means:
                <br />• The database hasn't been properly set up
                <br />• The configuration tables are empty
                <br />• There's a connection issue with the API
              </p>
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={loadConfigurationData}
                  style={{ padding: '10px 20px', backgroundColor: '#4EC1EF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
                >
                  Retry Loading
                </button>
                <button
                  onClick={() => window.location.reload()}
                  style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
          <span className="header-title">taalos</span>
          <div className="header-divider"></div>
          <span className="header-page">Configuration</span>
        </div>
        <div className="header-right">
          <div className="notification-icon" onClick={() => navigate('/admin-notifications')} style={{ cursor: 'pointer' }}><HeaderNotificationIcon /></div>
          <div className="user-profile">
            <div>
              <div className="user-name">Taalos</div>
              <div className="user-role">Super Admin</div>
            </div>
            <ProfileAvatar
              user={{
                id: authService.getCurrentUser()?.id,
                firstName: authService.getCurrentUser()?.firstName,
                lastName: authService.getCurrentUser()?.lastName,
                email: authService.getCurrentUser()?.email
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
          <div className="sidebar-item" onClick={() => navigate('/admin-login')}>
            <span className="sidebar-icon"><LogoutIcon /></span>
            <span className="sidebar-label">Logout</span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {error && (
            <div className="error-message" style={{ background: '#ff4444', color: 'white', padding: '10px', marginBottom: '20px', borderRadius: '4px' }}>
              {error}
              <button
                onClick={() => setError(null)}
                style={{ float: 'right', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          )}

          <div className="configuration-layout">
            {Object.keys(configSections).length > 0 ? (
              <div className="config-sections">
                {Object.entries(configSections).map(([key, section]) =>
                  renderConfigSection(key, section)
                )}
              </div>
            ) : (
              <div className="no-sections-message" style={{ textAlign: 'center', padding: '40px', color: '#000000' }}>
                <p>No configuration sections available.</p>
                <button
                  onClick={loadConfigurationData}
                  style={{ padding: '8px 16px', backgroundColor: '#4EC1EF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
                >
                  Reload Configuration
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {showAddModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content config-modal-content" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            minWidth: '500px',
            maxWidth: '600px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transform: 'scale(1)',
            transition: 'all 0.2s ease-in-out'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <span style={{ color: 'white', fontSize: '18px' }}>+</span>
                </div>
                <h3 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Add New {configSections[currentSection]?.title?.replace('Manage ', '')}
                </h3>
              </div>
              <p style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Enter the name for the new {configSections[currentSection]?.title?.replace('Manage ', '').toLowerCase()} type.
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {configSections[currentSection]?.title?.replace('Manage ', '')} Name *
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`Enter ${configSections[currentSection]?.title?.replace('Manage ', '').toLowerCase()} name`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#374151',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#d1d5db';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAdd}
                disabled={!newItemName.trim()}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  backgroundColor: newItemName.trim() ? '#10b981' : '#9ca3af',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: newItemName.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (newItemName.trim()) {
                    e.target.style.backgroundColor = '#059669';
                  }
                }}
                onMouseOut={(e) => {
                  if (newItemName.trim()) {
                    e.target.style.backgroundColor = '#10b981';
                  }
                }}
              >
                Add {configSections[currentSection]?.title?.replace('Manage ', '')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content config-modal-content" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            minWidth: '500px',
            maxWidth: '600px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transform: 'scale(1)',
            transition: 'all 0.2s ease-in-out'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <span style={{ color: 'white', fontSize: '18px' }}>✏️</span>
                </div>
                <h3 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Edit {configSections[currentSection]?.title?.replace('Manage ', '')}
                </h3>
              </div>
              <p style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Update the name for this {configSections[currentSection]?.title?.replace('Manage ', '').toLowerCase()} type.
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {configSections[currentSection]?.title?.replace('Manage ', '')} Name *
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#374151',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#d1d5db';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmEdit}
                disabled={!newItemName.trim()}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  backgroundColor: newItemName.trim() ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: newItemName.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (newItemName.trim()) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseOut={(e) => {
                  if (newItemName.trim()) {
                    e.target.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                Update {configSections[currentSection]?.title?.replace('Manage ', '')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content config-modal-content" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            minWidth: '500px',
            maxWidth: '600px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transform: 'scale(1)',
            transition: 'all 0.2s ease-in-out'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <span style={{ color: 'white', fontSize: '18px' }}>⚠️</span>
                </div>
                <h3 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Confirm Deletion
                </h3>
              </div>
              <p style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                Are you sure you want to delete this {configSections[currentSection]?.title?.replace('Manage ', '').toLowerCase()}?
                This action cannot be undone.
              </p>
              {currentItem && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#dc2626',
                    fontWeight: '500'
                  }}>
                    <strong>Item to delete:</strong> {currentItem.name}
                  </p>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#374151',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#d1d5db';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#ef4444';
                }}
              >
                Delete {configSections[currentSection]?.title?.replace('Manage ', '')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConfiguration;