import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import Footer from '../../common/Footer';
import { formatCurrency } from '../../../utils/formatters';
import orderService from '../../../services/orderService';
import addressService from '../../../services/addressService';
import giftCardService from '../../../services/giftCardService';
import couponService from '../../../services/couponService';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    customer: null,
    recentOrders: [],
    addresses: [],
    giftCardBalance: 0,
    activeCoupons: 0,
    stats: {
      totalOrders: 0,
      totalAddresses: 0,
      activeGiftCards: 0,
      availableCoupons: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [ordersData, addressesData, giftCardsData, couponsData] = await Promise.all([
        orderService.getOrders().catch(() => ({ success: false, orders: [] })),
        addressService.getAddresses().catch(() => ({ success: false, addresses: [] })),
        giftCardService.getGiftCards().catch(() => ({ success: false, giftCards: [], totalBalance: 0 })),
        couponService.getCoupons().catch(() => ({ success: false, coupons: [] }))
      ]);

      // Process orders
      const orders = ordersData.success ? ordersData.orders || [] : [];
      const recentOrders = orders.slice(0, 3); // Get 3 most recent

      // Process addresses
      const addresses = addressesData.success ? addressesData.addresses || [] : [];

      // Process gift cards
      const giftCards = giftCardsData.success ? giftCardsData.giftCards || [] : [];
      const giftCardBalance = giftCardsData.totalBalance || 0;

      // Process coupons (count active ones)
      const coupons = couponsData.success ? couponsData.coupons || [] : [];
      const today = new Date();
      const activeCoupons = coupons.filter(coupon => {
        const expiryDate = new Date(coupon.expirationDate);
        return expiryDate > today;
      }).length;

      setDashboardData({
        recentOrders,
        addresses,
        giftCardBalance,
        activeCoupons,
        stats: {
          totalOrders: orders.length,
          totalAddresses: addresses.length,
          activeGiftCards: giftCards.length,
          availableCoupons: activeCoupons
        }
      });
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning text-dark';
      case 'PROCESSING':
        return 'bg-info';
      case 'SHIPPED':
        return 'bg-primary';
      case 'DELIVERED':
        return 'bg-success';
      case 'CANCELLED':
      case 'RETURNED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
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
            <p className="mt-3">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="main-content container mt-5 mb-5">
        {/* Welcome Section */}
        <div className="welcome-section mb-4">
          <h1 className="hero-title display-5">
            <i className="fa fa-home me-2"></i>
            Your Dashboard
          </h1>
          <p className="text-muted">Welcome back! Here's what's happening with your account.</p>
        </div>
        <hr />

        {/* Quick Stats Cards */}
        <div className="row g-4 mb-5">
          {/* Orders */}
          <div className="col-md-6 col-lg-3">
            <Link to="/customer/orders" className="text-decoration-none">
              <div className="stat-card card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted small mb-1">Total Orders</p>
                      <h3 className="mb-0">{dashboardData.stats.totalOrders}</h3>
                    </div>
                    <div className="stat-icon bg-primary">
                      <i className="fa fa-shopping-bag"></i>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="badge bg-primary-subtle text-primary">
                      <i className="fa fa-arrow-right me-1"></i>
                      View All
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Addresses */}
          <div className="col-md-6 col-lg-3">
            <Link to="/customer/addresses" className="text-decoration-none">
              <div className="stat-card card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted small mb-1">Saved Addresses</p>
                      <h3 className="mb-0">{dashboardData.stats.totalAddresses}</h3>
                    </div>
                    <div className="stat-icon bg-success">
                      <i className="fa fa-map-marker-alt"></i>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="badge bg-success-subtle text-success">
                      <i className="fa fa-arrow-right me-1"></i>
                      Manage
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Gift Cards */}
          <div className="col-md-6 col-lg-3">
            <Link to="/customer/gift-cards" className="text-decoration-none">
              <div className="stat-card card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted small mb-1">Gift Card Balance</p>
                      <h3 className="mb-0 fs-5">{formatCurrency(dashboardData.giftCardBalance)}</h3>
                    </div>
                    <div className="stat-icon bg-warning">
                      <i className="fa fa-gift"></i>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="badge bg-warning-subtle text-warning">
                      <i className="fa fa-arrow-right me-1"></i>
                      View Cards
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Coupons */}
          <div className="col-md-6 col-lg-3">
            <Link to="/customer/coupons" className="text-decoration-none">
              <div className="stat-card card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted small mb-1">Active Coupons</p>
                      <h3 className="mb-0">{dashboardData.activeCoupons}</h3>
                    </div>
                    <div className="stat-icon bg-danger">
                      <i className="fa fa-tag"></i>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="badge bg-danger-subtle text-danger">
                      <i className="fa fa-arrow-right me-1"></i>
                      View Offers
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fa fa-clock me-2"></i>
                    Recent Orders
                  </h5>
                  <Link to="/customer/orders" className="btn btn-sm btn-outline-primary">
                    View All Orders
                  </Link>
                </div>
              </div>
              <div className="card-body">
                {dashboardData.recentOrders.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fa fa-shopping-bag fa-3x text-muted mb-3"></i>
                    <p className="text-muted mb-3">You haven't placed any orders yet!</p>
                    <Link to="/products" className="btn btn-primary">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.recentOrders.map(order => (
                          <tr key={order.id}>
                            <td className="fw-bold">#{order.id}</td>
                            <td>
                              {new Date(order.orderDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="fw-bold">{formatCurrency(order.totalAmount)}</td>
                            <td>
                              <Link 
                                to={`/order/track/${order.id}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                <i className="fa fa-eye me-1"></i>
                                Track
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h5 className="mb-3">
              <i className="fa fa-link me-2"></i>
              Quick Links
            </h5>
          </div>

          <div className="col-md-4 mb-3">
            <div className="quick-link-card card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="quick-link-icon bg-primary-subtle text-primary me-3">
                    <i className="fa fa-user"></i>
                  </div>
                  <h6 className="mb-0">My Profile</h6>
                </div>
                <p className="text-muted small mb-3">
                  Update your personal information, email, and password
                </p>
                <Link to="/customer/profile" className="btn btn-sm btn-outline-primary">
                  <i className="fa fa-arrow-right me-1"></i>
                  Go to Profile
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="quick-link-card card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="quick-link-icon bg-success-subtle text-success me-3">
                    <i className="fa fa-shopping-cart"></i>
                  </div>
                  <h6 className="mb-0">Shopping Cart</h6>
                </div>
                <p className="text-muted small mb-3">
                  View and manage items in your shopping cart
                </p>
                <Link to="/cart" className="btn btn-sm btn-outline-success">
                  <i className="fa fa-arrow-right me-1"></i>
                  View Cart
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="quick-link-card card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="quick-link-icon bg-danger-subtle text-danger me-3">
                    <i className="fa fa-heart"></i>
                  </div>
                  <h6 className="mb-0">Wishlist</h6>
                </div>
                <p className="text-muted small mb-3">
                  Save your favorite items for later
                </p>
                <Link to="/wishlist" className="btn btn-sm btn-outline-danger">
                  <i className="fa fa-arrow-right me-1"></i>
                  View Wishlist
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Account Management Section */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="fa fa-cog me-2"></i>
                  Account Management
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-start">
                      <i className="fa fa-shield-alt fa-2x text-primary me-3 mt-1"></i>
                      <div>
                        <h6 className="mb-1">Security</h6>
                        <p className="text-muted small mb-2">
                          Change your password and manage security settings
                        </p>
                        <Link to="/customer/profile" className="btn btn-sm btn-link p-0">
                          Update Security Settings →
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start">
                      <i className="fa fa-bell fa-2x text-warning me-3 mt-1"></i>
                      <div>
                        <h6 className="mb-1">Notifications</h6>
                        <p className="text-muted small mb-2">
                          Manage your email and notification preferences
                        </p>
                        <Link to="/customer/profile" className="btn btn-sm btn-link p-0">
                          Manage Preferences →
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start">
                      <i className="fa fa-credit-card fa-2x text-success me-3 mt-1"></i>
                      <div>
                        <h6 className="mb-1">Payment Methods</h6>
                        <p className="text-muted small mb-2">
                          View and manage your saved payment methods
                        </p>
                        <Link to="/customer/profile" className="btn btn-sm btn-link p-0">
                          Manage Payments →
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start">
                      <i className="fa fa-headset fa-2x text-info me-3 mt-1"></i>
                      <div>
                        <h6 className="mb-1">Customer Support</h6>
                        <p className="text-muted small mb-2">
                          Get help with orders, returns, and more
                        </p>
                        <Link to="/contact" className="btn btn-sm btn-link p-0">
                          Contact Support →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Dashboard;