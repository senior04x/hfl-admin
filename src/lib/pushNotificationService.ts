// Push Notification Service for HFL Admin Panel
// Integrates with backend push notification API

interface PushNotificationResponse {
  success: boolean;
  message: string;
  details?: any;
}

interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  target: 'all' | string[];
}

class PushNotificationService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  }

  // Send push notification using backend API
  async sendNotification(notificationData: NotificationData): Promise<PushNotificationResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/notifications/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Push notification send error:', error);
      return {
        success: false,
        message: error.message || 'Push notification yuborishda xatolik',
      };
    }
  }

  // Send match notification
  async sendMatchNotification(matchInfo: {
    homeTeam: string;
    awayTeam: string;
    date: string;
    venue: string;
    target?: 'all' | string[];
  }): Promise<PushNotificationResponse> {
    const notificationData: NotificationData = {
      title: 'HFL Yangi O\'yin',
      body: `${matchInfo.homeTeam} vs ${matchInfo.awayTeam} o'yini ${matchInfo.date} sanasida ${matchInfo.venue}da bo'lib o'tadi. O'yinni qo'ldan boy bermang!`,
      data: {
        type: 'match_notification',
        matchInfo,
      },
      target: matchInfo.target || 'all',
    };

    return this.sendNotification(notificationData);
  }

  // Send application status notification
  async sendApplicationStatusNotification(
    phoneNumber: string,
    status: 'approved' | 'rejected',
    type: 'player' | 'team',
    recipientName: string
  ): Promise<PushNotificationResponse> {
    const title = status === 'approved' ? 'Ariza Tasdiqlandi' : 'Ariza Rad Etildi';
    const body = status === 'approved'
      ? `Tabriklaymiz, ${recipientName}! Sizning HFL ligasiga ${type === 'player' ? 'o\'yinchi' : 'jamoa'} arizangiz tasdiqlandi.`
      : `Hurmatli ${recipientName}, afsuski, sizning HFL ligasiga ${type === 'player' ? 'o\'yinchi' : 'jamoa'} arizangiz rad etildi.`;

    const notificationData: NotificationData = {
      title,
      body,
      data: {
        type: 'application_status',
        status,
        applicationType: type,
        recipientName,
        phoneNumber,
      },
      target: [phoneNumber],
    };

    return this.sendNotification(notificationData);
  }

  // Send transfer status notification
  async sendTransferStatusNotification(
    phoneNumber: string,
    status: 'approved' | 'rejected',
    transferInfo: {
      playerName: string;
      fromTeam: string;
      toTeam: string;
    }
  ): Promise<PushNotificationResponse> {
    const title = status === 'approved' ? 'Transfer Tasdiqlandi' : 'Transfer Rad Etildi';
    const body = status === 'approved'
      ? `Tabriklaymiz! ${transferInfo.playerName}ning ${transferInfo.fromTeam}dan ${transferInfo.toTeam}ga transferi tasdiqlandi.`
      : `Hurmatli ${transferInfo.playerName}, afsuski, ${transferInfo.fromTeam}dan ${transferInfo.toTeam}ga transferingiz rad etildi.`;

    const notificationData: NotificationData = {
      title,
      body,
      data: {
        type: 'transfer_status',
        status,
        transferInfo,
        phoneNumber,
      },
      target: [phoneNumber],
    };

    return this.sendNotification(notificationData);
  }

  // Send custom announcement
  async sendCustomAnnouncement(
    title: string,
    body: string,
    target: 'all' | string[] = 'all',
    data?: Record<string, any>
  ): Promise<PushNotificationResponse> {
    const notificationData: NotificationData = {
      title,
      body,
      data: {
        type: 'custom_announcement',
        ...data,
      },
      target,
    };

    return this.sendNotification(notificationData);
  }

  // Send score update notification
  async sendScoreUpdateNotification(
    matchInfo: {
      homeTeam: string;
      awayTeam: string;
      homeScore: number;
      awayScore: number;
      status: 'live' | 'finished';
    },
    target: 'all' | string[] = 'all'
  ): Promise<PushNotificationResponse> {
    const title = matchInfo.status === 'finished' ? 'O\'yin Tugadi' : 'Hisob Yangilandi';
    const body = matchInfo.status === 'finished'
      ? `${matchInfo.homeTeam} ${matchInfo.homeScore} - ${matchInfo.awayScore} ${matchInfo.awayTeam} (Tugadi)`
      : `${matchInfo.homeTeam} ${matchInfo.homeScore} - ${matchInfo.awayScore} ${matchInfo.awayTeam} (Davom etmoqda)`;

    const notificationData: NotificationData = {
      title,
      body,
      data: {
        type: 'score_update',
        matchInfo,
      },
      target,
    };

    return this.sendNotification(notificationData);
  }

  // Send league announcement
  async sendLeagueAnnouncement(
    title: string,
    message: string,
    target: 'all' | string[] = 'all'
  ): Promise<PushNotificationResponse> {
    const notificationData: NotificationData = {
      title: `HFL: ${title}`,
      body: message,
      data: {
        type: 'league_announcement',
        title,
        message,
      },
      target,
    };

    return this.sendNotification(notificationData);
  }

  // Get notification statistics
  async getNotificationStats(): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    lastSent: string;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/notifications/stats`);
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        lastSent: '',
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        lastSent: '',
      };
    }
  }

  // Get device tokens for user
  async getUserDeviceTokens(userId: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/notifications/tokens/${userId}`);
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user device tokens:', error);
      return [];
    }
  }

  // Send notification to specific user
  async sendNotificationToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<PushNotificationResponse> {
    const notificationData: NotificationData = {
      title,
      body,
      data: {
        type: 'user_notification',
        userId,
        ...data,
      },
      target: [userId],
    };

    return this.sendNotification(notificationData);
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
export default PushNotificationService;
