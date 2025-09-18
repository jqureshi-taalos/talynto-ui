import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import authService from '../services/authService';
import { getAvatarUrl } from '../utils/avatarUtils';
import { createDropdownPositionHandler } from '../utils/dropdownUtils';
import DashboardLayout from './DashboardLayout';
import AssignProjectPopup from './AssignProjectPopup';
import InviteContractorModal from './InviteContractorModal';

const ClientFindTalent = () => {
  const [activeTab, setActiveTab] = useState('find');
  const [filters, setFilters] = useState({
    expertise: '',
    locations: '',
    availability: '',
    certifications: '',
    workModel: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [talents, setTalents] = useState([]);
  const [shortlistedTalents, setShortlistedTalents] = useState([]);
  const [hiredContractors, setHiredContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0
  });
  const [shortlistedPagination, setShortlistedPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0
  });
  const [hiredPagination, setHiredPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0
  });
  const [countries, setCountries] = useState([]);
  const [showAssignProjectPopup, setShowAssignProjectPopup] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [selectedContractorIdForRemoval, setSelectedContractorIdForRemoval] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteContractor, setInviteContractor] = useState(null);
  const [inviteProject, setInviteProject] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

  useEffect(() => {
    fetchCountries();
  }, []);

  //   useEffect(() => {
  //   fetchTalents(null, false);
  //   fetchShortlistedTalents();
  //   fetchHiredContractors();
  // }, []); // run once at mount

  useEffect(() => {
    fetchTalents(null, false);
    fetchShortlistedTalents();
    fetchHiredContractors();
  }, [activeTab, pagination.page, shortlistedPagination.page, hiredPagination.page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search effect
  useEffect(() => {
    // Skip initial render when searchTerm is empty and filters are default
    const hasSearchCriteria = searchTerm.trim() !== '' ||
      filters.expertise !== '' ||
      filters.locations !== '' ||
      filters.availability !== '' ||
      filters.certifications !== '' ||
      filters.workModel !== '';

    const timeoutId = setTimeout(() => {
      console.log('Debounced search triggered with searchTerm:', searchTerm);
      console.log('Active tab:', activeTab);
      console.log('Search criteria present:', hasSearchCriteria);

      if (activeTab === 'find') {
        console.log('Calling fetchTalents for search...');
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchTalents(null, false, true); // Skip loading state for search
      } else if (activeTab === 'wishlist') {
        console.log('Calling fetchShortlistedTalents for search...');
        setShortlistedPagination(prev => ({ ...prev, page: 1 }));
        fetchShortlistedTalents(null, true); // Skip loading state for search
      } else if (activeTab === 'hired') {
        console.log('Calling fetchHiredContractors for search...');
        setHiredPagination(prev => ({ ...prev, page: 1 }));
        fetchHiredContractors(filters, true); // Skip loading state for search
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters]); // Only trigger on search term or filter changes



  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.actions-menu')) {
        document.querySelectorAll('.actions-dropdown').forEach(dropdown => {
          dropdown.style.display = '';
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
      const data = await response.json();
      let countryNames = data.map(country => country.name.common).sort();

      // @topCountryUS - Move priority countries to top
      const priorityCountries = ['United States', 'United States Minor Outlying Islands', 'United States Virgin Islands',];
      countryNames = countryNames.filter((country) => !priorityCountries.includes(country));
      countryNames = [...priorityCountries, ...countryNames];
      setCountries(countryNames);
    } catch (error) {
      console.error('Error fetching countries:', error);
      // Fallback to common countries if API fails
      setCountries(['USA', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'India', 'Remote']);
    }
  };

  const fetchTalents = async (customFilters = null, includeDaysFilter = false, skipLoading = false) => {
    try {
      if (!skipLoading) {
        setLoading(true);
      }
      setError(null);

      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const currentFilters = customFilters || filters;

      console.log('fetchTalents called with searchTerm:', searchTerm);
      console.log('fetchTalents parameters - customFilters:', customFilters, 'includeDaysFilter:', includeDaysFilter, 'skipLoading:', skipLoading);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (includeDaysFilter) {
        params.append('days', '7');
      }

      if (currentFilters.expertise) params.append('skills', currentFilters.expertise);
      if (currentFilters.locations) params.append('location', currentFilters.locations);
      if (currentFilters.availability) params.append('availability', currentFilters.availability);
      if (currentFilters.certifications) params.append('certifications', currentFilters.certifications);
      if (currentFilters.workModel) params.append('workModel', currentFilters.workModel);
      if (searchTerm && searchTerm.trim() !== '') {
        params.append('search', searchTerm.trim());
        console.log('Search term applied:', searchTerm.trim());
      }

      console.log('Fetching contractors with URL:', `${API_BASE_URL}/contractor/search?${params}`);
      console.log('Parameters being sent:', Object.fromEntries(params));
      console.log('Search term state:', searchTerm);
      console.log('Current filters:', currentFilters);

      const response = await fetch(`${API_BASE_URL}/contractor/search?${params}`, {
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
      console.log('Contractor search API response:', data);

      // Check if data.contractors exists and is an array
      if (!data || !data.contractors || !Array.isArray(data.contractors)) {
        console.error('Invalid API response structure for search:', data);
        setError('Invalid response from server');
        return;
      }

      console.log(`Found ${data.contractors.length} contractors. Total count: ${data.totalCount}`);
      if (data.contractors.length === 0) {
        console.log('No contractors found. This could be due to:');
        console.log('1. No contractors have been approved by admin yet');
        console.log('2. All contractors are in Pending/Rejected status');
        console.log('3. Contractors have not completed their intake forms');
        console.log('4. API endpoint filtering criteria');
      }

      const transformedTalents = data.contractors.map(contractor => ({
        id: contractor.userId, // Use userId for avatar lookup via getAvatarUrl
        contractorId: contractor.id, // Keep contractor profile ID for other operations
        userId: contractor.userId,
        name: contractor.name,
        avatar: contractor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        skills: contractor.skills || 'Not specified',
        certification: contractor.certifications || contractor.Certifications || 'Not specified',
        location: (() => {
          const country = contractor.Country || contractor.country;
          const state = contractor.State || contractor.state;
          if (country && state) return `${country}, ${state}`;
          if (country) return country;
          if (state) return state;
          return 'Not specified';
        })(),
        workModel: contractor.WorkModel || contractor.workModel || 'Not specified',
        availability: contractor.availability ? `${contractor.availability} Hrs/week` : 'Not available',
        rateRange: contractor.hourlyRate ? `$${contractor.hourlyRate}/hr` : 'Rate not specified',
        color: '#4EC1EF',
        rating: contractor.rating,
        isVerified: contractor.isVerified,
        jobTitle: contractor.jobTitle
      }));

      setTalents(transformedTalents);
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        totalCount: data.totalCount
      });
    } catch (error) {
      console.error('Error fetching talents:', error);
      setError(`Failed to load talents: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchShortlistedTalents = async (customFilters = null, skipLoading = false) => {
    try {
      if (!skipLoading) {
        setLoading(true);
      }
      setError(null);

      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const currentFilters = customFilters || filters;

      const params = new URLSearchParams({
        page: shortlistedPagination.page.toString(),
        pageSize: shortlistedPagination.pageSize.toString(),
        sortBy: 'rating',
        sortOrder: 'desc'
      });

      if (currentFilters.expertise) params.append('skills', currentFilters.expertise);
      if (currentFilters.locations) params.append('location', currentFilters.locations);
      if (currentFilters.availability) params.append('availability', currentFilters.availability);
      if (currentFilters.certifications) params.append('certifications', currentFilters.certifications);
      if (currentFilters.workModel) params.append('workModel', currentFilters.workModel);
      if (searchTerm && searchTerm.trim() !== '') {
        params.append('search', searchTerm.trim());
        console.log('Shortlisted search term applied:', searchTerm.trim());
      }

      console.log('Fetching shortlisted contractors with URL:', `${API_BASE_URL}/contractor/shortlisted?${params}`);
      console.log('Shortlisted parameters being sent:', Object.fromEntries(params));

      const response = await fetch(`${API_BASE_URL}/contractor/shortlisted?${params}`, {
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

      // Check if data.contractors exists and is an array
      if (!data || !data.contractors || !Array.isArray(data.contractors)) {
        console.error('Invalid API response structure for shortlisted:', data);
        setError('Invalid response from server');
        return;
      }

      const transformedTalents = data.contractors.map(contractor => ({
        id: contractor.userId, // Use userId for avatar lookup via getAvatarUrl
        contractorId: contractor.id, // Keep contractor profile ID for other operations
        userId: contractor.userId,
        name: contractor.name,
        avatar: contractor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        matchedProject: 'Q3 Financial Audit',
        skills: contractor.skills || 'Not specified',
        certification: contractor.certifications || contractor.Certifications || 'Not specified',
        location: (() => {
          const country = contractor.Country || contractor.country;
          const state = contractor.State || contractor.state;
          if (country && state) return `${country}, ${state}`;
          if (country) return country;
          if (state) return state;
          return 'Not specified';
        })(),
        workModel: contractor.WorkModel || contractor.workModel || 'Not specified',
        availability: contractor.availability ? `${contractor.availability} Hrs/week` : 'Not available',
        rateRange: contractor.hourlyRate ? `$${contractor.hourlyRate}/hr` : 'Rate not specified',
        color: '#4EC1EF',
        rating: contractor.rating,
        isVerified: contractor.isVerified,
        jobTitle: contractor.jobTitle,
        reviewStatus: contractor.reviewStatus,
        isShortlisted: true
      }));

      setShortlistedTalents(transformedTalents);
      setShortlistedPagination({
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        totalCount: data.totalCount
      });
    } catch (error) {
      console.error('Error fetching shortlisted talents:', error);
      setError(`Failed to load shortlisted talents: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchHiredContractors = async (currentFilters = filters, skipLoading = false) => {
    try {
      if (!skipLoading) {
        setLoading(true);
      }
      setError(null);

      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      // Build query parameters for hired contractors
      const params = new URLSearchParams({
        page: hiredPagination.page.toString(),
        pageSize: hiredPagination.pageSize.toString()
      });

      if (searchTerm && searchTerm.trim() !== '') {
        params.append('search', searchTerm.trim());
        console.log('Hired contractors search term applied:', searchTerm.trim());
      }

      console.log('Fetching hired contractors with URL:', `${API_BASE_URL}/dashboard/client/hired-contractors?${params}`);
      console.log('Hired contractors parameters being sent:', Object.fromEntries(params));

      // Use the same endpoint as dashboard popup to maintain consistency
      const response = await fetch(`${API_BASE_URL}/dashboard/client/hired-contractors?${params}`, {
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
      console.log('Hired contractors data:', data);

      // Transform ContractorSummaryDto objects from the unified endpoint
      const transformedTalents = data.map(contractor => {
        const contractorName = contractor.Name || contractor.name || 'Unknown Contractor';
        return {
          id: contractor.UserId || contractor.userId,
          userId: contractor.UserId || contractor.userId,
          name: contractorName,
          avatar: contractorName.split(' ').map(n => n[0] || '').join('').substring(0, 2).toUpperCase() || 'UC',
          matchedProject: 'Various Projects', // Since this shows all hired contractors across all projects
          skills: contractor.Skills || contractor.skills || 'Software Development',
          certification: contractor.Qualifications || contractor.qualifications || 'Industry Certification',
          location: contractor.Location || contractor.location || 'Remote',
          workModel: contractor.WorkModel || contractor.workModel || 'Remote',
          availability: contractor.Availability ? `${contractor.Availability} Hrs/week` :
            contractor.availability ? `${contractor.availability} Hrs/week` : '40 Hrs/week',
          rateRange: contractor.HourlyRate ? `$${contractor.HourlyRate}/hr` :
            contractor.hourlyRate ? `$${contractor.hourlyRate}/hr` : '$50-100/hr',
          color: '#28a745',
          rating: contractor.Rating || contractor.rating || 4.8,
          isVerified: contractor.IsVerified !== false && contractor.isVerified !== false,
          jobTitle: contractor.JobTitle || contractor.jobTitle || 'Software Developer',
          reviewStatus: contractor.ReviewStatus || contractor.reviewStatus || 'Approved',
          isHired: true,
          projectStatus: 'Active',
          // Add ProfilePictureData for profile pictures
          ProfilePictureData: contractor.ProfilePictureData || contractor.profilePictureData
        };
      });

      console.log(`Total hired contractors found: ${transformedTalents.length}`);

      // Apply client-side filtering if needed
      let filteredTalents = transformedTalents;
      if (currentFilters.expertise) {
        filteredTalents = filteredTalents.filter(contractor =>
          contractor.skills.toLowerCase().includes(currentFilters.expertise.toLowerCase())
        );
      }

      // Simple pagination simulation
      const startIndex = (hiredPagination.page - 1) * hiredPagination.pageSize;
      const endIndex = startIndex + hiredPagination.pageSize;
      const paginatedTalents = filteredTalents.slice(startIndex, endIndex);

      setHiredContractors(paginatedTalents);
      setHiredPagination({
        page: hiredPagination.page,
        pageSize: hiredPagination.pageSize,
        totalPages: Math.ceil(filteredTalents.length / hiredPagination.pageSize) || 1,
        totalCount: filteredTalents.length
      });
    } catch (error) {
      console.error('Error fetching hired contractors:', error);
      setError(`Failed to load hired contractors. Using active projects to show hired contractors.`);
      // Set empty state instead of leaving it in error state
      setHiredContractors([]);
      setHiredPagination({
        page: 1,
        pageSize: 10,
        totalPages: 1,
        totalCount: 0
      });
    } finally {
      setLoading(false);
    }
  };


  const handleFilterChange = (filterName, value) => {
    // @cehckpoint
    console.log('certificate filter ===> ', value)
    setFilters(prev => ({
      ...prev,
      [filterName]: value.toUpperCase()
    }));
  };

  const handleSearch = () => {
    if (activeTab === 'find') {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchTalents(null, false); // Show all contractors sorted by creation date
    } else if (activeTab === 'wishlist') {
      setShortlistedPagination(prev => ({ ...prev, page: 1 }));
      fetchShortlistedTalents();
    } else if (activeTab === 'hired') {
      setHiredPagination(prev => ({ ...prev, page: 1 }));
      fetchHiredContractors();
    }
  };

  const handleClearAll = () => {
    const clearedFilters = {
      expertise: '',
      locations: '',
      availability: '',
      certifications: '',
      workModel: ''
    };
    setFilters(clearedFilters);

    if (activeTab === 'find') {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchTalents(clearedFilters, false); // Show all contractors sorted by creation date
    } else if (activeTab === 'wishlist') {
      setShortlistedPagination(prev => ({ ...prev, page: 1 }));
      fetchShortlistedTalents(clearedFilters);
    } else if (activeTab === 'hired') {
      setHiredPagination(prev => ({ ...prev, page: 1 }));
      fetchHiredContractors(clearedFilters);
    }
  };

  const handleTalentAction = async (talentId, action) => {
    try {
      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      if (action === 'shortlist') {
        const response = await fetch(`${API_BASE_URL}/contractor/${talentId}/shortlist`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ProjectId: null,
            Notes: 'Shortlisted from talent search'
          })
        });

        if (response.ok) {
          const result = await response.json();

          // Remove from current talents list immediately
          setTalents(prevTalents => prevTalents.filter(talent => talent.id !== talentId));
          // Update pagination count
          setPagination(prev => ({ ...prev, totalCount: prev.totalCount - 1 }));
          // Refresh shortlisted talents to show the new addition and update count
          await fetchShortlistedTalents();
        } else {
          const errorData = await response.text();
          let errorMessage = 'Failed to shortlist talent';

          try {
            const errorJson = JSON.parse(errorData);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch (parseError) {
            errorMessage = errorData || errorMessage;
          }

          alert(`Error: ${errorMessage}`);
        }
      } else if (action === 'assign') {
        console.log('Assigning project to talent:', talentId);
        // This would typically open a project assignment modal
      } else if (action === 'invite') {
        // Open invite modal. For now, select most recent pending project from server would be ideal,
        // but minimally we allow inviting without selection by using the latest pending project via share list endpoint soon.
        // Here we just open the modal with a lightweight project shape prompt. In real flow, you'll pass actual project from view.
        setInviteContractor(currentTalents.find(t => (t.contractorId || t.id) === talentId));
        setInviteProject(null);
        setInviteOpen(true);
      } else if (action === 'message') {
        if (talentId) {
          navigate('/messages', { state: { openChatWithContractor: talentId } });
        } else {
          navigate('/messages');
        }
      } else if (action === 'viewProfile') {
        // Mark as viewed
        await fetch(`${API_BASE_URL}/contractor/${talentId}/view`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        navigate(`/client-wishlist-view-profile/${talentId}`, { state: { from: 'talent' } });
      } else if (action === 'removeFromShortlist') {
        const response = await fetch(`${API_BASE_URL}/contractor/${talentId}/shortlist`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Remove from shortlisted immediately
          setShortlistedTalents(prev => prev.filter(talent => talent.id !== talentId));
          setShortlistedPagination(prev => ({ ...prev, totalCount: prev.totalCount - 1 }));

          // 🔹 Refresh counts for BOTH tabs
          await fetchTalents(null, false);        // update Find New Talent + its count
          await fetchShortlistedTalents();
        } else {
          console.error('Failed to remove from shortlist');
        }
      } else if (action === 'assignToProject') {
        // Find the talent to get the userId for project assignment and contractorId for shortlist removal
        const talent = shortlistedTalents.find(t => t.id === talentId || t.contractorId === talentId);
        if (talent) {
          setSelectedContractorId(talent.id); // Use id (which is now userId) for project assignment
          setSelectedContractorIdForRemoval(talent.contractorId || talent.id); // Use contractorId for shortlist removal
          setShowAssignProjectPopup(true);
        } else {
          console.error('Could not find talent userId for assignment');
        }
      } else if (action === 'viewProject') {
        // Find the hired contractor to get their current project
        const contractor = hiredContractors.find(c => c.id === talentId);
        if (contractor && contractor.matchedProject) {
          // Navigate to project view - assuming project ID is available
          // For now, navigate to projects list
          navigate('/projects');
        } else {
          navigate('/projects');
        }
      }
    } catch (error) {
      console.error('Error handling talent action:', error);
    }
  };

  const handlePaginationChange = (page) => {
    if (activeTab === 'find') {
      setPagination(prev => ({ ...prev, page }));
    } else if (activeTab === 'wishlist') {
      setShortlistedPagination(prev => ({ ...prev, page }));
    } else if (activeTab === 'hired') {
      setHiredPagination(prev => ({ ...prev, page }));
    }
  };


  const handleAssignSuccess = async (message) => {
    setSuccessMessage(message);

    // Keep contractor in shortlisted talents list - they remain shortlisted even when hired
    // The backend will update the ContractorShortlist status to "Hired" automatically
    // but the contractor should still appear in shortlisted tab until explicitly removed

    // Refresh shortlisted talents to update any status changes
    await fetchShortlistedTalents();

    // Refresh hired contractors list to show the newly assigned contractor
    await fetchHiredContractors();

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'find') {
      setPagination(prev => ({ ...prev, page: 1 }));
    } else if (tab === 'wishlist') {
      setShortlistedPagination(prev => ({ ...prev, page: 1 }));
    } else if (tab === 'hired') {
      setHiredPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  if (loading) {
    return (
      <div className='loading-container'>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="find-talent-container">
        <div className="find-talent-header">
          <h1>Find <strong>Talent</strong></h1>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Error: {error}</p>
          <button onClick={activeTab === 'find' ? () => fetchTalents(null, false) : fetchShortlistedTalents}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentTalents = activeTab === 'find' ? talents : activeTab === 'wishlist' ? shortlistedTalents : hiredContractors;
  const currentPagination = activeTab === 'find' ? pagination : activeTab === 'wishlist' ? shortlistedPagination : hiredPagination;

  return (
    <DashboardLayout>
      <div className="find-talent-container">
        <div className="find-talent-header">
          <h1>Find <strong>Talent</strong></h1>
        </div>

        {/* Tabs */}
        <div className="talent-tabs">
          <button
            className={`tab-button ${activeTab === 'find' ? 'active' : ''}`}
            onClick={() => handleTabChange('find')}
          >
            Find New Talent ({pagination.totalCount})
          </button>
          <button
            className={`tab-button ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => handleTabChange('wishlist')}
          >
            Shortlisted Talent ({shortlistedPagination.totalCount})
          </button>
          <button
            className={`tab-button ${activeTab === 'hired' ? 'active' : ''}`}
            onClick={() => handleTabChange('hired')}
          >
            Hired Contractors ({hiredPagination.totalCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search contractors by name or rate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="talent-filters">
          <div className="filters-label">Search by <strong>Filters</strong></div>
          <div className="filter-controls">
            <div className="filter-group">
              <select
                value={filters.expertise}
                onChange={(e) => handleFilterChange('expertise', e.target.value)}
                className="filter-select"
              >
                <option value="">Expertise</option>
                <option value="tax">Tax</option>
                <option value="audit">Audit</option>
                <option value="financial-analysis">Financial Analysis</option>
              </select>
              <span className="dropdown-arrow">∨</span>
            </div>
            <div className="filter-group">
              <select
                value={filters.locations}
                onChange={(e) => handleFilterChange('locations', e.target.value)}
                className="filter-select"
              >
                <option value="">Locations</option>
                {countries.map(country => (
                  <option key={country} value={country.toLowerCase()}>{country}</option>
                ))}
              </select>
              <span className="dropdown-arrow">∨</span>
            </div>
            <div className="filter-group">
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="filter-select"
              >
                <option value="">Availability</option>
                <option value="0-10">0-10 hours/week</option>
                <option value="10-20">10-20 hours/week</option>
                <option value="20-30">20-30 hours/week</option>
                <option value="30-40">30-40 hours/week</option>
                <option value="40-50">40-50 hours/week</option>
                <option value=">50">50 hours/week</option>
              </select>
              <span className="dropdown-arrow">∨</span>
            </div>
            <div className="filter-group">
              <select
                value={filters.certifications}
                onChange={(e) => handleFilterChange('certifications', e.target.value)}
                className="filter-select"
              >
                <option value="">Certifications</option>
                <option value="cpa">CPA</option>
                <option value="cfa">CFA</option>
                <option value="cia">CIA</option>
              </select>
              <span className="dropdown-arrow">∨</span>
            </div>
            <div className="filter-group">
              <select
                value={filters.workModel}
                onChange={(e) => handleFilterChange('workModel', e.target.value)}
                className="filter-select"
              >
                <option value="">Work Model</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-site</option>
              </select>
              <span className="dropdown-arrow">∨</span>
            </div>
            <button className="search-btn" onClick={handleSearch}>
              Search
            </button>
            <button className="clear-btn" onClick={handleClearAll}>
              Clear All
            </button>
          </div>
        </div>


        {/* Talent Table */}
        <div className="talent-table-container">
          <table className="talent-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Skills</th>
                <th>Certification</th>
                <th>Location</th>
                <th>Work Model</th>
                <th>Availability</th>
                <th>Rate</th>
                {activeTab !== 'hired' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {currentTalents.length > 0 ? (
                currentTalents.map(talent => (
                  <tr key={talent.id} className="talent-row">
                    <td>
                      <div className="talent-name-cell">
                        <img
                          src={getAvatarUrl(talent, 32)}
                          alt={talent.name}
                          className="talent-avatar"
                          onError={(e) => {
                            // Fallback to UI Avatars if database image fails
                            const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.name)}&size=32&background=random&color=fff&bold=true&format=svg`;
                            if (e.target.src !== fallbackUrl) {
                              e.target.src = fallbackUrl;
                            }
                          }}
                        />
                        <div>
                          <span className="talent-name">{talent.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="talent-skills">{talent.skills}</td>
                    <td className="talent-certification">{talent.certification}</td>
                    <td className="talent-location">{talent.location}</td>
                    <td className="talent-work-model">{talent.workModel}</td>
                    <td className="talent-availability">{talent.availability}</td>
                    <td className="talent-rate">
                      {talent.rateRange}
                    </td>
                    {activeTab !== 'hired' && (
                      <td>
                        <div className="talent-actions actions-menu">
                          <button
                            className="actions-trigger"
                            onMouseEnter={createDropdownPositionHandler(150)}
                            onClick={(e) => {
                              e.stopPropagation();
                              const dropdown = e.target.nextElementSibling;
                              const isVisible = dropdown.style.display === 'block';

                              // Apply positioning before showing dropdown
                              createDropdownPositionHandler(150)(e);

                              // Close all other manually opened dropdowns first
                              document.querySelectorAll('.actions-dropdown').forEach(d => {
                                if (d !== dropdown) {
                                  d.style.display = '';
                                }
                              });

                              // Toggle current dropdown
                              dropdown.style.display = isVisible ? '' : 'block';
                            }}
                          >
                            ⋯
                          </button>
                          <div className="actions-dropdown">
                            {activeTab === 'find' ? (
                              <>
                                <button
                                  className="action-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Close dropdown immediately
                                    const dropdown = e.target.closest('.actions-dropdown');
                                    if (dropdown) {
                                      dropdown.style.display = '';
                                    }
                                    handleTalentAction(talent.contractorId || talent.id, 'shortlist');
                                  }}
                                >
                                  Shortlist
                                </button>
                                <button
                                  className="action-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdown = e.target.closest('.actions-dropdown');
                                    if (dropdown) {
                                      dropdown.style.display = 'none';
                                    }
                                    handleTalentAction(talent.id, 'message');
                                  }}
                                >
                                  Message
                                </button>
                                <button
                                  className="action-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdown = e.target.closest('.actions-dropdown');
                                    if (dropdown) dropdown.style.display = 'none';
                                    handleTalentAction(talent.contractorId || talent.id, 'invite');
                                  }}
                                >
                                  Invite Contractor
                                </button>
                                <button
                                  className="action-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdown = e.target.closest('.actions-dropdown');
                                    if (dropdown) {
                                      dropdown.style.display = 'none';
                                    }
                                    handleTalentAction(talent.contractorId || talent.id, 'viewProfile');
                                  }}
                                >

                                  View Profile
                                </button>
                              </>
                            ) : activeTab === 'wishlist' ? (
                              <>
                                <button
                                  className="action-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdown = e.target.closest('.actions-dropdown');
                                    if (dropdown) {
                                      dropdown.style.display = 'none';
                                    }
                                    handleTalentAction(talent.id, 'assignToProject');
                                  }}
                                >
                                  Assign To Project
                                </button>
                                <button
                                  className="action-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdown = e.target.closest('.actions-dropdown');
                                    if (dropdown) {
                                      dropdown.style.display = 'none';
                                    }
                                    handleTalentAction(talent.contractorId || talent.id, 'removeFromShortlist');
                                  }}
                                >
                                  Remove from Shortlist
                                </button>
                                <button
                                  className="action-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdown = e.target.closest('.actions-dropdown');
                                    if (dropdown) {
                                      dropdown.style.display = 'none';
                                    }
                                    handleTalentAction(talent.id, 'message');
                                  }}
                                >
                                  Message
                                </button>
                                <button
                                  className="action-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdown = e.target.closest('.actions-dropdown');
                                    if (dropdown) {
                                      dropdown.style.display = 'none';
                                    }
                                    handleTalentAction(talent.contractorId || talent.id, 'viewProfile');
                                  }}
                                >

                                  View Profile
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="action-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdown = e.target.closest('.actions-dropdown');
                                    if (dropdown) {
                                      dropdown.style.display = 'none';
                                    }
                                    handleTalentAction(talent.contractorId || talent.id, 'viewProfile');
                                  }}
                                >

                                  View Profile
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeTab === 'hired' ? "7" : "8"} style={{ textAlign: 'center', padding: '2rem' }}>
                    {activeTab === 'find'
                      ? 'No talents found matching your criteria. Try adjusting your filters.'
                      : activeTab === 'wishlist'
                        ? 'No talents have been shortlisted yet.'
                        : 'No contractors have been hired yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {currentPagination.totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePaginationChange(1)}
                disabled={currentPagination.page === 1}
              >
                ⟪
              </button>
              <button
                className="pagination-btn"
                onClick={() => handlePaginationChange(currentPagination.page - 1)}
                disabled={currentPagination.page === 1}
              >
                ⟨
              </button>

              {Array.from({ length: Math.min(5, currentPagination.totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(
                  currentPagination.page - 2 + i,
                  currentPagination.totalPages - 4 + i
                ));

                if (pageNumber > currentPagination.totalPages) return null;

                return (
                  <button
                    key={pageNumber}
                    className={`pagination-btn ${currentPagination.page === pageNumber ? 'active' : ''}`}
                    onClick={() => handlePaginationChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                className="pagination-btn"
                onClick={() => handlePaginationChange(currentPagination.page + 1)}
                disabled={currentPagination.page === currentPagination.totalPages}
              >
                ⟩
              </button>
              <button
                className="pagination-btn"
                onClick={() => handlePaginationChange(currentPagination.totalPages)}
                disabled={currentPagination.page === currentPagination.totalPages}
              >
                ⟫
              </button>
            </div>
            <div className="pagination-info">
              Page {currentPagination.page} of {currentPagination.totalPages} ({currentPagination.totalCount} total results)
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message-overlay">
          <div className="success-message">
            {successMessage}
          </div>
        </div>
      )}

      {/* Assign Project Popup */}
      <AssignProjectPopup
        isOpen={showAssignProjectPopup}
        onClose={() => setShowAssignProjectPopup(false)}
        contractorId={selectedContractorId}
        onAssignSuccess={handleAssignSuccess}
      />

      <InviteContractorModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        project={inviteProject || { id: null, title: 'Select project from project view', projectType: '', hourlyRate: '', description: '' }}
        contractor={inviteContractor || {}}
        onInvited={() => setSuccessMessage('Invitation sent')}
      />

    </DashboardLayout>
  );
};

export default ClientFindTalent;