'use client';

import { useState, useEffect } from "react";
import { X, Search, Check, UserPlus, Users, User } from "lucide-react";

// Types
import { User as UserType } from '@/types/chat';

// Services
import { getAllUsers, createConversation } from '@/services/chat.service';

// Utils
import { getRoleName, getUserInitials } from '@/utils/chat';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    currentUserId?: number; // Truyền vào để loại bỏ bản thân
}

export default function CreateConversationModal({ isOpen, onClose, onCreated, currentUserId }: Props) {
    const [activeTab, setActiveTab] = useState<"dm" | "group">("dm");
    const [users, setUsers] = useState<UserType[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [groupName, setGroupName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setSelectedUserIds([]);
            setGroupName("");
            setSearchQuery("");
            setActiveTab("dm");
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const userList = await getAllUsers();

            // Filter out current user
            if (currentUserId) {
                const filteredUsers = userList.filter(u => u.id !== currentUserId);
                setUsers(filteredUsers);
            } else {
                setUsers(userList);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserSelect = (userId: number) => {
        if (activeTab === "dm") {
            // DM: chỉ chọn 1 người
            setSelectedUserIds([userId]);
        } else {
            // Group: chọn nhiều ng
            setSelectedUserIds(prev => {
                if (prev.includes(userId)) return prev.filter(id => id !== userId);
                return [...prev, userId];
            });
        }
    };

    const handleCreate = async () => {
        if (selectedUserIds.length === 0) return;
        if (activeTab === "group" && !groupName.trim()) return;

        setIsCreating(true);
        try {
            const payload = activeTab === "dm"
                ? { type: 1, targetUserId: selectedUserIds[0] }
                : { type: 2, title: groupName, participantIds: selectedUserIds };

            await createConversation(payload);

            onCreated();
            onClose();
        } catch (error) {
            console.error("Failed to create conversation:", error);
            alert("Có lỗi xảy ra khi tạo cuộc trò chuyện");
        } finally {
            setIsCreating(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Tạo cuộc trò chuyện mới</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 border-b bg-gray-50">
                    <button
                        onClick={() => { setActiveTab("dm"); setSelectedUserIds([]); }}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "dm"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:bg-gray-200"
                            }`}
                    >
                        <User size={18} /> Chat 1-1
                    </button>
                    <button
                        onClick={() => { setActiveTab("group"); setSelectedUserIds([]); }}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "group"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:bg-gray-200"
                            }`}
                    >
                        <Users size={18} /> Tạo Nhóm
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
                    {/* Group Name Input (Only Group Tab) */}
                    {activeTab === "group" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Nhập tên nhóm..."
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Tìm kiếm thành viên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* User List */}
                    <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-400">Đang tải danh sách...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">Không tìm thấy thành viên nào</div>
                        ) : (
                            filteredUsers.map(user => {
                                const isSelected = selectedUserIds.includes(user.id);
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => handleUserSelect(user.id)}
                                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-transparent"
                                            } border`}
                                    >
                                        <div className="relative">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {getUserInitials(user)}
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white">
                                                    <Check size={10} strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className={`font-medium ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                                                {user.fullName} {user.id === currentUserId && "(Bạn)"}
                                            </p>
                                            <p className="text-xs text-gray-500">{user.email} • {getRoleName(user.role)}</p>
                                        </div>
                                        {activeTab === "group" && (
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                                                }`}>
                                                {isSelected && <Check size={12} className="text-white" />}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg mr-2 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isCreating || selectedUserIds.length === 0 || (activeTab === "group" && !groupName.trim())}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {isCreating ? "Đang tạo..." : activeTab === "group" ? "Tạo nhóm" : "Bắt đầu chat"}
                    </button>
                </div>
            </div>
        </div>
    );
}
