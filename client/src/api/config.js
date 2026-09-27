// Determine the API base URL with full environment and runtime support
let detectedUrl =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE;

// When running in a production browser environment (e.g. Vercel, Render) and no env var was provided at build time
if (!detectedUrl && typeof window !== 'undefined') {
  const host = window.location.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1' && host !== '0.0.0.0') {
    detectedUrl = 'https://bragboard-79qp.onrender.com';
  }
}

// Clean up trailing slashes, /api, or /docs suffixes
let rawUrl = (detectedUrl || 'http://127.0.0.1:8000')
  .trim()
  .replace(/\/api\/?$/, '')
  .replace(/\/docs\/?$/, '')
  .replace(/\/+$/, '');

// Ensure proper protocol
if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = `https://${rawUrl}`;
}

export const API_BASE_URL = rawUrl;
