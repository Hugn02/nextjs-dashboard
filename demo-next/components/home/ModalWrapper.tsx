"use client";

import { useEffect, useRef } from "react";

interface ModalWrapperProps {
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
    width?: number; // px, mặc định 480
}

export default function ModalWrapper({
    title,
    onClose,
    children,
    width = 480,
}: ModalWrapperProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    // Đóng khi click ra ngoài panel
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        // delay nhỏ để tránh click mở đồng thời đóng ngay
        const timer = setTimeout(() => {
            document.addEventListener("mousedown", handleClick);
            document.addEventListener("keydown", handleKey);
        }, 50);

        return () => {
            clearTimeout(timer);
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [onClose]);

    return (
        <>
            {/* Backdrop trong suốt — chỉ để bắt click ra ngoài */}
            <div
                style={{
                    position: "fixed",
                    top: 114,           // Bắt đầu từ dưới navbar để không chặn click vào menu
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 199,
                    background: "transparent",
                }}
            />

            {/* Panel — thả xuống từ góc phải, bắt đầu từ dưới thanh navbar */}
            <div
                ref={panelRef}
                style={{
                    position: "fixed",
                    top: 114,           // Khớp với tổng chiều cao Navbar (26px topbar + 88px nav)
                    right: 0,
                    width,
                    // Chiều cao tự co theo nội dung, không full screen
                    maxHeight: "calc(100vh - 114px)",
                    overflowY: "auto",
                    background: "#fff",
                    zIndex: 200,
                    boxShadow: "-2px 4px 24px rgba(0,0,0,0.13)",
                    borderLeft: "1px solid #eee",
                    borderBottom: "1px solid #eee",
                    padding: "36px 40px 40px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    animation: "dropDown 0.22s ease",
                }}
            >
                <style>{`
                    @keyframes dropDown {
                        from { opacity: 0; transform: translateY(-12px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                `}</style>

                {/* Tiêu đề */}
                {title && (
                    <div style={{ marginBottom: 6, textAlign: "center" }}>
                        <h2
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                fontFamily: "'Cormorant Garamond', Georgia, serif",
                                color: "#2c1a00",
                                letterSpacing: 1.5,
                                margin: "0 0 6px",
                                textTransform: "uppercase",
                            }}
                        >
                            {title}
                        </h2>
                    </div>
                )}

                {/* Nội dung từng modal */}
                {children}
            </div>
        </>
    );
}