import apiServer from '@/lib/api';
import { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryListResponse } from '@/types/category';

export const categoryService = {
    async getCategories(params?: { page?: number; limit?: number; search?: string }): Promise<CategoryListResponse> {
        const response = await apiServer.get('/categories', { params });
        return response.data.data || response.data;
    },

    async getCategoryById(id: number): Promise<Category> {
        const response = await apiServer.get(`/categories/${id}`);
        return response.data.data || response.data;
    },

    async createCategory(data: CreateCategoryRequest): Promise<Category> {
        const response = await apiServer.post('/categories', data);
        return response.data.data || response.data;
    },

    async updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category> {
        const response = await apiServer.put(`/categories/${id}`, data);
        return response.data.data || response.data;
    },

    async deleteCategory(id: number): Promise<boolean> {
        await apiServer.delete(`/categories/${id}`);
        return true;
    }
};
