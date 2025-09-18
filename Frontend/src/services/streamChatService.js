import { StreamChat } from 'stream-chat';
import authService from './authService';

class StreamChatService {
  constructor() {
    this.client = null;
    this.user = null;
    this.isInitialized = false;
    this.channelIdCache = new Map(); // key: pair key -> channelId
    this.channelCache = new Map(); // key: channelId -> channel instance
    this.watchedChannels = new Set(); // channelIds already watched
  }

  async initialize() {
    if (this.isInitialized && this.client && this.user) {
      console.log('StreamChat already initialized');
      return this.client;
    }

    try {
      console.log('Initializing StreamChat...');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      const token = authService.getToken();
      
      console.log('Auth token exists:', !!token);
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get StreamChat token from backend
      console.log('Fetching StreamChat token from:', `${API_BASE_URL}/chat/token`);
      const response = await fetch(`${API_BASE_URL}/chat/token`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('StreamChat token response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get chat token:', errorText);
        throw new Error(`Failed to get chat token: ${response.status} ${errorText}`);
      }

      const { token: chatToken, userId, apiKey } = await response.json();
      console.log('StreamChat credentials received:', { userId, apiKey: !!apiKey, chatToken: !!chatToken });
      
      // Initialize StreamChat client
      this.client = StreamChat.getInstance(apiKey);
      console.log('StreamChat client created');
      
      // Connect user
      console.log('Connecting user to StreamChat...');
      this.user = await this.client.connectUser(
        { id: userId },
        chatToken
      );
      console.log('User connected to StreamChat. Full user object:', this.user);
      console.log('User structure:', {
        hasUser: !!this.user.user,
        userId: this.user.user?.id,
        userKeys: this.user.user ? Object.keys(this.user.user) : 'no user object',
        fullStructure: JSON.stringify(this.user, null, 2)
      });

      this.isInitialized = true;
      return this.client;
    } catch (error) {
      console.error('Error initializing StreamChat:', error);
      // Reset state on failure
      this.client = null;
      this.user = null;
      this.isInitialized = false;
      throw error;
    }
  }

  async getContacts() {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/chat/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get contacts');
      }

      const contacts = await response.json();
      
      return contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        avatar: contact.avatar,
        lastMessage: 'Start a conversation...',
        time: '',
        unread: 0,
        online: contact.online,
        role: contact.role
      }));
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  async refreshContacts() {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/chat/refresh-contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh contacts');
      }

      const data = await response.json();
      
      return data.contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        avatar: contact.avatar,
        lastMessage: 'Start a conversation...',
        time: '',
        unread: 0,
        online: contact.online,
        role: contact.role
      }));
    } catch (error) {
      console.error('Error refreshing contacts:', error);
      return [];
    }
  }

  async getChannels() {
    if (!this.client) {
      await this.initialize();
    }

    // Check if user is properly initialized
    const userId = this.user?.user?.id || this.user?.id || this.user?.me?.id;
    if (!this.client || !this.user || !userId) {
      console.warn('StreamChat not properly initialized, returning empty channels');
      return [];
    }

    try {
      const filter = { members: { $in: [userId] } };
      const sort = { last_message_at: -1 };
      const channels = await this.client.queryChannels(filter, sort, {
        watch: true,
        state: true,
        presence: true
      });

      return channels.map(channel => {
        const members = Object.values(channel.state.members).filter(
          member => member.user.id !== userId
        );
        const otherUser = members[0]?.user;
        const lastMessage = channel.state.messages[channel.state.messages.length - 1];

        return {
          id: channel.id,
          name: otherUser?.name || 'Unknown User',
          avatar: otherUser?.image || '/api/placeholder/40/40',
          lastMessage: lastMessage?.text || lastMessage?.type || 'No messages',
          time: lastMessage ? this.formatTime(new Date(lastMessage.created_at)) : '',
          unread: channel.countUnread(),
          online: Object.values(channel.state.members).some(
            member => member.user.id !== userId && member.user.online
          ),
          channel: channel
        };
      });
    } catch (error) {
      console.error('Error getting channels:', error);
      return [];
    }
  }

  async getMessages(channelId) {
    if (!this.client) {
      await this.initialize();
    }

    // Check if user is properly initialized
    const userId = this.user?.user?.id || this.user?.id || this.user?.me?.id;
    if (!this.client || !this.user || !userId) {
      console.warn('StreamChat not properly initialized, returning empty messages');
      return [];
    }

    try {
      let channel = this.channelCache.get(channelId);
      if (!channel) {
        channel = this.client.channel('messaging', channelId);
        this.channelCache.set(channelId, channel);
      }
      let state;
      if (!this.watchedChannels.has(channelId)) {
        state = await channel.watch();
        this.watchedChannels.add(channelId);
      } else {
        // Already watching; use existing state
        state = channel.state;
      }
      
      return state.messages.map(message => ({
        id: message.id,
        type: message.attachments?.length > 0 ? 'file' : 'text',
        content: message.text,
        fileName: message.attachments?.[0]?.title,
        fileSize: message.attachments?.[0]?.file_size ? `${(message.attachments[0].file_size / 1024 / 1024).toFixed(1)}MB` : '',
        fileUrl: message.attachments?.[0]?.asset_url || message.attachments?.[0]?.url,
        asset_url: message.attachments?.[0]?.asset_url || message.attachments?.[0]?.url,
        time: this.formatTime(new Date(message.created_at)),
        sent: message.user?.id === userId,
        user: message.user || { id: 'unknown', name: 'Unknown User' }
      }));
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async sendMessage(channelId, text, attachments = []) {
    if (!this.client || !this.isInitialized) {
      console.log('StreamChat not initialized, initializing now...');
      await this.initialize();
    }

    // Check if user is properly initialized - handle different user object structures
    const userId = this.user?.user?.id || this.user?.id || this.user?.me?.id;
    if (!this.client || !this.user || !userId) {
      console.error('StreamChat initialization failed:', {
        client: !!this.client,
        user: !!this.user,
        userUser: !!this.user?.user,
        userMe: !!this.user?.me,
        userIdDirect: this.user?.id,
        userUserId: this.user?.user?.id,
        userMeId: this.user?.me?.id,
        finalUserId: userId
      });
      throw new Error('StreamChat not properly initialized');
    }
    
    console.log('StreamChat initialized successfully, sending message to channel:', channelId);

    try {
      let channel = this.channelCache.get(channelId);
      if (!channel) {
        channel = this.client.channel('messaging', channelId);
        this.channelCache.set(channelId, channel);
      }
      if (!this.watchedChannels.has(channelId)) {
        await channel.watch();
        this.watchedChannels.add(channelId);
      }
      
      const message = {
        text: text,
        attachments: attachments
      };

      return await channel.sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async createChannel(clientId, contractorId, projectId = null) {
    try {
      // Build a deterministic cache key: clientId may be null when caller is client-side user
      const key = `${clientId ?? 'clientSelf'}:${contractorId ?? 'contractorSelf'}:${projectId ?? 'none'}`;
      const cached = this.channelIdCache.get(key);
      if (cached) {
        return cached;
      }
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      const token = authService.getToken();
      
      const response = await fetch(`${API_BASE_URL}/chat/channel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clientId, contractorId, projectId })
      });

      if (!response.ok) {
        throw new Error('Failed to create channel');
      }

      const { channelId } = await response.json();
      // Cache channelId for faster subsequent switches
      this.channelIdCache.set(key, channelId);
      return channelId;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  }

  // Prewarm a channel by participants: ensures channelId is cached and channel is watched
  async prewarmChannelByParticipants(clientId, contractorId, projectId = null) {
    try {
      const channelId = await this.createChannel(clientId, contractorId, projectId);
      // Ensure client initialized
      if (!this.client) {
        await this.initialize();
      }
      let channel = this.channelCache.get(channelId);
      if (!channel) {
        channel = this.client.channel('messaging', channelId);
        this.channelCache.set(channelId, channel);
      }
      if (!this.watchedChannels.has(channelId)) {
        await channel.watch();
        this.watchedChannels.add(channelId);
      }
      return channelId;
    } catch (error) {
      console.warn('Error prewarming channel:', error);
      return null;
    }
  }

  formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (diff < 24 * 60 * 60 * 1000) {
      // Today - show time
      return `Today ${time}`;
    } else if (diff < 48 * 60 * 60 * 1000) {
      // Yesterday
      return `Yesterday ${time}`;
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      // This week - show day and time
      const weekday = date.toLocaleDateString([], { weekday: 'short' });
      return `${weekday} ${time}`;
    } else {
      // Older - show date and time
      const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${dateStr} ${time}`;
    }
  }

  async disconnect() {
    if (this.client && this.isInitialized) {
      await this.client.disconnectUser();
      this.client = null;
      this.user = null;
      this.isInitialized = false;
    }
  }
}

export default new StreamChatService();