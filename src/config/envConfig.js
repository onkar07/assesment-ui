// src/config/envConfig.js

// Detect runtime (Vite or CRA)
const getEnv = (key) => {
  if (import.meta && import.meta.env) {
    // Vite env
    return import.meta.env[key];
  }
  // CRA env
  return process.env[key];
};

const envConfig = {
  SITE_TITLE: getEnv("VITE_SITE_TITLE") || getEnv("REACT_APP_SITE_TITLE") || "Quiz App",
  ADMIN_PATH: getEnv("VITE_ADMIN_PATH") || getEnv("REACT_APP_ADMIN_PATH") || "/admin",
  VITE_API_URL: getEnv("VITE_API_URL") || getEnv("BASE_API_URL") || "http://localhost:4000/api"
};

export default envConfig;
