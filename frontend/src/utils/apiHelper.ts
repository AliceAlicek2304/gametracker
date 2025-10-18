import { config } from '../config/api';

/**
 * Build full API URL from relative path
 * @param path - Relative API path (e.g., '/characters' or 'characters')
 * @returns Full API URL
 */
export const apiUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${config.apiUrl}/${cleanPath}`;
};

/**
 * Fetch with automatic API URL building
 * @param path - Relative API path
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export const apiFetch = (path: string, options?: RequestInit): Promise<Response> => {
  return fetch(apiUrl(path), options);
};
