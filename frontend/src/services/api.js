import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/users/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          const { access } = response.data;
          localStorage.setItem("access_token", access);

          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post("/users/register/", userData),
  login: (credentials) => api.post("/users/login/", credentials),
  getProfile: () => api.get("/users/profile/"),
  updateProfile: (userData) => api.put("/users/profile/", userData),
};
// Add to existing api.js file
// Add to existing api.js file
export const prescriptionAPI = {
  // Get all prescriptions (role-based)
  getPrescriptions: () => api.get("/prescriptions/"),

  // Get single prescription
  getPrescription: (id) => api.get(`/prescriptions/${id}/`),

  // Create prescription (doctors only)
  createPrescription: (data) => api.post("/prescriptions/", data),

  // Update prescription
  updatePrescription: (id, data) => api.put(`/prescriptions/${id}/`, data),

  // Delete prescription
  deletePrescription: (id) => api.delete(`/prescriptions/${id}/`),

  // Get patients list (for doctors)
  getPatients: () => api.get("/prescriptions/patients/"),

  // Issue prescription (doctors only)
  issuePrescription: (id) => api.post(`/prescriptions/${id}/issue/`),

  // Fill prescription (pharmacists only)
  fillPrescription: (id) => api.post(`/prescriptions/${id}/fill/`),
};
// Add to existing api.js
export const ocrAPI = {
  uploadPrescription: (formData) => {
    return api.post("/ocr/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getUploads: () => api.get("/ocr/upload/"),
  getUpload: (id) => api.get(`/ocr/upload/${id}/`),
  deleteUpload: (id) => api.delete(`/ocr/upload/${id}/`),
  reprocessUpload: (id) => api.post(`/ocr/upload/${id}/reprocess/`),
};
export default api;
