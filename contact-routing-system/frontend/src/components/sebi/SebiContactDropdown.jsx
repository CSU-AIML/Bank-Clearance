// src/components/sebi/SebiContactDropdown.jsx

import React, { memo, useCallback } from 'react';
import { CheckCircle } from 'lucide-react';
import { CONTACT_PERSONS, COMPONENT_CLASSES, Z_INDEX } from './utils/sebiConstants';
import { preventDefault } from './utils/sebiHelpers';

/**
 * Contact Person Dropdown Component
 * Handles contact status toggle and person selection
 */
const SebiContactDropdown = memo(({ 
  entityId,
  isContacted,
  showDropdown,
  onToggleContacted,
  onSelectContactPerson,
  onSetShowDropdown
}) => {
  
  const handleDropdownClick = useCallback(
    preventDefault(() => {
      // Prevent dropdown from closing when clicking inside
    }),
    []
  );

  const handleBackdropClick = useCallback(
    preventDefault(() => {
      onSetShowDropdown(prev => ({ ...prev, [entityId]: false }));
    }),
    [entityId, onSetShowDropdown]
  );

  const handlePersonClick = useCallback(
    (person) => preventDefault(() => {
      onSelectContactPerson(person);
    }),
    [onSelectContactPerson]
  );

  return (
    <div className="relative dropdown-container">
      <button
        type="button"
        onClick={onToggleContacted}
        className={`p-2 rounded-full transition-all duration-200 shadow-sm ${
          isContacted 
            ? 'bg-green-100 text-green-600 hover:bg-green-200 border-2 border-green-300' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border-2 border-gray-300'
        }`}
        title={isContacted ? 'Mark as not contacted' : 'Mark as contacted'}
      >
        <CheckCircle size={16} />
      </button>
      
      {/* Contact Person Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0"
            style={{ zIndex: Z_INDEX.BACKDROP }}
            onClick={handleBackdropClick}
          />
          
          {/* Dropdown Content */}
          <div 
            className={COMPONENT_CLASSES.DROPDOWN_CONTAINER}
            style={{ zIndex: Z_INDEX.DROPDOWN }}
            onClick={handleDropdownClick}
          >
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
                Contacted by:
              </div>
              {CONTACT_PERSONS.map((person) => (
                <button
                  key={person}
                  type="button"
                  onClick={handlePersonClick(person)}
                  className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                >
                  {person}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

SebiContactDropdown.displayName = 'SebiContactDropdown';

export default SebiContactDropdown;