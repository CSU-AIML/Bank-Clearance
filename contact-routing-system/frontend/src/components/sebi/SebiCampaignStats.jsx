// src/components/sebi/SebiCampaignStats.jsx

import React, { memo } from 'react';
import { Send, Mail, Target, TrendingUp, RefreshCw, Filter, Zap } from 'lucide-react';
import { getEntityId, hasEntityEmail } from './utils/sebiHelpers';

/**
 * Email Campaign Statistics Component
 * Shows campaign overview, progress, and quick actions
 */
const SebiCampaignStats = memo(({ 
  entities = [],
  filteredEntities = [],
  contactedEntities = new Set(),
  onOpenEmailModal,
  onResetCampaign,
  onClearFilters
}) => {
  
  // Calculate campaign statistics
  const totalEntities = entities.length;
  const filteredCount = filteredEntities.length;
  const entitiesWithEmail = entities.filter(hasEntityEmail);
  const filteredWithEmail = filteredEntities.filter(hasEntityEmail);
  const contactedCount = contactedEntities.size;
  const pendingCount = entitiesWithEmail.length - contactedCount;
  
  // Find next entity to contact
  const nextEntityToContact = filteredEntities.find(entity => 
    hasEntityEmail(entity) && !contactedEntities.has(getEntityId(entity))
  );
  
  // Calculate rates
  const contactRate = entitiesWithEmail.length > 0 
    ? Math.round((contactedCount / entitiesWithEmail.length) * 100) 
    : 0;
    
  const emailCoverage = totalEntities > 0 
    ? Math.round((entitiesWithEmail.length / totalEntities) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-purple-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Send size={20} className="text-purple-600" />
            Email Campaign Overview
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Track your outreach progress and manage email campaigns
          </p>
        </div>
        
        {/* Campaign Status Badge */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            pendingCount > 0 
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            {pendingCount > 0 ? '🚀 Campaign Active' : '✅ Campaign Complete'}
          </div>
        </div>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {/* Total Entities */}
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-gray-700">{totalEntities}</div>
          <div className="text-sm text-gray-600">Total Entities</div>
        </div>
        
        {/* Have Email */}
        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <div className="text-2xl font-bold text-blue-600">{entitiesWithEmail.length}</div>
          <div className="text-sm text-blue-600">Have Email</div>
          <div className="text-xs text-blue-500 mt-1">{emailCoverage}% coverage</div>
        </div>
        
        {/* Contacted */}
        <div className="text-center p-4 bg-green-50 rounded-xl">
          <div className="text-2xl font-bold text-green-600">{contactedCount}</div>
          <div className="text-sm text-green-600">Contacted</div>
          <div className="text-xs text-green-500 mt-1">{contactRate}% complete</div>
        </div>
        
        {/* Pending */}
        <div className="text-center p-4 bg-orange-50 rounded-xl">
          <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          <div className="text-sm text-orange-600">Pending</div>
          <div className="text-xs text-orange-500 mt-1">
            {entitiesWithEmail.length > 0 
              ? Math.round((pendingCount / entitiesWithEmail.length) * 100) 
              : 0}% remaining
          </div>
        </div>
        
        {/* Contact Rate */}
        <div className="text-center p-4 bg-purple-50 rounded-xl">
          <div className="text-2xl font-bold text-purple-600">{contactRate}%</div>
          <div className="text-sm text-purple-600">Success Rate</div>
          <div className="text-xs text-purple-500 mt-1">
            {contactedCount}/{entitiesWithEmail.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="flex items-center gap-2">
            <Target size={16} />
            Campaign Progress
          </span>
          <span className="font-medium">
            {contactedCount} of {entitiesWithEmail.length} contacted
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${contactRate}%` }}
          >
            {contactRate > 15 && (
              <span className="text-white text-xs font-medium">{contactRate}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Filtered Results Info */}
      {filteredCount !== totalEntities && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-medium">
                📊 Filtered Results: Showing {filteredCount} of {totalEntities} entities
              </p>
              {filteredWithEmail.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  • {filteredWithEmail.length} with email • {
                    filteredWithEmail.filter(e => !contactedEntities.has(getEntityId(e))).length
                  } pending contact
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClearFilters}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Filter size={12} />
              Clear Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next Contact Action */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Zap size={16} className="text-green-600" />
            Next Action
          </h3>
          {nextEntityToContact ? (
            <div>
              <p className="text-sm text-gray-700 mb-2">
                Ready to contact: <span className="font-medium">{nextEntityToContact.name}</span>
              </p>
              <button
                type="button"
                onClick={() => onOpenEmailModal(nextEntityToContact)}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Send size={14} />
                Email Now
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {pendingCount === 0 ? '🎉 All entities contacted!' : 'No entities available in current filter'}
              </p>
              <button
                type="button"
                onClick={onClearFilters}
                disabled={pendingCount === 0}
                className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg text-sm disabled:opacity-50"
              >
                {pendingCount === 0 ? 'Campaign Complete' : 'Show All'}
              </button>
            </div>
          )}
        </div>

        {/* Campaign Analytics */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-600" />
            Analytics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Email Coverage:</span>
              <span className="font-medium text-purple-600">{emailCoverage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contact Rate:</span>
              <span className="font-medium text-green-600">{contactRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Efficiency:</span>
              <span className="font-medium text-blue-600">
                {totalEntities > 0 ? Math.round((contactedCount / totalEntities) * 100) : 0}%
              </span>
            </div>
            {pendingCount > 0 && (
              <div className="pt-2 border-t border-purple-200">
                <div className="text-center">
                  <div className="text-xs text-purple-600">Estimated completion:</div>
                  <div className="font-medium text-purple-700">
                    {Math.ceil(pendingCount / 10)} days
                  </div>
                  <div className="text-xs text-purple-500">(at 10 contacts/day)</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Management */}
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <RefreshCw size={16} className="text-orange-600" />
            Campaign Control
          </h3>
          <div className="space-y-2">
            {contactedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset the email campaign? This will clear all contact history.')) {
                    onResetCampaign();
                  }
                }}
                className="w-full px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} />
                Reset Campaign
              </button>
            )}
            
            <button
              type="button"
              onClick={() => {
                const data = {
                  totalEntities,
                  entitiesWithEmail: entitiesWithEmail.length,
                  contacted: contactedCount,
                  pending: pendingCount,
                  contactRate,
                  exportedAt: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sebi-campaign-stats-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <Mail size={14} />
              Export Stats
            </button>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      {contactRate < 50 && pendingCount > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-2">💡 Campaign Tips</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• Use personalized email templates for better response rates</p>
            <p>• Contact entities during business hours (9 AM - 5 PM)</p>
            <p>• Follow up with non-responders after 3-5 business days</p>
            <p>• Track which email templates perform best</p>
          </div>
        </div>
      )}
    </div>
  );
});

SebiCampaignStats.displayName = 'SebiCampaignStats';

export default SebiCampaignStats;