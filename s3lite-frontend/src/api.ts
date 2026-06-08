export const BASE_URL = 'http://localhost:8080/api';

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
  const { data, headers: customHeaders, body: customBody, ...customConfig } = options;
  const token = getAuthToken();

  const isFormDataOrFile = data instanceof FormData || data instanceof File || data instanceof Blob;

  const headers: any = {
    ...(isFormDataOrFile ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders as any),
  };

  const config: RequestInit = {
    method: data || customBody ? (options.method || 'POST') : (options.method || 'GET'),
    body: customBody ? customBody : (data ? (isFormDataOrFile ? data : JSON.stringify(data)) : undefined),
    headers,
    ...customConfig,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    removeAuthToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (response.status === 403) {
    throw new Error('Forbidden: You do not have access to this resource');
  }

  if (!response.ok) {
    let errorMsg = 'An error occurred';
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
