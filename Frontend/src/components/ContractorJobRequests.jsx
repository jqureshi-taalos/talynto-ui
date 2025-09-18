import React, { useEffect, useState } from 'react';
import ContractorDashboardLayout from './ContractorDashboardLayout';
import authService from '../services/authService';
import { getAvatarUrl } from '../utils/avatarUtils';
import ContractorInvitationModal from './ContractorInvitationModal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

const ContractorJobRequests = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = authService.getToken();
      if (!token) return;
      
      // Map filter to API status
      let apiStatus = '';
      if (statusFilter === 'Active') apiStatus = 'accepted';
      else if (statusFilter === 'Closed') apiStatus = 'rejected';
      
      const params = new URLSearchParams({ 
        status: apiStatus, 
        page: page.toString(), 
        pageSize: '10' 
      });
      const res = await fetch(`${API_BASE_URL}/project/contractor/invitations?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) { authService.logout(); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInvitations(data.invitations || []);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      setError('Failed to load job requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvitations(); }, [statusFilter, page]);

  const updateStatus = async (invitationId, action) => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/project/invitations/${invitationId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.status === 401) { authService.logout(); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchInvitations();
      setShowActionsMenu(null);
    } catch (e) {
      setError('Failed to update invite');
    }
  };

  const handleViewInvitation = (invitation) => {
    setSelectedInvitation(invitation);
    setShowInvitationModal(true);
    setShowActionsMenu(null);
  };

  const handleRejectProject = async (invitationId) => {
    setShowActionsMenu(null);
    await updateStatus(invitationId, 'reject');
  };

  const handleModalStatusUpdate = () => {
    fetchInvitations();
  };

  const getStatusBadgeStyle = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'accepted': 
      case 'active':
        return { 
          backgroundColor: '#dcfce7', 
          color: '#166534',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        };
      case 'rejected': 
      case 'closed':
        return { 
          backgroundColor: '#fecaca', 
          color: '#991b1b',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        };
      case 'pending': 
        return { 
          backgroundColor: '#fef3c7', 
          color: '#a16207',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        };
      default: 
        return {
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDisplayStatus = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Active';
      case 'rejected': return 'Closed';
      default: return status || 'Unknown';
    }
  };

  // Mock client names for demo (in real app, this would come from API)
  const getClientName = (clientId) => {
    const names = ['David White', 'Shawn Brown', 'John Smith', 'Sarah Johnson'];
    return names[clientId % names.length] || `Client ${clientId}`;
  };

  return (
    <ContractorDashboardLayout>
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* Header with title and filter tabs */}
          <div style={{ 
            padding: '20px 20px 0 20px'
          }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '400', 
              color: '#333',
              margin: '0 0 20px 0'
            }}>
              Manage <strong>Projects</strong>
            </h1>

            {/* Main tabs and filter tabs */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              {/* Left side - Projects/Job Request tabs */}
              <div style={{ display: 'flex' }}>
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#f0f0f0',
                  color: '#666',
                  borderRadius: '4px',
                  fontSize: '14px',
                  marginRight: '8px'
                }}>
                  Projects
                </div>
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#5bc0de',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  Job Request
                </div>
              </div>

              {/* Right side - Status filter tabs */}
              <div style={{ display: 'flex', gap: '20px' }}>
                {['All', 'Active', 'Closed'].map(filter => (
                  <label key={filter} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#333'
                  }}>
                    <input 
                      type="radio" 
                      name="statusFilter" 
                      checked={statusFilter === filter}
                      onChange={() => { setStatusFilter(filter); setPage(1); }}
                      style={{ margin: 0 }}
                    />
                    {filter}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '12px 20px', 
              margin: '0 20px',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px' 
            }}>
              <div>Loading...</div>
            </div>
          ) : (
            <>
              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
                      <th style={{ 
                        padding: '12px 20px', 
                        textAlign: 'left',
                        fontWeight: '500',
                        color: '#495057',
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        Project Name
                      </th>
                      <th style={{ 
                        padding: '12px 20px', 
                        textAlign: 'left',
                        fontWeight: '500',
                        color: '#495057',
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        Start / End Date
                      </th>
                      <th style={{ 
                        padding: '12px 20px', 
                        textAlign: 'left',
                        fontWeight: '500',
                        color: '#495057',
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        Client
                      </th>
                      <th style={{ 
                        padding: '12px 20px', 
                        textAlign: 'left',
                        fontWeight: '500',
                        color: '#495057',
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        Status
                      </th>
                      <th style={{ 
                        padding: '12px 20px', 
                        textAlign: 'left',
                        fontWeight: '500',
                        color: '#495057',
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ 
                          padding: '40px', 
                          textAlign: 'center', 
                          color: '#6c757d',
                          fontSize: '16px'
                        }}>
                          No job requests found
                        </td>
                      </tr>
                    ) : invitations.map(inv => (
                      <tr key={inv.id} style={{ 
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        <td style={{ padding: '15px 20px' }}>
                          <span style={{ 
                            fontWeight: '400',
                            color: '#212529'
                          }}>
                            {inv.project?.name || 'Q3 Financial Audit'}
                          </span>
                        </td>
                        <td style={{ padding: '15px 20px', color: '#6c757d' }}>
                          {formatDate(inv.project?.startDate) || '22/5/2025'}
                          {inv.project?.endDate && ` - ${formatDate(inv.project?.endDate)}`}
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px' 
                          }}>
                            <img
                              src={getAvatarUrl({ name: getClientName(inv.project?.clientId || 1) }, 32)}
                              alt="Client"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                            />
                            <span style={{ 
                              fontWeight: '400',
                              color: '#212529'
                            }}>
                              {getClientName(inv.project?.clientId || 1)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <span style={getStatusBadgeStyle(inv.status)}>
                            {getDisplayStatus(inv.status)}
                          </span>
                        </td>
                        <td style={{ padding: '15px 20px', position: 'relative' }}>
                          <button
                            onClick={() => setShowActionsMenu(showActionsMenu === inv.id ? null : inv.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              fontSize: '16px',
                              color: '#6c757d',
                              fontWeight: 'bold'
                            }}
                          >
                            ⋯
                          </button>
                          
                          {showActionsMenu === inv.id && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              right: '20px',
                              backgroundColor: 'white',
                              border: '1px solid #dee2e6',
                              borderRadius: '4px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              zIndex: 1000,
                              minWidth: '140px'
                            }}>
                              <button
                                onClick={() => handleViewInvitation(inv)}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: 'none',
                                  background: 'none',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  color: '#212529'
                                }}
                              >
                                View
                              </button>
                              <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #dee2e6' }} />
                              <button
                                onClick={() => handleRejectProject(inv.id)}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: 'none',
                                  background: 'none',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  color: '#dc3545'
                                }}
                              >
                                Reject Project
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  padding: '20px',
                  gap: '4px'
                }}>
                  <button 
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    style={{
                      background: '#5bc0de',
                      color: 'white',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: page === 1 ? 0.5 : 1
                    }}
                  >
                    ‹‹
                  </button>
                  
                  <button 
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    style={{
                      background: '#5bc0de',
                      color: 'white',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: page === 1 ? 0.5 : 1
                    }}
                  >
                    ‹
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + Math.max(1, page - 2);
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        style={{
                          background: page === pageNum ? '#5bc0de' : 'white',
                          color: page === pageNum ? 'white' : '#5bc0de',
                          border: '1px solid #5bc0de',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          margin: '0 2px'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    style={{
                      background: '#5bc0de',
                      color: 'white',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: page === totalPages ? 0.5 : 1
                    }}
                  >
                    ›
                  </button>
                  
                  <button 
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    style={{
                      background: '#5bc0de',
                      color: 'white',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: page === totalPages ? 0.5 : 1
                    }}
                  >
                    ››
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Click outside to close actions menu */}
      {showActionsMenu && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowActionsMenu(null)}
        />
      )}

      {/* Invitation Modal */}
      <ContractorInvitationModal
        isOpen={showInvitationModal}
        onClose={() => {
          setShowInvitationModal(false);
          setSelectedInvitation(null);
        }}
        invitation={selectedInvitation}
        onStatusUpdate={handleModalStatusUpdate}
      />
    </ContractorDashboardLayout>
  );
};

export default ContractorJobRequests;