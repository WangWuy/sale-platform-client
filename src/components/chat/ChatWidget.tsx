'use client';

// =====================================================
// IMPORTS
// =====================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Types
import { Message, TypingUser } from '@/types/chat';

// Constants
import { SOCKET_URL } from '@/constants/chat';

// Utils
import { getAccessToken } from '@/utils/chat';

// =====================================================
// LOCAL TYPES
// =====================================================

interface Room {
    id: number;
    name: string;
    type: number;
}

interface WidgetMessage {
    id: number;
    roomId: number;
    senderId: number;
    senderName: string;
    message: string;
    messageType: number;
    attachmentUrl?: string | null;
    isRead: boolean;
    createdAt: string;
}

// =====================================================
// COMPONENT
// =====================================================

export default function ChatWidget() {
    // State
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<WidgetMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showRoomList, setShowRoomList] = useState(true);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get token from localStorage (if logged in)
    const getToken = useCallback(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken') || '';
        }
        return '';
    }, []);

    // Initialize socket connection
    useEffect(() => {
        if (!isOpen) return;

        const socket = io(SOCKET_URL, {
            auth: { token: getToken() },
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        // Connection events
        socket.on('connect', () => {
            console.log('🔌 Connected to chat server');
            setIsConnected(true);
            socket.emit('rooms:list');
        });

        socket.on('disconnect', () => {
            console.log('🔌 Disconnected from chat server');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setIsConnected(false);
        });

        // Room events
        socket.on('rooms:list', (roomList: Room[]) => {
            setRooms(roomList);
            // Auto-join first room if exists
            if (roomList.length > 0 && !currentRoom) {
                // Don't auto-join, let user select
            }
        });

        socket.on('room:messages', (messageList: WidgetMessage[]) => {
            setMessages(messageList);
        });

        socket.on('room:user_joined', (data: { userId: number; userName: string }) => {
            console.log(`👤 ${data.userName} joined the room`);
        });

        socket.on('room:user_left', (data: { userId: number; userName: string }) => {
            console.log(`👤 ${data.userName} left the room`);
        });

        // Message events
        socket.on('message:new', (msg: WidgetMessage) => {
            setMessages((prev) => [...prev, msg]);
            if (!isOpen) {
                setUnreadCount((prev) => prev + 1);
            }
        });

        socket.on('message:read', (data: { messageIds: number[]; readBy: number }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    data.messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
                )
            );
        });

        // Typing events
        socket.on('typing:start', (data: TypingUser) => {
            setTypingUsers((prev) => {
                if (prev.some((u) => u.userId === data.userId)) return prev;
                return [...prev, data];
            });
        });

        socket.on('typing:stop', (data: { userId: number }) => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        });

        // Error events
        socket.on('error', (error: { message: string }) => {
            console.error('Socket error:', error.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isOpen, getToken, currentRoom]);

    // Auto scroll to bottom when new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && currentRoom) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, currentRoom]);

    // Clear unread when opening
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    // Join room
    const joinRoom = useCallback((room: Room) => {
        if (socketRef.current && room) {
            // Leave current room first
            if (currentRoom) {
                socketRef.current.emit('room:leave', currentRoom.id);
            }
            // Join new room
            socketRef.current.emit('room:join', room.id);
            setCurrentRoom(room);
            setShowRoomList(false);
            setMessages([]);
        }
    }, [currentRoom]);

    // Send message
    const sendMessage = useCallback(() => {
        if (!inputText.trim() || !socketRef.current || !currentRoom) return;

        socketRef.current.emit('message:send', {
            roomId: currentRoom.id,
            content: inputText.trim(),
            messageType: 1, // TEXT
        });

        // Clear typing indicator
        socketRef.current.emit('typing:stop', currentRoom.id);
        setInputText('');
    }, [inputText, currentRoom]);

    // Handle typing
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);

        if (socketRef.current && currentRoom) {
            socketRef.current.emit('typing:start', currentRoom.id);

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set new timeout
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current?.emit('typing:stop', currentRoom.id);
            }, 2000);
        }
    }, [currentRoom]);

    // Handle key press
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Get room type icon
    const getRoomTypeIcon = (type: number) => {
        switch (type) {
            case 1: return '💬'; // GENERAL
            case 2: return '📋'; // QUOTE
            case 3: return '📦'; // PRODUCT
            default: return '💭';
        }
    };

    // Current user ID (from token or guest)
    const getCurrentUserId = () => {
        // In real app, decode from token
        return 0; // Guest
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                id="chat-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
                aria-label={isOpen ? 'Đóng chat' : 'Mở chat nội bộ'}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}

                {/* Unread badge */}
                {!isOpen && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}

                {/* Pulse animation when closed */}
                {!isOpen && unreadCount === 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div
                    id="chat-widget"
                    className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[520px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3 flex items-center gap-3">
                        {currentRoom && !showRoomList && (
                            <button
                                onClick={() => setShowRoomList(true)}
                                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold">
                                {currentRoom && !showRoomList ? currentRoom.name : 'Chat Nội Bộ'}
                            </h3>
                            <p className="text-white/70 text-xs flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                                {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Room List or Chat Area */}
                    {showRoomList ? (
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900">
                            <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                                Chọn phòng chat
                            </h4>
                            {rooms.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-sm">Chưa có phòng chat nào</p>
                                    <p className="text-xs mt-1">Hãy tạo phòng chat mới</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {rooms.map((room) => (
                                        <button
                                            key={room.id}
                                            onClick={() => joinRoom(room)}
                                            className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-left shadow-sm border border-slate-100 dark:border-slate-700"
                                        >
                                            <span className="text-2xl">{getRoomTypeIcon(room.type)}</span>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800 dark:text-white">{room.name}</p>
                                                <p className="text-xs text-slate-500">Nhấn để tham gia</p>
                                            </div>
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
                                {messages.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <p className="text-sm">Chưa có tin nhắn nào</p>
                                        <p className="text-xs mt-1">Hãy bắt đầu cuộc trò chuyện!</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMe = msg.senderId === getCurrentUserId();
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className="max-w-[80%]">
                                                    {!isMe && (
                                                        <p className="text-xs text-slate-500 mb-1 ml-1">{msg.senderName}</p>
                                                    )}
                                                    <div
                                                        className={`px-4 py-2 rounded-2xl ${isMe
                                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white'
                                                            : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                                                            }`}
                                                    >
                                                        <p className="text-sm break-words">{msg.message}</p>
                                                        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                                                            <p className={`text-xs ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                                                                {formatTime(msg.createdAt)}
                                                            </p>
                                                            {isMe && msg.isRead && (
                                                                <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {/* Typing indicator */}
                                {typingUsers.length > 0 && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-2xl shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    {typingUsers.map(u => u.userName).join(', ')} đang gõ...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputText}
                                        onChange={handleInputChange}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Nhập tin nhắn..."
                                        disabled={!isConnected}
                                        className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!inputText.trim() || !isConnected}
                                        className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all hover:scale-105"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
