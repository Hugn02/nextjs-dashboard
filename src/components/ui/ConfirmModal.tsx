"use client";

import { useEffect, useRef } from "react";

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = "Xác nhận thao tác",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onCancel();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        ref={panelRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-scaleIn font-sans"
      >
        <div className="p-6 flex flex-col items-center text-center">
          {/* ICON */}
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 border shadow-sm ${
              isDanger
                ? "bg-red-50 border-red-100 text-red-500"
                : variant === "warning"
                ? "bg-amber-50 border-amber-100 text-amber-500"
                : "bg-blue-50 border-blue-100 text-blue-500"
            }`}
          >
            {isDanger ? (
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>

          {/* TITLE */}
          <h3 className="text-lg font-bold text-[#2c1a00] mb-2 font-['Cormorant_Garamond',_serif] uppercase tracking-wider">
            {title}
          </h3>

          {/* MESSAGE */}
          <p className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-sm">
            {message}
          </p>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-3 px-6 pb-6 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-colors border-none cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider text-white transition-all border-none cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 ${
              isDanger
                ? "bg-red-600 hover:bg-red-700 active:bg-red-800"
                : "bg-[#c4a84f] hover:bg-[#a8893a]"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
