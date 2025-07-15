// Updated SebiEntityCard.jsx with fixed event handling
import React, { memo, useCallback } from "react";
import {
  Star,
  CheckCircle2,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  X,
} from "lucide-react";
import {
  getEntityId,
  getContactStatus,
  hasEntityEmail,
  formatDate,
} from "./utils/sebiHelpers";
import { COMPONENT_CLASSES } from "./utils/sebiConstants";

/**
 * Individual SEBI Entity Card Component
 * Tracks WHO contacted each entity for person-based statistics
 */
const SebiEntityCard = memo(
  ({
    entity,
    index,
    contactStatus = {},
    contactedEntities = new Set(),
    selectedEntities = new Set(),
    showContactDropdown = {},
    editingNotes = {},
    tempNotes = {},
    onToggleContacted,
    onSelectContactPerson,
    onToggleSelection,
    onOpenEmailModal,
    onSetShowContactDropdown,
    onStartEditingNotes,
    onSaveNotes,
    onCancelEditingNotes,
    onUpdateTempNotes,
    onOpenEntityModal,
  }) => {
    const entityId = getEntityId(entity);
    const contactStatusEntity = getContactStatus(
      entity,
      contactStatus,
      contactedEntities
    );
    const hasEmail = hasEntityEmail(entity);
    const isSelected = selectedEntities.has(entityId);
    const status = contactStatus[entityId] || {};
    const isContacted =
      status?.contacted || contactedEntities.has(entityId) || false;
    const contactedBy = status?.contactedBy || null; // WHO contacted this entity
    const isEditingNote = editingNotes[entityId] || false;
    const showDropdown = showContactDropdown[entityId] || false;
    const hasEmailSent = status?.emailSent || false;

    // Team members who can contact entities (from ContactsList pattern)
    const contactPersons = ["Zainab", "Zinat", "Payal", "Farid"];

    // Safe event prevention helper
    const preventEvent = useCallback((event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
        // Only call stopImmediatePropagation if it exists
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
      }
    }, []);

    // Handle contact person selection (fixed version)
    const handlePersonSelect = useCallback(
      (person) => {
        console.log("👤 Person selected:", person, "for entity:", entityId);

        // Call parent handler directly
        if (typeof onToggleContacted === "function") {
          console.log("📞 Calling parent onToggleContacted...");
          onToggleContacted(entityId, null, person);
        }
      },
      [entityId, onToggleContacted]
    );

    // Toggle contacted status with person selection (fixed version)
    const handleContactButtonClick = useCallback(
      (event) => {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        const currentStatus = contactStatus[entityId];
        console.log("🔄 Contact button clicked:", { entityId, currentStatus });

        if (currentStatus?.contacted) {
          // Remove contact
          console.log("❌ Removing contact");
          if (typeof onToggleContacted === "function") {
            onToggleContacted(entityId, event);
          }
        } else {
          // Show dropdown
          console.log("📋 Showing dropdown");
          if (typeof onSetShowContactDropdown === "function") {
            onSetShowContactDropdown((prev) => ({ ...prev, [entityId]: true }));
          }
        }
      },
      [entityId, contactStatus, onToggleContacted, onSetShowContactDropdown]
    );

    // Other event handlers
    const handleCheckboxChange = useCallback(
      (event) => {
        event.stopPropagation();
        if (typeof onToggleSelection === "function") {
          onToggleSelection(entityId);
        }
      },
      [entityId, onToggleSelection]
    );

    const handleEmailClick = useCallback(
      (event) => {
        preventEvent(event);
        if (typeof onOpenEmailModal === "function") {
          onOpenEmailModal(entity);
        }
      },
      [entity, onOpenEmailModal, preventEvent]
    );

    const handleViewDetails = useCallback(
      (event) => {
        preventEvent(event);
        if (typeof onOpenEntityModal === "function") {
          onOpenEntityModal(entity);
        }
      },
      [entity, onOpenEntityModal, preventEvent]
    );

    const handleNotesChange = useCallback(
      (event) => {
        const value = event.target.value;
        if (typeof onUpdateTempNotes === "function") {
          onUpdateTempNotes(entityId, value);
        }
      },
      [entityId, onUpdateTempNotes]
    );

    const handleSaveNotes = useCallback(
      (event) => {
        preventEvent(event);
        if (typeof onSaveNotes === "function") {
          onSaveNotes(entityId);
        }
      },
      [entityId, onSaveNotes, preventEvent]
    );

    const handleCancelNotes = useCallback(
      (event) => {
        preventEvent(event);
        if (typeof onCancelEditingNotes === "function") {
          onCancelEditingNotes(entityId);
        }
      },
      [entityId, onCancelEditingNotes, preventEvent]
    );

    const handleStartEditingNotes = useCallback(
      (event) => {
        preventEvent(event);
        if (typeof onStartEditingNotes === "function") {
          onStartEditingNotes(entityId);
        }
      },
      [entityId, onStartEditingNotes, preventEvent]
    );

    // Close dropdown when clicking outside
    const handleDropdownBackdropClick = useCallback(
      (event) => {
        preventEvent(event);
        if (typeof onSetShowContactDropdown === "function") {
          onSetShowContactDropdown((prev) => ({ ...prev, [entityId]: false }));
        }
      },
      [entityId, onSetShowContactDropdown, preventEvent]
    );

    return (
      <div className={COMPONENT_CLASSES.CARD_BASE}>
        <div
          className={`${COMPONENT_CLASSES.CARD_CONTENT} ${
            isSelected ? "border-purple-500 bg-purple-50" : ""
          } ${isContacted ? "!border-l-4 !border-l-green-500" : ""}`}
        >
          {/* Selection Checkbox */}
          <div className="absolute top-4 left-4 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Contact Status Indicators */}
          <div className="absolute top-3 right-3 z-40 flex gap-1.5">
            {/* Email Button */}
            {hasEmail && (
              <button
                onClick={handleEmailClick}
                className={`p-2 rounded-full transition-all duration-200 shadow-sm ${
                  hasEmailSent
                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200 border-2 border-blue-300"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200 border-2 border-gray-300 hover:text-blue-500"
                }`}
                title={hasEmailSent ? "Email sent" : "Send email"}
              >
                <Mail size={16} />
              </button>
            )}

            {/* Contact Status Button - Shows WHO contacted */}
            <div className="relative">
              <button
                onClick={handleContactButtonClick}
                className={`p-2 rounded-full transition-all duration-200 shadow-sm ${
                  isContacted
                    ? "bg-green-100 text-green-600 hover:bg-green-200 border-2 border-green-300"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200 border-2 border-gray-300"
                }`}
                title={
                  isContacted
                    ? `Contacted by ${contactedBy} - Click to remove`
                    : "Click to assign contact person"
                }
              >
                {isContacted ? <CheckCircle2 size={16} /> : <Clock size={16} />}
              </button>

              {/* Contact Person Dropdown - WORKING VERSION */}
              {showDropdown && (
                <>
                  {/* Backdrop - positioned to not interfere */}
                  <div
                    className="fixed inset-0"
                    style={{
                      zIndex: 40,
                      backgroundColor: "transparent",
                      pointerEvents: "auto",
                    }}
                    onMouseDown={(e) => {
                      console.log("🚪 Backdrop mousedown - closing dropdown");
                      e.preventDefault();
                      if (typeof onSetShowContactDropdown === "function") {
                        onSetShowContactDropdown((prev) => ({
                          ...prev,
                          [entityId]: false,
                        }));
                      }
                    }}
                  />

                  {/* Dropdown Menu */}
                  <div
                    className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[140px] overflow-hidden"
                    style={{ zIndex: 50 }}
                    onMouseDown={(e) => {
                      // Prevent backdrop from closing when clicking inside dropdown
                      e.stopPropagation();
                    }}
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
                        Assign to:
                      </div>
                      {contactPersons.map((person) => (
                        <div
                          key={person}
                          onMouseDown={(e) => {
                            console.log("🎯 Person mousedown:", person);
                            e.preventDefault();
                            e.stopPropagation();

                            // Direct call to handle person selection
                            handlePersonSelect(person);

                            // Close dropdown immediately
                            if (
                              typeof onSetShowContactDropdown === "function"
                            ) {
                              onSetShowContactDropdown((prev) => ({
                                ...prev,
                                [entityId]: false,
                              }));
                            }
                          }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <User size={14} className="text-blue-500" />
                            {person}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Entity Information */}
          <div className="relative z-10 pr-24 ml-8">
            <h3 className="font-semibold text-lg text-gray-800 mb-1 leading-tight">
              {entity.name}
            </h3>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {entity.registration_no}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Star size={12} className="mr-1" />
                Active
              </span>
            </div>

            {entity.contact_person && (
              <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                <User size={14} className="text-gray-400" />
                <strong>Contact:</strong> {entity.contact_person}
              </p>
            )}

            {/* Email Status Info */}
            {hasEmailSent && status?.lastEmailSentAt && (
              <div className="mt-3 px-3 py-1.5 bg-blue-50 rounded-md border border-blue-200">
                <div className="text-xs text-blue-700 font-medium">
                  ✉ Email sent on {formatDate(status.lastEmailSentAt)}
                  {status.lastEmailSubject && (
                    <span className="block text-blue-600 mt-0.5 truncate">
                      Subject: {status.lastEmailSubject}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Contact Status Info - Shows WHO contacted and WHEN */}
            {isContacted && status?.contactedAt && (
              <div className="mt-3 px-3 py-1.5 bg-green-50 rounded-md border border-green-200">
                <div className="text-xs text-green-700 font-medium">
                  ✓ Contacted on {formatDate(status.contactedAt)}
                  {contactedBy && (
                    <span className="block text-green-600 mt-0.5 flex items-center gap-1">
                      <User size={12} />
                      by {contactedBy}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Contact Details */}
            <div className="space-y-2 mt-3">
              {entity.primary_contact?.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <a
                    href={`mailto:${entity.primary_contact.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-500 hover:text-blue-700 hover:underline text-sm transition-colors duration-150 break-all"
                  >
                    {entity.primary_contact.email}
                  </a>
                </div>
              )}
              {entity.primary_contact?.telephone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <a
                    href={`tel:${entity.primary_contact.telephone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-500 hover:text-blue-700 hover:underline text-sm transition-colors duration-150"
                  >
                    {entity.primary_contact.telephone}
                  </a>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="mt-4 border-t border-gray-200 pt-3">
              {isEditingNote ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    rows="3"
                    placeholder="Add notes about your conversation..."
                    value={tempNotes[entityId] || ""}
                    onChange={handleNotesChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNotes}
                      className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors duration-200 font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelNotes}
                      className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {status?.notes ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {status.notes}
                        </p>
                      </div>
                      <button
                        onClick={handleStartEditingNotes}
                        className="text-blue-500 text-sm hover:text-blue-700 transition-colors duration-150 flex items-center gap-1.5 font-medium"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit notes
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleStartEditingNotes}
                      className="text-blue-500 text-sm hover:text-blue-700 transition-colors duration-150 flex items-center gap-1.5 font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add notes
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Address and Actions */}
            {entity.primary_contact?.address && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin
                    size={14}
                    className="mt-0.5 text-gray-400 flex-shrink-0"
                  />
                  <span className="line-clamp-2">
                    {entity.primary_contact.address}
                    {entity.primary_contact.city &&
                      `, ${entity.primary_contact.city}`}
                    {entity.primary_contact.state &&
                      `, ${entity.primary_contact.state}`}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-3">
                    {entity.primary_contact.email && (
                      <a
                        href={`mailto:${entity.primary_contact.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Mail size={12} />
                        Email
                      </a>
                    )}
                    {entity.primary_contact.telephone && (
                      <a
                        href={`tel:${entity.primary_contact.telephone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition-colors"
                      >
                        <Phone size={12} />
                        Call
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleViewDetails}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            )}

            {/* No contact info message */}
            {!entity.primary_contact?.address &&
              !entity.primary_contact?.email && (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-sm">Contact information not available</p>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }
);

SebiEntityCard.displayName = "SebiEntityCard";

export default SebiEntityCard;
