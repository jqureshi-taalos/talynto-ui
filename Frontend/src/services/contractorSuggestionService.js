import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

class ContractorSuggestionService {
  /**
   * Fetch suggested contractors for a project based on skill matching
   * @param {string} projectId - The project ID
   * @param {number} limit - Maximum number of contractors to return (default: 4)
   * @param {Array} projectSkills - Array of required skills for the project
   * @returns {Promise<Array>} Array of suggested contractors
   */
  async getSuggestedContractors(projectId, limit = 4, projectSkills = []) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // First try the dedicated endpoint if it exists
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/client/project/${projectId}/suggested-contractors?limit=${limit}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (error) {
        console.log('Dedicated endpoint not available, using fallback method');
      }

      // Fallback: Get available contractors and filter them
      return await this.getFilteredContractors(projectSkills, limit);

    } catch (error) {
      console.error('Error fetching suggested contractors:', error);
      // Return mock data as ultimate fallback
      return this.getMockSuggestedContractors(limit);
    }
  }

  /**
   * Get contractors and filter them based on skills and availability
   * @param {Array} projectSkills - Required skills for the project
   * @param {number} limit - Maximum number of contractors to return
   */
  async getFilteredContractors(projectSkills = [], limit = 4) {
    try {
      const token = authService.getToken();
      
      // Try to get contractors from existing talent/contractor endpoints
      const endpoints = [
        '/contractor/available',
        '/dashboard/client/contractors',
        '/talent/search',
        '/contractor'
      ];

      let contractors = [];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            contractors = Array.isArray(data) ? data : (data.contractors || data.results || []);
            if (contractors.length > 0) break;
          }
        } catch (error) {
          console.log(`Endpoint ${endpoint} not available`);
        }
      }

      // Filter contractors based on availability and skills
      const availableContractors = contractors.filter(contractor => {
        // Filter out contractors who are already hired
        if (contractor.status && contractor.status.toLowerCase() === 'hired') {
          return false;
        }
        if (contractor.currentProject && contractor.currentProject !== null) {
          return false;
        }
        return true;
      });

      // Apply skill matching if project skills are provided
      let matchedContractors = availableContractors;
      if (projectSkills.length > 0) {
        matchedContractors = this.matchContractorsBySkills(availableContractors, projectSkills);
      }

      // Sort by match score and return top results
      return matchedContractors.slice(0, limit);

    } catch (error) {
      console.error('Error filtering contractors:', error);
      return [];
    }
  }

  /**
   * Match contractors based on their skills against project requirements
   * @param {Array} contractors - List of available contractors
   * @param {Array} projectSkills - Required skills for the project
   */
  matchContractorsBySkills(contractors, projectSkills) {
    return contractors.map(contractor => {
      let matchScore = 0;
      const contractorSkills = this.extractContractorSkills(contractor);
      
      // Calculate match score based on skill overlap
      projectSkills.forEach(projectSkill => {
        if (contractorSkills.some(skill => 
          skill.toLowerCase().includes(projectSkill.toLowerCase()) ||
          projectSkill.toLowerCase().includes(skill.toLowerCase())
        )) {
          matchScore++;
        }
      });

      return {
        ...contractor,
        matchScore,
        matchingSkills: contractorSkills.filter(skill =>
          projectSkills.some(ps => 
            skill.toLowerCase().includes(ps.toLowerCase()) ||
            ps.toLowerCase().includes(skill.toLowerCase())
          )
        )
      };
    })
    .filter(contractor => contractor.matchScore > 0) // Only return contractors with at least one matching skill
    .sort((a, b) => b.matchScore - a.matchScore); // Sort by match score descending
  }

  /**
   * Extract skills from contractor object
   * @param {Object} contractor - Contractor object
   */
  extractContractorSkills(contractor) {
    const skills = [];
    
    // Check various possible skill fields
    if (contractor.skills) {
      if (Array.isArray(contractor.skills)) {
        skills.push(...contractor.skills);
      } else if (typeof contractor.skills === 'string') {
        skills.push(...contractor.skills.split(',').map(s => s.trim()));
      }
    }
    
    if (contractor.expertise && Array.isArray(contractor.expertise)) {
      skills.push(...contractor.expertise);
    }
    
    if (contractor.specialties && Array.isArray(contractor.specialties)) {
      skills.push(...contractor.specialties);
    }
    
    if (contractor.type) {
      skills.push(contractor.type);
    }

    return skills.filter(Boolean);
  }

  /**
   * Get mock suggested contractors as fallback
   * @param {number} limit - Maximum number of contractors to return
   */
  getMockSuggestedContractors(limit = 4) {
    const mockContractors = [
      {
        id: 'mock-1',
        name: 'Sarah Johnson',
        workModel: 'Remote',
        skills: ['Accounting', 'Tax Preparation', 'Financial Analysis'],
        rating: 4.8,
        hourlyRate: '$45/hour',
        availability: 'Available',
        matchScore: 3,
        avatar: null
      },
      {
        id: 'mock-2',
        name: 'Michael Chen',
        workModel: 'Hybrid',
        skills: ['Bookkeeping', 'QuickBooks', 'Financial Reporting'],
        rating: 4.6,
        hourlyRate: '$40/hour',
        availability: 'Available',
        matchScore: 2,
        avatar: null
      },
      {
        id: 'mock-3',
        name: 'Emily Rodriguez',
        workModel: 'On-site',
        skills: ['Audit', 'Compliance', 'Risk Assessment'],
        rating: 4.9,
        hourlyRate: '$55/hour',
        availability: 'Available',
        matchScore: 2,
        avatar: null
      },
      {
        id: 'mock-4',
        name: 'David Thompson',
        workModel: 'Remote',
        skills: ['Tax Planning', 'Business Advisory', 'Financial Consulting'],
        rating: 4.7,
        hourlyRate: '$50/hour',
        availability: 'Available',
        matchScore: 1,
        avatar: null
      }
    ];

    return mockContractors.slice(0, limit);
  }

  /**
   * Parse project skills from project data
   * @param {Object} projectData - Project data object
   */
  parseProjectSkills(projectData) {
    const skills = [];
    
    if (projectData.type) {
      if (Array.isArray(projectData.type)) {
        skills.push(...projectData.type);
      } else {
        skills.push(...projectData.type.split(',').map(s => s.trim()));
      }
    }
    
    if (projectData.tool) {
      if (Array.isArray(projectData.tool)) {
        skills.push(...projectData.tool);
      } else {
        skills.push(...projectData.tool.split(',').map(s => s.trim()));
      }
    }
    
    if (projectData.skillsRequired) {
      if (Array.isArray(projectData.skillsRequired)) {
        skills.push(...projectData.skillsRequired);
      } else {
        skills.push(...projectData.skillsRequired.split(',').map(s => s.trim()));
      }
    }

    return skills.filter(Boolean);
  }
}

export default new ContractorSuggestionService();