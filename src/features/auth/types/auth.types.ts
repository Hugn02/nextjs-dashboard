export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserGender = 'male' | 'female' | 'other';

export interface User {
    id: string | number;
    fullName?: string;
    email: string;
    role: UserRole;
    phone?: string | null;
    avatar?: string | null;
    gender?: UserGender | null;
    dateOfBirth?: string | null;
    profileCompleted?: boolean;
    isVerified?: boolean;
}
