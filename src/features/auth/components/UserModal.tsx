"use client";

import Link from "next/link";
import { useState, useEffect, ChangeEvent } from "react";
import ModalWrapper from "@/src/components/ui/ModalWrapper";
import { User } from "@/src/features/auth/types/auth.types";

// const AUTH_API = "https://project-nestjs-hawx.onrender.com/auth"; // Hoặc URL của bạn
const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3002/auth";

// Định nghĩa URL trang Admin (Sử dụng biến môi trường nếu có, nếu không thì dùng localhost)
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

export default function UserModal({ onClose }: { onClose: () => void }) {
  // Sử dụng state để chuyển đổi giữa các mode
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password' | 'change-password'>('login');
  const [user, setUser] = useState<User | null>(null); // Sử dụng interface User
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

  // Kiểm tra trạng thái đăng nhập khi modal được mở
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as User); // Ép kiểu sang User
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
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
          // Lưu token và thông tin user vào localStorage hoặc Cookie
          localStorage.setItem('token', result.data.accessToken);
          localStorage.setItem('user', JSON.stringify(result.data.user));
          window.location.reload(); // Reload để cập nhật trạng thái auth toàn trang
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
    window.location.reload(); // Reload để cập nhật trạng thái toàn trang
  };

  return (
    <ModalWrapper
      title={
        user && mode === 'change-password'
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
      width={480}
    >
      {user && mode === 'change-password' ? (
        /* Giao diện đổi mật khẩu khi đã đăng nhập */
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full">
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
        /* Giao diện khi đã đăng nhập thành công */
        <div className="flex flex-col gap-4 md:gap-6 py-2 md:py-4">
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

          <div className="flex flex-col gap-1 md:gap-2 border-t border-[#eee] pt-4 md:pt-6">
            <button
              onClick={() => { setMode('change-password'); setMessage(null); }}
              className="w-full p-3 md:p-4 text-left hover:bg-[#faf7f2] transition-colors rounded-lg flex justify-between items-center group cursor-pointer"
            >
              <span className="text-xs md:text-sm font-semibold text-[#3d2b00] font-sans uppercase tracking-wider">Đổi mật khẩu</span>
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
                <span className="text-xs md:text-sm font-semibold text-[#8b2500] font-sans uppercase tracking-wider">Trang quản trị sản phẩm</span>
                <span className="text-[#c4a84f] group-hover:translate-x-1 transition-transform">→</span>
              </a>
            )}

            <Link href="/orders/history" className="w-full p-3 md:p-4 text-left hover:bg-[#faf7f2] transition-colors rounded-lg flex justify-between items-center group no-underline">
              <span className="text-xs md:text-sm font-semibold text-[#3d2b00] font-sans uppercase tracking-wider">Lịch sử đơn hàng</span>
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
        /* Form Đăng nhập cũ */
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full">
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
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full">
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
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full">
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
    </ModalWrapper>
  );
}
