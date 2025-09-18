import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import ContractorDashboardLayout from './ContractorDashboardLayout';
import streamChatService from '../services/streamChatService';
import messageNotificationService from '../services/messageNotificationService';
import notificationService from '../services/notificationService';
import authService from '../services/authService';

const ContractorMessages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobileChatActive, setIsMobileChatActive] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const initialSelectionDone = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadChannels();
  }, []);

  // Listen for first-time messages to dynamically add new client contact without page reload
  useEffect(() => {
    let removeListener = null;

    const start = async () => {
      try {
        await messageNotificationService.startListening();
        removeListener = messageNotificationService.addListener(async (eventType, data) => {
          if (eventType === 'newMessage') {
            const event = data;
            const streamSenderId = event?.user?.id;
            const myId = streamChatService.user?.user?.id || streamChatService.user?.id || streamChatService.user?.me?.id;
            // Only act on messages sent by someone else
            if (streamSenderId && streamSenderId !== myId) {
              const senderNumericId = parseInt(String(streamSenderId).replace('user_', ''));
              if (!Number.isNaN(senderNumericId)) {
                const exists = contacts.some(c => c.id === senderNumericId);
                if (!exists) {
                  // Refresh contacts to include the new client and prewarm the channel
                  await loadChannels(true);
                  try {
                    await streamChatService.prewarmChannelByParticipants(senderNumericId, null, null);
                  } catch (_) {}
                }
              }
            }
          }
        });
      } catch (err) {
        console.warn('Contractor message listener failed to start', err);
      }
    };

    start();

    return () => {
      if (removeListener) {
        try { removeListener(); } catch (_) {}
      }
    };
  }, [contacts]);

  // Handle opening specific chat from state parameter
  useEffect(() => {
    if (location.state?.openChatWithClient && contacts.length > 0) {
      const clientId = location.state.openChatWithClient;
      const targetClient = contacts.find(c => c.id === clientId);
      if (targetClient) {
        setSelectedChat(clientId);
        setCurrentChat(targetClient);
        // Clear the state to avoid reopening on subsequent visits
        navigate('/contractor-messages', { replace: true });
      }
    }
  }, [location.state, contacts, navigate]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime listener for new messages in the current channel
  useEffect(() => {
    let unsubscribe = null;

    const setupListener = async () => {
      try {
        if (!currentChat?.channelId) return;
        const client = streamChatService.client || await streamChatService.initialize();
        const channel = client.channel('messaging', currentChat.channelId);
        await channel.watch();

        const handler = (event) => {
          if (event?.message && channel?.id === event?.cid?.split(':')[1]) {
            const msg = event.message;
            const userId = (streamChatService.user?.user?.id) || (streamChatService.user?.id) || (streamChatService.user?.me?.id);
            const mapped = {
              id: msg.id,
              type: msg.attachments?.length > 0 ? 'file' : 'text',
              content: msg.text,
              fileName: msg.attachments?.[0]?.title,
              fileSize: msg.attachments?.[0]?.file_size ? `${(msg.attachments[0].file_size / 1024 / 1024).toFixed(1)}MB` : '',
              fileUrl: msg.attachments?.[0]?.asset_url || msg.attachments?.[0]?.url,
              asset_url: msg.attachments?.[0]?.asset_url || msg.attachments?.[0]?.url,
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sent: msg.user?.id === userId,
              user: msg.user || { id: 'unknown', name: 'Unknown User' }
            };
            // De-duplicate: if this message id already exists (e.g., optimistic add), skip
            setMessages(prev => {
              if (prev.some(m => m.id === mapped.id)) return prev;
              if (mapped.sent) return prev;
              return [...prev, mapped];
            });
          }
        };

        channel.on('message.new', handler);
        unsubscribe = () => channel.off('message.new', handler);
      } catch (e) {
        console.error('Error setting up real-time message listener (contractor):', e);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, [currentChat?.channelId]);

  const loadChannels = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Use refresh method if explicitly requested
      const hiringClients = refresh
        ? await streamChatService.refreshContacts()
        : await streamChatService.getContacts();

      console.log('Loaded contractor contacts:', hiringClients.length, 'clients');
      setContacts(hiringClients);

      // Pre-warm top conversations to reduce first switch latency
      try {
        // Ensure Stream client is ready
        await streamChatService.initialize();
        const top = hiringClients.slice(0, 3);
        await Promise.all(top.map(c => streamChatService.prewarmChannelByParticipants(
          c.id, // clientId (on contractor side contacts are clients)
          null,
          null
        )));
      } catch (preErr) {
        console.warn('Prewarm skipped/failed:', preErr);
      }

      // Only auto-select on first initial load; preserve selection on refreshes
      if (!initialSelectionDone.current) {
        if (hiringClients.length > 0 && !selectedChat) {
          setSelectedChat(hiringClients[0].id);
          setCurrentChat(hiringClients[0]);
        }
        initialSelectionDone.current = true;
      } else if (selectedChat) {
        const stillThere = hiringClients.find(c => c.id === selectedChat);
        if (stillThere) {
          setCurrentChat(stillThere);
        }
      }
    } catch (error) {
      console.error('Error loading hiring clients:', error);
      setError('Failed to load hiring clients: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshContacts = () => {
    console.log('Refreshing contractor contacts...');
    loadChannels(true);
  };

  const loadMessages = async (contactId) => {
    try {
      // contactId here is the client's user ID, not a channel ID
      // We need to create/get the channel first
      const selectedContact = contacts.find(c => c.id === contactId);
      if (!selectedContact) return;

      // Create or get channel between client and contractor
      const channelId = await streamChatService.createChannel(
        contactId, // clientId
        null, // contractorId will be determined from auth token
        null // no specific project
      );

      const channelMessages = await streamChatService.getMessages(channelId);

      // Check for new messages since last load and create notifications for received messages
      if (messages.length > 0 && channelMessages.length > messages.length) {
        const newMessages = channelMessages.slice(messages.length);
        const receivedMessages = newMessages.filter(msg => !msg.sent);

        for (const receivedMsg of receivedMessages) {
          await notificationService.notifyContractorMessageReceived(selectedContact.name);
        }
      }

      setMessages(channelMessages);

      // Update current chat info
      setCurrentChat({
        id: selectedContact.id,
        name: selectedContact.name,
        username: `@${selectedContact.name.toLowerCase().replace(/\s+/g, '')}`,
        avatar: selectedContact.avatar,
        online: selectedContact.online,
        messages: channelMessages,
        channelId: channelId // Store the actual channel ID for sending messages
      });
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (isSending) return;
    if ((newMessage.trim() || selectedFiles.length > 0) && currentChat) {
      try {
        setIsSending(true);
        let attachments = [];

        if (selectedFiles.length > 0) {
          const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
          const token = authService.getToken();

          for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch(`${API_BASE_URL}/fileupload/message-file`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });

            if (!uploadResponse.ok) {
              throw new Error('Failed to upload file');
            }

            const uploadResult = await uploadResponse.json();

            attachments.push({
              type: 'file',
              asset_url: uploadResult.fileUrl,
              title: uploadResult.fileName,
              file_size: uploadResult.fileSize,
              mime_type: uploadResult.mimeType
            });
          }
        }

        // Ensure we have a channelId (create on the fly if missing)
        let channelIdToUse = currentChat.channelId;
        if (!channelIdToUse) {
          channelIdToUse = await streamChatService.createChannel(
            currentChat.id, // clientId
            null,
            null
          );
        }

        // Optimistic message
        const tempId = `temp-${Date.now()}`;
        const optimistic = {
          id: tempId,
          type: attachments.length > 0 ? 'file' : 'text',
          content: newMessage,
          fileName: attachments[0]?.title,
          fileSize: attachments[0]?.file_size ? `${(attachments[0].file_size / 1024 / 1024).toFixed(1)}MB` : '',
          fileUrl: attachments[0]?.asset_url,
          asset_url: attachments[0]?.asset_url,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sent: true,
          user: streamChatService.user?.user || { id: 'me', name: 'Me' }
        };
        setMessages(prev => [...prev, optimistic]);

        // Try send, retry once on transient failure
        try {
          await streamChatService.sendMessage(channelIdToUse, newMessage, attachments);
        } catch (firstErr) {
          console.warn('First send attempt failed, retrying once...', firstErr);
          await streamChatService.sendMessage(channelIdToUse, newMessage, attachments);
        }

        await notificationService.notifyMessageSent(currentChat.name);

        setNewMessage('');
        setSelectedFiles([]);
        // No reload needed; real-time listener and optimistic update handle UI
      } catch (error) {
        console.error('Error sending message:', error);
        setError('Failed to send message');
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#4EC1EF', '#4EC1EF', '#FF6B6B', '#4ECDC4', '#45B7D1',
      '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleChatSelect = async (contact) => {
    setSelectedChat(contact.id);
    setCurrentChat(contact);

    // CRITICAL: On mobile, activate chat view
    if (window.innerWidth <= 1024) {
      setIsMobileChatActive(true);
    }

    // Mark messages as read when selecting a chat
    try {
      if (contact.channel?.id) {
        await messageNotificationService.markChannelAsRead(contact.channel.id);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleBackToList = () => {
    setIsMobileChatActive(false);
  };

  const handleFileDownload = (fileUrl, fileName) => {
    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'downloaded-file';
      link.target = '_blank';

      // Append to body temporarily to ensure it works in all browsers
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: open in new tab
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <ContractorDashboardLayout>
      <div className="contractor-messages-container">
        <div className="contractor-messages-layout">
          {/* Chat List */}
          <div className={`client-chat-list ${isMobileChatActive ? 'mobile-hidden' : ''}`}>
            <div className="client-chat-list-header">
              <div className="client-messages-title">
                <h2>Messages</h2>
                <span className="client-message-count">{contacts.length}</span>
              </div>
            </div>

            <div className="client-chat-search">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="client-search-input"
              />
            </div>

            <div className="client-chat-contacts">
              {loading ? (
                <div className="loading-message">Loading conversations...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : filteredContacts.length === 0 ? (
                <div className="no-conversations">No hiring clients found</div>
              ) : (
                filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    className={`client-chat-contact ${selectedChat === contact.id ? 'selected' : ''}`}
                    onClick={() => handleChatSelect(contact)}
                  >
                    <div className="client-contact-avatar-container">
                      <div
                        className="client-contact-avatar"
                        style={{
                          backgroundColor: getAvatarColor(contact.name),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '1rem'
                        }}
                      >
                        {getInitials(contact.name)}
                      </div>
                      {contact.online && <div className="client-online-indicator"></div>}
                    </div>
                    <div className="client-contact-info">
                      <div className="client-contact-name">{contact.name}</div>
                      <div className="client-contact-last-message">{contact.lastMessage}</div>
                    </div>
                    <div className="client-contact-meta">
                      <div className="client-contact-time">{contact.time}</div>
                      {contact.unread > 0 && (
                        <div className="client-unread-badge">
                          {contact.unread > 99 ? '99+' : contact.unread}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`client-chat-window ${isMobileChatActive ? 'mobile-active' : ''}`}>
            {currentChat && (
              <div className="client-chat-header">
                <button
                  className="mobile-back-btn"
                  onClick={handleBackToList}
                  style={{ display: window.innerWidth <= 1024 ? 'flex' : 'none' }}
                >
                  ←
                </button>
                <div className="client-chat-user-info">
                  <div
                    className="client-chat-user-avatar"
                    style={{
                      backgroundColor: getAvatarColor(currentChat.name),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '1.25rem'
                    }}
                  >
                    {getInitials(currentChat.name)}
                  </div>
                  <div className="client-chat-user-details">
                    <div className="client-chat-user-name">{currentChat.name}</div>
                    <div className="client-chat-user-username">{currentChat.username}</div>
                  </div>
                  {currentChat.online && <span className="client-online-status">● Online</span>}
                </div>
              </div>
            )}

            <div className="client-chat-messages">
              {currentChat && messages ? (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`client-message ${message.sent ? 'sent' : 'received'}`}
                  >
                    {message.type === 'text' && (
                      <div className="client-message-bubble client-text-message">
                        {message.content}
                      </div>
                    )}

                    {message.type === 'file' && (
                      <div
                        className="client-message-bubble client-file-message"
                        onClick={() => handleFileDownload(message.fileUrl || message.asset_url, message.fileName)}
                        style={{ cursor: 'pointer' }}
                        title="Click to download file"
                      >
                        <div className="client-file-icon">📄</div>
                        <div className="client-file-info">
                          <div className="client-file-name">{message.fileName}</div>
                          <div className="client-file-size">{message.fileSize}</div>
                        </div>
                        <button
                          className="client-file-download"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileDownload(message.fileUrl || message.asset_url, message.fileName);
                          }}
                          title="Download file"
                        >
                          ⬇️
                        </button>
                      </div>
                    )}

                    {message.type === 'voice' && (
                      <div className="client-message-bubble client-voice-message">
                        <button className="client-play-button">▶️</button>
                        <div className="client-voice-waveform">
                          <div className="client-waveform-bars">
                            {Array.from({ length: 40 }, (_, i) => (
                              <div key={i} className="client-waveform-bar"></div>
                            ))}
                          </div>
                          <div className="client-voice-duration">{message.duration}</div>
                        </div>
                      </div>
                    )}

                    <div className="client-message-date">{message.time}</div>
                    {message.sent && <div className="client-message-status">✓ Sent</div>}
                  </div>
                ))
              ) : (
                <div className="no-messages">Select a conversation to start messaging</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {selectedFiles.length > 0 && (
              <div className="client-file-preview">
                <div className="client-file-preview-header">
                  <span>Selected Files ({selectedFiles.length})</span>
                </div>
                <div className="client-file-preview-list">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="client-file-preview-item">
                      <div className="client-file-icon">📄</div>
                      <div className="client-file-details">
                        <div className="client-file-name">{file.name}</div>
                        <div className="client-file-size">{(file.size / 1024 / 1024).toFixed(1)}MB</div>
                      </div>
                      <button
                        className="client-file-remove"
                        onClick={() => removeFile(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="client-chat-input-container">
              {showEmojiPicker && (
                <div className="emoji-picker" ref={emojiPickerRef}>
                  <div className="emoji-grid">
                    {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
                      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
                      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
                      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
                      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
                      '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
                      '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
                      '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
                      '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
                      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
                      '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
                      '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶',
                      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
                      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'].map(emoji => (
                        <button
                          key={emoji}
                          className="emoji-btn"
                          onClick={() => handleEmojiSelect(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                  </div>
                </div>
              )}
              <div className="client-chat-input">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  multiple
                />
                <button className="client-attachment-btn" onClick={handleAttachmentClick}>📎</button>
                <input
                  type="text"
                  placeholder="Send a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="client-message-input"
                />
                <button className="btn-primary"  onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContractorDashboardLayout>
  );
};

export default ContractorMessages;