"use client";

import ModalWrapper from "./ModalWrapper";

export default function UserModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrapper title="Đăng nhập tài khoản" onClose={onClose} width={480}>
      <p className="text-center text-sm text-[#666] mb-7 font-['Cormorant_Garamond',_serif]">
        Nhập email và mật khẩu của bạn:
      </p>

      <input
        type="email"
        placeholder="Email"
        className="w-full p-[16px_18px] text-[15px] border border-[#ddd] rounded-lg mb-3.5 outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
      />

      <input
        type="password"
        placeholder="Mật khẩu"
        className="w-full p-[16px_18px] text-[15px] border border-[#ddd] rounded-lg mb-3.5 outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
      />

      <p className="text-[12px] text-[#888] mb-5 leading-[1.6] font-sans">
        This site is protected by reCAPTCHA and the Google{" "}
        <a href="#" className="text-[#1a73e8] no-underline">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="#" className="text-[#1a73e8] no-underline">
          Terms of Service
        </a>{" "}
        apply.
      </p>

      <button className="w-full p-4 bg-[#c4a84f] text-white border-none rounded-lg cursor-pointer text-[15px] font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] mb-5 transition-colors hover:bg-[#a8893a]">
        Đăng nhập
      </button>

      <p className="text-center text-[13px] text-[#666] mb-2 font-sans">
        Khách hàng mới?{" "}
        <a
          href="/account/register"
          className="text-[#c4a84f] no-underline font-semibold"
        >
          Tạo tài khoản
        </a>
      </p>
      <p className="text-center text-[13px] text-[#666] m-0 font-sans">
        Quên mật khẩu?{" "}
        <a
          href="/account/login#recover"
          className="text-[#c4a84f] no-underline font-semibold"
        >
          Khôi phục mật khẩu
        </a>
      </p>
    </ModalWrapper>
  );
}
