import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Install global fetch wrapper to broadcast 401 responses
(() => {
  const original = window.fetch.bind(window) as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await original(input, init as any);
    if (res.status === 401) {
      try { window.dispatchEvent(new CustomEvent('app:unauthorized')); } catch (e) { /* ignore */ }
    }
    return res;
  };
})();
