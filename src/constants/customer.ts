import { CUSTOMER_TYPES, type CustomerType } from '@/types/customer';

// Re-export for convenience
export { CUSTOMER_TYPES, type CustomerType };

// Customer type colors mapping (string-based)
export const CUSTOMER_TYPE_COLORS: Record<string, string> = {
    'Quán cà phê': 'blue',
    'Nhà hàng': 'green',
    'Văn phòng': 'purple',
    'Khách sạn': 'orange',
    'Cửa hàng nội thất': 'cyan',
    'Căn hộ': 'pink',
    'Biệt thự': 'yellow',
    'Showroom': 'indigo',
    'Khác': 'gray',
};
