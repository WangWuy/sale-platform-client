'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import styles from './ImageUploadGallery.module.scss';

export interface UploadedImage {
    id: string;
    url: string;
    file?: File;
}

export interface ImageUploadGalleryProps {
    /** Existing images (already saved on server) */
    existingImages?: UploadedImage[];
    /** Callback when existing images change (e.g., removal) */
    onExistingImagesChange?: (images: UploadedImage[]) => void;
    /** Newly uploaded images (not yet saved) */
    newImages?: UploadedImage[];
    /** Callback when new images are added */
    onNewImagesChange?: (images: UploadedImage[]) => void;
    /** Called when files are dropped/selected */
    onFilesSelected?: (files: File[]) => void;
    /** Show uploading indicator */
    uploading?: boolean;
    /** Disable all interactions */
    disabled?: boolean;
    /** Maximum number of files allowed */
    maxFiles?: number;
    /** Maximum file size in bytes (default: 10MB) */
    maxFileSize?: number;
    /** Section title */
    title?: string;
}

export function ImageUploadGallery({
    existingImages = [],
    onExistingImagesChange,
    newImages = [],
    onNewImagesChange,
    onFilesSelected,
    uploading = false,
    disabled = false,
    maxFiles,
    maxFileSize = 10 * 1024 * 1024,
    title = 'Hình ảnh sản phẩm'
}: ImageUploadGalleryProps) {
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (onFilesSelected) {
            onFilesSelected(acceptedFiles);
        }
    }, [onFilesSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        multiple: true,
        maxSize: maxFileSize,
        maxFiles,
        disabled,
    });

    const removeExistingImage = (index: number) => {
        if (onExistingImagesChange) {
            onExistingImagesChange(existingImages.filter((_, i) => i !== index));
        }
    };

    const removeNewImage = (index: number) => {
        if (onNewImagesChange) {
            onNewImagesChange(newImages.filter((_, i) => i !== index));
        }
    };

    const totalImages = existingImages.length + newImages.length;

    return (
        <div className={styles.container}>
            <h3 className={styles.sectionTitle}>
                <ImageIcon className="w-5 h-5" />
                {title}
            </h3>

            {/* Existing Images */}
            {existingImages.length > 0 && (
                <div className={styles.imagesSection}>
                    <p className={styles.imagesLabel}>
                        Ảnh hiện tại ({existingImages.length})
                    </p>
                    <div className={styles.imagesGrid}>
                        {existingImages.map((image, index) => (
                            <div key={`existing-${index}`} className={styles.imageItem}>
                                <img
                                    src={image.url}
                                    alt={`Existing ${index + 1}`}
                                    className={styles.imagePreview}
                                />
                                {index === 0 && totalImages > 1 && (
                                    <div className={styles.primaryBadge}>
                                        Ảnh chính
                                    </div>
                                )}
                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        className={styles.removeButton}
                                    >
                                        <X />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Zone */}
            <div
                {...getRootProps()}
                className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''} ${disabled ? styles.dropzoneDisabled : ''}`}
            >
                <input {...getInputProps()} />
                <Upload className={styles.uploadIcon} />
                <p className={styles.dropzoneTitle}>
                    {isDragActive ? 'Thả ảnh vào đây...' : existingImages.length > 0 ? 'Thêm ảnh mới' : 'Kéo thả ảnh vào đây'}
                </p>
                <p className={styles.dropzoneSubtitle}>
                    hoặc <span className={styles.link}>chọn file từ máy</span>
                </p>
                <p className={styles.dropzoneHint}>
                    PNG, JPG, GIF, WEBP (tối đa {Math.round(maxFileSize / 1024 / 1024)}MB mỗi ảnh)
                </p>
            </div>

            {/* New Images */}
            {newImages.length > 0 && (
                <div className={styles.imagesSection}>
                    <p className={styles.imagesLabel}>
                        Ảnh mới ({newImages.length})
                    </p>
                    <div className={styles.imagesGrid}>
                        {newImages.map((image, index) => (
                            <div key={`new-${index}`} className={styles.imageItem}>
                                <img
                                    src={image.url}
                                    alt={`New ${index + 1}`}
                                    className={`${styles.imagePreview} ${styles.imagePreviewNew}`}
                                />
                                {existingImages.length === 0 && index === 0 && totalImages > 1 && (
                                    <div className={styles.primaryBadge}>
                                        Ảnh chính
                                    </div>
                                )}
                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className={styles.removeButton}
                                    >
                                        <X />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Uploading Indicator */}
            {uploading && (
                <div className={styles.uploadingIndicator}>
                    <Loader2 className={styles.spinner} />
                    Đang tải ảnh lên...
                </div>
            )}
        </div>
    );
}

export default ImageUploadGallery;
