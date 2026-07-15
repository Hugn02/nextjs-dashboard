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
  // Sử dụng state để chuyển đổi giữa 'login' và 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<User | null>(null); // Sử dụng interface User
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

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
            password: formData.password
          })
        });
        const result = await res.json();
        if (result.statusCode === 200) {
          setMessage({ text: "Đăng ký thành công! Vui lòng đăng nhập.", type: 'success' });
          setMode('login');
        } else {
          setMessage({ text: result.message || "Đăng ký thất bại", type: 'error' });
        }
      } else {
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
      title={user ? "Tài khoản của bạn" : (mode === 'login' ? "Đăng nhập tài khoản" : "Tạo tài khoản mới")}
      onClose={onClose}
      width={480}
    >
      {user ? (
        /* Giao diện khi đã đăng nhập thành công */
        <div className="flex flex-col gap-4 md:gap-6 py-2 md:py-4">
          <div className="text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#f7f3eb] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 border border-[#c4a84f]/20 shadow-inner">
              <span className="text-3xl">👤</span>
            </div>
            <h3 className="text-lg md:text-xl font-['Cormorant_Garamond',_serif] font-bold text-[#2c1a00] uppercase tracking-wider">
              {user.fullName}
            </h3>
            <p className="text-xs md:text-sm text-[#888] font-sans mt-0.5 md:mt-1">{user.email}</p>
            <div className="inline-block mt-2 px-3 py-1 bg-[#c4a84f]/10 text-[#c4a84f] text-[10px] font-bold uppercase tracking-widest rounded">
              {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </div>
          </div>

          <div className="flex flex-col gap-1 md:gap-2 border-t border-[#eee] pt-4 md:pt-6">
            <button className="w-full p-3 md:p-4 text-left hover:bg-[#faf7f2] transition-colors rounded-lg flex justify-between items-center group">
              <span className="text-xs md:text-sm font-semibold text-[#3d2b00] font-sans uppercase tracking-wider">Thông tin tài khoản</span>
              <span className="text-[#c4a84f] group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {/* Hiển thị link Admin nếu role là admin */}
            {user.role === 'admin' && (
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
        <>
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

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full p-[12px_15px] md:p-[16px_18px] text-[14px] md:text-[15px] border border-[#ddd] rounded-lg mb-3.5 outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
          />

          <p className="text-[12px] text-[#888] mb-5 leading-[1.6] font-sans">
            This site is protected by reCAPTCHA and the Google{" "}
            <a href="#" className="text-[#1a73e8] no-underline">Privacy Policy</a> and <a href="#" className="text-[#1a73e8] no-underline">Terms of Service</a> apply.
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
            <a href="/account/login#recover" className="text-[#c4a84f] no-underline font-semibold">Khôi phục mật khẩu</a>
          </p>
        </>
      ) : (
        <>
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

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full p-[16px_18px] text-[15px] border border-[#ddd] rounded-lg mb-3.5 outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full p-[16px_18px] text-[15px] border border-[#ddd] rounded-lg mb-3.5 outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
          />

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
        </>
      )}
    </ModalWrapper>
  );
}
