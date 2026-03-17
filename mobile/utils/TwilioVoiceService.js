import { voice } from '@twilio/voice-react-native-sdk';
import instance from './axios';

class TwilioVoiceService {
  constructor() {
    this.activeCall = null;
  }

  async fetchToken() {
    try {
      const response = await instance.post('/calls/generate-access-token');
      return response.data.token;
    } catch (error) {
      console.error('Error fetching Twilio token:', error);
      throw error;
    }
  }

  async makeCall(targetPhone, onStatusChange) {
    try {
      const token = await this.fetchToken();
      
      // Ensure number is in E.164 format for the backend webhook
      let formattedNumber = targetPhone;
      if (!formattedNumber.startsWith('+')) {
        formattedNumber = '+' + formattedNumber;
      }

      this.activeCall = await voice.connect(token, {
        params: {
          target: formattedNumber,
        },
      });

      // Set up listeners
      this.activeCall.on('connected', () => {
        if (onStatusChange) onStatusChange('Connected');
      });

      this.activeCall.on('reconnecting', (error) => {
        if (onStatusChange) onStatusChange('Reconnecting...');
        console.warn('Reconnecting:', error);
      });

      this.activeCall.on('reconnected', () => {
        if (onStatusChange) onStatusChange('Connected');
      });

      this.activeCall.on('disconnected', (error) => {
        if (onStatusChange) onStatusChange('Disconnected');
        if (error) console.error('Call Disconnected Error:', error);
        this.activeCall = null;
      });

      return this.activeCall;
    } catch (error) {
      console.error('Make Call Error:', error);
      throw error;
    }
  }

  hangup() {
    if (this.activeCall) {
      this.activeCall.disconnect();
      this.activeCall = null;
    }
  }
}

export default new TwilioVoiceService();
