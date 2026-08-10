"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";

export default function SessionExpiredHandler() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("session_expired") === "true") {
        // Xóa token và user khỏi localStorage khi phiên đăng nhập hết hạn
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Reset state trong useAuthStore
        try {
          useAuthStore.getState().logout();
        } catch (e) {
          // Ignore nếu store chưa khởi tạo
        }

        // Phát event thông báo để giao diện (như Navbar) tự cập nhật ngay
        window.dispatchEvent(new Event("auth-state-changed"));

        // Xóa tham số session_expired trên thanh địa chỉ URL mà không reload lại trang
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  return null;
}
