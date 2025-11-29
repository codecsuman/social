import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

// ✅ AUTO HANDLE FORM DATA PROPERLY
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]; // Let browser set boundary
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// ✅ SMART ERROR HANDLING (NO FAKE ERRORS)
api.interceptors.response.use(
  (res) => res,
  (err) => {

    // ✅ Ignore canceled requests (not real errors)
    if (err.code === "ERR_CANCELED") {
      console.warn("⚠ Request canceled");
      return Promise.reject(err);
    }

    // ✅ Show real API errors cleanly
    console.error("❌ API ERROR:", {
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
      data: err.response?.data,
      url: err.config?.url
    });

    return Promise.reject(err);
  }
);

export default api;
