'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Upload,
    AlertCircle,
    X,
    Trash2,
    Download,
    Edit,
    FolderOpen,
    Image as ImageIcon,
    File as FileIcon,
    Video,
    FileText,
    Check
} from 'lucide-react';
import { useFiles } from '@/hooks/useFiles';
import { FileItem, FileType, formatFileSize, getFileTypeFromMime } from '@/types/file';
import { IconButton } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import styles from './files.module.scss';

export default function FileManagerPage() {
    const {
        files,
        folders,
        total,
        totalPages,
        loading,
        uploading,
        error,
        fetchFiles,
        fetchFolders,
        uploadFile,
        uploadMultipleFiles,
        deleteFile,
        bulkDeleteFiles,
    } = useFiles();

    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [typeFilter, setTypeFilter] = useState<FileType | ''>('');
    const [folderFilter, setFolderFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(24);
    const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
    const [isDragging, setIsDragging] = useState(false);

    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        fetchFiles({
            page: currentPage,
            limit: pageSize,
            type: typeFilter || undefined,
            folder: folderFilter || undefined,
        });
        fetchFolders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, typeFilter, folderFilter]);

    const handleFileSelect = (fileId: number) => {
        setSelectedFiles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(fileId)) {
                newSet.delete(fileId);
            } else {
                newSet.add(fileId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedFiles.size === files.length) {
            setSelectedFiles(new Set());
        } else {
            setSelectedFiles(new Set(files.map(f => f.id)));
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        const fileArray = Array.from(selectedFiles);

        if (fileArray.length === 1) {
            const result = await uploadFile(fileArray[0], folderFilter || undefined);
            if (result) {
                showToast(`Đã upload "${result.originalName}"`, 'success');
                fetchFiles({ page: currentPage, limit: pageSize, folder: folderFilter || undefined });
            }
        } else {
            const results = await uploadMultipleFiles(fileArray, folderFilter || undefined);
            if (results.length > 0) {
                showToast(`Đã upload ${results.length} files`, 'success');
                fetchFiles({ page: currentPage, limit: pageSize, folder: folderFilter || undefined });
            }
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length === 0) return;

        if (droppedFiles.length === 1) {
            const result = await uploadFile(droppedFiles[0], folderFilter || undefined);
            if (result) {
                showToast(`Đã upload "${result.originalName}"`, 'success');
                fetchFiles({ page: currentPage, limit: pageSize, folder: folderFilter || undefined });
            }
        } else {
            const results = await uploadMultipleFiles(droppedFiles, folderFilter || undefined);
            if (results.length > 0) {
                showToast(`Đã upload ${results.length} files`, 'success');
                fetchFiles({ page: currentPage, limit: pageSize, folder: folderFilter || undefined });
            }
        }
    };

    const handleDeleteFile = (id: number, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Xóa file',
            message: `Bạn có chắc muốn xóa file "${name}"? Hành động này không thể hoàn tác.`,
            variant: 'danger',
            onConfirm: async () => {
                const success = await deleteFile(id);
                if (success) {
                    showToast(`Đã xóa file "${name}"`, 'success');
                    fetchFiles({ page: currentPage, limit: pageSize });
                } else {
                    showToast('Không thể xóa file', 'error');
                }
            }
        });
    };

    const handleBulkDelete = () => {
        const count = selectedFiles.size;
        setConfirmModal({
            isOpen: true,
            title: 'Xóa files',
            message: `Bạn có chắc muốn xóa ${count} file(s)? Hành động này không thể hoàn tác.`,
            variant: 'danger',
            onConfirm: async () => {
                const success = await bulkDeleteFiles(Array.from(selectedFiles));
                if (success) {
                    showToast(`Đã xóa ${count} file(s)`, 'success');
                    setSelectedFiles(new Set());
                    fetchFiles({ page: currentPage, limit: pageSize });
                } else {
                    showToast('Không thể xóa files', 'error');
                }
            }
        });
    };

    const getFileIcon = (file: FileItem) => {
        const type = getFileTypeFromMime(file.mimeType);
        switch (type) {
            case FileType.IMAGE:
                return <ImageIcon className="w-12 h-12 text-blue-500" />;
            case FileType.VIDEO:
                return <Video className="w-12 h-12 text-purple-500" />;
            case FileType.DOCUMENT:
                return <FileText className="w-12 h-12 text-amber-500" />;
            default:
                return <FileIcon className="w-12 h-12 text-gray-500" />;
        }
    };

    const calculatedTotalPages = Math.ceil(total / pageSize);

    return (
        <div className={styles.fileManagerPage}>
            {/* Error Message */}
            {error && (
                <div className={styles.errorMessage} role="alert">
                    <AlertCircle aria-hidden="true" />
                    <p>{error}</p>
                </div>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />

            {/* Filters & Actions Bar */}
            <div className={styles.searchFiltersBar}>
                {/* Type Filter */}
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as FileType | '')}
                    className={styles.filterSelect}
                    aria-label="Filter by file type"
                >
                    <option value="">Tất cả loại</option>
                    <option value={FileType.IMAGE}>Hình ảnh</option>
                    <option value={FileType.DOCUMENT}>Tài liệu</option>
                    <option value={FileType.VIDEO}>Video</option>
                    <option value={FileType.OTHER}>Khác</option>
                </select>

                {/* Folder Filter */}
                <select
                    value={folderFilter}
                    onChange={(e) => setFolderFilter(e.target.value)}
                    className={styles.filterSelect}
                    aria-label="Filter by folder"
                >
                    <option value="">Tất cả thư mục</option>
                    {folders.map((folder) => (
                        <option key={folder.path} value={folder.path}>
                            {folder.name} ({folder.fileCount})
                        </option>
                    ))}
                </select>

                {/* Clear Filters */}
                {(typeFilter || folderFilter) && (
                    <button
                        onClick={() => {
                            setTypeFilter('');
                            setFolderFilter('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition"
                        aria-label="Clear filters"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Upload Button */}
                <button
                    onClick={handleUploadClick}
                    className={styles.uploadButton}
                    disabled={uploading}
                >
                    <Upload className="w-5 h-5" aria-hidden="true" />
                    {uploading ? 'Đang upload...' : 'Upload Files'}
                </button>
            </div>

            {/* Bulk Actions */}
            {selectedFiles.size > 0 && (
                <div className={styles.bulkActions}>
                    <span className="text-sm font-medium text-gray-700">
                        {selectedFiles.size} file(s) đã chọn
                    </span>
                    <button
                        onClick={handleSelectAll}
                        className={styles.bulkActionButton}
                    >
                        <Check className="w-4 h-4" />
                        {selectedFiles.size === files.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        className={`${styles.bulkActionButton} ${styles.danger}`}
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                    </button>
                </div>
            )}

            {/* File Grid or Upload Area */}
            {files.length === 0 && !loading ? (
                <div
                    className={`${styles.uploadArea} ${isDragging ? styles.dragOver : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleUploadClick}
                >
                    <Upload className={styles.uploadIcon} />
                    <div className={styles.uploadText}>
                        <h3>Kéo & thả files vào đây</h3>
                        <p>hoặc click để chọn files từ máy tính</p>
                    </div>
                </div>
            ) : (
                <>
                    <div
                        className={styles.fileGrid}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {files.map((file) => {
                            const isImage = file.mimeType.startsWith('image/');
                            const isSelected = selectedFiles.has(file.id);

                            return (
                                <div
                                    key={file.id}
                                    className={`${styles.fileCard} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => handleFileSelect(file.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleFileSelect(file.id)}
                                        className={styles.fileCheckbox}
                                        onClick={(e) => e.stopPropagation()}
                                    />

                                    <div className={styles.filePreview}>
                                        {isImage ? (
                                            <img src={file.url} alt={file.originalName} />
                                        ) : (
                                            <div className={styles.fileIcon}>
                                                {getFileIcon(file)}
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.fileName} title={file.originalName}>
                                        {file.originalName}
                                    </div>

                                    <div className={styles.fileInfo}>
                                        <span>{formatFileSize(file.size)}</span>
                                        <span>{new Date(file.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>

                                    <div className={styles.fileActions}>
                                        <a
                                            href={file.url}
                                            download={file.originalName}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <IconButton
                                                icon={Download}
                                                variant="primary"
                                                title="Tải xuống"
                                                size="sm"
                                            />
                                        </a>
                                        <IconButton
                                            icon={Trash2}
                                            variant="danger"
                                            title="Xóa"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteFile(file.id, file.originalName);
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {calculatedTotalPages > 1 && (
                        <div className={styles.pagination}>
                            <div className={styles.paginationInfo}>
                                Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} trong tổng số {total} files
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={styles.paginationButton}
                                    aria-label="Previous page"
                                >
                                    Trước
                                </button>
                                {Array.from({ length: Math.min(5, calculatedTotalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`${styles.paginationButton} ${currentPage === pageNum ? styles.paginationButtonActive : ''
                                                }`}
                                            aria-label={`Go to page ${pageNum}`}
                                            aria-current={currentPage === pageNum ? 'page' : undefined}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(calculatedTotalPages, p + 1))}
                                    disabled={currentPage === calculatedTotalPages}
                                    className={styles.paginationButton}
                                    aria-label="Next page"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                confirmText="Xác nhận"
                cancelText="Hủy"
            />
        </div>
    );
}
