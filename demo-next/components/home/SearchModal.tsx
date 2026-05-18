"use client";

import { useRef, useEffect } from "react";
import ModalWrapper from "./ModalWrapper";

export default function SearchModal({ onClose }: { onClose: () => void }) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Tự focus vào input khi mở
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <ModalWrapper title="Tìm kiếm sản phẩm" onClose={onClose} width={480}>
            <p
                style={{
                    textAlign: "center",
                    fontSize: 14,
                    color: "#666",
                    marginBottom: 24,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
            >
                Nhập tên sản phẩm hoặc bộ sưu tập:
            </p>

            {/* Input tìm kiếm */}
            <div style={{ position: "relative", marginBottom: 16 }}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    style={{
                        width: "100%",
                        padding: "16px 50px 16px 18px",
                        fontSize: 15,
                        border: "1px solid #ddd",
                        borderRadius: 8,
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
                {/* Icon kính lúp */}
                <button
                    style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 18,
                        color: "#c4a84f",
                        padding: 0,
                    }}
                >
                    🔍
                </button>
            </div>

            {/* Gợi ý nhanh */}
            <div>
                <p
                    style={{
                        fontSize: 12,
                        color: "#aaa",
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        marginBottom: 10,
                        fontFamily: "sans-serif",
                    }}
                >
                    Tìm kiếm phổ biến
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {["Bộ ấm trà", "Bình hoa", "Bộ bát đĩa", "Sứ trắng", "Quà tặng"].map(
                        (tag) => (
                            <button
                                key={tag}
                                style={{
                                    padding: "6px 14px",
                                    border: "1px solid #e0d0b0",
                                    borderRadius: 20,
                                    background: "#fdf8ef",
                                    color: "#8b6914",
                                    fontSize: 13,
                                    cursor: "pointer",
                                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                                    transition: "all 0.2s",
                                }}
                                onClick={() => {
                                    if (inputRef.current) {
                                        inputRef.current.value = tag;
                                        inputRef.current.focus();
                                    }
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget as HTMLElement;
                                    el.style.background = "#c4a84f";
                                    el.style.color = "#fff";
                                    el.style.borderColor = "#c4a84f";
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLElement;
                                    el.style.background = "#fdf8ef";
                                    el.style.color = "#8b6914";
                                    el.style.borderColor = "#e0d0b0";
                                }}
                            >
                                {tag}
                            </button>
                        )
                    )}
                </div>
            </div>
        </ModalWrapper>
    );
}