import axios from "axios";

// Create base Axios instance for backend
const api = axios.create({
  baseURL: "http://localhost:8080", // Your Spring Boot backend
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for CORS with credentials
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor - Attach Basic Auth header automatically
api.interceptors.request.use(
  (config) => {
    const authHeader = sessionStorage.getItem("authHeader");
    
    if (authHeader) {
      config.headers.Authorization = authHeader;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Successfully received response
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          console.error("Authentication failed - redirecting to login");
          sessionStorage.removeItem("authHeader");
          sessionStorage.removeItem("username");
          sessionStorage.removeItem("userRoles");
          
          // Redirect to login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          break;

        case 403:
          // Forbidden - user doesn't have required role
          console.error("Access forbidden - insufficient permissions");
          break;

        case 404:
          console.error("Resource not found");
          break;

        case 500:
          console.error("Internal server error");
          break;

        default:
          console.error(`Error: ${error.response.status}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network error - no response from server");
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================
// Authentication Helper Functions
// ============================================

/**
 * Set authentication credentials
 * @param {string} username 
 * @param {string} password 
 */
export const setAuth = (username, password) => {
  const credentials = btoa(`${username}:${password}`);
  const authHeader = `Basic ${credentials}`;
  
  sessionStorage.setItem("authHeader", authHeader);
  sessionStorage.setItem("username", username);
};

/**
 * Clear authentication credentials
 */
export const clearAuth = () => {
  sessionStorage.removeItem("authHeader");
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("userRoles");
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!sessionStorage.getItem("authHeader");
};

/**
 * Get current username
 * @returns {string|null}
 */
export const getUsername = () => {
  return sessionStorage.getItem("username");
};

/**
 * Get user roles
 * @returns {Array<string>}
 */
export const getUserRoles = () => {
  const roles = sessionStorage.getItem("userRoles");
  return roles ? JSON.parse(roles) : [];
};

/**
 * Set user roles
 * @param {Array<string>} roles 
 */
export const setUserRoles = (roles) => {
  sessionStorage.setItem("userRoles", JSON.stringify(roles));
};

/**
 * Check if user has specific role
 * @param {string} role 
 * @returns {boolean}
 */
export const hasRole = (role) => {
  const roles = getUserRoles();
  return roles.includes(role) || roles.includes(`ROLE_${role}`);
};

// ============================================
// API Service Functions
// ============================================

/**
 * Login user with credentials
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>}
 */
export const login = async (username, password) => {
  try {
    // Set credentials temporarily for this request
    const credentials = btoa(`${username}:${password}`);
    const authHeader = `Basic ${credentials}`;

    // Call profile endpoint to verify credentials and get roles
    const response = await api.get("/api/user/profile", {
      headers: {
        Authorization: authHeader,
      },
    });

    if (response.status === 200) {
      // Store credentials and user info
      setAuth(username, password);
      setUserRoles(response.data.roles || []);

      return {
        success: true,
        user: response.data,
      };
    }
  } catch (error) {
    console.error("Login failed:", error);
    
    if (error.response?.status === 401) {
      return {
        success: false,
        error: "Invalid username or password",
      };
    }
    
    return {
      success: false,
      error: "Unable to connect to server. Please try again.",
    };
  }
};

/**
 * Logout user
 */
export const logout = () => {
  clearAuth();
  window.location.href = "/login";
};

/**
 * Get current user profile
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/api/user/profile");
    return response.data;
  } catch (error) {
    console.error("Failed to get user profile:", error);
    throw error;
  }
};

/**
 * Check if user has a specific role
 * @param {string} role 
 * @returns {Promise<boolean>}
 */
export const checkRole = async (role) => {
  try {
    const response = await api.get(`/api/user/check-role/${role}`);
    return response.data.hasRole;
  } catch (error) {
    console.error("Failed to check role:", error);
    return false;
  }
};

// ============================================
// Example API Calls for Different Roles
// ============================================

// Submitter API calls
export const submitterAPI = {
  getDocuments: () => api.get("/api/submitter/documents"),
  createDocument: (data) => api.post("/api/submitter/documents", data),
  updateDocument: (id, data) => api.put(`/api/submitter/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/api/submitter/documents/${id}`),
};

// Reviewer API calls
export const reviewerAPI = {
  getReviewQueue: () => api.get("/api/reviewer/queue"),
  reviewDocument: (id, reviewData) => api.post(`/api/reviewer/documents/${id}/review`, reviewData),
  getDocumentDetails: (id) => api.get(`/api/reviewer/documents/${id}`),
};

// Approver API calls
export const approverAPI = {
  getApprovalQueue: () => api.get("/api/approver/queue"),
  approveDocument: (id, approvalData) => api.post(`/api/approver/documents/${id}/approve`, approvalData),
  rejectDocument: (id, rejectionData) => api.post(`/api/approver/documents/${id}/reject`, rejectionData),
};

// Admin API calls
export const adminAPI = {
  getUsers: () => api.get("/api/admin/users"),
  getSystemStats: () => api.get("/api/admin/stats"),
  updateSettings: (settings) => api.put("/api/admin/settings", settings),
};

// Export the main api instance as default
export default api;