'use client';

import { useState, useCallback } from 'react';
import { fileService } from '@/services/file.service';
import {
    FileItem,
    FileStats,
    FileFilterParams,
    UpdateFileRequest,
    FolderItem,
} from '@/types/file';

export function useFiles() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statistics, setStatistics] = useState<FileStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch files with pagination and filters
    const fetchFiles = useCallback(async (params?: FileFilterParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fileService.getFiles(params);
            setFiles(response.files);
            setTotal(response.total);
            setTotalPages(response.totalPages);
        } catch (err) {
            setError('Không thể tải danh sách files');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch statistics
    const getStatistics = useCallback(async () => {
        try {
            const stats = await fileService.getStats();
            setStatistics(stats);
        } catch (err) {
            console.error('Failed to fetch statistics:', err);
        }
    }, []);

    // Fetch folders
    const fetchFolders = useCallback(async () => {
        try {
            const folderList = await fileService.getFolders();
            setFolders(folderList);
        } catch (err) {
            console.error('Failed to fetch folders:', err);
        }
    }, []);

    // Get file by ID
    const getFileById = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const file = await fileService.getFileById(id);
            return file;
        } catch (err) {
            setError('Không thể tải thông tin file');
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Upload single file
    const uploadFile = useCallback(
        async (file: File, folder?: string, tags?: string[], isPublic: boolean = true) => {
            setUploading(true);
            try {
                const uploadedFile = await fileService.uploadFile(file, folder, tags, isPublic);
                return uploadedFile;
            } catch (err) {
                setError('Không thể upload file');
                console.error(err);
                return null;
            } finally {
                setUploading(false);
            }
        },
        []
    );

    // Upload multiple files
    const uploadMultipleFiles = useCallback(
        async (files: File[], folder?: string, isPublic: boolean = true) => {
            setUploading(true);
            try {
                const uploadedFiles = await fileService.uploadMultipleFiles(files, folder, isPublic);
                return uploadedFiles;
            } catch (err) {
                setError('Không thể upload files');
                console.error(err);
                return [];
            } finally {
                setUploading(false);
            }
        },
        []
    );

    // Update file
    const updateFile = useCallback(async (id: number, data: UpdateFileRequest) => {
        try {
            const updated = await fileService.updateFile(id, data);
            return updated;
        } catch (err) {
            setError('Không thể cập nhật file');
            console.error(err);
            return null;
        }
    }, []);

    // Delete file
    const deleteFile = useCallback(async (id: number) => {
        try {
            const success = await fileService.deleteFile(id);
            return success;
        } catch (err) {
            setError('Không thể xóa file');
            console.error(err);
            return false;
        }
    }, []);

    // Bulk delete files
    const bulkDeleteFiles = useCallback(async (ids: number[]) => {
        try {
            const success = await fileService.bulkDeleteFiles(ids);
            return success;
        } catch (err) {
            setError('Không thể xóa files');
            console.error(err);
            return false;
        }
    }, []);

    // Move file to folder
    const moveFile = useCallback(async (id: number, targetFolder: string) => {
        try {
            const moved = await fileService.moveFile(id, targetFolder);
            return moved;
        } catch (err) {
            setError('Không thể di chuyển file');
            console.error(err);
            return null;
        }
    }, []);

    return {
        files,
        folders,
        total,
        totalPages,
        statistics,
        loading,
        uploading,
        error,
        fetchFiles,
        getStatistics,
        fetchFolders,
        getFileById,
        uploadFile,
        uploadMultipleFiles,
        updateFile,
        deleteFile,
        bulkDeleteFiles,
        moveFile,
    };
}
