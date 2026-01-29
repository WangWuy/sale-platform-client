import apiServer from "@/lib/api";
import { ApiResponse } from "@/types/api-response.model";
import {
    FileItem,
    FileStats,
    FileFilterParams,
    FilesResponse,
    UpdateFileRequest,
    FolderItem,
} from "@/types/file";

// =====================================================
// File Service - Quản lý Files API
// =====================================================

export const fileService = {
    /**
     * GET /api/files/stats
     * Lấy thống kê files
     */
    async getStats(): Promise<FileStats> {
        try {
            const response = await apiServer.get<ApiResponse<FileStats>>("/files/stats");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                totalFiles: 0,
                totalSize: 0,
                byType: { images: 0, documents: 0, videos: 0, others: 0 },
            };
        } catch (error) {
            console.error("Get file stats failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/files/folders
     * Lấy danh sách folders
     */
    async getFolders(): Promise<FolderItem[]> {
        try {
            const response = await apiServer.get<ApiResponse<FolderItem[]>>("/files/folders");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Get folders failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/files
     * Lấy danh sách files với pagination
     */
    async getFiles(params?: FileFilterParams): Promise<FilesResponse> {
        try {
            const response = await apiServer.get<ApiResponse<FilesResponse>>("/files", {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 20,
                    search: params?.search,
                    type: params?.type,
                    folder: params?.folder,
                    uploadedBy: params?.uploadedBy,
                    sortBy: params?.sortBy || "createdAt",
                    sortOrder: params?.sortOrder || "desc",
                },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                files: [],
                total: 0,
                page: params?.page || 1,
                totalPages: 0,
            };
        } catch (error) {
            console.error("Get files failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/files/:id
     * Lấy chi tiết file
     */
    async getFileById(id: number): Promise<FileItem | null> {
        try {
            const response = await apiServer.get<ApiResponse<FileItem>>(`/files/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Get file ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/files/upload
     * Upload file mới
     */
    async uploadFile(
        file: File,
        folder?: string,
        tags?: string[],
        isPublic: boolean = true
    ): Promise<FileItem> {
        try {
            const formData = new FormData();
            formData.append("file", file);
            if (folder) formData.append("folder", folder);
            if (tags) formData.append("tags", JSON.stringify(tags));
            formData.append("isPublic", String(isPublic));

            const response = await apiServer.post<ApiResponse<FileItem>>(
                "/files/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to upload file");
        } catch (error) {
            console.error("Upload file failed:", error);
            throw error;
        }
    },

    /**
     * POST /api/files/upload-multiple
     * Upload nhiều files
     */
    async uploadMultipleFiles(
        files: File[],
        folder?: string,
        isPublic: boolean = true
    ): Promise<FileItem[]> {
        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append("files", file);
            });
            if (folder) formData.append("folder", folder);
            formData.append("isPublic", String(isPublic));

            const response = await apiServer.post<ApiResponse<FileItem[]>>(
                "/files/upload-multiple",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to upload files");
        } catch (error) {
            console.error("Upload multiple files failed:", error);
            throw error;
        }
    },

    /**
     * PUT /api/files/:id
     * Cập nhật thông tin file
     */
    async updateFile(id: number, data: UpdateFileRequest): Promise<FileItem> {
        try {
            const response = await apiServer.put<ApiResponse<FileItem>>(`/files/${id}`, data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to update file");
        } catch (error) {
            console.error(`Update file ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/files/:id
     * Xóa file
     */
    async deleteFile(id: number): Promise<boolean> {
        try {
            const response = await apiServer.delete<ApiResponse<void>>(`/files/${id}`);
            return response.data.success;
        } catch (error) {
            console.error(`Delete file ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/files/bulk-delete
     * Xóa nhiều files
     */
    async bulkDeleteFiles(ids: number[]): Promise<boolean> {
        try {
            const response = await apiServer.post<ApiResponse<void>>("/files/bulk-delete", {
                ids,
            });
            return response.data.success;
        } catch (error) {
            console.error("Bulk delete files failed:", error);
            throw error;
        }
    },

    /**
     * POST /api/files/:id/move
     * Di chuyển file sang folder khác
     */
    async moveFile(id: number, targetFolder: string): Promise<FileItem> {
        try {
            const response = await apiServer.post<ApiResponse<FileItem>>(`/files/${id}/move`, {
                folder: targetFolder,
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to move file");
        } catch (error) {
            console.error(`Move file ${id} failed:`, error);
            throw error;
        }
    },
};

export default fileService;
