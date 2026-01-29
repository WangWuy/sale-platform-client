'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Calculator, Search, Upload, X, AlertCircle, Send, Save, Package } from 'lucide-react';
import quoteService from '@/services/quote.service';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product';
import { formatCurrency } from '@/utils/formatters';
import imageMatchingService from '@/services/image-matching.service';
import materialService from '@/services/material.service';
import { PriceCalculationRequest } from '@/types/quote';
import styles from './quotes.module.scss';

export default function QuotesPage() {
    const [loading, setLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [productSearch, setProductSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [dimensions, setDimensions] = useState({ width: 0, length: 0, height: 0 });
    const [material, setMaterial] = useState('');
    const [materials, setMaterials] = useState<any[]>([]);
    const [priceResult, setPriceResult] = useState<any>(null);

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

    // Image upload handler
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async () => {
                setUploadedImage(reader.result as string);

                try {
                    setLoading(true);
                    // Upload to ServerFile
                    const uploadResult = await imageMatchingService.uploadImage(file);
                    console.log('Image uploaded:', uploadResult);

                    // Call AI matching with uploaded image ID
                    await simulateImageMatching(uploadResult.id);
                } catch (error) {
                    console.error('Upload failed:', error);
                    alert('Upload ảnh thất bại');
                    setLoading(false);
                }
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

    const simulateImageMatching = async (uploadedImageId: string) => {
        try {
            setLoading(true);
            // Call AI scan API with uploaded image ID
            const result = await imageMatchingService.scanImage(uploadedImageId);

            if (result.matchingProducts && result.matchingProducts.length > 0) {
                const matchedProduct = result.matchingProducts[0]; // Lấy sản phẩm đầu tiên
                setSelectedProduct(matchedProduct);
                setSimilarProducts(result.matchingProducts.slice(1) || []); // Các sản phẩm còn lại là tương tự
                setProductSearch(matchedProduct.name);
            }
        } catch (error) {
            console.error('AI matching failed:', error);
            alert('Tìm kiếm sản phẩm thất bại');
        } finally {
            setLoading(false);
        }
    };

    const clearImage = () => {
        setUploadedImage(null);
        setSelectedProduct(null);
        setSimilarProducts([]);
        setProductSearch('');
    };

    // Debounce product search
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

    const handleCalculate = async () => {
        if (!selectedProduct) {
            alert('Vui lòng chọn sản phẩm');
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
            alert('Tính giá thất bại');
        } finally {
            setLoading(false);
        }
    };

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
                notes: `Tính từ form: ${quantity} x ${selectedProduct.name}${uploadedImage ? ' (có ảnh upload)' : ''}`,
            };

            await quoteService.createQuote(quoteData);
            alert('Lưu báo giá thành công!');

            // Reset form
            setSelectedProduct(null);
            setProductSearch('');
            setQuantity(1);
            setDimensions({ width: 0, length: 0, height: 0 });
            setMaterial('');
            setPriceResult(null);
            setUploadedImage(null);
            setSimilarProducts([]);
        } catch (error) {
            console.error('Save quote failed:', error);
            alert('Lưu báo giá thất bại');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className={styles.quotesPage}>
            {/* Page Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Tính khung giá</h1>
                    <p className={styles.subtitle}>Upload ảnh hoặc tìm sản phẩm để tính giá tự động</p>
                </div>
                <a
                    href="/quotes/list"
                    className={styles.headerAction}
                >
                    <Search className="w-5 h-5" />
                    Xem lịch sử báo giá
                </a>
            </div>

            <div className={styles.pageGrid}>
                {/* Left: Upload & Form */}
                <div className={styles.leftColumn}>
                    {/* Upload Area */}
                    <div className={styles.card}>
                        <h2 className={styles.sectionTitle}>Upload Ảnh Sản Phẩm</h2>

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
                                <button
                                    onClick={clearImage}
                                    className={styles.clearButton}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Product Selection */}
                    <div className={styles.card}>
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
                                    <label className={styles.label}>Kích thước</label>
                                    <input
                                        type="text"
                                        placeholder="45x45x90 cm"
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Similar Products */}
                    {similarProducts.length > 0 && (
                        <div className={styles.card}>
                            <div className={styles.sectionTitle}>
                                <Search className="w-5 h-5 text-gray-600" />
                                Sản phẩm tương tự
                            </div>

                            <div className={styles.similarGrid}>
                                {similarProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setProductSearch(product.name);
                                        }}
                                        className={styles.similarCard}
                                    >
                                        <div className={styles.similarThumb}>
                                            <Package className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {formatCurrency(product.basePrice)}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleCalculate}
                        disabled={loading || !selectedProduct}
                        className={styles.primaryButton}
                    >
                        <Calculator className="w-5 h-5" />
                        {loading ? 'Đang tính...' : 'Tính khung giá'}
                    </button>
                </div>

                {/* Right: Price Result */}
                <div className={styles.rightColumn}>
                    <div className={`${styles.card} ${styles.priceCard}`}>
                        <h2 className={styles.sectionTitle}>Kết quả báo giá</h2>

                        {!priceResult ? (
                            <div className={styles.emptyState}>
                                <Calculator className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p>Nhập thông tin và bấm "Tính khung giá"</p>
                            </div>
                        ) : (
                            <div className={styles.formGrid}>
                                {/* Product Info */}
                                {selectedProduct && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{selectedProduct.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{selectedProduct.categoryInfo?.name || 'N/A'}</p>
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
                </div>
            </div>
        </div>
    );
}
