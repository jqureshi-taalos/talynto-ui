import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ChangePassword from './components/ChangePassword';
import EmailVerification from './components/EmailVerification';
import ContractorIntakeForm from './components/ContractorIntakeForm';
import ProfileSubmittedSuccessfully from './components/ProfileSubmittedSuccessfully';
import ProfileRejected from './components/ProfileRejected';
import ClientCreateProject from './components/ClientCreateProject';
import ClientProjects from './components/ClientProjects';
import ClientViewProject from './components/ClientViewProject';
import ClientEditProject from './components/ClientEditProject';
import ContractorProjects from './components/ContractorProjects';
import ContractorProjectSummary from './components/ContractorProjectSummary';
import AdminDashboard from './components/AdminDashboard';
import ContractorDashboard from './components/ContractorDashboard';
import ClientDashboard from './components/ClientDashboard';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
// New Client Components
import ClientFindTalent from './components/ClientFindTalent';
import ClientInvoice from './components/ClientInvoice';
import ClientInvoiceRequests from './components/ClientInvoiceRequests';
import ClientMessages from './components/ClientMessages';
import ClientNotifications from './components/ClientNotifications';
import ClientProfileSettings from './components/ClientProfileSettings';
import ClientWishlistViewProfile from './components/ClientWishlistViewProfile';
// New Contractor Components
import ContractorEditProfile from './components/ContractorEditProfile';
import ContractorInvoices from './components/ContractorInvoices';
import ContractorMessages from './components/ContractorMessages';
import ContractorNotifications from './components/ContractorNotifications';
import ContractorRequestedInvoice from './components/ContractorRequestedInvoice';
import ContractorSubmitNewInvoice from './components/ContractorSubmitNewInvoice';
import ContractorInvoiceView from './components/ContractorInvoiceView';
// Contractor Job Requests now integrated into ContractorProjects tab UI
// Removed separate client invitations route; invitations now live under My Projects
// Admin Components
import AdminSettings from './components/AdminSettings';
import AdminNotifications from './components/AdminNotifications';
import AdminContractorIntake from './components/AdminContractorIntake';
import AdminInvoiceView from './components/AdminInvoiceView';
import AdminInvoices from './components/AdminInvoices';
import AdminInvoiceViewRejected from './components/AdminInvoiceViewRejected';
import AdminInvoiceViewAccepted from './components/AdminInvoiceViewAccepted';
import AdminInvoiceViewPaid from './components/AdminInvoiceViewPaid';
import AdminProjectManagement from './components/AdminProjectManagement';
import AdminProjectView from './components/AdminProjectView';
import AdminProjectManagementView from './components/AdminProjectManagementView';
import AdminViewProjectManagement from './components/AdminViewProjectManagement';
import AdminViewProjectActiveManagement from './components/AdminViewProjectActiveManagement';
import AdminUserManagement from './components/AdminUserManagement';
import AdminContractorProfile from './components/AdminContractorProfile';
import AdminClientProfile from './components/AdminClientProfile';
import AdminLogin from './components/AdminLogin';
import AdminConfiguration from './components/AdminConfiguration';
import PublicProjectView from './components/PublicProjectView';
import authService from './services/authService';
import './App.css';

function App() {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  useEffect(() => {
    authService.initializeInactivityTracking();
    // authService.initializeSecurityListeners();
  }, []);

  const getDefaultRoute = () => {
    if (!isAuthenticated) {
      // Always redirect to client/contractor login, never admin login
      return '/login';
    }
    
    const normalizedRole = user?.role ? user.role.toLowerCase() : '';
    
    switch (normalizedRole) {
      case 'admin':
        return '/admin-dashboard';
      case 'contractor':
        return '/contractor-dashboard';
      case 'client':
        return '/dashboard';
      default:
        // Default to client/contractor login
        return '/login';
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
          <Route path="/share/:shareToken" element={<PublicProjectView />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/contractor-intake-form" element={<ContractorIntakeForm />} />
          <Route path="/profile-submitted-successfully" element={<ProfileSubmittedSuccessfully />} />
          <Route path="/profile-rejected" element={<ProfileRejected />} />
          <Route path="/client-create-project" element={<ProtectedRoute requiredRole="Client"><ClientCreateProject /></ProtectedRoute>} />
          <Route path="/client-projects" element={<ProtectedRoute requiredRole="Client"><ClientProjects /></ProtectedRoute>} />
          <Route path="/client-view-project/:projectId" element={<ProtectedRoute requiredRole="Client"><ClientViewProject /></ProtectedRoute>} />
          <Route path="/client-edit-project/:projectId" element={<ProtectedRoute requiredRole="Client"><ClientEditProject /></ProtectedRoute>} />
          <Route path="/contractor-projects" element={<ProtectedRoute requiredRole="Contractor"><ContractorProjects /></ProtectedRoute>} />
          {/* Job Requests are displayed within /contractor-projects tabs */}
          <Route path="/contractor-project-summary/:projectId" element={<ProtectedRoute requiredRole="Contractor"><ContractorProjectSummary /></ProtectedRoute>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Admin Login Route - No protection needed */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route path="/admin-dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin-settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
          <Route path="/admin-notifications" element={<AdminProtectedRoute><AdminNotifications /></AdminProtectedRoute>} />

          {/* <Route path="/admin-contractor-intake" element={<AdminProtectedRoute><AdminContractorIntake /></AdminProtectedRoute>} /> */}
          <Route path="/admin-invoices" element={<AdminProtectedRoute><AdminInvoices /></AdminProtectedRoute>} />
          <Route path="/admin-invoice/:invoiceId" element={<AdminProtectedRoute><AdminInvoiceView /></AdminProtectedRoute>} />
          <Route path="/admin-invoice/:invoiceId/rejected" element={<AdminProtectedRoute><AdminInvoiceViewRejected /></AdminProtectedRoute>} />
          <Route path="/admin-invoice/:invoiceId/accepted" element={<AdminProtectedRoute><AdminInvoiceViewAccepted /></AdminProtectedRoute>} />
          <Route path="/admin-invoice/:invoiceId/paid" element={<AdminProtectedRoute><AdminInvoiceViewPaid /></AdminProtectedRoute>} />
          <Route path="/admin-project-management" element={<AdminProtectedRoute><AdminProjectManagement /></AdminProtectedRoute>} />
          <Route path="/admin-project/:projectId" element={<AdminProtectedRoute><AdminProjectView /></AdminProtectedRoute>} />
          <Route path="/admin-project-management/:projectId" element={<AdminProtectedRoute><AdminProjectManagementView /></AdminProtectedRoute>} />
          <Route path="/admin-project-management/view-project/:projectId" element={<AdminProtectedRoute><AdminViewProjectManagement /></AdminProtectedRoute>} />
          <Route path="/admin-project-management/view-project-active/:projectId" element={<AdminProtectedRoute><AdminViewProjectActiveManagement /></AdminProtectedRoute>} />
          <Route path="/admin-user-management" element={<AdminProtectedRoute><AdminUserManagement /></AdminProtectedRoute>} />
          <Route path="/admin-user-management/contractor/:contractorId" element={<AdminProtectedRoute><AdminContractorProfile /></AdminProtectedRoute>} />
          <Route path="/admin-user-management/client/:clientId" element={<AdminProtectedRoute><AdminClientProfile /></AdminProtectedRoute>} />
          <Route path="/admin-configuration" element={<AdminProtectedRoute><AdminConfiguration /></AdminProtectedRoute>} />
          
          <Route path="/contractor-dashboard" element={<ProtectedRoute requiredRole="Contractor"><ContractorDashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="Client"><ClientDashboard /></ProtectedRoute>} />
          <Route path="/client-dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/client-dashboard/create-project" element={<Navigate to="/create-project" replace />} />
          <Route path="/client-dashboard/projects" element={<Navigate to="/projects" replace />} />
          <Route path="/client-dashboard/talent" element={<Navigate to="/talent" replace />} />
          <Route path="/client-dashboard/invoices" element={<Navigate to="/invoices" replace />} />
          <Route path="/client-dashboard/messages" element={<Navigate to="/messages" replace />} />
          <Route path="/client-dashboard/settings" element={<Navigate to="/settings" replace />} />
          <Route path="/client-dashboard/notifications" element={<Navigate to="/notifications" replace />} />
          
          {/* Protected Client Routes */}
          <Route path="/create-project" element={<ProtectedRoute requiredRole="Client"><ClientCreateProject /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute requiredRole="Client"><ClientProjects /></ProtectedRoute>} />
          {/* Invitations are displayed inside /projects tab UI */}
          <Route path="/talent" element={<ProtectedRoute requiredRole="Client"><ClientFindTalent /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute requiredRole="Client"><ClientInvoiceRequests /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute requiredRole="Client"><ClientMessages /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute requiredRole="Client"><ClientProfileSettings /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute requiredRole="Client"><ClientNotifications /></ProtectedRoute>} />
          <Route path="/client-invoice/:invoiceId" element={<ProtectedRoute requiredRole="Client"><ClientInvoice /></ProtectedRoute>} />
          <Route path="/client-wishlist-view-profile/:talentId" element={<ProtectedRoute requiredRole="Client"><ClientWishlistViewProfile /></ProtectedRoute>} />
          
          {/* Protected Contractor Routes */}
          <Route path="/contractor-edit-profile" element={<ProtectedRoute requiredRole="Contractor"><ContractorEditProfile /></ProtectedRoute>} />
          <Route path="/contractor-invoices" element={<ProtectedRoute requiredRole="Contractor"><ContractorInvoices /></ProtectedRoute>} />
          <Route path="/contractor/invoice-view/:invoiceId" element={<ProtectedRoute requiredRole="Contractor"><ContractorInvoiceView /></ProtectedRoute>} />
          <Route path="/contractor/submit-invoice" element={<ProtectedRoute requiredRole="Contractor"><ContractorSubmitNewInvoice /></ProtectedRoute>} />
          <Route path="/contractor-messages" element={<ProtectedRoute requiredRole="Contractor"><ContractorMessages /></ProtectedRoute>} />
          <Route path="/contractor-notifications" element={<ProtectedRoute requiredRole="Contractor"><ContractorNotifications /></ProtectedRoute>} />
          <Route path="/contractor-requested-invoice/:invoiceId" element={<ProtectedRoute requiredRole="Contractor"><ContractorRequestedInvoice /></ProtectedRoute>} />
          <Route path="/contractor-submit-new-invoice" element={<ProtectedRoute requiredRole="Contractor"><ContractorSubmitNewInvoice /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;