export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
    id: string | number;
    fullName: string;
    email: string;
    role: UserRole; // Backend trả về: 'USER', 'ADMIN', 'SUPER_ADMIN'
    // Thêm các trường khác của đối tượng User nếu có từ API của bạn
}
