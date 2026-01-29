// User Role Enum (number-based - legacy)
export enum UserRole {
    ADMIN = 1,
    MANAGER = 2,
    SALES = 3
}

// User Role String (string-based - matches API)
export type UserRoleString = 'admin' | 'manager' | 'staff';

export const USER_ROLES: UserRoleString[] = ['admin', 'manager', 'staff'];

export const USER_ROLE_LABELS: Record<UserRoleString, string> = {
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    staff: 'Nhân viên',
};

export enum UserStatus {
    ACTIVE = 1,
    SUSPENDED = 2
}

export interface User {
    id: number;
    email: string;
    username?: string | null;
    fullName?: string | null;
    phone?: string | null;
    role: UserRole;
    status: UserStatus;
    avatarUrl?: string | null;
    emailVerifiedAt?: string | null;
    lastLoginAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    username?: string;
    fullName?: string;
    phone?: string;
    role?: UserRole;
    status?: UserStatus;
}

export interface UpdateUserRequest {
    email?: string;
    username?: string;
    fullName?: string;
    phone?: string;
    role?: UserRole;
    status?: UserStatus;
}

export interface UserListResponse {
    users: User[];
    total: number;
    page: number;
    totalPages: number;
}

export const UserRoleLabels: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Admin',
    [UserRole.MANAGER]: 'Manager',
    [UserRole.SALES]: 'Sales'
};

export const UserStatusLabels: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: 'Hoạt động',
    [UserStatus.SUSPENDED]: 'Tạm khóa'
};
