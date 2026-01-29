'use client';

import { useState, useCallback } from 'react';
import userService, { UserListParams, UserStatistics } from '@/services/user.service';
import { User, UserStatus } from '@/types/user';

interface UseUsersReturn {
    users: User[];
    total: number;
    statistics: UserStatistics | null;
    loading: boolean;
    error: string | null;
    fetchUsers: (params?: UserListParams) => Promise<void>;
    getAllUsers: () => Promise<User[]>;
    getUserById: (id: number) => Promise<User | null>;
    getStatistics: () => Promise<void>;
    createUser: (data: any) => Promise<User | null>;
    updateUser: (id: number, data: any) => Promise<User | null>;
    deleteUser: (id: number) => Promise<boolean>;
    bulkDelete: (userIds: number[]) => Promise<boolean>;
    bulkUpdateStatus: (userIds: number[], status: UserStatus) => Promise<boolean>;
    exportUsers: (params?: UserListParams) => Promise<void>;
    downloadImportTemplate: () => Promise<void>;
    previewImport: (file: File) => Promise<any>;
    importUsers: (file: File) => Promise<any>;
}

export function useUsers(): UseUsersReturn {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [statistics, setStatistics] = useState<UserStatistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async (params?: UserListParams) => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.getUsersPaginated(params);
            console.log('📊 Users Response:', response);

            setUsers(response.users || []);
            setTotal(response.total || 0);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
            setError(errorMessage);
            console.error('❌ Fetch users error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createUser = useCallback(async (data: any): Promise<User | null> => {
        setLoading(true);
        setError(null);

        try {
            const newUser = await userService.createUser(data);
            if (newUser) {
                setUsers(prev => [newUser, ...prev]);
                setTotal(prev => prev + 1);
            }
            return newUser;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
            setError(errorMessage);
            console.error('Create user error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUser = useCallback(async (id: number, data: any): Promise<User | null> => {
        setLoading(true);
        setError(null);

        try {
            const updatedUser = await userService.updateUser(id, data);
            if (updatedUser) {
                setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
            }
            return updatedUser;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
            setError(errorMessage);
            console.error('Update user error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteUser = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const success = await userService.deleteUser(id);
            if (success) {
                setUsers(prev => prev.filter(u => u.id !== id));
                setTotal(prev => prev - 1);
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
            setError(errorMessage);
            console.error('Delete user error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const getStatistics = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const stats = await userService.getStatistics();
            if (stats) {
                setStatistics(stats);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get statistics';
            setError(errorMessage);
            console.error('❌ Get statistics error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const bulkDelete = useCallback(async (userIds: number[]): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const success = await userService.bulkDelete(userIds);
            if (success) {
                setUsers(prev => prev.filter(u => !userIds.includes(u.id)));
                setTotal(prev => prev - userIds.length);
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to bulk delete';
            setError(errorMessage);
            console.error('❌ Bulk delete error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const bulkUpdateStatus = useCallback(async (userIds: number[], status: UserStatus): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const success = await userService.bulkUpdateStatus({ userIds, status });
            if (success) {
                setUsers(prev => prev.map(u =>
                    userIds.includes(u.id) ? { ...u, status } : u
                ));
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update status';
            setError(errorMessage);
            console.error('❌ Bulk update status error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const exportUsers = useCallback(async (params?: UserListParams) => {
        setLoading(true);
        setError(null);

        try {
            const blob = await userService.exportUsers(params);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `users_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to export users';
            setError(errorMessage);
            console.error('❌ Export users error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const importUsers = useCallback(async (file: File): Promise<any> => {
        setLoading(true);
        setError(null);

        try {
            const result = await userService.importUsers(file);
            // Refresh user list after import
            await fetchUsers();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to import users';
            setError(errorMessage);
            console.error('❌ Import users error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchUsers]);

    const getAllUsers = useCallback(async (): Promise<User[]> => {
        setLoading(true);
        setError(null);

        try {
            const allUsers = await userService.getAllUsers();
            return allUsers;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get all users';
            setError(errorMessage);
            console.error('❌ Get all users error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getUserById = useCallback(async (id: number): Promise<User | null> => {
        setLoading(true);
        setError(null);

        try {
            const user = await userService.getUserById(id);
            return user;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get user';
            setError(errorMessage);
            console.error('❌ Get user error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const downloadImportTemplate = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const blob = await userService.downloadImportTemplate();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'user_import_template.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to download template';
            setError(errorMessage);
            console.error('❌ Download template error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const previewImport = useCallback(async (file: File): Promise<any> => {
        setLoading(true);
        setError(null);

        try {
            const result = await userService.previewImport(file);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to preview import';
            setError(errorMessage);
            console.error('❌ Preview import error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        users,
        total,
        statistics,
        loading,
        error,
        fetchUsers,
        getAllUsers,
        getUserById,
        getStatistics,
        createUser,
        updateUser,
        deleteUser,
        bulkDelete,
        bulkUpdateStatus,
        exportUsers,
        downloadImportTemplate,
        previewImport,
        importUsers
    };
}
