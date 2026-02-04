import { getStorage, setStorage, removeStorage, getApiUrl } from "./utils";

const API_BASE_URL = getApiUrl();

/**
 * Make API request with proper headers and error handling
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  // Get auth token if available
  const token = getStorage("access_token");
  
  // Default headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  // Add auth header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    // Handle unauthorized error
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry original request
        return apiRequest(endpoint, options);
      } else {
        // Clear auth and redirect to login
        removeStorage("access_token");
        removeStorage("refresh_token");
        removeStorage("user");
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
      }
    }
    
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }
    
    return data;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 * @returns {Promise<boolean>} - Whether refresh was successful
 */
async function refreshAccessToken() {
  const refreshToken = getStorage("refresh_token");
  
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${refreshToken}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        setStorage("access_token", data.data.access_token);
        return true;
      }
    }
  } catch (error) {
    console.error("Token refresh error:", error);
  }
  
  return false;
}

// ==================== AUTH API ====================

export const authApi = {
  /**
   * Login user
   * @param {string} username - Username or email
   * @param {string} password - Password
   * @returns {Promise} - Login response
   */
  login: async (username, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    
    if (data.success) {
      setStorage("access_token", data.data.access_token);
      setStorage("refresh_token", data.data.refresh_token);
      setStorage("user", data.data.user);
    }
    
    return data;
  },
  
  /**
   * Logout user
   * @returns {Promise}
   */
  logout: async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      removeStorage("access_token");
      removeStorage("refresh_token");
      removeStorage("user");
    }
  },
  
  /**
   * Get current user
   * @returns {Promise}
   */
  getCurrentUser: async () => {
    return apiRequest("/auth/me");
  },
  
  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise}
   */
  changePassword: async (currentPassword, newPassword) => {
    return apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  },
};

// ==================== PUBLIC API ====================

export const publicApi = {
  // Teachers
  getTeachers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/public/teachers?${queryString}`);
  },
  
  getTeacher: async (id) => {
    return apiRequest(`/public/teachers/${id}`);
  },
  
  getDepartments: async () => {
    return apiRequest("/public/teachers/departments");
  },
  
  // Materials
  getMaterials: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/public/materials?${queryString}`);
  },
  
  getMaterial: async (id) => {
    return apiRequest(`/public/materials/${id}`);
  },
  
  getMaterialFilters: async () => {
    return apiRequest("/public/materials/filters");
  },
  
  // Schedules
  getSchedules: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/public/schedules?${queryString}`);
  },
  
  getScheduleFilters: async () => {
    return apiRequest("/public/schedules/filters");
  },
  
  // Registration
  registerStudent: async (data) => {
    return apiRequest("/public/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  checkRegistrationStatus: async (email) => {
    return apiRequest(`/public/register/check?email=${encodeURIComponent(email)}`);
  },
};

// ==================== ADMIN API ====================

export const adminApi = {
  // Dashboard
  getDashboardStats: async () => {
    return apiRequest("/admin/dashboard/stats");
  },
  
  // Users
  getUsers: async () => {
    return apiRequest("/admin/users");
  },
  
  createUser: async (data) => {
    return apiRequest("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  updateUser: async (id, data) => {
    return apiRequest(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  
  deleteUser: async (id) => {
    return apiRequest(`/admin/users/${id}`, {
      method: "DELETE",
    });
  },
  
  // Registrations
  getRegistrations: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/registrations?${queryString}`);
  },
  
  approveRegistration: async (id, data = {}) => {
    return apiRequest(`/admin/registrations/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  rejectRegistration: async (id, data = {}) => {
    return apiRequest(`/admin/registrations/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  // Students
  getStudents: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/students?${queryString}`);
  },
  
  getStudent: async (id) => {
    return apiRequest(`/admin/students/${id}`);
  },
  
  createStudent: async (data) => {
    return apiRequest("/admin/students", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  updateStudent: async (id, data) => {
    return apiRequest(`/admin/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  
  deleteStudent: async (id) => {
    return apiRequest(`/admin/students/${id}`, {
      method: "DELETE",
    });
  },
  
  // Teachers
  getAllTeachers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/teachers?${queryString}`);
  },
  
  createTeacher: async (data) => {
    return apiRequest("/admin/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  updateTeacher: async (id, data) => {
    return apiRequest(`/admin/teachers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  
  deleteTeacher: async (id) => {
    return apiRequest(`/admin/teachers/${id}`, {
      method: "DELETE",
    });
  },
  
  // Materials
  getAllMaterials: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/materials?${queryString}`);
  },
  
  createMaterial: async (data) => {
    return apiRequest("/admin/materials", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  updateMaterial: async (id, data) => {
    return apiRequest(`/admin/materials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  
  deleteMaterial: async (id) => {
    return apiRequest(`/admin/materials/${id}`, {
      method: "DELETE",
    });
  },
  
  // Schedules
  getAllSchedules: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/schedules?${queryString}`);
  },
  
  createSchedule: async (data) => {
    return apiRequest("/admin/schedules", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  updateSchedule: async (id, data) => {
    return apiRequest(`/admin/schedules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  
  deleteSchedule: async (id) => {
    return apiRequest(`/admin/schedules/${id}`, {
      method: "DELETE",
    });
  },
};