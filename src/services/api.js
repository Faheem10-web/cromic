import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds to prevent timeout during Render cold start
  headers: {
    "Content-Type": "application/json",
  },
});

// In-memory cache for GET requests
const responseCache = new Map();
const pendingRequests = new Map();
// Disable cache TTL in development to prevent stale caches, but retain it in production
const CACHE_TTL = import.meta.env.DEV ? 0 : 15000;

export function clearApiCache() {
  responseCache.clear();
  pendingRequests.clear();
}

// Intercept requests at the raw request level to enable promise deduplication and caching
const originalRequest = API.request.bind(API);

API.request = function (config) {
  const method = (config.method || "get").toLowerCase();
  
  if (method === "get") {
    const url = config.url || "";
    const params = config.params ? JSON.stringify(config.params) : "";
    const key = `${config.baseURL || ""}/${url}?${params}`;

    const forceSkip = config.skipCache || config.headers?.["Cache-Control"] === "no-cache";

    // 1. Check if we have a valid cache entry (if skipCache is false)
    if (!forceSkip) {
      const cachedEntry = responseCache.get(key);
      if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
        return Promise.resolve(cachedEntry.response);
      }

      // 2. Check if there's already an active identical request
      if (pendingRequests.has(key)) {
        return pendingRequests.get(key);
      }
    }

    // 3. Make request and store the promise to deduplicate other concurrent calls
    const promise = originalRequest(config)
      .then((response) => {
        pendingRequests.delete(key);
        responseCache.set(key, {
          response: {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          },
          timestamp: Date.now(),
        });
        return response;
      })
      .catch((error) => {
        pendingRequests.delete(key);
        throw error;
      });

    if (!forceSkip) {
      pendingRequests.set(key, promise);
    }
    return promise;
  } else {
    // For non-GET requests (mutations like POST, PUT, DELETE),
    // clear the cache to ensure the user gets fresh data
    clearApiCache();
    return originalRequest(config);
  }
};

// Request interceptor to add JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authorization errors globally and retry on transient errors
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // 1. Handle 401 Authorization Error
    if (response && response.status === 401) {
      console.warn("Unauthorized access - clearing token");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      
      // Only redirect if they are trying to access admin dashboard
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // 2. Handle retries on transient errors (like network/cold-start issues, 502, 503, 504)
    // Don't retry if request was explicitly aborted
    if (axios.isCancel(error) || error.name === "CanceledError" || error.name === "AbortError") {
      return Promise.reject(error);
    }

    // Only retry GET requests to prevent duplicating stateful mutations (POST, PUT, DELETE)
    const method = config && config.method ? config.method.toLowerCase() : "get";
    if (config && method === "get") {
      const isTransient = !response || (response.status >= 502 && response.status <= 504);
      
      if (isTransient) {
        config.__retryCount = config.__retryCount || 0;
        const maxRetries = 5;
        
        if (config.__retryCount < maxRetries) {
          config.__retryCount += 1;
          
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s with random jitter to prevent thundering herd
          const backoffDelay = Math.pow(2, config.__retryCount - 1) * 1000 + Math.random() * 500;
          console.warn(`[Axios Retry] Retrying request ${config.url} (${config.__retryCount}/${maxRetries}) in ${Math.round(backoffDelay)}ms due to transient error...`);
          
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          
          // Re-issue request through API.request to preserve cache and interceptors
          return API(config);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;
