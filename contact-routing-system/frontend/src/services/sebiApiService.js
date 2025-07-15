// src/components/sebi/services/sebiApiService.js - FIXED VERSION

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('🔧 SEBI API Service - Base URL:', API_URL);

export const sebiApiService = {
  /**
   * Get SEBI entities with enhanced error handling and debugging
   */
  getSebiEntities: async (filters = {}) => {
    try {
      console.log('📡 Fetching SEBI entities with filters:', filters);
      
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.state) params.append('state', filters.state);
      if (filters.city) params.append('city', filters.city);
      
      const queryString = params.toString();
      const url = `${API_URL}/api/sebi/entities${queryString ? '?' + queryString : ''}`;
      
      console.log('🌐 API Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      console.log('📋 API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch SEBI entities'}`);
      }
      
      const data = await response.json();
      console.log('✅ SEBI Entities Response:', data);
      
      return data;
    } catch (error) {
      console.error('🚨 SEBI API Error:', error);
      
      // Check if it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Network Error: Cannot connect to ${API_URL}. Please check if the backend is running.`);
      }
      
      // Check if it's a timeout
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. The server is taking too long to respond.');
      }
      
      throw new Error(error.message || 'Failed to fetch SEBI entities');
    }
  },

  /**
   * Get list of states with enhanced error handling
   */
  getSebiStates: async () => {
    try {
      console.log('📡 Fetching SEBI states...');
      
      const url = `${API_URL}/api/sebi/states`;
      console.log('🌐 States API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
      
      console.log('📋 States Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ States API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch states'}`);
      }
      
      const data = await response.json();
      console.log('✅ States Response:', data);
      
      return data;
    } catch (error) {
      console.error('🚨 States API Error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Network Error: Cannot connect to ${API_URL}/api/sebi/states`);
      }
      
      if (error.name === 'AbortError') {
        throw new Error('States request timeout');
      }
      
      throw new Error(error.message || 'Failed to fetch states');
    }
  },

  /**
   * Test API connectivity with detailed diagnostics
   */
  testConnection: async () => {
    try {
      console.log('🔍 Testing API connection...');
      
      const url = `${API_URL}/api/test`;
      console.log('🌐 Test URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      console.log('📋 Test Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Test API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Connection test failed'}`);
      }
      
      const data = await response.json();
      console.log('✅ Test Response:', data);
      
      return data;
    } catch (error) {
      console.error('🚨 Connection Test Error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('💀 CRITICAL: Backend server is not running or not accessible');
        throw new Error(`Backend Connection Failed: Cannot reach ${API_URL}`);
      }
      
      throw error;
    }
  },

  /**
   * Health check with backend status
   */
  healthCheck: async () => {
    try {
      console.log('🏥 Checking backend health...');
      
      const url = `${API_URL}/health`;
      console.log('🌐 Health URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Health Check:', data);
      
      return data;
    } catch (error) {
      console.error('🚨 Health Check Error:', error);
      throw error;
    }
  }
};

// Auto-test connection on import (only in development)
if (import.meta.env.DEV) {
  sebiApiService.testConnection()
    .then(() => console.log('🎉 Backend connection successful!'))
    .catch((error) => console.error('💥 Backend connection failed:', error.message));
}

export default sebiApiService;