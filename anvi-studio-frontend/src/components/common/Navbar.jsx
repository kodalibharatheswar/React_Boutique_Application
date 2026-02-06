import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authService.checkAuth();
      if (response.authenticated) {
        setIsAuthenticated(true);
        setCustomer(response.user);
      } else {
        setIsAuthenticated(false);
        setCustomer(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setCustomer(null);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setCustomer(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchKeyword)}`);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Offer Bar */}
      <div className="offer-bar text-center">
        <div className="container">
          Free Shipping on Orders Above ₹1999 – Use code{' '}
          <a href="#" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: '600' }}>
            FREESHIP
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar navbar-expand-lg main-nav">
        <div className="container">
          {/* Brand Logo */}
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img 
              src="/images/Chaknik_Logo.png" 
              alt="Anvi Studio Logo" 
              style={{ height: '75px', marginRight: '4px' }} 
            />
            <span className="text-white">Anvi Studio</span>
          </Link>

          {/* Mobile Toggle */}
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={toggleMenu}
            aria-controls="mainNav" 
            aria-expanded={isMenuOpen} 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="mainNav">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="d-flex me-4 my-2 my-lg-0">
              <div className="input-group">
                <input 
                  type="search" 
                  name="keyword"
                  className="form-control form-control-sm" 
                  placeholder="Search products, SKU, color..." 
                  aria-label="Search" 
                  style={{ width: '250px' }}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <button className="btn btn-outline-light btn-sm" type="submit">
                  <i className="fa fa-search"></i>
                </button>
              </div>
            </form>

            {/* Main Navigation Links */}
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products?sort=newest">New Arrivals</Link>
              </li>

              {/* Shop Dropdown */}
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  id="shopDropdown" 
                  role="button" 
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Shop
                </a>
                <ul className="dropdown-menu" aria-labelledby="shopDropdown">
                  <li><Link className="dropdown-item" to="/products?category=Long Frocks">Long Frocks</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=Lehengas">Lehengas</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=Mom & Me">Mom & Me</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=Crop Top – Skirts">Crop Top – Skirts</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=Handlooms">Handlooms</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=Casual Frocks">Casual Frocks</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=Ready To Wear">Ready To Wear</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=Dupattas">Dupattas</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=Kids wear">Kids wear</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=Dress Material">Dress Material</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=Sarees">Sarees</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=Blouses">Blouses</Link></li>
                  <li><Link className="dropdown-item" to="/products?category=Fabrics">Fabrics</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item" to="/products">All Products</Link></li>
                </ul>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/about">About</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact">Contact</Link>
              </li>
            </ul>

            {/* Icon Group - Right Side */}
            <ul className="navbar-nav mb-2 mb-lg-0">
              {/* Account Section */}
              {!isAuthenticated ? (
                <li className="nav-item">
                  <Link className="nav-link" to="/login" title="Login">
                    <i className="fa fa-user"></i> Login
                  </Link>
                </li>
              ) : (
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle text-white" 
                    href="#" 
                    id="accountDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false" 
                    title="My Account"
                  >
                    <i className="fa fa-user-circle me-1"></i>
                    <span>{customer?.firstName || customer?.email || 'User'}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown">
                    <li><h6 className="dropdown-header">Manage Account</h6></li>
                    <li>
                      <Link className="dropdown-item" to="/customer/profile">
                        <i className="fa fa-id-card me-2"></i> My Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/wishlist">
                        <i className="fa-regular fa-heart me-2"></i> My Wishlist
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>

                    <li>
                      <Link className="dropdown-item" to="/customer/orders">
                        <i className="fa fa-receipt me-2"></i> My Orders
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/customer/addresses">
                        <i className="fa fa-map-marker-alt me-2"></i> Addresses
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/customer/coupons">
                        <i className="fa fa-tag me-2"></i> Coupons & Offers
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/customer/gift-cards">
                        <i className="fa fa-gift me-2"></i> Gift Cards
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>

                    <li>
                      <button 
                        onClick={handleLogout}
                        className="dropdown-item text-danger"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: '.25rem 1rem' }}
                      >
                        <i className="fa fa-sign-out-alt me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </li>
              )}

              {/* Wishlist Icon */}
              <li className="nav-item">
                {!isAuthenticated ? (
                  <Link className="nav-link" to="/wishlist-unauth" title="Wishlist">
                    <i className="fa-regular fa-heart"></i>
                  </Link>
                ) : (
                  <Link className="nav-link" to="/wishlist" title="My Wishlist">
                    <i className="fa-regular fa-heart"></i>
                  </Link>
                )}
              </li>

              {/* Cart Icon */}
              <li className="nav-item">
                {!isAuthenticated ? (
                  <Link className="nav-link" to="/cart-unauth" title="Cart">
                    <i className="fa fa-shopping-cart"></i>
                  </Link>
                ) : (
                  <Link className="nav-link" to="/cart" title="My Cart">
                    <i className="fa fa-shopping-cart"></i>
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;