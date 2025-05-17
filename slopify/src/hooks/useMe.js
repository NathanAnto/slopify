// file: src/account/useMe.jsx
import { useState, useEffect, useCallback } from 'react';

const apiUrl = import.meta.env.VITE_SERVER_URL;

const apiClient = {
  get: async (url) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    if (response.status === 401 || response.status === 403) {
      // Unauthorized or forbidden, likely no valid session
      return null;
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // The /me route is expected to return { user: userData }
    const data = await response.json();
    return data.user;
  },
  post: async (url) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    if (!response.ok) {
      // For logout, we might not care too much about the response body
      // as long as it's not an error that prevents logout.
      // A 200 status is enough.
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
    return response; // Or response.json() if the logout returns data
  },
};

export const useMe = () => {
  const [me, setMe] = useState(null); // Store user object or null
  const [isLoading, setIsLoading] = useState(true); // To track initial loading state

  const fetchMe = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await apiClient.get(`${apiUrl}/me`);
      setMe(user);
    } catch (error) {
      console.warn('Failed to fetch user or no user session:', error);
      setMe(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe(); // Fetch user on initial hook mount
  }, [fetchMe]);

  const logout = useCallback(async () => {
    try {
      // Assuming your backend is served on the same domain or configured for CORS
      await apiClient.post(`${apiUrl}/logout`);
      setMe(null); // Clear user state locally
      // The context provider will propagate this change
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally handle logout error (e.g., show a notification)
    }
  }, []);

  // This function is exposed as refetchMe
  const refetchMe = useCallback(() => {
    fetchMe();
  }, [fetchMe]);

  return { me, isLoading, logout, refetchMe };
};