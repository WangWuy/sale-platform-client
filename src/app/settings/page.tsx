'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    User,
    Building,
    Bell,
    Lock,
    Palette,
    Save,
    Loader2,
    Upload,
    CheckCircle,
    AlertCircle,
    DollarSign,
    ChevronRight,
    Eye,
    EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import { useUser, useUserPreferences } from '@/hooks/useUser';
import { useAuth } from '@/providers/AuthProvider';
import { PERMISSIONS } from '@/constants/permissions';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    // Use custom hooks
    const { user, loading: userLoading, error: userError, updateProfile, changePassword, uploadAvatar } = useUser();
    const { preferences, loading: prefsLoading, updatePreferences } = useUserPreferences();
    const { hasPermission } = useAuth();

    // Form states
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email: '',
        phone: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notificationSettings, setNotificationSettings] = useState({
        email: true,
        push: true,
        sms: false
    });

    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: 'light' as 'light' | 'dark' | 'auto',
        language: 'vi' as 'vi' | 'en'
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Sync user data to form
    useEffect(() => {
        if (user) {
            setProfileForm({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    // Sync preferences to form
    useEffect(() => {
        if (preferences) {
            setNotificationSettings(preferences.notifications);
            setAppearanceSettings({
                theme: preferences.theme,
                language: preferences.language
            });
        }
    }, [preferences]);

    // Handle profile save
    const handleSaveProfile = async () => {
        setSaveStatus('saving');
        try {
            const success = await updateProfile({
                fullName: profileForm.fullName,
                phone: profileForm.phone
            });

            if (success) {
                setSaveStatus('success');
                setStatusMessage('Cập nhật thông tin thành công!');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
                setStatusMessage('Cập nhật thất bại');
            }
        } catch (error) {
            setSaveStatus('error');
            setStatusMessage(error instanceof Error ? error.message : 'Có lỗi xảy ra');
        }
    };

    // Handle password change
    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setSaveStatus('error');
            setStatusMessage('Mật khẩu xác nhận không khớp');
            return;
        }

        setSaveStatus('saving');
        try {
            const success = await changePassword(passwordForm);

            if (success) {
                setSaveStatus('success');
                setStatusMessage('Đổi mật khẩu thành công!');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
                setStatusMessage('Đổi mật khẩu thất bại');
            }
        } catch (error) {
            setSaveStatus('error');
            setStatusMessage(error instanceof Error ? error.message : 'Có lỗi xảy ra');
        }
    };

    // Handle preferences save
    const handleSavePreferences = async () => {
        setSaveStatus('saving');
        try {
            const success = await updatePreferences({
                notifications: notificationSettings,
                theme: appearanceSettings.theme,
                language: appearanceSettings.language
            });

            if (success) {
                setSaveStatus('success');
                setStatusMessage('Cập nhật cài đặt thành công!');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
                setStatusMessage('Cập nhật thất bại');
            }
        } catch (error) {
            setSaveStatus('error');
            setStatusMessage(error instanceof Error ? error.message : 'Có lỗi xảy ra');
        }
    };

    // Handle avatar upload
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            setSaveStatus('error');
            setStatusMessage('Kích thước file không được vượt quá 2MB');
            return;
        }

        setSaveStatus('saving');
        try {
            const avatarUrl = await uploadAvatar(file);
            if (avatarUrl) {
                setSaveStatus('success');
                setStatusMessage('Cập nhật ảnh đại diện thành công!');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        } catch (error) {
            setSaveStatus('error');
            setStatusMessage(error instanceof Error ? error.message : 'Upload thất bại');
        }
    };

    // Define all tabs with permission requirements
    const allTabs = [
        { id: 'profile', label: 'Thông tin cá nhân', icon: <User className="w-5 h-5" />, requiresPermission: null },
        { id: 'company', label: 'Thông tin công ty', icon: <Building className="w-5 h-5" />, requiresPermission: PERMISSIONS.SETTINGS.MANAGE },
        { id: 'notifications', label: 'Thông báo', icon: <Bell className="w-5 h-5" />, requiresPermission: null },
        { id: 'security', label: 'Bảo mật', icon: <Lock className="w-5 h-5" />, requiresPermission: null },
        { id: 'appearance', label: 'Giao diện', icon: <Palette className="w-5 h-5" />, requiresPermission: null },
    ];

    // Filter tabs based on permissions
    const tabs = useMemo(() => {
        return allTabs.filter(tab => {
            if (!tab.requiresPermission) return true;
            return hasPermission(tab.requiresPermission);
        });
    }, [hasPermission]);

    // Admin links - only show for users with SETTINGS.MANAGE permission
    const adminLinks = useMemo(() => {
        if (!hasPermission(PERMISSIONS.SETTINGS.MANAGE)) return [];
        return [
            { href: '/settings/pricing', label: 'Cấu hình giá', icon: <DollarSign className="w-5 h-5" /> },
        ];
    }, [hasPermission]);

    if (userLoading || prefsLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
                <p className="text-gray-600 mt-1">Quản lý thông tin và tùy chọn hệ thống</p>
            </div>

            {/* Status Message */}
            {saveStatus !== 'idle' && (
                <div className={`rounded-lg p-4 flex items-center gap-3 ${saveStatus === 'success' ? 'bg-green-50 border border-green-200' :
                    saveStatus === 'error' ? 'bg-red-50 border border-red-200' :
                        'bg-blue-50 border border-blue-200'
                    }`}>
                    {saveStatus === 'saving' && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                    {saveStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {saveStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                    <span className={`font-medium ${saveStatus === 'success' ? 'text-green-700' :
                        saveStatus === 'error' ? 'text-red-700' :
                            'text-blue-700'
                        }`}>
                        {statusMessage || (saveStatus === 'saving' ? 'Đang lưu...' : '')}
                    </span>
                </div>
            )}

            {/* Error Message */}
            {userError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{userError}</p>
                </div>
            )}

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '1rem' }}>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center rounded-lg transition ${activeTab === tab.id
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    style={{ gap: '0.75rem', padding: '0.75rem 1rem' }}
                                >
                                    {tab.icon}
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}

                            {/* Admin Settings Links */}
                            {adminLinks.length > 0 && (
                                <>
                                    <div className="border-t border-gray-200 my-3" />
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Admin</p>
                                    {adminLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="w-full flex items-center justify-between rounded-lg text-gray-600 hover:bg-gray-50 transition"
                                            style={{ gap: '0.75rem', padding: '0.75rem 1rem' }}
                                        >
                                            <div className="flex items-center" style={{ gap: '0.75rem' }}>
                                                {link.icon}
                                                <span className="font-medium">{link.label}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </Link>
                                    ))}
                                </>
                            )}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '2rem' }}>
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900" style={{ marginBottom: '1.5rem' }}>Thông tin cá nhân</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="flex items-center" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                                        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                            {user?.avatarUrl ? (
                                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                profileForm.fullName.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <label className="bg-primary-50 text-primary-600 rounded-lg font-medium hover:bg-primary-100 transition cursor-pointer inline-block" style={{ padding: '0.625rem 1.5rem' }}>
                                                <Upload className="w-4 h-4 inline mr-2" />
                                                Thay đổi ảnh
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleAvatarUpload}
                                                />
                                            </label>
                                            <p className="text-sm text-gray-500" style={{ marginTop: '0.5rem' }}>JPG, PNG tối đa 2MB</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: '0.5rem' }}>
                                                Họ và tên
                                            </label>
                                            <input
                                                type="text"
                                                value={profileForm.fullName}
                                                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                style={{ padding: '0.75rem 1rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: '0.5rem' }}>
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={profileForm.email}
                                                disabled
                                                className="w-full bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                                                style={{ padding: '0.75rem 1rem' }}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: '0.5rem' }}>
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                style={{ padding: '0.75rem 1rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: '0.5rem' }}>
                                                Vai trò
                                            </label>
                                            <input
                                                type="text"
                                                value={user?.role === 1 ? 'Admin' : user?.role === 2 ? 'Manager' : user?.role === 3 ? 'Sales' : 'User'}
                                                disabled
                                                className="w-full bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                                                style={{ padding: '0.75rem 1rem' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end border-t border-gray-200" style={{ gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem' }}>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saveStatus === 'saving'}
                                        className="flex items-center bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                                        style={{ gap: '0.5rem', padding: '0.75rem 2rem' }}
                                    >
                                        {saveStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Company Tab */}
                        {activeTab === 'company' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900" style={{ marginBottom: '1.5rem' }}>Thông tin công ty</h2>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <p className="text-blue-700">Tính năng này đang được phát triển</p>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900" style={{ marginBottom: '1.5rem' }}>Cài đặt thông báo</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {[
                                        { key: 'email', label: 'Thông báo qua Email', description: 'Nhận thông báo về báo giá mới, đơn hàng' },
                                        { key: 'push', label: 'Thông báo đẩy', description: 'Nhận thông báo trên trình duyệt' },
                                        { key: 'sms', label: 'Thông báo SMS', description: 'Nhận tin nhắn về giao dịch quan trọng' },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between bg-gray-50 rounded-lg" style={{ padding: '1rem' }}>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.label}</p>
                                                <p className="text-sm text-gray-500">{item.description}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                                                    onChange={(e) => setNotificationSettings({
                                                        ...notificationSettings,
                                                        [item.key]: e.target.checked
                                                    })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end border-t border-gray-200" style={{ gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem' }}>
                                    <button
                                        onClick={handleSavePreferences}
                                        disabled={saveStatus === 'saving'}
                                        className="flex items-center bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                                        style={{ gap: '0.5rem', padding: '0.75rem 2rem' }}
                                    >
                                        {saveStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900" style={{ marginBottom: '1.5rem' }}>Bảo mật</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <h3 className="font-semibold text-gray-900" style={{ marginBottom: '1rem' }}>Đổi mật khẩu</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: '0.5rem' }}>Mật khẩu hiện tại</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.current ? 'text' : 'password'}
                                                        value={passwordForm.currentPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                        style={{ padding: '0.75rem 3rem 0.75rem 1rem' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                                    >
                                                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: '0.5rem' }}>Mật khẩu mới</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.new ? 'text' : 'password'}
                                                        value={passwordForm.newPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                        style={{ padding: '0.75rem 3rem 0.75rem 1rem' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                                    >
                                                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: '0.5rem' }}>Xác nhận mật khẩu mới</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.confirm ? 'text' : 'password'}
                                                        value={passwordForm.confirmPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                        style={{ padding: '0.75rem 3rem 0.75rem 1rem' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                                    >
                                                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end border-t border-gray-200" style={{ gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem' }}>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={saveStatus === 'saving'}
                                        className="flex items-center bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                                        style={{ gap: '0.5rem', padding: '0.75rem 2rem' }}
                                    >
                                        {saveStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Đổi mật khẩu
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Appearance Tab */}
                        {activeTab === 'appearance' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900" style={{ marginBottom: '1.5rem' }}>Giao diện</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: '1rem' }}>Chủ đề</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {(['light', 'dark', 'auto'] as const).map((theme) => (
                                                <button
                                                    key={theme}
                                                    onClick={() => setAppearanceSettings({ ...appearanceSettings, theme })}
                                                    className={`rounded-lg border-2 transition ${appearanceSettings.theme === theme
                                                        ? 'border-primary-500 bg-primary-50'
                                                        : 'border-gray-200 hover:border-primary-300'
                                                        }`}
                                                    style={{ padding: '1rem' }}
                                                >
                                                    <p className="font-medium text-gray-900 capitalize">{theme}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: '0.5rem' }}>Ngôn ngữ</label>
                                        <select
                                            value={appearanceSettings.language}
                                            onChange={(e) => setAppearanceSettings({ ...appearanceSettings, language: e.target.value as 'vi' | 'en' })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            style={{ padding: '0.75rem 1rem' }}
                                        >
                                            <option value="vi">Tiếng Việt</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end border-t border-gray-200" style={{ gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem' }}>
                                    <button
                                        onClick={handleSavePreferences}
                                        disabled={saveStatus === 'saving'}
                                        className="flex items-center bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                                        style={{ gap: '0.5rem', padding: '0.75rem 2rem' }}
                                    >
                                        {saveStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
