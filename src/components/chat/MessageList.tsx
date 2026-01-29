import { MessageCircle } from 'lucide-react';
import { Message, Conversation, TypingUser } from '@/types/chat';
import { formatTime, getUserInitials } from '@/utils/chat';
import { CONVERSATION_TYPE } from '@/constants/chat';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
    messages: Message[];
    conversation: Conversation;
    currentUserId: number;
    typingUsers: TypingUser[];
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function MessageList({
    messages,
    conversation,
    currentUserId,
    typingUsers,
    messagesEndRef
}: MessageListProps) {
    if (messages.length === 0) {
        return (
            <div className="text-center" style={{ padding: '3rem' }}>
                <MessageCircle className="w-16 h-16 mx-auto text-gray-300" style={{ marginBottom: '1rem' }} />
                <p className="text-gray-500">Chưa có tin nhắn nào</p>
                <p className="text-sm text-gray-400" style={{ marginTop: '0.25rem' }}>
                    Hãy bắt đầu cuộc trò chuyện!
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                    <div
                        key={msg.id}
                        className={`flex items-end ${isMe ? 'justify-end' : 'justify-start'}`}
                        style={{ gap: '0.5rem' }}
                    >
                        {/* Avatar for other user */}
                        {!isMe && conversation.type === CONVERSATION_TYPE.DM && conversation.otherUser && (
                            conversation.otherUser.avatarUrl ? (
                                <img
                                    src={conversation.otherUser.avatarUrl}
                                    alt={conversation.otherUser.fullName}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
                                    {getUserInitials(conversation.otherUser)}
                                </div>
                            )
                        )}

                        <div style={{ maxWidth: '70%' }}>
                            <div
                                className={`
                                    rounded-2xl
                                    ${isMe
                                        ? 'bg-primary-500 text-white rounded-br-sm'
                                        : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                                    }
                                `}
                                style={{ padding: '0.75rem 1rem' }}
                            >
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                <div className="flex items-center" style={{ gap: '0.5rem', marginTop: '0.25rem' }}>
                                    <p className={`text-xs ${isMe ? 'text-white text-opacity-70' : 'text-gray-400'}`}>
                                        {formatTime(msg.createdAt)}
                                    </p>
                                    {msg.editedAt && (
                                        <span className={`text-xs ${isMe ? 'text-white text-opacity-50' : 'text-gray-400'}`}>
                                            (đã chỉnh sửa)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Typing indicator */}
            {typingUsers.length > 0 && conversation.type === CONVERSATION_TYPE.DM && conversation.otherUser && (
                <TypingIndicator
                    avatarUrl={conversation.otherUser.avatarUrl}
                    userName={conversation.otherUser.fullName}
                />
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}
