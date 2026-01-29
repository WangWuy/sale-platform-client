'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        // Auto redirect to login after 3 seconds
        const timer = setTimeout(() => {
            router.push('/login');
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-blue-700 flex items-center justify-center overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>

            {/* Logo Container */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-8 animate-fadeInScale">
                {/* Logo with animated rings */}
                <div className="relative">
                    {/* Outer ring - ping animation */}
                    <div className="absolute inset-0 w-80 h-80 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                    </div>

                    {/* Middle ring - pulse animation */}
                    <div className="absolute inset-0 w-72 h-72 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                        <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse"></div>
                    </div>

                    {/* Logo - circular, no background box */}
                    <div className="relative w-64 h-64 flex items-center justify-center animate-float">
                        <Image
                            src="/logo.png"
                            alt="Oval Xanh"
                            width={300}
                            height={300}
                            className="object-contain drop-shadow-2xl"
                            priority
                        />
                    </div>
                </div>

                {/* Brand Name */}
                <div className="text-center animate-fadeInUp space-y-2">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
                        OVAL XANH
                    </h1>
                    <p className="text-lg md:text-xl text-green-100 font-medium">
                        Vững vàng giá trị - Gắn kết yêu thương
                    </p>
                </div>

                {/* Loading indicator */}
                <div className="flex gap-2 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>

            {/* Custom animations */}
            <style jsx>{`
                @keyframes fadeInScale {
                    0% {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes fadeInUp {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                .animate-fadeInScale {
                    animation: fadeInScale 0.8s ease-out forwards;
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out forwards;
                }

                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
