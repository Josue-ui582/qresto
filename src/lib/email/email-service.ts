export interface ContactEmail {
  name: string;
  contact: string;
  message: string;
}

export type EmailDeliveryStatus = 'sent' | 'not_configured';

export interface EmailService {
  sendContactMessage(email: ContactEmail): Promise<EmailDeliveryStatus>;
}

class UnconfiguredEmailService implements EmailService {
  async sendContactMessage(_email: ContactEmail): Promise<EmailDeliveryStatus> {
    return 'not_configured';
  }
}

export const emailService: EmailService = new UnconfiguredEmailService();
