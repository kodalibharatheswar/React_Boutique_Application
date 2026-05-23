import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import './ProductStyles.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Form State
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('desc'); // desc, add-info, reviews
    const [selectedMedia, setSelectedMedia] = useState({ type: 'image', url: '' });

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                // Fetch product details
                const prodRes = await axiosInstance.get(`/public/products/${id}`);
                const productData = prodRes.data.product || prodRes.data;
                setProduct(productData);
                setSelectedMedia({ type: 'image', url: productData.imageUrl });
                
                // Fetch related products (assuming endpoint or filtering locally based on category)
                // If backend doesn't have a specific endpoint, we fetch category and filter
                try {
                    const relatedRes = await axiosInstance.get(`/public/products?category=${encodeURIComponent(productData.category)}`);
                    const relatedData = relatedRes.data.products || relatedRes.data;
                    // Exclude current product and limit to 4
                    setRelatedProducts(relatedData.filter(p => p.id !== productData.id).slice(0, 4));
                } catch(relErr) {
                    console.error("Could not fetch related products", relErr);
                }
            } catch (err) {
                console.error("Failed to fetch product details:", err);
                setError("Product not found or unable to load details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductData();
            window.scrollTo(0, 0); // Reset scroll on new product load
        }
    }, [id]);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (product.stockQuantity === 0) return;
        
        if (product.sizeOptions && !selectedSize) {
            alert("Please select a size.");
            return;
        }

        try {
            await axiosInstance.post('/cart/add', { 
                productId: product.id, 
                quantity: quantity,
                size: selectedSize 
            });
            alert("Added to cart!");
        } catch (err) {
            if(err.response?.status === 401 || err.response?.status === 403 || !err.response) {
                navigate('/cart-unauth');
            } else {
                alert("Failed to add to cart.");
            }
        }
    };

    const handleAddToWishlist = async (e, productId) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/wishlist/add/${productId}`, {});
            alert("Added to wishlist!");
        } catch (err) {
            if(err.response?.status === 401 || err.response?.status === 403 || !err.response) {
                navigate('/wishlist-unauth');
            } else {
                alert("Failed to add to wishlist.");
            }
        }
    };

    const copyProductLink = () => {
        const url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                alert("Product link copied to clipboard!");
            }).catch(err => {
                fallbackCopyTextToClipboard(url);
            });
        } else {
            fallbackCopyTextToClipboard(url);
        }
    };

    const fallbackCopyTextToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert('Product link copied!');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    };

    // Derived values
    const formatPrice = (price) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price);
    
    if (loading) {
        return (
            <div className="container py-5 text-center mt-5 min-vh-100">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3 text-muted">Loading product details...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container py-5 text-center mt-5 min-vh-100">
                <div className="alert alert-danger d-inline-block px-5">
                    <i className="fas fa-exclamation-triangle fa-2x mb-3 text-danger d-block"></i>
                    <h4 className="alert-heading fw-bold">Oops!</h4>
                    <p>{error || "Product not found."}</p>
                    <Link to="/products" className="btn btn-outline-dark mt-3">Back to Shop</Link>
                </div>
            </div>
        );
    }

    const originalPrice = parseFloat(product.price);
    const hasDiscount = parseFloat(product.discountPercent) > 0;
    const discountedPrice = hasDiscount ? originalPrice - (originalPrice * parseFloat(product.discountPercent) / 100) : originalPrice;
    const isClearance = product.isClearance || parseFloat(product.discountPercent) >= 50;

    return (
        <div className="main-content flex-grow-1 product-detail-wrapper pb-5">
            {/* Full-width fluid container — no Bootstrap gutters on mobile */}
            <div className="product-detail-page">

                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-3 pt-3">
                    <ol className="breadcrumb small mb-0">
                        <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none hover-brand transition-colors">Home</Link></li>
                        <li className="breadcrumb-item"><Link to="/products" className="text-muted text-decoration-none hover-brand transition-colors">Shop</Link></li>
                        <li className="breadcrumb-item"><Link to={`/products?category=${product.category}`} className="text-muted text-decoration-none hover-brand transition-colors">{product.category}</Link></li>
                        <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">{product.name}</li>
                    </ol>
                </nav>

                {/* White card — edge-to-edge on mobile, card on desktop */}
                <div className="product-detail-card bg-white mb-5 mx-auto overflow-hidden">
                    <div className="row g-3 g-lg-5">
                        
                        {/* Image Gallery */}
                        <div className="col-lg-6">
                            <div className="position-relative bg-light rounded-4 overflow-hidden shadow-sm mb-3" style={{ aspectRatio: '3/4', maxHeight: '550px' }}>
                                {/* Badges */}
                                <div className="position-absolute top-0 start-0 m-4 z-3 d-flex flex-column gap-2">
                                    {isClearance ? (
                                        <span className="badge bg-danger fs-6 px-3 py-2 shadow border border-white border-2 rounded-1 tracking-wider">CLEARANCE SALE!</span>
                                    ) : hasDiscount ? (
                                        <span className="badge bg-primary fs-6 px-3 py-2 shadow border border-white border-2 rounded-1 tracking-wider">ON SALE</span>
                                    ) : null}
                                </div>

                                {selectedMedia.type === 'image' ? (
                                    <img 
                                        src={selectedMedia.url || 'https://placehold.co/600x800/f8f9fa/dee2e6?text=No+Image'} 
                                        className="w-100 h-100 object-fit-cover" 
                                        alt={product.name}
                                        key={selectedMedia.url}
                                        onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/600x800/f8f9fa/dee2e6?text=Error'}} 
                                    />
                                ) : (
                                    <video 
                                        src={selectedMedia.url} 
                                        className="w-100 h-100 object-fit-cover" 
                                        controls 
                                        autoPlay 
                                        key={selectedMedia.url}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>

                            {/* Thumbnails */}
                            <div className="d-flex gap-2 overflow-auto pb-2 custom-scrollbar">
                                {/* Main Image Thumbnail */}
                                <div 
                                    className={`cursor-pointer border-2 rounded-3 p-1 flex-shrink-0 ${selectedMedia.url === product.imageUrl ? 'border-dark' : 'border-light'}`}
                                    style={{width: '80px', height: '80px', transition: 'all 0.2s'}}
                                    onClick={() => setSelectedMedia({type: 'image', url: product.imageUrl})}
                                >
                                    <img src={product.imageUrl} className="w-100 h-100 object-fit-cover rounded-2" alt="thumbnail main" />
                                </div>

                                {/* Additional Image Thumbnails */}
                                {product.additionalImageUrls && product.additionalImageUrls.map((url, idx) => (
                                    <div 
                                        key={idx}
                                        className={`cursor-pointer border-2 rounded-3 p-1 flex-shrink-0 ${selectedMedia.url === url ? 'border-dark' : 'border-light'}`}
                                        style={{width: '80px', height: '80px', transition: 'all 0.2s'}}
                                        onClick={() => setSelectedMedia({type: 'image', url: url})}
                                    >
                                        <img src={url} className="w-100 h-100 object-fit-cover rounded-2" alt={`thumbnail ${idx}`} />
                                    </div>
                                ))}

                                {/* Video Thumbnail if exists */}
                                {product.videoUrl && (
                                    <div 
                                        className={`cursor-pointer border-2 rounded-3 p-1 flex-shrink-0 bg-dark d-flex align-items-center justify-content-center ${selectedMedia.url === product.videoUrl ? 'border-dark' : 'border-light'}`}
                                        style={{width: '80px', height: '80px', transition: 'all 0.2s'}}
                                        onClick={() => setSelectedMedia({type: 'video', url: product.videoUrl})}
                                    >
                                        <i className="fas fa-play text-white fs-4"></i>
                                    </div>
                                )}
                            </div>

                            {/* Audio Player if exists */}
                            {product.audioUrl && (
                                <div className="mt-4 p-3 bg-white border rounded-4 shadow-sm d-flex align-items-center gap-3">
                                    <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{width: '45px', height: '45px', minWidth: '45px'}}>
                                        <i className="fas fa-music"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                        <p className="small fw-bold mb-1 text-uppercase tracking-wider">Product Story / Audio</p>
                                        <audio controls src={product.audioUrl} className="w-100" style={{height: '30px'}}>
                                            Your browser does not support audio.
                                        </audio>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="col-lg-6 d-flex flex-column">
                            <div className="mb-2">
                                <span className="badge bg-light text-dark border tracking-wider text-uppercase me-2 mb-2">{product.category}</span>
                                {product.sku && <span className="badge bg-light text-muted border text-uppercase mb-2">SKU: {product.sku}</span>}
                            </div>
                            
                            <h1 className="display-5 fw-bold text-dark mb-3" style={{ fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>
                                {product.name}
                            </h1>

                            {/* Price */}
                            <div className="mb-4">
                                {hasDiscount ? (
                                    <div className="d-flex align-items-baseline gap-3">
                                        <span className="display-4 fw-bold text-dark">₹{formatPrice(discountedPrice)}</span>
                                        <div>
                                            <span className="text-decoration-line-through text-muted fs-5 d-block">MRP: ₹{formatPrice(originalPrice)}</span>
                                            <span className="text-danger fw-bold">Save {product.discountPercent}%</span>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="display-4 fw-bold text-dark">₹{formatPrice(originalPrice)}</span>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div className="mb-4">
                                {product.stockQuantity > 0 ? (
                                    <span className="text-success fw-bold bg-success bg-opacity-10 px-3 py-1 rounded-pill">
                                        <i className="fas fa-check-circle me-1"></i> In Stock ({product.stockQuantity} available)
                                    </span>
                                ) : (
                                    <span className="text-danger fw-bold bg-danger bg-opacity-10 px-3 py-1 rounded-pill">
                                        <i className="fas fa-times-circle me-1"></i> Out of Stock
                                    </span>
                                )}
                            </div>

                            <p className="text-muted fs-5 mb-4 border-bottom pb-4 line-clamp-2" title={product.description}>
                                {product.description}
                            </p>

                            {/* Selection Form */}
                            <div className="mt-auto">
                                <form onSubmit={handleAddToCart}>
                                    
                                    {/* Size Selection */}
                                    {product.sizeOptions && product.sizeOptions.trim() !== '' && (
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-end mb-2">
                                                <label className="fw-bold text-dark">Select Size</label>
                                                {product.sizeGuideUrl && (
                                                    <a href={product.sizeGuideUrl} target="_blank" rel="noopener noreferrer" className="small text-decoration-underline text-muted hover-brand transition-colors">
                                                        <i className="fas fa-ruler-horizontal me-1"></i> Size Guide
                                                    </a>
                                                )}
                                            </div>
                                            <select 
                                                className="form-select form-select-lg border-2 shadow-sm rounded-3 cursor-pointer"
                                                value={selectedSize}
                                                onChange={(e) => setSelectedSize(e.target.value)}
                                                required
                                                style={{height: '50px'}}
                                            >
                                                <option value="" disabled>Choose an option</option>
                                                {product.sizeOptions.split(',').map(size => {
                                                    const trimmedSize = size.trim();
                                                    return (
                                                        <option key={trimmedSize} value={trimmedSize}>
                                                            {trimmedSize}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    )}

                                    {/* Actions Row — qty | add to cart | wishlist, always single row */}
                                    <div className="product-actions-row d-flex flex-nowrap gap-2 align-items-stretch mb-4" style={{minHeight: '50px'}}>
                                        {/* Quantity */}
                                        <div className="product-qty-box border rounded-2 d-flex align-items-center px-1 bg-white" style={{width: '110px', flexShrink: 0}}>
                                            <button 
                                                type="button" 
                                                className="btn btn-link text-dark text-decoration-none px-2 shadow-none py-0" 
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                disabled={product.stockQuantity === 0}
                                            >
                                                <i className="fas fa-minus"></i>
                                            </button>
                                            <input 
                                                type="number" 
                                                className="form-control border-0 text-center shadow-none fw-bold bg-transparent px-0" 
                                                value={quantity} 
                                                onChange={(e) => setQuantity(Math.min(product.stockQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                                                min="1" 
                                                max={product.stockQuantity}
                                                disabled={product.stockQuantity === 0}
                                                style={{minWidth: 0}}
                                            />
                                            <button 
                                                type="button" 
                                                className="btn btn-link text-dark text-decoration-none px-2 shadow-none py-0" 
                                                onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                                                disabled={product.stockQuantity === 0}
                                            >
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>

                                        {/* Add to Cart */}
                                        <button 
                                            type="submit" 
                                            className="product-add-to-cart btn btn-dark fw-bold tracking-wider transition-colors"
                                            disabled={product.stockQuantity === 0}
                                            style={{flex: '1 1 auto', whiteSpace: 'nowrap', overflow: 'hidden'}}
                                        >
                                            {product.stockQuantity === 0 ? 'SOLD OUT' : (
                                                <><i className="fas fa-shopping-bag cart-icon me-2"></i>ADD TO CART</>
                                            )}
                                        </button>

                                        {/* Wishlist */}
                                        <button 
                                            type="button" 
                                            onClick={(e) => handleAddToWishlist(e, product.id)}
                                            className="product-wishlist-btn btn btn-outline-danger transition-colors d-flex align-items-center justify-content-center"
                                            title="Add to Wishlist"
                                            style={{minWidth: '48px', flexShrink: 0}}
                                        >
                                            <i className="far fa-heart fs-5"></i>
                                        </button>
                                    </div>
                                    
                                    {/* Delivery Info */}
                                    <div className="bg-light p-3 rounded-3 mt-4 text-muted small">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fas fa-truck fa-fw me-2 opacity-75"></i>
                                            <span><strong>Estimated Delivery:</strong> {product.estimatedDelivery || 'Details provided at checkout.'}</span>
                                        </div>
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fas fa-undo fa-fw me-2 opacity-75"></i>
                                            <span><strong>Returns:</strong> {product.deliveryAndReturnPolicy || 'Standard 7-day exchange policy applies.'}</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-share-alt fa-fw me-2 opacity-75"></i>
                                            <span className="d-flex gap-3 align-items-center">
                                                <strong>Share:</strong>
                                                <button type="button" onClick={copyProductLink} className="btn p-0 text-muted hover-brand transition-colors"><i className="fas fa-link fa-lg"></i></button>
                                                <a href={`https://wa.me/?text=Check out ${product.name} at ${window.location.href}`} target="_blank" rel="noopener noreferrer" className="text-muted hover-brand transition-colors"><i className="fab fa-whatsapp fa-lg"></i></a>
                                            </span>
                                        </div>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-4 shadow-sm overflow-hidden mb-5">
                    <ul className="nav nav-tabs nav-fill border-bottom-0 bg-light p-2 gap-2" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button 
                                className={`nav-link fw-bold border-0 rounded-3 py-3 w-100 transition-colors ${activeTab === 'desc' ? 'active bg-white text-dark shadow-sm' : 'text-muted hover-bg-light'}`}
                                onClick={() => setActiveTab('desc')}
                            >
                                Description
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button 
                                className={`nav-link fw-bold border-0 rounded-3 py-3 w-100 transition-colors ${activeTab === 'add-info' ? 'active bg-white text-dark shadow-sm' : 'text-muted hover-bg-light'}`}
                                onClick={() => setActiveTab('add-info')}
                            >
                                Additional Information
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button 
                                className={`nav-link fw-bold border-0 rounded-3 py-3 w-100 transition-colors ${activeTab === 'reviews' ? 'active bg-white text-dark shadow-sm' : 'text-muted hover-bg-light'}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                Reviews
                            </button>
                        </li>
                    </ul>

                    <div className="p-4 p-md-5 bg-white min-vh-25">
                        {/* Description Tab */}
                        {activeTab === 'desc' && (
                            <div className="animation-fade-in">
                                <h4 className="fw-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Product Details</h4>
                                <div className="text-muted" dangerouslySetInnerHTML={{ __html: (product.description || '').replace(/\n/g, '<br/>') }} />
                                
                                {product.productTags && (
                                    <div className="mt-4 pt-4 border-top">
                                        <h6 className="fw-bold text-dark mb-3">Tags</h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {product.productTags.split(',').map(tag => (
                                                <span key={tag.trim()} className="badge bg-light text-dark border px-3 py-2 fw-normal tracking-wider">{tag.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Additional Info Tab */}
                        {activeTab === 'add-info' && (
                            <div className="animation-fade-in row">
                                <div className="col-md-6 mb-4 mb-md-0 border-end-md pe-md-4">
                                    <h5 className="fw-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Fabric & Care</h5>
                                    <div className="text-muted" dangerouslySetInnerHTML={{ __html: (product.additionalInformation || 'No additional details provided.').replace(/\n/g, '<br/>') }} />
                                </div>
                                <div className="col-md-6 ps-md-4">
                                     <h5 className="fw-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Specifications</h5>
                                     <table className="table table-borderless table-sm m-0 text-muted">
                                         <tbody>
                                             <tr><th className="fw-bold text-dark w-25 pb-2">Category</th><td>{product.category}</td></tr>
                                             <tr><th className="fw-bold text-dark w-25 pb-2">SKU</th><td>{product.sku || 'N/A'}</td></tr>
                                             <tr><th className="fw-bold text-dark w-25 pb-2">Sizes</th><td>{product.sizeOptions || 'N/A'}</td></tr>
                                             <tr><th className="fw-bold text-dark w-25 pb-2">Availability</th><td>{product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}</td></tr>
                                         </tbody>
                                     </table>
                                </div>
                            </div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className="animation-fade-in text-center py-5">
                                <div className="opacity-50 mb-3">
                                    <i className="far fa-star fa-3x text-warning"></i>
                                    <i className="far fa-star fa-3x text-warning mx-2"></i>
                                    <i className="far fa-star fa-3x text-warning"></i>
                                </div>
                                <h4 className="fw-bold">Customer Reviews</h4>
                                <p className="text-muted">Reviews functionality will be integrated shortly. Be the first to share your thoughts!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-5 pt-4 border-top">
                        <div className="d-flex justify-content-between align-items-end mb-4">
                            <h2 className="fw-bold m-0" style={{ fontFamily: "'Playfair Display', serif" }}>More from {product.category}</h2>
                            <Link to={`/products?category=${product.category}`} className="text-dark fw-bold text-decoration-none hover-brand transition-colors">View All <i className="fas fa-arrow-right ms-1 small"></i></Link>
                        </div>
                        <div className="row g-4">
                            {relatedProducts.map(rel => {
                                const relOrigPrice = parseFloat(rel.price);
                                const relHasDiscount = parseFloat(rel.discountPercent) > 0;
                                const relDiscPrice = relHasDiscount ? relOrigPrice - (relOrigPrice * parseFloat(rel.discountPercent) / 100) : relOrigPrice;
                                const relIsClearance = rel.isClearance || parseFloat(rel.discountPercent) >= 50;
                                
                                return (
                                    <div key={rel.id} className="col-6 col-md-3">
                                        <div className="card h-100 border-0 bg-transparent group product-card-hover">
                                            <Link to={`/products/${rel.id}`} className="position-relative d-block bg-white rounded-4 overflow-hidden shadow-sm mb-3" style={{aspectRatio: '3/4'}}>
                                                {/* Mini Badges */}
                                                <div className="position-absolute top-0 start-0 m-2 z-3 d-flex flex-column gap-1">
                                                    {relIsClearance ? (
                                                        <span className="badge bg-danger rounded-1 px-2 py-1 shadow-sm" style={{fontSize: '0.6rem'}}>CLEARANCE</span>
                                                    ) : relHasDiscount ? (
                                                        <span className="badge bg-primary rounded-1 px-2 py-1 shadow-sm" style={{fontSize: '0.6rem'}}>SALE</span>
                                                    ) : null}
                                                </div>
                                                <img 
                                                    src={rel.imageUrl || 'https://placehold.co/400x533/f8f9fa/dee2e6?text=No+Image'} 
                                                    className="w-100 h-100 object-fit-cover transform-hover-scale" alt={rel.name}
                                                    onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/400x533/f8f9fa/dee2e6?text=Error'}} 
                                                />
                                            </Link>
                                            <div className="px-1 text-center">
                                                <h6 className="fw-bold mb-1 line-clamp-1"><Link to={`/products/${rel.id}`} className="text-dark text-decoration-none hover-brand transition-colors">{rel.name}</Link></h6>
                                                <div className="d-flex justify-content-center align-items-center gap-2">
                                                    {relHasDiscount ? (
                                                        <>
                                                            <span className="text-decoration-line-through text-muted small">₹{formatPrice(relOrigPrice)}</span>
                                                            <span className="fw-bold text-dark">₹{formatPrice(relDiscPrice)}</span>
                                                        </>
                                                    ) : (
                                                        <span className="fw-bold text-dark">₹{formatPrice(relOrigPrice)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
            
            <style>{`
                .animation-fade-in {
                    animation: fadeIn 0.4s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .border-end-md {
                    border-right: 1px solid #dee2e6;
                }
                @media (max-width: 767.98px) {
                    .border-end-md {
                        border-right: none;
                        border-bottom: 1px solid #dee2e6;
                        padding-bottom: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductDetail;
