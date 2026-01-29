'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    FileText,
    User,
    Phone,
    Mail,
    Calendar,
    Package,
    DollarSign,
    Loader2,
    Send,
    CheckCircle,
    XCircle,
    Copy
} from 'lucide-react';
import { quoteService } from '@/services/quote.service';
import { QuoteWithItems, QuoteStatus } from '@/types/quote';
import { formatCurrency } from '@/utils/formatters';
import { QuoteStatusBadge } from '@/components/quotes/QuoteStatusBadge';

export default function QuoteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [quote, setQuote] = useState<QuoteWithItems | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchQuote(Number(params.id));
        }
    }, [params.id]);

    const fetchQuote = async (id: number) => {
        try {
            setLoading(true);
            const data = await quoteService.getQuoteById(id);
            setQuote(data);
        } catch (error) {
            console.error('Failed to fetch quote:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (action: 'send' | 'accept' | 'reject') => {
        if (!quote) return;

        try {
            let result;
            switch (action) {
                case 'send':
                    result = await quoteService.sendQuote(quote.id);
                    break;
                case 'accept':
                    result = await quoteService.acceptQuote(quote.id);
                    break;
                case 'reject':
                    result = await quoteService.rejectQuote(quote.id);
                    break;
            }
            if (result) {
                fetchQuote(quote.id);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Cập nhật trạng thái thất bại');
        }
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Không tìm thấy báo giá</p>
                <Link href="/quotes/list" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/quotes/list" className="flex items-center text-primary-600 hover:text-primary-700 mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Quay lại danh sách
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{quote.code}</h1>
                        <QuoteStatusBadge status={quote.status} />
                    </div>
                    <p className="text-gray-600 mt-1">
                        Tạo ngày {new Date(quote.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {quote.status === QuoteStatus.DRAFT && (
                        <button
                            onClick={() => handleUpdateStatus('send')}
                            className="flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition px-4 py-2"
                        >
                            <Send className="w-4 h-4" />
                            Đánh dấu đã báo khách
                        </button>
                    )}
                    {quote.status === QuoteStatus.SENT && (
                        <>
                            <button
                                onClick={() => handleUpdateStatus('accept')}
                                className="flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition px-4 py-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Khách chấp nhận
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('reject')}
                                className="flex items-center gap-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition px-4 py-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Khách từ chối
                            </button>
                        </>
                    )}
                    <button className="flex items-center gap-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition px-4 py-2">
                        <Copy className="w-4 h-4" />
                        Sao chép
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Quote Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Tên khách hàng</p>
                                    <p className="font-medium text-gray-900">{quote.customerName || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Số điện thoại</p>
                                    <p className="font-medium text-gray-900">{quote.customerPhone || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium text-gray-900">{quote.customerEmail || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Hạn báo giá</p>
                                    <p className="font-medium text-gray-900">
                                        {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('vi-VN') : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quote Items */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách sản phẩm</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left text-sm font-semibold text-gray-700 p-3">Sản phẩm</th>
                                        <th className="text-left text-sm font-semibold text-gray-700 p-3">Vật liệu</th>
                                        <th className="text-center text-sm font-semibold text-gray-700 p-3">SL</th>
                                        <th className="text-right text-sm font-semibold text-gray-700 p-3">Đơn giá</th>
                                        <th className="text-right text-sm font-semibold text-gray-700 p-3">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {quote.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.productName}</p>
                                                    <p className="text-sm text-gray-500">{item.category}</p>
                                                </div>
                                            </td>
                                            <td className="p-3 text-gray-700">{item.material}</td>
                                            <td className="p-3 text-center text-gray-700">{item.quantity}</td>
                                            <td className="p-3 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                                            <td className="p-3 text-right font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes */}
                    {quote.notes && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Ghi chú</h2>
                            <p className="text-gray-700">{quote.notes}</p>
                        </div>
                    )}
                </div>

                {/* Right: Price Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng kết</h2>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tạm tính:</span>
                                <span className="font-medium">{formatCurrency(quote.totalAmount)}</span>
                            </div>
                            {quote.discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Giảm giá:</span>
                                    <span className="font-medium text-red-600">-{formatCurrency(quote.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Phí vận chuyển:</span>
                                <span className="font-medium">{formatCurrency(quote.shippingFee)}</span>
                            </div>

                            <div className="border-t-2 pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {formatCurrency(quote.finalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
