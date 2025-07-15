// src/components/sebi/SebiSearchFilters.jsx

import React, { memo, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import { 
  EMAIL_FILTER_OPTIONS, 
  QUICK_FILTER_BUTTONS, 
  COMPONENT_CLASSES 
} from './utils/sebiConstants';

/**
 * Search and Filters Component
 * Handles search input and filter controls
 */
const SebiSearchFilters = memo(({ 
  filters,
  states,
  loading,
  showFilters,
  contactedCount,
  onFiltersChange,
  onToggleFilters,
  onSearch,
  onClearFilters
}) => {

  const handleSearchChange = useCallback((e) => {
    onFiltersChange({ ...filters, search: e.target.value });
  }, [filters, onFiltersChange]);

  const handleStateChange = useCallback((e) => {
    onFiltersChange({ ...filters, state: e.target.value });
  }, [filters, onFiltersChange]);

  const handleCityChange = useCallback((e) => {
    onFiltersChange({ ...filters, city: e.target.value });
  }, [filters, onFiltersChange]);

  const handleEmailFilterChange = useCallback((e) => {
    onFiltersChange({ ...filters, emailFilter: e.target.value });
  }, [filters, onFiltersChange]);

  const handleQuickFilterClick = useCallback((filterValue) => {
    onFiltersChange({ ...filters, emailFilter: filterValue });
  }, [filters, onFiltersChange]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  }, [onSearch]);

  const handleContactedClick = useCallback(() => {
    alert(`${contactedCount} entities have been contacted`);
  }, [contactedCount]);

  return (
    <div className="space-y-4">
      {/* Main Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            className={`${COMPONENT_CLASSES.INPUT_FIELD} pl-10`}
            placeholder="Search by name, registration number, or contact person..."
          />
        </div>
        
        <button
          type="button"
          onClick={onToggleFilters}
          className={`px-4 py-3 rounded-xl border transition-all ${showFilters 
            ? 'bg-purple-100 border-purple-300 text-purple-700' 
            : 'border-gray-300 hover:bg-gray-50'}`}
        >
          <Filter size={20} />
        </button>
        
        <button
          type="button"
          onClick={onSearch}
          disabled={loading}
          className={`px-6 py-3 ${COMPONENT_CLASSES.BUTTON_PRIMARY} disabled:opacity-50 disabled:hover:scale-100`}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Quick Email Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Quick filters:</span>
        <div className="flex gap-2">
          {QUICK_FILTER_BUTTONS.map((button) => (
            <button
              key={button.key}
              type="button"
              onClick={() => handleQuickFilterClick(button.key)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filters.emailFilter === button.key
                  ? button.className
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {button.label}
            </button>
          ))}
          
          {/* Contact Status Filter */}
          <button
            type="button"
            onClick={handleContactedClick}
            className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            ✅ Contacted ({contactedCount})
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Filter
            </label>
            <select
              value={filters.emailFilter}
              onChange={handleEmailFilterChange}
              className={COMPONENT_CLASSES.INPUT_FIELD}
            >
              <option value={EMAIL_FILTER_OPTIONS.ALL}>All Entities</option>
              <option value={EMAIL_FILTER_OPTIONS.WITH_EMAIL}>With Email Only</option>
              <option value={EMAIL_FILTER_OPTIONS.NO_EMAIL}>No Email Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              value={filters.state}
              onChange={handleStateChange}
              className={COMPONENT_CLASSES.INPUT_FIELD}
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={filters.city}
              onChange={handleCityChange}
              className={COMPONENT_CLASSES.INPUT_FIELD}
              placeholder="Enter city name"
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="button"
              onClick={onClearFilters}
              className={`w-full px-4 py-2 ${COMPONENT_CLASSES.BUTTON_SECONDARY}`}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

SebiSearchFilters.displayName = 'SebiSearchFilters';

export default SebiSearchFilters;