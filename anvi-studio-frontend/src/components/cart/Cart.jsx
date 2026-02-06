import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import CartItem from './CartItem';
import cartService from '../../services/cartService';
import { formatCurrency } from '../../utils/formatters';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await cartService.getCart();
      
      if (!data.authenticated) {
        // User not authenticated, redirect to unauth cart page
        navigate('/cart-unauth');
        return;
      }

      setCartItems(data.cartItems || []);
      setCartTotal(data.cartTotal || 0);
      
    } catch (err) {
      if (err.response?.status === 401) {
        // Unauthorized - redirect to login
        navigate('/cart-unauth');
      } else {
        setError(err.response?.data?.message || 'Failed to load cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      await cartService.updateQuantity(itemId, quantity);
      
      // Refresh cart after update
      await fetchCart();
      
      setSuccessMessage('Cart updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart item.');
      setTimeout(() => setError(''), 3000);
      throw err; // Re-throw to let CartItem handle it
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      
      // Refresh cart after removal
      await fetchCart();
      
      setSuccessMessage('Item removed from cart.');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item.');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="main-content container mt-5">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="main-content container mt-5">
        <h1 className="mb-4 hero-title">
          Your Shopping Cart <i className="fa fa-shopping-cart"></i>
        </h1>
        <hr />

        {/* Flash Messages */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {successMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccessMessage('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="row g-4">
          
          {/* Cart Items List */}
          <div className="col-lg-8">
            {cartItems.length === 0 ? (
              <div className="alert alert-info text-center p-4">
                <p className="lead mb-0">Your shopping cart is empty!</p>
                <p className="mt-2">
                  Start adding items from the{' '}
                  <Link to="/" className="alert-link">Home Page</Link>.
                </p>
              </div>
            ) : (
              <div className="d-grid gap-3">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="col-lg-4">
            <div className="summary-card shadow-sm sticky-top" style={{ top: '20px' }}>
              <h4 className="mb-4">Order Summary</h4>

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span className="fw-bold">₹ {formatCurrency(cartTotal)}</span>
              </div>

              <div className="d-flex justify-content-between mb-4">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>

              <div className="d-flex justify-content-between pt-2 border-top">
                <h5 className="mb-0">Estimated Total:</h5>
                <h5 className="mb-0 fw-bolder text-success">
                  ₹ {formatCurrency(cartTotal)}
                </h5>
              </div>

              {/* Proceed to Delivery Button */}
              <Link
                to="/checkout"
                className={`btn btn-brand w-100 mt-4 ${cartItems.length === 0 ? 'disabled' : ''}`}
                aria-disabled={cartItems.length === 0}
              >
                <i className="fa fa-map-marker-alt me-2"></i> Proceed to Delivery
              </Link>
            </div>
          </div>

        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Cart;