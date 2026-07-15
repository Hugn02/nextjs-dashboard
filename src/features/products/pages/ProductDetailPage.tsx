"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchProductBySlug, fetchProducts } from "../services/product.service";
import { Product } from "../types/product.type";
import ProductCard from "../components/ProductCard";
import useCart from "../../cart/hooks/useCart";


interface ProductDetailPageProps {
    slug: string;
}

// ─── Helper: Format Price ───────────────────────────────────────────────────
function formatPrice(n: number) {
    return n.toLocaleString("vi-VN") + "₫";
}

// ─── Main Detail Page Component ──────────────────────────────────────────────
export default function ProductDetailPage({ slug }: ProductDetailPageProps) {
    const { addItem } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [quantityError, setQuantityError] = useState<string | null>(null);
    const [descExpanded, setDescExpanded] = useState(false);
    const [categoryInfo, setCategoryInfo] = useState<{ name: string; slug: string } | null>(null);
    const [collectionInfo, setCollectionInfo] = useState<{ name: string; slug: string } | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [useTransition, setUseTransition] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [ratingFilter, setRatingFilter] = useState<string | number>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const REVIEWS_PER_PAGE = 5;

    // Fetch product details
    useEffect(() => {
        if (!slug) return;

        const loadProductData = async () => {
            try {
                setLoading(true);
                const fetchedProduct = await fetchProductBySlug(slug);
                if (fetchedProduct) {
                    setProduct(fetchedProduct);
                    setError(null);

                    // Resolve category name and slug
                    if (fetchedProduct.category) {
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${fetchedProduct.category}`)
                            .then(res => res.ok ? res.json() : Promise.reject())
                            .then(catData => {
                                const category = catData.data || catData;
                                if (category) setCategoryInfo({ name: category.name, slug: category.slug });
                            })
                            .catch(err => console.error("Failed to fetch category info:", err));
                    }

                    // Resolve collection name and slug
                    if (fetchedProduct.collection) {
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/${fetchedProduct.collection}`)
                            .then(res => res.ok ? res.json() : Promise.reject())
                            .then(colData => {
                                const collection = colData.data || colData;
                                if (collection) setCollectionInfo({ name: collection.name, slug: collection.slug });
                            })
                            .catch(err => console.error("Failed to fetch collection info:", err));
                    }

                    // Fetch related products: only from the same collection
                    try {
                        if (fetchedProduct.collection) {
                            const { products: related } = await fetchProducts({
                                collection: fetchedProduct.collection,
                                limit: 5, // Lấy 5 sản phẩm
                                status: 'active'
                            });
                            // Lọc sản phẩm hiện tại ra và chỉ lấy 4 sản phẩm
                            const filteredRelated = related.filter(item => item.id !== fetchedProduct.id);
                            setRelatedProducts(filteredRelated.slice(0, 4));
                        } else {
                            setRelatedProducts([]);
                        }
                    } catch (relatedErr) {
                        console.error("Failed to fetch related products:", relatedErr);
                        // In case of an error, ensure related products are empty
                        setRelatedProducts([]);
                    }
                } else {
                    setError("Không tìm thấy sản phẩm");
                }
            } catch (err: any) {
                console.error("Error loading product:", err);
                setError(err.message || "Đã xảy ra lỗi khi tải thông tin sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        loadProductData();
        setQuantity(1);
        setQuantityError(null);
        setActiveImageIndex(0);
    }, [slug]);

    // Fetch reviews when product is loaded
    useEffect(() => {
        if (!product?.id) return;

        const loadReviews = async () => {
            setReviewsLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews?product=${product.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data.data || data || []);
                }
            } catch (err) {
                console.error("Failed to load reviews:", err);
            } finally {
                setReviewsLoading(false);
            }
        };

        loadReviews();
    }, [product?.id]);

    const { averageRating, totalReviews, counts, filteredReviews, paginatedReviews, totalPages } = useMemo(() => {
        if (reviews.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                counts: { all: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                filteredReviews: [],
                paginatedReviews: [],
                totalPages: 1
            };
        }
        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        const average = parseFloat((sum / reviews.length).toFixed(1));

        const starCounts = {
            all: reviews.length,
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        };
        reviews.forEach((r) => {
            if (r.rating >= 1 && r.rating <= 5) {
                starCounts[r.rating as 1 | 2 | 3 | 4 | 5] += 1;
            }
        });

        const filtered = reviews.filter((r) => {
            if (ratingFilter === "all") return true;
            return r.rating === Number(ratingFilter);
        });

        const totalP = Math.max(1, Math.ceil(filtered.length / REVIEWS_PER_PAGE));
        
        const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
        const paginated = filtered.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

        return {
            averageRating: average,
            totalReviews: reviews.length,
            counts: starCounts,
            filteredReviews: filtered,
            paginatedReviews: paginated,
            totalPages: totalP,
        };
    }, [reviews, ratingFilter, currentPage]);

    const handleFilterChange = (filter: string | number) => {
        setRatingFilter(filter);
        setCurrentPage(1);
    };

    const renderStars = (rating: number) => {
        const rounded = Math.round(rating);
        return (
            <span className="text-[#ee4d2d] text-sm font-sans tracking-tight">
                {"★".repeat(rounded) + "☆".repeat(5 - rounded)}
            </span>
        );
    };

    // Quantity handlers
    const incrementQty = () => {
        if (product && product.stock) {
            if (quantity >= product.stock) {
                setQuantityError(`Số lượng tồn kho chỉ còn ${product.stock} sản phẩm.`);
                return;
            }
        }
        setQuantityError(null);
        setQuantity(prev => prev + 1);
    };

    const decrementQty = () => {
        setQuantityError(null);
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    // Add to cart toast display
    const handleAddToCart = async () => {
        if (!product) return;

        try {
            await addItem(product.id, quantity);

            // Dispatch event for CartAddedNotification to show popup
            window.dispatchEvent(
                new CustomEvent("cart-added", {
                    detail: { productName: product.name },
                })
            );
        } catch (err: any) {
            console.error("Failed to add to cart:", err);
            setToastMessage(err.message || "Thêm vào giỏ hàng thất bại!");
        }
    };

    // ─── Image Drag/Swipe Handlers ──────────────────────────────────────────────
    const DRAG_THRESHOLD = 50; // pixels

    const resetDragState = () => {
        setIsDragging(false);
        setDragOffset(0);
        setStartY(0);
    };

    const showNextImage = () => {
        if (!product || imagesList.length <= 1) return;
        setUseTransition(true);
        const isAtEnd = activeImageIndex === imagesList.length - 1;
        if (isAtEnd) {
            // Animate to a "fake" next slide
            setActiveImageIndex(prev => prev + 1);
            // After transition, silently jump back to the real first slide
            setTimeout(() => {
                setUseTransition(false); // Disable transition for the jump
                setActiveImageIndex(0); // Jump to the real first slide
                // Re-enable transition for future interactions
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => setUseTransition(true));
                });
            }, 300); // Must match CSS transition duration
        } else {
            setActiveImageIndex(prev => prev + 1);
        }
    };

    const showPrevImage = () => {
        if (!product || imagesList.length <= 1) return;
        setUseTransition(true);
        const isAtStart = activeImageIndex === 0;
        if (isAtStart) {
            // Animate to a "fake" previous slide
            setActiveImageIndex(prev => prev - 1);
            // After transition, silently jump back to the real last slide
            setTimeout(() => {
                setUseTransition(false); // Disable transition for the jump
                setActiveImageIndex(imagesList.length - 1); // Jump to the real last slide
                // Re-enable transition for future interactions
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => setUseTransition(true));
                });
            }, 300); // Must match CSS transition duration
        } else {
            setActiveImageIndex(prev => prev - 1);
        }
    };

    const handleDragStart = (y: number) => {
        if (imagesList.length <= 1) return;
        setUseTransition(true); // Ensure transition is on for snapping back
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

    const handleMouseDown = (e: React.MouseEvent) => {
        handleDragStart(e.pageY);
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) handleDragMove(e.pageY);
    };
    const handleMouseUp = (e: React.MouseEvent) => {
        if (isDragging) handleDragEnd(e.pageY);
    };
    const handleTouchStart = (e: React.TouchEvent) => {
        handleDragStart(e.touches[0].pageY);
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        handleDragEnd(e.changedTouches[0].pageY);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging) handleDragMove(e.touches[0].pageY);
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-[1280px] px-6 pt-[140px] pb-20 min-h-[70vh] flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c4a84f]"></div>
                <p className="mt-4 font-['Cormorant_Garamond',_serif] text-lg text-[#888]">Đang tải dữ liệu sản phẩm...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="mx-auto max-w-[1280px] px-6 pt-[140px] pb-20 min-h-[70vh] text-center">
                <h2 className="font-['Cormorant_Garamond',_serif] text-2xl text-[#8b2500] mb-4">Lỗi xảy ra</h2>
                <p className="text-gray-600 mb-6">{error || "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh."}</p>
                <Link href="/collections" className="inline-block bg-[#c4a84f] text-white px-6 py-2.5 rounded-[2px] uppercase text-xs tracking-wider no-underline transition-colors hover:bg-[#a8893a]">
                    Quay lại danh sách sản phẩm
                </Link>
            </div>
        );
    }

    // Determine current display image
    const imagesList = product.images && product.images.length > 0 ? product.images : [
        `https://placehold.co/600x600/faf7f2/c4a84f?text=${encodeURIComponent(product.name.slice(0, 15))}`
    ];

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
            `}</style>

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-24 right-6 z-[9999] bg-[#3d2b00] text-white py-3 px-6 rounded-[2px] border border-[#c4a84f] shadow-lg animate-fade-in flex items-center gap-3">
                    <span className="text-[#c4a84f] font-bold">✓</span>
                    <span className="font-['Cormorant_Garamond',_serif] text-[15px] tracking-wide">{toastMessage}</span>
                </div>
            )}

            <main className="min-h-screen bg-white pb-20 pt-[120px]">
                <div className="mx-auto max-w-[1280px] px-6">
                    {/* Breadcrumbs */}
                    <nav className="font-['Cormorant_Garamond',_Georgia,_serif] mb-8 border-b border-[#f0e8d6] py-4 text-xs tracking-wider text-[#888]">
                        <Link href="/" className="text-[#888] no-underline hover:text-[#c4a84f]">Trang chủ</Link>
                        <span className="mx-2">›</span>
                        {categoryInfo ? (
                            <Link href={`/categories/${categoryInfo.slug}`} className="text-[#888] no-underline hover:text-[#c4a84f]">
                                {categoryInfo.name}
                            </Link>
                        ) : (
                            <span className="text-[#888]">Sản phẩm</span>
                        )}
                        <span className="mx-2">›</span>
                        <span className="text-[#2c1a00] font-medium">{product.name}</span>
                    </nav>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

                        {/* ── Left Side: Images Gallery (Vertical thumbnails + Big view) ── */}
                        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">

                            {/* Thumbnails stack on desktop (left of main), row on mobile (bottom or side) */}
                            {imagesList.length > 1 && (
                                <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 min-w-[80px]">
                                    {imagesList.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`relative aspect-square w-16 md:w-20 flex-shrink-0 cursor-pointer overflow-hidden bg-[#faf7f2] border transition-all duration-200 ${activeImageIndex === idx
                                                ? "border-[#c4a84f] shadow-sm"
                                                : "border-[#ede0c4] hover:border-[#c4a84f]"
                                                }`}
                                        >
                                            <Image
                                                src={img}
                                                alt={`${product.name} thumbnail ${idx + 1}`}
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
                                className={`order-1 md:order-2 flex-1 relative aspect-[4/5] md:aspect-square w-full overflow-hidden bg-[#faf7f2] border border-[#ede0c4] rounded-[2px] touch-none
                                    ${imagesList.length > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp} // End drag if mouse leaves
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <div
                                    className={`h-full w-full ${useTransition && !isDragging ? 'transition-transform duration-300 ease-out' : ''}`}
                                    style={{
                                        transform: `translateY(${-activeImageIndex * 100}%) translateY(${dragOffset}px)`,
                                    }}
                                >
                                    {/* Render all images in a single column */}
                                    {imagesList.map((img, idx) => (
                                        <div key={img + idx} className="absolute inset-0 h-full w-full" style={{ transform: `translateY(${idx * 100}%)` }}>
                                            <Image
                                                src={img}
                                                alt={`${product.name} - ảnh ${idx + 1}`}
                                                fill
                                                priority={idx === 0} // Prioritize first image
                                                sizes="(max-width: 768px) 100vw, 55vw"
                                                className="object-cover pointer-events-none"
                                            />
                                        </div>
                                    ))}
                                    {/* Add clones for seamless looping */}
                                    {imagesList.length > 1 && (
                                        <Image
                                            src={imagesList[0]}
                                            alt={`${product.name} - ảnh lặp`}
                                            fill
                                            priority={false}
                                            sizes="(max-width: 768px) 100vw, 55vw"
                                            className="absolute object-cover pointer-events-none"
                                            style={{ top: `${imagesList.length * 100}%`, left: 0 }}
                                        />
                                    )}
                                    {imagesList.length > 1 && (
                                        <Image
                                            src={imagesList[imagesList.length - 1]}
                                            alt={`${product.name} - ảnh lặp`}
                                            fill
                                            priority={false}
                                            sizes="(max-width: 768px) 100vw, 55vw"
                                            className="absolute object-cover pointer-events-none"
                                            style={{ top: `-100%`, left: 0 }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Right Side: Meta and Purchasing options ── */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div>
                                {/* Brand/Collection Name */}
                                <p className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 mb-1.5 text-xs uppercase tracking-[2px] text-[#c4a84f]">
                                    {product.brandName}
                                </p>

                                {/* Product Title */}
                                <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 text-xl lg:text-2xl font-semibold leading-snug text-[#2c1a00]">
                                    {product.name}
                                </h1>

                                {/* Rating summary */}
                                {totalReviews > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        {renderStars(averageRating)}
                                        <span className="text-xs text-[#888] font-['Cormorant_Garamond',_serif]">
                                            {averageRating}/5 ({totalReviews} đánh giá)
                                        </span>
                                    </div>
                                )}

                                {/* SKU Code */}
                                {product.sku && (
                                    <p className="m-0 mt-2 text-[12px] text-[#888] font-mono tracking-wider uppercase">
                                        Mã SP: {product.sku}
                                    </p>
                                )}

                                {/* Category & Collection Info */}
                                <div className="mt-3 flex flex-col gap-1">
                                    {categoryInfo && (
                                        <p className="m-0 text-[12px] text-[#888] font-['Cormorant_Garamond',_serif]">
                                            <span className="font-semibold text-[#3d2b00]">Loại sản phẩm:</span>{" "}
                                            <Link href={`/categories/${categoryInfo.slug}`} className="text-[#c4a84f] no-underline hover:underline">
                                                {categoryInfo.name}
                                            </Link>
                                        </p>
                                    )}
                                    {collectionInfo && (
                                        <p className="m-0 text-[12px] text-[#888] font-['Cormorant_Garamond',_serif]">
                                            <span className="font-semibold text-[#3d2b00]">Bộ sưu tập:</span>{" "}
                                            <Link href={`/collections/${collectionInfo.slug}`} className="text-[#c4a84f] no-underline hover:underline">
                                                {collectionInfo.name}
                                            </Link>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="flex flex-wrap items-baseline gap-3 border-b border-[#f0e8d6] pb-4">
                                {product.isContact ? (
                                    <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-2xl font-bold text-[#8b6914]">
                                        Liên hệ đặt hàng
                                    </span>
                                ) : (
                                    <>
                                        <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-2xl lg:text-3xl font-bold text-[#8b2500]">
                                            {formatPrice(product.price)}
                                        </span>
                                        {product.originalPrice && (
                                            <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-sm text-[#aaa] line-through">
                                                {formatPrice(product.originalPrice)}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Availability status */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase text-[#888] tracking-widest font-['Cormorant_Garamond',_serif]">Tình trạng:</span>
                                <span className={`text-[13px] font-semibold ${product.inStock ? "text-[#c4a84f]" : "text-red-500"}`}>
                                    {product.inStock ? "Còn hàng" : "Hết hàng"}
                                </span>
                            </div>

                            {/* Quantity and Cart Button */}
                            {!product.isContact && product.inStock && (
                                <div className={`relative mt-2 ${quantityError ? 'pb-5' : ''}`}>
                                    <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                                        {/* Quantity selector */}
                                        <div className={`flex items-center justify-between border rounded-[2px] bg-white h-[46px] w-full sm:w-[130px] px-3 ${quantityError ? 'border-red-500' : 'border-[#ede0c4]'}`}>
                                            <button
                                                onClick={decrementQty}
                                                className="bg-transparent border-none text-[#3d2b00] text-lg font-light cursor-pointer select-none px-2 h-full flex items-center justify-center hover:text-[#c4a84f]"
                                            >
                                                -
                                            </button>
                                            <span className="font-['Cormorant_Garamond',_serif] text-base font-semibold text-[#3d2b00] select-none">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={incrementQty}
                                                className="bg-transparent border-none text-[#3d2b00] text-lg font-light cursor-pointer select-none px-2 h-full flex items-center justify-center hover:text-[#c4a84f]"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Action button */}
                                        <button
                                            onClick={handleAddToCart}
                                            className="group relative flex-1 cursor-pointer overflow-hidden rounded-[30px] border border-[#d29f13] bg-[#d29f13] py-[15px] px-[25px] text-[13px] font-semibold uppercase tracking-[1px] transition-colors duration-300 ease-out"
                                        >
                                            <span className="absolute top-0 left-1/2 h-full w-0 -translate-x-1/2 bg-white transition-all duration-300 ease-out group-hover:w-[105%]"></span>
                                            <span className="relative text-white transition-colors duration-300 ease-out group-hover:text-[#d29f13]">Thêm vào giỏ hàng</span>
                                        </button>
                                    </div>
                                    {quantityError && (
                                        <p className="absolute left-0 bottom-0 m-0 text-red-600 text-[11px] font-['Cormorant_Garamond',_serif] w-full sm:w-auto">
                                            {quantityError}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Contact Purchase option */}
                            {(product.isContact || !product.inStock) && (
                                <button
                                    className="w-full cursor-pointer rounded-[2px] border border-[#c4a84f] bg-white py-3.5 text-[12px] font-bold uppercase tracking-[2px] text-[#8b6914] transition-all duration-200 hover:bg-[#c4a84f] hover:text-white font-['Cormorant_Garamond',_serif]"
                                >
                                    Liên hệ đặt hàng
                                </button>
                            )}

                            {/* Basic description */}
                            {(product.shortDescription || product.description) && (
                                <div className="border-t border-[#f0e8d6] pt-6 flex flex-col gap-3">
                                    <h3 className="m-0 text-xs font-bold uppercase tracking-widest text-[#3d2b00] font-['Cormorant_Garamond',_serif]">
                                        Thông tin cơ bản
                                    </h3>
                                    <div className="font-['Cormorant_Garamond',_serif] text-[#555] text-sm leading-relaxed flex flex-col gap-2.5">
                                        {product.shortDescription && (
                                            <p className="m-0 font-medium text-[#2c1a00]">{product.shortDescription}</p>
                                        )}
                                        {product.description && (
                                            <div className="relative">
                                                <p className={`m-0 text-justify ${!descExpanded ? "line-clamp-4" : ""}`}>
                                                    {product.description}
                                                </p>
                                                {product.description.length > 200 && (
                                                    <button
                                                        onClick={() => setDescExpanded(!descExpanded)}
                                                        className="mt-1 bg-none border-none text-[#c4a84f] font-semibold text-xs cursor-pointer hover:underline p-0"
                                                    >
                                                        {descExpanded ? "Thu gọn..." : "Xem thêm..."}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Specifications dynamic table */}
                            {product.specifications && product.specifications.length > 0 && (
                                <div className="border-t border-[#f0e8d6] pt-6 flex flex-col gap-3">
                                    <h3 className="m-0 text-xs font-bold uppercase tracking-widest text-[#3d2b00] font-['Cormorant_Garamond',_serif]">
                                        Thông tin chi tiết
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse mt-2 text-sm font-['Cormorant_Garamond',_serif]">
                                            <tbody className="divide-y divide-[#f0e8d6]">
                                                {product.specifications.map((spec, index) => (
                                                    <tr key={index}>
                                                        <td className="py-2.5 pr-4 font-semibold text-[#3d2b00]">{spec.label}</td>
                                                        <td className="py-2.5 text-[#555]">{spec.value}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Bottom Section: Đánh giá sản phẩm (Reviews List) ── */}
                    <div className="mt-20 border-t border-[#f0e8d6] pt-14 font-['Cormorant_Garamond',_serif]">
                        <h2 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 mb-8 text-center font-light uppercase tracking-[3px] text-[#2c1a00]" style={{ fontSize: "clamp(20px, 2.5vw, 26px)" }}>
                            ĐÁNH GIÁ SẢN PHẨM
                        </h2>

                        {reviewsLoading ? (
                            <p className="text-center text-[#888] text-sm">Đang tải đánh giá...</p>
                        ) : reviews.length === 0 ? (
                            <p className="text-center text-[#888] text-sm italic py-4">Chưa có đánh giá nào cho sản phẩm này.</p>
                        ) : (
                            <div className="max-w-3xl mx-auto mb-16">
                                {/* Shopee style Rating & Filter Summary Box */}
                                <div className="bg-[#fffbf8] p-6 rounded-sm border border-[#f9ede5] flex flex-col md:flex-row gap-6 items-center mb-8">
                                    {/* Left: Score */}
                                    <div className="text-center md:border-r border-[#f9ede5] md:pr-8 flex flex-col items-center justify-center min-w-[140px]">
                                        <p className="text-[15px] text-[#ee4d2d] m-0">
                                            <span className="text-3xl font-bold">{averageRating}</span> trên 5
                                        </p>
                                        <div className="mt-1">
                                            {renderStars(averageRating)}
                                        </div>
                                    </div>

                                    {/* Right: Filter Tags */}
                                    <div className="flex-1 flex flex-wrap gap-2 justify-start">
                                        <button
                                            onClick={() => handleFilterChange("all")}
                                            className={`px-4 py-1.5 text-[13px] rounded-[2px] border transition-all ${
                                                ratingFilter === "all"
                                                    ? "border-[#ee4d2d] text-[#ee4d2d] bg-white"
                                                    : "border-[#e8e8e8] text-[#555] bg-white hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                                            }`}
                                        >
                                            Tất Cả ({counts.all})
                                        </button>
                                        {[5, 4, 3, 2, 1].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => handleFilterChange(star)}
                                                className={`px-4 py-1.5 text-[13px] rounded-[2px] border transition-all ${
                                                    ratingFilter === star
                                                        ? "border-[#ee4d2d] text-[#ee4d2d] bg-white"
                                                        : "border-[#e8e8e8] text-[#555] bg-white hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                                                }`}
                                            >
                                                {star} Sao ({counts[star as 1 | 2 | 3 | 4 | 5]})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Reviews List */}
                                {paginatedReviews.length === 0 ? (
                                    <div className="text-center text-[#888] text-sm py-12 border-t border-[#f0e8d6]">
                                        Không có đánh giá nào phù hợp với bộ lọc đã chọn.
                                    </div>
                                ) : (
                                    <div className="space-y-0 divide-y divide-[#f5f5f5]">
                                        {paginatedReviews.map((r, index) => (
                                            <div key={r.id || index} className="py-6 flex gap-4">
                                                {/* Left: Avatar */}
                                                <div className="w-10 h-10 rounded-full bg-[#f5f5f5] border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 uppercase flex-shrink-0">
                                                    {r.user?.fullName ? r.user.fullName.charAt(0) : "K"}
                                                </div>

                                                {/* Right: Content */}
                                                <div className="flex-1 flex flex-col gap-1.5">
                                                    <span className="font-bold text-[#333] text-[15px] block">
                                                        {r.user?.fullName || "Khách mua hàng"}
                                                    </span>
                                                    <div>{renderStars(r.rating)}</div>
                                                    <span className="text-[15px] text-[#999]">
                                                        {new Date(r.createdAt).toLocaleString('vi-VN')}
                                                    </span>

                                                    {/* Attributes */}
                                                    {(r.qualityFeedback || r.descriptionFeedback) && (
                                                        <div className="mt-1 space-y-1 text-[15px]">
                                                            {r.qualityFeedback && (
                                                                <div>
                                                                    <span className="text-[#888]">Chất lượng sản phẩm:</span>{" "}
                                                                    <span className="text-[#333]">{r.qualityFeedback}</span>
                                                                </div>
                                                            )}
                                                            {r.descriptionFeedback && (
                                                                <div>
                                                                    <span className="text-[#888]">Đúng với mô tả:</span>{" "}
                                                                    <span className="text-[#333]">{r.descriptionFeedback}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Comment */}
                                                    <p className="mt-2 text-[15px] text-[#333] leading-relaxed whitespace-pre-line m-0">
                                                        {r.comment}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-3 mt-8 pt-6 border-t border-[#f0e8d6] text-sm">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 border border-[#e8e8e8] rounded-[2px] bg-white text-[#555] disabled:opacity-40 disabled:hover:text-[#555] disabled:hover:border-[#e8e8e8] hover:border-[#ee4d2d] hover:text-[#ee4d2d] transition-all cursor-pointer disabled:cursor-not-allowed"
                                        >
                                            &lt;
                                        </button>
                                        <div className="flex gap-1.5">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-3 py-1.5 rounded-[2px] border transition-all cursor-pointer ${
                                                        currentPage === page
                                                            ? "border-[#ee4d2d] bg-[#ee4d2d] text-white"
                                                            : "border-[#e8e8e8] text-[#555] bg-white hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1.5 border border-[#e8e8e8] rounded-[2px] bg-white text-[#555] disabled:opacity-40 disabled:hover:text-[#555] disabled:hover:border-[#e8e8e8] hover:border-[#ee4d2d] hover:text-[#ee4d2d] transition-all cursor-pointer disabled:cursor-not-allowed"
                                        >
                                            &gt;
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Bottom Section: Cùng bộ sưu tập (Related Products) ── */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-20 border-t border-[#f0e8d6] pt-14">
                            <h2 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 mb-8 text-center font-light uppercase tracking-[3px] text-[#2c1a00]" style={{ fontSize: "clamp(20px, 2.5vw, 26px)" }}>
                                CÙNG BỘ SƯU TẬP
                            </h2>

                            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5">
                                {relatedProducts.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
