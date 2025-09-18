import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import ContractorDashboardLayout from './ContractorDashboardLayout';
import authService from '../services/authService';
import InvoiceViewIcon from './InvoiceViewIcon';
import InvoiceViewRejectIcon from './InvoiceViewRejectIcon';
import BackLinkIcon from './BackLinkIcon'

const ContractorInvoiceView = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoiceDetail();
  }, [invoiceId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

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

      // Fallback to mock data for development/demo
      const mockInvoices = {
        1001: {
          id: 1001,
          invoiceNumber: '#NV-2025-001',
          projectName: 'Q3 Financial Audit',
          status: 'Pending',
          submittedOn: '22/5/2025',
          acceptedOn: null,
          paidOn: null,
          rejectedOn: null,
          hoursWorked: '35 Hrs',
          ratePerHour: '$75/Hr',
          taalosFeePct: '30%',
          taalosFeeAmount: '$787.50',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$1,837.50'
        },
        1002: {
          id: 1002,
          invoiceNumber: '#NV-2025-002',
          projectName: 'Year-End Tax Review',
          status: 'Accepted',
          submittedOn: '22/5/2025',
          acceptedOn: '28/5/2025',
          paidOn: null,
          rejectedOn: null,
          hoursWorked: '35 Hrs',
          ratePerHour: '$75/Hr',
          taalosFeePct: '30%',
          taalosFeeAmount: '$787.50',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$1,837.50'
        },
        1003: {
          id: 1003,
          invoiceNumber: '#NV-2025-003',
          projectName: 'Database Migration',
          status: 'Paid',
          submittedOn: '22/5/2025',
          acceptedOn: '28/5/2025',
          paidOn: '30/5/2025',
          rejectedOn: null,
          hoursWorked: '35 Hrs',
          ratePerHour: '$75/Hr',
          taalosFeePct: '30%',
          taalosFeeAmount: '$787.50',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$1,837.50'
        },
        1004: {
          id: 1004,
          invoiceNumber: '#NV-2025-004',
          projectName: 'Customer Onboarding System',
          status: 'Rejected',
          submittedOn: '22/5/2025',
          acceptedOn: '28/5/2025',
          paidOn: null,
          rejectedOn: null,
          hoursWorked: '35 Hrs',
          ratePerHour: '$75/Hr',
          taalosFeePct: '30%',
          taalosFeeAmount: '$787.50',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$1,837.50'
        },
        3: {
          id: 3,
          invoiceNumber: '#T0003',
          projectName: 'IPO Readiness Assessment',
          status: 'Pending',
          submittedOn: '22/5/2025',
          acceptedOn: null,
          paidOn: null,
          rejectedOn: null,
          hoursWorked: '35 Hrs',
          ratePerHour: '$75/Hr',
          taalosFeePct: '30%',
          taalosFeeAmount: '$787.50',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$1,837.50'
        },
        4: {
          id: 4,
          invoiceNumber: '#T0004',
          projectName: 'IPO Readiness Assessment',
          status: 'Paid',
          submittedOn: '22/5/2025',
          acceptedOn: '28/5/2025',
          paidOn: '30/5/2025',
          rejectedOn: null,
          hoursWorked: '35 Hrs',
          ratePerHour: '$75/Hr',
          taalosFeePct: '30%',
          taalosFeeAmount: '$787.50',
          billingPeriod: 'JULY 1 - JULY 15, 2025',
          netPayout: '$1,837.50'
        }
      };

      // Use mock data based on invoiceId or fallback to first invoice
      setInvoice(mockInvoices[invoiceId] || mockInvoices[1001]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/contractor-invoices');
  };

  const handleChatWithClient = () => {
    // Navigate to contractor messages page with specific client chat opened
    const clientId = invoice?.clientId || invoice?.client?.id;
    if (clientId) {
      navigate('/contractor-messages', { state: { openChatWithClient: clientId } });
    } else {
      navigate('/contractor-messages');
    }
  };

  const handleEditInvoice = () => {
    navigate('/contractor-submit-new-invoice', {
      state: {
        editMode: true,
        invoiceData: invoice
      }
    });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return {
          backgroundColor: '#E2FFD8',
          color: '#5DBD39',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        };
      case 'pending':
        return {
          backgroundColor: '#FFF8D8',
          color: '#DDB70B',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        };
      case 'paid':
        return {
          backgroundColor: '#E6E5FF',
          color: '#2320D7',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        };
      case 'rejected':
        return {
          backgroundColor: '#FFE0DE',
          color: '#D72E20',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        };
      default:
        return {
          backgroundColor: '#6c757d',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        };
    }
  };

  const getPaymentStatusBadgeStyle = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
        return {
          backgroundColor: '#2320D7',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        };
      case 'not paid':
      case 'unpaid':
        return {
          backgroundColor: '#F73424',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        };
      case 'processing':
        return {
          backgroundColor: '#DDB70B',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        };
      default:
        return {
          backgroundColor: '#6c757d',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        };
    }
  };

  const renderStatusBanner = () => {
    const status = invoice?.status?.toLowerCase();
    const isPaid =
      invoice?.adminPaymentStatus?.toLowerCase() === 'paid' ||
      invoice?.status?.toLowerCase() === 'paid';

    const bannerStyles = {
      padding: '16px 20px',
      borderRadius: '8px',
      marginBottom: '24px',
      display: 'flex',
      flexDirection: 'column', // column so title+icon row and detail below
      gap: '6px',
      color: 'white',
    };

    const titleRowStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap', // for mobile responsiveness
    };

    const messageTitleStyle = {
      fontWeight: 'bold',
      margin: 0,
    };

    const messageDetailStyle = {
      fontSize: '14px',
      lineHeight: '1.4',
      textAlign: 'left'
    };

    switch (status) {
      case 'accepted':
        return (
          <div style={{ ...bannerStyles, backgroundColor: '#5DBD39' }}>
            <div style={titleRowStyles}>
              <span style={{ fontSize: '20px', marginTop: '5px' }}><InvoiceViewIcon /></span>
              <span style={messageTitleStyle}>Accepted Message</span>
            </div>
            <div style={messageDetailStyle}>
              This invoice has been reviewed & Accepted by the Client. It is now pending processing by the Admin Team. No further action is required at this stage.
            </div>
          </div>
        );

      case 'rejected':
        return (
          <div style={{ ...bannerStyles, backgroundColor: '#F73424' }}>
            <div style={titleRowStyles}>
              <span style={{ fontSize: '20px', marginTop: '5px' }}><InvoiceViewRejectIcon /></span>
              <span style={messageTitleStyle}>Rejection Message</span>
            </div>
            <div style={messageDetailStyle}>
              We're unable to Approve this invoice at this time. Please review the details and Resubmit with Corrections.
            </div>
          </div>
        );

      case 'paid':
        return (
          <div style={{ ...bannerStyles, backgroundColor: '#2320D7' }}>
            <div style={titleRowStyles}>
              <span style={{ fontSize: '20px', marginTop: '5px' }}><InvoiceViewIcon /></span>
              <span style={messageTitleStyle}>Paid Message</span>
            </div>
            <div style={messageDetailStyle}>
              This invoice has been paid. Payment has been successfully processed by the admin team.
            </div>
          </div>
        );

      case 'pending':
        return (
          <div style={{ ...bannerStyles, backgroundColor: '#DDB70B' }}>
            <div style={titleRowStyles}>
              <span style={{ fontSize: '20px', marginTop: '5px' }}><InvoiceViewIcon /></span>
              <span style={messageTitleStyle}>Pending Message</span>
            </div>
            <div style={messageDetailStyle}>
              This invoice is currently awaiting client review. You will be notified once it has been accepted or rejected. If no action is taken within 24-48 hours, a reminder will be triggered.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderActionButtons = () => {
    const status = invoice?.status?.toLowerCase();
    const buttonStyle = {
      padding: '0.5rem 1rem ',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      marginLeft: '8px'
    };

    const secondaryButtonStyle = {
      ...buttonStyle,
      background: 'linear-gradient(180deg, #999BA1 0%, #5C5C5C 100%)',
      color: 'white'
    };

    const primaryButtonStyle = {
      ...buttonStyle,
      background: 'linear-gradient(180deg, #59C7F7 0%, #33B1DD 100%)',
      color: 'white'
    };

    switch (status) {
      case 'rejected':
        return (
          <>
            <button
              onClick={handleChatWithClient}
              style={secondaryButtonStyle}
            >
              Chat with Client
            </button>
            <button
              onClick={handleEditInvoice}
              style={primaryButtonStyle}
            >
              Edit Invoice
            </button>
          </>
        );
      case 'pending':
        return (
          <button
            onClick={handleChatWithClient}
            style={secondaryButtonStyle}
          >
            Chat with Client
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <ContractorDashboardLayout>
        <div style={{ padding: '20px' }}>
          <div>Loading invoice details...</div>
        </div>
      </ContractorDashboardLayout>
    );
  }

  if (error && !invoice) {
    return (
      <ContractorDashboardLayout>
        <div style={{ padding: '20px' }}>
          <div style={{ color: 'red' }}>Error: {error}</div>
          <button onClick={handleBack} style={{ marginTop: '10px' }}>← Back to Invoices</button>
        </div>
      </ContractorDashboardLayout>
    );
  }

  return (
    <ContractorDashboardLayout>
      <div style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', margin: 0 }}>
            <span style={{ fontWeight: 400 }}>Invoice</span>{' '}
            <span style={{ fontWeight: 'bold' }}>Summary</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={handleBack}
              style={{
                background: 'white',
                padding: '0.5rem 1rem',
                boxShadow: '0 2px 3px 0 #D9D9D9',
                borderRadius: '8px',
                border: 'none',
                color: '#4EC1EF',
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
              <BackLinkIcon /> Back
            </button>
            {renderActionButtons()}
          </div>
        </div>

        {/* Status Banner */}
        {renderStatusBanner()}

        {/* Main Content */}
        <div className="invoice-grid">
          {/* Left Column - Invoice Details */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <div style={{ color: '#000000', fontSize: '14px', marginBottom: '4px' }}>Invoice ID:</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{invoice.invoiceNumber}</div>
            </div>

            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <div style={{ color: '#000000', fontSize: '14px', marginBottom: '4px' }}>Project Name</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '16px', fontWeight: '500' }}>
                  {invoice.projectName || invoice.project?.name}
                </span>
                <span style={getStatusBadgeStyle(invoice.status)}>
                  {invoice.status}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <div style={{ color: '#000000', fontSize: '14px', marginBottom: '4px' }}>Payment Status</div>
              <span style={getPaymentStatusBadgeStyle(invoice.adminPaymentStatus)}>
                {invoice.adminPaymentStatus || 'Not Paid'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left' }}>
              <div>
                <div style={{ color: '#000000', fontSize: '14px', marginBottom: '4px' }}><strong>Submitted Date: </strong>{invoice.submittedOn}</div>
              </div>
              <div>
                <div style={{ color: '#000000', fontSize: '14px', marginBottom: '4px' }}><strong>Accepted Date: </strong>{invoice.acceptedAt ? formatDate(invoice.acceptedAt) : ''}</div>
              </div>
            </div>

            {invoice.status?.toLowerCase() === 'paid' && invoice.paidOn && (
              <div style={{ marginTop: '16px', textAlign: 'left' }}>
                <div style={{ color: '#000000', fontSize: '14px', marginBottom: '4px' }}>Paid Date:</div>
                <div style={{ fontSize: '14px' }}>{invoice.paidOn}</div>
              </div>
            )}
          </div>

          {/* Right Column - Payment Summary */}
          {/* <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'left'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex' }}>
              <div style={{ color: '#000000', fontSize: '14px', marginBottom: '4px' }}>Billing Period:</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{invoice.billingPeriod}</div>
            </div>

            <div style={{ marginBottom: '16px', display: 'flex' }}>
              <div style={{ color: '#000000', fontSize: '14px', marginBottom: '4px' }}>Hours Worked:</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{invoice.hoursWorked}</div>
            </div>

            <div style={{ marginBottom: '16px', display: 'flex' }}>
              <div style={{ color: '#000000', fontSize: '14px', marginBottom: '4px' }}>Hourly Rate:</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{invoice.ratePerHour}</div>
            </div>

            <div style={{ marginBottom: '16px', display: 'flex' }}>
              <div style={{ color: '#000000', fontSize: '14px', marginBottom: '4px' }}>
                Taalos Platform Fee ({invoice.taalosFeePct || invoice.taalosFeePct || invoice.taalosFeePercentage ?
                  (invoice.taalosFeePct || invoice.taalosFeePercentage + '%') : '30%'}):
              </div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>
                -{invoice.taalosFeeAmount || invoice.taalosFeeAmount ||
                  (invoice.subtotal && invoice.subtotal !== '0' ?
                    '$' + (parseFloat(invoice.subtotal.replace('$', '').replace(',', '')) * 0.30).toFixed(2) :
                    '$0.00')}
              </div>
            </div>

            <div style={{
              borderTop: '1px solid #eee',
              paddingTop: '16px',
              marginTop: '16px',
              display: 'flex'
            }}>
              <div style={{ color: '#000', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                Net Payout
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {invoice.netPayout || invoice.netAmount ||
                  (invoice.subtotal && invoice.taalosFeeAmount ?
                    '$' + (parseFloat(invoice.subtotal.replace('$', '').replace(',', '')) * 0.70).toFixed(2) :
                    invoice.hoursWorked && invoice.ratePerHour ?
                      '$' + (parseFloat(invoice.hoursWorked.replace(' Hrs', '')) * parseFloat(invoice.ratePerHour.replace('$', '').replace('/Hr', '')) * 0.70).toFixed(2) :
                      '$0.00')}
              </div>
            </div>
          </div> */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'left'
          }}>
            {/* Row Item */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', paddingRight: '16px' }}>
              <div style={{ color: '#000000', fontSize: '14px' }}>Billing Period:</div>
              <div style={{ fontSize: '14px', color: '#7A7A7A' }}>{invoice.billingPeriod}</div>
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', paddingRight: '16px' }}>
              <div style={{ color: '#000000', fontSize: '14px' }}>Hours Worked:</div>
              <div style={{ fontSize: '14px', color: '#7A7A7A' }}>{invoice.hoursWorked}</div>
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', paddingRight: '16px' }}>
              <div style={{ color: '#000000', fontSize: '14px' }}>Hourly Rate:</div>
              <div style={{ fontSize: '14px', color: '#7A7A7A' }}>{invoice.ratePerHour}</div>
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', paddingRight: '16px' }}>
              <div style={{ color: '#000000', fontSize: '14px' }}>
                Taalos Platform Fee ({invoice.taalosFeePct || invoice.taalosFeePercentage
                  ? (invoice.taalosFeePct || invoice.taalosFeePercentage + '%') : '30%'}):
              </div>
              <div style={{ fontSize: '14px', color: '#7A7A7A' }}>
                -{invoice.taalosFeeAmount ||
                  (invoice.subtotal && invoice.subtotal !== '0'
                    ? '$' + (parseFloat(invoice.subtotal.replace('$', '').replace(',', '')) * 0.30).toFixed(2)
                    : '$0.00')}
              </div>
            </div>

            <div style={{
              borderTop: '1px solid #eee',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              borderRadius: '8px',
              background: '#F4F4F4'
            }}>
              <div style={{ color: '#000', fontSize: '16px', fontWeight: 'bold' }}>Net Payout</div>
              <div style={{ fontSize: '16px', color: '#7A7A7A' }}>
                {invoice.netPayout || invoice.netAmount ||
                  (invoice.subtotal && invoice.taalosFeeAmount
                    ? '$' + (parseFloat(invoice.subtotal.replace('$', '').replace(',', '')) * 0.70).toFixed(2)
                    : invoice.hoursWorked && invoice.ratePerHour
                      ? '$' + (parseFloat(invoice.hoursWorked.replace(' Hrs', '')) * parseFloat(invoice.ratePerHour.replace('$', '').replace('/Hr', '')) * 0.70).toFixed(2)
                      : '$0.00')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContractorDashboardLayout>
  );
};

export default ContractorInvoiceView;