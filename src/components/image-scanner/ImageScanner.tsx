'use client';

import { useState, useRef, useCallback } from 'react';
import { imageMatchingService, UploadResponse, ScanResponse, ExtractedAttributes } from '@/services/image-matching.service';
import { Product } from '@/types/product';
import { smartCompress, formatFileSize, CompressionResult } from '@/utils/image-utils';

// ============================================
// Image Scanner Component
// Direct Base64 Scan (Optimized)
// ============================================

interface ImageScannerProps {
    onProductsFound?: (products: Product[], attributes: ExtractedAttributes | null) => void;
    onUploadComplete?: (uploadResult: UploadResponse) => void;
    onScanComplete?: (scanResult: ScanResponse) => void;
    className?: string;
}

type ScanStep = 'idle' | 'uploading' | 'uploaded' | 'scanning' | 'completed' | 'error';

export function ImageScanner({
    onProductsFound,
    onUploadComplete,
    onScanComplete,
    className = '',
}: ImageScannerProps) {
    // State
    const [step, setStep] = useState<ScanStep>('idle');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
    const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state
    const resetState = useCallback(() => {
        setStep('idle');
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadResult(null);
        setScanResult(null);
        setError(null);
        setCompressionInfo(null);
    }, []);

    // Handle file selection
    const handleFileSelect = useCallback((file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Vui lòng chọn file ảnh (jpg, png, gif, webp)');
            return;
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('Kích thước ảnh tối đa là 10MB');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
        setStep('idle');
        setScanResult(null);
        setUploadResult(null);
    }, []);

    // Handle file input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    // Handle drag & drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    // 🔵 BUTTON 1: Upload to S3
    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Vui lòng chọn ảnh trước');
            return;
        }

        try {
            setStep('uploading');
            setError(null);

            const result = await imageMatchingService.uploadImage(selectedFile, 'ai-scan');
            setUploadResult(result);
            setStep('uploaded');

            if (onUploadComplete) {
                onUploadComplete(result);
            }
        } catch (err: any) {
            setError(err.message || 'Upload thất bại');
            setStep('error');
        }
    };

    // 🟢 BUTTON 2: Scan with AI
    const handleScan = async () => {
        if (!uploadResult?.id) {
            setError('Vui lòng upload ảnh trước');
            return;
        }

        try {
            setStep('scanning');
            setError(null);

            const result = await imageMatchingService.scanImage(uploadResult.id);
            setScanResult(result);
            setStep('completed');

            if (onScanComplete) {
                onScanComplete(result);
            }

            if (onProductsFound && result.matchingProducts) {
                onProductsFound(result.matchingProducts, result.extractedAttributes);
            }
        } catch (err: any) {
            setError(err.message || 'Scan thất bại');
            setStep('error');
        }
    };

    // 🟡 Direct Scan - Smart Compression
    const handleDirectScan = async () => {
        if (!selectedFile) {
            setError('Vui lòng chọn ảnh trước');
            return;
        }

        try {
            setStep('scanning');
            setError(null);

            // Smart compression with adaptive quality
            const compression = await smartCompress(selectedFile);
            setCompressionInfo(compression);

            // Call direct scan API
            const result = await imageMatchingService.scanBase64(compression.dataUrl);
            setScanResult(result);
            setStep('completed');

            if (onScanComplete) {
                onScanComplete(result);
            }

            if (onProductsFound && result.matchingProducts) {
                onProductsFound(result.matchingProducts, result.extractedAttributes);
            }
        } catch (err: any) {
            setError(err.message || 'Scan trực tiếp thất bại');
            setStep('error');
        }
    };

    // Render extracted attributes
    const renderAttributes = (attrs: ExtractedAttributes) => (
        <div className="grid grid-cols-2 gap-2 text-sm">
            {attrs.category && (
                <div className="flex items-center gap-2">
                    <span className="text-gray-500">Loại:</span>
                    <span className="font-medium capitalize">{attrs.category}</span>
                </div>
            )}
            {attrs.material && (
                <div className="flex items-center gap-2">
                    <span className="text-gray-500">Chất liệu:</span>
                    <span className="font-medium capitalize">{attrs.material}</span>
                </div>
            )}
            {attrs.color && (
                <div className="flex items-center gap-2">
                    <span className="text-gray-500">Màu:</span>
                    <span className="font-medium capitalize">{attrs.color}</span>
                </div>
            )}
            {attrs.style && (
                <div className="flex items-center gap-2">
                    <span className="text-gray-500">Phong cách:</span>
                    <span className="font-medium capitalize">{attrs.style}</span>
                </div>
            )}
            {attrs.confidence !== undefined && (
                <div className="flex items-center gap-2 col-span-2">
                    <span className="text-gray-500">Độ tin cậy:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${attrs.confidence * 100}%` }}
                        />
                    </div>
                    <span className="font-medium">{Math.round(attrs.confidence * 100)}%</span>
                </div>
            )}
            {attrs.rawDescription && (
                <div className="col-span-2 mt-2 p-2 bg-gray-50 rounded">
                    <span className="text-gray-500 text-xs">AI mô tả:</span>
                    <p className="text-sm">{attrs.rawDescription}</p>
                </div>
            )}
        </div>
    );

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    AI Image Scanner
                </h3>
                <p className="text-white/80 text-sm mt-1">
                    Tìm sản phẩm tương tự bằng AI Vision
                </p>
            </div>

            <div className="p-6">
                {/* Drop Zone */}
                <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver
                        ? 'border-blue-500 bg-blue-50'
                        : previewUrl
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                        }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    {previewUrl ? (
                        <div className="relative">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-h-64 mx-auto rounded-lg shadow-md"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    resetState();
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            {selectedFile && (
                                <div className="mt-3 space-y-1.5">
                                    <p className="text-sm text-gray-600">
                                        📁 {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                    </p>
                                    {compressionInfo && (
                                        <div className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded border border-green-200">
                                            ✅ Compressed: {formatFileSize(compressionInfo.compressedSize)} •
                                            {compressionInfo.format.toUpperCase()} •
                                            Quality {(compressionInfo.quality * 100).toFixed(0)}% •
                                            Saved {compressionInfo.compressionRatio.toFixed(1)}%
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-8">
                            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-4 text-gray-600 font-medium">
                                Kéo thả ảnh hoặc click để chọn
                            </p>
                            <p className="mt-1 text-gray-400 text-sm">
                                Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 10MB)
                            </p>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                    {/* 🔵 Button 1: Upload S3 */}
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || step === 'uploading' || step === 'uploaded'}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${!selectedFile || step === 'uploading'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : step === 'uploaded'
                                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                            }`}
                    >
                        {step === 'uploading' ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Đang upload...
                            </>
                        ) : step === 'uploaded' ? (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Đã upload
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                1. Upload S3
                            </>
                        )}
                    </button>

                    {/* 🟢 Button 2: Scan AI */}
                    <button
                        onClick={handleScan}
                        disabled={!uploadResult || step === 'scanning'}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${!uploadResult || step === 'scanning'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : step === 'completed'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg'
                            }`}
                    >
                        {step === 'scanning' ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                AI đang phân tích...
                            </>
                        ) : step === 'completed' ? (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Scan hoàn tất!
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                2. Scan AI
                            </>
                        )}
                    </button>
                </div>

                {/* 🟡 Button 3: Direct Scan (TEST) */}
                <div className="mt-3">
                    <button
                        onClick={handleDirectScan}
                        disabled={!selectedFile || step === 'scanning'}
                        className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border-2 ${!selectedFile || step === 'scanning'
                            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-amber-50 text-amber-700 border-amber-400 hover:bg-amber-100 hover:border-amber-500'
                            }`}
                    >
                        {step === 'scanning' ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Đang scan...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                ⚡ Scan trực tiếp
                            </>
                        )}
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-1">
                        Gửi ảnh trực tiếp đến AI mà không lưu lên S3
                    </p>
                </div>

                {/* Upload Result Info */}
                {uploadResult && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                        <div className="flex items-center gap-2 text-blue-700 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Đã lưu lên S3
                        </div>
                        <p className="mt-1 text-blue-600 text-xs truncate">
                            ID: {uploadResult.id}
                        </p>
                    </div>
                )}

                {/* Scan Results */}
                {scanResult && (
                    <div className="mt-6 space-y-4">
                        {/* Simulation Warning */}
                        {scanResult.isSimulation && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm flex items-start gap-2">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <p className="font-medium">Chế độ Simulation</p>
                                    <p className="text-xs mt-0.5">Thêm OPENAI_API_KEY để kích hoạt AI thực</p>
                                </div>
                            </div>
                        )}

                        {/* Extracted Attributes */}
                        {scanResult.extractedAttributes && (
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                                <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    AI nhận dạng
                                </h4>
                                {renderAttributes(scanResult.extractedAttributes)}
                            </div>
                        )}

                        {/* Matching Products */}
                        {scanResult.matchingProducts && scanResult.matchingProducts.length > 0 && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Tìm thấy {scanResult.totalMatches} sản phẩm
                                </h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {scanResult.matchingProducts.slice(0, 5).map((product: Product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                                                {product.code?.slice(0, 3)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                                <p className="text-sm text-gray-500">{product.code}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">
                                                    {new Intl.NumberFormat('vi-VN').format(product.currentPrice)}đ
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Processing Time & Cache Info */}
                        <div className="flex items-center justify-center gap-3 text-xs">
                            {scanResult.processingTimeMs && (
                                <span className="text-gray-400">
                                    ⏱️ {(scanResult.processingTimeMs / 1000).toFixed(2)}s
                                </span>
                            )}
                            {(scanResult as any).cacheHit && (
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200">
                                    💾 Cache
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageScanner;
