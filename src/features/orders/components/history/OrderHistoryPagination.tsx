"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CustomSelect from "@/src/components/ui/CustomSelect";

interface OrderHistoryPaginationProps {
    currentPage: number;
    totalPages: number;
    startIndex: number;
    ordersPerPage: number;
    totalOrders: number;
    onPageChange: (page: number) => void;
    onOrdersPerPageChange: (perPage: number) => void;
}

export default function OrderHistoryPagination({
    currentPage,
    totalPages,
    startIndex,
    ordersPerPage,
    totalOrders,
    onPageChange,
    onOrdersPerPageChange,
}: OrderHistoryPaginationProps) {
    if (totalOrders === 0 || totalPages <= 1) return null;

    const getVisiblePages = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages: (number | string)[] = [];
        if (currentPage <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push("...");
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1);
            pages.push("...");
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push("...");
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="mt-8 pt-6 border-t border-[#ede0c4] flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Info text */}
            <div className="text-xs text-gray-500 font-sans order-2 md:order-1 text-center md:text-left">
                Hiển thị <span className="font-bold text-[#2c1a00]">{startIndex + 1}</span> -{" "}
                <span className="font-bold text-[#2c1a00]">{Math.min(startIndex + ordersPerPage, totalOrders)}</span> trên tổng số{" "}
                <span className="font-bold text-[#2c1a00]">{totalOrders}</span> đơn hàng
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1.5 font-sans order-1 md:order-2">
                {/* Prev Button */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 px-3 rounded-[2px] border border-[#ede0c4] bg-white text-xs font-semibold text-[#2c1a00] transition-all hover:bg-[#2c1a00] hover:text-[#c4a84f] hover:border-[#2c1a00] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#2c1a00] disabled:hover:border-[#ede0c4] cursor-pointer flex items-center gap-1"
                    aria-label="Trang trước"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Trước</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {getVisiblePages().map((pageItem, pIdx) => {
                        if (pageItem === "...") {
                            return (
                                <span key={`ellipsis-${pIdx}`} className="w-7 h-9 flex items-center justify-center text-xs text-gray-400 select-none">
                                    ...
                                </span>
                            );
                        }
                        const pageNum = Number(pageItem);
                        const isCurrent = currentPage === pageNum;
                        return (
                            <button
                                key={pageNum}
                                type="button"
                                onClick={() => onPageChange(pageNum)}
                                className={`min-w-[34px] h-9 px-2 rounded-[2px] text-xs font-bold transition-all border cursor-pointer ${
                                    isCurrent
                                        ? "bg-[#2c1a00] text-[#c4a84f] border-[#2c1a00] shadow-xs"
                                        : "bg-white text-[#2c1a00] border-[#ede0c4] hover:bg-[#faf7f2] hover:border-[#c4a84f]"
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 px-3 rounded-[2px] border border-[#ede0c4] bg-white text-xs font-semibold text-[#2c1a00] transition-all hover:bg-[#2c1a00] hover:text-[#c4a84f] hover:border-[#2c1a00] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#2c1a00] disabled:hover:border-[#ede0c4] cursor-pointer flex items-center gap-1"
                    aria-label="Trang sau"
                >
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Per page dropdown */}
            <div className="flex items-center gap-2 text-xs text-gray-500 font-sans order-3">
                <span>Xem:</span>
                <div className="w-36">
                    <CustomSelect
                        value={String(ordersPerPage)}
                        onChange={(val) => onOrdersPerPageChange(Number(val))}
                        options={[
                            { value: "5", label: "5 đơn / trang" },
                            { value: "10", label: "10 đơn / trang" },
                            { value: "15", label: "15 đơn / trang" },
                            { value: "20", label: "20 đơn / trang" },
                        ]}
                        buttonClassName="!py-1.5 !px-2.5 !text-xs !rounded-[2px]"
                    />
                </div>
            </div>
        </div>
    );
}
