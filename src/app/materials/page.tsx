'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Layers,
    AlertCircle,
    Search
} from 'lucide-react';
import { Material } from '@/services/material.service';
import { formatDate } from '@/utils/formatters';
import { getMaterialGroupLabel, getMaterialTierLabel, getMaterialUnitLabel } from '@/constants/material.constants';
import { IconButton } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { useMaterials, useDeleteMaterial } from '@/hooks/useMaterials';
import { useSuppliers } from '@/hooks/useSuppliers';
import styles from './materials.module.scss';

export default function MaterialsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch materials and suppliers
    const { data: materials = [], isLoading: loading, error: materialsError } = useMaterials();
    const { suppliers, fetchSuppliers } = useSuppliers();
    const deleteMutation = useDeleteMaterial();

    // Fetch suppliers on mount
    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const handleDelete = async (id: number) => {
        if (confirm('Bạn có chắc muốn xóa vật liệu này?')) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (err) {
                console.error('Delete material error:', err);
            }
        }
    };

    const getSupplierName = (supplierId?: number | null): string => {
        if (!supplierId) return 'Chưa có';
        const supplier = suppliers.find(s => s.id === supplierId);
        return supplier?.name || `NCC #${supplierId}`;
    };

    const filteredMaterials = materials.filter((material: Material) =>
        material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getSupplierName(material.supplierId).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns: Column<Material>[] = [
        {
            key: 'material',
            label: 'Vật liệu',
            width: '25%',
            render: (material) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <Layers className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900">{material.name}</p>
                        {material.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                                {material.description}
                            </p>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'group',
            label: 'Nhóm',
            width: '12%',
            render: (material) => (
                <Badge variant="outline" className="inline-flex items-center gap-1.5 bg-cyan-100 text-cyan-700 border-cyan-200">
                    {getMaterialGroupLabel(material.materialGroup)}
                </Badge>
            )
        },
        {
            key: 'tier',
            label: 'Phân khúc',
            width: '12%',
            render: (material) => (
                <Badge variant="outline" className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 border-purple-200">
                    {getMaterialTierLabel(material.tier)}
                </Badge>
            )
        },
        {
            key: 'supplier',
            label: 'Nhà cung cấp',
            width: '12%',
            render: (material) => (
                <Badge variant="outline" className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 border-blue-200">
                    {getSupplierName(material.supplierId)}
                </Badge>
            )
        },
        {
            key: 'cost',
            label: 'Giá/Đơn vị',
            width: '13%',
            render: (material) => (
                <div>
                    <p className="font-semibold text-gray-900">
                        <CurrencyDisplay amount={material.costPerUnit} />
                    </p>
                    <p className="text-xs text-gray-500">{getMaterialUnitLabel(material.unit)}</p>
                </div>
            )
        },
        {
            key: 'created',
            label: 'Ngày tạo',
            width: '13%',
            render: (material) => (
                <div>
                    <p className="text-sm text-gray-900">
                        {material.createdAt}
                    </p>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '13%',
            render: (material) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/materials/${material.id}`}>
                        <IconButton
                            icon={Eye}
                            variant="ghost"
                            title="Xem chi tiết"
                        />
                    </Link>
                    <Link href={`/materials/${material.id}/edit`}>
                        <IconButton
                            icon={Edit}
                            variant="primary"
                            title="Chỉnh sửa"
                        />
                    </Link>
                    <IconButton
                        icon={Trash2}
                        variant="danger"
                        title="Xóa"
                        onClick={() => handleDelete(material.id)}
                    />
                </div>
            )
        }
    ];

    // Fetch materials on component mount
    return (
        <div className={styles.materialsPage}>
            {/* Error Message */}
            {materialsError && (
                <div className={styles.errorMessage} role="alert">
                    <AlertCircle aria-hidden="true" />
                    <p>{materialsError.message}</p>
                </div>
            )}

            {/* Table Wrapper - Scrollable Area */}
            <div className={styles.tableWrapper}>
                {/* Actions Bar */}
                <div className={styles.searchFiltersBar}>
                    {/* Create Button */}
                    <Link href="/materials/create" className={styles.createButton}>
                        <Plus className="w-5 h-5" aria-hidden="true" />
                        Thêm mới
                    </Link>
                </div>

                {/* DataTable */}
                <DataTable
                    data={filteredMaterials}
                    columns={columns}
                    loading={loading}
                    emptyMessage={searchQuery ? 'Không tìm thấy vật liệu' : 'Chưa có vật liệu nào'}

                    searchPlaceholder="Tìm kiếm vật liệu theo tên, mô tả, nhà cung cấp..."
                    onSearch={setSearchQuery}
                    defaultPageSize={20}
                />
            </div>
        </div>
    );
}
