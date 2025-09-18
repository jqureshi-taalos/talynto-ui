/**
 * Avatar utility functions for generating profile pictures
 */

/**
 * Generate avatar URL using UI Avatars service
 * @param {string} name - Full name of the user
 * @param {number} size - Size of the avatar (default: 100)
 * @param {string} background - Background color (default: random)
 * @returns {string} Avatar URL
 */
export const generateUIAvatar = (name, size = 100, background = 'random') => {
  if (!name || name.trim() === '') {
    name = 'User';
  }
  
  const cleanName = name.trim();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&size=${size}&background=${background}&color=fff&bold=true&format=svg`;
};

/**
 * Generate avatar URL using DiceBear service
 * @param {string} seed - Seed for avatar generation (usually user ID or email)
 * @param {string} style - Avatar style (avataaars, personas, etc.)
 * @returns {string} Avatar URL
 */
export const generateDiceBearAvatar = (seed, style = 'avataaars') => {
  if (!seed) {
    seed = Math.random().toString(36).substr(2, 9);
  }
  
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};

/**
 * Get avatar URL with fallback options
 * @param {Object} user - User object
 * @param {string} user.profilePicture - User's profile picture URL (legacy)
 * @param {string} user.name - User's full name
 * @param {string} user.firstName - User's first name
 * @param {string} user.lastName - User's last name
 * @param {string} user.email - User's email
 * @param {number} user.id - User's ID
 * @param {number} size - Avatar size
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (user, size = 100) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
  
  // First priority: Check for profile picture in database (new binary storage)
  // Handle both userId and UserId (contractor DTOs), then fall back to id
  const userId = user?.userId || user?.UserId || user?.id;
  if (userId) {
    // Always try the DB first - if no image exists, the endpoint will return 404
    // and the img element can use onError to fall back to generated avatar
    return `${API_BASE_URL}/user/profile-picture/${userId}`;
  }
  
  // Legacy: If user has old profile picture path, use it
  if (user?.profilePicture && user.profilePicture !== '/default-avatar.png') {
    return user.profilePicture;
  }
  
  // Fallback to generated avatar using name
  const fullName = user?.name || 
    (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 
     user?.firstName || user?.lastName || user?.email || 'User');
  
  return generateUIAvatar(fullName, size);
};

/**
 * Get fallback avatar URL for when profile picture fails to load
 * @param {Object} user - User object
 * @param {number} size - Avatar size
 * @returns {string} Fallback avatar URL
 */
export const getFallbackAvatarUrl = (user, size = 100) => {
  const fullName = user?.name || 
    (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 
     user?.firstName || user?.lastName || user?.email || 'User');
  
  return generateUIAvatar(fullName, size);
};

/**
 * Generate avatar for contractor profiles
 * @param {Object} contractor - Contractor object
 * @returns {string} Avatar URL
 */
export const getContractorAvatar = (contractor) => {
  return getAvatarUrl(contractor, 100);
};

/**
 * Generate avatar for client profiles
 * @param {Object} client - Client object
 * @returns {string} Avatar URL
 */
export const getClientAvatar = (client) => {
  return getAvatarUrl(client, 100);
};