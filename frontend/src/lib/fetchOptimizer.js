const inflightRequests = new Map();
const responseCache = new Map();

const DEFAULT_TTL_MS = 25_000;
const MAX_CACHE_ENTRIES = 250;

const normalizeHeaders = (headers) => {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers;
};

const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (value.expiresAt <= now) responseCache.delete(key);
  }

  if (responseCache.size <= MAX_CACHE_ENTRIES) return;
  const entries = [...responseCache.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt);
  const toDelete = entries.slice(0, responseCache.size - MAX_CACHE_ENTRIES);
  toDelete.forEach(([key]) => responseCache.delete(key));
};

const isGetMethod = (input, init) => {
  if (init?.method) return init.method.toUpperCase() === 'GET';
  if (input instanceof Request) return (input.method || 'GET').toUpperCase() === 'GET';
  return true;
};

const getRequestUrl = (input) => (input instanceof Request ? input.url : `${input}`);

const shouldOptimize = (url, headers, init) => {
  if (init?.cache === 'no-store') return false;
  const lowUrl = url.toLowerCase();
  if (lowUrl.includes('no_cache=1') || lowUrl.includes('nocache=1')) return false;

  const mergedHeaders = normalizeHeaders(headers);
  const noCacheHeader = mergedHeaders['x-no-cache'] || mergedHeaders['X-No-Cache'];
  if (`${noCacheHeader || ''}`.toLowerCase() === '1') return false;

  return lowUrl.includes('/api/') || lowUrl.includes('localhost:3000');
};

const buildCacheKey = (url, headers) => {
  const normalized = normalizeHeaders(headers);
  const auth = normalized.authorization || normalized.Authorization || '';
  return `${url}::${auth}`;
};

export const installFetchOptimizer = () => {
  if (typeof window === 'undefined') return;
  if (window.__quavemindFetchOptimized) return;
  window.__quavemindFetchOptimized = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    if (!isGetMethod(input, init)) {
      return originalFetch(input, init);
    }

    const url = getRequestUrl(input);
    const requestHeaders = init.headers || (input instanceof Request ? input.headers : undefined);

    if (!shouldOptimize(url, requestHeaders, init)) {
      return originalFetch(input, init);
    }

    cleanupCache();

    const cacheKey = buildCacheKey(url, requestHeaders);
    const now = Date.now();
    const ttl = Number(init.ttlMs || DEFAULT_TTL_MS);
    const cached = responseCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      return cached.response.clone();
    }

    if (inflightRequests.has(cacheKey)) {
      const sharedResponse = await inflightRequests.get(cacheKey);
      return sharedResponse.clone();
    }

    const requestPromise = originalFetch(input, init)
      .then((response) => {
        if (response.ok) {
          responseCache.set(cacheKey, {
            response: response.clone(),
            createdAt: Date.now(),
            expiresAt: Date.now() + ttl,
          });
        }
        return response;
      })
      .finally(() => {
        inflightRequests.delete(cacheKey);
      });

    inflightRequests.set(cacheKey, requestPromise);

    const response = await requestPromise;
    return response.clone();
  };
};

