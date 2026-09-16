"use client";

import { useState, useEffect, useRef, ChangeEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import { User } from "@/src/features/auth/types/auth.types";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import AddressFormModal from "@/src/features/location/components/AddressFormModal";
import {
    getUserLocations,
    createUserLocation,
    updateUserLocation,
    deleteUserLocation,
    setDefaultLocation,
} from "@/src/features/location/services/location.service";
import type { UserLocation, CreateUserLocationDto } from "@/src/features/location/types/location.types";
import { fetchWithAuth } from "@/src/lib/api-client";
import ConfirmModal from "@/src/components/ui/ConfirmModal";

import ProfileSidebar from "@/src/features/profile/components/ProfileSidebar";
import ProfileInfoTab from "@/src/features/profile/components/ProfileInfoTab";
import ProfileAddressTab from "@/src/features/profile/components/ProfileAddressTab";
import ProfileChangePasswordTab from "@/src/features/profile/components/ProfileChangePasswordTab";
import ProfileOrdersTab from "@/src/features/profile/components/ProfileOrdersTab";
import ProfileAvatarPreviewModal from "@/src/features/profile/components/ProfileAvatarPreviewModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3002/auth";

function ProfilePageContent() {
    const router = useRouter();
    const { user: authUser, setUser: setAuthUser, logout } = useAuthStore();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") || "info";
    const isWelcome = searchParams.get("welcome") === "1";

    const [profileTab, setProfileTab] = useState<"info" | "address" | "orders" | "change-password">(
        ["info", "address", "orders", "change-password"].includes(initialTab)
            ? (initialTab as "info" | "address" | "orders" | "change-password")
            : "info"
    );
    const [user, setUser] = useState<User | null>(null);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

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
        title: "",
        message: "",
        confirmText: "Xác nhận",
        isLoading: false,
        onConfirm: async () => {},
    });

    // Profile form
    const [profileForm, setProfileForm] = useState({
        fullName: "",
        phone: "",
        gender: "" as "" | "male" | "female" | "other",
        dateOfBirth: "",
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
    const [changePasswordData, setChangePasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [changePasswordMessage, setChangePasswordMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Sync authUser → local state
    useEffect(() => {
        if (!authUser) {
            useAuthStore.getState().fetchMe().then(() => {
                const u = useAuthStore.getState().user;
                if (!u) {
                    router.push("/");
                }
            });
            return;
        }
        setUser(authUser);
        setProfileForm({
            fullName: authUser.fullName || "",
            phone: authUser.phone || "",
            gender: (authUser.gender as "" | "male" | "female" | "other") || "",
            dateOfBirth: authUser.dateOfBirth
                ? new Date(authUser.dateOfBirth).toISOString().split("T")[0]
                : "",
        });
    }, [authUser, router]);

    // Sync tab from URL
    useEffect(() => {
        const tab = searchParams.get("tab") || "info";
        if (["info", "address", "orders", "change-password"].includes(tab)) {
            setProfileTab(tab as "info" | "address" | "orders" | "change-password");
        }
    }, [searchParams]);

    const loadLocations = async () => {
        setLoadingLocations(true);
        setLocationError(null);
        try {
            setLocations(await getUserLocations());
        } catch {
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
            if (result.statusCode === 200 || result.success) setOrders(result.data || []);
        } catch {
            console.error("Failed to fetch orders");
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        if (user && profileTab === "address") loadLocations();
    }, [user, profileTab]);

    useEffect(() => {
        if (user && profileTab === "orders") loadOrders();
    }, [user, profileTab]);

    const handleTabChange = (tab: "info" | "address" | "orders" | "change-password") => {
        setProfileTab(tab);
        router.push(`/profile?tab=${tab}`, { scroll: false });
    };

    /** Lưu hồ sơ → PATCH /auth/me */
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSavingProfile(true);
        setMessage(null);
        try {
            const body: Record<string, string> = {};
            if (profileForm.fullName.trim()) body.fullName = profileForm.fullName.trim();
            if (profileForm.phone.trim()) body.phone = profileForm.phone.trim();
            if (profileForm.gender) body.gender = profileForm.gender;
            if (profileForm.dateOfBirth) body.dateOfBirth = profileForm.dateOfBirth;

            const res = await fetchWithAuth(`${AUTH_API}/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (res.ok || result.statusCode === 200) {
                const updated: User = result.data ?? result;
                setUser(updated);
                setAuthUser(updated);
                setMessage({ text: "Cập nhật hồ sơ thành công!", type: "success" });
                if (isWelcome && updated.profileCompleted) router.replace("/profile?tab=info");
            } else {
                setMessage({ text: result.message || "Cập nhật thất bại", type: "error" });
            }
        } catch {
            setMessage({ text: "Lỗi kết nối máy chủ", type: "error" });
        } finally {
            setIsSavingProfile(false);
        }
    };

    /** Upload avatar → Cloudinary qua BE → PATCH /auth/me */
    const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setAvatarUploading(true);
        setMessage(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const uploadRes = await fetchWithAuth(`${API_URL}/products/upload`, {
                method: "POST",
                body: formData,
            });
            const uploadResult = await uploadRes.json();
            const avatarUrl: string = uploadResult.data ?? uploadResult.url ?? uploadResult;
            if (!avatarUrl || typeof avatarUrl !== "string") throw new Error("Upload thất bại");

            const patchRes = await fetchWithAuth(`${AUTH_API}/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar: avatarUrl }),
            });
            const patchResult = await patchRes.json();
            if (patchRes.ok || patchResult.statusCode === 200) {
                const updated: User = patchResult.data ?? patchResult;
                setUser(updated);
                setAuthUser(updated);
                setMessage({ text: "Cập nhật ảnh đại diện thành công!", type: "success" });
            }
        } catch (err: any) {
            setMessage({ text: err.message || "Upload ảnh thất bại", type: "error" });
        } finally {
            setAvatarUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = "";
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
                setConfirmModal((prev) => ({ ...prev, isLoading: true }));
                try {
                    const patchRes = await fetchWithAuth(`${AUTH_API}/me`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ avatar: "" }),
                    });
                    const patchResult = await patchRes.json();
                    if (patchRes.ok || patchResult.statusCode === 200) {
                        const updated: User = patchResult.data ?? patchResult;
                        setUser(updated);
                        setAuthUser(updated);
                        setMessage({ text: "Đã xóa ảnh đại diện thành công!", type: "success" });
                    } else {
                        setMessage({ text: patchResult.message || "Xóa ảnh thất bại", type: "error" });
                    }
                } catch {
                    setMessage({ text: "Lỗi kết nối máy chủ", type: "error" });
                } finally {
                    setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
                }
            },
        });
    };

    const handleSetDefaultAddress = async (locId: string) => {
        try {
            await setDefaultLocation(locId);
            loadLocations();
        } catch (err: any) {
            setLocationError(err.message || "Thao tác thất bại");
        }
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
                setConfirmModal((prev) => ({ ...prev, isLoading: true }));
                try {
                    await deleteUserLocation(loc.id);
                    loadLocations();
                } catch (err: any) {
                    setLocationError(err.message || "Xóa thất bại.");
                } finally {
                    setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
                }
            },
        });
    };

    const handleAddressSubmit = async (dto: CreateUserLocationDto) => {
        if (editingLocation) await updateUserLocation(editingLocation.id, dto);
        else await createUserLocation(dto);
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
            setChangePasswordMessage({ text: "Vui lòng nhập đầy đủ thông tin", type: "error" });
            setIsChangingPassword(false);
            return;
        }
        if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
            setChangePasswordMessage({ text: "Mật khẩu mới xác nhận không khớp", type: "error" });
            setIsChangingPassword(false);
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${AUTH_API}/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                credentials: "include",
                body: JSON.stringify(changePasswordData),
            });
            const result = await res.json();
            if (res.ok || result.statusCode === 200) {
                setChangePasswordMessage({ text: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", type: "success" });
                setTimeout(() => {
                    logout();
                    router.push("/");
                }, 2500);
            } else {
                setChangePasswordMessage({ text: result.message || "Đổi mật khẩu thất bại", type: "error" });
            }
        } catch {
            setChangePasswordMessage({ text: "Lỗi kết nối máy chủ", type: "error" });
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (!user) {
        return <div className="py-20 text-center text-gray-400 text-sm">Đang tải thông tin người dùng...</div>;
    }

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
                            <p className="text-[#6e5828] text-xs leading-relaxed">
                                Hãy hoàn thiện hồ sơ để trải nghiệm mua sắm tốt hơn. Thêm số điện thoại để nhận thông báo đơn hàng nhanh hơn.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 font-sans">
                    {/* ─── SIDEBAR ─── */}
                    <ProfileSidebar
                        user={user}
                        profileTab={profileTab}
                        avatarUploading={avatarUploading}
                        avatarInputRef={avatarInputRef}
                        onTabChange={handleTabChange}
                        onAvatarUpload={handleAvatarUpload}
                        onOpenAvatarPreview={() => setShowAvatarPreview(true)}
                    />

                    {/* ─── MAIN CONTENT ─── */}
                    <main className="flex flex-col min-w-0">
                        {profileTab === "info" && (
                            <ProfileInfoTab
                                user={user}
                                profileForm={profileForm}
                                setProfileForm={setProfileForm}
                                message={message}
                                isSavingProfile={isSavingProfile}
                                avatarUploading={avatarUploading}
                                avatarInputRef={avatarInputRef}
                                onSaveProfile={handleSaveProfile}
                                onRemoveAvatar={handleRemoveAvatar}
                                onOpenAvatarPreview={() => setShowAvatarPreview(true)}
                            />
                        )}

                        {profileTab === "address" && (
                            <ProfileAddressTab
                                locations={locations}
                                loadingLocations={loadingLocations}
                                locationError={locationError}
                                onAddNewAddress={() => {
                                    setEditingLocation(undefined);
                                    setShowAddressForm(true);
                                    setLocationError(null);
                                }}
                                onEditAddress={(loc) => {
                                    setEditingLocation(loc);
                                    setShowAddressForm(true);
                                    setLocationError(null);
                                }}
                                onSetDefaultAddress={handleSetDefaultAddress}
                                onDeleteAddress={handleDeleteAddress}
                            />
                        )}

                        {profileTab === "change-password" && (
                            <ProfileChangePasswordTab
                                user={user}
                                changePasswordData={changePasswordData}
                                isChangingPassword={isChangingPassword}
                                changePasswordMessage={changePasswordMessage}
                                showOldPassword={showOldPassword}
                                showNewPassword={showNewPassword}
                                showConfirmPassword={showConfirmPassword}
                                setShowOldPassword={setShowOldPassword}
                                setShowNewPassword={setShowNewPassword}
                                setShowConfirmPassword={setShowConfirmPassword}
                                onPasswordInputChange={handlePasswordInputChange}
                                onChangePasswordSubmit={handleChangePasswordSubmit}
                            />
                        )}

                        {profileTab === "orders" && (
                            <ProfileOrdersTab orders={orders} loadingOrders={loadingOrders} />
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

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isLoading={confirmModal.isLoading}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
            />

            <ProfileAvatarPreviewModal
                isOpen={showAvatarPreview}
                avatarUrl={user.avatar}
                onClose={() => setShowAvatarPreview(false)}
            />
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
