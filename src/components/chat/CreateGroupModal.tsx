'use client';

import { useState, useEffect } from "react";
import { X, Search, Check, Users } from "lucide-react";
import styles from "./CreateGroupModal.module.scss";

// Types
import { User } from '@/types/chat';

// Services
import { getAllUsers, createGroupConversation } from '@/services/chat.service';

// Utils
import { getRoleName, getUserInitials } from '@/utils/chat';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    currentUserId?: number;
}

export default function CreateGroupModal({ isOpen, onClose, onCreated, currentUserId }: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [groupName, setGroupName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setSelectedUserIds([]);
            setGroupName("");
            setSearchQuery("");
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const userList = await getAllUsers();

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
        setSelectedUserIds(prev => {
            if (prev.includes(userId)) return prev.filter(id => id !== userId);
            return [...prev, userId];
        });
    };

    const handleCreate = async () => {
        if (selectedUserIds.length === 0 || !groupName.trim()) return;

        setIsCreating(true);
        try {
            await createGroupConversation(groupName.trim(), selectedUserIds);

            onCreated();
            onClose();
        } catch (error) {
            console.error("Failed to create group:", error);
            alert("Có lỗi xảy ra khi tạo nhóm");
        } finally {
            setIsCreating(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    if (!isOpen) return null;

    const selectedCount = selectedUserIds.length;
    const isCreateDisabled = isCreating || selectedCount === 0 || !groupName.trim();

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="create-group-title">
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerIcon}>
                            <Users className={styles.headerIconSvg} />
                        </div>
                        <div>
                            <h2 id="create-group-title" className={styles.title}>Tạo nhóm chat</h2>
                            <p className={styles.subtitle}>Chọn thành viên và đặt tên cho nhóm</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={styles.closeButton} aria-label="Đóng">
                        <X className={styles.closeIcon} />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="group-name">Tên nhóm</label>
                        <input
                            id="group-name"
                            type="text"
                            className={styles.input}
                            placeholder="Nhập tên nhóm..."
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <p className={styles.hint}>Gợi ý: Team CSKH, Sales Miền Nam, Dự án A...</p>
                    </div>

                    <div className={styles.searchGroup}>
                        <Search className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Tìm kiếm thành viên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.selectionMeta}>
                        <span className={styles.selectionCount}>
                            Đã chọn <strong>{selectedCount}</strong> người
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedUserIds([])}
                            className={styles.clearButton}
                            disabled={selectedCount === 0}
                        >
                            Xóa chọn
                        </button>
                    </div>

                    <div className={styles.userList}>
                        {isLoading ? (
                            <div className={styles.listState}>Đang tải danh sách...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className={styles.listState}>Không tìm thấy thành viên nào</div>
                        ) : (
                            filteredUsers.map(user => {
                                const isSelected = selectedUserIds.includes(user.id);
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => handleUserSelect(user.id)}
                                        className={`${styles.userRow} ${isSelected ? styles.userRowSelected : ""}`}
                                    >
                                        <div className={styles.avatarWrap}>
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.fullName} className={styles.avatarImage} />
                                            ) : (
                                                <div className={styles.avatarFallback}>
                                                    {getUserInitials(user)}
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className={styles.selectedBadge}>
                                                    <Check className={styles.badgeIcon} />
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.userInfo}>
                                            <p className={`${styles.userName} ${isSelected ? styles.userNameSelected : ""}`}>
                                                {user.fullName}
                                            </p>
                                            <p className={styles.userMeta}>{user.email} • {getRoleName(user.role)}</p>
                                        </div>
                                        <div className={`${styles.selectIndicator} ${isSelected ? styles.selectIndicatorSelected : ""}`}>
                                            {isSelected && <Check className={styles.indicatorIcon} />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <p className={styles.footerNote}>
                        {selectedCount === 0 ? "Chọn ít nhất 1 thành viên để tạo nhóm." : `Sẵn sàng tạo nhóm với ${selectedCount} thành viên.`}
                    </p>
                    <div className={styles.footerActions}>
                        <button onClick={onClose} className={styles.cancelButton}>
                            Hủy
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={isCreateDisabled}
                            className={styles.createButton}
                        >
                            {isCreating ? "Đang tạo..." : "Tạo nhóm"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
