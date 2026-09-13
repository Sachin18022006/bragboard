let detectedUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL;

if (!detectedUrl && typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
  detectedUrl = 'https://bragboard-backend.onrender.com';
}

let rawUrl = (detectedUrl || 'http://127.0.0.1:8000').replace(/\/api\/?$/, '');

if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = `https://${rawUrl}`;
}

export const API_BASE_URL = rawUrl;
