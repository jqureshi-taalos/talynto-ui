import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import ContractorDashboardLayout from './ContractorDashboardLayout';
import authService from '../services/authService';

const ContractorInvoices = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedOnFilter, setSubmittedOnFilter] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

  useEffect(() => {
    fetchInvoices();
  }, [activeFilter, submittedOnFilter]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInvoices();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Refresh data when component mounts or becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchInvoices();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Refresh on mount
    fetchInvoices();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString()
      });

      if (activeFilter !== 'all') {
        params.append('status', activeFilter);
      }

      if (searchTerm && searchTerm.trim() !== '') {
        params.append('searchTerm', searchTerm.trim());
      }

      if (submittedOnFilter && submittedOnFilter.trim() !== '') {
        params.append('dateFilter', submittedOnFilter.trim());
      }

      const response = await fetch(`${API_BASE_URL}/invoice/contractor/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();

      // Use actual API data
      const invoiceData = data.invoices || data || [];
      console.log('Invoice data from API:', invoiceData); // Debug log
      if (invoiceData.length > 0) {
        console.log('First invoice structure:', JSON.stringify(invoiceData[0], null, 2)); // Debug log
        console.log('Available fields in first invoice:', Object.keys(invoiceData[0])); // Debug log
      }
      setInvoices(invoiceData);
      setTotalCount(invoiceData.length);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err.message);
      setInvoices([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    // Apply search filter first
    const matchesSearch = searchTerm === '' ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.clientName && invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Apply status filter
    const matchesStatus = activeFilter === 'all' ||
      (activeFilter.toLowerCase() === 'paid' ?
        invoice.adminPaymentStatus?.toLowerCase() === 'paid' :
        invoice.status.toLowerCase() === activeFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

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
      case 'active':
        return {
          backgroundColor: '#E2FFD8',
          color: '#5DBD39'
        };
      default:
        return {
          backgroundColor: '#FFE0DE',
          color: '#D72E20'
        };
    }
  };

  const handleViewInvoice = (invoiceId) => {
    navigate(`/contractor/invoice-view/${invoiceId}`);
  };

  const handleSubmitNewInvoice = () => {
    navigate('/contractor/submit-invoice');
  };

  const handleResubmitInvoice = (invoiceId) => {
    // Find the invoice data
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      // Navigate to submit invoice page with prepopulated data
      navigate('/contractor/submit-invoice', {
        state: {
          resubmit: true,
          invoiceData: invoice
        }
      });
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <ContractorDashboardLayout>
      <div className="contractor-invoices-container">
        <div className="invoices-header">
          <h1>Invoices</h1>
          <button className="new-invoice-btn" onClick={handleSubmitNewInvoice}>
            + Submit New Invoice
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="invoices-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Invoice, Client Name, Project Name, Rate/Hr, or Total Amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* <div className="date-filter-container">
            <label htmlFor="submittedOnFilter">Submitted On:</label>
            <input
              type="date"
              id="submittedOnFilter"
              value={submittedOnFilter}
              onChange={(e) => setSubmittedOnFilter(e.target.value)}
              className="date-input"
              title="Filter invoices submitted on this date"
            />
          </div> */}

          <div className="filter-options">
            <label className="filter-option">
              <input
                type="radio"
                name="invoiceFilter"
                checked={activeFilter === 'all'}
                onChange={() => setActiveFilter('all')}
              />
              <span className="filter-circle"></span>
              All
            </label>
            <label className="filter-option">
              <input
                type="radio"
                name="invoiceFilter"
                checked={activeFilter === 'accepted'}
                onChange={() => setActiveFilter('accepted')}
              />
              <span className="filter-circle"></span>
              Accepted
            </label>
            <label className="filter-option">
              <input
                type="radio"
                name="invoiceFilter"
                checked={activeFilter === 'pending'}
                onChange={() => setActiveFilter('pending')}
              />
              <span className="filter-circle"></span>
              Pending
            </label>
            <label className="filter-option">
              <input
                type="radio"
                name="invoiceFilter"
                checked={activeFilter === 'rejected'}
                onChange={() => setActiveFilter('rejected')}
              />
              <span className="filter-circle"></span>
              Rejected
            </label>
            <label className="filter-option">
              <input
                type="radio"
                name="invoiceFilter"
                checked={activeFilter === 'paid'}
                onChange={() => setActiveFilter('paid')}
              />
              <span className="filter-circle"></span>
              Paid
            </label>
          </div>

        </div>

        {/* Invoices Table */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">
            </div>
          </div>
        ) : error && invoices.length === 0 ? (
          <div className="error-container">
            <div className="error-message">Error: {error}</div>
          </div>
        ) : (
          <div className="invoices-table-container">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th className="col-invoice-id" style={{ width: '12%' }}>Invoice ID</th>
                  <th className="col-project-name" style={{ width: '20%' }}>Project Name</th>
                  <th className="col-rate" style={{ textAlign: 'center', width: '10%' }}>Rate/Hr</th>
                  <th className="col-total-amount" style={{ textAlign: 'center', width: '12%' }}>Total Amount</th>
                  <th className="col-submitted-on" style={{ textAlign: 'center', width: '12%' }}>Submitted On</th>
                  <th className="col-status" style={{ textAlign: 'center', width: '10%' }}>Invoice Status</th>
                  <th className="col-payment-status" style={{ textAlign: 'center', width: '12%' }}>Payment Status</th>
                  <th className="col-actions" style={{ textAlign: 'left', width: '12%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="invoice-row">
                    <td className="invoice-id" style={{ width: '12%' }}>{invoice.invoiceNumber}</td>
                    <td className="invoice-project" style={{ width: '20%' }}>{invoice.projectName}</td>
                    <td className="invoice-rate" style={{ textAlign: 'center', width: '10%' }}>{`$${invoice.hourlyRate}`}</td>
                    <td className="invoice-amount" style={{ textAlign: 'center', width: '12%' }}>{`$${invoice.totalAmount}`}</td>
                    <td className="invoice-date" style={{ textAlign: 'center', width: '12%' }}>{invoice.submittedOn}</td>
                    <td className="invoice-status" style={{ textAlign: 'center', width: '10%' }}>
                      <span
                        className="status-badge"
                        style={getStatusColor(invoice.status)}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="invoice-payment-status" style={{ textAlign: 'center', width: '12%' }}>
                      <span
                        className="status-badge"
                        style={getStatusColor(invoice.adminPaymentStatus)}
                      >
                        {invoice.adminPaymentStatus || 'Not Paid'}
                      </span>
                    </td>
                    <td className="invoice-actions" style={{ textAlign: 'right', width: '12%' }}>
                      <div className="action-menu">
                        <button className="actions-trigger">...</button>
                        <div className="action-dropdown">
                          <button className="action-item" onClick={() => handleViewInvoice(invoice.id)}>

                            <span className="action-label">View</span>
                          </button>
                          {invoice.status?.toLowerCase() === 'rejected' && (
                            <button className="action-item" onClick={() => handleResubmitInvoice(invoice.id)}>
                              <span className="action-icon">📤</span>
                              <span className="action-label">Resubmit</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination - Only show if more than 10 items */}
            {totalCount > pageSize && (
              <div className="pagination-container">
                <div className="pagination">
                  <button
                    className="pagination-btn prev"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    ‹‹
                  </button>
                  <button
                    className="pagination-btn prev"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (page === currentPage) {
                      return (
                        <span key={page} className="pagination-current">
                          {page}
                        </span>
                      );
                    } else if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className="pagination-btn"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="pagination-dots">...</span>;
                    }
                    return null;
                  })}

                  <button
                    className="pagination-btn next"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                  <button
                    className="pagination-btn next"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    ››
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ContractorDashboardLayout>
  );
};

export default ContractorInvoices;