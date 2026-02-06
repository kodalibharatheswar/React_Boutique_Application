import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import WishlistItem from './WishlistItem';
import wishlistService from '../../services/wishlistService';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await wishlistService.getWishlist();
      
      if (!data.authenticated) {
        // User not authenticated, redirect to unauth wishlist page
        navigate('/wishlist-unauth');
        return;
      }

      setWishlistItems(data.wishlistItems || []);
      
    } catch (err) {
      if (err.response?.status === 401) {
        // Unauthorized - redirect to unauth page
        navigate('/wishlist-unauth');
      } else {
        setError(err.response?.data?.message || 'Failed to load wishlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      
      // Refresh wishlist after removal
      await fetchWishlist();
      
      setSuccessMessage('Item removed from Wishlist.');
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
            <p className="mt-3">Loading your wishlist...</p>
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
          My Wishlist <i className="fa fa-heart text-danger"></i>
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

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="alert alert-info text-center p-4">
            <p className="lead mb-0">Your wishlist is empty!</p>
            <p className="mt-2">
              Start adding items from the{' '}
              <Link to="/" className="alert-link">Home Page</Link>.
            </p>
          </div>
        ) : (
          /* Wishlist Items */
          <div className="row g-3">
            {wishlistItems.map((item) => (
              <WishlistItem
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </>
  );
};

export default Wishlist;