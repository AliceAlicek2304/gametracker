// Lightweight fetch wrapper that emits a global event on 401 responses
export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  // preserve original fetch behavior
  const originalFetch = window.fetch.bind(window);
  const res = await originalFetch(input, init);
  if (res.status === 401) {
    try {
      window.dispatchEvent(new CustomEvent('app:unauthorized', { detail: { url: typeof input === 'string' ? input : (input as Request).url } }));
    } catch (e) {
      // ignore
    }
  }
  return res;
}

export default apiFetch;
