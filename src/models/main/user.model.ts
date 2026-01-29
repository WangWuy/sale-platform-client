import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// ENUMS
// =====================================================

export enum UserRole {
  ADMIN = 1,
  MANAGER = 2,
  SALES = 3
}

export enum UserStatus {
  ACTIVE = 1,
  SUSPENDED = 2
}

/**
 * ResponseModel - Đúng với cấu trúc API trả về
 */
export class UserResponseModel extends BaseResponseModel {
  email: string = "";
  username: string = "";
  fullName: string = "";
  phone: string = "";
  role: number = UserRole.SALES;
  status: number = UserStatus.ACTIVE;
  avatarId?: string | null;
  avatarUrl?: string | null;
}

/**
 * Model - Sử dụng trong Component
 */
export class UserModel extends BaseModel {
  email: string = "";
  username: string = "";
  fullName: string = "";
  phone: string = "";
  role: number = UserRole.SALES;
  status: number = UserStatus.ACTIVE;
  avatarId: string | null = null;
  avatarUrl: string | null = null;

  constructor(resModel: UserResponseModel) {
    super(resModel);
    if (resModel) {
      this.email = resModel.email;
      this.username = resModel.username;
      this.fullName = resModel.fullName;
      this.phone = resModel.phone;
      this.role = resModel.role;
      this.status = resModel.status;
      this.avatarId = resModel.avatarId || null;
      this.avatarUrl = resModel.avatarUrl || null;
    }
  }

  /**
   * Lấy display name
   */
  getDisplayName(): string {
    return this.fullName || this.username || this.email;
  }

  /**
   * Kiểm tra có phải admin không
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Kiểm tra có phải manager không
   */
  isManager(): boolean {
    return this.role === UserRole.MANAGER;
  }

  /**
   * Kiểm tra có phải sales không
   */
  isSales(): boolean {
    return this.role === UserRole.SALES;
  }

  /**
   * Lấy tên role dạng string
   */
  getRoleName(): string {
    switch (this.role) {
      case UserRole.ADMIN:
        return "Admin";
      case UserRole.MANAGER:
        return "Manager";
      case UserRole.SALES:
        return "Sales";
      default:
        return "Unknown";
    }
  }

  /**
   * Kiểm tra user có active không
   */
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  /**
   * Kiểm tra user có bị suspended không
   */
  isSuspended(): boolean {
    return this.status === UserStatus.SUSPENDED;
  }

  /**
   * Lấy tên status dạng string
   */
  getStatusName(): string {
    switch (this.status) {
      case UserStatus.ACTIVE:
        return "Active";
      case UserStatus.SUSPENDED:
        return "Suspended";
      default:
        return "Unknown";
    }
  }
}

/**
 * Interface cho request đăng nhập
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interface cho response đăng nhập
 */
export interface LoginResponse {
  user: UserResponseModel;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

/**
 * Interface cho request đăng ký
 */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}