

export const server = import.meta.env.VITE_ENVIRONMENT_MODE === "production" 
  ? "https://erp-server-ic51.onrender.com/api" 
  : "http://localhost:3000/api";