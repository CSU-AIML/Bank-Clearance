// src/components/sebi/hooks/useSebiContacts.js - FIXED VERSION

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, CONTACT_PERSONS } from '../utils/sebiConstants';
import { storage, getEntityId, calculateEntityStats } from '../utils/sebiHelpers';

/**
 * Custom hook for managing SEBI contact status and history
 */
export const useSebiContacts = (entities = []) => {
  const [contactStatus, setContactStatus] = useState({});
  const [contactedEntities, setContactedEntities] = useState(new Set());
  const [contactHistory, setContactHistory] = useState(new Map());
  const [selectedEntities, setSelectedEntities] = useState(new Set());
  const [editingNotes, setEditingNotes] = useState({});
  const [tempNotes, setTempNotes] = useState({});

  // Load data from localStorage on mount
  useEffect(() => {
    loadContactStatus();
    loadContactedEntities();
    loadContactHistory();
    loadSelectedEntities();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveContactStatus(contactStatus);
  }, [contactStatus]);

  useEffect(() => {
    saveContactedEntities(contactedEntities);
  }, [contactedEntities]);

  useEffect(() => {
    saveContactHistory(contactHistory);
  }, [contactHistory]);

  useEffect(() => {
    saveSelectedEntities(selectedEntities);
  }, [selectedEntities]);

  /**
   * Load contact status from localStorage
   */
  const loadContactStatus = useCallback(() => {
    const stored = storage.get(STORAGE_KEYS.CONTACT_STATUS, {});
    setContactStatus(stored);
  }, []);

  /**
   * Save contact status to localStorage
   */
  const saveContactStatus = useCallback((status) => {
    storage.set(STORAGE_KEYS.CONTACT_STATUS, status);
  }, []);

  /**
   * Load contacted entities from localStorage
   */
  const loadContactedEntities = useCallback(() => {
    const stored = storage.get(STORAGE_KEYS.CONTACTED_ENTITIES, []);
    setContactedEntities(new Set(stored));
  }, []);

  /**
   * Save contacted entities to localStorage
   */
  const saveContactedEntities = useCallback((entities) => {
    storage.set(STORAGE_KEYS.CONTACTED_ENTITIES, [...entities]);
  }, []);

  /**
   * Load contact history from localStorage
   */
  const loadContactHistory = useCallback(() => {
    const stored = storage.get(STORAGE_KEYS.CONTACT_HISTORY, []);
    setContactHistory(new Map(stored));
  }, []);

  /**
   * Save contact history to localStorage
   */
  const saveContactHistory = useCallback((history) => {
    const historyArray = Array.from(history.entries());
    storage.set(STORAGE_KEYS.CONTACT_HISTORY, historyArray);
  }, []);

  /**
   * Load selected entities from localStorage
   */
  const loadSelectedEntities = useCallback(() => {
    const stored = storage.get(STORAGE_KEYS.SELECTED_ENTITIES, []);
    setSelectedEntities(new Set(stored));
  }, []);

  /**
   * Save selected entities to localStorage
   */
  const saveSelectedEntities = useCallback((entities) => {
    storage.set(STORAGE_KEYS.SELECTED_ENTITIES, [...entities]);
  }, []);

  /**
   * Toggle contacted status for an entity
   * FIXED VERSION - handles multiple parameter patterns
   */
  // COMPLETE FIX - Replace these sections in your files

  // 1. FIRST: Fix useSebiContacts.js - Replace the toggleContacted function
  const toggleContacted = useCallback((entityId, person = null) => {
    console.log('🔄 toggleContacted called:', { entityId, person });
    
    setContactStatus(prev => {
      const currentStatus = prev[entityId] || {};
      console.log('📊 Current status:', currentStatus);
      
      if (person) {
        // Add contact with person
        console.log('✅ ADDING contact for:', entityId, 'by:', person);
        
        // Update contactedEntities immediately
        setContactedEntities(prevContacted => {
          const newContacted = new Set(prevContacted);
          newContacted.add(entityId);
          console.log('✅ contactedEntities updated:', [...newContacted]);
          return newContacted;
        });
        
        // Add to contact history
        const entity = entities.find(e => getEntityId(e) === entityId);
        if (entity) {
          setContactHistory(prevHistory => {
            const newHistory = new Map(prevHistory);
            newHistory.set(entityId, {
              contactedBy: person,
              contactedAt: new Date().toISOString(),
              method: 'Manual Contact',
              entityName: entity.name || 'Unknown Entity'
            });
            console.log('✅ contactHistory updated for:', entityId);
            return newHistory;
          });
        }
        
        const newStatus = {
          ...prev,
          [entityId]: {
            ...currentStatus,
            contacted: true,
            contactedAt: new Date().toISOString(),
            contactedBy: person
          }
        };
        
        console.log('✅ NEW CONTACT STATUS:', newStatus[entityId]);
        return newStatus;
        
      } else if (currentStatus?.contacted) {
        // Remove contact
        console.log('❌ REMOVING contact for:', entityId);
        
        setContactedEntities(prevContacted => {
          const newContacted = new Set(prevContacted);
          newContacted.delete(entityId);
          return newContacted;
        });
        
        return {
          ...prev,
          [entityId]: {
            ...currentStatus,
            contacted: false,
            contactedAt: null,
            contactedBy: null
          }
        };
      }
      
      return prev;
    });
  }, [entities]);

  /**
   * Mark entity as email sent
   */
  const markEmailSent = useCallback((entityId, emailData) => {
    const newStatus = {
      ...contactStatus,
      [entityId]: {
        ...contactStatus[entityId],
        emailSent: true,
        lastEmailSentAt: new Date().toISOString(),
        lastEmailSubject: emailData.subject,
        contacted: true,
        contactedAt: new Date().toISOString(),
        contactedBy: emailData.senderName || 'Email Campaign'
      }
    };
    setContactStatus(newStatus);
    
    // Add to contacted entities
    const newContactedEntities = new Set(contactedEntities);
    newContactedEntities.add(entityId);
    setContactedEntities(newContactedEntities);
    
    // Add to contact history
    const entity = entities.find(e => getEntityId(e) === entityId);
    const newHistory = new Map(contactHistory);
    newHistory.set(entityId, {
      contactedBy: emailData.senderName || 'Email Campaign',
      contactedAt: new Date().toISOString(),
      method: 'Email',
      subject: emailData.subject,
      entityName: entity?.name || 'Unknown Entity'
    });
    setContactHistory(newHistory);
  }, [contactStatus, contactedEntities, contactHistory, entities]);

  /**
   * Update notes for an entity
   */
  const updateNotes = useCallback((entityId, notes) => {
    const newStatus = {
      ...contactStatus,
      [entityId]: {
        ...contactStatus[entityId],
        notes: notes,
        notesUpdatedAt: new Date().toISOString()
      }
    };
    setContactStatus(newStatus);
  }, [contactStatus]);

  /**
   * Start editing notes
   */
  const startEditingNotes = useCallback((entityId) => {
    setEditingNotes(prev => ({ ...prev, [entityId]: true }));
    setTempNotes(prev => ({ 
      ...prev, 
      [entityId]: contactStatus[entityId]?.notes || '' 
    }));
  }, [contactStatus]);

  /**
   * Save notes
   */
  const saveNotes = useCallback((entityId) => {
    const notes = tempNotes[entityId] || '';
    updateNotes(entityId, notes);
    setEditingNotes(prev => ({ ...prev, [entityId]: false }));
    setTempNotes(prev => ({ ...prev, [entityId]: '' }));
  }, [tempNotes, updateNotes]);

  /**
   * Cancel editing notes
   */
  const cancelEditingNotes = useCallback((entityId) => {
    setEditingNotes(prev => ({ ...prev, [entityId]: false }));
    setTempNotes(prev => ({ ...prev, [entityId]: '' }));
  }, []);

  /**
   * Update temp notes
   */
  const updateTempNotes = useCallback((entityId, notes) => {
    setTempNotes(prev => ({ ...prev, [entityId]: notes }));
  }, []);

  /**
   * Toggle entity selection
   */
  const toggleEntitySelection = useCallback((entityId) => {
    const newSelected = new Set(selectedEntities);
    if (newSelected.has(entityId)) {
      newSelected.delete(entityId);
    } else {
      newSelected.add(entityId);
    }
    setSelectedEntities(newSelected);
  }, [selectedEntities]);

  /**
   * Select multiple entities
   */
  const selectMultipleEntities = useCallback((entityIds) => {
    const newSelected = new Set([...selectedEntities, ...entityIds]);
    setSelectedEntities(newSelected);
  }, [selectedEntities]);

  /**
   * Clear all selections
   */
  const clearAllSelections = useCallback(() => {
    setSelectedEntities(new Set());
  }, []);

  /**
   * Reset all contact data
   */
  const resetAllContacts = useCallback(() => {
    setContactStatus({});
    setContactedEntities(new Set());
    setContactHistory(new Map());
    setEditingNotes({});
    setTempNotes({});
    
    // Clear localStorage
    storage.remove(STORAGE_KEYS.CONTACT_STATUS);
    storage.remove(STORAGE_KEYS.CONTACTED_ENTITIES);
    storage.remove(STORAGE_KEYS.CONTACT_HISTORY);
  }, []);

  /**
   * Check if entity is contacted
   */
  const isEntityContacted = useCallback((entityId) => {
    return contactedEntities.has(entityId) || contactStatus[entityId]?.contacted;
  }, [contactedEntities, contactStatus]);

  /**
   * Get contact info for entity
   */
  const getEntityContactInfo = useCallback((entityId) => {
    return contactStatus[entityId] || {};
  }, [contactStatus]);

  /**
   * Get contact history for entity
   */
  const getEntityHistory = useCallback((entityId) => {
    return contactHistory.get(entityId) || null;
  }, [contactHistory]);

  /**
   * Calculate statistics
   */
  const getStatistics = useCallback(() => {
    return calculateEntityStats(entities, contactStatus, CONTACT_PERSONS);
  }, [entities, contactStatus]);

  return {
    // State
    contactStatus,
    contactedEntities,
    contactHistory,
    selectedEntities,
    editingNotes,
    tempNotes,
    
    // Actions
    toggleContacted,
    markEmailSent,
    updateNotes,
    startEditingNotes,
    saveNotes,
    cancelEditingNotes,
    updateTempNotes,
    toggleEntitySelection,
    selectMultipleEntities,
    clearAllSelections,
    resetAllContacts,
    
    // Getters
    isEntityContacted,
    getEntityContactInfo,
    getEntityHistory,
    getStatistics,
    
    // Computed values
    hasContactedEntities: contactedEntities.size > 0,
    hasSelectedEntities: selectedEntities.size > 0,
    selectedCount: selectedEntities.size,
    contactedCount: contactedEntities.size
  };
};

export default useSebiContacts;