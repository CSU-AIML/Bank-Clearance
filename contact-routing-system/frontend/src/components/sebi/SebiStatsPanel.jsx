// src/components/sebi/SebiStatsPanel.jsx

import React, { memo } from 'react';
import { Users, CheckCircle, Mail, BarChart3, RefreshCw, Eye, Trash2 } from 'lucide-react';
import { CONTACT_PERSONS } from './utils/sebiConstants';

/**
 * Statistics Panel Component
 * Shows contact progress, team performance, and bulk actions
 */
const SebiStatsPanel = memo(({ 
  statistics = {},
  selectedCount = 0,
  onSelectAllVisible,
  onClearSelections,
  onShowContactHistory,
  onResetAllContacts
}) => {
  const {
    totalEntities = 0,
    withEmail = 0,
    contacted = 0,
    emailSent = 0,
    remaining = 0,
    contactRate = 0,
    personStats = []
  } = statistics;

  const hasContactData = contacted > 0 || emailSent > 0;

  return (
    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30 shadow-lg mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Main Statistics */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-600" />
            Contact Statistics
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Entities */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-700">{totalEntities}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            
            {/* Contacted */}
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{contacted}</div>
              <div className="text-xs text-green-600">Contacted</div>
            </div>
            
            {/* Email Sent */}
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{emailSent}</div>
              <div className="text-xs text-blue-600">Emails Sent</div>
            </div>
            
            {/* Remaining */}
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{remaining}</div>
              <div className="text-xs text-orange-600">Remaining</div>
            </div>
          </div>

          {/* Progress Bar */}
          {totalEntities > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Contact Progress</span>
                <span className="font-medium">{contactRate}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${contactRate}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Team Performance */}
        {personStats.some(stat => stat.count > 0) && (
          <div className="bg-purple-50 rounded-lg p-4 min-w-[250px]">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Users size={16} className="text-purple-600" />
              Team Performance
            </h3>
            <div className="space-y-2">
              {personStats.map(({ person, count }) => (
                <div key={person} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{person}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-purple-600">{count}</span>
                    {count > 0 && (
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-purple-500 h-1 rounded-full"
                          style={{ 
                            width: `${contacted > 0 ? (count / contacted) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selection & Actions */}
        <div className="bg-blue-50 rounded-lg p-4 min-w-[200px]">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-blue-600" />
            Bulk Actions
          </h3>
          
          {selectedCount > 0 && (
            <div className="mb-3 p-2 bg-blue-100 rounded text-center">
              <span className="text-sm font-medium text-blue-800">
                {selectedCount} entities selected
              </span>
            </div>
          )}
          
          <div className="space-y-2">
            <button
              type="button"
              onClick={onSelectAllVisible}
              className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={14} />
              Select All Visible
            </button>
            
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={onClearSelections}
                className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Selection
              </button>
            )}
            
            <button
              type="button"
              onClick={onShowContactHistory}
              className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Eye size={14} />
              View History
            </button>
          </div>
        </div>

        {/* Reset Actions */}
        {hasContactData && (
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <RefreshCw size={16} className="text-red-600" />
              Reset Data
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Clear all contact data and start fresh
            </p>
            <button
              type="button"
              onClick={onResetAllContacts}
              className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={14} />
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Additional Stats Row */}
      {withEmail > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600">Email Coverage</div>
              <div className="font-semibold text-blue-600">
                {Math.round((withEmail / totalEntities) * 100)}%
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Contact Rate</div>
              <div className="font-semibold text-green-600">{contactRate}%</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Success Rate</div>
              <div className="font-semibold text-purple-600">
                {withEmail > 0 ? Math.round((contacted / withEmail) * 100) : 0}%
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Efficiency</div>
              <div className="font-semibold text-orange-600">
                {totalEntities > 0 ? Math.round((emailSent / totalEntities) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

SebiStatsPanel.displayName = 'SebiStatsPanel';

export default SebiStatsPanel;