'use client';

import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '@/services/category.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

interface UseCategoriesReturn {
    categories: Category[];
    total: number;
    loading: boolean;
    error: string | null;
    fetchCategories: () => Promise<void>;
    createCategory: (data: CreateCategoryRequest) => Promise<Category | null>;
    updateCategory: (id: number, data: UpdateCategoryRequest) => Promise<Category | null>;
    deleteCategory: (id: number) => Promise<boolean>;
}

export function useCategories(): UseCategoriesReturn {
    const [categories, setCategories] = useState<Category[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await categoryService.getCategories({ limit: 100 });
            setCategories(response.categories || []);
            setTotal(response.total || 0);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
            setError(errorMessage);
            console.error('Fetch categories error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (data: CreateCategoryRequest): Promise<Category | null> => {
        setLoading(true);
        setError(null);

        try {
            const newCategory = await categoryService.createCategory(data);
            if (newCategory) {
                await fetchCategories();
            }
            return newCategory;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
            setError(errorMessage);
            console.error('Create category error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchCategories]);

    const updateCategory = useCallback(async (id: number, data: UpdateCategoryRequest): Promise<Category | null> => {
        setLoading(true);
        setError(null);

        try {
            const updatedCategory = await categoryService.updateCategory(id, data);
            if (updatedCategory) {
                setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
            }
            return updatedCategory;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
            setError(errorMessage);
            console.error('Update category error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteCategory = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const success = await categoryService.deleteCategory(id);
            if (success) {
                setCategories(prev => prev.filter(c => c.id !== id));
                setTotal(prev => prev - 1);
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
            setError(errorMessage);
            console.error('Delete category error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        categories,
        total,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory
    };
}
