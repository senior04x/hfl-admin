// SMS Service for HFL Admin Panel
// Integrates with backend SMS API

interface SmsResponse {
  success: boolean;
  message: string;
  details?: any;
}

interface SmsTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  type: 'application_approval' | 'application_rejection' | 'match_notification' | 'transfer_approval' | 'transfer_rejection' | 'custom';
}

class SmsService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  }

  // Send SMS using backend API
  async sendSMS(to: string, message: string): Promise<SmsResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          message,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('SMS send error:', error);
      return {
        success: false,
        message: error.message || 'SMS yuborishda xatolik',
      };
    }
  }

  // Send application approval SMS
  async sendApplicationApprovalSMS(
    phoneNumber: string,
    recipientName: string,
    type: 'player' | 'team'
  ): Promise<SmsResponse> {
    const message = type === 'player'
      ? `Tabriklaymiz, ${recipientName}! Sizning HFL ligasiga o'yinchi arizangiz tasdiqlandi. Ilovaga kirib, o'z kabinetingizni ko'rishingiz mumkin.`
      : `Tabriklaymiz, ${recipientName} jamoasi! Sizning HFL ligasiga arizangiz tasdiqlandi. Ilovaga kirib, jamoa kabinetingizni boshqarishingiz mumkin.`;

    return this.sendSMS(phoneNumber, message);
  }

  // Send application rejection SMS
  async sendApplicationRejectionSMS(
    phoneNumber: string,
    recipientName: string,
    type: 'player' | 'team'
  ): Promise<SmsResponse> {
    const message = type === 'player'
      ? `Hurmatli ${recipientName}, afsuski, sizning HFL ligasiga o'yinchi arizangiz rad etildi. Qo'shimcha ma'lumot olish uchun admin bilan bog'laning.`
      : `Hurmatli ${recipientName} jamoasi, afsuski, sizning HFL ligasiga arizangiz rad etildi. Qo'shimcha ma'lumot olish uchun admin bilan bog'laning.`;

    return this.sendSMS(phoneNumber, message);
  }

  // Send match notification SMS
  async sendMatchNotificationSMS(
    phoneNumber: string,
    matchInfo: {
      homeTeam: string;
      awayTeam: string;
      date: string;
      venue: string;
    }
  ): Promise<SmsResponse> {
    const message = `HFL: ${matchInfo.homeTeam} vs ${matchInfo.awayTeam} o'yini ${matchInfo.date} sanasida ${matchInfo.venue}da bo'lib o'tadi. O'yinni qo'ldan boy bermang!`;

    return this.sendSMS(phoneNumber, message);
  }

  // Send transfer approval SMS
  async sendTransferApprovalSMS(
    phoneNumber: string,
    transferInfo: {
      playerName: string;
      fromTeam: string;
      toTeam: string;
    }
  ): Promise<SmsResponse> {
    const message = `Tabriklaymiz! ${transferInfo.playerName}ning ${transferInfo.fromTeam}dan ${transferInfo.toTeam}ga transferi tasdiqlandi.`;

    return this.sendSMS(phoneNumber, message);
  }

  // Send transfer rejection SMS
  async sendTransferRejectionSMS(
    phoneNumber: string,
    transferInfo: {
      playerName: string;
      fromTeam: string;
      toTeam: string;
    }
  ): Promise<SmsResponse> {
    const message = `Hurmatli ${transferInfo.playerName}, afsuski, ${transferInfo.fromTeam}dan ${transferInfo.toTeam}ga transferingiz rad etildi. Qo'shimcha ma'lumot olish uchun admin bilan bog'laning.`;

    return this.sendSMS(phoneNumber, message);
  }

  // Send custom SMS
  async sendCustomSMS(
    phoneNumber: string,
    customMessage: string
  ): Promise<SmsResponse> {
    return this.sendSMS(phoneNumber, customMessage);
  }

  // Send bulk SMS
  async sendBulkSMS(
    phoneNumbers: string[],
    message: string
  ): Promise<SmsResponse[]> {
    const results: SmsResponse[] = [];
    
    for (const phoneNumber of phoneNumbers) {
      const result = await this.sendSMS(phoneNumber, message);
      results.push(result);
      
      // Add delay between SMS to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  // Get SMS templates
  async getSmsTemplates(): Promise<SmsTemplate[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/sms/templates`);
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching SMS templates:', error);
      return [];
    }
  }

  // Create SMS template
  async createSmsTemplate(template: Omit<SmsTemplate, 'id'>): Promise<SmsResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/sms/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Error creating SMS template:', error);
      return {
        success: false,
        message: error.message || 'SMS template yaratishda xatolik',
      };
    }
  }

  // Update SMS template
  async updateSmsTemplate(id: string, template: Partial<SmsTemplate>): Promise<SmsResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/sms/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Error updating SMS template:', error);
      return {
        success: false,
        message: error.message || 'SMS template yangilashda xatolik',
      };
    }
  }

  // Delete SMS template
  async deleteSmsTemplate(id: string): Promise<SmsResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/sms/templates/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Error deleting SMS template:', error);
      return {
        success: false,
        message: error.message || 'SMS template o\'chirishda xatolik',
      };
    }
  }

  // Get SMS queue status
  async getSmsQueueStatus(): Promise<{
    pending: number;
    sent: number;
    failed: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/sms/queue/status`);
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return { pending: 0, sent: 0, failed: 0 };
    } catch (error) {
      console.error('Error fetching SMS queue status:', error);
      return { pending: 0, sent: 0, failed: 0 };
    }
  }
}

// Export singleton instance
export const smsService = new SmsService();
export default SmsService;
