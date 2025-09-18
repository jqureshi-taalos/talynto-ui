import React, { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import authService from '../services/authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

const ClientInvitations = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = authService.getToken();
      if (!token) return;
      const params = new URLSearchParams({ status: statusFilter, page: page.toString(), pageSize: '10' });
      const res = await fetch(`${API_BASE_URL}/project/invitations?${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.status === 401) { authService.logout(); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInvitations(data.invitations || []);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      setError('Failed to load invitations');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInvitations(); }, [statusFilter, page]);

  const cancelInvite = async (invitationId) => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/project/invitations/${invitationId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      });
      if (!res.ok) throw new Error('Failed');
      await fetchInvitations();
    } catch (e) { setError('Failed to cancel invite'); }
  };

  return (
    <DashboardLayout>
      <div className="projects-container">
        <div className="projects-header">
          <h1>Manage <strong>Invitations</strong></h1>
        </div>

        <div className="projects-filter">
          <div className="filter-options">
            {['all','pending','rejected','cancelled','accepted'].map(s => (
              <label key={s} className="filter-option">
                <input type="radio" name="invFilter" checked={statusFilter===s} onChange={() => { setStatusFilter(s); setPage(1); }} />
                <span className="filter-circle"></span>
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {error && <div className="error-message"><p>{error}</p></div>}
        {loading ? (
          <div className="loading-container"><div className="loading-spinner"></div></div>
        ) : (
          <div className="projects-table-container">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Contractor</th>
                  <th>Status</th>
                  <th style={{ textAlign:'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr><td colSpan="4" className="no-projects">No invitations</td></tr>
                ) : invitations.map(inv => (
                  <tr key={inv.id} className="project-row">
                    <td className="project-name-cell"><div className="project-name-container"><span className="project-name">{inv.project?.name}</span></div></td>
                    <td>{inv.contractor?.name || inv.contractorId}</td>
                    <td><span className="status-badge">{inv.status}</span></td>
                    <td style={{ textAlign:'right' }}>
                      {inv.status === 'Pending' && (
                        <button className="action-item" onClick={() => cancelInvite(inv.id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-controls">
              <button className="pagination-btn" disabled={page===1} onClick={() => setPage(page-1)}>Previous</button>
              <span className="pagination-current">Page {page} of {totalPages}</span>
              <button className="pagination-btn" disabled={page===totalPages} onClick={() => setPage(page+1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientInvitations;



