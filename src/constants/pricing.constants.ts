// Pricing Constants
// Used for form dropdowns and label display

// =====================================================
// PRODUCT TYPE
// =====================================================
export enum ProductType {
    CHAIR = 1,
    TABLE = 2,
    SOFA = 3,
    BED = 4,
    CABINET = 5,
}

export const productTypeOptions = [
    { value: ProductType.CHAIR, label: 'Ghế' },
    { value: ProductType.TABLE, label: 'Bàn' },
    { value: ProductType.SOFA, label: 'Sofa' },
    { value: ProductType.BED, label: 'Giường' },
    { value: ProductType.CABINET, label: 'Tủ' },
];

// =====================================================
// PRICING CONDITION
// =====================================================
export enum PricingCondition {
    SIZE_INCREMENT = 1,
    MATERIAL_CHANGE = 2,
}

export const pricingConditionOptions = [
    { value: PricingCondition.SIZE_INCREMENT, label: 'Tăng kích thước' },
    { value: PricingCondition.MATERIAL_CHANGE, label: 'Đổi vật liệu' },
];

// =====================================================
// MATERIAL MODIFIER
// =====================================================
export enum MaterialModifier {
    WOOD_STEEL = 1,
    STONE = 2,
    ALL = 3,
}

export const materialModifierOptions = [
    { value: MaterialModifier.WOOD_STEEL, label: 'Gỗ/Sắt' },
    { value: MaterialModifier.STONE, label: 'Đá' },
    { value: MaterialModifier.ALL, label: 'Tất cả' },
];

// =====================================================
// SURCHARGE SCOPE
// =====================================================
export enum SurchargeScope {
    SEAT_ONLY = 1,
    FULL = 2,
}

export const surchargeScopeOptions = [
    { value: SurchargeScope.SEAT_ONLY, label: 'Chỉ nệm ngồi' },
    { value: SurchargeScope.FULL, label: 'Toàn bộ' },
];

// =====================================================
// PRICE LEVEL
// =====================================================
export enum PriceLevel {
    RETAIL = 1,
    WHOLESALE = 2,
    BULK = 3,
}

export const priceLevelOptions = [
    { value: PriceLevel.RETAIL, label: 'Bán lẻ' },
    { value: PriceLevel.WHOLESALE, label: 'Bán sỉ' },
    { value: PriceLevel.BULK, label: 'Đại lý' },
];

// =====================================================
// DIMENSION TYPE
// =====================================================
export enum DimensionType {
    WIDTH = 1,
    LENGTH = 2,
    HEIGHT = 3,
}

export const dimensionTypeOptions = [
    { value: DimensionType.WIDTH, label: 'Chiều rộng' },
    { value: DimensionType.LENGTH, label: 'Chiều dài' },
    { value: DimensionType.HEIGHT, label: 'Chiều cao' },
];

// =====================================================
// THRESHOLD ACTION
// =====================================================
export enum ThresholdAction {
    AUTO_SURCHARGE = 1,
    WARNING = 2,
    MANUAL_QUOTE = 3,
}

export const thresholdActionOptions = [
    { value: ThresholdAction.AUTO_SURCHARGE, label: 'Tự động cộng phí' },
    { value: ThresholdAction.WARNING, label: 'Hiển thị cảnh báo' },
    { value: ThresholdAction.MANUAL_QUOTE, label: 'Báo giá thủ công' },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getProductTypeLabel(value?: number | null): string {
    if (!value) return 'Tất cả';
    const option = productTypeOptions.find(o => o.value === value);
    return option?.label || `Loại ${value}`;
}

export function getPricingConditionLabel(value: number): string {
    const option = pricingConditionOptions.find(o => o.value === value);
    return option?.label || `Điều kiện ${value}`;
}

export function getMaterialModifierLabel(value?: number | null): string {
    if (!value) return 'Không áp dụng';
    const option = materialModifierOptions.find(o => o.value === value);
    return option?.label || `Modifier ${value}`;
}

export function getSurchargeScopeLabel(value: number): string {
    const option = surchargeScopeOptions.find(o => o.value === value);
    return option?.label || `Scope ${value}`;
}

export function getPriceLevelLabel(value: number): string {
    const option = priceLevelOptions.find(o => o.value === value);
    return option?.label || `Level ${value}`;
}

export function getDimensionTypeLabel(value: number): string {
    const option = dimensionTypeOptions.find(o => o.value === value);
    return option?.label || `Dimension ${value}`;
}

export function getThresholdActionLabel(value: number): string {
    const option = thresholdActionOptions.find(o => o.value === value);
    return option?.label || `Action ${value}`;
}
