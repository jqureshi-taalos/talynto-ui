import streamChatService from './streamChatService';

class MessageNotificationService {
  constructor() {
    this.listeners = [];
    this.unreadCount = 0;
    this.isListening = false;
    this.eventHandlers = new Map();
  }

  /**
   * Start listening for message events and unread count changes
   */
  async startListening() {
    if (this.isListening) return;

    try {
      const client = await streamChatService.initialize();
      
      // Double check client is properly initialized
      if (!client) {
        console.warn('StreamChat client not properly initialized, skipping message notification service');
        return;
      }

      this.isListening = true;

      // Initial unread count
      await this.updateUnreadCount();

      // Listen for new messages
      const newMessageHandler = (event) => {
        if (event.user?.id !== client.user?.id) {
          this.updateUnreadCount();
          this.notifyListeners('newMessage', event);
        }
      };

      // Listen for message read events
      const messageReadHandler = (event) => {
        this.updateUnreadCount();
        this.notifyListeners('messageRead', event);
      };

      // Listen for channel updates
      const channelUpdateHandler = (event) => {
        this.updateUnreadCount();
        this.notifyListeners('channelUpdate', event);
      };

      // Store handlers for cleanup
      this.eventHandlers.set('message.new', newMessageHandler);
      this.eventHandlers.set('message.read', messageReadHandler);
      this.eventHandlers.set('channel.updated', channelUpdateHandler);

      // Add event listeners
      client.on('message.new', newMessageHandler);
      client.on('message.read', messageReadHandler);
      client.on('channel.updated', channelUpdateHandler);

      console.log('Message notification service started');
    } catch (error) {
      console.error('Error starting message notification service:', error);
      this.isListening = false;
      // Set unread count to 0 if we can't start listening
      if (this.unreadCount !== 0) {
        this.unreadCount = 0;
        this.notifyListeners('unreadCountChanged', { count: 0 });
      }
    }
  }

  /**
   * Stop listening for message events
   */
  async stopListening() {
    if (!this.isListening) return;

    try {
      const client = streamChatService.client;
      if (client) {
        // Remove all event listeners
        this.eventHandlers.forEach((handler, eventType) => {
          client.off(eventType, handler);
        });
        this.eventHandlers.clear();
      }

      this.isListening = false;
      this.unreadCount = 0;
      console.log('Message notification service stopped');
    } catch (error) {
      console.error('Error stopping message notification service:', error);
    }
  }

  /**
   * Update total unread count across all channels
   */
  async updateUnreadCount() {
    try {
      const channels = await streamChatService.getChannels();
      const totalUnread = channels.reduce((sum, channel) => sum + (channel.unread || 0), 0);

      console.log('channels ====>', channels)
      console.log('totalUnread ======>', totalUnread)
      
      if (this.unreadCount !== totalUnread) {
        this.unreadCount = totalUnread;
        this.notifyListeners('unreadCountChanged', { count: totalUnread });
      }
    } catch (error) {
      console.error('Error updating unread count:', error);
      // Set unread count to 0 if we can't fetch channels
      if (this.unreadCount !== 0) {
        this.unreadCount = 0;
        this.notifyListeners('unreadCountChanged', { count: 0 });
      }
    }
  }

  /**
   * Get current unread count
   */
  getUnreadCount() {
    return this.unreadCount;
  }

  /**
   * Add listener for message events
   */
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners about events
   */
  notifyListeners(eventType, data) {
    this.listeners.forEach(listener => {
      try {
        listener(eventType, data);
      } catch (error) {
        console.error('Error in message notification listener:', error);
      }
    });
  }

  /**
   * Mark messages as read in a specific channel
   */
  async markChannelAsRead(channelId) {
    try {
      const client = streamChatService.client;
      if (client) {
        const channel = client.channel('messaging', channelId);
        await channel.markRead();
        await this.updateUnreadCount();
      }
    } catch (error) {
      console.error('Error marking channel as read:', error);
    }
  }

  /**
   * Force refresh of unread counts
   */
  async refreshUnreadCount() {
    await this.updateUnreadCount();
  }
}

export default new MessageNotificationService();