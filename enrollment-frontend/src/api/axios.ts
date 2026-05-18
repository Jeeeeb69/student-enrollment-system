import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
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
          "http://127.0.0.1:8000/api/auth/jwt/refresh/",
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