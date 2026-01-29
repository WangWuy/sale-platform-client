import { useState, useCallback } from 'react';
import { productTemplateService } from '@/services/product-template.service';
import { ProductType } from '@/types/pricing';
import {
    ProductTemplate,
    CreateTemplateRequest,
    UpdateTemplateRequest,
    TemplateFilterParams
} from '@/types/product-template';

export function useProductTemplates() {
    const [templates, setTemplates] = useState<ProductTemplate[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = useCallback(async (params?: TemplateFilterParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productTemplateService.getTemplates(params);
            setTemplates(response.templates);
            setTotal(response.total);
            setTotalPages(response.totalPages);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
            setError(errorMessage);
            console.error('Fetch templates error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const getTemplatesByType = useCallback(async (productType: ProductType): Promise<ProductTemplate[]> => {
        setLoading(true);
        setError(null);
        try {
            const templatesData = await productTemplateService.getTemplatesByType(productType);
            return templatesData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates by type';
            setError(errorMessage);
            console.error('Fetch templates by type error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getTemplatesByCategory = useCallback(async (categoryId: number): Promise<ProductTemplate[]> => {
        setLoading(true);
        setError(null);
        try {
            const templatesData = await productTemplateService.getTemplatesByCategory(categoryId);
            return templatesData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates by category';
            setError(errorMessage);
            console.error('Fetch templates by category error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createTemplate = useCallback(async (data: CreateTemplateRequest) => {
        setLoading(true);
        setError(null);
        try {
            const newTemplate = await productTemplateService.createTemplate(data);
            setTemplates(prev => [...prev, newTemplate]);
            return newTemplate;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
            setError(errorMessage);
            console.error('Create template error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTemplate = useCallback(async (id: number, data: UpdateTemplateRequest) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await productTemplateService.updateTemplate(id, data);
            setTemplates(prev => prev.map(t => t.id === id ? updated : t));
            return updated;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
            setError(errorMessage);
            console.error('Update template error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTemplate = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const success = await productTemplateService.deleteTemplate(id);
            if (success) {
                setTemplates(prev => prev.filter(t => t.id !== id));
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
            setError(errorMessage);
            console.error('Delete template error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        templates,
        total,
        totalPages,
        loading,
        error,
        fetchTemplates,
        getTemplatesByType,
        getTemplatesByCategory,
        createTemplate,
        updateTemplate,
        deleteTemplate
    };
}
