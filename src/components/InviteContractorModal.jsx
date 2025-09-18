import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import { getAvatarUrl, getFallbackAvatarUrl } from '../utils/avatarUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

const InviteContractorModal = ({ isOpen, onClose, project, contractor, onInvited }) => {
  const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Removed message box per spec
  const [descOpen, setDescOpen] = useState(true);
  const [projectTypes, setProjectTypes] = useState([]);
  const [clientProjects, setClientProjects] = useState([]);
  const [selectedProjectType, setSelectedProjectType] = useState('');
  const [selectedProject, setSelectedProject] = useState(project || null);
  const [loadingProjectTypes, setLoadingProjectTypes] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Fetch project types when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProjectTypes();
    }
  }, [isOpen]);

  // Fetch projects when project type is selected
  useEffect(() => {
    if (selectedProjectType) {
      fetchProjectsByType(selectedProjectType);
    }
  }, [selectedProjectType]);

  const fetchProjectTypes = async () => {
    try {
      setLoadingProjectTypes(true);
      const token = authService.getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/project/configuration-options`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        authService.logout();
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setProjectTypes(data.projectTypes || []);
      }
    } catch (err) {
      console.error('Error fetching project types:', err);
    } finally {
      setLoadingProjectTypes(false);
    }
  };

  const fetchProjectsByType = async (projectType) => {
    try {
      setLoadingProjects(true);
      const token = authService.getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/project?status=pending&pageSize=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        authService.logout();
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        // Filter projects by selected type and ensure they are pending
        const filteredProjects = data.projects?.filter(p => 
          (p.projectType === projectType || p.type === projectType) &&
          (p.status === 'pending' || p.status === 'Pending')
        ) || [];
        setClientProjects(filteredProjects);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleProjectSelect = (projectId) => {
    const project = clientProjects.find(p => p.id === parseInt(projectId));
    setSelectedProject(project);
  };

  const sendInvite = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedProject) {
        setError('Please select a project first');
        setLoading(false);
        return;
      }
      
      if (!contractor) {
        setError('No contractor selected');
        setLoading(false);
        return;
      }
      
      const token = authService.getToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const contractorId = contractor.userId || contractor.id;
      
      const res = await fetch(`${API_BASE_URL}/project/${selectedProject.id}/invitations`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorId, message: null })
      });
      
      if (res.status === 401) { 
        authService.logout(); 
        setError('Authentication failed');
        return; 
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = 'Failed to send invite';
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If not JSON, use status-based messages
          switch (res.status) {
            case 400:
              errorMessage = 'Invalid request. Please check your selection and try again.';
              break;
            case 401:
              errorMessage = 'Authentication required. Please log in again.';
              break;
            case 403:
              errorMessage = 'You do not have permission to send invites for this project.';
              break;
            case 404:
              errorMessage = 'Project or contractor not found.';
              break;
            case 409:
              errorMessage = 'An invitation has already been sent to this contractor for this project.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = 'Failed to send invite. Please try again.';
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await res.json();
      
      onInvited && onInvited();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally { 
      setLoading(false); 
    }
  };

  if (!isOpen) return null;

  const formatId = (id) => {
    if (!id && id !== 0) return '-';
    return `#${String(id).padStart(4, '0')}`;
  };

  const tileRowStyle = {
    background: '#F5F5F5',
    borderRadius: 6,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48
  };

  const labelStyle = { fontSize: 12, color: '#6F6F6F', textTransform: 'none', textAlign: 'left', fontWeight: 600 };
  const chipStyle = {
    background: '#EFEFEF',
    borderRadius: 4,
    minHeight: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px',
    color: '#8C8C8C',
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontSize: 12
  };

  return (
    <div className="modal-overlay" style={{ overflow: 'hidden' }}>
      <div className="modal-content" style={{ maxWidth: 920, width: '100%', maxHeight: '92vh', minHeight: '70vh', overflow: 'hidden' }}>
        <div className="modal-header" style={{ alignItems:'center', borderBottom: '1px solid #EAEAEA' }}>
          <h2 style={{ margin: 0 }}>Invite <strong>Contractor</strong></h2>
          <div style={{ marginLeft: 'auto', display:'flex', alignItems:'center', gap: 16 }}>
            <div style={{ fontSize: 12, color:'#8C8C8C' }}>Project ID</div>
            <div style={{ fontSize: 12, color:'#8C8C8C' }}>{formatId(selectedProject?.id)}</div>
          </div>
        </div>

        <div className="modal-body" style={{ paddingTop: 12, textAlign: 'left', overflow: 'auto', maxHeight: 'calc(92vh - 200px)' }}>
          {/* Contractor Header */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom: 16 }}>
            <img 
              src={getAvatarUrl(contractor, 40)} 
              alt={contractor?.name || 'Contractor'} 
              className="contractor-avatar" 
              onError={(e) => {
                // Fallback to generated avatar if profile picture fails to load
                e.target.src = getFallbackAvatarUrl(contractor, 40);
              }}
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ fontWeight: 600 }}>{contractor?.name || 'Contractor'}</div>
          </div>

          {/* Project Selection */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Select Project Type</div>
            <select 
              value={selectedProjectType} 
              onChange={(e) => setSelectedProjectType(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #DDD' }}
              disabled={loadingProjectTypes}
            >
              <option value="">Select a project type...</option>
              {projectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {loadingProjectTypes && <div style={{ fontSize: 12, color: '#8C8C8C', marginTop: 4 }}>Loading project types...</div>}
          </div>

          {selectedProjectType && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>Select Project</div>
              <select 
                value={selectedProject?.id || ''} 
                onChange={(e) => handleProjectSelect(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #DDD' }}
                disabled={loadingProjects}
              >
                <option value="">Select a project...</option>
                {clientProjects.map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.name || proj.title || `Project #${proj.id}`}</option>
                ))}
              </select>
              {loadingProjects && <div style={{ fontSize: 12, color: '#8C8C8C', marginTop: 4 }}>Loading projects...</div>}
            </div>
          )}

          {selectedProject && (
            <>
              {/* Summary Tiles */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={tileRowStyle}>
                  <div style={labelStyle}>Project Type</div>
                  <div style={chipStyle}>{selectedProject?.projectType || selectedProject?.type || '-'}</div>
                </div>
                <div style={tileRowStyle}>
                  <div style={labelStyle}>Hourly Rate</div>
                  <div style={chipStyle}>{selectedProject?.hourlyRate ? `$${selectedProject.hourlyRate}/HR` : 'N/A'}</div>
                </div>
                <div style={tileRowStyle}>
                  <div style={labelStyle}>Project Title</div>
                  <div style={chipStyle}>{selectedProject?.title || selectedProject?.name || `Project #${selectedProject.id}`}</div>
                </div>
                <div style={tileRowStyle}>
                  <div style={labelStyle}>Date</div>
                  <div style={chipStyle}>{(selectedProject?.startDate?selectedProject.startDate.toString().slice(0,10):'-')} - {(selectedProject?.endDate?selectedProject.endDate.toString().slice(0,10):'-')}</div>
                </div>
              </div>
            </>
          )}

          {selectedProject && (
            <>
              {/* Project Description Accordion */}
              <div style={{ borderRadius: 6, overflow:'hidden', border:'1px solid #E3F1FB', marginBottom: 16 }}>
                <button
                  onClick={()=>setDescOpen(v=>!v)}
                  style={{ width:'100%', textAlign:'left', background:'#2BB1F2', color:'#fff', padding:'12px 16px', border:'none', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}
                >
                  <span style={{ fontWeight: 700, letterSpacing: 0.4 }}>PROJECT DESCRIPTION</span>
                  <span style={{ transform: descOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>▾</span>
                </button>
                {descOpen && (
                  <div style={{ background:'#fff', padding:'12px 16px', color:'#4B4B4B' }}>
                    {selectedProject?.description || 'No description provided'}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Disclaimer */}
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, marginBottom: 6, textAlign: 'left' }}>Disclaimer</div>
            <p style={{ margin: 0, color:'#4B4B4B', lineHeight: 1.6, textAlign: 'left' }}>
              By inviting a contractor/freelancer, you acknowledge that this platform serves only as a facilitator and does not guarantee the contractor’s
              performance, deliverables, or compliance. All agreements, negotiations, and outcomes are the responsibility of the client and the contractor.
            </p>
          </div>

          {/* Acknowledgement */}
          <div style={{ marginBottom: 8, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, marginBottom: 6, textAlign: 'left' }}>Acknowledgement</div>
            <p style={{ margin: 0, color:'#4B4B4B', lineHeight: 1.6, textAlign: 'left' }}>
              I understand that by proceeding, I am initiating a project invitation and that the contractor/freelancer may choose to accept or decline.
              I confirm that I have reviewed the project details and accept responsibility for the accuracy of the information shared.
            </p>
          </div>

          <label style={{ display:'flex', gap:8, alignItems:'center', marginTop: 8, marginBottom: 0 }}>
            <input type="checkbox" checked={acceptDisclaimer} onChange={(e)=>setAcceptDisclaimer(e.target.checked)} />
            Accept The Disclaimer
          </label>

          {error && <div className="error-message"><p>{error}</p></div>}
        </div>
        <div className="modal-footer" style={{ display:'flex', justifyContent:'flex-end', gap:16, padding:'12px 16px', marginTop:12 }}>
          <button onClick={onClose} className="cancel-btn" style={{ minWidth: 120 }}>Cancel</button>
          <button 
            onClick={sendInvite} 
            className="btn-primary" 
            style={{ 
              minWidth: 140,
              opacity: (!acceptDisclaimer || loading) ? 0.5 : 1,
              cursor: (!acceptDisclaimer || loading) ? 'not-allowed' : 'pointer'
            }} 
            disabled={!acceptDisclaimer || loading}
          >
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteContractorModal;



