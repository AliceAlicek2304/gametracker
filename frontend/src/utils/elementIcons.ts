import { config } from '../config/api';
import { apiUrl } from './apiHelper';

// Utility to get element icon URL - supports both local and S3 storage modes
const ELEMENT_ICONS_CACHE: Record<string, string> = {};
let isFetching = false;
let fetchPromise: Promise<void> | null = null;

export const getElementIconUrl = async (element: string): Promise<string | null> => {
  const elementKey = element.toUpperCase();
  
  // Return from cache if available
  if (ELEMENT_ICONS_CACHE[elementKey]) {
    return ELEMENT_ICONS_CACHE[elementKey];
  }

  // Wait for existing fetch if in progress
  if (isFetching && fetchPromise) {
    await fetchPromise;
    return ELEMENT_ICONS_CACHE[elementKey] || null;
  }

  // Fetch element icons from API
  isFetching = true;
  fetchPromise = fetch(`${config.apiUrl}/elements/icons`)
    .then(response => response.json())
    .then(data => {
      // API returns array of {filename, url}
      if (Array.isArray(data)) {
        data.forEach((item: { filename: string; url: string }) => {
          // Extract element name from filename (e.g., 'havoc.png' -> 'HAVOC')
          const name = item.filename.split('.')[0].toUpperCase();
          ELEMENT_ICONS_CACHE[name] = item.url;
        });
      }
    })
    .catch(error => {
      console.error('Error fetching element icons:', error);
      // Fallback to API paths if fetch fails
      const fallbackIcons: Record<string, string> = {
        'HAVOC': apiUrl('elements/icon/havoc.png'),
        'AERO': apiUrl('elements/icon/aero.png'),
        'GLACIO': apiUrl('elements/icon/glacio.png'),
        'FUSION': apiUrl('elements/icon/fusion.png'),
        'ELECTRO': apiUrl('elements/icon/electro.png'),
        'SPECTRO': apiUrl('elements/icon/spectro.png')
      };
      Object.assign(ELEMENT_ICONS_CACHE, fallbackIcons);
    })
    .finally(() => {
      isFetching = false;
      fetchPromise = null;
    });

  await fetchPromise;
  return ELEMENT_ICONS_CACHE[elementKey] || null;
};

// Synchronous version - returns local fallback if cache empty
export const getElementIconUrlSync = (element: string): string | null => {
  const elementKey = element.toUpperCase();
  
  if (ELEMENT_ICONS_CACHE[elementKey]) {
    return ELEMENT_ICONS_CACHE[elementKey];
  }

  // Fallback to API path
  const fallbackIcons: Record<string, string> = {
    'HAVOC': apiUrl('elements/icon/havoc.png'),
    'AERO': apiUrl('elements/icon/aero.png'),
    'GLACIO': apiUrl('elements/icon/glacio.png'),
    'FUSION': apiUrl('elements/icon/fusion.png'),
    'ELECTRO': apiUrl('elements/icon/electro.png'),
    'SPECTRO': apiUrl('elements/icon/spectro.png')
  };
  
  return fallbackIcons[elementKey] || null;
};

// Preload element icons - call this once when app starts
export const preloadElementIcons = async (): Promise<void> => {
  await getElementIconUrl('HAVOC'); // This will fetch all icons
};
