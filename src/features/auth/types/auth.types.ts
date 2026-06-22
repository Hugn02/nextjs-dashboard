export interface User {
    id: string | number;
    fullName: string;
    email: string;
    role: string; // Ví dụ: 'admin', 'user', 'guest'
    // Thêm các trường khác của đối tượng User nếu có từ API của bạn
}
