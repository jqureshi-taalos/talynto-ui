/**
 * Utility functions for handling dropdown positioning to prevent cut-off
 */

/**
 * Dynamically positions a dropdown to prevent it from being cut off by the viewport
 * @param {HTMLElement} triggerElement - The button/trigger element
 * @param {HTMLElement} dropdownElement - The dropdown menu element
 * @param {number} estimatedDropdownHeight - Estimated height of dropdown (default: 120px)
 */
export const positionDropdown = (triggerElement, dropdownElement, estimatedDropdownHeight = 120) => {
  if (!triggerElement || !dropdownElement) return;

  const rect = triggerElement.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Check if dropdown would be cut off at the bottom
  if (rect.bottom + estimatedDropdownHeight > viewportHeight) {
    // Position above the trigger
    dropdownElement.style.bottom = '100%';
    dropdownElement.style.top = 'auto';
  } else {
    // Position below the trigger (default)
    dropdownElement.style.top = '100%';
    dropdownElement.style.bottom = 'auto';
  }
  
  // Ensure dropdown doesn't go off-screen horizontally
  const dropdownRect = dropdownElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  
  if (dropdownRect.right > viewportWidth) {
    dropdownElement.style.right = '0';
    dropdownElement.style.left = 'auto';
  }
};

/**
 * Creates a mouse enter event handler for dropdown positioning
 * @param {number} estimatedDropdownHeight - Estimated height of dropdown
 * @returns {Function} Event handler function
 */
export const createDropdownPositionHandler = (estimatedDropdownHeight = 120) => {
  return (e) => {
    const triggerElement = e.target;
    const dropdownElement = triggerElement.nextElementSibling;
    positionDropdown(triggerElement, dropdownElement, estimatedDropdownHeight);
  };
};

/**
 * Auto-positions all dropdowns on a page
 * Useful for initial page load or dynamic content updates
 */
export const autoPositionAllDropdowns = () => {
  const dropdownTriggers = document.querySelectorAll(
    '.action-trigger, .actions-trigger, .client-actions-trigger, .actions-btn'
  );
  
  dropdownTriggers.forEach(trigger => {
    const dropdown = trigger.nextElementSibling;
    if (dropdown && dropdown.classList.contains('action-dropdown', 'actions-dropdown', 'client-actions-dropdown', 'dropdown-menu')) {
      positionDropdown(trigger, dropdown);
    }
  });
};

/**
 * Adds event listeners to all dropdown triggers for automatic positioning
 */
export const initializeDropdownPositioning = () => {
  const dropdownTriggers = document.querySelectorAll(
    '.action-trigger, .actions-trigger, .client-actions-trigger, .actions-btn'
  );
  
  dropdownTriggers.forEach(trigger => {
    if (!trigger.hasAttribute('data-dropdown-initialized')) {
      trigger.addEventListener('mouseenter', createDropdownPositionHandler());
      trigger.setAttribute('data-dropdown-initialized', 'true');
    }
  });
};

// Auto-initialize on DOM content loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeDropdownPositioning);
}