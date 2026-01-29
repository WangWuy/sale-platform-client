import { ArrowLeft, Users, Phone, Video, MoreVertical } from 'lucide-react';
import { Conversation } from '@/types/chat';
import { getConversationName, getConversationSubtitle, getUserInitials } from '@/utils/chat';
import { CONVERSATION_TYPE } from '@/constants/chat';

interface ChatHeaderProps {
    conversation: Conversation;
    onBack: () => void;
}

export default function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
    return (
        <div className="bg-white border-b border-gray-200 flex items-center" style={{ padding: '0.75rem 1rem', gap: '1rem' }}>
            <button
                onClick={onBack}
                className="md:hidden hover:bg-gray-100 rounded-lg"
                style={{ padding: '0.5rem' }}
            >
                <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Avatar */}
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
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                    👥
                </div>
            )}

            <div className="flex-1">
                <h2 className="font-semibold text-gray-900">{getConversationName(conversation)}</h2>
                <p className="text-xs text-gray-500">
                    {getConversationSubtitle(conversation)}
                </p>
            </div>

            <div className="flex items-center" style={{ gap: '0.25rem' }}>
                <button className="hover:bg-gray-100 rounded-lg text-gray-500" style={{ padding: '0.5rem' }}>
                    <Users className="w-5 h-5" />
                </button>
                <button className="hover:bg-gray-100 rounded-lg text-gray-500" style={{ padding: '0.5rem' }}>
                    <Phone className="w-5 h-5" />
                </button>
                <button className="hover:bg-gray-100 rounded-lg text-gray-500" style={{ padding: '0.5rem' }}>
                    <Video className="w-5 h-5" />
                </button>
                <button className="hover:bg-gray-100 rounded-lg text-gray-500" style={{ padding: '0.5rem' }}>
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
