import axios from "axios";

const DEPLOYED_API_URL = "https://student-enrollment-system-1-6qtc.onrender.com/api";
const LOCAL_API_URL = "http://127.0.0.1:8000/api";

const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || (isLocalhost ? LOCAL_API_URL : DEPLOYED_API_URL)
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${API_BASE_URL}/`,
});

// =======================
// 1. Attach token
// =======================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =======================
// 2. Handle expired token
// =======================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // If unauthorized
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        logout();
        return Promise.reject(error);
      }

      try {
        // ============================
        // FIXED REFRESH TOKEN URL
        // ============================
        const res = await axios.post(
          `${API_BASE_URL}/auth/jwt/refresh/`,
          { refresh }
        );

        const newAccess = res.data.access;

        // save new token
        localStorage.setItem("token", newAccess);

        // retry original request
        originalRequest.headers.Authorization =
          `Bearer ${newAccess}`;

        return api(originalRequest);

      } catch (err) {

        logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// =======================
// 3. Logout helper
// =======================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");

  window.location.href = "/login";
}

export default api;
