"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, ChangeEvent } from "react";
import ModalWrapper from "@/src/components/ui/ModalWrapper";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import { formatImageUrl } from "@/src/lib/cloudinary";

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3002/auth";
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

export default function UserModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { user, login, logout } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


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
          // Lưu token vào localStorage, gọi /auth/me để lấy user vào Zustand store
          const loggedInUser = await login(result.data.accessToken);
          // Nếu hồ sơ chưa hoàn thiện → redirect tới profile để hoàn thiện
          if (loggedInUser && !loggedInUser.profileCompleted) {
            onClose();
            router.push('/profile?tab=info&welcome=1');
          } else {
            window.location.reload();
          }
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
    window.dispatchEvent(new Event("auth-state-changed"));
    logout();
    window.location.reload();
  };

  return (
    <ModalWrapper
      title={user ? "Tài khoản của bạn"
        : mode === 'login' ? "Đăng nhập tài khoản"
          : mode === 'forgot-password' ? "Khôi phục mật khẩu"
            : "Tạo tài khoản mới"}
      onClose={onClose}
      width={480}
    >
      {user ? (
        /* Giao diện Menu chính khi đã đăng nhập thành công */
        <div className="flex flex-col gap-4 md:gap-6 py-2 md:py-4 font-sans">
          <div className="text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#f7f3eb] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 border border-[#c4a84f]/20 shadow-inner text-[#c4a84f] overflow-hidden">
              {user.avatar ? (
                <img
                  src={formatImageUrl(user.avatar, { width: 160 })}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-[#f7f3eb] rounded-full flex items-center justify-center text-[#c4a84f] font-bold text-xl md:text-2xl">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
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
            <Link
              href="/profile"
              onClick={onClose}
              className="w-full p-3 md:p-4 text-left hover:bg-[#faf7f2] transition-colors rounded-lg flex justify-between items-center group no-underline"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs md:text-sm font-semibold text-[#3d2b00] font-sans uppercase tracking-wider">Hồ sơ của bạn</span>
              </div>
              <span className="text-[#c4a84f] group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            {/* Hiển thị link Admin nếu role là admin */}
            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
              <a
                href={`${ADMIN_URL}/?token=${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}&user=${encodeURIComponent(JSON.stringify(user))}`}
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
    </ModalWrapper>
  );
}
