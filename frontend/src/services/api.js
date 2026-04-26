const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API
export const authAPI = {
  officerLogin: (email, password) =>
    apiCall('/auth/officer/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  officerSignup: (data) =>
    apiCall('/auth/officer/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  victimLogin: (email, password) =>
    apiCall('/auth/victim/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  victimSignup: (data) =>
    apiCall('/auth/victim/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  witnessLogin: (email, password) =>
    apiCall('/auth/witness/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  witnessSignup: (data) =>
    apiCall('/auth/witness/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Crimes API
export const crimesAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiCall(`/crimes${queryParams ? `?${queryParams}` : ''}`);
  },
  
  getById: (id) => apiCall(`/crimes/${id}`),
  
  create: (data) =>
    apiCall('/crimes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id, data) =>
    apiCall(`/crimes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id) =>
    apiCall(`/crimes/${id}`, {
      method: 'DELETE',
    }),
  
  linkSuspect: (crimeId, suspectId, role, arrestStatus) =>
    apiCall(`/crimes/${crimeId}/suspects`, {
      method: 'POST',
      body: JSON.stringify({ suspectId, role, arrestStatus }),
    }),
  
  linkVictim: (crimeId, victimId, injurySeverity) =>
    apiCall(`/crimes/${crimeId}/victims`, {
      method: 'POST',
      body: JSON.stringify({ victimId, injurySeverity }),
    }),

  linkWitness: (crimeId, witnessId, statementDate, statementText, isKeyWitness) =>
    apiCall(`/crimes/${crimeId}/witnesses`, {
      method: 'POST',
      body: JSON.stringify({ witnessId, statementDate, statementText, isKeyWitness }),
    }),

  updateWitness: (crimeId, witnessId, statementDate, statementText, isKeyWitness) =>
    apiCall(`/crimes/${crimeId}/witnesses/${witnessId}`, {
      method: 'PUT',
      body: JSON.stringify({ statementDate, statementText, isKeyWitness }),
    }),

  unlinkWitness: (crimeId, witnessId) =>
    apiCall(`/crimes/${crimeId}/witnesses/${witnessId}`, {
      method: 'DELETE',
    }),
};

// Suspects API
export const suspectsAPI = {
  getAll: (queryString = '') => apiCall(`/suspects${queryString}`),
  getById: (id) => apiCall(`/suspects/${id}`),
  create: (data) =>
    apiCall('/suspects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/suspects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/suspects/${id}`, {
      method: 'DELETE',
    }),
  arrest: (id, data) =>
    apiCall(`/suspects/${id}/arrest`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Victims API
export const victimsAPI = {
  getAll: (queryString = '') => apiCall(`/victims${queryString}`),
};

// Witnesses API
export const witnessesAPI = {
  getAll: (queryString = '') => apiCall(`/witnesses${queryString}`),
};

// Evidence API
export const evidenceAPI = {
  getAll: (queryString = '') => apiCall(`/evidence${queryString}`),
  getById: (id) => apiCall(`/evidence/${id}`),
  create: (data) =>
    apiCall('/evidence', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/evidence/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/evidence/${id}`, {
      method: 'DELETE',
    }),
};

// Locations API
export const locationsAPI = {
  getAll: () => apiCall('/locations'),
  getById: (id) => apiCall(`/locations/${id}`),
  create: (data) =>
    apiCall('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/locations/${id}`, {
      method: 'DELETE',
    }),
};

// Crime Types API
export const crimeTypesAPI = {
  getAll: () => apiCall('/crime-types'),
  getById: (id) => apiCall(`/crime-types/${id}`),
  create: (data) =>
    apiCall('/crime-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/crime-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/crime-types/${id}`, {
      method: 'DELETE',
    }),
};

// Crime Reports API (for Victims/Witnesses)
export const crimeReportsAPI = {
  create: (data) =>
    apiCall('/crime-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyReports: () => apiCall('/crime-reports'), // Backend filters by victimId from JWT token
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/crime-reports${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiCall(`/crime-reports/${id}`),
  updateStatus: (id, status) =>
    apiCall(`/crime-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ reportStatus: status }), // Backend expects 'reportStatus' not 'status'
    }),
  linkToCrime: (reportId, crimeId, notes) =>
    apiCall(`/crime-reports/${reportId}/link`, {
      method: 'POST',
      body: JSON.stringify({ crimeId, notes }),
    }),
  delete: (id) =>
    apiCall(`/crime-reports/${id}`, {
      method: 'DELETE',
    }),
};

// Analytics API
export const analyticsAPI = {
  getTrends: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/analytics/crime-trends${queryParams ? `?${queryParams}` : ''}`);
  },
  getHotspots: () => apiCall('/analytics/hotspots'),
  getStatistics: async () => {
    // Combine multiple analytics endpoints for statistics
    try {
      const [distribution, performance] = await Promise.all([
        apiCall('/analytics/category-distribution').catch(() => ({ data: null })),
        apiCall('/analytics/officer-performance').catch(() => ({ data: null })),
      ]);
      return {
        data: {
          categoryDistribution: distribution.data,
          officerPerformance: performance.data,
        }
      };
    } catch (error) {
      return { data: null };
    }
  },
  getPatterns: () => apiCall('/analytics/patterns'),
  getTimeAnalysis: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/analytics/time-series${queryParams ? `?${queryParams}` : ''}`);
  },
};

// Predictions API
export const predictionsAPI = {
  predictRisk: (data) =>
    apiCall('/predictions/risk-assessment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  findPatterns: (data) =>
    apiCall('/predictions/pattern-matching', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  forecastTrends: (params = {}) => {
    // Filter out null/undefined values before building query string
    const filteredParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        filteredParams[key] = params[key];
      }
    });
    const queryParams = new URLSearchParams(filteredParams).toString();
    return apiCall(`/predictions/forecast${queryParams ? `?${queryParams}` : ''}`);
  },
};

// Victim API
export const victimAPI = {
  getProfile: () => apiCall('/victim/profile'),
  updateProfile: (data) =>
    apiCall('/victim/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Witness API
export const witnessAPI = {
  getProfile: () => apiCall('/witness/profile'),
  updateProfile: (data) =>
    apiCall('/witness/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getMyCrimes: () => apiCall('/witness/crimes'),
  updateStatement: (crimeId, statementText) =>
    apiCall(`/witness/crimes/${crimeId}/statement`, {
      method: 'PUT',
      body: JSON.stringify({ statementText }),
    }),
};

// Officers API
export const officersAPI = {
  getAll: () => apiCall('/officers'),
  getById: (id) => apiCall(`/officers/${id}`),
  create: (data) =>
    apiCall('/officers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Investigations API
export const investigationsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/investigations${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiCall(`/investigations/${id}`),
  create: (data) =>
    apiCall('/investigations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/investigations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/investigations/${id}`, {
      method: 'DELETE',
    }),
  assignOfficer: (id, officerId) =>
    apiCall(`/investigations/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ officerId }),
    }),
  linkCrime: (id, crimeId) =>
    apiCall(`/investigations/${id}/crimes`, {
      method: 'POST',
      body: JSON.stringify({ crimeId }),
    }),
  getTeam: (id) => apiCall(`/investigations/${id}/team`),
  addTeamMember: (id, officerId, role) =>
    apiCall(`/investigations/${id}/team`, {
      method: 'POST',
      body: JSON.stringify({ officerId, role }),
    }),
  removeTeamMember: (id, officerId) =>
    apiCall(`/investigations/${id}/team/${officerId}`, {
      method: 'DELETE',
    }),
};

// Enhanced Evidence API with chain of custody
export const enhancedEvidenceAPI = {
  ...evidenceAPI,
  updateChain: (id, action, notes) =>
    apiCall(`/evidence/${id}/chain`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    }),
};
