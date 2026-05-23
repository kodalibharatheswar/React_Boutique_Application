import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCardStyles.css';

const ProductCard = ({ product, handleAddToWishlist, isAuthenticated }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Combine main image, additional images, and video
  const allMedia = [
    { type: 'image', url: product.imageUrl },
    ...(product.additionalImageUrls || []).map(url => ({ type: 'image', url })),
    product.videoUrl ? { type: 'video', url: product.videoUrl } : null
  ].filter(item => item && item.url && item.url.trim() !== '');

  const nextMedia = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % allMedia.length);
  };

  const prevMedia = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + allMedia.length) % allMedia.length);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price);
  };

  const originalPrice = parseFloat(product.price);
  const hasDiscount = parseFloat(product.discountPercent) > 0;
  const discountedPrice = hasDiscount ? (originalPrice - (originalPrice * parseFloat(product.discountPercent) / 100)) : originalPrice;
  const isClearance = product.isClearance || parseFloat(product.discountPercent) >= 50;

  return (
    <div className="card product-card shadow-sm h-100">
      {/* SALE/CLEARANCE BADGE */}
      {isClearance ? (
        <span className="sale-status-badge clearance-badge">CLEARANCE!</span>
      ) : hasDiscount ? (
        <span className="sale-status-badge sale-badge">SALE</span>
      ) : null}

      {/* Media Slider Container */}
      <div className="product-image-container position-relative overflow-hidden">
        {/* Navigation Arrows */}
        {allMedia.length > 1 && (
          <>
            <button 
              className="slider-arrow prev-arrow" 
              onClick={prevMedia}
              aria-label="Previous media"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button 
              className="slider-arrow next-arrow" 
              onClick={nextMedia}
              aria-label="Next media"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
            
            {/* Media Dots Indicator */}
            <div className="slider-dots">
              {allMedia.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`slider-dot ${idx === currentMediaIndex ? 'active' : ''} ${allMedia[idx].type === 'video' ? 'video-dot' : ''}`}
                ></span>
              ))}
            </div>
          </>
        )}

        {/* Product Link Wrapper */}
        <Link to={`/products/${product.id}`} className="product-link-wrapper">
          {allMedia[currentMediaIndex]?.type === 'image' ? (
            <img 
              src={allMedia[currentMediaIndex].url || 'https://placehold.co/600x600/ccc/333?text=No+Image'} 
              className="card-img-top object-fit-cover transition-opacity duration-300" 
              alt={`${product.name} - media ${currentMediaIndex + 1}`}
              onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/600x600/ccc/333?text=Error'}}
            />
          ) : (
            <video 
              src={allMedia[currentMediaIndex]?.url} 
              className="card-img-top object-fit-cover transition-opacity duration-300"
              muted
              loop
              autoPlay
              playsInline
            />
          )}
        </Link>
      </div>

      <div className="card-body d-flex flex-column p-3 text-center">
        <h5 className="card-title text-dark mb-1">{product.name}</h5>
        <p className="text-muted small mb-3 text-uppercase tracking-wider">{product.category}</p>

        {/* Price Display */}
        <div className="mt-auto mb-3">
          {hasDiscount ? (
            <div className="d-flex flex-column align-items-center">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="text-decoration-line-through text-muted small">₹ {formatPrice(originalPrice)}</span>
                <span className="badge bg-danger p-1 px-2" style={{fontSize: '0.7rem'}}>-{product.discountPercent}%</span>
              </div>
              <span className="fw-bold fs-4 text-dark">₹ {formatPrice(discountedPrice)}</span>
            </div>
          ) : (
            <span className="fw-bold fs-4 text-dark">₹ {formatPrice(originalPrice)}</span>
          )}
        </div>

        {product.stockQuantity !== undefined && (
            <p className="card-text text-muted extra-small mb-3">
                STOCK: <span>{product.stockQuantity}</span>
            </p>
        )}

        {/* Wishlist Action */}
        <div className="mt-2 btn-group-actions">
          <button 
            onClick={(e) => handleAddToWishlist(e, product.id)} 
            className="btn btn-outline-dark btn-sm w-100 rounded-0 tracking-wider text-uppercase"
            style={{ fontSize: '0.75rem', padding: '8px' }}
          >
            <i className={`${isAuthenticated ? 'fas' : 'far'} fa-heart me-2`}></i> Wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
