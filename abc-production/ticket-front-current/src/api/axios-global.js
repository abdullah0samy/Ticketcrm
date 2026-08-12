import axios from "axios";

// API host is configurable so the app can run against a local backend.
// Set REACT_APP_API_BASE in .env.local; the original host stays the default.
export const baseUrl =
  process.env.REACT_APP_API_BASE || "https://support.telast.tech:8000/api";

axios.defaults.baseURL = baseUrl;

export const instanceLogin = axios.create({
  baseURL: baseUrl,
});

// --- PR (Patient Relations) service -----------------------------------------
// The `pr` app was extracted out of the ticketing monolith into its own service.
// Point REACT_APP_PR_API_BASE at it (e.g. http://localhost:8001/api) to talk to
// the standalone deployment; if unset it falls back to the monolith, so nothing
// breaks in environments where the split hasn't been rolled out yet.
export const prBaseUrl = process.env.REACT_APP_PR_API_BASE || baseUrl;

export const prApi = axios.create({ baseURL: prBaseUrl });

// Same auth/language headers and response unwrapping as the main instance.
prApi.interceptors.request.use(
  (config) => {
    config.headers = {
      ...config.headers,
      Authorization: `Token ${localStorage.getItem("Token")}`,
      "Accept-Language": `${localStorage.getItem("i18nextLng")}`,
    };
    return config;
  },
  (error) => Promise.reject(error.message)
);

prApi.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data?.message ?? error.message)
);

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    config.headers = {
      ...config.headers,
      Authorization: `Token ${localStorage.getItem("Token")}`,
      "Accept-Language": `${localStorage.getItem("i18nextLng")}`,
    };
    return config;
  },
  (error) => {
    return Promise.reject(error.message);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let errorMessage;
    if (error.response?.data?.message) {
      errorMessage = error.response?.data?.message;
    } else {
      errorMessage = error.message;
    }
    return Promise.reject(errorMessage);
  }
);
