'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SortOption {
    value: string;
    label: string;
}

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
    { value: 'name-asc', label: 'Tên: A-Z' },
    { value: 'name-desc', label: 'Tên: Z-A' },
    { value: 'price-asc', label: 'Giá: Thấp → Cao' },
    { value: 'price-desc', label: 'Giá: Cao → Thấp' },
    { value: 'newest', label: 'Mới nhất' },
];

interface ProductSortDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options?: SortOption[];
    className?: string;
}

export default function ProductSortDropdown({
    value,
    onChange,
    options = DEFAULT_SORT_OPTIONS,
    className = '',
}: ProductSortDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value) || options[0];

    // Close on click outside or escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`relative inline-block ${className}`} ref={dropdownRef}>
            {/* Trigger button matching website luxury aesthetic */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`font-['Cormorant_Garamond',_Georgia,_serif] flex items-center justify-between gap-2.5 min-w-[150px] cursor-pointer rounded-[2px] border px-3 py-2 text-[13px] text-[#3d2b00] bg-white transition-all duration-200 outline-none ${
                    isOpen
                        ? 'border-[#c4a84f] bg-[#c4a84f]/5 shadow-sm'
                        : 'border-[#ddd] hover:border-[#c4a84f]'
                }`}
            >
                <span className="truncate font-medium">
                    {selectedOption ? selectedOption.label : 'Chọn sắp xếp'}
                </span>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-[#888] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#c4a84f]' : ''
                    }`}
                />
            </button>

            {/* Custom dropdown menu */}
            {isOpen && (
                <div
                    role="listbox"
                    className="absolute right-0 top-full mt-1.5 w-full min-w-[165px] border border-[#ede0c4] bg-white shadow-[0_12px_36px_rgba(196,168,79,0.18)] rounded-[3px] py-1 z-[100] animate-in fade-in zoom-in-95 duration-150"
                >
                    {options.map((opt) => {
                        const isSelected = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => handleSelect(opt.value)}
                                className={`w-full flex items-center justify-between px-3.5 py-2 text-left font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] transition-colors cursor-pointer ${
                                    isSelected
                                        ? 'bg-[#faf7f2] text-[#c4a84f] font-bold'
                                        : 'text-[#3d2b00] hover:bg-[#faf7f2] hover:text-[#c4a84f]'
                                }`}
                            >
                                <span className="truncate pr-2">{opt.label}</span>
                                {isSelected && (
                                    <Check className="w-3.5 h-3.5 text-[#c4a84f] shrink-0 stroke-[2.5]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
