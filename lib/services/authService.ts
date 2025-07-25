// src/services/authService.ts

// API base URL
const API_BASE_URL = "http://localhost:8080";

// Type definitions
export interface Voter {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  password: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  dateOfBirth: string;
}

export interface VoterLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  userId: string;
  firstName: string;
  lastName: string;
}

// Register a new voter
export const registerVoter = async (voterData: Voter): Promise<Voter> => {
  try {
    const response = await fetch(`${API_BASE_URL}/voter-registration/api/v1/voters/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voterData),
    });

    if (!response.ok) {
      // Parse error message if available
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Registration failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error instanceof Error 
      ? error 
      : new Error('An unknown error occurred during registration');
  }
};

// Login a voter
export const loginVoter = async (credentials: VoterLogin): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/voter-registration/api/v1/voters/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      // Parse error message if available
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Login failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error instanceof Error 
      ? error 
      : new Error('An unknown error occurred during login');
  }
};

// Store authentication token in local storage
export const storeAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Get authentication token from local storage
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null; // SSR check
  return localStorage.getItem('token');
};

// Remove authentication token from local storage (logout)
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
  localStorage.removeItem('userId');
  localStorage.removeItem('fullName');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Temporary test user for development
export const getTestToken = (): string => {
  return 'YOUR_ACCESS_TOKEN';
};

// Get authentication headers for API requests
export const getAuthHeaders = (): Record<string, string> => {
  // const token = process.env.NODE_ENV === 'development' 
  //   ? getTestToken() 
  //   : getAuthToken();

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};
