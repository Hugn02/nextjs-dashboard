"use client";

import ModalWrapper from "./ModalWrapper";

export default function UserModal({ onClose }: { onClose: () => void }) {
    return (
        <ModalWrapper title="Đăng nhập tài khoản" onClose={onClose} width={480}>
            {/* Subtitle */}
            <p
                style={{
                    textAlign: "center",
                    fontSize: 14,
                    color: "#666",
                    marginBottom: 28,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
            >
                Nhập email và mật khẩu của bạn:
            </p>

            {/* Email */}
            <input
                type="email"
                placeholder="Email"
                style={{
                    width: "100%",
                    padding: "16px 18px",
                    fontSize: 15,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    marginBottom: 14,
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    color: "#333",
                    background: "#fff",
                }}
                onFocus={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor = "#c4a84f")
                }
                onBlur={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor = "#ddd")
                }
            />

            {/* Mật khẩu */}
            <input
                type="password"
                placeholder="Mật khẩu"
                style={{
                    width: "100%",
                    padding: "16px 18px",
                    fontSize: 15,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    marginBottom: 14,
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    color: "#333",
                    background: "#fff",
                }}
                onFocus={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor = "#c4a84f")
                }
                onBlur={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor = "#ddd")
                }
            />

            {/* reCAPTCHA note */}
            <p
                style={{
                    fontSize: 12,
                    color: "#888",
                    marginBottom: 20,
                    lineHeight: 1.6,
                    fontFamily: "sans-serif",
                }}
            >
                This site is protected by reCAPTCHA and the Google{" "}
                <a href="#" style={{ color: "#1a73e8", textDecoration: "none" }}>
                    Privacy Policy
                </a>{" "}
                and{" "}
                <a href="#" style={{ color: "#1a73e8", textDecoration: "none" }}>
                    Terms of Service
                </a>{" "}
                apply.
            </p>

            {/* Nút đăng nhập — vàng đậm như ảnh */}
            <button
                style={{
                    width: "100%",
                    padding: "16px",
                    background: "#c4a84f",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    marginBottom: 20,
                    transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "#a8893a")
                }
                onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "#c4a84f")
                }
            >
                Đăng nhập
            </button>

            {/* Link phụ */}
            <p
                style={{
                    textAlign: "center",
                    fontSize: 13,
                    color: "#666",
                    margin: "0 0 8px",
                    fontFamily: "sans-serif",
                }}
            >
                Khách hàng mới?{" "}
                <a
                    href="/account/register"
                    style={{ color: "#c4a84f", textDecoration: "none", fontWeight: 600 }}
                >
                    Tạo tài khoản
                </a>
            </p>
            <p
                style={{
                    textAlign: "center",
                    fontSize: 13,
                    color: "#666",
                    margin: 0,
                    fontFamily: "sans-serif",
                }}
            >
                Quên mật khẩu?{" "}
                <a
                    href="/account/login#recover"
                    style={{ color: "#c4a84f", textDecoration: "none", fontWeight: 600 }}
                >
                    Khôi phục mật khẩu
                </a>
            </p>
        </ModalWrapper>
    );
}