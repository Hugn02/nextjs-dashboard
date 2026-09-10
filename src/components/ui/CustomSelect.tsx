'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  buttonClassName?: string;
  portal?: boolean;
  name?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  disabled = false,
  searchable,
  className = '',
  buttonClassName = '',
  portal = true,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    dropUp: boolean;
  }>({
    top: 0,
    left: 0,
    width: 0,
    dropUp: false,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-enable search if there are more than 10 options and searchable is not explicitly false
  const isSearchable = searchable ?? options.length > 10;

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase().trim();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, searchTerm]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Calculate position (drop-down by default, flip up if near bottom)
  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedMenuHeight = 260; // Max height of dropdown

    const dropUp = spaceBelow < estimatedMenuHeight && rect.top > spaceBelow;
    const width = Math.max(Math.round(rect.width), 120);

    let left = rect.left;
    if (typeof window !== 'undefined' && left + width > window.innerWidth) {
      left = Math.max(8, window.innerWidth - width - 8);
    }

    setCoords({
      top: dropUp ? rect.top - 4 : rect.bottom + 4,
      left,
      width,
      dropUp,
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      calculatePosition();
      setSearchTerm('');
    }
    setIsOpen(!isOpen);
  };

  // Focus search input on open
  useEffect(() => {
    if (isOpen && isSearchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isSearchable]);

  // Click outside, escape, scroll handling
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = (e: Event) => {
      // Don't close if scrolling inside the dropdown menu itself
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const menuContent = (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        width: `${coords.width}px`,
        transform: coords.dropUp ? 'translateY(-100%)' : 'none',
        zIndex: 99999,
      }}
      className="bg-white border border-[#ede0c4] rounded shadow-xl overflow-hidden font-sans text-xs animate-in fade-in zoom-in-95 duration-150 flex flex-col"
    >
      {/* Search Input if enabled */}
      {isSearchable && (
        <div className="p-2 border-b border-[#ede0c4] bg-[#faf8f5] flex items-center gap-1.5 sticky top-0 z-10">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full bg-transparent text-xs text-[#2c1a00] outline-none placeholder:text-gray-400 font-sans"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Options List */}
      <div className="max-h-60 overflow-y-auto py-1 divide-y divide-gray-50 scrollbar-thin">
        {filteredOptions.length === 0 ? (
          <div className="py-3 px-3 text-center text-gray-400 text-xs italic">
            Không tìm thấy kết quả
          </div>
        ) : (
          filteredOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => !opt.disabled && handleSelect(opt.value)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                  opt.disabled
                    ? 'opacity-40 cursor-not-allowed bg-gray-50'
                    : isSelected
                    ? 'bg-[#faf7f2] text-[#c4a84f] font-bold'
                    : 'text-[#2c1a00] hover:bg-[#faf7f2] hover:text-[#c4a84f]'
                }`}
              >
                <span className="truncate pr-2">{opt.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#c4a84f] shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative inline-block w-full ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm border rounded bg-white font-sans transition-all text-left ${
          disabled
            ? 'opacity-60 bg-gray-50 border-[#ede0c4] cursor-not-allowed text-gray-400'
            : isOpen
            ? 'border-[#c4a84f] ring-2 ring-[#c4a84f]/15 cursor-pointer'
            : 'border-[#ede0c4] hover:border-[#c4a84f] cursor-pointer text-[#2c1a00]'
        } ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`truncate ${
            !selectedOption ? 'text-gray-400 font-normal' : 'text-[#2c1a00] font-medium'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#c4a84f]' : ''
          }`}
        />
      </button>

      {isOpen && mounted && (portal ? createPortal(menuContent, document.body) : menuContent)}
    </div>
  );
}
