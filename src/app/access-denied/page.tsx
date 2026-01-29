'use client';

import Link from 'next/link';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

export default function AccessDeniedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="text-center px-6">
                {/* Icon */}
                <div className="mx-auto w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
                    <ShieldX className="w-12 h-12 text-red-500" />
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-white mb-4">
                    Truy cập bị từ chối
                </h1>

                {/* Description */}
                <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                    Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên
                    nếu bạn cho rằng đây là một sự nhầm lẫn.
                </p>

                {/* Error Code */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-8">
                    <span>Mã lỗi:</span>
                    <span className="font-mono">403 Forbidden</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-700/50 hover:bg-gray-700 text-white font-medium transition-all duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại
                    </button>

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium transition-all duration-200 shadow-lg shadow-primary-500/25"
                    >
                        <Home className="w-5 h-5" />
                        Về trang chủ
                    </Link>
                </div>

                {/* Decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
}
