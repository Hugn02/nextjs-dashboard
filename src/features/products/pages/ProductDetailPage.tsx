"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fetchProductBySlug, fetchProducts } from "../services/product.service";
import { Product } from "../types/product.type";
import useCart from "../../cart/hooks/useCart";
import useWishlist from "@/src/features/wishlist/hooks/useWishlist";

import ProductDetailSkeleton from "../components/detail/ProductDetailSkeleton";
import ProductGallery from "../components/detail/ProductGallery";
import ProductInfo from "../components/detail/ProductInfo";
import ProductReviewsSection from "../components/detail/ProductReviewsSection";
import ProductRelatedSection from "../components/detail/ProductRelatedSection";

interface ProductDetailPageProps {
    slug: string;
}

const REVIEWS_PER_PAGE = 5;

export default function ProductDetailPage({ slug }: ProductDetailPageProps) {
    const { addItem } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [quantityInput, setQuantityInput] = useState("1");
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [quantityError, setQuantityError] = useState<string | null>(null);
    const [descExpanded, setDescExpanded] = useState(false);
    const [categoryInfo, setCategoryInfo] = useState<{ name: string; slug: string } | null>(null);
    const [collectionInfo, setCollectionInfo] = useState<{ name: string; slug: string } | null>(null);

    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [ratingFilter, setRatingFilter] = useState<string | number>("all");
    const [mediaFilter, setMediaFilter] = useState<"all" | "image" | "video">("all");
    const [currentPage, setCurrentPage] = useState(1);

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
                            .then((res) => (res.ok ? res.json() : Promise.reject()))
                            .then((catData) => {
                                const category = catData.data || catData;
                                if (category) setCategoryInfo({ name: category.name, slug: category.slug });
                            })
                            .catch((err) => console.error("Failed to fetch category info:", err));
                    }

                    // Resolve collection name and slug
                    if (fetchedProduct.collection) {
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/${fetchedProduct.collection}`)
                            .then((res) => (res.ok ? res.json() : Promise.reject()))
                            .then((colData) => {
                                const collection = colData.data || colData;
                                if (collection) setCollectionInfo({ name: collection.name, slug: collection.slug });
                            })
                            .catch((err) => console.error("Failed to fetch collection info:", err));
                    }

                    // Fetch related products: only from the same collection
                    try {
                        if (fetchedProduct.collection) {
                            const { products: related } = await fetchProducts({
                                collection: fetchedProduct.collection,
                                limit: 5,
                                status: "active",
                            });
                            const filteredRelated = related.filter((item) => item.id !== fetchedProduct.id);
                            setRelatedProducts(filteredRelated.slice(0, 4));
                        } else {
                            setRelatedProducts([]);
                        }
                    } catch (relatedErr) {
                        console.error("Failed to fetch related products:", relatedErr);
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
        setQuantityInput("1");
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

    const { averageRating, totalReviews, counts, paginatedReviews, totalPages } = useMemo(() => {
        if (reviews.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                counts: { all: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                filteredReviews: [],
                paginatedReviews: [],
                totalPages: 1,
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
            if (ratingFilter !== "all" && r.rating !== Number(ratingFilter)) return false;
            if (mediaFilter === "image" && !(r.images && r.images.length > 0)) return false;
            if (mediaFilter === "video" && !r.video) return false;
            return true;
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
    }, [reviews, ratingFilter, mediaFilter, currentPage]);

    const handleFilterChange = (filter: string | number) => {
        setRatingFilter(filter);
        setCurrentPage(1);
    };

    const handleMediaFilterChange = (filter: "all" | "image" | "video") => {
        setMediaFilter(filter);
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
    const handleQuantityBlur = () => {
        let parsed = parseInt(quantityInput, 10);
        if (isNaN(parsed) || parsed < 1) {
            parsed = 1;
        }
        if (product && product.stock !== undefined && product.stock !== null) {
            if (parsed > product.stock) {
                parsed = product.stock;
                const msg = `Số lượng tồn kho chỉ còn ${product.stock} sản phẩm.`;
                setQuantityError(msg);
                window.dispatchEvent(
                    new CustomEvent("cart-warning", {
                        detail: { message: msg },
                    })
                );
            }
        }
        setQuantity(parsed);
        setQuantityInput(parsed.toString());
    };

    const incrementQty = () => {
        let current = parseInt(quantityInput, 10);
        if (isNaN(current)) current = quantity;
        if (product && product.stock) {
            if (current >= product.stock) {
                const msg = `Số lượng tồn kho chỉ còn ${product.stock} sản phẩm.`;
                setQuantityError(msg);
                window.dispatchEvent(
                    new CustomEvent("cart-warning", {
                        detail: { message: msg },
                    })
                );
                return;
            }
        }
        setQuantityError(null);
        const next = current + 1;
        setQuantity(next);
        setQuantityInput(next.toString());
    };

    const decrementQty = () => {
        let current = parseInt(quantityInput, 10);
        if (isNaN(current)) current = quantity;
        setQuantityError(null);
        if (current > 1) {
            const next = current - 1;
            setQuantity(next);
            setQuantityInput(next.toString());
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            const added = await addItem(product.id, quantity);
            if (!added) return;

            window.dispatchEvent(
                new CustomEvent("cart-added", {
                    detail: { productName: product.name },
                })
            );
        } catch (err: any) {
            window.dispatchEvent(
                new CustomEvent("cart-warning", {
                    detail: { message: err.message || "Thêm vào giỏ hàng thất bại!" },
                })
            );
        }
    };

    if (loading) {
        return <ProductDetailSkeleton />;
    }

    if (error || !product) {
        return (
            <div className="mx-auto max-w-[1280px] px-6 pt-[140px] pb-20 min-h-[70vh] text-center">
                <h2 className="font-['Cormorant_Garamond',_serif] text-2xl text-[#8b2500] mb-4">Lỗi xảy ra</h2>
                <p className="text-gray-600 mb-6">{error || "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh."}</p>
                <Link
                    href="/collections"
                    className="inline-block bg-[#c4a84f] text-white px-6 py-2.5 rounded-[2px] uppercase text-xs tracking-wider no-underline transition-colors hover:bg-[#a8893a]"
                >
                    Quay lại danh sách sản phẩm
                </Link>
            </div>
        );
    }

    const imagesList = product.images && product.images.length > 0 ? product.images : [
        `https://placehold.co/600x600/faf7f2/c4a84f?text=${encodeURIComponent(product.name.slice(0, 15))}`,
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
                    <nav className="font-['Cormorant_Garamond',_Georgia,_serif] mb-8 border-b border-[#f0e8d6] py-4 text-xs tracking-wider text-[#888] flex flex-wrap items-center">
                        <Link href="/" className="text-[#888] no-underline hover:text-[#c4a84f] shrink-0">
                            Trang chủ
                        </Link>
                        <span className="mx-2 shrink-0">›</span>
                        {categoryInfo ? (
                            <Link href={`/categories/${categoryInfo.slug}`} className="text-[#888] no-underline hover:text-[#c4a84f] shrink-0">
                                {categoryInfo.name}
                            </Link>
                        ) : (
                            <span className="text-[#888] shrink-0">Sản phẩm</span>
                        )}
                        <span className="mx-2 shrink-0">›</span>
                        <span className="text-[#2c1a00] font-medium break-words [overflow-wrap:anywhere] [word-break:break-word]">
                            {product.name}
                        </span>
                    </nav>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                        {/* Left Side: Images Gallery */}
                        <ProductGallery
                            imagesList={imagesList}
                            productName={product.name}
                            activeImageIndex={activeImageIndex}
                            setActiveImageIndex={setActiveImageIndex}
                        />

                        {/* Right Side: Meta and Purchasing options */}
                        <ProductInfo
                            product={product}
                            categoryInfo={categoryInfo}
                            collectionInfo={collectionInfo}
                            totalReviews={totalReviews}
                            averageRating={averageRating}
                            renderStars={renderStars}
                            quantity={quantity}
                            quantityInput={quantityInput}
                            quantityError={quantityError}
                            onQuantityChange={(val) => {
                                setQuantityInput(val);
                                setQuantityError(null);
                            }}
                            onQuantityBlur={handleQuantityBlur}
                            onIncrement={incrementQty}
                            onDecrement={decrementQty}
                            onAddToCart={handleAddToCart}
                            isWishlisted={isWishlisted(product.id || product._id)}
                            wishlistLoading={wishlistLoading}
                            onToggleWishlist={async () => {
                                if (wishlistLoading || !product) return;
                                setWishlistLoading(true);
                                try {
                                    await toggleWishlist(product.id || product._id);
                                } finally {
                                    setWishlistLoading(false);
                                }
                            }}
                            descExpanded={descExpanded}
                            onToggleDesc={() => setDescExpanded(!descExpanded)}
                        />
                    </div>

                    {/* Bottom Section: Reviews */}
                    <ProductReviewsSection
                        reviews={reviews}
                        reviewsLoading={reviewsLoading}
                        averageRating={averageRating}
                        counts={counts}
                        ratingFilter={ratingFilter}
                        mediaFilter={mediaFilter}
                        paginatedReviews={paginatedReviews}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        renderStars={renderStars}
                        onFilterChange={handleFilterChange}
                        onMediaFilterChange={handleMediaFilterChange}
                        onPageChange={(page) => setCurrentPage(page)}
                    />

                    {/* Bottom Section: Related Products */}
                    <ProductRelatedSection relatedProducts={relatedProducts} />
                </div>
            </main>
        </>
    );
}
