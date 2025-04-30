import { useState, useEffect } from 'react';

function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const apiUrl = import.meta.env.VITE_SERVER_URL;
        if (!apiUrl) {
          setError(new Error('VITE_SERVER_URL is not defined in your environment.'));
          setLoading(false);
          return; // Important: Exit the function if the URL is not defined
        }
        const response = await fetch(`${apiUrl}/events`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
        setLoading(false);
      } catch (e) {
        setError(e);
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return { events, loading, error };
}

export default useEvents;