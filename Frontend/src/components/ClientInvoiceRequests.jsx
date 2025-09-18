import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import authService from '../services/authService';
import { getAvatarUrl } from '../utils/avatarUtils';
import DashboardLayout from './DashboardLayout';

const ClientInvoiceRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0
  });
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:54192/api';

  useEffect(() => {
    fetchInvoices();
  }, [pagination.page, activeFilter, searchTerm]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        sortBy: 'submittedAt',
        sortOrder: 'desc'
      });

      // Only add status filter if it's not 'all' - let backend return all invoices by default
      if (activeFilter !== 'all') {
        params.append('status', activeFilter);
      }

      if (searchTerm) {
        params.append('searchTerm', searchTerm);
      }

      const response = await fetch(`${API_BASE_URL}/invoice/search?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInvoices(data.invoices || []);
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        totalCount: data.totalCount
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchInvoices();
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleInvoiceView = (invoiceId) => {
    navigate(`/client-invoice/${invoiceId}`);
  };

  const handleAcceptInvoice = async (invoiceId) => {
    try {
      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/invoice/${invoiceId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'approve' })
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the invoices list after successful update
      fetchInvoices();

      // Optional: Show success message
      console.log('Invoice accepted successfully');

    } catch (error) {
      console.error('Error accepting invoice:', error);
      setError('Failed to accept invoice');
    }
  };

  const handleRejectInvoice = async (invoiceId) => {
    try {
      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/invoice/${invoiceId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'reject' })
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the invoices list after successful update
      fetchInvoices();

      // Optional: Show success message
      console.log('Invoice rejected successfully');

    } catch (error) {
      console.error('Error rejecting invoice:', error);
      setError('Failed to reject invoice');
    }
  };

  const handleInvoiceAction = async (invoiceId, action) => {
    if (action === 'view') {
      handleInvoiceView(invoiceId);
    } else if (action === 'accept') {
      await handleAcceptInvoice(invoiceId);
    } else if (action === 'reject') {
      await handleRejectInvoice(invoiceId);
    } else if (action === 'message') {
      navigate('/messages');
    }
  };

  const handlePaginationChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          backgroundColor: '#FFF8D8',
          color: '#DDB70B'
        };
      case 'accepted':
        return {
          backgroundColor: '#E2FFD8',
          color: '#5DBD39'
        };
      case 'rejected':
        return {
          backgroundColor: '#FFE0DE',
          color: '#D72E20'
        };
      case 'paid':
        return {
          backgroundColor: '#E6E5FF',
          color: '#2320D7'
        };
      default:
        return {
          backgroundColor: '#FFE0DE',
          color: '#D72E20'
        };
    }
  };



  const getActionMenuItems = (invoice) => {
    const baseItems = [
      { label: 'View', action: 'view' },
      { label: 'Message', action: 'message' }
    ];

    if (invoice.status?.toLowerCase() === 'pending') {
      baseItems.unshift(
        { label: 'Accept', icon: '✅', action: 'accept' },
        { label: 'Reject', icon: '❌', action: 'reject' }
      );
    }

    return baseItems;
  };

  return (
    <DashboardLayout>
      <div className="client-invoice-requests-container">
        <div className="client-invoice-requests-header">
          <h1>Invoice <strong>Requests</strong></h1>
        </div>

        {/* Search and Filters */}
        <div className="client-invoice-controls">
          <div className="client-search-section">
            <input
              type="text"
              placeholder="Search (Invoice, Contractor Name, Project Name)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="client-search-input"
            />
          </div>

          <div className="client-filter-section">
            <div className="client-filter-options">
              <label className="client-filter-option">
                <input
                  type="radio"
                  name="invoiceFilter"
                  checked={activeFilter === 'all'}
                  onChange={() => handleFilterChange('all')}
                />
                <span className="client-filter-circle"></span>
                All
              </label>
              <label className="client-filter-option">
                <input
                  type="radio"
                  name="invoiceFilter"
                  checked={activeFilter === 'accepted'}
                  onChange={() => handleFilterChange('accepted')}
                />
                <span className="client-filter-circle"></span>
                Accepted
              </label>
              <label className="client-filter-option">
                <input
                  type="radio"
                  name="invoiceFilter"
                  checked={activeFilter === 'pending'}
                  onChange={() => handleFilterChange('pending')}
                />
                <span className="client-filter-circle"></span>
                Pending
              </label>
              <label className="client-filter-option">
                <input
                  type="radio"
                  name="invoiceFilter"
                  checked={activeFilter === 'rejected'}
                  onChange={() => handleFilterChange('rejected')}
                />
                <span className="client-filter-circle"></span>
                Rejected
              </label>
              <label className="client-filter-option">
                <input
                  type="radio"
                  name="invoiceFilter"
                  checked={activeFilter === 'paid'}
                  onChange={() => handleFilterChange('paid')}
                />
                <span className="client-filter-circle"></span>
                Paid
              </label>
            </div>

          </div>
        </div>

        {/* Invoice Requests Table */}
        <div className="client-invoice-table-container">
          <table className="client-invoice-table">
            <thead>
              <tr>
                <th style={{ width: '20%', textAlign: 'left' }}>Project Name</th>
                <th style={{ width: '15%', textAlign: 'left' }}>Contractor Name</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Hours Worked</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Invoice Amount</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Submitted On</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Status</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Payment Status</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading invoices...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    Error: {error}
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map(invoice => (
                  <tr key={invoice.id} className="client-invoice-row">
                    <td style={{ width: '20%', textAlign: 'left' }}>
                      <div className="client-project-name-cell">
                        <span className="client-project-name">{invoice.projectName}</span>
                      </div>
                    </td>
                    <td style={{ width: '15%', textAlign: 'left' }}>
                      <div className="client-contractor-info">
                        <img src={getAvatarUrl({ name: invoice.contractorName, id: invoice.contractorId }, 24)} alt={invoice.contractorName} className="client-contractor-avatar-img" />
                        <span className="client-contractor-name">{invoice.contractorName}</span>
                      </div>
                    </td>
                    <td style={{ width: '10%', textAlign: 'center' }}>
                      <span className="client-hours-worked">{invoice.hoursWorked} hrs</span>
                    </td>
                    <td className="client-invoice-amount" style={{ width: '10%', textAlign: 'center' }}>{invoice.invoiceAmount}</td>
                    <td className="client-submitted-date" style={{ width: '10%', textAlign: 'center' }}>{invoice.submittedOn}</td>
                    <td style={{ width: '8%', textAlign: 'center' }}>
                      <span
                        className='status-badge'
                        style={getStatusColor(invoice.status)}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ width: '12%', textAlign: 'center' }}>
                      <span
                        className='status-badge'
                        style={getStatusColor(invoice.adminPaymentStatus)}
                      >
                        {invoice.adminPaymentStatus || 'Not Paid'}
                      </span>
                    </td>
                    <td style={{ width: '10%', textAlign: 'center' }}>
                      <div className="client-actions-menu">
                        <button className="actions-trigger">⋯</button>
                        <div className="actions-dropdown">
                          {getActionMenuItems(invoice).map((item, index) => (
                            <button
                              key={index}
                              className="action-item"
                              onClick={() => handleInvoiceAction(invoice.id, item.action)}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="client-pagination-container">
            <div className="client-pagination">
              <button
                className="client-pagination-btn"
                onClick={() => handlePaginationChange(1)}
                disabled={pagination.page === 1}
              >
                ⟪
              </button>
              <button
                className="client-pagination-btn"
                onClick={() => handlePaginationChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                ⟨
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(
                  pagination.page - 2 + i,
                  pagination.totalPages - 4 + i
                ));

                if (pageNumber > pagination.totalPages) return null;

                return (
                  <button
                    key={pageNumber}
                    className={`client-pagination-btn ${pagination.page === pageNumber ? 'active' : ''}`}
                    onClick={() => handlePaginationChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                className="client-pagination-btn"
                onClick={() => handlePaginationChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                ⟩
              </button>
              <button
                className="client-pagination-btn"
                onClick={() => handlePaginationChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
              >
                ⟫
              </button>
            </div>
            <div className="client-pagination-info">
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total results)
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientInvoiceRequests;