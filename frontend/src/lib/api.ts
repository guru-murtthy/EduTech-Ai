const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = `Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errMsg = errorData.message || errMsg;
    } catch {
      // ignore JSON parse fail on plain text error
    }
    throw new Error(errMsg);
  }

  // Handle empty responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const auth = {
  login: (credentials: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};

export const student = {
  getProfile: () => apiRequest('/students/profile'),
  saveProfile: (data: any) => apiRequest('/students/profile', { method: 'POST', body: JSON.stringify(data) }),
  getAnalytics: () => apiRequest('/analytics/student'),
};

export const roadmap = {
  getRoadmap: () => apiRequest('/roadmaps'),
};

export const recommendations = {
  get: () => apiRequest('/recommendations'),
};

export const quiz = {
  generate: (topic: string) => apiRequest('/quiz/generate', { method: 'POST', body: JSON.stringify({ topic }) }),
  submit: (data: any) => apiRequest('/quiz/submit', { method: 'POST', body: JSON.stringify(data) }),
  getAttempts: () => apiRequest('/quiz/attempts'),
};

export const career = {
  get: () => apiRequest('/career'),
};

export const chat = {
  getHistory: () => apiRequest('/chat/history'),
  sendMessage: (prompt: string) => apiRequest('/chat', { method: 'POST', body: JSON.stringify({ prompt }) }),
  clearHistory: () => apiRequest('/chat/history', { method: 'DELETE' }),
};

export const admin = {
  getAnalytics: () => apiRequest('/analytics/admin'),
};
