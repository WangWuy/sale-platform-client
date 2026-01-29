import { useState, useEffect } from 'react';
import apiServer from '@/lib/api';
import { endpoints } from '@/config/env';
import { ApiResponse } from '@/types/api-response.model';

interface User {
    id: number;
    email: string;
    fullName: string;
    phone: string;
    role: number;
    avatarUrl?: string;
}

interface UpdateProfileData {
    fullName: string;
    phone: string;
}

interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user data
    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await apiServer.get<ApiResponse<User>>(endpoints.auth.me);

            if (response.data.success && response.data.data) {
                setUser(response.data.data);
                setError(null);
            }
        } catch (err: any) {
            console.error('Fetch user error:', err);

            // Handle 401 errors (handled by interceptor, but we can add custom logic)
            if (err.response?.status === 401) {
                setUser(null);
            }

            setError(err.response?.data?.message || 'Failed to load user');
        } finally {
            setLoading(false);
        }
    };

    // Update profile
    const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
        try {
            const response = await apiServer.put<ApiResponse<User>>(
                endpoints.users.update(user?.id || 0),
                data
            );

            if (response.data.success && response.data.data) {
                setUser(response.data.data);
                return true;
            }

            return false;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Update failed');
            return false;
        }
    };

    // Change password
    const changePassword = async (data: ChangePasswordData): Promise<boolean> => {
        try {
            const response = await apiServer.post<ApiResponse<any>>(
                '/users/change-password',
                {
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword
                }
            );

            if (response.data.success) {
                return true;
            }

            return false;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Password change failed');
            return false;
        }
    };

    // Upload avatar
    const uploadAvatar = async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await apiServer.post<ApiResponse<{ avatarUrl: string }>>(
                '/users/avatar',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (response.data.success && response.data.data) {
                const avatarUrl = response.data.data.avatarUrl;
                setUser(prev => prev ? { ...prev, avatarUrl } : null);
                return avatarUrl;
            }

            return null;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Upload failed');
            return null;
        }
    };

    return {
        user,
        loading,
        error,
        updateProfile,
        changePassword,
        uploadAvatar,
        refetch: fetchUser
    };
}

interface UserPreferences {
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: 'vi' | 'en';
}

export function useUserPreferences() {
    const [preferences, setPreferences] = useState<UserPreferences>({
        notifications: {
            email: true,
            push: true,
            sms: false
        },
        theme: 'light',
        language: 'vi'
    });
    const [loading, setLoading] = useState(true);

    // Fetch preferences
    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            // Check if user is authenticated by checking for token
            const token = localStorage.getItem('accessToken');
            if (!token) {
                // User not logged in, skip fetching preferences
                setLoading(false);
                return;
            }

            const response = await apiServer.get<ApiResponse<UserPreferences>>(
                '/users/preferences'
            );

            if (response.data.success && response.data.data) {
                setPreferences(response.data.data);
            }
        } catch (err: any) {
            // Silently fail for 400/401 errors (user not authenticated or invalid ID)
            if (err.response?.status === 400 || err.response?.status === 401) {
                console.log('User preferences not available (not authenticated)');
            } else {
                console.error('Failed to fetch preferences:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    // Update preferences
    const updatePreferences = async (data: Partial<UserPreferences>): Promise<boolean> => {
        try {
            const response = await apiServer.put<ApiResponse<UserPreferences>>(
                '/users/preferences',
                data
            );

            if (response.data.success && response.data.data) {
                setPreferences(response.data.data);
                return true;
            }

            return false;
        } catch (err) {
            console.error('Failed to update preferences:', err);
            return false;
        }
    };

    return {
        preferences,
        loading,
        updatePreferences,
        refetch: fetchPreferences
    };
}
