// src/components/sebi/hooks/useSebiData.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { sebiApiService } from '../../../services/sebiApiService';
import { ERROR_MESSAGES } from '../utils/sebiConstants';

/**
 * Custom hook for managing SEBI data
 * Provides data fetching, caching, and state management for SEBI entities
 */
export const useSebiData = () => {
  const [entities, setEntities] = useState([]);
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastFetch, setLastFetch] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Safe state setter that checks if component is still mounted
   */
  const safeSetState = useCallback((setter) => {
    if (isMounted.current) {
      setter();
    }
  }, []);

  /**
   * Load initial data (entities, states, and categories)
   */
  const loadInitialData = useCallback(async () => {
    try {
      console.log('🔍 Starting data load...');
      setLoading(true);
      setError('');
      
      // First, test the connection
      const testResponse = await sebiApiService.testConnection();
      console.log('✅ Connection test result:', testResponse);
      
      // Then try to get entities
      console.log('📡 Fetching SEBI entities...');
      const entitiesResponse = await sebiApiService.getSebiEntities();
      console.log('📊 Raw entities response:', entitiesResponse);
      
      if (entitiesResponse.success) {
        console.log('🎯 Entities array:', entitiesResponse.entities);
        console.log('📈 Total entities:', entitiesResponse.entities?.length);
        
        // Log first entity structure
        if (entitiesResponse.entities && entitiesResponse.entities.length > 0) {
          console.log('🔬 First entity structure:', entitiesResponse.entities[0]);
          console.log('📝 Entity keys:', Object.keys(entitiesResponse.entities[0]));
          
          // Check primary contact structure
          const firstEntity = entitiesResponse.entities[0];
          console.log('📞 Primary contact:', firstEntity.primary_contact);
          console.log('📧 Has email?:', !!(firstEntity.primary_contact?.email));
        }
        
        setEntities(entitiesResponse.entities || []);
      } else {
        throw new Error(entitiesResponse.error || 'Failed to load entities');
      }
      
      // Try to get states
      try {
        const statesResponse = await sebiApiService.getSebiStates();
        console.log('🗺️ States response:', statesResponse);
        if (statesResponse.success) {
          setStates(statesResponse.states || []);
        }
      } catch (stateError) {
        console.warn('⚠️ States failed to load:', stateError);
        setStates([]);
      }
      
      setLastFetch(new Date().toISOString());
      
    } catch (err) {
      console.error('💥 Load initial data error:', err);
      setError(err.message || 'Failed to load SEBI data');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search entities with filters and retry logic
   */
  const searchEntities = useCallback(async (filters = {}, options = {}) => {
    const { retryOnError = true, maxRetries = 3 } = options;
    
    try {
      safeSetState(() => {
        setLoading(true);
        setError('');
      });
      
      const response = await sebiApiService.getSebiEntities(filters);
      
      if (response.success) {
        safeSetState(() => {
          setEntities(response.entities || []);
          setLastFetch(new Date().toISOString());
          setRetryCount(0);
        });
      } else {
        throw new Error(response.error || ERROR_MESSAGES.SEARCH_FAILED);
      }
      
    } catch (err) {
      const errorMessage = err.message || ERROR_MESSAGES.SEARCH_FAILED;
      
      // Retry logic for network errors
      if (retryOnError && retryCount < maxRetries && err.message.includes('fetch')) {
        console.warn(`Search failed, retrying... (${retryCount + 1}/${maxRetries})`);
        safeSetState(() => {
          setRetryCount(prev => prev + 1);
        });
        
        // Exponential backoff: wait 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return searchEntities(filters, { retryOnError, maxRetries });
      }
      
      safeSetState(() => {
        setError(errorMessage);
      });
      console.error('Search error:', err);
    } finally {
      safeSetState(() => {
        setLoading(false);
      });
    }
  }, [retryCount, safeSetState]);

  /**
   * Refresh data with cache invalidation
   */
  const refreshData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh || isDataStale()) {
      await loadInitialData();
    }
  }, [loadInitialData]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    safeSetState(() => {
      setError('');
    });
  }, [safeSetState]);

  /**
   * Get entity by ID
   */
  const getEntityById = useCallback((entityId) => {
    return entities.find(entity => `sebi-${entity.sebi_id}` === entityId);
  }, [entities]);

  /**
   * Get entities by state
   */
  const getEntitiesByState = useCallback((stateName) => {
    return entities.filter(entity => 
      entity.primary_contact?.state === stateName || 
      entity.secondary_contact?.state === stateName
    );
  }, [entities]);

  /**
   * Get entities by city
   */
  const getEntitiesByCity = useCallback((cityName) => {
    return entities.filter(entity => 
      entity.primary_contact?.city?.toLowerCase().includes(cityName.toLowerCase()) || 
      entity.secondary_contact?.city?.toLowerCase().includes(cityName.toLowerCase())
    );
  }, [entities]);

  /**
   * Get entities with email
   */
  const getEntitiesWithEmail = useCallback(() => {
    return entities.filter(entity => 
      entity.primary_contact?.email || entity.secondary_contact?.email
    );
  }, [entities]);

  /**
   * Get entities without email
   */
  const getEntitiesWithoutEmail = useCallback(() => {
    return entities.filter(entity => 
      !entity.primary_contact?.email && !entity.secondary_contact?.email
    );
  }, [entities]);

  /**
   * Get entities by registration number pattern
   */
  const getEntitiesByRegistration = useCallback((pattern) => {
    return entities.filter(entity => 
      entity.registration_no?.toLowerCase().includes(pattern.toLowerCase())
    );
  }, [entities]);

  /**
   * Get total count
   */
  const getTotalCount = useCallback(() => {
    return entities.length;
  }, [entities.length]);

  /**
   * Get entities count by state
   */
  const getEntitiesCountByState = useCallback(() => {
    const stateCounts = {};
    entities.forEach(entity => {
      const primaryState = entity.primary_contact?.state;
      const secondaryState = entity.secondary_contact?.state;
      
      if (primaryState) {
        stateCounts[primaryState] = (stateCounts[primaryState] || 0) + 1;
      }
      if (secondaryState && secondaryState !== primaryState) {
        stateCounts[secondaryState] = (stateCounts[secondaryState] || 0) + 1;
      }
    });
    return stateCounts;
  }, [entities]);

  /**
   * Search entities by contact person
   */
  const getEntitiesByContactPerson = useCallback((personName) => {
    return entities.filter(entity => 
      entity.contact_person?.toLowerCase().includes(personName.toLowerCase())
    );
  }, [entities]);

  /**
   * Get unique cities from entities
   */
  const getUniqueCities = useCallback(() => {
    const cities = new Set();
    entities.forEach(entity => {
      if (entity.primary_contact?.city) {
        cities.add(entity.primary_contact.city);
      }
      if (entity.secondary_contact?.city) {
        cities.add(entity.secondary_contact.city);
      }
    });
    return Array.from(cities).sort();
  }, [entities]);

  /**
   * Get entities with complete contact information
   */
  const getEntitiesWithCompleteContact = useCallback(() => {
    return entities.filter(entity => {
      const primaryComplete = entity.primary_contact?.email && 
                             entity.primary_contact?.telephone && 
                             entity.primary_contact?.address;
      const secondaryComplete = entity.secondary_contact?.email && 
                               entity.secondary_contact?.telephone && 
                               entity.secondary_contact?.address;
      return primaryComplete || secondaryComplete;
    });
  }, [entities]);

  /**
   * Check if data is stale (older than 5 minutes)
   */
  const isDataStale = useCallback(() => {
    if (!lastFetch) return true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastFetch) < fiveMinutesAgo;
  }, [lastFetch]);

  /**
   * Get cache info
   */
  const getCacheInfo = useCallback(() => {
    return {
      lastFetch,
      isStale: isDataStale(),
      age: lastFetch ? Date.now() - new Date(lastFetch).getTime() : null,
      entitiesCount: entities.length,
      statesCount: states.length,
      categoriesCount: categories.length
    };
  }, [lastFetch, isDataStale, entities.length, states.length, categories.length]);

  /**
   * Validate entity data structure
   */
  const validateEntityData = useCallback((entityList = entities) => {
    const validations = {
      total: entityList.length,
      valid: 0,
      invalid: 0,
      issues: []
    };

    entityList.forEach((entity, index) => {
      const issues = [];
      
      if (!entity.sebi_id) issues.push('Missing sebi_id');
      if (!entity.name) issues.push('Missing name');
      if (!entity.registration_no) issues.push('Missing registration_no');
      
      if (issues.length > 0) {
        validations.invalid++;
        validations.issues.push({
          index,
          entity: entity.name || `Entity ${index}`,
          issues
        });
      } else {
        validations.valid++;
      }
    });

    return validations;
  }, [entities]);

  /**
   * Export data for backup/analysis
   */
  const exportData = useCallback((format = 'json') => {
    const data = {
      entities,
      states,
      categories,
      metadata: {
        exportedAt: new Date().toISOString(),
        lastFetch,
        totalEntities: entities.length,
        version: '1.0.0'
      }
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      // Simple CSV export of entities
      const headers = ['Name', 'Registration No', 'Contact Person', 'Primary Email', 'Primary Phone', 'Primary City', 'Primary State'];
      const rows = entities.map(entity => [
        entity.name || '',
        entity.registration_no || '',
        entity.contact_person || '',
        entity.primary_contact?.email || '',
        entity.primary_contact?.telephone || '',
        entity.primary_contact?.city || '',
        entity.primary_contact?.state || ''
      ]);
      
      return [headers, ...rows].map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
    }

    return data;
  }, [entities, states, categories, lastFetch]);

  /**
   * Get data quality metrics
   */
  const getDataQuality = useCallback(() => {
    const metrics = {
      completeness: {
        withEmail: 0,
        withPhone: 0,
        withAddress: 0,
        withContactPerson: 0,
        complete: 0
      },
      duplicates: {
        byName: [],
        byRegistration: []
      },
      coverage: {
        states: new Set(),
        cities: new Set()
      }
    };

    // Check completeness
    entities.forEach(entity => {
      if (entity.primary_contact?.email || entity.secondary_contact?.email) {
        metrics.completeness.withEmail++;
      }
      if (entity.primary_contact?.telephone || entity.secondary_contact?.telephone) {
        metrics.completeness.withPhone++;
      }
      if (entity.primary_contact?.address || entity.secondary_contact?.address) {
        metrics.completeness.withAddress++;
      }
      if (entity.contact_person) {
        metrics.completeness.withContactPerson++;
      }
      
      const hasComplete = (entity.primary_contact?.email && entity.primary_contact?.telephone && entity.primary_contact?.address) ||
                         (entity.secondary_contact?.email && entity.secondary_contact?.telephone && entity.secondary_contact?.address);
      if (hasComplete) {
        metrics.completeness.complete++;
      }

      // Track coverage
      if (entity.primary_contact?.state) metrics.coverage.states.add(entity.primary_contact.state);
      if (entity.secondary_contact?.state) metrics.coverage.states.add(entity.secondary_contact.state);
      if (entity.primary_contact?.city) metrics.coverage.cities.add(entity.primary_contact.city);
      if (entity.secondary_contact?.city) metrics.coverage.cities.add(entity.secondary_contact.city);
    });

    // Convert sets to counts
    metrics.coverage.statesCount = metrics.coverage.states.size;
    metrics.coverage.citiesCount = metrics.coverage.cities.size;

    // Calculate percentages
    const total = entities.length;
    if (total > 0) {
      Object.keys(metrics.completeness).forEach(key => {
        if (typeof metrics.completeness[key] === 'number') {
          metrics.completeness[`${key}Percentage`] = Math.round((metrics.completeness[key] / total) * 100);
        }
      });
    }

    return metrics;
  }, [entities]);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Auto-refresh stale data
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDataStale() && !loading) {
        console.log('Data is stale, auto-refreshing...');
        refreshData(true);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isDataStale, loading, refreshData]);

  return {
    // Data
    entities,
    states,
    categories,
    loading,
    error,
    lastFetch,
    retryCount,
    
    // Actions
    loadInitialData,
    searchEntities,
    refreshData,
    clearError,
    
    // Basic Getters
    getEntityById,
    getEntitiesByState,
    getEntitiesByCity,
    getEntitiesWithEmail,
    getEntitiesWithoutEmail,
    getEntitiesByRegistration,
    getEntitiesByContactPerson,
    getTotalCount,
    
    // Advanced Getters
    getEntitiesCountByState,
    getUniqueCities,
    getEntitiesWithCompleteContact,
    getCacheInfo,
    getDataQuality,
    
    // Utilities
    validateEntityData,
    exportData,
    isDataStale,
    
    // Computed values
    hasData: entities.length > 0,
    hasError: !!error,
    isEmpty: entities.length === 0 && !loading,
    isRetrying: retryCount > 0,
    dataAge: lastFetch ? Date.now() - new Date(lastFetch).getTime() : null,
    
    // Statistics
    totalEntities: entities.length,
    totalStates: states.length,
    totalCategories: categories.length,
    entitiesWithEmail: entities.filter(e => e.primary_contact?.email || e.secondary_contact?.email).length,
    entitiesWithoutEmail: entities.filter(e => !e.primary_contact?.email && !e.secondary_contact?.email).length,
  };
};

export default useSebiData;