'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, User } from 'lucide-react';
import { Button } from './Button';
import { AvatarFallback } from './ImageFallback';

interface AvatarUploadProps {
    currentAvatarUrl?: string | null;
    onUploadSuccess?: (avatarUrl: string) => void;
    onUploadError?: (error: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, onUploadSuccess, onUploadError }: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            onUploadError?.('Vui lòng chọn file ảnh');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            onUploadError?.('File ảnh không được vượt quá 5MB');
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('avatar', selectedFile);

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/users/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Upload failed');
            }

            const data = await response.json();
            const avatarUrl = data.data?.avatarUrl;

            if (avatarUrl) {
                onUploadSuccess?.(avatarUrl);
                setSelectedFile(null);
            }
        } catch (error: any) {
            onUploadError?.(error.message || 'Có lỗi xảy ra khi upload avatar');
            setPreview(currentAvatarUrl || null);
            setSelectedFile(null);
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreview(currentAvatarUrl || null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Avatar Preview */}
            <div
                className={`relative w-32 h-32 rounded-full overflow-hidden border-4 ${dragActive ? 'border-primary-500' : 'border-gray-200'
                    } transition-all cursor-pointer group`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >


                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <AvatarFallback width={128} height={128} className="w-full h-full" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                </div>
            </div>

            {/* File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
            />

            {/* Upload Instructions */}
            {!selectedFile && (
                <p className="text-sm text-gray-500 text-center">
                    Click hoặc kéo thả ảnh để upload<br />
                    <span className="text-xs">JPG, PNG, GIF, WebP (tối đa 5MB)</span>
                </p>
            )}

            {/* Action Buttons */}
            {selectedFile && (
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleCancel}
                        disabled={uploading}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        icon={uploading ? Loader2 : Upload}
                        onClick={handleUpload}
                        disabled={uploading}
                        loading={uploading}
                    >
                        {uploading ? 'Đang upload...' : 'Upload'}
                    </Button>
                </div>
            )}
        </div>
    );
}
