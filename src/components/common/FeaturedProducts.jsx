import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import authService from '../../services/authService';
import ProductCard from './ProductCard';

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
    <section className="py-5" style={{ backgroundColor: 'var(--light-bg)' }}>
      <div className="container">
        {/* Welcome Message for Authenticated Users */}
        {isAuthenticated && customer && (
          <h2 className="text-center mb-5" style={{ fontFamily: 'Playfair Display', fontWeight: '500' }}>
            Welcome Back, {customer.firstName || 'Customer'}
          </h2>
        )}

        <div className="text-center mb-5">
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Featured Collection
          </h2>
          <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--brand-orange)', margin: '15px auto' }}></div>
          <p className="text-muted" style={{ fontFamily: 'Inter', letterSpacing: '1px' }}>Curated exclusively for you</p>
        </div>

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
              <ProductCard 
                product={product} 
                handleAddToWishlist={handleAddToWishlist} 
                isAuthenticated={isAuthenticated} 
              />
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