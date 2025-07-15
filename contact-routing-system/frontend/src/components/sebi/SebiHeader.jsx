// src/components/sebi/SebiHeader.jsx

import React, { memo } from 'react';
import { Building2, Mail, CheckCircle, Users, TrendingUp } from 'lucide-react';

/**
 * SEBI Directory Header Component
 * Displays title, description, and key statistics
 */
const SebiHeader = memo(({ 
  statistics = {},
  filteredCount = 0,
  showDetailedStats = true
}) => {
  const {
    totalEntities = 0,
    withEmail = 0,
    contacted = 0,
    contactRate = 0,
    personStats = []
  } = statistics;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-purple-100">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
        {/* Title Section */}
        <div className="flex-1 mb-4 lg:mb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SEBI Portfolio Managers
              </h1>
              <p className="text-gray-600 text-lg">
                Registered entities under Securities and Exchange Board of India
              </p>
            </div>
          </div>
          
          {/* Search Results Indicator */}
          {filteredCount !== totalEntities && filteredCount > 0 && (
            <div className="mt-3 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                <span className="font-semibold">Filtered Results:</span> Showing {filteredCount} of {totalEntities} entities
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats Cards */}
        <div className="flex flex-wrap gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 min-w-[100px]">
            <div className="flex items-center justify-center mb-1">
              <Building2 size={16} className="text-purple-600 mr-1" />
              <div className="text-2xl font-bold text-purple-600">{totalEntities}</div>
            </div>
            <div className="text-xs text-purple-600 font-medium">Total Entities</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 min-w-[100px]">
            <div className="flex items-center justify-center mb-1">
              <Mail size={16} className="text-blue-600 mr-1" />
              <div className="text-2xl font-bold text-blue-600">{withEmail}</div>
            </div>
            <div className="text-xs text-blue-600 font-medium">With Email</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 min-w-[100px]">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle size={16} className="text-green-600 mr-1" />
              <div className="text-2xl font-bold text-green-600">{contacted}</div>
            </div>
            <div className="text-xs text-green-600 font-medium">Contacted</div>
          </div>
          
          {contactRate > 0 && (
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 min-w-[100px]">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp size={16} className="text-orange-600 mr-1" />
                <div className="text-2xl font-bold text-orange-600">{contactRate}%</div>
              </div>
              <div className="text-xs text-orange-600 font-medium">Contact Rate</div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Statistics */}
      {showDetailedStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          {/* Contact Progress */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              Contact Progress
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Contacted:</span>
                <span className="font-medium text-green-600">{contacted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-medium text-orange-600">{totalEntities - contacted}</span>
              </div>
              {totalEntities > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(contacted / totalEntities) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {Math.round((contacted / totalEntities) * 100)}% Complete
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Email Coverage */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Mail size={16} className="text-blue-500" />
              Email Coverage
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">With Email:</span>
                <span className="font-medium text-blue-600">{withEmail}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">No Email:</span>
                <span className="font-medium text-gray-600">{totalEntities - withEmail}</span>
              </div>
              {totalEntities > 0 && (
                <div className="text-xs text-blue-600 font-medium">
                  {Math.round((withEmail / totalEntities) * 100)}% Coverage
                </div>
              )}
            </div>
          </div>

          {/* Team Performance */}
          {personStats && personStats.length > 0 && personStats.some(stat => stat.count > 0) && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Users size={16} className="text-purple-500" />
                Team Performance
              </h3>
              <div className="space-y-1">
                {personStats
                  .filter(stat => stat.count > 0)
                  .slice(0, 3) // Show top 3 performers
                  .map(({ person, count }) => (
                    <div key={person} className="flex justify-between text-sm">
                      <span className="text-gray-600">{person}:</span>
                      <span className="font-medium text-purple-600">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-500" />
              Quick Stats
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Entities:</span>
                <span className="font-medium">{totalEntities}</span>
              </div>
              {filteredCount !== totalEntities && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Filtered:</span>
                  <span className="font-medium text-blue-600">{filteredCount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Contactable:</span>
                <span className="font-medium text-green-600">{withEmail}</span>
              </div>
              {contactRate > 0 && (
                <div className="pt-2 border-t border-indigo-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-600">{contactRate}%</div>
                    <div className="text-xs text-indigo-500">Success Rate</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span>System Online</span>
        </div>
        
        {totalEntities > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Data Updated</span>
          </div>
        )}
        
        {withEmail > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Email Campaign Ready</span>
          </div>
        )}

        {/* Last Updated Info */}
        <div className="ml-auto text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
});

SebiHeader.displayName = 'SebiHeader';

export default SebiHeader;