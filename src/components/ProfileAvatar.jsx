import React, { useState, useMemo } from 'react';
import { generateUIAvatar } from '../utils/avatarUtils';

/**
 * ProfileAvatar component that displays user profile pictures with fallback to generated avatars
 * @param {Object} props
 * @param {Object} props.user - User object with id, firstName, lastName, etc.
 * @param {number} props.size - Avatar size in pixels (default: 40)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.alt - Alt text for the image
 * @param {number} props.timestamp - Optional timestamp for cache busting
 * @param {Uint8Array|Array|string|null} props.profilePictureData - Direct byte array data or base64 string for profile picture
 */
const ProfileAvatar = ({ user, size = 40, className = '', alt, timestamp, profilePictureData }) => {
  const [hasError, setHasError] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

  // Reset error state when timestamp changes (new upload)
  React.useEffect(() => {
    if (timestamp) {
      setHasError(false);
      setImageKey(prev => prev + 1);
    }
  }, [timestamp]);

  // Convert byte array or base64 string to data URL
  const getImageDataUrl = useMemo(() => {
    if (!profilePictureData || profilePictureData.length === 0) {
      return null;
    }

    try {
      // Check if it's a base64 string
      if (typeof profilePictureData === 'string') {
        console.log('ProfileAvatar: Handling base64 string data');
        // If it's already a data URL, return as is
        if (profilePictureData.startsWith('data:')) {
          return profilePictureData;
        }
        // If it's a base64 string, convert to data URL
        return `data:image/jpeg;base64,${profilePictureData}`;
      }

      // Handle byte array (original logic)
      const byteArray = profilePictureData instanceof Uint8Array
        ? profilePictureData
        : new Uint8Array(profilePictureData);

      // Create blob from byte array
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // Create object URL
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error converting profile picture data:', error);
      return null;
    }
  }, [profilePictureData]);

  // Clean up object URL when component unmounts or data changes (only for blob URLs)
  React.useEffect(() => {
    return () => {
      if (getImageDataUrl && getImageDataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(getImageDataUrl);
      }
    };
  }, [getImageDataUrl]);

  // Generate fallback avatar URL
  const getFallbackAvatar = () => {
    const fullName = user.name ||
      (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` :
        user.firstName || user.lastName || user.email || 'User');

    return generateUIAvatar(fullName, size);
  };

  // Priority order for avatar source:
  // 1. Direct byte array data (if provided via prop or user.ProfilePictureData)
  // 2. API endpoint (if user ID exists and no direct data)
  // 3. Fallback generated avatar

  // Check for ProfilePictureData in user object (from backend ContractorSummaryDto)
  const profilePictureFromUser = user.ProfilePictureData || profilePictureData;

  // Convert ProfilePictureData if it exists
  const getUserImageDataUrl = React.useMemo(() => {
    if (!profilePictureFromUser || profilePictureFromUser.length === 0) {
      return null;
    }

    try {
      // Handle byte array from backend
      const byteArray = profilePictureFromUser instanceof Uint8Array
        ? profilePictureFromUser
        : new Uint8Array(profilePictureFromUser);

      // Create blob from byte array
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error converting ProfilePictureData:', error);
      return null;
    }
  }, [profilePictureFromUser]);

  // Clean up object URL when component unmounts or data changes
  React.useEffect(() => {
    return () => {
      if (getUserImageDataUrl && getUserImageDataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(getUserImageDataUrl);
      }
    };
  }, [getUserImageDataUrl]);

  // If we have direct profile picture data (from prop or user object), use it
  if ((getImageDataUrl || getUserImageDataUrl) && !hasError) {
    const imageUrl = getImageDataUrl || getUserImageDataUrl;
    return (
      <img
        key={`data-${imageKey}`}
        src={imageUrl}
        alt={alt || `${user.firstName || user.name || 'User'}'s profile picture`}
        className={`profile-avatar ${className}`}
        style={{ width: size, height: size, borderRadius: '8%' }}
        onError={() => setHasError(true)}
      />
    );
  }

  // If we have a user ID but no direct data, try API endpoint
  // Handle both user.id and user.UserId (for contractor DTOs)
  const userId = user.id || user.UserId;
  if (userId && !profilePictureData && !hasError) {
    const imageUrl = `${API_BASE_URL}/user/profile-picture/${userId}?t=${timestamp || imageKey}`;

    return (
      <img
        key={`api-${imageKey}`}
        src={imageUrl}
        alt={alt || `${user.firstName || user.name || 'User'}'s profile picture`}
        className={`profile-avatar ${className}`}
        style={{ width: size, height: size, borderRadius: '8%' }}
        onError={() => setHasError(true)}
      />
    );
  }

  // Fallback to generated avatar
  return (
    <img
      src={getFallbackAvatar()}
      alt={alt || `${user.firstName || 'User'}'s avatar`}
      className={`profile-avatar ${className}`}
      style={{ width: size, height: size, borderRadius: '8%' }}
    />
  );
};

export default ProfileAvatar;