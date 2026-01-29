import { Loader2 } from 'lucide-react';
import { User } from '@/types/chat';
import { getUserInitials } from '@/utils/chat';

interface UserSearchDropdownProps {
    isSearching: boolean;
    searchResults: User[];
    onSelectUser: (userId: number) => void;
}

export default function UserSearchDropdown({
    isSearching,
    searchResults,
    onSelectUser
}: UserSearchDropdownProps) {
    return (
        <div className="absolute z-10 mt-2 w-80 bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto">
            {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Đang tìm kiếm...
                </div>
            ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                    Không tìm thấy người dùng nào
                </div>
            ) : (
                <div className="p-2">
                    {searchResults.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => onSelectUser(user.id)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
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
                            <div className="flex-1 text-left">
                                <p className="font-medium text-gray-800">{user.fullName}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
