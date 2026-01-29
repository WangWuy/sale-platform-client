'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import authService from '@/services/auth.service';
import { useAuth } from '@/providers/AuthProvider';
import styles from './login.module.scss';

export default function LoginPage() {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        identifier: '',  // Email hoặc số điện thoại
        password: '',
        remember: false
    });
    const [error, setError] = useState('');

    // Load remembered credentials on mount
    useEffect(() => {
        const rememberedIdentifier = authService.getRememberedIdentifier();
        const rememberedPassword = authService.getRememberedPassword();

        if (rememberedIdentifier) {
            setFormData(prev => ({
                ...prev,
                identifier: rememberedIdentifier,
                password: rememberedPassword || '', // Load password nếu có
                remember: true
            }));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await login(formData.identifier, formData.password);
            if (!success) {
                throw new Error('Đăng nhập thất bại');
            }

            // Handle Remember Me
            if (formData.remember) {
                authService.saveRememberedIdentifier(formData.identifier);
                authService.saveRememberedPassword(formData.password);
            } else {
                authService.clearRememberedCredentials();
            }
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="relative min-h-screen overflow-hidden bg-black">
            <video
                className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster="/login-background-poster.jpg"
                aria-hidden="true"
            >
                <source src="/login-background.webm" type="video/webm" />
                {/* <source src="/login-background.mp4" type="video/mp4" /> */}
            </video>
            <div className="absolute inset-0 bg-black/30" aria-hidden="true" />


            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-md">
                    {/* Logo & Title */}
                    <div className="text-center mb-8 text-white">
                        <Link href="/" className="inline-flex items-center gap-3 mb-6">
                            <div className="w-20 h-20 bg-white/90 rounded-2xl flex items-center justify-center shadow-2xl shadow-black/40 p-2">
                                <Image
                                    src="/logo.png"
                                    alt="Oval Xanh Logo"
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight mb-2 drop-shadow">
                            Oval Xanh
                        </h1>
                        <p className="text-white/80">
                            Hệ thống quản lý báo giá nội thất
                        </p>
                    </div>

                    {/* Login Card - Glassmorphism */}
                    <div className={styles.loginCard}>
                        <div className={styles.header}>
                            <h2>Login</h2>
                            <p>Nhập thông tin tài khoản của bạn để tiếp tục truy cập</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className={styles.errorContainer}>
                                <p>
                                    <span className={styles.dot}></span>
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {/* Email hoặc Số điện thoại */}
                            <div className={styles.formGroup}>
                                <label>Tài khoản</label>
                                <div className={styles.inputWrapper}>
                                    <div className={styles.iconLeft}>
                                        <User />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.identifier}
                                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                        placeholder="Email hoặc số điện thoại"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className={styles.formGroup}>
                                <label>Mật khẩu</label>
                                <div className={`${styles.inputWrapper} ${styles.passwordInput}`}>
                                    <div className={styles.iconLeft}>
                                        <Lock />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={styles.togglePassword}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember & Forgot */}
                            <div className={styles.actions}>
                                <label className={styles.remember}>
                                    <input
                                        type="checkbox"
                                        checked={formData.remember}
                                        onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                    />
                                    <span>Ghi nhớ đăng nhập</span>
                                </label>
                                <Link href="/forgot-password" className={styles.forgotLink}>
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={styles.submitBtn}
                            >
                                {isLoading ? (
                                    <>
                                        <div className={styles.spinner}></div>
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Đăng nhập ngay</span>
                                        <ArrowRight className={styles.arrowIcon} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-sm text-white/70" style={{ marginTop: '2rem' }}>
                        © 2026 Oval Xanh. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
