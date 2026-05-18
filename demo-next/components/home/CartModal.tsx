"use client";

import ModalWrapper from "./ModalWrapper";

export default function CartModal({ onClose }: { onClose: () => void }) {
    return (
        <ModalWrapper title="Giỏ hàng" onClose={onClose} width={480}>
            <p
                style={{
                    textAlign: "center",
                    fontSize: 14,
                    color: "#888",
                    marginBottom: 32,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
            >
                Giỏ hàng của bạn hiện đang trống
            </p>

            {/* Icon giỏ hàng trống */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <span style={{ fontSize: 56, opacity: 0.3 }}>🛒</span>
            </div>

            {/* Nút tiếp tục mua sắm */}
            <a
                href="/collections"
                style={{
                    display: "block",
                    width: "100%",
                    padding: "16px",
                    background: "#c4a84f",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    textAlign: "center",
                    textDecoration: "none",
                    boxSizing: "border-box",
                    transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "#a8893a")
                }
                onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "#c4a84f")
                }
            >
                Tiếp tục mua sắm
            </a>
        </ModalWrapper>
    );
}