// Material enums and helpers

export const MaterialGroup = {
    UPHOLSTERY: 1,  // Chất liệu bọc (Vải, Da, Si...)
    STRUCTURE: 2    // Chất liệu khung (Gỗ, Sắt, Đá...)
} as const;

export const MaterialTier = {
    BUDGET: 1,      // Giá rẻ
    STANDARD: 2,    // Tiêu chuẩn
    BASE: 3,        // Cơ bản
    MID: 4,         // Trung cấp
    PREMIUM: 5      // Cao cấp
} as const;

export const MaterialUnit = {
    PIECE: 'piece',
    M2: 'm2',
    CM: 'cm',
    KG: 'kg',
    METER: 'meter'
} as const;

// Helper functions
export const getMaterialGroupLabel = (group: number): string => {
    switch (group) {
        case MaterialGroup.UPHOLSTERY:
            return 'Chất liệu bọc';
        case MaterialGroup.STRUCTURE:
            return 'Chất liệu khung';
        default:
            return 'Không xác định';
    }
};

export const getMaterialTierLabel = (tier: number): string => {
    switch (tier) {
        case MaterialTier.BUDGET:
            return 'Giá rẻ';
        case MaterialTier.STANDARD:
            return 'Tiêu chuẩn';
        case MaterialTier.BASE:
            return 'Cơ bản';
        case MaterialTier.MID:
            return 'Trung cấp';
        case MaterialTier.PREMIUM:
            return 'Cao cấp';
        default:
            return 'Không xác định';
    }
};

export const getMaterialUnitLabel = (unit: string): string => {
    switch (unit) {
        case MaterialUnit.PIECE:
            return 'Cái';
        case MaterialUnit.M2:
            return 'm²';
        case MaterialUnit.CM:
            return 'cm';
        case MaterialUnit.KG:
            return 'kg';
        case MaterialUnit.METER:
            return 'mét';
        default:
            return unit;
    }
};

// Options for selects
export const materialGroupOptions = [
    { value: MaterialGroup.UPHOLSTERY, label: 'Chất liệu bọc (Vải, Da, Si...)' },
    { value: MaterialGroup.STRUCTURE, label: 'Chất liệu khung (Gỗ, Sắt, Đá...)' }
];

export const materialTierOptions = [
    { value: MaterialTier.BUDGET, label: 'Giá rẻ' },
    { value: MaterialTier.STANDARD, label: 'Tiêu chuẩn' },
    { value: MaterialTier.BASE, label: 'Cơ bản' },
    { value: MaterialTier.MID, label: 'Trung cấp' },
    { value: MaterialTier.PREMIUM, label: 'Cao cấp' }
];

export const materialUnitOptions = [
    { value: MaterialUnit.PIECE, label: 'Cái (piece)' },
    { value: MaterialUnit.M2, label: 'Mét vuông (m²)' },
    { value: MaterialUnit.CM, label: 'Centimet (cm)' },
    { value: MaterialUnit.KG, label: 'Kilogram (kg)' },
    { value: MaterialUnit.METER, label: 'Mét (meter)' }
];
