'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Heart, ShoppingBag, Star, Share2, ChevronLeft, ChevronRight,
  Minus, Plus, Truck, Shield, RotateCcw, Check,
} from 'lucide-react';
import { cn, formatPrice, apiFetch } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { ProductGrid } from '@/components/product/ProductCard';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const [relatedSource, setRelatedSource] = useState<'gemini' | 'category' | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await apiFetch(`/products/${params.slug}`);
        setProduct(data.product);
        if (data.product?.variants?.length > 0) {
          const firstColor = data.product.variants.find((v: any) => v.colorName)?.colorName || null;
          const firstSize = data.product.variants.find((v: any) => v.sizeName)?.sizeName || null;
          if (firstColor) setSelectedColor(firstColor);
          if (firstSize) setSelectedSize(firstSize);
        }
        // Fetch related products using the product's id
        if (data.product?.id) {
          try {
            const rel = await apiFetch(`/products/${data.product.id}/related`);
            setRelated(rel.related || []);
            setRelatedSource(rel.source || 'category');
          } catch {
            setRelated([]);
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="pt-20 lg:pt-24">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="skeleton aspect-square" />
            <div className="space-y-4">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-6 w-32" />
              <div className="skeleton h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-20 lg:pt-24">
        <div className="container-custom py-16 text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <Link href="/products" className="btn-primary mt-4 inline-flex">Browse Products</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [{ url: null, type: 'image' }];
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const specs = product.specifications ? (typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications) : {};

  let parsedFeatures: string[] = [];
  if (product.features) {
    if (Array.isArray(product.features)) {
      parsedFeatures = product.features;
    } else if (typeof product.features === 'string') {
      try {
        const p = JSON.parse(product.features);
        parsedFeatures = Array.isArray(p) ? p : [product.features];
      } catch {
        parsedFeatures = [product.features];
      }
    }
  }

  // Active variant price calculation
  const activeVariant = product.variants?.find((v: any) =>
    (selectedColor ? v.colorName === selectedColor : true) &&
    (selectedSize ? v.sizeName === selectedSize : true)
  );
  const activePrice = activeVariant?.price || (product.discountPrice || product.price);

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 py-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary-500">Home</Link>
          <ChevronRight size={14} />
          <Link href={`/category/${product.category?.slug}`} className="hover:text-primary-500">{product.category?.name}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Amazon-Style Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails list */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto scrollbar-hide max-h-[500px] p-1 flex-shrink-0">
                {images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    onMouseEnter={() => setSelectedImage(i)}
                    className={cn(
                      'relative w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all duration-200 bg-gray-50',
                      i === selectedImage
                        ? 'border-primary-600 ring-2 ring-primary-100 scale-105 shadow-sm'
                        : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                    )}
                  >
                    {img.url ? (
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs">📦</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image */}
            <div className="flex-1 relative">
              <div
                className="relative aspect-square rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 cursor-zoom-in group select-none"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onClick={() => setIsLightboxOpen(true)}
              >
                {images[selectedImage]?.url ? (
                  <>
                    <img
                      src={images[selectedImage].url}
                      alt={product.name}
                      className={cn(
                        'w-full h-full object-cover transition-opacity duration-300',
                        showZoom && 'opacity-0 md:opacity-100'
                      )}
                    />
                    {showZoom && (
                      <div
                        className="hidden md:block absolute inset-0 pointer-events-none bg-no-repeat transition-all duration-75"
                        style={{
                          backgroundImage: `url(${images[selectedImage].url})`,
                          backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                          backgroundSize: '250%',
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">No Image Available</div>
                )}

                {hasDiscount && (
                  <span className="absolute top-4 left-4 badge-sale text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                    -{discountPercent}% OFF
                  </span>
                )}

                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  🔍 Roll to zoom / Click to expand
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage((selectedImage - 1 + images.length) % images.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all z-20 text-gray-700 hover:scale-110"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage((selectedImage + 1) % images.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all z-20 text-gray-700 hover:scale-110"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Fullscreen Lightbox Modal */}
          {isLightboxOpen && images.length > 0 && (
            <div
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setIsLightboxOpen(false)}
            >
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-5 right-5 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all text-xl font-bold"
              >
                ✕
              </button>
              <div
                className="relative max-w-4xl max-h-[85vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={images[selectedImage]?.url}
                  alt={product.name}
                  className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                      className="absolute -left-12 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all"
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button
                      onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                      className="absolute -right-12 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Info */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-primary-500 uppercase tracking-wider">{product.category?.name}</p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
              </div>
              <button onClick={async () => {
                const result = await toggleWishlist(product.id);
                setIsInWishlist(result);
              }} className={cn('p-2 rounded-lg border transition-all', isInWishlist ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:border-gray-300')}>
                <Heart size={20} className={cn(isInWishlist && 'fill-red-500')} />
              </button>
            </div>

            {/* Rating */}
            {product.avgRating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < Math.round(product.avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.avgRating} ({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(activePrice)}</span>
              {hasDiscount && activePrice === (product.discountPrice || product.price) && (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <span className="badge-sale text-sm">Save {formatPrice(product.price - product.discountPrice)}</span>
                </>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="mt-4 text-gray-600 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* ── VARIANT SELECTORS (Color & Size) ── */}
            {product.variants?.length > 0 && (() => {
              const colorVariants = Array.from(
                new Map(
                  product.variants
                    .filter((v: any) => v.colorName)
                    .map((v: any) => [v.colorName, v])
                ).values()
              );
              const sizeVariants = Array.from(
                new Set(product.variants.map((v: any) => v.sizeName).filter(Boolean))
              );

              return (
                <div className="mt-6 space-y-5 border-t border-b border-gray-100 py-5">
                  {colorVariants.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                          اللون: <span className="text-primary-600 font-semibold">{selectedColor || 'اختر لون'}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {colorVariants.map((v: any) => {
                          const isSelected = selectedColor === v.colorName;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => {
                                setSelectedColor(v.colorName);
                                if (v.imageUrl) {
                                  const imgIdx = images.findIndex((img: any) => img.url === v.imageUrl);
                                  if (imgIdx !== -1) setSelectedImage(imgIdx);
                                }
                              }}
                              className={cn(
                                'flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-xs font-semibold transition-all duration-200 bg-white',
                                isSelected
                                  ? 'border-primary-600 bg-primary-50/50 text-primary-700 ring-2 ring-primary-100 scale-105 shadow-sm'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                              )}
                            >
                              {v.imageUrl ? (
                                <img src={v.imageUrl} alt={v.colorName} className="w-5 h-5 rounded-full object-cover border" />
                              ) : v.colorHex ? (
                                <span className="w-4 h-4 rounded-full border shadow-inner" style={{ backgroundColor: v.colorHex }} />
                              ) : null}
                              <span>{v.colorName}</span>
                              {v.price && v.price !== product.price && (
                                <span className="text-[10px] opacity-75 font-normal">
                                  ({formatPrice(v.price)})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {sizeVariants.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                          المقاس: <span className="text-primary-600 font-semibold">{selectedSize || 'اختر مقاس'}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {sizeVariants.map((sizeName: any) => {
                          const isSelected = selectedSize === sizeName;
                          const variantWithSize = product.variants.find((v: any) => v.sizeName === sizeName);
                          const variantPrice = variantWithSize?.price;

                          return (
                            <button
                              key={sizeName}
                              type="button"
                              onClick={() => setSelectedSize(sizeName)}
                              className={cn(
                                'px-4 py-2.5 rounded-xl border-2 text-xs font-bold transition-all duration-200 min-w-[50px] text-center',
                                isSelected
                                  ? 'border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-200 scale-105'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              )}
                            >
                              <div>{sizeName}</div>
                              {variantPrice && variantPrice !== product.price && (
                                <div className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-primary-100' : 'text-gray-400'}`}>
                                  {formatPrice(variantPrice)}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Delivery info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck size={18} className="text-primary-500" />
                <span>Estimated Delivery: <strong>{product.deliveryTime || '2-5 Business Days'}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield size={18} className="text-green-500" />
                <span>Cash on Delivery — <strong>You pay when your order arrives</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <RotateCcw size={18} className="text-blue-500" />
                <span>Easy returns within 30 days</span>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="px-4 font-medium text-lg min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={() => {
                  addToCart(product.id, quantity, {
                    selectedColor: selectedColor || undefined,
                    selectedSize: selectedSize || undefined,
                    price: activePrice,
                  });
                }}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 shadow-lg shadow-primary-200 hover:shadow-xl transition-all"
              >
                <ShoppingBag size={18} />
                إضافة للسلة — {formatPrice(activePrice * quantity)}
              </button>
            </div>

            {/* Features */}
            {parsedFeatures.length > 0 && (
              <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-semibold text-sm mb-2">Key Features</h3>
                <ul className="space-y-1.5">
                  {parsedFeatures.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* SKU & Brand */}
            <div className="mt-6 flex gap-6 text-sm text-gray-500">
              {product.brand && <span>Brand: <strong className="text-gray-900">{product.brand}</strong></span>}
              <span>SKU: <strong className="text-gray-900">{product.sku}</strong></span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <div className="flex gap-6">
              {['description', 'specs', 'reviews'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    'pb-3 text-sm font-medium border-b-2 transition-colors capitalize',
                    activeTab === tab ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}>
                  {tab === 'specs' ? 'Specifications' : tab}
                </button>
              ))}
            </div>
          </div>
          <div className="py-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-600 leading-relaxed">
                {product.richDescription ? (
                  <div dangerouslySetInnerHTML={{ __html: product.richDescription }} />
                ) : (
                  <p>{product.description || 'No description available.'}</p>
                )}
              </div>
            )}
            {activeTab === 'specs' && (
              <div className="max-w-lg">
                {Object.keys(specs).length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {Object.entries(specs).map(([key, value]) => (
                      <div key={key} className="flex py-3 text-sm">
                        <span className="w-1/3 text-gray-500 font-medium">{key}</span>
                        <span className="w-2/3 text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No specifications available.</p>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                {product.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review: any) => (
                      <div key={review.id} className="p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{review.customerName}</span>
                        </div>
                        {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16 mb-12">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">منتجات مشابهة قد تعجبك</h2>
                  {relatedSource === 'gemini' && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      ✨ مختارة بالذكاء الاصطناعي
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {relatedSource === 'gemini'
                    ? 'اختارها Gemini AI خصيصاً بناءً على هذا المنتج'
                    : 'من نفس التصنيف — قد تعجبك أيضاً'}
                </p>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((rel: any) => {
                const imageUrl = rel.images?.[0]?.url || null;
                const hasDiscount = rel.discountPrice && rel.discountPrice < rel.price;
                const discountPct = hasDiscount ? Math.round((1 - rel.discountPrice / rel.price) * 100) : 0;
                return (
                  <Link
                    key={rel.id}
                    href={`/product/${rel.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">🛍️</div>
                      )}
                      {hasDiscount && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          -{discountPct}%
                        </span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text-xs text-primary-500 font-medium mb-1">{rel.category?.name}</p>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors flex-1">
                        {rel.name}
                      </p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(rel.discountPrice || rel.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(rel.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
