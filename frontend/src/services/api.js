const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function getHealth(signal) {
  const response = await fetch(`${API_URL}/api/health`, { signal });
  if (!response.ok) {
    throw new Error('API health check failed');
  }
  return response.json();
}
