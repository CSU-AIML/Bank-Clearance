// src/components/sebi/utils/sebiHelpers.js

import { CONTACT_STATUS, CONTACT_STATUS_COLORS, CONTACT_STATUS_TEXT } from './sebiConstants';

/**
 * Generate unique ID for each entity
 */
export const getEntityId = (entity) => `sebi-${entity.sebi_id}`;

/**
 * Check if entity has email
 */
export const hasEntityEmail = (entity) => {
  return !!(entity.primary_contact?.email || entity.secondary_contact?.email);
};

/**
 * Get primary email from entity
 */
export const getEntityEmail = (entity) => {
  return entity.primary_contact?.email || entity.secondary_contact?.email || null;
};

/**
 * Get primary phone from entity
 */
export const getEntityPhone = (entity) => {
  return entity.primary_contact?.telephone || entity.secondary_contact?.telephone || null;
};

/**
 * Get contact status for an entity
 */
export const getContactStatus = (entity, contactStatus, contactedEntities) => {
  const entityId = getEntityId(entity);
  
  if (!hasEntityEmail(entity)) {
    return { 
      status: CONTACT_STATUS.NO_EMAIL, 
      text: CONTACT_STATUS_TEXT[CONTACT_STATUS.NO_EMAIL], 
      color: CONTACT_STATUS_COLORS[CONTACT_STATUS.NO_EMAIL] 
    };
  }
  
  if (contactedEntities.has(entityId) || contactStatus[entityId]?.contacted) {
    return { 
      status: CONTACT_STATUS.CONTACTED, 
      text: CONTACT_STATUS_TEXT[CONTACT_STATUS.CONTACTED], 
      color: CONTACT_STATUS_COLORS[CONTACT_STATUS.CONTACTED] 
    };
  }
  
  return { 
    status: CONTACT_STATUS.NOT_CONTACTED, 
    text: CONTACT_STATUS_TEXT[CONTACT_STATUS.NOT_CONTACTED], 
    color: CONTACT_STATUS_COLORS[CONTACT_STATUS.NOT_CONTACTED] 
  };
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format date and time for display
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Clean and validate email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Clean and validate phone number
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Format address for display
 */
export const formatAddress = (contact) => {
  if (!contact) return '';
  
  const parts = [
    contact.address,
    contact.city,
    contact.state,
    contact.pincode
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Get page numbers for pagination
 */
export const getPageNumbers = (currentPage, totalPages, maxVisiblePages = 5) => {
  const pageNumbers = [];
  
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push('...');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }
  }
  
  return pageNumbers;
};

/**
 * Calculate statistics for entities
 */
export const calculateEntityStats = (entities, contactStatus, contactPersons) => {
  const totalEntities = entities.length;
  const withEmail = entities.filter(hasEntityEmail).length;
  const contacted = entities.filter(entity => 
    contactStatus[getEntityId(entity)]?.contacted
  ).length;
  const emailSent = entities.filter(entity => 
    contactStatus[getEntityId(entity)]?.emailSent
  ).length;
  const remaining = totalEntities - contacted;
  
  // Person-specific statistics
  const personStats = contactPersons.map(person => {
    const personContactedCount = entities.filter(entity => 
      contactStatus[getEntityId(entity)]?.contactedBy === person
    ).length;
    return { person, count: personContactedCount };
  });
  
  // Contact rate calculation
  const contactRate = withEmail > 0 ? Math.round((contacted / withEmail) * 100) : 0;
  
  return {
    totalEntities,
    withEmail,
    contacted,
    emailSent,
    remaining,
    contactRate,
    personStats
  };
};

/**
 * Apply filters to entities array
 */
export const applyFiltersToEntities = (entities, filters) => {
  let filtered = [...entities];

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(entity =>
      entity.name.toLowerCase().includes(searchLower) ||
      entity.registration_no.toLowerCase().includes(searchLower) ||
      (entity.contact_person && entity.contact_person.toLowerCase().includes(searchLower))
    );
  }

  // Apply state filter
  if (filters.state) {
    filtered = filtered.filter(entity =>
      (entity.primary_contact?.state?.toUpperCase() === filters.state.toUpperCase()) ||
      (entity.secondary_contact?.state?.toUpperCase() === filters.state.toUpperCase())
    );
  }

  // Apply city filter
  if (filters.city) {
    const cityLower = filters.city.toLowerCase();
    filtered = filtered.filter(entity =>
      (entity.primary_contact?.city?.toLowerCase().includes(cityLower)) ||
      (entity.secondary_contact?.city?.toLowerCase().includes(cityLower))
    );
  }

  // Apply email filter
  if (filters.emailFilter !== 'all') {
    if (filters.emailFilter === 'with-email') {
      filtered = filtered.filter(hasEntityEmail);
    } else if (filters.emailFilter === 'no-email') {
      filtered = filtered.filter(entity => !hasEntityEmail(entity));
    }
  }

  return filtered;
};

/**
 * Convert entity to contact format for email modal
 */
export const entityToContact = (entity) => {
  return {
    sebi_id: entity.sebi_id,
    id: entity.sebi_id,
    name: entity.contact_person || entity.name,
    bank_name: entity.name, // Use entity name as "bank" name
    email: getEntityEmail(entity),
    position: 'SEBI Registered Entity',
    type: 'sebi'
  };
};

/**
 * Debounce function for search input
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Safely get nested object property
 */
export const safeGet = (obj, path, defaultValue = null) => {
  return path.split('.').reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : defaultValue;
  }, obj);
};

/**
 * Generate className string conditionally
 */
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  }
};

/**
 * Event handling helpers
 */
export const preventDefault = (callback) => (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (callback) callback(event);
};

export const stopPropagation = (callback) => (event) => {
  event.stopPropagation();
  if (callback) callback(event);
};