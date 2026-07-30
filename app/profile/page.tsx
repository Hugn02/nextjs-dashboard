"use client";

import { useState, useEffect, ChangeEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/src/layout/Navbar';
import Footer from '@/src/layout/Footer';
import { User } from '@/src/features/auth/types/auth.types';
import AddressFormModal from '@/src/features/location/components/AddressFormModal';
import {
    getUserLocations,
    createUserLocation,
    updateUserLocation,
    deleteUserLocation,
    setDefaultLocation,
} from '@/src/features/location/services/location.service';
import type { UserLocation, CreateUserLocationDto } from '@/src/features/location/types/location.types';
import { fetchWithAuth } from '@/src/lib/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const formatPhone = (phone?: string) => {
    if (!phone) return "";
    const trimmed = phone.trim();
    if (trimmed.startsWith("0")) {
        return `(+84) ${trimmed.slice(1)}`;
    }
    return trimmed;
};

const getOrderStatusConfig = (status: string) => {
    const configs: { [key: string]: { text: string; bg: string; border: string; textClass: string } } = {
        pending: { text: "Chờ xác nhận", bg: "bg-[#fffbeb]", border: "border-[#fef3c7]", textClass: "text-[#d97706]" },
        confirmed: { text: "Đã xác nhận", bg: "bg-[#eff6ff]", border: "border-[#dbeafe]", textClass: "text-[#2563eb]" },
        shipping: { text: "Đang vận chuyển", bg: "bg-[#e0e7ff]", border: "border-[#c7d2fe]", textClass: "text-[#4f46e5]" },
        completed: { text: "Hoàn thành", bg: "bg-[#ecfdf5]", border: "border-[#d1fae5]", textClass: "text-[#059669]" },
        cancelled: { text: "Đã hủy", bg: "bg-[#fef2f2]", border: "border-[#fee2e2]", textClass: "text-[#dc2626]" },
    };
    return configs[status] || { text: status || "Chờ xử lý", bg: "bg-[#f8fafc]", border: "border-[#f1f5f9]", textClass: "text-[#64748b]" };
};

function ProfilePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'info';

    const [profileTab, setProfileTab] = useState<'info' | 'address' | 'orders' | 'change-password'>(
        ['info', 'address', 'orders', 'change-password'].includes(initialTab) ? initialTab as 'info' | 'address' | 'orders' | 'change-password' : 'info'
    );
    const [user, setUser] = useState<User | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Address tab state
    const [locations, setLocations] = useState<UserLocation[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingLocation, setEditingLocation] = useState<UserLocation | undefined>();
    const [locationError, setLocationError] = useState<string | null>(null);

    // Profile editing state
    const [editingName, setEditingName] = useState(false);
    const [fullNameInput, setFullNameInput] = useState('');

    // Orders tab state
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Change password state
    const [changePasswordData, setChangePasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [changePasswordMessage, setChangePasswordMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3002/auth";

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser) as User;
                setUser(parsed);
                setFullNameInput(parsed.fullName || '');
            } catch (e) {
                setUser(null);
                router.push('/'); // Redirect if user data is invalid
            }
        } else {
            router.push('/'); // Redirect if not logged in
        }
    }, [router]);

    useEffect(() => {
        const tab = searchParams.get('tab') || 'info';
        if (['info', 'address', 'orders', 'change-password'].includes(tab)) {
            setProfileTab(tab as 'info' | 'address' | 'orders' | 'change-password');
        }
    }, [searchParams]);

    useEffect(() => {
        if (user && profileTab === 'address') {
            loadLocations();
        }
    }, [user, profileTab]);

    useEffect(() => {
        if (user && profileTab === 'orders') {
            loadOrders();
        }
    }, [user, profileTab]);

    const handleTabChange = (tab: 'info' | 'address' | 'orders' | 'change-password') => {
        setProfileTab(tab);
        router.push(`/profile?tab=${tab}`, { scroll: false });
    };

    const loadLocations = async () => {
        setLoadingLocations(true);
        setLocationError(null);
        try {
            const data = await getUserLocations();
            setLocations(data);
        } catch (err: any) {
            console.error("Failed to fetch locations", err);
            setLocationError("Không tải được danh sách địa chỉ");
        } finally {
            setLoadingLocations(false);
        }
    };

    const loadOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/orders/my-orders`);
            const result = await res.json();
            if (result.statusCode === 200 || result.success) {
                setOrders(result.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleSaveProfileName = () => {
        if (!fullNameInput.trim() || !user) return;
        const updatedUser = { ...user, fullName: fullNameInput.trim() };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditingName(false);
        setMessage({ text: "Cập nhật tên thành công!", type: 'success' });
    };

    const handleSetDefaultAddress = async (locId: string) => {
        try {
            await setDefaultLocation(locId);
            loadLocations();
        } catch (err: any) {
            setLocationError(err.message || "Thao tác thất bại");
        }
    };

    const handleDeleteAddress = async (loc: UserLocation) => {
        if (loc.isDefault) {
            setLocationError("Không thể xóa địa chỉ mặc định.");
            return;
        }
        if (!window.confirm(`Xóa địa chỉ "${loc.label}"?`)) return;
        try {
            await deleteUserLocation(loc.id);
            loadLocations();
        } catch (err: any) {
            setLocationError(err.message || "Xóa thất bại.");
        }
    };

    const handleAddressSubmit = async (dto: CreateUserLocationDto) => {
        if (editingLocation) {
            await updateUserLocation(editingLocation.id, dto);
        } else {
            await createUserLocation(dto);
        }
        setShowAddressForm(false);
        setEditingLocation(undefined);
        loadLocations();
    };

    const handlePasswordInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setChangePasswordData({ ...changePasswordData, [e.target.name]: e.target.value });
        setChangePasswordMessage(null);
    };

    const handleChangePasswordSubmit = async () => {
        setIsChangingPassword(true);
        setChangePasswordMessage(null);

        if (!changePasswordData.oldPassword || !changePasswordData.newPassword || !changePasswordData.confirmPassword) {
            setChangePasswordMessage({ text: "Vui lòng nhập đầy đủ thông tin", type: 'error' });
            setIsChangingPassword(false);
            return;
        }
        if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
            setChangePasswordMessage({ text: "Mật khẩu mới xác nhận không khớp", type: 'error' });
            setIsChangingPassword(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${AUTH_API}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    oldPassword: changePasswordData.oldPassword,
                    newPassword: changePasswordData.newPassword,
                    confirmPassword: changePasswordData.confirmPassword
                })
            });
            const result = await res.json();
            if (res.ok || result.statusCode === 200) {
                setChangePasswordMessage({ text: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", type: 'success' });
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push('/');
                }, 2500);
            } else {
                setChangePasswordMessage({ text: result.message || "Đổi mật khẩu thất bại", type: 'error' });
            }
        } catch (err) {
            setChangePasswordMessage({ text: "Lỗi kết nối máy chủ", type: 'error' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (!user) {
        return <div className="py-20 text-center">Đang tải thông tin người dùng...</div>;
    }

    return (
        <div className="bg-white pt-8 md:pt-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 font-sans">
                    {/* SIDEBAR */}
                    <aside className="flex flex-col border-b md:border-b-0 md:border-r border-[#eee] pb-4 md:pb-0 md:pr-5 gap-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-[#f3ebdb]">
                            <div className="w-11 h-11 bg-[#f7f3eb] rounded-full flex items-center justify-center border border-[#c4a84f]/30 text-[#c4a84f] font-bold text-base flex-shrink-0">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-[#2c1a00] text-sm truncate">{user.fullName}</p>
                                <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>

                        <nav className="flex flex-col gap-5 text-sm">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-bold text-[#2c1a00] uppercase tracking-wider mb-2.5 px-2">
                                    <span>Tài khoản của tôi</span>
                                </div>
                                <div className="flex flex-col gap-1 pl-3 border-l-2 border-[#f3ebdb]">
                                    <button
                                        onClick={() => handleTabChange('info')}
                                        className={`text-left px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors border-none bg-transparent cursor-pointer ${profileTab === 'info'
                                            ? "bg-[#faf6ed] text-[#c4a84f] font-bold"
                                            : "text-gray-600 hover:text-[#c4a84f] hover:bg-[#faf7f2]"
                                            }`}
                                    >
                                        Hồ sơ
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('address')}
                                        className={`text-left px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors border-none bg-transparent cursor-pointer ${profileTab === 'address'
                                            ? "bg-[#faf6ed] text-[#c4a84f] font-bold"
                                            : "text-gray-600 hover:text-[#c4a84f] hover:bg-[#faf7f2]"
                                            }`}
                                    >
                                        Địa chỉ
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('change-password')}
                                        className={`text-left px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors border-none bg-transparent cursor-pointer ${profileTab === 'change-password'
                                            ? "bg-[#faf6ed] text-[#c4a84f] font-bold"
                                            : "text-gray-600 hover:text-[#c4a84f] hover:bg-[#faf7f2]"
                                            }`}
                                    >
                                        Đổi mật khẩu
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-xs font-bold text-[#2c1a00] uppercase tracking-wider mb-2.5 px-2">
                                    <span>Đơn mua</span>
                                </div>
                                <div className="flex flex-col gap-1 pl-3 border-l-2 border-[#f3ebdb]">
                                    <button
                                        onClick={() => handleTabChange('orders')}
                                        className={`text-left px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors border-none bg-transparent cursor-pointer ${profileTab === 'orders'
                                            ? "bg-[#faf6ed] text-[#c4a84f] font-bold"
                                            : "text-gray-600 hover:text-[#c4a84f] hover:bg-[#faf7f2]"
                                            }`}
                                    >
                                        Lịch sử đơn mua
                                    </button>
                                </div>
                            </div>
                        </nav>
                    </aside>

                    {/* MAIN CONTENT */}
                    <main className="flex flex-col min-w-0">
                        {profileTab === 'info' && (
                            <div className="flex flex-col gap-4">
                                <div className="border-b border-[#ede0c4] pb-3">
                                    <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-wider">Hồ sơ của tôi</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                                </div>

                                {message && (
                                    <div className={`p-3 rounded text-xs ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <div className="flex flex-col gap-4 text-xs md:text-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                                        <span className="text-gray-500 font-medium">Họ và tên:</span>
                                        {editingName ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={fullNameInput}
                                                    onChange={(e) => setFullNameInput(e.target.value)}
                                                    className="px-3 py-1.5 border border-[#c4a84f] rounded text-sm outline-none bg-white focus:ring-1 focus:ring-[#c4a84f]"
                                                />
                                                <button onClick={handleSaveProfileName} className="px-3 py-1.5 bg-[#c4a84f] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] border-none cursor-pointer">Lưu</button>
                                                <button onClick={() => { setEditingName(false); setFullNameInput(user.fullName || ''); }} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 border-none cursor-pointer">Hủy</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-[#2c1a00]">{user.fullName}</span>
                                                <button onClick={() => setEditingName(true)} className="text-xs text-[#c4a84f] hover:underline font-semibold border-none bg-transparent cursor-pointer">Thay đổi</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                                        <span className="text-gray-500 font-medium">Email:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700">{user.email}</span>
                                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-semibold">Đã xác minh</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                                        <span className="text-gray-500 font-medium">Vai trò:</span>
                                        <span className="inline-block w-fit px-2.5 py-1 bg-[#c4a84f]/10 text-[#c4a84f] text-[11px] font-bold uppercase tracking-widest rounded">
                                            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? 'Quản trị viên' : 'Thành viên'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {profileTab === 'address' && (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between border-b border-[#ede0c4] pb-3">
                                    <div>
                                        <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-wider">Địa chỉ của tôi</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">Quản lý địa chỉ giao nhận hàng của bạn</p>
                                    </div>
                                    <button onClick={() => { setEditingLocation(undefined); setShowAddressForm(true); setLocationError(null); }} className="px-3.5 py-2 rounded bg-[#c4a84f] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] transition-colors border-none cursor-pointer">
                                        + Thêm địa chỉ mới
                                    </button>
                                </div>

                                {locationError && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded">{locationError}</div>}

                                {loadingLocations ? (
                                    <div className="py-8 text-center text-gray-400 text-xs italic">Đang tải danh sách địa chỉ...</div>
                                ) : locations.length === 0 ? (
                                    <div className="py-8 text-center text-gray-400 text-xs italic border border-dashed border-[#ede0c4] rounded">Bạn chưa có địa chỉ lưu trữ nào.</div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {locations.map((loc) => (
                                            <div key={loc.id} className={`p-3.5 rounded-lg border flex justify-between items-start gap-3 transition-all ${loc.isDefault ? "border-[#c4a84f] bg-[#fffcf8]" : "border-[#ede0c4] bg-white"}`}>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-[#1a1a1a] text-xs sm:text-sm">{loc.receiverName}</span>
                                                        <span className="text-gray-300 text-xs">|</span>
                                                        <span className="text-gray-600 font-semibold text-xs">{formatPhone(loc.phone)}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-relaxed">{loc.address}, {loc.wardName}, {loc.districtName}, {loc.provinceName}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {loc.isDefault && <span className="inline-flex items-center border border-red-200 bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded font-semibold">Mặc định</span>}
                                                        <span className="inline-flex items-center bg-[#faf6ed] border border-[#ede0c4] text-[#8b6914] text-[10px] px-2 py-0.5 rounded font-medium">{loc.label}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                    <button onClick={() => { setEditingLocation(loc); setShowAddressForm(true); setLocationError(null); }} className="text-xs text-[#c4a84f] hover:underline font-medium border-none bg-transparent cursor-pointer">Cập nhật</button>
                                                    {!loc.isDefault && (
                                                        <>
                                                            <button onClick={() => handleSetDefaultAddress(loc.id)} className="text-xs text-blue-500 hover:underline font-medium border-none bg-transparent cursor-pointer">Thiết lập mặc định</button>
                                                            <button onClick={() => handleDeleteAddress(loc)} className="text-xs text-red-500 hover:underline font-medium border-none bg-transparent cursor-pointer">Xóa</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {profileTab === 'change-password' && (
                            <div className="flex flex-col gap-4">
                                <div className="border-b border-[#ede0c4] pb-3">
                                    <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-wider">Đổi mật khẩu</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
                                </div>

                                {changePasswordMessage && (
                                    <div className={`p-3 rounded text-xs ${changePasswordMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                        {changePasswordMessage.text}
                                    </div>
                                )}

                                <form onSubmit={(e) => { e.preventDefault(); handleChangePasswordSubmit(); }} className="flex flex-col gap-4 text-xs md:text-sm max-w-md">
                                    <div className="relative w-full">
                                        <label className="block text-gray-500 font-medium mb-1.5">Mật khẩu cũ:</label>
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            name="oldPassword"
                                            placeholder="Nhập mật khẩu cũ"
                                            value={changePasswordData.oldPassword}
                                            onChange={handlePasswordInputChange}
                                            className="w-full px-3 py-2 border border-[#ddd] rounded text-sm outline-none bg-white focus:ring-1 focus:ring-[#c4a84f]"
                                        />
                                        <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-[38px] border-none bg-transparent cursor-pointer text-[#c4a84f] hover:text-[#a8893a] text-xs font-semibold">
                                            {showOldPassword ? "Ẩn" : "Hiện"}
                                        </button>
                                    </div>

                                    <div className="relative w-full">
                                        <label className="block text-gray-500 font-medium mb-1.5">Mật khẩu mới:</label>
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            placeholder="Nhập mật khẩu mới"
                                            value={changePasswordData.newPassword}
                                            onChange={handlePasswordInputChange}
                                            className="w-full px-3 py-2 border border-[#ddd] rounded text-sm outline-none bg-white focus:ring-1 focus:ring-[#c4a84f]"
                                        />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-[38px] border-none bg-transparent cursor-pointer text-[#c4a84f] hover:text-[#a8893a] text-xs font-semibold">
                                            {showNewPassword ? "Ẩn" : "Hiện"}
                                        </button>
                                    </div>

                                    <div className="text-left text-xs space-y-1.5 font-sans text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <p className="font-semibold text-slate-600 mb-1">Yêu cầu mật khẩu mới:</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className={changePasswordData.newPassword.length >= 8 ? "text-emerald-600 font-medium" : "text-slate-400"}>
                                                {changePasswordData.newPassword.length >= 8 ? "✓" : "○"} Tối thiểu 8 ký tự
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={/(?=.*[A-Z])/.test(changePasswordData.newPassword) ? "text-emerald-600 font-medium" : "text-slate-400"}>
                                                {/(?=.*[A-Z])/.test(changePasswordData.newPassword) ? "✓" : "○"} Chứa ít nhất 1 chữ cái viết hoa
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={/(?=.*\d)/.test(changePasswordData.newPassword) ? "text-emerald-600 font-medium" : "text-slate-400"}>
                                                {/(?=.*\d)/.test(changePasswordData.newPassword) ? "✓" : "○"} Chứa ít nhất 1 chữ số
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])/.test(changePasswordData.newPassword) ? "text-emerald-600 font-medium" : "text-slate-400"}>
                                                {/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])/.test(changePasswordData.newPassword) ? "✓" : "○"} Chứa ít nhất 1 ký tự đặc biệt
                                            </span>
                                        </div>
                                    </div>

                                    <div className="relative w-full">
                                        <label className="block text-gray-500 font-medium mb-1.5">Xác nhận mật khẩu mới:</label>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="Nhập lại mật khẩu mới"
                                            value={changePasswordData.confirmPassword}
                                            onChange={handlePasswordInputChange}
                                            className="w-full px-3 py-2 border border-[#ddd] rounded text-sm outline-none bg-white focus:ring-1 focus:ring-[#c4a84f]"
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[38px] border-none bg-transparent cursor-pointer text-[#c4a84f] hover:text-[#a8893a] text-xs font-semibold">
                                            {showConfirmPassword ? "Ẩn" : "Hiện"}
                                        </button>
                                    </div>

                                    <div className="mt-2">
                                        <button
                                            type="submit"
                                            disabled={isChangingPassword}
                                            className="px-6 py-2.5 bg-[#c4a84f] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] border-none cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {isChangingPassword ? "Đang lưu..." : "Lưu thay đổi"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {profileTab === 'orders' && (
                            <div className="flex flex-col gap-4">
                                <div className="border-b border-[#ede0c4] pb-3">
                                    <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-wider">Đơn Mua của tôi</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Xem danh sách các đơn hàng đã đặt</p>
                                </div>

                                {loadingOrders ? (
                                    <div className="py-8 text-center text-gray-400 text-xs italic">Đang tải lịch sử đơn hàng...</div>
                                ) : orders.length === 0 ? (
                                    <div className="py-10 text-center text-gray-400 text-xs italic border border-dashed border-[#ede0c4] rounded flex flex-col items-center gap-2">
                                        <span className="text-3xl opacity-30">📦</span>
                                        <span>Bạn chưa có đơn hàng nào.</span>
                                        <Link href="/products/all" className="mt-2 px-4 py-2 bg-[#c4a84f] text-white text-xs font-bold tracking-wider uppercase rounded no-underline">Mua sắm ngay</Link>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                                        {orders.slice(0, 5).map((order) => {
                                            const statusCfg = getOrderStatusConfig(order.status);
                                            return (
                                                <div key={order.id || order.publicId} className="p-3.5 border border-[#ede0c4] rounded-lg bg-white flex flex-col gap-2">
                                                    <div className="flex justify-between items-center border-b border-[#f3ebdb] pb-2 text-xs">
                                                        <span className="font-bold text-[#2c1a00]">Đơn hàng: #{order.publicId}</span>
                                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.textClass}`}>{statusCfg.text}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Số lượng: {order.items?.length || 0} sản phẩm</span>
                                                        <span className="font-bold text-red-600 text-sm">{(order.total || 0).toLocaleString("vi-VN")}₫</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <Link href="/orders/history" className="w-full py-2.5 text-center bg-[#faf7f2] border border-[#ede0c4] text-[#8b6914] rounded text-xs font-bold uppercase tracking-wider hover:bg-[#f3ebdb] no-underline transition-colors mt-1">Xem chi tiết toàn bộ lịch sử đơn hàng</Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
            {showAddressForm && (
                <AddressFormModal
                    editData={editingLocation}
                    onClose={() => {
                        setShowAddressForm(false);
                        setEditingLocation(undefined);
                    }}
                    onSubmit={handleAddressSubmit}
                />
            )}
        </div>
    );
}

export default function ProfilePage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#faf8f5] pt-[88px] md:pt-[120px]">
                <Suspense fallback={<div className="py-20 text-center">Đang tải trang...</div>}>
                    <ProfilePageContent />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
