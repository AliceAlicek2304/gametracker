/**
 * API Configuration
 * - Development: Uses Vite proxy to localhost:8080
 * - Production: Uses AWS API Gateway endpoint
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const config = {
  apiUrl: API_BASE_URL,
  endpoints: {
    auth: `${API_BASE_URL}/auth`,
    banners: `${API_BASE_URL}/banners`,
    characters: `${API_BASE_URL}/characters`,
    weapons: `${API_BASE_URL}/weapons`,
    echoes: `${API_BASE_URL}/echoes`,
    setEchoes: `${API_BASE_URL}/set-echoes`,
    account: `${API_BASE_URL}/account`,
  },
};

export default config;
