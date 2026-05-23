import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import Footer from '../../common/Footer';
import axiosInstance from '../../../utils/axios';
import { formatCurrency } from '../../../utils/formatters';

const OrderTracking = () => {
  const { id } = useParams();
  const [trackingEvents, setTrackingEvents] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrackingData();
  }, [id]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      // Fetch tracking events
      const trackingRes = await axiosInstance.get(`/customer/orders/${id}/tracking`);
      if (trackingRes.data.success) {
        setTrackingEvents(trackingRes.data.tracking);
      }
      
      // Also fetch the order details to show summary
      const ordersRes = await axiosInstance.get('/customer/orders');
      if (ordersRes.data.success) {
        const currentOrder = ordersRes.data.orders.find(o => o.id.toString() === id);
        if (currentOrder) {
          setOrder(currentOrder);
        }
      }
    } catch (err) {
      setError('Failed to load tracking information. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CREATED': return 'fa-clipboard-list';
      case 'CONFIRMED': return 'fa-check-circle';
      case 'PROCESSING': return 'fa-box-open';
      case 'PACKED': return 'fa-box';
      case 'SHIPPED': return 'fa-truck';
      case 'OUT_FOR_DELIVERY': return 'fa-shipping-fast';
      case 'DELIVERED': return 'fa-home';
      case 'CANCELLED': return 'fa-times-circle';
      case 'RETURN_REQUESTED': return 'fa-undo';
      case 'RETURN_PICKED': return 'fa-people-carry';
      case 'RETURNED': return 'fa-money-bill-wave';
      default: return 'fa-circle';
    }
  };

  const getStatusColor = (status) => {
    if (['CANCELLED', 'RETURN_REQUESTED', 'RETURN_PICKED', 'RETURNED'].includes(status)) {
      return 'text-danger';
    }
    if (status === 'DELIVERED') {
      return 'text-success';
    }
    return 'text-primary';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading tracking details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 py-5 text-center">
          <div className="alert alert-danger">{error}</div>
          <Link to="/customer/orders" className="btn btn-dark mt-3">Back to Orders</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-5 mb-5" style={{ minHeight: '60vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0" style={{ fontFamily: 'Playfair Display' }}>Track Order #{id}</h2>
          <Link to="/customer/orders" className="btn btn-outline-dark btn-sm">
            <i className="fa fa-arrow-left me-2"></i> Back to Orders
          </Link>
        </div>
        <hr />

        <div className="row mt-4">
          {/* Order Summary Sidebar */}
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm border-0 bg-light">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">Order Summary</h5>
                {order && (
                  <>
                    <p className="mb-1 text-muted small">Order Date:</p>
                    <p className="fw-500 mb-3">{new Date(order.orderDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                    
                    <p className="mb-1 text-muted small">Total Amount:</p>
                    <p className="fw-bold fs-5 mb-3 text-success">{formatCurrency(order.totalAmount)}</p>
                    
                    <p className="mb-1 text-muted small">Current Status:</p>
                    <p className="fw-bold mb-0">
                      <span className={`badge bg-${order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'primary'}`}>
                        {order.status}
                      </span>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="col-md-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Tracking History</h5>
                
                {trackingEvents.length === 0 ? (
                  <p className="text-muted">No tracking information available yet.</p>
                ) : (
                  <div className="tracking-timeline position-relative ps-4" style={{ borderLeft: '2px solid #e9ecef' }}>
                    {trackingEvents.map((event, index) => (
                      <div key={event.id} className="timeline-event position-relative mb-4">
                        {/* Icon */}
                        <div className={`position-absolute bg-white d-flex align-items-center justify-content-center border border-2 rounded-circle ${getStatusColor(event.status)}`}
                             style={{ width: '32px', height: '32px', left: '-41px', top: '0' }}>
                          <i className={`fa ${getStatusIcon(event.status)} small`}></i>
                        </div>
                        
                        {/* Content */}
                        <div className="ms-2">
                          <h6 className="fw-bold mb-1">{event.status.replace(/_/g, ' ')}</h6>
                          <p className="text-muted small mb-1">
                            <i className="fa fa-clock me-1"></i>
                            {new Date(event.timestamp).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </p>
                          {event.location && (
                            <p className="text-muted small mb-1">
                              <i className="fa fa-map-marker-alt me-1"></i> {event.location}
                            </p>
                          )}
                          {event.description && (
                            <p className="small mb-0 mt-2 bg-light p-2 rounded text-secondary border border-light">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderTracking;
