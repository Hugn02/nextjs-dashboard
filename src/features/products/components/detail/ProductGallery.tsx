"use client";

import React, { useState } from "react";
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";

interface ProductGalleryProps {
    imagesList: string[];
    productName: string;
    activeImageIndex: number;
    setActiveImageIndex: (index: number | ((prev: number) => number)) => void;
}

export default function ProductGallery({
    imagesList,
    productName,
    activeImageIndex,
    setActiveImageIndex,
}: ProductGalleryProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [useTransition, setUseTransition] = useState(true);

    const DRAG_THRESHOLD = 50; // pixels

    const resetDragState = () => {
        setIsDragging(false);
        setDragOffset(0);
        setStartY(0);
    };

    const showNextImage = () => {
        if (imagesList.length <= 1) return;
        setUseTransition(true);
        const isAtEnd = activeImageIndex === imagesList.length - 1;
        if (isAtEnd) {
            setActiveImageIndex((prev) => prev + 1);
            setTimeout(() => {
                setUseTransition(false);
                setActiveImageIndex(0);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => setUseTransition(true));
                });
            }, 300);
        } else {
            setActiveImageIndex((prev) => prev + 1);
        }
    };

    const showPrevImage = () => {
        if (imagesList.length <= 1) return;
        setUseTransition(true);
        const isAtStart = activeImageIndex === 0;
        if (isAtStart) {
            setActiveImageIndex((prev) => prev - 1);
            setTimeout(() => {
                setUseTransition(false);
                setActiveImageIndex(imagesList.length - 1);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => setUseTransition(true));
                });
            }, 300);
        } else {
            setActiveImageIndex((prev) => prev - 1);
        }
    };

    const handleDragStart = (y: number) => {
        if (imagesList.length <= 1) return;
        setUseTransition(true);
        setIsDragging(true);
        setStartY(y);
    };

    const handleDragMove = (y: number) => {
        if (!isDragging) return;
        const deltaY = y - startY;
        setDragOffset(deltaY);
    };

    const handleDragEnd = (y: number) => {
        if (!isDragging) return;
        const deltaY = y - startY;

        if (deltaY > DRAG_THRESHOLD) {
            showPrevImage();
        } else if (deltaY < -DRAG_THRESHOLD) {
            showNextImage();
        }
        resetDragState();
    };

    return (
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 min-w-0">
            {/* Thumbnails stack on desktop (left of main), row on mobile */}
            {imagesList.length > 1 && (
                <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 min-w-[80px]">
                    {imagesList.map((img, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            className={`relative aspect-square w-16 md:w-20 flex-shrink-0 cursor-pointer overflow-hidden bg-[#faf7f2] border transition-all duration-200 ${
                                activeImageIndex === idx
                                    ? "border-[#c4a84f] shadow-sm"
                                    : "border-[#ede0c4] hover:border-[#c4a84f]"
                            }`}
                        >
                            <ImageWithFallback
                                src={img}
                                alt={`${productName} thumbnail ${idx + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Big preview image */}
            <div
                className={`order-1 md:order-2 flex-1 relative aspect-[4/5] md:aspect-square w-full overflow-hidden bg-[#faf7f2] border border-[#ede0c4] rounded-[2px] touch-none ${
                    imagesList.length > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
                }`}
                onMouseDown={(e) => handleDragStart(e.pageY)}
                onMouseMove={(e) => {
                    if (isDragging) handleDragMove(e.pageY);
                }}
                onMouseUp={(e) => {
                    if (isDragging) handleDragEnd(e.pageY);
                }}
                onMouseLeave={(e) => {
                    if (isDragging) handleDragEnd(e.pageY);
                }}
                onTouchStart={(e) => handleDragStart(e.touches[0].pageY)}
                onTouchMove={(e) => {
                    if (isDragging) handleDragMove(e.touches[0].pageY);
                }}
                onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].pageY)}
            >
                <div
                    className={`h-full w-full ${useTransition && !isDragging ? "transition-transform duration-300 ease-out" : ""}`}
                    style={{
                        transform: `translateY(${-activeImageIndex * 100}%) translateY(${dragOffset}px)`,
                    }}
                >
                    {/* Render all images in a single column */}
                    {imagesList.map((img, idx) => (
                        <div
                            key={img + idx}
                            className="absolute inset-0 h-full w-full"
                            style={{ transform: `translateY(${idx * 100}%)` }}
                        >
                            <ImageWithFallback
                                src={img}
                                alt={`${productName} - ảnh ${idx + 1}`}
                                fill
                                priority={idx === 0}
                                sizes="(max-width: 768px) 100vw, 55vw"
                                className="object-cover pointer-events-none"
                            />
                        </div>
                    ))}
                    {/* Add clones for seamless looping */}
                    {imagesList.length > 1 && (
                        <ImageWithFallback
                            src={imagesList[0]}
                            alt={`${productName} - ảnh lặp`}
                            fill
                            priority={false}
                            sizes="(max-width: 768px) 100vw, 55vw"
                            className="absolute object-cover pointer-events-none"
                            style={{ top: `${imagesList.length * 100}%`, left: 0 }}
                        />
                    )}
                    {imagesList.length > 1 && (
                        <ImageWithFallback
                            src={imagesList[imagesList.length - 1]}
                            alt={`${productName} - ảnh lặp`}
                            fill
                            priority={false}
                            sizes="(max-width: 768px) 100vw, 55vw"
                            className="absolute object-cover pointer-events-none"
                            style={{ top: "-100%", left: 0 }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
