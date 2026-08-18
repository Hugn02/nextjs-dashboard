"use client";

import { useState, useEffect, useRef, ChangeEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/src/layout/Navbar';
import Footer from '@/src/layout/Footer';
import { User } from '@/src/features/auth/types/auth.types';
import { useAuthStore } from '@/src/features/auth/hooks/useAuth';
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
import { formatImageUrl } from '@/src/lib/cloudinary';
import ConfirmModal from '@/src/components/ui/ConfirmModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const formatPhone = (phone?: string) => {
    if (!phone) return "";
    const trimmed = phone.trim();
    if (trimmed.startsWith("0")) return `(+84) ${trimmed.slice(1)}`;
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
    const { user: authUser, setUser: setAuthUser, logout } = useAuthStore();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'info';
    const isWelcome = searchParams.get('welcome') === '1';

    const [profileTab, setProfileTab] = useState<'info' | 'address' | 'orders' | 'change-password'>(
        ['info', 'address', 'orders', 'change-password'].includes(initialTab)
            ? initialTab as 'info' | 'address' | 'orders' | 'change-password'
            : 'info'
    );
    const [user, setUser] = useState<User | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Address
    const [locations, setLocations] = useState<UserLocation[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingLocation, setEditingLocation] = useState<UserLocation | undefined>();
    const [locationError, setLocationError] = useState<string | null>(null);

    // Confirm Modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        isLoading: boolean;
        onConfirm: () => Promise<void>;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Xác nhận',
        isLoading: false,
        onConfirm: async () => {},
    });

    // Profile form (connected to real API)
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        phone: '',
        gender: '' as '' | 'male' | 'female' | 'other',
        dateOfBirth: '',
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Avatar
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [showAvatarPreview, setShowAvatarPreview] = useState(false);

    // Orders
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Change password
    const [changePasswordData, setChangePasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [changePasswordMessage, setChangePasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3002/auth";

    // Sync authUser → local state
    useEffect(() => {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!savedToken) { router.push('/'); return; }
        if (authUser) {
            setUser(authUser);
            setProfileForm({
                fullName: authUser.fullName || '',
                phone: authUser.phone || '',
                gender: (authUser.gender as '' | 'male' | 'female' | 'other') || '',
                dateOfBirth: authUser.dateOfBirth
                    ? new Date(authUser.dateOfBirth).toISOString().split('T')[0]
                    : '',
            });
        }
    }, [authUser, router]);

    // Sync tab from URL
    useEffect(() => {
        const tab = searchParams.get('tab') || 'info';
        if (['info', 'address', 'orders', 'change-password'].includes(tab)) {
            setProfileTab(tab as 'info' | 'address' | 'orders' | 'change-password');
        }
    }, [searchParams]);

    useEffect(() => { if (user && profileTab === 'address') loadLocations(); }, [user, profileTab]);
    useEffect(() => { if (user && profileTab === 'orders') loadOrders(); }, [user, profileTab]);

    const handleTabChange = (tab: 'info' | 'address' | 'orders' | 'change-password') => {
        setProfileTab(tab);
        router.push(`/profile?tab=${tab}`, { scroll: false });
    };

    const loadLocations = async () => {
        setLoadingLocations(true); setLocationError(null);
        try { setLocations(await getUserLocations()); }
        catch { setLocationError("Không tải được danh sách địa chỉ"); }
        finally { setLoadingLocations(false); }
    };

    const loadOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/orders/my-orders`);
            const result = await res.json();
            if (result.statusCode === 200 || result.success) setOrders(result.data || []);
        } catch { console.error("Failed to fetch orders"); }
        finally { setLoadingOrders(false); }
    };

    /** Lưu hồ sơ → PATCH /auth/me */
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSavingProfile(true); setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const body: Record<string, string> = {};
            if (profileForm.fullName.trim()) body.fullName = profileForm.fullName.trim();
            if (profileForm.phone.trim()) body.phone = profileForm.phone.trim();
            if (profileForm.gender) body.gender = profileForm.gender;
            if (profileForm.dateOfBirth) body.dateOfBirth = profileForm.dateOfBirth;

            const res = await fetchWithAuth(`${AUTH_API}/me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (res.ok || result.statusCode === 200) {
                const updated: User = result.data ?? result;
                setUser(updated);
                setAuthUser(updated);
                setMessage({ text: "Cập nhật hồ sơ thành công!", type: 'success' });
                if (isWelcome && updated.profileCompleted) router.replace('/profile?tab=info');
            } else {
                setMessage({ text: result.message || "Cập nhật thất bại", type: 'error' });
            }
        } catch {
            setMessage({ text: "Lỗi kết nối máy chủ", type: 'error' });
        } finally {
            setIsSavingProfile(false);
        }
    };

    /** Upload avatar → Cloudinary qua BE → PATCH /auth/me */
    const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setAvatarUploading(true); setMessage(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await fetchWithAuth(`${API_URL}/products/upload`, {
                method: 'POST',
                body: formData,
            });
            const uploadResult = await uploadRes.json();
            const avatarUrl: string = uploadResult.data ?? uploadResult.url ?? uploadResult;
            if (!avatarUrl || typeof avatarUrl !== 'string') throw new Error('Upload thất bại');

            const patchRes = await fetchWithAuth(`${AUTH_API}/me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: avatarUrl }),
            });
            const patchResult = await patchRes.json();
            if (patchRes.ok || patchResult.statusCode === 200) {
                const updated: User = patchResult.data ?? patchResult;
                setUser(updated); setAuthUser(updated);
                setMessage({ text: "Cập nhật ảnh đại diện thành công!", type: 'success' });
            }
        } catch (err: any) {
            setMessage({ text: err.message || "Upload ảnh thất bại", type: 'error' });
        } finally {
            setAvatarUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    /** Xóa ảnh đại diện → dùng ConfirmModal */
    const handleRemoveAvatar = () => {
        if (!user || !user.avatar) return;
        setConfirmModal({
            isOpen: true,
            title: "Xóa ảnh đại diện",
            message: "Bạn có chắc chắn muốn xóa ảnh đại diện này?",
            confirmText: "Xóa ảnh",
            isLoading: false,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    const patchRes = await fetchWithAuth(`${AUTH_API}/me`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ avatar: '' }),
                    });
                    const patchResult = await patchRes.json();
                    if (patchRes.ok || patchResult.statusCode === 200) {
                        const updated: User = patchResult.data ?? patchResult;
                        setUser(updated);
                        setAuthUser(updated);
                        setMessage({ text: "Đã xóa ảnh đại diện thành công!", type: 'success' });
                    } else {
                        setMessage({ text: patchResult.message || "Xóa ảnh thất bại", type: 'error' });
                    }
                } catch {
                    setMessage({ text: "Lỗi kết nối máy chủ", type: 'error' });
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
                }
            },
        });
    };

    const handleSetDefaultAddress = async (locId: string) => {
        try { await setDefaultLocation(locId); loadLocations(); }
        catch (err: any) { setLocationError(err.message || "Thao tác thất bại"); }
    };

    /** Xóa địa chỉ → dùng ConfirmModal */
    const handleDeleteAddress = (loc: UserLocation) => {
        if (loc.isDefault) {
            setLocationError("Không thể xóa địa chỉ mặc định.");
            return;
        }
        setConfirmModal({
            isOpen: true,
            title: "Xóa địa chỉ giao hàng",
            message: `Bạn có chắc chắn muốn xóa địa chỉ "${loc.label || loc.address}"? Thao tác này không thể hoàn tác.`,
            confirmText: "Xóa địa chỉ",
            isLoading: false,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await deleteUserLocation(loc.id);
                    loadLocations();
                } catch (err: any) {
                    setLocationError(err.message || "Xóa thất bại.");
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
                }
            },
        });
    };

    const handleAddressSubmit = async (dto: CreateUserLocationDto) => {
        if (editingLocation) await updateUserLocation(editingLocation.id, dto);
        else await createUserLocation(dto);
        setShowAddressForm(false); setEditingLocation(undefined); loadLocations();
    };

    const handlePasswordInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setChangePasswordData({ ...changePasswordData, [e.target.name]: e.target.value });
        setChangePasswordMessage(null);
    };

    const handleChangePasswordSubmit = async () => {
        setIsChangingPassword(true); setChangePasswordMessage(null);
        if (!changePasswordData.oldPassword || !changePasswordData.newPassword || !changePasswordData.confirmPassword) {
            setChangePasswordMessage({ text: "Vui lòng nhập đầy đủ thông tin", type: 'error' });
            setIsChangingPassword(false); return;
        }
        if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
            setChangePasswordMessage({ text: "Mật khẩu mới xác nhận không khớp", type: 'error' });
            setIsChangingPassword(false); return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${AUTH_API}/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                credentials: 'include',
                body: JSON.stringify(changePasswordData),
            });
            const result = await res.json();
            if (res.ok || result.statusCode === 200) {
                setChangePasswordMessage({ text: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", type: 'success' });
                setTimeout(() => { logout(); router.push('/'); }, 2500);
            } else {
                setChangePasswordMessage({ text: result.message || "Đổi mật khẩu thất bại", type: 'error' });
            }
        } catch {
            setChangePasswordMessage({ text: "Lỗi kết nối máy chủ", type: 'error' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (!user) {
        return <div className="py-20 text-center text-gray-400 text-sm">Đang tải thông tin người dùng...</div>;
    }

    const avatarInitial = user.fullName
        ? user.fullName.charAt(0).toUpperCase()
        : user.email.charAt(0).toUpperCase();

    return (
        <div className="bg-white pt-8 md:pt-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

                {/* Welcome Banner */}
                {isWelcome && !user.profileCompleted && (
                    <div className="mb-6 bg-gradient-to-r from-amber-50 via-[#fdfbf7] to-amber-50/60 border border-[#ede0c4] rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c4a84f] to-[#9e8334] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#2c1a00] text-sm mb-0.5">Chào mừng bạn đến với Bát Tràng Vietnam!</p>
                            <p className="text-[#6e5828] text-xs leading-relaxed">Hãy hoàn thiện hồ sơ để trải nghiệm mua sắm tốt hơn. Thêm số điện thoại để nhận thông báo đơn hàng nhanh hơn.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 font-sans">
                    {/* ─── SIDEBAR ─── */}
                    <aside className="flex flex-col border-b md:border-b-0 md:border-r border-[#eee] pb-4 md:pb-0 md:pr-5 gap-4">
                        {/* Avatar mini + info */}
                        <div className="flex items-center gap-3 pb-3 border-b border-[#f3ebdb]">
                            <div
                                className="relative w-11 h-11 rounded-full flex-shrink-0 cursor-pointer group"
                                onClick={() => user.avatar ? setShowAvatarPreview(true) : avatarInputRef.current?.click()}
                                title={user.avatar ? "Bấm để xem ảnh phóng to" : "Bấm để tải ảnh đại diện"}
                            >
                                {user.avatar
                                    ? <img src={formatImageUrl(user.avatar, { width: 100 })} alt="Avatar" className="w-full h-full rounded-full object-cover border border-[#c4a84f]/30" />
                                    : <div className="w-full h-full bg-[#f7f3eb] rounded-full flex items-center justify-center border border-[#c4a84f]/30 text-[#c4a84f] font-bold text-base">{avatarInitial}</div>
                                }
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {user.avatar ? (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <span className="text-white text-[10px] font-bold">Thêm</span>
                                    )}
                                </div>
                                {avatarUploading && (
                                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-[#2c1a00] text-sm truncate">{user.fullName || 'Chưa cập nhật'}</p>
                                <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                                {!user.profileCompleted && (
                                    <span className="text-[10px] text-amber-600 font-medium">● Hồ sơ chưa đầy đủ</span>
                                )}
                            </div>
                        </div>

                        <nav className="flex flex-col gap-5 text-sm">
                            <div>
                                <div className="text-xs font-bold text-[#2c1a00] uppercase tracking-wider mb-2.5 px-2">Tài khoản của tôi</div>
                                <div className="flex flex-col gap-1 pl-3 border-l-2 border-[#f3ebdb]">
                                    {(['info', 'address', 'change-password'] as const).map((tab) => (
                                        <button key={tab} onClick={() => handleTabChange(tab)}
                                            className={`text-left px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors border-none bg-transparent cursor-pointer ${profileTab === tab ? "bg-[#faf6ed] text-[#c4a84f] font-bold" : "text-gray-600 hover:text-[#c4a84f] hover:bg-[#faf7f2]"}`}>
                                            {tab === 'info' ? 'Hồ sơ' : tab === 'address' ? 'Địa chỉ' : 'Đổi mật khẩu'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-[#2c1a00] uppercase tracking-wider mb-2.5 px-2">Đơn mua</div>
                                <div className="flex flex-col gap-1 pl-3 border-l-2 border-[#f3ebdb]">
                                    <button onClick={() => handleTabChange('orders')}
                                        className={`text-left px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors border-none bg-transparent cursor-pointer ${profileTab === 'orders' ? "bg-[#faf6ed] text-[#c4a84f] font-bold" : "text-gray-600 hover:text-[#c4a84f] hover:bg-[#faf7f2]"}`}>
                                        Lịch sử đơn mua
                                    </button>
                                </div>
                            </div>
                        </nav>
                    </aside>

                    {/* ─── MAIN CONTENT ─── */}
                    <main className="flex flex-col min-w-0">

                        {/* TAB: Hồ sơ */}
                        {profileTab === 'info' && (
                            <div className="flex flex-col gap-5">
                                <div className="border-b border-[#ede0c4] pb-3">
                                    <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-wider">Hồ sơ của tôi</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                                </div>

                                {message && (
                                    <div className={`p-3 rounded text-xs ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                        {message.text}
                                    </div>
                                )}

                                {/* Avatar upload section */}
                                <div className="flex items-center gap-4 p-4 bg-[#faf8f5] rounded-xl border border-[#ede0c4]">
                                    <div
                                        className="relative w-20 h-20 rounded-full flex-shrink-0 cursor-pointer group"
                                        onClick={() => user.avatar ? setShowAvatarPreview(true) : avatarInputRef.current?.click()}
                                        title={user.avatar ? "Bấm để xem ảnh phóng to" : "Bấm để chọn ảnh"}
                                    >
                                        {user.avatar
                                            ? <img src={formatImageUrl(user.avatar, { width: 200 })} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-[#c4a84f]/40" />
                                            : <div className="w-full h-full bg-[#f7f3eb] rounded-full flex items-center justify-center border-2 border-[#c4a84f]/40 text-[#c4a84f] font-bold text-2xl">{avatarInitial}</div>
                                        }
                                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            {user.avatar ? (
                                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </div>
                                        {avatarUploading && (
                                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => avatarInputRef.current?.click()}
                                                disabled={avatarUploading}
                                                className="px-4 py-2 border border-[#c4a84f] text-[#c4a84f] rounded text-xs font-bold uppercase tracking-wider hover:bg-[#c4a84f] hover:text-white transition-colors cursor-pointer bg-transparent disabled:opacity-50"
                                            >
                                                {avatarUploading ? "Đang tải lên..." : "Chọn ảnh"}
                                            </button>
                                            {user.avatar && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveAvatar}
                                                    disabled={avatarUploading}
                                                    className="px-4 py-2 border border-red-300 text-red-500 rounded text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors cursor-pointer bg-transparent disabled:opacity-50"
                                                >
                                                    Xóa ảnh
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-400">Tối đa 5MB. Định dạng JPG, PNG, WebP.</p>
                                    </div>
                                </div>

                                {/* Profile form */}
                                <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 text-xs md:text-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] items-center gap-2">
                                        <label className="text-gray-500 font-medium">Họ và tên:</label>
                                        <input type="text" value={profileForm.fullName}
                                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                            placeholder="Nhập họ và tên..."
                                            className="px-3 py-2 border border-[#ddd] rounded text-sm outline-none bg-white focus:border-[#c4a84f] focus:ring-1 focus:ring-[#c4a84f]" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] items-center gap-2">
                                        <label className="text-gray-500 font-medium">Email:</label>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700">{user.email}</span>
                                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-semibold">Đã xác minh</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] items-center gap-2">
                                        <label className="text-gray-500 font-medium">Số điện thoại:</label>
                                        <input type="tel" value={profileForm.phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            placeholder="VD: 0987654321"
                                            className="px-3 py-2 border border-[#ddd] rounded text-sm outline-none bg-white focus:border-[#c4a84f] focus:ring-1 focus:ring-[#c4a84f]" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] items-center gap-2">
                                        <label className="text-gray-500 font-medium">Giới tính:</label>
                                        <div className="flex gap-4">
                                            {([['male', 'Nam'], ['female', 'Nữ'], ['other', 'Khác']] as const).map(([val, label]) => (
                                                <label key={val} className="flex items-center gap-1.5 cursor-pointer text-gray-700">
                                                    <input type="radio" name="gender" value={val}
                                                        checked={profileForm.gender === val}
                                                        onChange={() => setProfileForm({ ...profileForm, gender: val })}
                                                        className="accent-[#c4a84f]" />
                                                    <span>{label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] items-center gap-2">
                                        <label className="text-gray-500 font-medium">Ngày sinh:</label>
                                        <input type="date" value={profileForm.dateOfBirth}
                                            max={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                                            className="px-3 py-2 border border-[#ddd] rounded text-sm outline-none bg-white focus:border-[#c4a84f] focus:ring-1 focus:ring-[#c4a84f] w-fit" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] items-center gap-2">
                                        <label className="text-gray-500 font-medium">Vai trò:</label>
                                        <span className="inline-block w-fit px-2.5 py-1 bg-[#c4a84f]/10 text-[#c4a84f] text-[11px] font-bold uppercase tracking-widest rounded">
                                            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? 'Quản trị viên' : 'Thành viên'}
                                        </span>
                                    </div>

                                    <div className="pt-2 border-t border-[#f3ebdb]">
                                        <button type="submit" disabled={isSavingProfile}
                                            className="px-6 py-2.5 bg-[#c4a84f] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                            {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* TAB: Địa chỉ */}
                        {profileTab === 'address' && (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between border-b border-[#ede0c4] pb-3">
                                    <div>
                                        <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-wider">Địa chỉ của tôi</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">Quản lý địa chỉ giao nhận hàng của bạn</p>
                                    </div>
                                    <button onClick={() => { setEditingLocation(undefined); setShowAddressForm(true); setLocationError(null); }}
                                        className="px-3.5 py-2 rounded bg-[#c4a84f] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] transition-colors border-none cursor-pointer">
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
                                                    <button onClick={() => { setEditingLocation(loc); setShowAddressForm(true); setLocationError(null); }}
                                                        className="text-xs text-[#c4a84f] hover:underline font-medium border-none bg-transparent cursor-pointer">Cập nhật</button>
                                                    {!loc.isDefault && (
                                                        <>
                                                            <button onClick={() => handleSetDefaultAddress(loc.id)}
                                                                className="text-xs text-blue-500 hover:underline font-medium border-none bg-transparent cursor-pointer">Thiết lập mặc định</button>
                                                            <button onClick={() => handleDeleteAddress(loc)}
                                                                className="text-xs text-red-500 hover:underline font-medium border-none bg-transparent cursor-pointer">Xóa</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: Đổi mật khẩu */}
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
                                    {[
                                        { key: 'oldPassword', label: 'Mật khẩu cũ:', show: showOldPassword, setShow: setShowOldPassword, placeholder: 'Nhập mật khẩu cũ' },
                                        { key: 'newPassword', label: 'Mật khẩu mới:', show: showNewPassword, setShow: setShowNewPassword, placeholder: 'Nhập mật khẩu mới' },
                                        { key: 'confirmPassword', label: 'Xác nhận mật khẩu:', show: showConfirmPassword, setShow: setShowConfirmPassword, placeholder: 'Nhập lại mật khẩu mới' },
                                    ].map(({ key, label, show, setShow, placeholder }) => (
                                        <div key={key} className="relative w-full">
                                            <label className="block text-gray-500 font-medium mb-1.5">{label}</label>
                                            <input
                                                type={show ? "text" : "password"} name={key} placeholder={placeholder}
                                                value={changePasswordData[key as keyof typeof changePasswordData]}
                                                onChange={handlePasswordInputChange}
                                                className="w-full px-3 py-2 border border-[#ddd] rounded text-sm outline-none bg-white focus:ring-1 focus:ring-[#c4a84f] pr-14" />
                                            <button type="button" onClick={() => setShow(!show)}
                                                className="absolute right-3 top-[38px] border-none bg-transparent cursor-pointer text-[#c4a84f] hover:text-[#a8893a] text-xs font-semibold">
                                                {show ? "Ẩn" : "Hiện"}
                                            </button>
                                        </div>
                                    ))}

                                    <div className="text-left text-xs space-y-1.5 text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <p className="font-semibold text-slate-600 mb-1">Yêu cầu mật khẩu mới:</p>
                                        {[
                                            [changePasswordData.newPassword.length >= 8, 'Tối thiểu 8 ký tự'],
                                            [/(?=.*[A-Z])/.test(changePasswordData.newPassword), 'Chứa ít nhất 1 chữ hoa'],
                                            [/(?=.*\d)/.test(changePasswordData.newPassword), 'Chứa ít nhất 1 chữ số'],
                                            [/(?=.*[!@#$%^&*])/.test(changePasswordData.newPassword), 'Chứa ít nhất 1 ký tự đặc biệt'],
                                        ].map(([ok, text], i) => (
                                            <div key={i} className={`flex items-center gap-1.5 ${ok ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                                                {ok ? '✓' : '○'} {text as string}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-2">
                                        <button type="submit" disabled={isChangingPassword}
                                            className="px-6 py-2.5 bg-[#c4a84f] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] border-none cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">
                                            {isChangingPassword ? "Đang lưu..." : "Lưu thay đổi"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* TAB: Đơn mua */}
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
                                        <Link href="/orders/history" className="w-full py-2.5 text-center bg-[#faf7f2] border border-[#ede0c4] text-[#8b6914] rounded text-xs font-bold uppercase tracking-wider hover:bg-[#f3ebdb] no-underline transition-colors mt-1">
                                            Xem chi tiết toàn bộ lịch sử đơn hàng
                                        </Link>
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
                    onClose={() => { setShowAddressForm(false); setEditingLocation(undefined); }}
                    onSubmit={handleAddressSubmit}
                />
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isLoading={confirmModal.isLoading}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Xem Trước Ảnh Preview Lightbox */}
            {showAvatarPreview && user.avatar && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-fadeIn"
                    onClick={() => setShowAvatarPreview(false)}
                >
                    <div
                        className="relative w-[90vw] sm:w-[500px] md:w-[560px] aspect-square rounded-2xl overflow-visible shadow-2xl animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowAvatarPreview(false)}
                            className="absolute -top-3.5 -right-3.5 w-9 h-9 rounded-full bg-white text-gray-800 shadow-2xl font-bold flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all hover:scale-110 border-none z-20 text-base"
                            title="Đóng"
                        >
                            ✕
                        </button>
                        <img
                            src={formatImageUrl(user.avatar, { width: 1200 })}
                            alt="Avatar Xem Trước"
                            className="w-full h-full object-cover rounded-2xl shadow-2xl block border-2 border-white/20"
                        />
                    </div>
                </div>
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
