class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: { nic: string; password: string }) {
    return this.request<{
      userId: string;
      userType: string;
      fullName: string;
      message: string;
      token: string;
    }>('/voter-registration/api/v1/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Protected endpoints
  async createElection(electionData: any) {
    return this.request('/election/api/v1/elections/create', {
      method: 'POST',
      body: JSON.stringify(electionData),
    });
  }

  async deleteElection(electionId: string) {
    return this.request(`/election/api/v1/elections/${electionId}/delete`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new APIClient('http://localhost:8080');
