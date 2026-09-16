"use client";

import React, { useRef } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { OrderHistoryItem } from "@/src/features/orders/types";

export interface TabItem {
    id: string;
    label: string;
}

interface OrderHistoryTabsFilterProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    tabs: TabItem[];
    orders: OrderHistoryItem[];
    filteredCount: number;
}

export default function OrderHistoryTabsFilter({
    searchQuery,
    onSearchChange,
    activeTab,
    onTabChange,
    tabs,
    orders,
    filteredCount,
}: OrderHistoryTabsFilterProps) {
    const tabsScrollRef = useRef<HTMLDivElement>(null);

    return (
        <>
            {/* Thanh tìm kiếm đơn hàng (Search Bar) */}
            <div className="mb-6 w-full">
                <div className="relative w-full">
                    <Search className="w-4 h-4 text-[#c4a84f] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
                        className="w-full pl-11 pr-11 py-3 bg-white border border-[#ede0c4] rounded-lg text-sm text-[#2c1a00] placeholder:text-gray-400 focus:outline-none focus:border-[#c4a84f] focus:ring-2 focus:ring-[#c4a84f]/20 transition-all font-sans shadow-sm"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100"
                            title="Xóa tìm kiếm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {searchQuery.trim() && (
                    <p className="text-xs text-gray-500 font-sans mt-2">
                        Tìm thấy <span className="font-bold text-[#8b2500]">{filteredCount}</span> đơn hàng phù hợp với từ khóa &ldquo;<span className="italic text-gray-700">{searchQuery}</span>&rdquo;
                    </p>
                )}
            </div>

            {/* Tabs filter — scrollable with arrow buttons */}
            <div className="relative mb-8">
                {/* Left arrow */}
                <button
                    type="button"
                    onClick={() => tabsScrollRef.current?.scrollBy({ left: -180, behavior: "smooth" })}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white border border-[#ede0c4] rounded-full shadow-sm text-[#8b6914] hover:bg-[#fdf8ef] transition-all cursor-pointer"
                    aria-label="Cuộn trái"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Scrollable tab strip */}
                <div
                    ref={tabsScrollRef}
                    className="flex overflow-x-auto pb-2 border-b border-[#ede0c4] gap-1 no-scrollbar scroll-smooth mx-8"
                >
                    {tabs.map((tab) => {
                        const q = searchQuery.trim().toLowerCase();
                        const count = tab.id === "all"
                            ? (q ? filteredCount : orders.length)
                            : (q
                                ? orders.filter((o) => o.status === tab.id && (
                                    (o.publicId || "").toLowerCase().includes(q) ||
                                    (o.items || []).some((it) => (it.product?.productName || "").toLowerCase().includes(q))
                                )).length
                                : orders.filter((o) => o.status === tab.id).length
                            );

                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onTabChange(tab.id)}
                                className={`px-4 py-2.5 text-xs font-bold tracking-[1px] uppercase whitespace-nowrap border-b-2 transition-all font-sans cursor-pointer flex-shrink-0 ${
                                    isActive
                                        ? "border-[#c4a84f] text-[#c4a84f]"
                                        : "border-transparent text-gray-400 hover:text-[#2c1a00]"
                                }`}
                            >
                                {tab.label}
                                <span
                                    className={`ml-1.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                                        isActive
                                            ? "bg-[#c4a84f] text-white"
                                            : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right arrow */}
                <button
                    type="button"
                    onClick={() => tabsScrollRef.current?.scrollBy({ left: 180, behavior: "smooth" })}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white border border-[#ede0c4] rounded-full shadow-sm text-[#8b6914] hover:bg-[#fdf8ef] transition-all cursor-pointer"
                    aria-label="Cuộn phải"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </>
    );
}
