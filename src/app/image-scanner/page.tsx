'use client';

import { useState } from 'react';
import {
    Camera,
    History,
    Lightbulb,
    Sparkles,
    CheckCircle,
    Clock
} from 'lucide-react';
import ImageScanner from '@/components/image-scanner';
import { ScanResponse, ExtractedAttributes } from '@/services/image-matching.service';
import { Product } from '@/types/product';
import { StatCard } from '@/components/ui/StatCard';
import styles from './image-scanner.module.scss';

// ============================================
// Image Scanner Page
// /image-scanner
// ============================================

export default function ImageScannerPage() {
    const [scanHistory, setScanHistory] = useState<ScanResponse[]>([]);
    const [totalScans, setTotalScans] = useState(0);

    const handleProductsFound = (products: Product[], attributes: ExtractedAttributes | null) => {
        console.log('Products found:', products);
        console.log('Attributes:', attributes);
    };

    const handleScanComplete = (result: ScanResponse) => {
        setScanHistory(prev => [result, ...prev].slice(0, 5)); // Keep last 5
        setTotalScans(prev => prev + 1);
    };

    return (
        <div className={styles.page}>
            {/* Page Header */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <p className={styles.heroKicker}>
                            AI Vision Lab
                        </p>
                        <h1 className={styles.heroTitle}>
                            AI Image Scanner
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Tìm sản phẩm tương tự bằng công nghệ AI Vision
                        </p>
                    </div>
                    <div className={styles.heroBadge}>
                        <span className={styles.heroPulse} />
                        <span>Powered by GPT-4o Vision</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
                <StatCard
                    title="Tổng lượt scan"
                    value={totalScans.toString()}
                    icon={Camera}
                    variant="blue"
                />
                <StatCard
                    title="Scan thành công"
                    value={scanHistory.filter(s => s.totalMatches > 0).length.toString()}
                    icon={CheckCircle}
                    variant="green"
                />
                <StatCard
                    title="Lịch sử gần đây"
                    value={scanHistory.length.toString()}
                    icon={History}
                    variant="purple"
                />
            </div>

            {/* Main Content Grid */}
            <div className={styles.mainGrid}>
                {/* Scanner Component - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <div className={styles.scannerCard}>
                    <ImageScanner
                        onProductsFound={handleProductsFound}
                        onScanComplete={handleScanComplete}
                        className="h-full"
                    />
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className={styles.sidebar}>
                    {/* How it works */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Sparkles className="w-5 h-5 text-primary-600" />
                            Cách sử dụng
                        </h3>
                        <div className={styles.steps}>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    1
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Upload ảnh</p>
                                    <p className="text-gray-500 text-sm">Chọn hoặc kéo thả ảnh sản phẩm</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    2
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Scan với AI Vision</p>
                                    <p className="text-gray-500 text-sm">AI sẽ phân tích và trích xuất thông tin</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    3
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Xem kết quả</p>
                                    <p className="text-gray-500 text-sm">Danh sách sản phẩm tương tự từ database</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scan History */}
                    {scanHistory.length > 0 && (
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                <Clock className="w-5 h-5 text-green-600" />
                                Lịch sử scan
                            </h3>
                            <div className={styles.historyList}>
                                {scanHistory.map((scan, idx) => (
                                    <div key={idx} className={styles.historyItem}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">
                                                {scan.extractedAttributes?.category || 'Sản phẩm'}
                                            </span>
                                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                                {scan.totalMatches} kết quả
                                            </span>
                                        </div>
                                        {scan.extractedAttributes?.confidence && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="bg-green-500 h-1.5 rounded-full transition-all"
                                                        style={{ width: `${scan.extractedAttributes.confidence * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {Math.round(scan.extractedAttributes.confidence * 100)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tips */}
                    <div className={styles.tipsCard}>
                        <h3 className={styles.tipsTitle}>
                            <Lightbulb className="w-5 h-5 text-amber-600" />
                            Mẹo
                        </h3>
                        <ul className={styles.tipsList}>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 font-bold">•</span>
                                Sử dụng ảnh rõ nét, góc nhìn trực diện
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 font-bold">•</span>
                                Tránh ảnh bị mờ hoặc quá tối
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 font-bold">•</span>
                                Ảnh nền đơn giản cho kết quả tốt hơn
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
