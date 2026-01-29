import { Loader2, Hash } from 'lucide-react';
import { Conversation } from '@/types/chat';
import {
    getConversationName,
    getConversationTypeInfo,
    getLastMessagePreview,
    getUserInitials
} from '@/utils/chat';
import { CONVERSATION_TYPE } from '@/constants/chat';

interface ConversationListProps {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    currentUserId: number;
    isLoading: boolean;
    onSelectConversation: (conversation: Conversation) => void;
}

export default function ConversationList({
    conversations,
    currentConversation,
    currentUserId,
    isLoading,
    onSelectConversation
}: ConversationListProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center" style={{ padding: '2rem' }}>
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="text-center" style={{ padding: '2rem 1rem' }}>
                <Hash className="w-12 h-12 mx-auto text-gray-300" style={{ marginBottom: '0.75rem' }} />
                <p className="text-sm text-gray-500">Chưa có cuộc trò chuyện nào</p>
                <p className="text-xs text-gray-400" style={{ marginTop: '0.25rem' }}>
                    Tìm người để bắt đầu chat
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {conversations.map((conversation) => {
                const typeInfo = getConversationTypeInfo(conversation.type);
                const unreadCount = conversation.unreadCount || 0;
                const hasUnread = unreadCount > 0;
                const isActive = currentConversation?.id === conversation.id;

                return (
                    <button
                        key={conversation.id}
                        onClick={() => onSelectConversation(conversation)}
                        className={`
                            w-full rounded-lg flex items-center text-left transition relative overflow-hidden
                            ${isActive
                                ? 'bg-primary-500 text-white shadow-md'
                                : hasUnread
                                    ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-primary-500'
                                    : 'hover:bg-gray-50'
                            }
                        `}
                        style={{ padding: '0.75rem', gap: '0.75rem' }}
                    >
                        {conversation.type === CONVERSATION_TYPE.DM && conversation.otherUser ? (
                            conversation.otherUser.avatarUrl ? (
                                <img
                                    src={conversation.otherUser.avatarUrl}
                                    alt={conversation.otherUser.fullName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                    {getUserInitials(conversation.otherUser)}
                                </div>
                            )
                        ) : (
                            <div className={`
                                w-10 h-10 rounded-lg flex items-center justify-center text-xl
                                ${isActive ? 'bg-white bg-opacity-20' : typeInfo.color + ' bg-opacity-10'}
                            `}>
                                {typeInfo.icon}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <p className={`truncate ${isActive ? 'text-white' : 'text-gray-800'} ${hasUnread ? 'font-bold text-base' : 'font-medium'}`}>
                                    {getConversationName(conversation)}
                                </p>
                                {conversation.lastMessage && (
                                    <span className={`text-[10px] ml-2 ${isActive ? 'text-white text-opacity-70' : hasUnread ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}>
                                        {new Date(conversation.lastMessage.createdAt).getHours()}:{String(new Date(conversation.lastMessage.createdAt).getMinutes()).padStart(2, '0')}
                                    </span>
                                )}
                            </div>
                            <p className={`text-xs truncate ${isActive ? 'text-white text-opacity-70' : hasUnread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                {getLastMessagePreview(conversation, currentUserId)}
                            </p>
                        </div>

                        {/* Unread Badge */}
                        {hasUnread && (
                            <div className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
