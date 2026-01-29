import { Loader2 } from 'lucide-react';
import { User } from '@/types/chat';
import { getUserInitials } from '@/utils/chat';

interface ContactListProps {
    users: User[];
    isLoading: boolean;
    searchQuery: string;
    onSelectUser: (userId: number) => void;
}

export default function ContactList({
    users,
    isLoading,
    searchQuery,
    onSelectUser
}: ContactListProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center" style={{ padding: '2rem' }}>
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
        );
    }

    const filteredUsers = users.filter(user =>
        !searchQuery ||
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {filteredUsers.map((user) => (
                <button
                    key={user.id}
                    onClick={() => onSelectUser(user.id)}
                    className="w-full rounded-lg flex items-center text-left transition hover:bg-gray-50"
                    style={{ padding: '0.75rem', gap: '0.75rem' }}
                >
                    {user.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {getUserInitials(user)}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{user.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}
