// src/components/sebi/SebiEntityModal.jsx

import React, { memo } from 'react';
import { X, Send, Mail, Phone, MapPin, Building, User, Calendar, ExternalLink, Copy, CheckCircle2, Clock } from 'lucide-react';
import { hasEntityEmail, getContactStatus, formatDate } from './utils/sebiHelpers';

/**
 * Entity Detail Modal Component
 * Shows comprehensive entity information and actions
 */
const SebiEntityModal = memo(({ 
  entity, 
  onClose, 
  onOpenEmailModal,
  contactStatus = {},
  contactedEntities = new Set()
}) => {
  if (!entity) return null;

  const hasEmail = hasEntityEmail(entity);
  const contactStatusEntity = getContactStatus(entity, contactStatus, contactedEntities);
  
  // Copy to clipboard function
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log(`${label} copied to clipboard`);
    });
  };

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{4})(\d{6})/, '+$1 $2-$3');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50" 
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{entity.name}</h3>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  📋 {entity.registration_no}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  contactStatusEntity.status === 'contacted' 
                    ? 'bg-green-100 text-green-800'
                    : contactStatusEntity.status === 'no-email'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {contactStatusEntity.status === 'contacted' && <CheckCircle2 size={14} className="mr-1" />}
                  {contactStatusEntity.status === 'no-email' && <X size={14} className="mr-1" />}
                  {contactStatusEntity.status === 'not-contacted' && <Clock size={14} className="mr-1" />}
                  {contactStatusEntity.text}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✅ Active Registration
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {hasEmail && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenEmailModal(entity);
                    onClose();
                  }}
                  disabled={contactStatusEntity.status === 'contacted'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                    contactStatusEntity.status === 'contacted'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
                  }`}
                  title={contactStatusEntity.status === 'contacted' ? 'Already contacted' : 'Send email'}
                >
                  <Send size={16} />
                  {contactStatusEntity.status === 'contacted' ? 'Email Sent' : 'Send Email'}
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Contact Person */}
          {entity.contact_person && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <User size={16} />
                Primary Contact Person
              </h4>
              <p className="text-blue-800 text-lg font-medium">{entity.contact_person}</p>
            </div>
          )}

          {/* Contact Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Primary Contact */}
            {entity.primary_contact && (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building size={16} className="text-purple-600" />
                  Primary Contact Details
                </h4>
                
                <div className="space-y-3">
                  {/* Address */}
                  {entity.primary_contact.address && (
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed">
                          {entity.primary_contact.address}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {[
                            entity.primary_contact.city,
                            entity.primary_contact.state,
                            entity.primary_contact.pincode
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(
                          `${entity.primary_contact.address}, ${entity.primary_contact.city}, ${entity.primary_contact.state} ${entity.primary_contact.pincode}`,
                          'Address'
                        )}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy address"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  )}
                  
                  {/* Email */}
                  {entity.primary_contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-blue-500 flex-shrink-0" />
                      <div className="flex-1">
                        <a 
                          href={`mailto:${entity.primary_contact.email}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {entity.primary_contact.email}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(entity.primary_contact.email, 'Email')}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy email"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  )}
                  
                  {/* Phone */}
                  {entity.primary_contact.telephone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-green-500 flex-shrink-0" />
                      <div className="flex-1">
                        <a 
                          href={`tel:${entity.primary_contact.telephone}`}
                          className="text-green-600 hover:text-green-800 hover:underline font-medium"
                        >
                          {formatPhoneNumber(entity.primary_contact.telephone)}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(entity.primary_contact.telephone, 'Phone')}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy phone"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  )}
                  
                  {/* Fax */}
                  {entity.primary_contact.fax && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-gray-600">Fax: {entity.primary_contact.fax}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Secondary Contact */}
            {entity.secondary_contact && entity.secondary_contact.address && (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building size={16} className="text-purple-600" />
                  Secondary Contact Details
                </h4>
                
                <div className="space-y-3">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">
                        {entity.secondary_contact.address}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {[
                          entity.secondary_contact.city,
                          entity.secondary_contact.state,
                          entity.secondary_contact.pincode
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(
                        `${entity.secondary_contact.address}, ${entity.secondary_contact.city}, ${entity.secondary_contact.state} ${entity.secondary_contact.pincode}`,
                        'Secondary Address'
                      )}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy address"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  
                  {/* Email */}
                  {entity.secondary_contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-blue-500 flex-shrink-0" />
                      <div className="flex-1">
                        <a 
                          href={`mailto:${entity.secondary_contact.email}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {entity.secondary_contact.email}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(entity.secondary_contact.email, 'Secondary Email')}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy email"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  )}
                  
                  {/* Phone */}
                  {entity.secondary_contact.telephone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-green-500 flex-shrink-0" />
                      <div className="flex-1">
                        <a 
                          href={`tel:${entity.secondary_contact.telephone}`}
                          className="text-green-600 hover:text-green-800 hover:underline font-medium"
                        >
                          {formatPhoneNumber(entity.secondary_contact.telephone)}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(entity.secondary_contact.telephone, 'Secondary Phone')}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy phone"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Registration Details */}
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-indigo-600" />
              Registration Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Registration Number:</span>
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  {entity.registration_no}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(entity.registration_no, 'Registration Number')}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy registration number"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Valid From:</span>
                <div className="font-medium text-gray-900">
                  {formatDate(entity.from_date)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Valid To:</span>
                <div className="font-medium text-gray-900">
                  {formatDate(entity.to_date)}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Status & Campaign Info */}
          {hasEmail && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 mb-6">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Send size={16} />
                Email Campaign Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-purple-800">
                    {contactStatusEntity.status === 'contacted' 
                      ? '✅ This entity has been contacted via email campaign.'
                      : '📧 This entity is available for email outreach.'
                    }
                  </p>
                  {contactStatusEntity.status === 'not-contacted' && (
                    <p className="text-xs text-purple-600 mt-1">
                      Click "Send Email" to start the conversation with pre-designed templates.
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end">
                  {contactStatusEntity.status === 'not-contacted' ? (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenEmailModal(entity);
                        onClose();
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                      <Send size={14} />
                      Send Email Now
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      Email Sent
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <h4 className="w-full font-semibold text-gray-900 mb-2">Quick Actions</h4>
            
            {entity.primary_contact?.email && (
              <a
                href={`mailto:${entity.primary_contact.email}?subject=Inquiry regarding ${entity.name}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <Mail size={14} />
                Direct Email
              </a>
            )}
            
            {entity.primary_contact?.telephone && (
              <a
                href={`tel:${entity.primary_contact.telephone}`}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                <Phone size={14} />
                Call Now
              </a>
            )}
            
            <button
              type="button"
              onClick={() => {
                const searchQuery = encodeURIComponent(`${entity.name} ${entity.registration_no} SEBI portfolio manager`);
                window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
            >
              <ExternalLink size={14} />
              Search Online
            </button>
            
            <button
              type="button"
              onClick={() => {
                const entityData = {
                  name: entity.name,
                  registration_no: entity.registration_no,
                  contact_person: entity.contact_person,
                  primary_email: entity.primary_contact?.email,
                  primary_phone: entity.primary_contact?.telephone,
                  primary_address: entity.primary_contact?.address
                };
                copyToClipboard(JSON.stringify(entityData, null, 2), 'Entity Data');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <Copy size={14} />
              Copy Details
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Data sourced from SEBI official records • Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

SebiEntityModal.displayName = 'SebiEntityModal';

export default SebiEntityModal;