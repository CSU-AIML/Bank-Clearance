// src/components/sebi/SebiContactHistory.jsx

import React, { memo, useState, useMemo } from 'react';
import { X, Mail, User, Clock, CheckCircle2, Calendar, Filter, Download, Search, BarChart3, TrendingUp } from 'lucide-react';
import { getEntityId, formatDateTime, formatDate } from './utils/sebiHelpers';
import { CONTACT_PERSONS } from './utils/sebiConstants';

/**
 * Contact History Modal Component
 * Shows comprehensive contact history with filtering and analytics
 */
const SebiContactHistory = memo(({ 
  entities = [],
  contactHistory = new Map(),
  onClose
}) => {
  const [filterPerson, setFilterPerson] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Convert Map to Array for processing
  const historyArray = useMemo(() => {
    return Array.from(contactHistory.entries()).map(([entityId, info]) => {
      const entity = entities.find(e => getEntityId(e) === entityId);
      return {
        entityId,
        entity,
        entityName: entity?.name || info.entityName || 'Unknown Entity',
        ...info
      };
    });
  }, [contactHistory, entities]);

  // Apply filters and search
  const filteredHistory = useMemo(() => {
    let filtered = historyArray;

    // Filter by person
    if (filterPerson !== 'all') {
      filtered = filtered.filter(item => item.contactedBy === filterPerson);
    }

    // Filter by method
    if (filterMethod !== 'all') {
      filtered = filtered.filter(item => item.method === filterMethod);
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.entityName.toLowerCase().includes(searchLower) ||
        item.contactedBy.toLowerCase().includes(searchLower) ||
        (item.subject && item.subject.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.contactedAt) - new Date(a.contactedAt);
        case 'date-asc':
          return new Date(a.contactedAt) - new Date(b.contactedAt);
        case 'entity':
          return a.entityName.localeCompare(b.entityName);
        case 'person':
          return a.contactedBy.localeCompare(b.contactedBy);
        default:
          return 0;
      }
    });

    return filtered;
  }, [historyArray, filterPerson, filterMethod, searchTerm, sortBy]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const total = historyArray.length;
    const byPerson = {};
    const byMethod = {};
    const byDate = {};
    
    CONTACT_PERSONS.forEach(person => {
      byPerson[person] = 0;
    });

    historyArray.forEach(item => {
      // By person
      byPerson[item.contactedBy] = (byPerson[item.contactedBy] || 0) + 1;
      
      // By method
      byMethod[item.method] = (byMethod[item.method] || 0) + 1;
      
      // By date (last 7 days)
      const date = new Date(item.contactedAt).toDateString();
      byDate[date] = (byDate[date] || 0) + 1;
    });

    return {
      total,
      byPerson: Object.entries(byPerson).filter(([_, count]) => count > 0),
      byMethod: Object.entries(byMethod),
      byDate: Object.entries(byDate),
      topPerformer: Object.entries(byPerson).reduce((max, [person, count]) => 
        count > max.count ? { person, count } : max, { person: 'None', count: 0 })
    };
  }, [historyArray]);

  // Export history as CSV
  const exportHistory = () => {
    const headers = ['Entity Name', 'Contacted By', 'Date', 'Time', 'Method', 'Subject', 'Registration No'];
    const rows = filteredHistory.map(item => [
      item.entityName,
      item.contactedBy,
      formatDate(item.contactedAt),
      new Date(item.contactedAt).toLocaleTimeString(),
      item.method,
      item.subject || '',
      item.entity?.registration_no || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sebi-contact-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (contactHistory.size === 0) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
          <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
          
          <div className="inline-block w-full max-w-md p-8 my-8 overflow-hidden text-center align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            <div className="text-center">
              <Mail size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Contact History</h3>
              <p className="text-gray-600 mb-6">Start reaching out to entities to build your contact history.</p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Clock size={24} className="text-purple-600" />
                Contact History
              </h3>
              <p className="text-gray-600">Track who has contacted which SEBI entities and when</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  showAnalytics 
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <BarChart3 size={16} />
                Analytics
              </button>
              <button
                type="button"
                onClick={exportHistory}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Analytics Panel */}
          {showAnalytics && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <TrendingUp size={16} />
                Contact Analytics
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Contacts */}
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analytics.total}</div>
                  <div className="text-sm text-gray-600">Total Contacts</div>
                </div>
                
                {/* Top Performer */}
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-green-600">{analytics.topPerformer.person}</div>
                  <div className="text-sm text-gray-600">Top Performer</div>
                  <div className="text-xs text-green-500">{analytics.topPerformer.count} contacts</div>
                </div>
                
                {/* Methods Used */}
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{analytics.byMethod.length}</div>
                  <div className="text-sm text-gray-600">Methods Used</div>
                  <div className="text-xs text-blue-500">
                    {analytics.byMethod.map(([method]) => method).join(', ')}
                  </div>
                </div>
                
                {/* Active Days */}
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{analytics.byDate.length}</div>
                  <div className="text-sm text-gray-600">Active Days</div>
                  <div className="text-xs text-orange-500">Last 30 days</div>
                </div>
              </div>
              
              {/* Team Performance Breakdown */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Team Performance</h5>
                  <div className="space-y-2">
                    {analytics.byPerson.map(([person, count]) => (
                      <div key={person} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{person}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-purple-600">{count}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${(count / analytics.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Contact Methods</h5>
                  <div className="space-y-2">
                    {analytics.byMethod.map(([method, count]) => (
                      <div key={method} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{method}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-blue-600">{count}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(count / analytics.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search entities, people, or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              {/* Filter by Person */}
              <select
                value={filterPerson}
                onChange={(e) => setFilterPerson(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Team Members</option>
                {CONTACT_PERSONS.map(person => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </select>
              
              {/* Filter by Method */}
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Methods</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="Manual">Manual</option>
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="entity">Entity Name</option>
                <option value="person">Team Member</option>
              </select>
            </div>
            
            {/* Active Filters Summary */}
            {(filterPerson !== 'all' || filterMethod !== 'all' || searchTerm) && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filterPerson !== 'all' && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    Person: {filterPerson}
                  </span>
                )}
                {filterMethod !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    Method: {filterMethod}
                  </span>
                )}
                {searchTerm && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    Search: "{searchTerm}"
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFilterPerson('all');
                    setFilterMethod('all');
                    setSearchTerm('');
                  }}
                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredHistory.length} of {historyArray.length} contact records
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={12} />
              <span>Real-time data</span>
            </div>
          </div>

          {/* Contact History List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Filter size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No records found</p>
                <p className="text-sm">
                  {searchTerm || filterPerson !== 'all' || filterMethod !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Start reaching out to entities to build your contact history.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item, index) => (
                  <div 
                    key={`${item.entityId}-${item.contactedAt}`} 
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {item.entityName}
                          </h4>
                          {item.entity?.registration_no && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              {item.entity.registration_no}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-purple-500" />
                            <span>Contacted by: <strong>{item.contactedBy}</strong></span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-blue-500" />
                            <span>{formatDateTime(item.contactedAt)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {item.method === 'Email' ? (
                              <Mail size={14} className="text-green-500" />
                            ) : (
                              <Phone size={14} className="text-orange-500" />
                            )}
                            <span>Method: <strong>{item.method}</strong></span>
                          </div>
                        </div>
                        
                        {item.subject && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-sm text-blue-800">
                              <strong>Subject:</strong> "{item.subject}"
                            </p>
                          </div>
                        )}
                        
                        {item.entity && (
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            {item.entity.primary_contact?.email && (
                              <span>📧 {item.entity.primary_contact.email}</span>
                            )}
                            {item.entity.primary_contact?.city && (
                              <span>📍 {item.entity.primary_contact.city}, {item.entity.primary_contact.state}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.method === 'Email' 
                            ? 'bg-green-100 text-green-800' 
                            : item.method === 'Phone'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <CheckCircle2 size={12} className="mr-1" />
                          {item.method} Sent
                        </span>
                        
                        <div className="text-xs text-gray-500">
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Statistics at Bottom */}
          {filteredHistory.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Summary Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{filteredHistory.length}</div>
                  <div className="text-sm text-gray-600">Total Contacts</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredHistory.filter(item => item.method === 'Email').length}
                  </div>
                  <div className="text-sm text-gray-600">Email Contacts</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(filteredHistory.map(item => item.contactedBy)).size}
                  </div>
                  <div className="text-sm text-gray-600">Team Members</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {new Set(filteredHistory.map(item => 
                      new Date(item.contactedAt).toDateString()
                    )).size}
                  </div>
                  <div className="text-sm text-gray-600">Active Days</div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-800 mb-2">Recent Activity</h5>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    Last contact: {formatDateTime(filteredHistory[0]?.contactedAt)}
                  </span>
                  <span>•</span>
                  <span>
                    Most active: {analytics.topPerformer.person} ({analytics.topPerformer.count} contacts)
                  </span>
                  <span>•</span>
                  <span>
                    Avg. per day: {Math.round(filteredHistory.length / Math.max(1, analytics.byDate.length))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <html>
                      <head><title>SEBI Contact History Report</title></head>
                      <body>
                        <h1>SEBI Contact History Report</h1>
                        <p>Generated on: ${new Date().toLocaleDateString()}</p>
                        <p>Total Records: ${filteredHistory.length}</p>
                        ${filteredHistory.map(item => `
                          <div style="border: 1px solid #ccc; margin: 10px 0; padding: 10px;">
                            <h3>${item.entityName}</h3>
                            <p>Contacted by: ${item.contactedBy}</p>
                            <p>Date: ${formatDateTime(item.contactedAt)}</p>
                            <p>Method: ${item.method}</p>
                            ${item.subject ? `<p>Subject: ${item.subject}</p>` : ''}
                          </div>
                        `).join('')}
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
              >
                <Calendar size={14} />
                Print Report
              </button>
              
              <button
                type="button"
                onClick={exportHistory}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

SebiContactHistory.displayName = 'SebiContactHistory';

export default SebiContactHistory;