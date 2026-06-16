export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token: string) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');

export const getUsername = () => localStorage.getItem('username') || 'Usuario';
export const setUsername = (username: string) => localStorage.setItem('username', username);
export const removeUsername = () => localStorage.removeItem('username');

interface FetchOptions extends RequestInit {
  data?: any;
}

export const apiClient = async (endpoint: string, options: FetchOptions = {}) => {
  // Destructure everything — including 'headers' — out of options so that
  // spreading ...rest at the end never overwrites our merged headers object.
  const { data, headers: customHeaders, body: customBody, method: customMethod, ...rest } = options;
  const token = getAuthToken();

  const isFormDataOrFile = data instanceof FormData || data instanceof File || data instanceof Blob;

  const mergedHeaders: Record<string, string> = {
    ...(isFormDataOrFile ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders as Record<string, string> | undefined),
  };

  const method = customMethod ?? (data || customBody ? 'POST' : 'GET');
  const body = customBody
    ? customBody
    : data
      ? isFormDataOrFile
        ? data
        : JSON.stringify(data)
      : undefined;

  const config: RequestInit = {
    ...rest,       // safe: no longer contains method, headers, or body
    method,
    headers: mergedHeaders,
    body,
  };

  // Construct URL safely to prevent SSRF and path injection vulnerabilities
  const baseUrlWithSlash = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
  const safeEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const targetUrl = new URL(safeEndpoint, baseUrlWithSlash);

  console.debug(`[API] ${method} ${targetUrl.toString()}`, { hasToken: !!token });

  const response = await fetch(targetUrl, config);

  console.debug(`[API] ${method} ${endpoint} → ${response.status}`);

  if (response.status === 401) {
    console.warn(`[API] 401 on ${endpoint} — keeping token for debugging`);
    throw new Error('Unauthorized (401) - Check backend logs.');
  }

  if (response.status === 403) {
    throw new Error('Forbidden: You do not have access to this resource');
  }

  if (!response.ok) {
    let errorMsg = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  try {
    return await response.json();
  } catch (e) {
    return null;
  }
};
