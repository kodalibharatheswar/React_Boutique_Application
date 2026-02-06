import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import Footer from '../../common/Footer';
import OrderItem from './OrderItem';
import orderService from '../../../services/orderService';

const Orders = () => {
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('latest');
  
  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    orderId: null,
    productId: null,
    productName: '',
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [orders, searchTerm, statusFilter, sortOrder]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setErrorMessage('Failed to load orders.');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setErrorMessage('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...orders];
    
    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => {
        if (statusFilter === 'PROCESSING') {
          return order.status === 'PROCESSING' || order.status === 'SHIPPED';
        } else if (statusFilter === 'CANCELLED') {
          return order.status === 'CANCELLED' || order.status === 'RETURNED' || order.status === 'RETURN_REQUESTED';
        } else {
          return order.status === statusFilter;
        }
      });
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        (order.orderItemsSnapshot && order.orderItemsSnapshot.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredOrders(filtered);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    
    try {
      setCancelling(true);
      const response = await orderService.cancelOrder(selectedOrderId);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Order cancelled successfully!');
        setShowCancelModal(false);
        fetchOrders(); // Refresh orders
        window.scrollTo(0, 0);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to cancel order.');
      setShowCancelModal(false);
      window.scrollTo(0, 0);
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewData.comment || reviewData.comment.length < 10) {
      alert('Please write at least 10 characters in your review.');
      return;
    }
    
    try {
      setSubmittingReview(true);
      const response = await orderService.submitReview({
        orderId: reviewData.orderId,
        productId: reviewData.productId,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      
      if (response.success) {
        setSuccessMessage(response.message || 'Thank you! Your review has been submitted for approval.');
        setShowReviewModal(false);
        setReviewData({
          orderId: null,
          productId: null,
          productName: '',
          rating: 5,
          comment: ''
        });
        window.scrollTo(0, 0);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit review.');
      setShowReviewModal(false);
      window.scrollTo(0, 0);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOpenCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const handleOpenReviewModal = (orderId, productId, productName) => {
    setReviewData({
      orderId,
      productId,
      productName,
      rating: 5,
      comment: ''
    });
    setShowReviewModal(true);
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
            <p className="mt-3">Loading your orders...</p>
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
        <h1 className="hero-title display-5 mb-4">
          <i className="fa fa-receipt me-2"></i> My Orders & History
        </h1>
        <hr />

        {/* Success/Error Messages */}
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
        
        {errorMessage && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {errorMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setErrorMessage('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="row mb-4 g-3">
          <div className="col-md-6">
            <div className="d-flex">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search by Order ID or Product"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-dark ms-2">
                <i className="fa fa-search"></i>
              </button>
            </div>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Orders</option>
              <option value="DELIVERED">Delivered</option>
              <option value="PROCESSING">Processing/Shipped</option>
              <option value="CANCELLED">Cancelled/Returned</option>
            </select>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="latest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && !loading && (
          <div className="alert alert-info text-center p-4">
            <p className="lead mb-0">
              {orders.length === 0 
                ? "You haven't placed any orders yet!" 
                : "No orders match your search criteria."}
            </p>
            {orders.length === 0 && (
              <>
                <p className="mt-2">Start shopping now and track your first order.</p>
                <Link to="/products" className="btn btn-dark mt-3">
                  Browse Products
                </Link>
              </>
            )}
          </div>
        )}

        {/* Orders List */}
        <div className="row g-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="col-12">
              <OrderItem
                order={order}
                onCancelOrder={handleOpenCancelModal}
                onWriteReview={handleOpenReviewModal}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="fa fa-exclamation-triangle me-2"></i> Confirm Cancellation
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowCancelModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel <strong>Order #{selectedOrderId}</strong>?</p>
                <div className="alert alert-warning small">
                  <i className="fa fa-info-circle me-1"></i>
                  Cancellation is immediate if the order is still processing. A full refund will be initiated, which may take 5-7 business days to reflect.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel & Request Refund'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fa fa-star me-2"></i> Write Your Review
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowReviewModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitReview}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Product:</label>
                    <p className="text-muted">{reviewData.productName}</p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Rating: <span className="text-danger">*</span>
                    </label>
                    <div className="star-rating">
                      {[5, 4, 3, 2, 1].map(star => (
                        <React.Fragment key={star}>
                          <input
                            type="radio"
                            name="rating"
                            value={star}
                            id={`star${star}`}
                            checked={reviewData.rating === star}
                            onChange={() => setReviewData({ ...reviewData, rating: star })}
                            required
                          />
                          <label 
                            htmlFor={`star${star}`}
                            style={{ color: reviewData.rating >= star ? 'gold' : '#ddd' }}
                          >
                            <i className="fas fa-star"></i>
                          </label>
                        </React.Fragment>
                      ))}
                    </div>
                    <small className="text-muted d-block mt-1">
                      Click on a star to rate (5 = Excellent, 1 = Poor)
                    </small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="reviewComment" className="form-label fw-bold">
                      Your Review: <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="reviewComment"
                      rows="4"
                      placeholder="Share your experience with this product..."
                      value={reviewData.comment}
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                      required
                      minLength="10"
                    ></textarea>
                    <small className="text-muted">Minimum 10 characters</small>
                  </div>

                  <div className="alert alert-info small mb-0">
                    <i className="fa fa-info-circle me-1"></i>
                    Your review will be submitted for approval and will be visible once our team reviews it.
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowReviewModal(false)}
                    disabled={submittingReview}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submittingReview}
                  >
                    {submittingReview ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-paper-plane me-1"></i> Submit Review
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default Orders;