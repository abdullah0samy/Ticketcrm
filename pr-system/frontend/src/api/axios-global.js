import axios from "axios";

/**
 * API client for the standalone PR service.
 *
 * Inside the ticketing SPA this file carried two clients (the monolith plus a
 * separate one for PR). This app talks to a single backend — the PR service — so
 * there is one client, and `prApi` is kept as an alias so the extracted screens
 * keep working without edits.
 */
export const baseUrl =
  process.env.REACT_APP_API_BASE || "http://localhost:8001/api";

axios.defaults.baseURL = baseUrl;

export const instanceLogin = axios.create({ baseURL: baseUrl });

const attachAuth = (config) => {
  config.headers = {
    ...config.headers,
    Authorization: `Token ${localStorage.getItem("Token")}`,
    "Accept-Language": `${localStorage.getItem("i18nextLng")}`,
  };
  return config;
};

axios.interceptors.request.use(attachAuth, (error) =>
  Promise.reject(error.message)
);

axios.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data?.message ?? error.message)
);

// The extracted screens import `prApi`; here it is the same backend.
export const prApi = axios;
export const prBaseUrl = baseUrl;
