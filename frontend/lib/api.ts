/**
 * LifeOS API Client Helper
 * Configured for split deployment (Next.js on Vercel, Django REST Framework on Render)
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Returns the resolved API endpoint URL based on environment.
 * If NEXT_PUBLIC_API_URL is set (e.g. https://lifeos-backend.onrender.com), it targets Render.
 * Otherwise, it defaults to the local Next.js /api proxy or local Django server.
 */
export function getApiUrl(endpoint: string): string {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  if (typeof window === 'undefined') {
    // Server-side execution
    const serverBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    return `${serverBase}${path}`;
  }

  // Client-side execution in the browser
  if (process.env.NEXT_PUBLIC_API_URL) {
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  }

  return path;
}
