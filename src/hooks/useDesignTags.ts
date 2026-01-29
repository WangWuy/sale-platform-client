'use client';

import { useState, useCallback } from 'react';
import { designTagService } from '@/services/design-tag.service';
import {
    DesignTag,
    CreateTagRequest,
    UpdateTagRequest,
    TagFilterParams
} from '@/types/design-tag';

export function useDesignTags() {
    const [tags, setTags] = useState<DesignTag[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTags = useCallback(async (params?: TagFilterParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await designTagService.getTags(params);
            setTags(response.tags);
            setTotal(response.total);
            setTotalPages(response.totalPages);
        } catch (err) {
            setError('Failed to fetch design tags');
        } finally {
            setLoading(false);
        }
    }, []);

    const createTag = useCallback(async (data: CreateTagRequest) => {
        setLoading(true);
        try {
            const newTag = await designTagService.createTag(data);
            setTags(prev => [...prev, newTag]);
            return newTag;
        } catch (err) {
            setError('Failed to create tag');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTag = useCallback(async (id: number, data: UpdateTagRequest) => {
        setLoading(true);
        try {
            const updated = await designTagService.updateTag(id, data);
            setTags(prev => prev.map(t => t.id === id ? updated : t));
            return updated;
        } catch (err) {
            setError('Failed to update tag');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTag = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const success = await designTagService.deleteTag(id);
            if (success) {
                setTags(prev => prev.filter(t => t.id !== id));
            }
            return success;
        } catch (err) {
            setError('Failed to delete tag');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        tags,
        total,
        totalPages,
        loading,
        error,
        fetchTags,
        createTag,
        updateTag,
        deleteTag
    };
}

/**
 * Hook for managing tags on products
 * @param productId - The product ID to manage tags for
 */
export function useProductTags(productId?: number) {
    const [tags, setTags] = useState<DesignTag[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProductTags = useCallback(async (id?: number) => {
        const targetId = id || productId;
        if (!targetId) {
            setTags([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await designTagService.getTagsForProduct(targetId);
            setTags(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product tags';
            setError(errorMessage);
            console.error('Fetch product tags error:', err);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    const addTagToProduct = useCallback(async (tagId: number, prodId?: number) => {
        const targetId = prodId || productId;
        if (!targetId) {
            setError('Product ID is required');
            return false;
        }

        setLoading(true);
        setError(null);
        try {
            const success = await designTagService.addTagToProduct(targetId, tagId);
            if (success) {
                // Refresh the tags list
                await fetchProductTags(targetId);
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add tag to product';
            setError(errorMessage);
            console.error('Add tag to product error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [productId, fetchProductTags]);

    const removeTagFromProduct = useCallback(async (tagId: number, prodId?: number) => {
        const targetId = prodId || productId;
        if (!targetId) {
            setError('Product ID is required');
            return false;
        }

        setLoading(true);
        setError(null);
        try {
            const success = await designTagService.removeTagFromProduct(targetId, tagId);
            if (success) {
                // Remove tag from local state
                setTags(prev => prev.filter(t => t.id !== tagId));
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove tag from product';
            setError(errorMessage);
            console.error('Remove tag from product error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [productId]);

    return {
        tags,
        loading,
        error,
        fetchProductTags,
        addTagToProduct,
        removeTagFromProduct
    };
}

