import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import Footer from '../../common/Footer';
import CouponCard from './CouponCard';
import couponService from '../../../services/couponService';

const Coupons = () => {
  const navigate = useNavigate();
  
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ACTIVE, EXPIRED
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [coupons, filterStatus, searchTerm]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponService.getCoupons();
      
      if (data.success) {
        setCoupons(data.coupons || []);
      } else {
        setErrorMessage('Failed to load coupons.');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setErrorMessage('Failed to load coupons. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...coupons];
    const today = new Date();

    // Filter by status
    if (filterStatus === 'ACTIVE') {
      filtered = filtered.filter(coupon => {
        const expiryDate = new Date(coupon.expirationDate);
        return expiryDate > today;
      });
    } else if (filterStatus === 'EXPIRED') {
      filtered = filtered.filter(coupon => {
        const expiryDate = new Date(coupon.expirationDate);
        return expiryDate <= today;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(coupon =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by expiration date (nearest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.expirationDate);
      const dateB = new Date(b.expirationDate);
      return dateA - dateB;
    });

    setFilteredCoupons(filtered);
  };

  const getActiveCouponsCount = () => {
    const today = new Date();
    return coupons.filter(coupon => {
      const expiryDate = new Date(coupon.expirationDate);
      return expiryDate > today;
    }).length;
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
            <p className="mt-3">Loading coupons...</p>
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
          <i className="fa fa-tag me-2"></i> Coupons & Offers
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

        {/* Stats Row */}
        {coupons.length > 0 && (
          <div className="row mb-4">
            <div className="col-md-12">
              <div className="alert alert-info d-flex align-items-center">
                <i className="fa fa-info-circle me-2 fs-4"></i>
                <div>
                  <strong>{getActiveCouponsCount()}</strong> active coupon{getActiveCouponsCount() !== 1 ? 's' : ''} available. 
                  Click <strong>Copy</strong> to use at checkout!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="row mb-4 g-3">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fa fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Coupons</option>
              <option value="ACTIVE">Active Only</option>
              <option value="EXPIRED">Expired Only</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {filteredCoupons.length === 0 && !loading && (
          <div className="alert alert-info text-center p-4">
            <i className="fa fa-tag fa-3x mb-3 text-muted"></i>
            <p className="lead mb-0">
              {coupons.length === 0 
                ? "No active coupons available right now." 
                : "No coupons match your search criteria."}
            </p>
            {coupons.length === 0 && (
              <p className="mt-2">Check back soon for new discounts!</p>
            )}
          </div>
        )}

        {/* Coupons Grid */}
        {filteredCoupons.length > 0 && (
          <div className="row g-4 mb-5">
            {filteredCoupons.map(coupon => (
              <div key={coupon.id} className="col-lg-6">
                <CouponCard coupon={coupon} />
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-4 mb-5">
          <Link to="/customer/profile" className="btn btn-secondary">
            <i className="fa fa-arrow-left me-2"></i> Back to Profile
          </Link>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Coupons;