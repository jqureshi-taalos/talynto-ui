import { useState, useEffect } from 'react';
import adminService from '../services/adminService';

// Hook to get dynamic configuration options for dropdowns
export const useDropdownOptions = () => {
  const [options, setOptions] = useState({
    expertise: [],
    industry: [],
    profession: [],
    domain: [],
    tools: [],
    certification: [],
    projectType: [],
    // Legacy support
    certifications: [],
    skills: [],
    softwareTools: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        
        // Fetch all configuration categories from the new API
        const categories = await adminService.getAllConfigurationCategories();
        
        const newOptions = {};
        
        categories.forEach(category => {
          const items = category.items.map(item => ({
            value: item.name,
            label: item.name,
            id: item.id
          }));
          
          newOptions[category.name] = items;
        });
        
        // Map to legacy field names for backward compatibility
        newOptions.certifications = newOptions.certification || [];
        newOptions.skills = newOptions.expertise || [];
        newOptions.softwareTools = newOptions.tools || [];
        
        setOptions(newOptions);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load dropdown options:', err);
        
        // Don't provide fallback data - this forces proper API/database setup
        // If API fails, components should handle empty arrays gracefully
        setOptions({
          expertise: [],
          industry: [],
          profession: [],
          domain: [],
          tools: [],
          certification: [],
          projectType: [],
          // Legacy support - also empty
          certifications: [],
          skills: [],
          softwareTools: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const refreshOptions = async () => {
    const fetchOptions = async () => {
      try {
        const categories = await adminService.getAllConfigurationCategories();
        const newOptions = {};
        
        categories.forEach(category => {
          const items = category.items.map(item => ({
            value: item.name,
            label: item.name,
            id: item.id
          }));
          
          newOptions[category.name] = items;
        });
        
        // Map to legacy field names for backward compatibility
        newOptions.certifications = newOptions.certification || [];
        newOptions.skills = newOptions.expertise || [];
        newOptions.softwareTools = newOptions.tools || [];
        
        setOptions(newOptions);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Failed to refresh dropdown options:', err);
        // Clear options on refresh failure
        setOptions({
          expertise: [],
          industry: [],
          profession: [],
          domain: [],
          tools: [],
          certification: [],
          projectType: [],
          certifications: [],
          skills: [],
          softwareTools: []
        });
      }
    };
    
    await fetchOptions();
  };

  return { options, loading, error, refreshOptions };
};

// Hook specifically for getting a single category's options
export const useCategoryOptions = (categoryName) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryOptions = async () => {
      if (!categoryName) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const items = await adminService.getCategoryItems(categoryName);
        
        const formattedOptions = items.map(item => ({
          value: item.name,
          label: item.name,
          id: item.id
        }));
        
        setOptions(formattedOptions);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error(`Failed to load ${categoryName} options:`, err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryOptions();
  }, [categoryName]);

  const refreshOptions = async () => {
    if (!categoryName) return;
    
    try {
      const items = await adminService.getCategoryItems(categoryName);
      const formattedOptions = items.map(item => ({
        value: item.name,
        label: item.name,
        id: item.id
      }));
      
      setOptions(formattedOptions);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(`Failed to refresh ${categoryName} options:`, err);
    }
  };

  return { options, loading, error, refreshOptions };
};