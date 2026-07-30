"use client";

import Link from "next/link";
import { useState, useEffect, ChangeEvent } from "react";
import ModalWrapper from "@/src/components/ui/ModalWrapper";
import { User } from "@/src/features/auth/types/auth.types";
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

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3002/auth";
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

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
    pending: {
      text: "Chờ xác nhận",
      bg: "bg-[#fffbeb]",
      border: "border-[#fef3c7]",
      textClass: "text-[#d97706]"
    },
    confirmed: {
      text: "Đã xác nhận",
      bg: "bg-[#eff6ff]",
      border: "border-[#dbeafe]",
      textClass: "text-[#2563eb]"
    },
    shipping: {
      text: "Đang vận chuyển",
      bg: "bg-[#e0e7ff]",
      border: "border-[#c7d2fe]",
      textClass: "text-[#4f46e5]"
    },
    completed: {
      text: "Hoàn thành",
      bg: "bg-[#ecfdf5]",
      border: "border-[#d1fae5]",
      textClass: "text-[#059669]"
    },
    cancelled: {
      text: "Đã hủy",
      bg: "bg-[#fef2f2]",
      border: "border-[#fee2e2]",
      textClass: "text-[#dc2626]"
    },
  };
  return configs[status] || {
    text: status || "Chờ xử lý",
    bg: "bg-[#f8fafc]",
    border: "border-[#f1f5f9]",
    textClass: "text-[#64748b]"
  };
};

export default function UserModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password' | 'change-password' | 'profile'>('login');
  const [profileTab, setProfileTab] = useState<'info' | 'address' | 'orders'>('info');
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    oldPassword: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        setUser(parsed);
        setFullNameInput(parsed.fullName || '');
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  // Fetch locations when address tab is active
  useEffect(() => {
    if (user && mode === 'profile' && profileTab === 'address') {
      loadLocations();
    }
  }, [user, mode, profileTab]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (user && mode === 'profile' && profileTab === 'orders') {
      loadOrders();
    }
  }, [user, mode, profileTab]);

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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
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

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setMessage({ text: "Mật khẩu xác nhận không khớp", type: 'error' });
          setLoading(false);
          return;
        }

        const res = await fetch(`${AUTH_API}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword
          })
        });
        const result = await res.json();
        if (res.ok || result.success || result.statusCode === 201 || result.statusCode === 200) {
          setMessage({ text: "Đăng ký tài khoản thành công!", type: 'success' });
          setMode('login');
        } else {
          setMessage({ text: result.message || "Đăng ký thất bại", type: 'error' });
        }
      } else if (mode === 'login') {
        const res = await fetch(`${AUTH_API}/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });
        const result = await res.json();
        if (result.statusCode === 200) {
          localStorage.setItem('token', result.data.accessToken);
          localStorage.setItem('user', JSON.stringify(result.data.user));
          window.location.reload();
        } else {
          setMessage({ text: result.message || "Đăng nhập thất bại", type: 'error' });
        }
      } else if (mode === 'forgot-password') {
        if (!formData.email) {
          setMessage({ text: "Vui lòng nhập email của bạn", type: 'error' });
          setLoading(false);
          return;
        }

        const res = await fetch(`${AUTH_API}/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email
          })
        });
        const result = await res.json();
        if (res.ok || result.statusCode === 200) {
          setMessage({ text: "Mật khẩu ngẫu nhiên đã được gửi về email của bạn. Vui lòng kiểm tra và đăng nhập lại!", type: 'success' });
        } else {
          setMessage({ text: result.message || "Gửi yêu cầu thất bại", type: 'error' });
        }
      } else if (mode === 'change-password') {
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
          setMessage({ text: "Vui lòng nhập đầy đủ thông tin", type: 'error' });
          setLoading(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ text: "Mật khẩu mới xác nhận không khớp", type: 'error' });
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const res = await fetch(`${AUTH_API}/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword
          })
        });
        const result = await res.json();
        if (res.ok || result.statusCode === 200) {
          setMessage({ text: "Đổi mật khẩu thành công!", type: 'success' });
          setTimeout(() => {
            setFormData(prev => ({
              ...prev,
              oldPassword: '',
              newPassword: '',
              confirmPassword: ''
            }));
            setMessage(null);
            setMode('login');
          }, 2000);
        } else {
          setMessage({ text: result.message || "Đổi mật khẩu thất bại", type: 'error' });
        }
      }
    } catch (err) {
      setMessage({ text: "Lỗi kết nối máy chủ", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${AUTH_API}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error("Failed to call logout API", e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  return (
    <ModalWrapper
      title={
        user && mode === 'profile'
          ? undefined
          : user && mode === 'change-password'
            ? "Đổi mật khẩu"
            : user
              ? "Tài khoản của bạn"
              : mode === 'login'
                ? "Đăng nhập tài khoản"
                : mode === 'forgot-password'
                  ? "Khôi phục mật khẩu"
                  : "Tạo tài khoản mới"
      }
      onClose={onClose}
      // Khi modal con (thêm/sửa địa chỉ) đang mở, không cho phép modal cha đóng khi click ra ngoài.
      // Điều này ngăn việc click vào modal con bị coi là click "ra ngoài" modal cha.
      closeOnClickOutside={!showAddressForm}
      width={user && mode === 'profile' ? 780 : 480
      }
    >
      {/* ── MODE PROFILE VỚI SIDEBAR BÊN TRÁI ── */}
      {user && mode === 'profile' ? (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 font-sans">
          {/* SIDEBAR BÊN TAY TRÁI */}
          <div className="flex flex-col border-b md:border-b-0 md:border-r border-[#eee] pb-4 md:pb-0 md:pr-5 gap-4">
            {/* Header thông tin người dùng ở sidebar */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#f3ebdb]">
              <div className="w-11 h-11 bg-[#f7f3eb] rounded-full flex items-center justify-center border border-[#c4a84f]/30 text-[#c4a84f] font-bold text-base flex-shrink-0">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#2c1a00] text-sm truncate">{user.fullName}</p>
                <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
              </div>
            </div>

            {/* Điều hướng Sidebar */}
            <nav className="flex flex-col gap-5 text-sm">
              {/* NHÓM 1: TÀI KHOẢN CỦA TÔI */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#2c1a00] uppercase tracking-wider mb-2.5 px-2">
                  <span>Tài khoản của tôi</span>
                </div>
                <div className="flex flex-col gap-1 pl-3 border-l-2 border-[#f3ebdb]">
                  <button
                    onClick={() => setProfileTab('info')}
                    className={`text-left px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors border-none bg-transparent cursor-pointer ${profileTab === 'info'
                      ? "bg-[#faf6ed] text-[#c4a84f] font-bold"
                      : "text-gray-600 hover:text-[#c4a84f] hover:bg-[#faf7f2]"
                      }`}
                  >
                    Hồ sơ
                  </button>
                  <button
                    onClick={() => setProfileTab('address')}
                    className={`text-left px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors border-none bg-transparent cursor-pointer ${profileTab === 'address'
                      ? "bg-[#faf6ed] text-[#c4a84f] font-bold"
                      : "text-gray-600 hover:text-[#c4a84f] hover:bg-[#faf7f2]"
                      }`}
                  >
                    Địa chỉ
                  </button>
                </div>
              </div>

              {/* NHÓM 2: ĐƠN MUA */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#2c1a00] uppercase tracking-wider mb-2.5 px-2">
                  <span>Đơn mua</span>
                </div>
                <div className="flex flex-col gap-1 pl-3 border-l-2 border-[#f3ebdb]">
                  <button
                    onClick={() => setProfileTab('orders')}
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

            {/* Nút quay lại Menu chính */}
            <div className="mt-auto pt-4 border-t border-[#eee]">
              <button
                onClick={() => { setMode('login'); setMessage(null); }}
                className="w-full text-left px-3 py-2 rounded text-xs text-gray-500 hover:text-[#2c1a00] hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1.5"
              >
                <span>←</span> Quay lại Menu chính
              </button>
            </div>
          </div>

          {/* MAIN CONTENT AREA BÊN TAY PHẢI */}
          <div className="flex flex-col min-w-0">
            {/* ── SUBTAB 1: HỒ SƠ ── */}
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
                        <button
                          onClick={handleSaveProfileName}
                          className="px-3 py-1.5 bg-[#c4a84f] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] border-none cursor-pointer"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => { setEditingName(false); setFullNameInput(user.fullName || ''); }}
                          className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 border-none cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#2c1a00]">{user.fullName}</span>
                        <button
                          onClick={() => setEditingName(true)}
                          className="text-xs text-[#c4a84f] hover:underline font-semibold border-none bg-transparent cursor-pointer"
                        >
                          Thay đổi
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                    <span className="text-gray-500 font-medium">Email:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">{user.email}</span>
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                        Đã xác minh
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2">
                    <span className="text-gray-500 font-medium">Vai trò:</span>
                    <span className="inline-block w-fit px-2.5 py-1 bg-[#c4a84f]/10 text-[#c4a84f] text-[11px] font-bold uppercase tracking-widest rounded">
                      {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? 'Quản trị viên' : 'Thành viên'}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-[#eee] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#2c1a00] text-xs uppercase tracking-wider">Bảo mật tài khoản</p>
                      <p className="text-xs text-gray-400 mt-0.5">Thay đổi mật khẩu định kỳ để bảo vệ tài khoản</p>
                    </div>
                    <button
                      onClick={() => { setMode('change-password'); setMessage(null); }}
                      className="px-4 py-2 bg-white border border-[#c4a84f] text-[#c4a84f] rounded text-xs font-bold uppercase tracking-wider hover:bg-[#c4a84f] hover:text-white transition-colors cursor-pointer"
                    >
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── SUBTAB 2: ĐỊA CHỈ ── */}
            {profileTab === 'address' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#ede0c4] pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-wider">Địa chỉ của tôi</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Quản lý địa chỉ giao nhận hàng của bạn</p>
                  </div>
                  <button
                    onClick={() => { setEditingLocation(undefined); setShowAddressForm(true); setLocationError(null); }}
                    className="px-3.5 py-2 rounded bg-[#e4393c] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#c42d30] transition-colors border-none cursor-pointer"
                  >
                    + Thêm địa chỉ mới
                  </button>
                </div>

                {locationError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded">
                    {locationError}
                  </div>
                )}

                {loadingLocations ? (
                  <div className="py-8 text-center text-gray-400 text-xs italic">Đang tải danh sách địa chỉ...</div>
                ) : locations.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs italic border border-dashed border-[#ede0c4] rounded">
                    Bạn chưa có địa chỉ lưu trữ nào.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {locations.map((loc) => (
                      <div
                        key={loc.id}
                        className={`p-3.5 rounded-lg border flex justify-between items-start gap-3 transition-all ${loc.isDefault ? "border-[#e4393c] bg-[#fffcfc]" : "border-[#ede0c4] bg-white"
                          }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[#1a1a1a] text-xs sm:text-sm">{loc.receiverName}</span>
                            <span className="text-gray-300 text-xs">|</span>
                            <span className="text-gray-600 font-semibold text-xs">{formatPhone(loc.phone)}</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {loc.address}, {loc.wardName}, {loc.districtName}, {loc.provinceName}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {loc.isDefault && (
                              <span className="inline-flex items-center border border-red-200 bg-red-50 text-[#e4393c] text-[10px] px-2 py-0.5 rounded font-semibold">
                                Mặc định
                              </span>
                            )}
                            <span className="inline-flex items-center bg-[#faf6ed] border border-[#ede0c4] text-[#8b6914] text-[10px] px-2 py-0.5 rounded font-medium">
                              {loc.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <button
                            onClick={() => { setEditingLocation(loc); setShowAddressForm(true); setLocationError(null); }}
                            className="text-xs text-[#c4a84f] hover:underline font-medium border-none bg-transparent cursor-pointer"
                          >
                            Cập nhật
                          </button>
                          {!loc.isDefault && (
                            <>
                              <button
                                onClick={() => handleSetDefaultAddress(loc.id)}
                                className="text-xs text-blue-500 hover:underline font-medium border-none bg-transparent cursor-pointer"
                              >
                                Thiết lập mặc định
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(loc)}
                                className="text-xs text-red-500 hover:underline font-medium border-none bg-transparent cursor-pointer"
                              >
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SUBTAB 3: ĐƠN MUA ── */}
            {profileTab === 'orders' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#ede0c4] pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-wider">Đơn Mua của tôi</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Xem danh sách các đơn hàng đã đặt</p>
                  </div>
                </div>

                {loadingOrders ? (
                  <div className="py-8 text-center text-gray-400 text-xs italic">Đang tải lịch sử đơn hàng...</div>
                ) : orders.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 text-xs italic border border-dashed border-[#ede0c4] rounded flex flex-col items-center gap-2">
                    <span className="text-3xl opacity-30">📦</span>
                    <span>Bạn chưa có đơn hàng nào.</span>
                    <Link
                      href="/products/all"
                      onClick={onClose}
                      className="mt-2 px-4 py-2 bg-[#c4a84f] text-white text-xs font-bold tracking-wider uppercase rounded no-underline"
                    >
                      Mua sắm ngay
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                    {orders.slice(0, 5).map((order) => {
                      const statusCfg = getOrderStatusConfig(order.status);
                      return (
                        <div key={order._id || order.id || order.publicId} className="p-3.5 border border-[#ede0c4] rounded-lg bg-white flex flex-col gap-2">
                          <div className="flex justify-between items-center border-b border-[#f3ebdb] pb-2 text-xs">
                            <span className="font-bold text-[#2c1a00]">Đơn hàng: #{order.publicId || order._id}</span>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.textClass}`}>
                              {statusCfg.text}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Số lượng: {order.items?.length || 0} sản phẩm</span>
                            <span className="font-bold text-red-600 text-sm">{(order.total || 0).toLocaleString("vi-VN")}₫</span>
                          </div>
                        </div>
                      );
                    })}

                    <Link
                      href="/orders/history"
                      onClick={onClose}
                      className="w-full py-2.5 text-center bg-[#faf7f2] border border-[#ede0c4] text-[#8b6914] rounded text-xs font-bold uppercase tracking-wider hover:bg-[#f3ebdb] no-underline transition-colors mt-1"
                    >
                      Xem chi tiết toàn bộ lịch sử đơn hàng
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : user && mode === 'change-password' ? (
        /* Giao diện đổi mật khẩu khi đã đăng nhập */
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full font-sans">
          <p className="text-center text-xs md:text-sm text-[#666] mb-5 md:mb-7 font-['Cormorant_Garamond',_serif]">
            Nhập thông tin để thay đổi mật khẩu của bạn:
          </p>

          {message && (
            <p className={`text-center text-xs mb-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}

          <div className="relative w-full mb-3">
            <input
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              placeholder="Mật khẩu cũ"
              value={formData.oldPassword}
              onChange={handleInputChange}
              className="w-full p-[12px_50px_12px_15px] md:p-[16px_50px_16px_18px] text-[14px] md:text-[15px] border border-[#ddd] rounded-lg outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-[#c4a84f] hover:text-[#a8893a] text-xs font-semibold select-none font-sans"
            >
              {showOldPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <div className="relative w-full mb-3">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              placeholder="Mật khẩu mới"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full p-[12px_50px_12px_15px] md:p-[16px_50px_16px_18px] text-[14px] md:text-[15px] border border-[#ddd] rounded-lg outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-[#c4a84f] hover:text-[#a8893a] text-xs font-semibold select-none font-sans"
            >
              {showNewPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <div className="text-left text-xs mb-3.5 space-y-1.5 font-sans text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="font-semibold text-slate-600 mb-1">Yêu cầu mật khẩu mới:</p>
            <div className="flex items-center gap-1.5">
              <span className={formData.newPassword.length >= 8 ? "text-emerald-600 font-medium" : "text-slate-400"}>
                {formData.newPassword.length >= 8 ? "✓" : "○"} Tối thiểu 8 ký tự
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={/(?=.*[A-Z])/.test(formData.newPassword) ? "text-emerald-600 font-medium" : "text-slate-400"}>
                {/(?=.*[A-Z])/.test(formData.newPassword) ? "✓" : "○"} Chứa ít nhất 1 chữ cái viết hoa
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={/(?=.*\d)/.test(formData.newPassword) ? "text-emerald-600 font-medium" : "text-slate-400"}>
                {/(?=.*\d)/.test(formData.newPassword) ? "✓" : "○"} Chứa ít nhất 1 chữ số
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])/.test(formData.newPassword) ? "text-emerald-600 font-medium" : "text-slate-400"}>
                {/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])/.test(formData.newPassword) ? "✓" : "○"} Chứa ít nhất 1 ký tự đặc biệt
              </span>
            </div>
          </div>

          <div className="relative w-full mb-5">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu mới"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full p-[12px_50px_12px_15px] md:p-[16px_50px_16px_18px] text-[14px] md:text-[15px] border border-[#ddd] rounded-lg outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-[#c4a84f] hover:text-[#a8893a] text-xs font-semibold select-none font-sans"
            >
              {showConfirmPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full p-3.5 md:p-4 bg-[#c4a84f] text-white border-none rounded-lg cursor-pointer text-[14px] md:text-[15px] font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] mb-3 transition-colors hover:bg-[#a8893a] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
          </button>

          <button
            type="button"
            onClick={() => { setMode('login'); setMessage(null); }}
            className="w-full p-3 md:p-4 border border-[#c4a84f] text-[#c4a84f] rounded-lg cursor-pointer text-[12px] md:text-[13px] font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] transition-all hover:bg-[#c4a84f] hover:text-white"
          >
            Quay lại
          </button>
        </form>
      ) : user ? (
        /* Giao diện Menu chính khi đã đăng nhập thành công */
        <div className="flex flex-col gap-4 md:gap-6 py-2 md:py-4 font-sans">
          <div className="text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#f7f3eb] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 border border-[#c4a84f]/20 shadow-inner text-[#c4a84f]">
              <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 488.9 488.9" xmlSpace="preserve">
                <g>
                  <path fill="currentColor" d="M477.7,454.8v-26c0-26.5-12.4-52-33.1-68.1c-48.2-37.4-97.3-63.5-114.5-72.2v-29.7c3.5-7.8,6.4-16.3,8.6-25.5   c12.8-4.6,19.8-23.4,24.5-40c6.3-22.1,5.6-37.6-1.8-46.2c7.8-42.5,4.3-73.8-10.3-93.1c-7.7-10.1-16.7-14.4-22.7-16.3   c-4.3-6-13-16.1-27.7-24.2C285.5,4.5,268.4,0,249.6,0c-3.4,0-6.8,0.2-9.8,0.4c-8.4,0.4-16.7,2-24.9,4.7c-0.1,0-0.2,0.1-0.3,0.1   c-9,3.1-17.8,7.6-26.3,13.4c-9.7,6.2-18.6,13.6-26.3,21.8c-15.1,15.5-25.1,33-29.4,51.7c-4.1,15.5-4.4,31.1-1,46.4   c-1.8,1.3-3.4,2.8-4.8,4.6c-6.9,9.1-7.2,23.4-1.1,45.1c4.2,15,9.8,30.3,19.3,37.2c2.8,14.4,7.5,27.5,13.8,39.1v24.1   c-17.2,8.7-66.3,34.7-114.5,72.2c-20.7,16.1-33.1,41.5-33.1,68.1v26c0,18.8,15.3,34,34,34h398.5   C462.4,488.9,477.7,473.6,477.7,454.8z M35.6,454.8v-26c0-19,8.8-37.2,23.6-48.7c52-40.3,104.9-66.9,115-71.8   c5.6-2.7,9.1-8.3,9.1-14.6v-32.5c0-2.2-0.6-4.3-1.7-6.2c-6.6-11.2-11.2-24.6-13.5-39.9c-0.8-4.9-4.4-8.8-9.1-10   c-1.3-1.5-5-6.9-9.7-23.6c-3.9-13.8-3.6-20.2-3.2-22.5c3.9,0.2,7.8-1.6,10.3-4.7c2.6-3.3,3.3-7.7,1.9-11.6   c-5.2-14.5-5.8-29.4-1.8-44.6c3.4-14.6,11.2-28.2,23.3-40.6c6.5-7,14-13.1,22-18.2c0.1-0.1,0.3-0.2,0.4-0.3   c6.7-4.7,13.7-8.2,20.6-10.6c0.1,0,0.2-0.1,0.2-0.1c5.9-2,12-3.1,18.4-3.4c17.5-1.5,33.2,1.8,47.1,9.9   c15.2,8.4,21.4,19.4,21.4,19.4c1.9,3.9,5.3,6.2,9.7,6.5c0.3,0,6.8,1,12.4,8.9c5.9,8.4,14.3,30,3.8,80.4c-1.2,5.6,1.7,11.2,6.8,13.6   c0.5,1.8,1.3,7.9-3,23.1c-3.8,13.4-6.9,19.5-8.7,22.2c-2.3-0.4-4.7-0.2-6.9,0.8c-3.8,1.6-6.6,5.1-7.3,9.1c-2.1,12-5.5,22.8-9.9,32   c-0.8,1.7-1.2,3.5-1.2,5.3v37.6c0,6.3,3.5,11.8,9.1,14.6c10.1,4.9,63,31.6,114.9,71.8c14.8,11.5,23.6,29.7,23.6,48.7v26   c0,5.2-4.3,9.5-9.5,9.5H45.2C39.9,464.4,35.6,460.1,35.6,454.8z"></path>
                </g>
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-['Cormorant_Garamond',_serif] font-bold text-[#2c1a00] uppercase tracking-wider">
              {user.fullName}
            </h3>
            <p className="text-xs md:text-sm text-[#888] font-sans mt-0.5 md:mt-1">{user.email}</p>
            <div className="inline-block mt-2 px-3 py-1 bg-[#c4a84f]/10 text-[#c4a84f] text-[10px] font-bold uppercase tracking-widest rounded">
              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? 'Quản trị viên' : 'Thành viên'}
            </div>
          </div>

          <div className="flex flex-col gap-1 md:gap-2 border-t border-[#eee] pt-4 md:pt-6 font-sans">
            {/* Lựa chọn HỒ SƠ CỦA BẠN -> Mở giao diện Sidebar */}
            <button
              onClick={() => { setMode('profile'); setProfileTab('info'); setMessage(null); }}
              className="w-full p-3 md:p-4 text-left hover:bg-[#faf7f2] transition-colors rounded-lg flex justify-between items-center group cursor-pointer border-none bg-transparent"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs md:text-sm font-semibold text-[#3d2b00] font-sans uppercase tracking-wider">Hồ sơ của bạn</span>
              </div>
              <span className="text-[#c4a84f] group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              onClick={() => { setMode('change-password'); setMessage(null); }}
              className="w-full p-3 md:p-4 text-left hover:bg-[#faf7f2] transition-colors rounded-lg flex justify-between items-center group cursor-pointer border-none bg-transparent"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs md:text-sm font-semibold text-[#3d2b00] font-sans uppercase tracking-wider">Đổi mật khẩu</span>
              </div>
              <span className="text-[#c4a84f] group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {/* Hiển thị link Admin nếu role là admin */}
            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
              <a
                href={`${ADMIN_URL}/?token=${localStorage.getItem('token')}&user=${encodeURIComponent(JSON.stringify(user))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 md:p-4 text-left hover:bg-[#faf7f2] transition-colors rounded-lg flex justify-between items-center group no-underline"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs md:text-sm font-semibold text-[#8b2500] font-sans uppercase tracking-wider">Trang quản trị sản phẩm</span>
                </div>
                <span className="text-[#c4a84f] group-hover:translate-x-1 transition-transform">→</span>
              </a>
            )}

            <Link
              href="/orders/history"
              onClick={onClose}
              className="w-full p-3 md:p-4 text-left hover:bg-[#faf7f2] transition-colors rounded-lg flex justify-between items-center group no-underline"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs md:text-sm font-semibold text-[#3d2b00] font-sans uppercase tracking-wider">Lịch sử đơn hàng</span>
              </div>
              <span className="text-[#c4a84f] group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="w-full p-3 md:p-4 mt-2 md:mt-4 border border-[#c4a84f] text-[#c4a84f] rounded-lg cursor-pointer text-[12px] md:text-[13px] font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] transition-all hover:bg-[#c4a84f] hover:text-white"
          >
            Đăng xuất
          </button>
        </div>
      ) : mode === 'login' ? (
        /* Form Đăng nhập */
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full font-sans">
          <p className="text-center text-xs md:text-sm text-[#666] mb-5 md:mb-7 font-['Cormorant_Garamond',_serif]">
            Nhập email và mật khẩu của bạn:
          </p>

          {message && (
            <p className={`text-center text-xs mb-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-[12px_15px] md:p-[16px_18px] text-[14px] md:text-[15px] border border-[#ddd] rounded-lg mb-3 outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
          />

          <div className="relative w-full mb-3.5">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-[12px_50px_12px_15px] md:p-[16px_50px_16px_18px] text-[14px] md:text-[15px] border border-[#ddd] rounded-lg outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-[#c4a84f] hover:text-[#a8893a] text-xs font-semibold select-none font-sans"
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <p className="text-[12px] text-[#888] mb-5 leading-[1.6] font-sans">
            Trang web này được bảo vệ bởi reCAPTCHA và tuân theo{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#1a73e8] no-underline hover:underline">
              Chính sách Quyền riêng tư
            </a> và{" "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-[#1a73e8] no-underline hover:underline">
              Điều khoản Dịch vụ
            </a> của Google.
          </p>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="w-full p-3.5 md:p-4 bg-[#c4a84f] text-white border-none rounded-lg cursor-pointer text-[14px] md:text-[15px] font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] mb-5 transition-colors hover:bg-[#a8893a] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          <p className="text-center text-[13px] text-[#666] mb-2 font-sans">
            Khách hàng mới?{" "}
            <button
              onClick={() => setMode('register')}
              className="text-[#c4a84f] border-none bg-transparent p-0 cursor-pointer font-semibold hover:underline"
            >
              Tạo tài khoản
            </button>
          </p>
          <p className="text-center text-[13px] text-[#666] m-0 font-sans">
            Quên mật khẩu?{" "}
            <button
              type="button"
              onClick={() => { setMode('forgot-password'); setMessage(null); }}
              className="text-[#c4a84f] border-none bg-transparent p-0 cursor-pointer font-semibold hover:underline"
            >
              Khôi phục mật khẩu
            </button>
          </p>
        </form>
      ) : mode === 'forgot-password' ? (
        /* Form Quên mật khẩu */
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full font-sans">
          <p className="text-center text-xs md:text-sm text-[#666] mb-5 md:mb-7 font-['Cormorant_Garamond',_serif]">
            Nhập email của bạn để nhận mật khẩu khôi phục ngẫu nhiên:
          </p>

          {message && (
            <p className={`text-center text-xs mb-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-[12px_15px] md:p-[16px_18px] text-[14px] md:text-[15px] border border-[#ddd] rounded-lg mb-5 outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
          />

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full p-3.5 md:p-4 bg-[#c4a84f] text-white border-none rounded-lg cursor-pointer text-[14px] md:text-[15px] font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] mb-3 transition-colors hover:bg-[#a8893a] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Gửi yêu cầu khôi phục"}
          </button>

          <button
            type="button"
            onClick={() => { setMode('login'); setMessage(null); }}
            className="w-full p-3 md:p-4 border border-[#c4a84f] text-[#c4a84f] rounded-lg cursor-pointer text-[12px] md:text-[13px] font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] transition-all hover:bg-[#c4a84f] hover:text-white"
          >
            Quay lại đăng nhập
          </button>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full font-sans">
          <p className="text-center text-sm text-[#666] mb-7 font-['Cormorant_Garamond',_serif]">
            Vui lòng điền đầy đủ các thông tin dưới đây:
          </p>

          {message && (
            <p className={`text-center text-xs mb-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}

          <input
            type="text"
            name="fullName"
            placeholder="Họ và tên"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full p-[16px_18px] text-[15px] border border-[#ddd] rounded-lg mb-3.5 outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-[16px_18px] text-[15px] border border-[#ddd] rounded-lg mb-3.5 outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
          />

          <div className="relative w-full mb-3.5">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-[16px_50px_16px_18px] text-[15px] border border-[#ddd] rounded-lg outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-[#c4a84f] hover:text-[#a8893a] text-xs font-semibold select-none font-sans"
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <div className="text-left text-xs mb-3.5 space-y-1.5 font-sans text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="font-semibold text-slate-600 mb-1">Yêu cầu mật khẩu:</p>
            <div className="flex items-center gap-1.5">
              <span className={formData.password.length >= 8 ? "text-emerald-600 font-medium" : "text-slate-400"}>
                {formData.password.length >= 8 ? "✓" : "○"} Tối thiểu 8 ký tự
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={/(?=.*[A-Z])/.test(formData.password) ? "text-emerald-600 font-medium" : "text-slate-400"}>
                {/(?=.*[A-Z])/.test(formData.password) ? "✓" : "○"} Chứa ít nhất 1 chữ cái viết hoa
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={/(?=.*\d)/.test(formData.password) ? "text-emerald-600 font-medium" : "text-slate-400"}>
                {/(?=.*\d)/.test(formData.password) ? "✓" : "○"} Chứa ít nhất 1 chữ số
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])/.test(formData.password) ? "text-emerald-600 font-medium" : "text-slate-400"}>
                {/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])/.test(formData.password) ? "✓" : "○"} Chứa ít nhất 1 ký tự đặc biệt
              </span>
            </div>
          </div>

          <div className="relative w-full mb-3.5">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full p-[16px_50px_16px_18px] text-[15px] border border-[#ddd] rounded-lg outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-[#c4a84f] hover:text-[#a8893a] text-xs font-semibold select-none font-sans"
            >
              {showConfirmPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <p className="text-[12px] text-[#888] mb-5 leading-[1.6] font-sans italic">
            Bằng việc tạo tài khoản, bạn đồng ý với các chính sách bảo mật của Bát Tràng Vietnam.
          </p>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="w-full p-4 bg-[#c4a84f] text-white border-none rounded-lg cursor-pointer text-[15px] font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] mb-5 transition-colors hover:bg-[#a8893a] disabled:bg-gray-400"
          >
            {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
          </button>

          <p className="text-center text-[13px] text-[#666] mb-2 font-sans">
            Đã có tài khoản?{" "}
            <button
              onClick={() => setMode('login')}
              className="text-[#c4a84f] border-none bg-transparent p-0 cursor-pointer font-semibold hover:underline"
            >
              Đăng nhập ngay
            </button>
          </p>
        </form>
      )}

      {/* Address Form Modal nếu người dùng mở form thêm / sửa địa chỉ */}
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
    </ModalWrapper>
  );
}
