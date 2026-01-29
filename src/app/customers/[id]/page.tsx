'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Edit,
    Trash2,
    AlertCircle,
    Loader2,
    Users,
    Mail,
    Phone,
    MapPin,
    FileText,
    Calendar,
    Tag
} from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer, CUSTOMER_TYPES } from '@/types/customer';
import { customerService } from '@/services/customer.service';
import styles from './detail.module.scss';

export default function CustomerDetailPage() {
    const router = useRouter();
    const params = useParams();
    const customerId = Number(params.id);
    const { deleteCustomer } = useCustomers();

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const customerData = await customerService.getCustomerById(customerId);
                if (customerData) {
                    setCustomer(customerData);
                } else {
                    setError('Không tìm thấy khách hàng');
                }
            } catch (err) {
                setError('Không thể tải thông tin khách hàng');
                console.error('Fetch customer error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (customerId) {
            fetchCustomer();
        }
    }, [customerId]);

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;

        setIsDeleting(true);
        try {
            await deleteCustomer(customerId);
            router.push('/customers');
        } catch (err) {
            setError('Không thể xóa khách hàng');
        } finally {
            setIsDeleting(false);
        }
    };

    const getCustomerTypeColor = (type: string | null) => {
        if (!type) return 'gray';
        const colors: Record<string, string> = {
            'Quán cà phê': 'amber',
            'Nhà hàng': 'emerald',
            'Văn phòng': 'blue',
            'Khách sạn': 'purple',
            'Cửa hàng nội thất': 'pink',
            'Căn hộ': 'cyan',
            'Biệt thự': 'indigo',
            'Showroom': 'orange',
            'Khác': 'gray'
        };
        return colors[type] || 'gray';
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className={styles.loadingText}>Đang tải...</span>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className={styles.page}>
                <div className={`${styles.notice} ${styles.noticeError}`}>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p>{error || 'Không tìm thấy khách hàng'}</p>
                </div>
                <Link href="/customers">
                    <button className={styles.backLink}>
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại danh sách
                    </button>
                </Link>
            </div>
        );
    }

    const colorClass = getCustomerTypeColor(customer.customerType ?? null);

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <Link href="/customers">
                        <button className={styles.backLink}>
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                    </Link>
                    <div className={styles.divider}></div>
                    <div className={styles.headerRow}>
                        <div className={styles.headerBadge}>
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className={styles.title}>{customer.name}</h1>
                            <p className={styles.subtitle}>Chi tiết thông tin khách hàng</p>
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <Link href={`/customers/${customerId}/edit`}>
                        <button className={styles.buttonSecondary}>
                            <Edit className="w-4 h-4" />
                            Chỉnh sửa
                        </button>
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={styles.buttonDanger}
                    >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? 'Đang xóa...' : 'Xóa'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Basic Info */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Thông tin cơ bản</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>
                                <Tag className="w-4 h-4" />
                                Loại khách hàng
                            </div>
                            <div className={styles.infoValue}>
                                <span className={`${styles.badge} ${styles[`badge${colorClass.charAt(0).toUpperCase() + colorClass.slice(1)}`]}`}>
                                    {customer.customerType || 'Chưa phân loại'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Thông tin liên hệ</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>
                                <Mail className="w-4 h-4" />
                                Email
                            </div>
                            <div className={styles.infoValue}>
                                {customer.email || 'Chưa cập nhật'}
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>
                                <Phone className="w-4 h-4" />
                                Số điện thoại
                            </div>
                            <div className={styles.infoValue}>
                                {customer.phone || 'Chưa cập nhật'}
                            </div>
                        </div>
                        <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                            <div className={styles.infoLabel}>
                                <MapPin className="w-4 h-4" />
                                Địa chỉ
                            </div>
                            <div className={styles.infoValue}>
                                {customer.address || 'Chưa cập nhật'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {customer.notes && (
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <FileText className="w-5 h-5" />
                            Ghi chú
                        </h3>
                        <p className={styles.notes}>{customer.notes}</p>
                    </div>
                )}

                {/* Metadata */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Thông tin hệ thống</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>
                                <Calendar className="w-4 h-4" />
                                Ngày tạo
                            </div>
                            <div className={styles.infoValue}>
                                {new Date(customer.createdAt).toLocaleString('vi-VN')}
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>
                                <Calendar className="w-4 h-4" />
                                Cập nhật lần cuối
                            </div>
                            <div className={styles.infoValue}>
                                {new Date(customer.updatedAt).toLocaleString('vi-VN')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
