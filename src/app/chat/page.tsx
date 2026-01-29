'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, Users, Search } from 'lucide-react';
// Services
import { searchUsers, getAllUsers, startDirectMessage } from '@/services/chat.service';

// Styles
import styles from './chat.module.scss';

// Types
import { Message, Conversation, TypingUser, User, ChatTab } from '@/types/chat';

// Constants
import { SOCKET_URL, TYPING_TIMEOUT, SEARCH_DEBOUNCE_DELAY } from '@/constants/chat';

// Utils
import { getCurrentUserId, getAccessToken } from '@/utils/chat';
import { UsersCache } from '@/utils/chatCache';
import { useMessageCache } from '@/hooks/useMessageCache';

// Components
import CreateGroupModal from '@/components/chat/CreateGroupModal';
import ConversationList from '@/components/chat/ConversationList';
import ContactList from '@/components/chat/ContactList';
import UserSearchDropdown from '@/components/chat/UserSearchDropdown';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import EmptyState from '@/components/chat/EmptyState';

export default function ChatPage() {
    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileConversations, setShowMobileConversations] = useState(true);

    // Modal state
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

    // User search state
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Tab state
    const [activeTab, setActiveTab] = useState<ChatTab>('messages');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Message cache hook
    const { getCachedMessages, setCachedMessages, addMessage: addCachedMessage, hasCache } = useMessageCache();

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const conversationRef = useRef<Conversation | null>(null); // Track current conversation for socket handlers

    // Search users for DM
    const searchUsersForDM = useCallback(async (query: string) => {
        const results = await searchUsers(query);
        setSearchResults(results);
        setIsSearchingUsers(false);
    }, []);

    // Handle search input change with debounce
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout
        const timeout = setTimeout(() => {
            searchUsersForDM(value);
        }, SEARCH_DEBOUNCE_DELAY);
        setSearchTimeout(timeout);
    }, [searchTimeout, searchUsersForDM]);

    // Start DM with user
    const startDMWithUser = useCallback(async (userId: number) => {
        try {
            const conversation = await startDirectMessage(userId);

            // Refresh conversation list
            if (socketRef.current) {
                socketRef.current.emit('conversations:list');
            }

            // Clear search
            setSearchQuery('');
            setSearchResults([]);

            // Auto join the conversation
            if (conversation && socketRef.current) {
                if (currentConversation) {
                    socketRef.current.emit('conversation:leave', currentConversation.id);
                }
                socketRef.current.emit('conversation:join', conversation.id);
                setCurrentConversation(conversation);
                setMessages([]);
                setShowMobileConversations(false);
            }
        } catch (error) {
            console.error('Failed to start DM:', error);
        }
    }, [currentConversation]);

    // Refresh conversations list
    const refreshConversations = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.emit('conversations:list');
        }
    }, []);

    // Fetch all users for Contacts tab
    const fetchAllUsers = useCallback(async () => {
        // Check cache first
        const cachedUsers = UsersCache.get();
        if (cachedUsers) {
            setAllUsers(cachedUsers);
            return;
        }

        setIsLoadingUsers(true);
        try {
            const users = await getAllUsers();
            setAllUsers(users);
            // Cache the users
            UsersCache.set(users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    // Load users when switching to Contacts tab
    useEffect(() => {
        if (activeTab === 'contacts' && allUsers.length === 0) {
            fetchAllUsers();
        }
    }, [activeTab, allUsers.length, fetchAllUsers]);

    // Initialize socket connection
    useEffect(() => {
        const socket = io(SOCKET_URL, {
            auth: { token: getAccessToken() },
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('🔌 Connected to chat server');
            setIsConnected(true);
            socket.emit('conversations:list');
        });

        socket.on('disconnect', () => {
            console.log('🔌 Disconnected from chat server');
            setIsConnected(false);
        });

        socket.on('conversations:list', (conversationList: Conversation[]) => {
            setConversations(conversationList);
            setIsLoadingConversations(false);
        });

        socket.on('conversation:messages', (messageList: Message[]) => {
            const reversed = messageList.reverse();
            setMessages(reversed);

            // Cache messages if we have a current conversation
            if (conversationRef.current) {
                setCachedMessages(conversationRef.current.id, reversed);
            }
        });

        socket.on('message:new', (msg: Message) => {
            console.log('New message received:', msg);
            setMessages((prev) => {
                const updated = [...prev, msg];
                // Also update cache using ref
                if (conversationRef.current) {
                    setCachedMessages(conversationRef.current.id, updated);
                }
                return updated;
            });
        });

        socket.on('typing:start', (data: TypingUser) => {
            setTypingUsers((prev) => {
                if (prev.some((u) => u.userId === data.userId)) return prev;
                return [...prev, data];
            });
        });

        socket.on('typing:stop', (data: { userId: number }) => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        });

        // Listen for new message notifications (for unread count)
        socket.on('notification:new_message', (data: { conversationId: number, senderId: number, content: string, createdAt: string }) => {
            // If we are NOT in this conversation, increase unread count
            setConversations(prev => {
                const updated = prev.map(conv => {
                    if (conv.id === data.conversationId) {
                        return {
                            ...conv,
                            unreadCount: (conv.unreadCount || 0) + 1,
                            lastMessage: {
                                id: Date.now(), // Temp ID
                                senderId: data.senderId,
                                content: data.content,
                                createdAt: data.createdAt
                            }
                        };
                    }
                    return conv;
                });

                // Move updated conversation to top
                updated.sort((a, b) => {
                    if (a.id === data.conversationId) return -1;
                    if (b.id === data.conversationId) return 1;
                    return 0;
                });

                return updated;
            });
        });

        // Listen for message read events
        socket.on('message:read', (data: { messageIds: number[], readBy: number, conversationId: number }) => {
            // Optional: Update read status in UI if needed
        });

        socket.on('error', (error: { message: string }) => {
            console.error('Socket error:', error.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [setCachedMessages]); // Remove currentConversation from deps

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when conversation selected
    useEffect(() => {
        if (currentConversation) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [currentConversation]);

    // Join conversation
    const joinConversation = useCallback((conversation: Conversation) => {
        if (socketRef.current && conversation) {
            if (currentConversation) {
                // Save current messages to cache before leaving
                setCachedMessages(currentConversation.id, messages);
                socketRef.current.emit('conversation:leave', currentConversation.id);
            }

            // Check if we have cached messages for this conversation
            const cachedMessages = getCachedMessages(conversation.id);
            if (cachedMessages && cachedMessages.length > 0) {
                // Use cached messages
                setMessages(cachedMessages);
            } else {
                // Clear messages, will be loaded from socket
                setMessages([]);
            }

            socketRef.current.emit('conversation:join', conversation.id);
            setCurrentConversation(conversation);
            conversationRef.current = conversation; // Update ref
            setShowMobileConversations(false);

            // Reset unread count for this conversation locally
            setConversations(prev => prev.map(c => {
                if (c.id === conversation.id) {
                    return { ...c, unreadCount: 0 };
                }
                return c;
            }));

            // TODO: Emit message:read to server? 
            // The server might need an explicit event to mark all as read or we can rely on `conversation:join` logic?
            // Current `conversation:join` does NOT mark as read automatically in the backend logic I saw.
            // But usually fetching messages is enough? No, we need to update lastReadAt.

            // Let's assume we read all messages when we join
            // We can send message:read for the last message ID if available
            if (conversation.lastMessage) {
                socketRef.current.emit('message:read', {
                    conversationId: conversation.id,
                    messageIds: [conversation.lastMessage.id] // Or just pass the latest one
                });
            }
        }
    }, [currentConversation, messages, getCachedMessages, setCachedMessages]);

    // Send message
    const sendMessage = useCallback(() => {
        if (!inputText.trim() || !socketRef.current || !currentConversation) return;

        socketRef.current.emit('message:send', {
            conversationId: currentConversation.id,
            content: inputText.trim(),
            messageType: 1,
        });

        socketRef.current.emit('typing:stop', currentConversation.id);
        setInputText('');
    }, [inputText, currentConversation]);

    // Handle typing
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);

        if (socketRef.current && currentConversation) {
            socketRef.current.emit('typing:start', currentConversation.id);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current?.emit('typing:stop', currentConversation.id);
            }, TYPING_TIMEOUT);
        }
    }, [currentConversation]);

    // Handle key press
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);


    return (
        <div className={styles.chatContainer}>
            {/* Conversations Sidebar */}
            <aside className={`
                ${styles.sidebar}
                ${showMobileConversations ? '' : styles.hiddenMobile}
            `}>
                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`${styles.tabButton} ${activeTab === 'messages' ? styles.active : styles.inactive
                            }`}
                    >
                        <MessageCircle className={styles.icon} />
                        Tin nhắn
                        {activeTab === 'messages' && (
                            <div className={styles.indicator} />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('contacts')}
                        className={`${styles.tabButton} ${activeTab === 'contacts' ? styles.active : styles.inactive
                            }`}
                    >
                        <Users className={styles.icon} />
                        Danh bạ
                        {activeTab === 'contacts' && (
                            <div className={styles.indicator} />
                        )}
                    </button>
                </div>

                {/* Search Users */}
                <div className={styles.searchSection}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder={activeTab === 'messages' ? 'Tìm cuộc trò chuyện...' : 'Tìm người...'}
                            className="w-full bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            style={{ paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
                        />
                    </div>

                    {/* Search Results Dropdown (only for Messages tab) */}
                    {activeTab === 'messages' && searchQuery && (
                        <UserSearchDropdown
                            isSearching={isSearchingUsers}
                            searchResults={searchResults}
                            onSelectUser={startDMWithUser}
                        />
                    )}
                </div>

                {/* Content Area */}
                <div className={styles.contentArea}>
                    {activeTab === 'messages' ? (
                        <ConversationList
                            conversations={conversations}
                            currentConversation={currentConversation}
                            currentUserId={getCurrentUserId()}
                            isLoading={isLoadingConversations}
                            onSelectConversation={joinConversation}
                        />
                    ) : (
                        <ContactList
                            users={allUsers}
                            isLoading={isLoadingUsers}
                            searchQuery={searchQuery}
                            onSelectUser={startDMWithUser}
                        />
                    )}
                </div>

                {/* Create Group Button */}
                <div className={styles.createGroupSection}>
                    <button
                        onClick={() => setIsCreateGroupModalOpen(true)}
                        className="w-full flex items-center justify-center bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                        style={{ gap: '0.5rem', padding: '0.625rem' }}
                    >
                        <Users className="w-5 h-5" />
                        Tạo nhóm chat
                    </button>
                </div>
            </aside>

            {/* Chat Area */}
            <div className={`
                ${styles.chatArea}
                ${!showMobileConversations ? '' : styles.hiddenMobile}
            `}>
                {currentConversation ? (
                    <>
                        <ChatHeader
                            conversation={currentConversation}
                            onBack={() => setShowMobileConversations(true)}
                        />

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto" style={{ padding: '1rem' }}>
                            <MessageList
                                messages={messages}
                                conversation={currentConversation}
                                currentUserId={getCurrentUserId()}
                                typingUsers={typingUsers}
                                messagesEndRef={messagesEndRef}
                            />
                        </div>

                        {/* Input */}
                        <MessageInput
                            value={inputText}
                            onChange={handleInputChange}
                            onSend={sendMessage}
                            onKeyPress={handleKeyPress}
                            isConnected={isConnected}
                            inputRef={inputRef}
                        />
                    </>
                ) : (
                    <EmptyState />
                )}
            </div>

            <CreateGroupModal
                isOpen={isCreateGroupModalOpen}
                onClose={() => setIsCreateGroupModalOpen(false)}
                onCreated={refreshConversations}
                currentUserId={getCurrentUserId()}
            />
        </div>
    );
}
