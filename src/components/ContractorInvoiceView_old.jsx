import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import ContractorDashboardLayout from './ContractorDashboardLayout';
import authService from '../services/authService';

const ContractorInvoiceView = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoiceDetail();
  }, [invoiceId]);

  const fetchInvoiceDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
      const response = await fetch(`${API_BASE_URL}/invoice/${invoiceId}`, {
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
        throw new Error(`Failed to fetch invoice details: ${response.status}`);
      }

      const data = await response.json();
      setInvoice(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching invoice:', err);
      const mockInvoices = {
        1001: {
          id: 1001,
          invoiceNumber: '#NV-2025-001',
          projectName: 'Q3 Financial Audit',
          status: 'Pending',
          submittedOn: '15/07/2025',
          acceptedOn: null,
          paidOn: null,
          rejectedOn: null,
          hoursWorked: '35 Hrs',
          ratePerHour: '$75/Hr',
          taalosFeePct: '30%',
          subtotal: '$2,625.00',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$1,837.50'
        },
        1002: {
          id: 1002,
          invoiceNumber: '#NV-2025-002',
          projectName: 'Marketing Campaign Analysis',
          status: 'Accepted',
          submittedOn: '10/07/2025',
          acceptedOn: '12/07/2025',
          paidOn: null,
          rejectedOn: null,
          hoursWorked: '40 Hrs',
          ratePerHour: '$80/Hr',
          taalosFeePct: '30%',
          subtotal: '$3,200.00',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$2,240.00'
        },
        1003: {
          id: 1003,
          invoiceNumber: '#NV-2025-003',
          projectName: 'Database Migration',
          status: 'Paid',
          submittedOn: '05/07/2025',
          acceptedOn: '07/07/2025',
          paidOn: '10/07/2025',
          rejectedOn: null,
          hoursWorked: '50 Hrs',
          ratePerHour: '$90/Hr',
          taalosFeePct: '30%',
          subtotal: '$4,500.00',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$3,150.00'
        },
        1004: {
          id: 1004,
          invoiceNumber: '#NV-2025-004',
          projectName: 'UX Research Project',
          status: 'Rejected',
          submittedOn: '01/07/2025',
          acceptedOn: null,
          paidOn: null,
          rejectedOn: '03/07/2025',
          hoursWorked: '30 Hrs',
          ratePerHour: '$70/Hr',
          taalosFeePct: '30%',
          subtotal: '$2,100.00',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$1,470.00'
        },
        // Legacy IDs for backward compatibility
        1: {
          id: 1,
          invoiceNumber: '#T0001',
          projectName: 'Q3 Financial Audit',
          status: 'Accepted',
          submittedOn: '22/5/2025',
          acceptedOn: '28/5/2025',
          paidOn: null,
          rejectedOn: null,
          hoursWorked: '35 Hrs',
          ratePerHour: '$75/Hr',
          taalosFeePct: '30%',
          subtotal: '$1,870',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$1,837.50'
        },
        2: {
          id: 2,
          invoiceNumber: '#T0002',
          projectName: 'Q3 Financial Audit',
          status: 'Rejected',
          submittedOn: '22/5/2025',
          acceptedOn: null,
          paidOn: null,
          rejectedOn: '28/5/2025',
          hoursWorked: '35 Hrs',
          ratePerHour: '$75/Hr',
          taalosFeePct: '30%',
          subtotal: '$1,870',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$1,837.50'
        },
        3: {
          id: 3,
          invoiceNumber: '#T0003',
          projectName: 'Q3 Financial Audit',
          status: 'Pending',
          submittedOn: '22/5/2025',
          acceptedOn: null,
          paidOn: null,
          rejectedOn: null,
          hoursWorked: '35 Hrs',
          ratePerHour: '$75/Hr',
          taalosFeePct: '30%',
          subtotal: '$1,870',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$1,837.50'
        },
        4: {
          id: 4,
          invoiceNumber: '#T0004',
          projectName: 'Q3 Financial Audit',
          status: 'Paid',
          submittedOn: '22/5/2025',
          acceptedOn: '28/5/2025',
          paidOn: '30/5/2025',
          rejectedOn: null,
          hoursWorked: '35 Hrs',
          ratePerHour: '$75/Hr',
          taalosFeePct: '30%',
          subtotal: '$1,870',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$1,837.50'
        }
      };
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return { backgroundColor: '#d4edda', color: '#155724' };
      case 'pending':
        return { backgroundColor: '#fff3cd', color: '#856404' };
      case 'paid':
        return { backgroundColor: '#d1ecf1', color: '#0c5460' };
      case 'rejected':
        return { backgroundColor: '#f8d7da', color: '#721c24' };
      default:
        return { backgroundColor: '#f8f9fa', color: '#6c757d' };
    }
  };

  const getStatusMessage = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'This invoice has been reviewed & Accepted by the Client. It is now pending processing by the Admin Team. No further action is required at this stage.';
      case 'pending':
        return 'This invoice is currently awaiting client review. You will be notified once it has been accepted or rejected. If no action is taken within 24 - 48 hours, a reminder will be triggered.';
      case 'paid':
        return 'This invoice has been paid. Payment has been successfully processed by the admin team.';
      case 'rejected':
        return 'We\'re unable to Approve this Invoice at this time. Please review the details and Resubmit with Corrections.';
      default:
        return 'Invoice status unknown.';
    }
  };

  const getMessageStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return { backgroundColor: '#4CAF50', color: 'white' };
      case 'pending':
        return { backgroundColor: '#FFC107', color: 'white' };
      case 'paid':
        return { backgroundColor: '#2196F3', color: 'white' };
      case 'rejected':
        return { backgroundColor: '#F44336', color: 'white' };
      default:
        return { backgroundColor: '#f8f9fa', color: '#6c757d' };
    }
  };

  const handleBack = () => {
    navigate('/contractor/invoices');
  };

  const handleMessageClient = () => {
    // Navigate to messaging with client
    navigate('/contractor-messages');
  };

  const handleCancelInvoice = () => {
    // Handle cancel invoice
    console.log('Cancel invoice');
  };

  const handleEdit = () => {
    // Handle edit invoice
    console.log('Edit invoice');
  };

  const handleSubmitInvoice = () => {
    // Handle submit invoice (for pending status)
    navigate('/contractor/submit-invoice');
  };

  const calculateTotals = () => {
    if (!invoice) return { taalosFeeDollar: '$0', netTotal: '$0' };

    // Extract numeric values from string amounts
    const ratePerHour = parseFloat(invoice.ratePerHour.replace('$', '').replace(',', ''));
    const hoursWorked = parseInt(invoice.hoursWorked.replace(' Hrs', ''));
    const taalosFeePct = parseFloat(invoice.taalosFeePct.replace('%', '')) / 100;

    const subtotal = ratePerHour * hoursWorked;
    const taalosFeeDollar = subtotal * taalosFeePct;
    const netTotal = subtotal + taalosFeeDollar;

    return {
      taalosFeeDollar: `$${taalosFeeDollar.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      netTotal: `$${netTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    };
  };

  const renderHeaderButtons = () => {
    const status = invoice?.status?.toLowerCase();

    if (status === 'pending') {
      return (
        <div className="invoice-header-buttons">
          <button className="header-btn secondary" onClick={handleBack}>← Back</button>
          <button className="header-btn secondary" onClick={handleMessageClient}>Chat with Client</button>
        </div>
      );
    } else if (status === 'rejected') {
      return (
        <div className="invoice-header-buttons">
          <button className="header-btn secondary" onClick={handleBack}>← Back</button>
          <button className="header-btn primary" onClick={handleSubmitInvoice}>Edit Invoice</button>
        </div>
      );
    } else if (status === 'accepted') {
      return (
        <div className="invoice-header-buttons">
          <button className="header-btn secondary" onClick={handleBack}>← Back</button>
          <button className="header-btn secondary" onClick={handleMessageClient}>Chat with Client</button>
          <button className="header-btn primary" onClick={handleSubmitInvoice}>Edit Invoice</button>
        </div>
      );
    } else if (status === 'paid') {
      return (
        <div className="invoice-header-buttons">
          <button className="header-btn secondary" onClick={handleBack}>← Back</button>
        </div>
      );
    } else {
      return (
        <div className="invoice-header-buttons">
          <button className="header-btn secondary" onClick={handleBack}>← Back</button>
        </div>
      );
    }
  };

  const renderStatusSpecificField = () => {
    const status = invoice?.status?.toLowerCase();

    if (status === 'accepted' && invoice.acceptedOn) {
      return (
        <div className="detail-row">
          <span className="detail-label">Accepted On</span>
          <span className="detail-value">{invoice.acceptedOn}</span>
        </div>
      );
    } else if (status === 'paid' && invoice.paidOn) {
      return (
        <div className="detail-row">
          <span className="detail-label">Paid On</span>
          <span className="detail-value">{invoice.paidOn}</span>
        </div>
      );
    } else if (status === 'rejected' && invoice.rejectedOn) {
      return (
        <div className="detail-row">
          <span className="detail-label">Rejected On</span>
          <span className="detail-value">{invoice.rejectedOn}</span>
        </div>
      );
    }
    return null;
  };

  const renderStatusMessage = () => {
    const status = invoice?.status?.toLowerCase();
    let messageTitle = '';
    let icon = '';

    if (status === 'rejected') {
      messageTitle = 'Rejection Message';
      icon = '✖';
    } else if (status === 'accepted') {
      messageTitle = 'Accepted Message';
      icon = '✓';
    } else if (status === 'paid') {
      messageTitle = 'Paid Message';
      icon = '✓';
    } else if (status === 'pending') {
      messageTitle = 'Pending Message';
      icon = '⏳';
    }

    if (messageTitle) {
      return (
        <div className="status-message-container">
          <div className="status-message" style={{
            ...getMessageStyle(invoice.status),
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div className="status-message-icon" style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              {icon}
            </div>
            <div>
              <div className="status-message-header" style={{
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '16px'
              }}>
                {messageTitle}
              </div>
              <div className="status-message-text" style={{
                lineHeight: '1.5'
              }}>
                {getStatusMessage(invoice.status)}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <ContractorDashboardLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </ContractorDashboardLayout>
    );
  }

  if (error && !invoice) {
    return (
      <ContractorDashboardLayout>
        <div className="error-container">
          <div className="error-message">Error: {error}</div>
        </div>
      </ContractorDashboardLayout>
    );
  }

  return (
    <ContractorDashboardLayout>
      <div className="invoice-view-container">
        <div className="invoice-view-header">
          <h1>Invoice </h1>
          {renderHeaderButtons()}
        </div>

        {/* Status Message at top */}
        {renderStatusMessage()}

        <div className="invoice-view-content">
          <div className="invoice-summary-section">
            <div className="invoice-summary-card">
              <h3>Invoice Summary</h3>
              <div className="invoice-summary-details">
                <div className="detail-row">
                  <span className="detail-label">Invoice ID</span>
                  <span className="detail-value">{invoice.invoiceNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Project Name</span>
                  <span className="detail-value">{invoice.projectName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span
                    className="detail-value status-badge"
                    style={getStatusStyle(invoice.status)}
                  >
                    {invoice.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Submitted On</span>
                  <span className="detail-value">{invoice.submittedOn}</span>
                </div>
                {renderStatusSpecificField()}
              </div>
            </div>
          </div>

          <div className="invoice-detail-section">
            <div className="invoice-detail-card" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div className="invoice-detail-details">
                <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="detail-label" style={{ color: '#000000' }}>Billing Period:</span>
                  <span className="detail-value" style={{ fontWeight: '500' }}>{invoice.billingPeriod || 'JULY 1 - JULY 15, 2025'}</span>
                </div>
                <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="detail-label" style={{ color: '#000000' }}>Hours Worked:</span>
                  <span className="detail-value" style={{ fontWeight: '500' }}>{invoice.hoursWorked}</span>
                </div>
                <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="detail-label" style={{ color: '#000000' }}>Hourly Rate:</span>
                  <span className="detail-value" style={{ fontWeight: '500' }}>{invoice.ratePerHour}</span>
                </div>
                <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="detail-label" style={{ color: '#000000' }}>Taalos Platform Fee ({invoice.taalosFeePct}):</span>
                  <span className="detail-value" style={{ fontWeight: '500' }}>-$787.50</span>
                </div>
                <div className="detail-row total-row" style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                  <span className="detail-label" style={{ fontWeight: 'bold', fontSize: '16px' }}>Net Payout</span>
                  <span className="detail-value" style={{ fontWeight: 'bold', fontSize: '16px' }}>{invoice.netPayout || '$1,837.50'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ContractorDashboardLayout>
  );
};

export default ContractorInvoiceView;