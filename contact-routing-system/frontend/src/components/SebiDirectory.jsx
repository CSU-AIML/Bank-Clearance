// src/components/sebi/SebiDirectory.jsx - COMPLETE WITH ALL COMPONENTS

import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

// Import custom hooks
import useSebiData from "./sebi/hooks/useSebiData";
import useSebiContacts from "./sebi/hooks/useSebiContacts";

// Import all components
import SebiHeader from "./sebi/SebiHeader";
import SebiSearchFilters from "./sebi/SebiSearchFilters";
import SebiStatsPanel from "./sebi/SebiStatsPanel";
import SebiCampaignStats from "./sebi/SebiCampaignStats";
import SebiEntityCard from "./sebi/SebiEntityCard";
import SebiPagination from "./sebi/SebiPagination";
import SebiEntityModal from "./sebi/SebiEntityModal";
import SebiContactHistory from "./sebi/SebiContactHistory";
import EmailTemplate from "../components/EmailTemplate";

// Import utilities
import {
  getEntityId,
  applyFiltersToEntities,
  entityToContact,
  preventDefault,
} from "./sebi/utils/sebiHelpers";
import { DEFAULT_FILTERS, PAGINATION_CONFIG } from "./sebi/utils/sebiConstants";

/**
 * Complete SEBI Directory Component
 * Now with all components integrated!
 */
const SebiDirectory = () => {
  console.log("🚀 Complete SebiDirectory component mounting...");

  // Data management hooks
  const {
    entities,
    states,
    loading,
    error,
    searchEntities,
    loadInitialData,
    clearError,
    testConnection,
    healthCheck,
  } = useSebiData();

  const {
    contactStatus,
    contactedEntities,
    contactHistory,
    selectedEntities,
    editingNotes,
    tempNotes,
    toggleContacted,
    markEmailSent,
    startEditingNotes,
    saveNotes,
    cancelEditingNotes,
    updateTempNotes,
    toggleEntitySelection,
    selectMultipleEntities,
    clearAllSelections,
    resetAllContacts,
    getStatistics,
  } = useSebiContacts(entities);

  // Local state
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filteredEntities, setFilteredEntities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showContactDropdown, setShowContactDropdown] = useState({});

  // Modal states
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showContactHistory, setShowContactHistory] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // UI state
  const [showSimpleView, setShowSimpleView] = useState(false);

  // Prevent scroll restoration issues
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    return () => {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowContactDropdown({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Apply filters when entities or filters change
  useEffect(() => {
    console.log(
      "📊 Applying filters to entities:",
      entities.length,
      "entities"
    );
    const filtered = applyFiltersToEntities(entities, filters);
    setFilteredEntities(filtered);
    console.log("✅ Filtered results:", filtered.length, "entities");
  }, [entities, filters]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Pagination helpers - Define first to avoid hoisting issues
  const getCurrentPageEntities = useCallback(() => {
    const startIndex = (currentPage - 1) * PAGINATION_CONFIG.ITEMS_PER_PAGE;
    const endIndex = startIndex + PAGINATION_CONFIG.ITEMS_PER_PAGE;
    return filteredEntities.slice(startIndex, endIndex);
  }, [filteredEntities, currentPage]);

  const handleSelectAllVisible = useCallback(() => {
    const visibleIds = getCurrentPageEntities().map((e) => getEntityId(e));
    selectMultipleEntities(visibleIds);
  }, [selectMultipleEntities, getCurrentPageEntities]);

  // Event handlers with proper prevention
  // Event handlers with proper prevention - FIXED VERSION
  // Event handlers with proper prevention - FIXED VERSION
  const handleToggleContacted = useCallback((entityId, event, person = null) => {
    console.log("🚀 SebiDirectory handleToggleContacted:", { entityId, person });
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (person) {
      // Person provided - mark as contacted
      console.log("✅ Marking as contacted by:", person);
      toggleContacted(entityId, person); // Simple call with just entityId and person
      
      // Close dropdown after state update
      setShowContactDropdown(prev => ({ ...prev, [entityId]: false }));
    } else {
      // No person - either remove contact or show dropdown
      const currentStatus = contactStatus[entityId];
      if (currentStatus?.contacted) {
        console.log("❌ Removing contact");
        toggleContacted(entityId); // Remove contact
        setShowContactDropdown(prev => ({ ...prev, [entityId]: false }));
      } else {
        console.log("📋 Showing dropdown");
        setShowContactDropdown(prev => ({ ...prev, [entityId]: true }));
      }
    }
  }, [contactStatus, toggleContacted]);

  // Also add this simple test function
  const testContactUpdate = useCallback(() => {
    console.log("🧪 TEST: Manually calling toggleContacted");
    const firstEntityId = entities[0] ? getEntityId(entities[0]) : null;
    if (firstEntityId) {
      toggleContacted(firstEntityId, "TEST_PERSON");
      console.log("🧪 TEST COMPLETE");
    }
  }, [entities, toggleContacted]);

  const handleSelectContactPerson = useCallback(
    (entityId, person, event) => {
      console.log("👤 handleSelectContactPerson called:", {
        entityId,
        person,
        event: !!event,
      });

      if (event) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
      }

      // IMPORTANT: This is the key fix - call handleToggleContacted with the person
      handleToggleContacted(entityId, event, person);
    },
    [handleToggleContacted]
  );

  const handleEmailSent = useCallback(
    (contact, emailData) => {
      const entityId = getEntityId({ sebi_id: contact.sebi_id || contact.id });
      markEmailSent(entityId, emailData);
      setIsEmailModalOpen(false);
      setSelectedContact(null);
    },
    [markEmailSent]
  );

  const handleOpenEmailModal = useCallback((entity) => {
    const contact = entityToContact(entity);
    setSelectedContact(contact);
    setIsEmailModalOpen(true);
  }, []);

  const handleSearch = useCallback(async () => {
    await searchEntities(filters);
  }, [searchEntities, filters]);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setShowFilters(false);
    setCurrentPage(1);
    loadInitialData();
  }, [loadInitialData]);

  const totalPages = Math.ceil(
    filteredEntities.length / PAGINATION_CONFIG.ITEMS_PER_PAGE
  );
  const statistics = getStatistics();

  console.log("📈 Current state:", {
    entities: entities.length,
    filtered: filteredEntities.length,
    loading,
    error,
    statistics,
    showSimpleView,
  });

  // Simple View Toggle Component

  // Simple View Component (for when data is just loaded)
  const SimpleView = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Simple Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-purple-100">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            SEBI Portfolio Managers
          </h1>
          <p className="text-gray-600 mb-4">
            Registered entities under Securities and Exchange Board of India
          </p>

          {/* Status Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {entities.length}
              </div>
              <div className="text-xs text-purple-600">Total Entities</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                {filteredEntities.length}
              </div>
              <div className="text-xs text-blue-600">Filtered</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {statistics.contacted}
              </div>
              <div className="text-xs text-green-600">Contacted</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">
                {loading ? "⏳" : error ? "❌" : "✅"}
              </div>
              <div className="text-xs text-orange-600">
                {loading ? "Loading" : error ? "Error" : "Ready"}
              </div>
            </div>
          </div>
        </div>

        {/* Simple Entity List */}
        {entities.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
              <h2 className="text-xl font-semibold text-white">
                SEBI Entities ({entities.length} loaded)
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Data loaded successfully - Switch to Full Interface for advanced
                features
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {entities.slice(0, 10).map((entity, index) => (
                  <div
                    key={entity.sebi_id || index}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {entity.name || "Unnamed Entity"}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Registration: {entity.registration_no || "N/A"}
                        </p>
                        {entity.contact_person && (
                          <p className="text-sm text-gray-600">
                            Contact: {entity.contact_person}
                          </p>
                        )}
                        {entity.primary_contact?.email && (
                          <p className="text-sm text-blue-600">
                            📧 {entity.primary_contact.email}
                          </p>
                        )}
                        {entity.primary_contact?.city && (
                          <p className="text-sm text-gray-500">
                            📍 {entity.primary_contact.city},{" "}
                            {entity.primary_contact.state}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Active
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {entities.length > 10 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-blue-800">
                    <strong>Success!</strong> {entities.length} entities loaded.
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    Switch to "Full Interface" for search, filters, contact
                    management, and more!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Show simple view if requested or if just loaded
  if (showSimpleView || (entities.length > 0 && entities.length < 50)) {
    return <SimpleView />;
  }

  // Full Interface
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"
      style={{ overflowX: "hidden", overflowY: "auto" }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <SebiHeader
          statistics={statistics}
          filteredCount={filteredEntities.length}
        />

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-purple-100">
          <SebiSearchFilters
            filters={filters}
            states={states}
            loading={loading}
            showFilters={showFilters}
            contactedCount={statistics.contacted}
            onFiltersChange={setFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
          />

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <X size={16} />
                  <span>{error}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      loadInitialData();
                    }}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    🔄 Retry
                  </button>
                  <button
                    type="button"
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Panel */}
        <SebiStatsPanel
          statistics={statistics}
          selectedCount={selectedEntities.size}
          onSelectAllVisible={handleSelectAllVisible}
          onClearSelections={clearAllSelections}
          onShowContactHistory={() => setShowContactHistory(true)}
          onResetAllContacts={resetAllContacts}
        />

        {/* Campaign Stats */}
        <SebiCampaignStats
          entities={entities}
          filteredEntities={filteredEntities}
          contactedEntities={contactedEntities}
          onOpenEmailModal={handleOpenEmailModal}
          onResetCampaign={() => {
            const confirmed = window.confirm(
              "Are you sure you want to reset the email campaign?"
            );
            if (confirmed) {
              resetAllContacts();
            }
          }}
          onClearFilters={handleClearFilters}
        />

        {/* Results Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Search Results
              </h2>
              <div className="text-white text-sm">
                Page {currentPage} of {totalPages || 1}
              </div>
            </div>
            <p className="text-purple-100 text-sm mt-1">
              {filteredEntities.length} total entities found
              {filteredEntities.length > PAGINATION_CONFIG.ITEMS_PER_PAGE && (
                <span className="ml-2">
                  • Showing {PAGINATION_CONFIG.ITEMS_PER_PAGE} per page
                </span>
              )}
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading SEBI entities...</p>
              <p className="mt-2 text-sm text-gray-500">
                Backend connected successfully ✅
              </p>
            </div>
          ) : getCurrentPageEntities().length > 0 ? (
            <>
              <div className="p-6">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {getCurrentPageEntities().map((entity, index) => (
                    <SebiEntityCard
                      key={getEntityId(entity)}
                      entity={entity}
                      index={index}
                      contactStatus={contactStatus}
                      contactedEntities={contactedEntities}
                      selectedEntities={selectedEntities}
                      showContactDropdown={showContactDropdown}
                      editingNotes={editingNotes}
                      tempNotes={tempNotes}
                      onToggleContacted={handleToggleContacted}
                      onSelectContactPerson={handleSelectContactPerson}
                      onToggleSelection={toggleEntitySelection}
                      onOpenEmailModal={handleOpenEmailModal}
                      onSetShowContactDropdown={setShowContactDropdown}
                      onStartEditingNotes={startEditingNotes}
                      onSaveNotes={saveNotes}
                      onCancelEditingNotes={cancelEditingNotes}
                      onUpdateTempNotes={updateTempNotes}
                      onOpenEntityModal={setSelectedEntity}
                    />
                  ))}
                </div>
              </div>

              {/* Pagination */}
              <div className="border-t border-gray-200 px-6 py-4">
                <SebiPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredEntities.length}
                  selectedCount={selectedEntities.size}
                  currentPageItems={getCurrentPageEntities()}
                  onPageChange={setCurrentPage}
                  onSelectAllVisible={handleSelectAllVisible}
                  onClearAllSelections={clearAllSelections}
                />
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No entities found</h3>
              <p>
                Try adjusting your search criteria or clear filters to see all
                entities.
              </p>
              {filteredEntities.length === 0 && entities.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
              {entities.length === 0 && !loading && (
                <div className="mt-4">
                  <p className="text-blue-600 mb-2">
                    Backend connected ✅ - Waiting for data...
                  </p>
                  <button
                    type="button"
                    onClick={loadInitialData}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry Loading
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}

      {/* Entity Detail Modal */}
      {selectedEntity && (
        <SebiEntityModal
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          onOpenEmailModal={handleOpenEmailModal}
          contactStatus={contactStatus}
          contactedEntities={contactedEntities}
        />
      )}

      {/* Contact History Modal */}
      {showContactHistory && (
        <SebiContactHistory
          entities={entities}
          contactHistory={contactHistory}
          onClose={() => setShowContactHistory(false)}
        />
      )}

      {/* Email Template Modal */}
      <EmailTemplate
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        onSend={handleEmailSent}
      />
    </div>
  );
};

export default SebiDirectory;
