'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Calculator,
    Search,
    Upload,
    X,
    AlertCircle,
    Send,
    Save,
    Package,
    Sparkles,
    Zap,
    RotateCcw,
    Clock,
    Trash2
} from 'lucide-react';
import quoteService from '@/services/quote.service';
import productService from '@/services/product.service';
import imageMatchingService from '@/services/image-matching.service';
import materialService from '@/services/material.service';
import { PriceCalculationRequest } from '@/types/quote';
import { ScanResponse, ExtractedAttributes } from '@/services/image-matching.service';
import { Product } from '@/types/product';
import styles from './quote-scanner.module.scss';

export default function QuoteScannerPage() {
    // ============================================
    // Scan History Types & Constants
    // ============================================
    interface ScanHistoryEntry {
        id: string;
        thumbnailBase64: string;  // Small thumbnail for list (100x100)
        fullImageBase64: string;  // Larger image for preview (600x600)
        timestamp: string;        // ISO date
        provider: string;         // 'openai' | 'google'
        topMatchName?: string;    // Best match product name
        topMatchScore?: number;   // Best match score
        totalMatches: number;     // Number of products found
    }

    const HISTORY_STORAGE_KEY = 'quote-scanner-history';
    const MAX_HISTORY_ENTRIES = 10;

    // ============================================
    // State
    // ============================================

    // Image & Scan state
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);
    const [aiProvider, setAiProvider] = useState<'openai' | 'google'>('openai');

    // Scan History state
    const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([]);

    // Product selection state
    const [productSearch, setProductSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Quote calculation state
    const [quantity, setQuantity] = useState(1);
    const [dimensions, setDimensions] = useState({ width: 0, length: 0, height: 0 });
    const [material, setMaterial] = useState('');
    const [materials, setMaterials] = useState<any[]>([]);
    const [priceResult, setPriceResult] = useState<any>(null);

    // Loading state
    const [loading, setLoading] = useState(false);

    // ============================================
    // Load history from localStorage on mount
    // ============================================
    useEffect(() => {
        try {
            const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setScanHistory(parsed);
                }
            }
        } catch (e) {
            console.warn('Failed to load scan history:', e);
        }
    }, []);

    // Fetch materials on mount
    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const data = await materialService.getMaterials();
                setMaterials(data);
            } catch (error) {
                console.error('Failed to fetch materials:', error);
            }
        };
        fetchMaterials();
    }, []);

    // Image upload handler (NO AUTO SCAN)
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64Image = reader.result as string;
                setUploadedImage(base64Image);
                // Reset scan result when new image uploaded
                setScanResult(null);
                setSimilarProducts([]);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        multiple: false,
    });

    const clearImage = () => {
        setUploadedImage(null);
        setScanResult(null);
        setSimilarProducts([]);
    };

    // Product search handler
    const handleProductSearch = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await productService.getProducts({
                search: query,
                limit: 10,
                page: 1
            });
            setSearchResults(response.products || []);
        } catch (error) {
            console.error('Product search failed:', error);
        }
    };

    const handleScanImage = async () => {
        try {
            setLoading(true);

            if (!uploadedImage) {
                alert('⚠️ Vui lòng upload ảnh để scan');
                return;
            }

            // Upload to S3 in background
            imageMatchingService.uploadImage(
                dataURLtoFile(uploadedImage, 'scan-image.jpg')
            ).then(uploadResult => {
                console.log('Image saved to S3:', uploadResult.id);
            }).catch(err => {
                console.warn('Background upload failed:', err);
            });

            // Scan with base64 and selected provider
            const result = await imageMatchingService.scanBase64(uploadedImage, aiProvider);
            setScanResult(result);

            // Save to history (with thumbnail compression)
            await saveToHistory(uploadedImage, result, aiProvider);

            if (result.matchingProducts && result.matchingProducts.length > 0) {
                const matchedProduct = result.matchingProducts[0];
                setSelectedProduct(matchedProduct);
                setSimilarProducts(result.matchingProducts || []);
                setProductSearch(matchedProduct.name);
                alert(`✅ Tìm thấy ${result.totalMatches} sản phẩm bằng ${result.provider || aiProvider}!`);
            } else {
                alert(`⚠️ Không tìm thấy sản phẩm tương tự bằng ${result.provider || aiProvider}. Vui lòng thử AI khác hoặc tìm thủ công.`);
            }
        } catch (error) {
            console.error('Action failed:', error);
            alert('❌ Thao tác thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculatePrice = async () => {
        if (!selectedProduct || quantity <= 0) {
            alert('⚠️ Vui lòng chọn sản phẩm và nhập số lượng');
            return;
        }

        try {
            setLoading(true);
            const request: PriceCalculationRequest = {
                items: [{
                    productId: selectedProduct.id,
                    quantity,
                    dimensions: dimensions.width > 0 ? dimensions : undefined,
                    material: material || undefined
                }]
            };

            const result = await quoteService.calculatePrice(request);
            setPriceResult(result);
        } catch (error) {
            console.error('Calculate price failed:', error);
            alert('❌ Tính giá thất bại');
        } finally {
            setLoading(false);
        }
    };

    // Save quote handler
    const handleSaveQuote = async () => {
        if (!selectedProduct || !priceResult) {
            alert('Vui lòng tính giá trước khi lưu');
            return;
        }

        const customerName = prompt('Nhập tên khách hàng:');
        if (!customerName) return;

        const customerPhone = prompt('Nhập số điện thoại khách hàng:');
        if (!customerPhone) return;

        try {
            setLoading(true);
            const quoteData = {
                customerName,
                customerPhone,
                items: [{
                    productId: selectedProduct.id,
                    productName: selectedProduct.name,
                    productCode: selectedProduct.code,
                    category: selectedProduct.categoryInfo?.name || 'N/A',
                    material: material || 'N/A',
                    dimensions: dimensions.width > 0 ? dimensions : undefined,
                    quantity,
                    unitPrice: priceResult.breakdown.subtotal / quantity,
                    basePrice: priceResult.breakdown.basePrice / quantity,
                }],
                discount: 0,
                notes: `Tính từ AI Scanner: ${quantity} x ${selectedProduct.name}${uploadedImage ? ' (có ảnh upload)' : ''}`,
            };

            await quoteService.createQuote(quoteData);
            alert('✅ Lưu báo giá thành công!');

            // Reset form
            setSelectedProduct(null);
            setProductSearch('');
            setQuantity(1);
            setDimensions({ width: 0, length: 0, height: 0 });
            setMaterial('');
            setPriceResult(null);
            setUploadedImage(null);
            setScanResult(null);
            setSimilarProducts([]);
        } catch (error) {
            console.error('Save quote failed:', error);
            alert('❌ Lưu báo giá thất bại');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getMatchScore = (product: any, index: number) => {
        const rawScore = product?.matchScore ?? product?.similarity ?? product?.score;
        if (typeof rawScore === 'number') {
            return Math.max(0, Math.min(100, Math.round(rawScore <= 1 ? rawScore * 100 : rawScore)));
        }
        return Math.max(70, 92 - index * 6);
    };

    // Helper to get color class based on score (High: 80+, Medium: 50-79, Low: <50)
    const getScoreColorClass = (score: number): string => {
        if (score >= 80) return 'High';
        if (score >= 50) return 'Medium';
        return 'Low';
    };

    // Format relative time
    const formatTimeAgo = (isoDate: string): string => {
        const diff = Date.now() - new Date(isoDate).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;
        const days = Math.floor(hours / 24);
        return `${days} ngày trước`;
    };

    // Helper to convert data URL to File
    const dataURLtoFile = (dataurl: string, filename: string): File => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    // ============================================
    // Scan History Helper Functions
    // ============================================

    // Compress image to thumbnail for localStorage
    const compressThumbnail = (dataUrl: string, maxSize = 100, quality = 0.6): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = Math.min(maxSize / img.width, maxSize / img.height);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = dataUrl;
        });
    };

    // Save scan result to history
    const saveToHistory = async (
        imageBase64: string,
        result: ScanResponse,
        provider: string
    ) => {
        try {
            // Create small thumbnail for list display
            const thumbnail = await compressThumbnail(imageBase64, 100, 0.6);
            // Create larger image for preview when loading (600x600, quality 0.8)
            const fullImage = await compressThumbnail(imageBase64, 600, 0.8);
            const topMatch = result.matchingProducts?.[0];

            const newEntry: ScanHistoryEntry = {
                id: crypto.randomUUID(),
                thumbnailBase64: thumbnail,
                fullImageBase64: fullImage,
                timestamp: new Date().toISOString(),
                provider,
                topMatchName: topMatch?.name,
                topMatchScore: topMatch?.matchScore,
                totalMatches: result.totalMatches || 0,
            };

            const updatedHistory = [newEntry, ...scanHistory].slice(0, MAX_HISTORY_ENTRIES);
            setScanHistory(updatedHistory);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
        } catch (e) {
            console.warn('Failed to save to history:', e);
        }
    };

    // Load from history entry (restore full image, can rescan)
    const loadFromHistory = (entry: ScanHistoryEntry) => {
        setUploadedImage(entry.fullImageBase64);
        setScanResult(null);
        setSimilarProducts([]);
        setAiProvider(entry.provider as 'openai' | 'google');
    };

    // Clear all history
    const clearHistory = () => {
        setScanHistory([]);
        localStorage.removeItem(HISTORY_STORAGE_KEY);
    };

    const showInlineScan = uploadedImage && !scanResult;
    const canCalculate = Boolean(selectedProduct && quantity > 0);

    return (
        <div className={styles.page}>
            {/* Main Content Grid */}
            <div className={styles.contentGrid}>
                {/* Left Column: Input Form */}
                <div className={styles.leftColumn}>
                    {/* AI Provider Switch */}
                    <div className={`${styles.card} ${styles.aiCard}`}>
                        <div className={styles.aiHeader}>
                            <div className={styles.aiTitle}>
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                Công nghệ AI
                            </div>
                            <div className={styles.aiPills}>
                                <button
                                    className={`${styles.aiPill} ${aiProvider === 'openai' ? styles.aiPillActive : ''}`}
                                    onClick={() => setAiProvider('openai')}
                                >
                                    <Zap className="w-3.5 h-3.5" />
                                    OpenAI
                                </button>
                                <button
                                    className={`${styles.aiPill} ${aiProvider === 'google' ? styles.aiPillActive : ''}`}
                                    onClick={() => setAiProvider('google')}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Gemini
                                </button>
                            </div>
                        </div>
                        <p className={styles.aiHint}>
                            {aiProvider === 'openai'
                                ? 'Ưu tiên độ chính xác, chi tiết vật liệu tốt.'
                                : 'Phản hồi nhanh, phù hợp scan nhiều ảnh.'}
                        </p>
                    </div>

                    {/* Image Upload (Optional) */}
                    <div className={styles.card}>
                        <h2 className={styles.sectionTitle}>
                            <Upload className="w-5 h-5" />
                            Upload Ảnh (Tùy chọn)
                        </h2>

                        {!uploadedImage ? (
                            <div
                                {...getRootProps()}
                                className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : styles.dropzoneIdle}`}
                            >
                                <input {...getInputProps()} />
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className={styles.dropzoneTitle}>
                                    {isDragActive ? 'Thả ảnh vào đây...' : 'Kéo thả ảnh vào đây'}
                                </p>
                                <p className={styles.dropzoneHint}>
                                    hoặc <span className={styles.dropzoneHintStrong}>chọn file từ máy</span>
                                </p>
                                <p className={styles.dropzoneNote}>PNG, JPG, GIF (tối đa 10MB)</p>
                            </div>
                        ) : (
                            <div className={styles.imagePreview}>
                                <img
                                    src={uploadedImage}
                                    alt="Uploaded"
                                    className={styles.previewImage}
                                />

                                {/* Scanning Animation Overlay */}
                                {loading && (
                                    <div className={styles.scanningOverlay}>
                                        <div className={styles.scanningText}>
                                            <Sparkles className="w-4 h-4 inline mr-2 animate-pulse" />
                                            AI đang phân tích...
                                        </div>
                                    </div>
                                )}

                                {!loading && (
                                    <button
                                        onClick={clearImage}
                                        className={styles.clearButton}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}

                        {showInlineScan && (
                            <button
                                onClick={handleScanImage}
                                disabled={loading}
                                className={`${styles.primaryButton} ${styles.inlineScanButton}`}
                            >
                                <Sparkles className="w-5 h-5" />
                                {loading ? 'Đang scan...' : 'Scan ảnh'}
                            </button>
                        )}
                    </div>

                    {/* Product Search */}
                    <div className={`${styles.card} ${styles.historySticky}`}>
                        <h2 className={styles.sectionTitle}>Thông tin sản phẩm</h2>

                        <div className={styles.formGrid}>
                            <div className={styles.field}>
                                <label className={styles.label}>Tìm sản phẩm</label>
                                <div className={styles.searchWrapper}>
                                    <Search className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => {
                                            setProductSearch(e.target.value);
                                            handleProductSearch(e.target.value);
                                        }}
                                        placeholder="Nhập tên sản phẩm..."
                                        className={`${styles.input} ${styles.searchInput}`}
                                    />
                                </div>

                                {/* Product Dropdown */}
                                {searchResults.length > 0 && (
                                    <div className={styles.dropdown}>
                                        {searchResults.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setProductSearch(product.name);
                                                    setSearchResults([]);
                                                }}
                                                className={styles.dropdownItem}
                                            >
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                <p className="text-sm text-gray-500">{product.code}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {selectedProduct && (
                                    <div className={styles.selectedNotice}>
                                        <p>
                                            ✓ Đã chọn: <span className="font-medium">{selectedProduct.name}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className={styles.detailGrid}>
                                <div className={styles.field}>
                                    <label className={`${styles.label} ${styles.labelRow}`}>
                                        Số lượng
                                        <span
                                            className={styles.tooltip}
                                            data-tooltip="Số lượng dưới 8 sẽ áp dụng giá lẻ"
                                            title="Số lượng dưới 8 sẽ áp dụng giá lẻ"
                                        >
                                            <AlertCircle className={styles.tooltipIcon} />
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        min="1"
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Vật liệu</label>
                                    <select
                                        value={material}
                                        onChange={(e) => setMaterial(e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="">-- Chọn vật liệu --</option>
                                        {materials.map((mat) => (
                                            <option key={mat.id} value={mat.name}>
                                                {mat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Kích thước (cm)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Dài"
                                            value={dimensions.length || ''}
                                            onChange={(e) => setDimensions({ ...dimensions, length: Number(e.target.value) })}
                                            className={styles.input}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Rộng"
                                            value={dimensions.width || ''}
                                            onChange={(e) => setDimensions({ ...dimensions, width: Number(e.target.value) })}
                                            className={styles.input}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Cao"
                                            value={dimensions.height || ''}
                                            onChange={(e) => setDimensions({ ...dimensions, height: Number(e.target.value) })}
                                            className={styles.input}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.cardActions}>
                            <button
                                onClick={handleCalculatePrice}
                                disabled={loading || !canCalculate}
                                className={`${styles.primaryButton} ${styles.actionButton}`}
                            >
                                <Calculator className="w-5 h-5" />
                                {loading ? 'Đang tính...' : 'Tính giá'}
                            </button>
                            {scanResult && (
                                <button
                                    onClick={handleScanImage}
                                    disabled={loading || !uploadedImage}
                                    className={`${styles.primaryButton} ${styles.actionButton}`}
                                    title="Scan lại"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Scan lại
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Similar Products */}
                    {similarProducts.length > 0 && (
                        <div className={styles.card}>
                            <div className={styles.similarHeader}>
                                <Search className="w-5 h-5 text-gray-600" />
                                <h2 className={styles.similarTitle}>Sản phẩm tương tự</h2>
                                <span className={styles.scanBadgeMuted}>
                                    {similarProducts.length} sản phẩm
                                </span>
                            </div>

                            <div className={styles.similarGrid}>
                                {similarProducts.map((product, index) => {
                                    const matchScore = getMatchScore(product, index);
                                    const colorClass = getScoreColorClass(matchScore);
                                    const isSelected = selectedProduct?.id === product.id;

                                    return (
                                        <button
                                            key={product.id}
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setProductSearch(product.name);
                                            }}
                                            className={`${styles.productCardWithScore} ${isSelected ? styles.productCardSelected : ''} ${index === 0 ? styles.topMatchCard : ''}`}
                                        >
                                            {/* Top Match Badge */}
                                            {index === 0 && (
                                                <span className={styles.topMatchBadge}>🏆 Best Match</span>
                                            )}

                                            {/* Score Badge */}
                                            <div className={styles.productScoreBadge}>
                                                <span className={`${styles.matchScoreBadge} ${styles[`matchScore${colorClass}`]}`}>
                                                    {matchScore}%
                                                </span>
                                            </div>

                                            {/* Product Image */}
                                            <div className={styles.productThumb}>
                                                {product.images?.[0] ? (
                                                    <img
                                                        src={product.images[0].thumbnailUrl || product.images[0].imageUrl}
                                                        alt={product.name}
                                                    />
                                                ) : (
                                                    <Package className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className={styles.productInfo}>
                                                <p className={styles.productName}>{product.name}</p>
                                                <p className={styles.productMeta}>
                                                    {product.code}
                                                </p>
                                                <p className={styles.productPrice}>
                                                    {formatCurrency(product.currentPrice ?? product.basePrice)}
                                                </p>
                                            </div>

                                            {/* Match Bar */}
                                            <div className={styles.matchMeta}>
                                                <div className={styles.matchBar}>
                                                    <div
                                                        className={styles[`matchFill${colorClass}`]}
                                                        style={{ width: `${matchScore}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Results */}
                <div className={styles.rightColumn}>
                    {/* Scan Results */}
                    {scanResult && (
                        <div className={`${styles.card} ${styles.scanCard}`}>
                            <div className={styles.scanHeader}>
                                <div>
                                    <p className={styles.scanEyebrow}>AI Scan</p>
                                    <h2 className={styles.scanTitle}>
                                        <Sparkles className="w-5 h-5 text-purple-600" />
                                        Kết quả phân tích
                                    </h2>
                                </div>
                                <div className={styles.scanMeta}>
                                    {scanResult.provider && (
                                        <span className={styles.scanBadge}>
                                            {scanResult.provider.toUpperCase()}
                                        </span>
                                    )}
                                    {scanResult.processingTimeMs && (
                                        <span className={styles.scanBadgeMuted}>
                                            {Math.round(scanResult.processingTimeMs / 100) / 10}s
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Comparison View: Uploaded vs Best Match */}
                            {uploadedImage && scanResult.matchingProducts && scanResult.matchingProducts.length > 0 && (
                                <div className={styles.comparisonGrid}>
                                    {/* Uploaded Image */}
                                    <div>
                                        <p className={styles.scanStatLabel} style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
                                            Ảnh tải lên
                                        </p>
                                        <img
                                            src={uploadedImage}
                                            alt="Uploaded"
                                            className={styles.comparisonImage}
                                        />
                                    </div>

                                    {/* Arrow with Score */}
                                    <div className={styles.comparisonArrow}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                        <span className={`${styles.matchScoreBadge} ${styles[`matchScore${getScoreColorClass(getMatchScore(scanResult.matchingProducts[0], 0))}`]}`}>
                                            {getMatchScore(scanResult.matchingProducts[0], 0)}%
                                        </span>
                                    </div>

                                    {/* Best Match Product */}
                                    <div>
                                        <p className={styles.scanStatLabel} style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
                                            🏆 Best Match
                                        </p>
                                        {scanResult.matchingProducts[0].images?.[0] ? (
                                            <img
                                                src={scanResult.matchingProducts[0].images[0].thumbnailUrl || scanResult.matchingProducts[0].images[0].imageUrl}
                                                alt={scanResult.matchingProducts[0].name}
                                                className={styles.comparisonImage}
                                            />
                                        ) : (
                                            <div className={`${styles.comparisonImage} flex items-center justify-center bg-gray-100`}>
                                                <Package className="w-10 h-10 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className={styles.scanSummary}>
                                <div className={styles.scanStat}>
                                    <span className={styles.scanStatLabel}>Sản phẩm khớp</span>
                                    <span className={styles.scanStatValue}>{scanResult.totalMatches}</span>
                                </div>
                                <div className={styles.scanStat}>
                                    <span className={styles.scanStatLabel}>Best Match</span>
                                    <span className={styles.scanStatValue}>
                                        {scanResult.matchingProducts?.[0]
                                            ? `${getMatchScore(scanResult.matchingProducts[0], 0)}%`
                                            : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {scanResult.extractedAttributes && (
                                <div className={styles.scanAttributes}>
                                    {scanResult.extractedAttributes.category && (
                                        <div className={styles.attributeItem}>
                                            <span className={styles.attributeLabel}>Loại</span>
                                            <span className={styles.attributeValue}>
                                                {scanResult.extractedAttributes.category}
                                            </span>
                                        </div>
                                    )}
                                    {scanResult.extractedAttributes.material && (
                                        <div className={styles.attributeItem}>
                                            <span className={styles.attributeLabel}>Chất liệu</span>
                                            <span className={styles.attributeValue}>
                                                {scanResult.extractedAttributes.material}
                                            </span>
                                        </div>
                                    )}
                                    {scanResult.extractedAttributes.color && (
                                        <div className={styles.attributeItem}>
                                            <span className={styles.attributeLabel}>Màu</span>
                                            <span className={styles.attributeValue}>
                                                {scanResult.extractedAttributes.color}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {scanResult.extractedAttributes?.confidence !== undefined && (
                                <div className={styles.confidenceBlock}>
                                    <div className={styles.confidenceHeader}>
                                        <span className={styles.confidenceLabel}>Độ tin cậy</span>
                                        <span className={styles.confidenceValue}>
                                            {Math.round(scanResult.extractedAttributes.confidence * 100)}%
                                        </span>
                                    </div>
                                    <div className={styles.confidenceBar}>
                                        <div
                                            className={styles.confidenceFill}
                                            style={{ width: `${scanResult.extractedAttributes.confidence * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {scanResult.message && (
                                <div className={styles.scanNote}>{scanResult.message}</div>
                            )}
                        </div>
                    )}

                    {/* Price Result */}
                    <div className={`${styles.card} ${styles.priceCard}`}>
                        <h2 className={styles.sectionTitle}>Kết quả báo giá</h2>

                        {!priceResult ? (
                            <div className={styles.emptyState}>
                                <Calculator className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p>Chọn sản phẩm và nhấn "Tính giá"</p>
                            </div>
                        ) : (
                            <div className={styles.formGrid}>
                                {/* Product Info */}
                                {selectedProduct && (
                                    <div className="flex gap-4">
                                        {selectedProduct.images?.[0] && (
                                            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                <img
                                                    src={selectedProduct.images[0].thumbnailUrl || selectedProduct.images[0].imageUrl}
                                                    alt={selectedProduct.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{selectedProduct.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{selectedProduct.categoryInfo?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.priceBlock}>
                                    {/* Details */}
                                    <div className={styles.priceRow}>
                                        <span>Chất liệu:</span>
                                        <span className={styles.priceValue}>{material || 'Mặc định'}</span>
                                    </div>
                                    <div className={styles.priceRow}>
                                        <span>Số lượng:</span>
                                        <span className={styles.priceValue}>{quantity} cái</span>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className={styles.priceBlock}>
                                    <div className={styles.priceRow}>
                                        <span>Giá cơ bản:</span>
                                        <span className={styles.priceValue}>{formatCurrency(priceResult.breakdown.basePrice)}</span>
                                    </div>
                                    {priceResult.breakdown.sizeAdjustment > 0 && (
                                        <div className={styles.priceRow}>
                                            <span>Phụ phí kích thước:</span>
                                            <span className={styles.priceAccent}>+{formatCurrency(priceResult.breakdown.sizeAdjustment)}</span>
                                        </div>
                                    )}
                                    {priceResult.breakdown.materialSurcharge > 0 && (
                                        <div className={styles.priceRow}>
                                            <span>Phụ phí vật liệu:</span>
                                            <span className={styles.priceAccent}>+{formatCurrency(priceResult.breakdown.materialSurcharge)}</span>
                                        </div>
                                    )}
                                    <div className={`${styles.priceRow} ${styles.priceRowDivider}`}>
                                        <span>Tạm tính:</span>
                                        <span className={styles.priceValue}>{formatCurrency(priceResult.breakdown.subtotal)}</span>
                                    </div>
                                    <div className={styles.priceRow}>
                                        <span>Phí vận chuyển:</span>
                                        <span className={styles.priceValue}>{formatCurrency(priceResult.breakdown.shippingFee)}</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className={styles.totalRow}>
                                    <span className={styles.totalLabel}>TỔNG CỘNG:</span>
                                    <span className={styles.totalValue}>{formatCurrency(priceResult.estimatedPrice)}</span>
                                </div>

                                {/* Warnings */}
                                {priceResult.warnings && priceResult.warnings.length > 0 && (
                                    <div className={styles.warningBox}>
                                        <p className="text-sm font-medium text-orange-800 mb-1">Lưu ý:</p>
                                        {priceResult.warnings.map((warning: string, index: number) => (
                                            <p key={index} className="text-sm text-orange-700">• {warning}</p>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className={styles.actions}>
                                    <button
                                        onClick={handleSaveQuote}
                                        disabled={loading}
                                        className={styles.primaryButton}
                                    >
                                        <Save className="w-4 h-4" />
                                        {loading ? 'Đang lưu...' : 'Lưu báo giá'}
                                    </button>
                                    <button className={styles.secondaryButton}>
                                        <Send className="w-4 h-4" />
                                        Gửi cho khách hàng
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Scan History Sidebar */}
                    <div className={styles.card}>
                        <div className={styles.historyHeader}>
                            <div className={styles.historyTitle}>
                                <Clock className="w-4 h-4 text-gray-500" />
                                Lịch sử scan
                                {scanHistory.length > 0 && (
                                    <span className={styles.scanBadgeMuted}>{scanHistory.length}</span>
                                )}
                            </div>
                            {scanHistory.length > 0 && (
                                <button
                                    onClick={clearHistory}
                                    className={styles.historyCloseBtn}
                                    title="Xóa lịch sử"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {scanHistory.length === 0 ? (
                            <div className={styles.historyEmpty}>
                                <Clock className="w-8 h-8 text-gray-300 mb-2" />
                                <p>Chưa có lịch sử scan</p>
                            </div>
                        ) : (
                            <div className={styles.historyList}>
                                {scanHistory.map((entry) => {
                                    const timeAgo = formatTimeAgo(entry.timestamp);
                                    return (
                                        <button
                                            key={entry.id}
                                            onClick={() => loadFromHistory(entry)}
                                            className={styles.historyCard}
                                        >
                                            <img
                                                src={entry.thumbnailBase64}
                                                alt="Scan"
                                                className={styles.historyThumb}
                                            />
                                            <div className={styles.historyInfo}>
                                                <p className={styles.historyMatchName}>
                                                    {entry.topMatchName || 'Không tìm thấy'}
                                                </p>
                                                <div className={styles.historyMeta}>
                                                    <span className={styles.historyProvider}>
                                                        {entry.provider}
                                                    </span>
                                                    <span className={styles.historyTime}>
                                                        {timeAgo}
                                                    </span>
                                                </div>
                                                {entry.topMatchScore && (
                                                    <span className={`${styles.matchScoreBadge} ${styles[`matchScore${getScoreColorClass(entry.topMatchScore)}`]}`}>
                                                        {entry.topMatchScore}%
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
