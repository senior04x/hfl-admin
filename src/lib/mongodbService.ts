// MongoDB Service for HFL Admin Panel
// Connects to the same MongoDB API as mobile app

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class MongoDBService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  }

  // Generic API call method
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error(`API call failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error.message || 'API call failed',
      };
    }
  }

  // Teams
  async getTeams(): Promise<ApiResponse<any[]>> {
    return this.apiCall<any[]>('/api/teams');
  }

  async createTeam(teamData: any): Promise<ApiResponse<any>> {
    return this.apiCall<any>('/api/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async updateTeam(id: string, teamData: any): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/api/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    });
  }

  async deleteTeam(id: string): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/api/teams/${id}`, {
      method: 'DELETE',
    });
  }

  // Matches
  async getMatches(): Promise<ApiResponse<any[]>> {
    return this.apiCall<any[]>('/api/matches');
  }

  async createMatch(matchData: any): Promise<ApiResponse<any>> {
    return this.apiCall<any>('/api/matches', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
  }

  async updateMatch(id: string, matchData: any): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/api/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(matchData),
    });
  }

  async deleteMatch(id: string): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/api/matches/${id}`, {
      method: 'DELETE',
    });
  }

  // Players
  async getPlayers(): Promise<ApiResponse<any[]>> {
    return this.apiCall<any[]>('/api/players');
  }

  async createPlayer(playerData: any): Promise<ApiResponse<any>> {
    return this.apiCall<any>('/api/players', {
      method: 'POST',
      body: JSON.stringify(playerData),
    });
  }

  async updatePlayer(id: string, playerData: any): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/api/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(playerData),
    });
  }

  async deletePlayer(id: string): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/api/players/${id}`, {
      method: 'DELETE',
    });
  }

  // Applications
  async getApplications(): Promise<ApiResponse<any[]>> {
    return this.apiCall<any[]>('/api/applications');
  }

  async updateApplication(id: string, status: string, adminNotes?: string): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  // Standings
  async getStandings(): Promise<ApiResponse<any[]>> {
    return this.apiCall<any[]>('/api/standings');
  }

  // Transfers
  async getTransfers(): Promise<ApiResponse<any[]>> {
    return this.apiCall<any[]>('/api/transfers');
  }

  async updateTransferStatus(id: string, status: string, adminNotes?: string): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/api/transfers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  // Notifications
  async sendNotification(notificationData: {
    title: string;
    body: string;
    target: 'all' | string[];
  }): Promise<ApiResponse<any>> {
    return this.apiCall<any>('/api/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  // SMS
  async sendSMS(smsData: {
    to: string;
    message: string;
  }): Promise<ApiResponse<any>> {
    return this.apiCall<any>('/api/sms/send', {
      method: 'POST',
      body: JSON.stringify(smsData),
    });
  }
}

// Export singleton instance
export const mongodbService = new MongoDBService();
export default MongoDBService;
