import { jwtDecode } from 'jwt-decode';

// Base URL logic: try to be smart about the /api prefix
const ENV_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';
const ROOT_URL = ENV_BASE.replace(/\/api$/, '');
const API_URL = ROOT_URL + '/api';

export const getEffectiveAdminId = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded.user_id) return Number(decoded.user_id);
    } catch (e) {
      console.error("Error decoding token for admin id:", e);
    }
  }
  const storedId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
  if (storedId) return Number(storedId);
  return Number(process.env.REACT_APP_ADMIN_ID) || 1;
};

export const DEFAULT_ADMIN_ID = getEffectiveAdminId();

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const extractError = async (response) => {
  try {
    const data = await response.json();
    if (data?.detail) {
      return Array.isArray(data.detail)
        ? data.detail.map((item) => item.msg || item).join(', ')
        : data.detail;
    }
  } catch {
    /* ignore json parse issues */
  }
  return response.statusText || 'Request failed';
};

export async function fetchShoutoutReports({ adminId, status } = {}) {
  const effectiveId = adminId || getEffectiveAdminId();
  const search = new URLSearchParams({ admin_id: effectiveId });
  if (status) {
    search.append('status', status);
  }

  const response = await fetch(`${API_URL}/shoutout-reports?${search.toString()}`, {
    headers: { ...getAuthHeaders() }
  });
  if (!response.ok) {
    throw new Error(await extractError(response));
  }

  return response.json();
}

export async function resolveShoutoutReport(
  reportId,
  { adminId, status, resolutionNotes }
) {
  const effectiveId = adminId || getEffectiveAdminId();
  const search = new URLSearchParams({ admin_id: effectiveId });
  const payload = {
    status: status?.toLowerCase(),
    resolution_notes: resolutionNotes || '',
  };

  const response = await fetch(
    `${API_URL}/shoutout-reports/${reportId}/resolve?${search.toString()}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(await extractError(response));
  }

  return response.json();
}

export async function deleteShoutout(shoutoutId) {
  const url = `${ROOT_URL}/shoutouts/${shoutoutId}`;
  console.log(`Attempting to delete shoutout at: ${url}`);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(await extractError(response));
  }

  return true;
}

export async function exportReports(format = 'csv', adminId) {
  const effectiveId = adminId || getEffectiveAdminId();
  const search = new URLSearchParams({ admin_id: effectiveId });
  const response = await fetch(`${API_URL}/shoutout-reports/export/${format}?${search.toString()}`, {
    headers: { ...getAuthHeaders() }
  });

  if (!response.ok) {
    throw new Error(await extractError(response));
  }

  return response.blob();
}

