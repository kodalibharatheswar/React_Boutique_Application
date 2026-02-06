import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import authService from '../../services/authService';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    checkAuthAndLoadProducts();
  }, []);

  const checkAuthAndLoadProducts = async () => {
    try {
      // Check authentication
      const authResponse = await authService.checkAuth();
      setIsAuthenticated(authResponse.authenticated);
      setCustomer(authResponse.user);

      // Load products
      const response = await axiosInstance.get('/public/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await axiosInstance.post(`/wishlist/add/${productId}`);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message || 'Added to wishlist!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to add to wishlist' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getDiscountedPrice = (product) => {
    if (product.discountPercent > 0) {
      return product.price - (product.price * product.discountPercent / 100);
    }
    return product.price;
  };

  if (loading) {
    return (
      <section className="py-5 bg-light">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5 bg-light">
      <div className="container">
        {/* Welcome Message for Authenticated Users */}
        {isAuthenticated && customer && (
          <h2 className="text-center mb-4">
            Welcome Back, {customer.firstName || 'Customer'}!
          </h2>
        )}

        <h3 className="mb-4">
          Featured Products <small className="text-muted">(Latest Arrivals)</small>
        </h3>

        {/* Flash Messages */}
        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
            {message.text}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMessage({ type: '', text: '' })}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Product Grid */}
        <div className="row g-4">
          {products.map((product) => (
            <div key={product.id} className="col-sm-6 col-md-4 col-lg-3">
              <div className="card product-card shadow-sm h-100">
                {/* Sale/Clearance Badge */}
                {product.isClearance && (
                  <span className="sale-status-badge clearance-badge">CLEARANCE!</span>
                )}
                {!product.isClearance && product.discountPercent > 0 && (
                  <span className="sale-status-badge sale-badge">SALE</span>
                )}

                {/* Product Link Wrapper */}
                <Link to={`/products/${product.id}`} className="product-link-wrapper">
                  <div style={{ position: 'absolute', inset: 0, bottom: '120px' }}></div>
                </Link>

                {/* Product Image */}
                <img 
                  src={product.imageUrl || 'https://placehold.co/600x600/ccc/333?text=No+Image'} 
                  onError={(e) => { e.target.src = 'https://placehold.co/600x600/ccc/333?text=Error+Loading'; }}
                  className="card-img-top"
                  alt={product.name}
                />

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="text-muted small mb-2">{product.category}</p>

                  {/* Price Display */}
                  <p className="card-text fw-bold fs-5 mt-auto">
                    {product.discountPercent > 0 ? (
                      <span className="text-secondary d-block">
                        <span className="original-price">
                          ₹ {formatPrice(product.price)}
                        </span>
                        <span className="badge bg-danger discount-badge">
                          -{product.discountPercent}%
                        </span>
                        <br />
                        <span className="text-success">
                          ₹ {formatPrice(getDiscountedPrice(product))}
                        </span>
                      </span>
                    ) : (
                      <span className="text-success">
                        ₹ {formatPrice(product.price)}
                      </span>
                    )}
                  </p>

                  <p className="card-text text-muted small">
                    Stock: {product.stockQuantity}
                  </p>

                  {/* Wishlist Button - Only for Authenticated Users */}
                  {isAuthenticated && (
                    <div className="mt-2 btn-group" role="group">
                      <button 
                        onClick={(e) => handleAddToWishlist(e, product.id)}
                        className="btn btn-outline-danger w-100 btn-sm"
                      >
                        <i className="fa-regular fa-heart me-1"></i> Wishlist
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="alert alert-info mt-5 text-center">
            No products available at the moment.
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;