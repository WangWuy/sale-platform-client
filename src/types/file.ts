// =====================================================
// File Manager Types - Types cho File Management
// =====================================================

export enum FileType {
    IMAGE = 'image',
    DOCUMENT = 'document',
    VIDEO = 'video',
    OTHER = 'other'
}

export interface FileItem {
    id: number;
    name: string;
    originalName: string;
    path: string;
    url: string;
    mimeType: string;
    size: number;
    type: FileType;
    uploadedBy: number;
    folder?: string | null;
    tags?: string[] | null;
    metadata?: Record<string, any> | null;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface FileStats {
    totalFiles: number;
    totalSize: number;
    byType: {
        images: number;
        documents: number;
        videos: number;
        others: number;
    };
}

export interface FileFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: FileType;
    folder?: string;
    uploadedBy?: number;
    sortBy?: 'name' | 'size' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface FilesResponse {
    files: FileItem[];
    total: number;
    page: number;
    totalPages: number;
}

export interface UploadFileRequest {
    file: File;
    folder?: string;
    tags?: string[];
    isPublic?: boolean;
}

export interface UpdateFileRequest {
    name?: string;
    folder?: string;
    tags?: string[];
    isPublic?: boolean;
}

export interface FolderItem {
    name: string;
    path: string;
    fileCount: number;
}

// Helper functions
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function getFileTypeFromMime(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return FileType.IMAGE;
    if (mimeType.startsWith('video/')) return FileType.VIDEO;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
        return FileType.DOCUMENT;
    }
    return FileType.OTHER;
}

export function getFileIcon(type: FileType): string {
    switch (type) {
        case FileType.IMAGE:
            return '🖼️';
        case FileType.VIDEO:
            return '🎥';
        case FileType.DOCUMENT:
            return '📄';
        default:
            return '📁';
    }
}
