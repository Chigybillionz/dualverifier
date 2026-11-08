/**
 * api.ts
 * Resolves the full URL for backend API requests.
 * In development, uses Vite proxy with relative paths like '/api/...'.
 * In production, if VITE_API_URL is configured (e.g. Render / Railway / fly.io),
 * prepends the base URL; otherwise falls back to relative paths.
 */

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function apiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!API_BASE) {
    return cleanEndpoint;
  }
  return `${API_BASE}${cleanEndpoint}`;
}
