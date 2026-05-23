import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

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

  const getDisplayName = () => {
    if (!customer) return 'User';
    if (customer.firstName) return customer.firstName;
    const nameFromEmail = customer.email.split('@')[0];
    return nameFromEmail.length > 12 ? nameFromEmail.substring(0, 12) + '...' : nameFromEmail;
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
              alt="Avni Studio Logo" 
              style={{ height: '75px', marginRight: '4px' }} 
            />
            <span className="text-dark ms-2" style={{ fontWeight: '500', letterSpacing: '1px' }}>AVNI STUDIO</span>
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
            {/* Unified Navigation Links */}
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products?sortBy=latest">New Arrivals</Link>
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
                  <li><Link className="dropdown-item" to={`/products?category=${encodeURIComponent('Long Frocks')}`}>Long Frocks</Link></li>
                  <li><Link className="dropdown-item" to={`/products?category=${encodeURIComponent('Lehengas')}`}>Lehengas</Link></li>
                  <li><Link className="dropdown-item" to={`/products?category=${encodeURIComponent('Mom & Me')}`}>Mom & Me</Link></li>
                  <li><Link className="dropdown-item" to={`/products?category=${encodeURIComponent('Crop Top – Skirts')}`}>Crop Top – Skirts</Link></li>
                  <li><Link className="dropdown-item" to={`/products?category=${encodeURIComponent('Handlooms')}`}>Handlooms</Link></li>
                  <li><Link className="dropdown-item" to={`/products?category=${encodeURIComponent('Casual Frocks')}`}>Casual Frocks</Link></li>
                  <li><Link className="dropdown-item" to={`/products?category=${encodeURIComponent('Ready To Wear')}`}>Ready To Wear</Link></li>
                  <li><Link className="dropdown-item" to={`/products?category=${encodeURIComponent('Dupattas')}`}>Dupattas</Link></li>
                  <li><Link className="dropdown-item" to={`/products?category=${encodeURIComponent('Kids wear')}`}>Kids wear</Link></li>
                  <li><Link className="dropdown-item" to={`/products?category=${encodeURIComponent('Dress Material')}`}>Dress Material</Link></li>
                  <li><Link className="dropdown-item" to={`/products?category=${encodeURIComponent('Sarees')}`}>Sarees</Link></li>
                  <li><Link className="dropdown-item" to={`/products?category=${encodeURIComponent('Blouses')}`}>Blouses</Link></li>
                  <li><Link className="dropdown-item" to={`/products?category=${encodeURIComponent('Fabrics')}`}>Fabrics</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item" to="/products">All Products</Link></li>
                </ul>
              </li>

              {/* Elegant Search Bar */}
              <li className="nav-item px-lg-2">
                <form onSubmit={handleSearch} className="nav-search-form">
                  <input 
                    type="search" 
                    name="keyword"
                    className="nav-search-input" 
                    placeholder="Search boutique..." 
                    aria-label="Search" 
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                  <button className="nav-search-btn" type="submit">
                    <i className="fa fa-search"></i>
                  </button>
                </form>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/about">About</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact">CONTACT</Link>
              </li>

              {/* Account Section */}
              {!isAuthenticated ? (
                <li className="nav-item">
                  <Link className="nav-link" to="/login" title="Login">
                    <i className="fa fa-user me-1"></i> LOGIN
                  </Link>
                </li>
              ) : (
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    id="accountDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false" 
                    title="My Account"
                    style={{ fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center' }}
                  >
                    <i className="fa fa-user-circle me-1" style={{ fontSize: '1.1rem' }}></i>
                    <span>{getDisplayName()}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown">
                    {/* Admin Links */}
                    {(customer?.role === 'ROLE_ADMIN' || customer?.role === 'ADMIN') && (
                      <>
                        <li><h6 className="dropdown-header text-danger"><i className="fa fa-user-shield me-1"></i> Admin Portal</h6></li>
                        <li>
                          <Link className="dropdown-item" to="/admin/dashboard">
                            <i className="fa fa-tachometer-alt me-2"></i> Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/profile">
                            <i className="fa fa-cog me-2"></i> Settings
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}

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
                  <Link className="nav-link d-flex align-items-center" to="/wishlist-unauth" title="Wishlist">
                    <i className="fa-regular fa-heart fs-5"></i>
                    <span className="d-lg-none ms-2">Wishlist</span>
                  </Link>
                ) : (
                  <Link className="nav-link d-flex align-items-center" to="/wishlist" title="My Wishlist">
                    <i className="fa-regular fa-heart fs-5"></i>
                    <span className="d-lg-none ms-2">My Wishlist</span>
                  </Link>
                )}
              </li>

              {/* Cart Icon */}
              <li className="nav-item">
                {!isAuthenticated ? (
                  <Link className="nav-link d-flex align-items-center" to="/cart-unauth" title="Cart">
                    <i className="fa fa-shopping-cart fs-5"></i>
                    <span className="d-lg-none ms-2">Cart</span>
                  </Link>
                ) : (
                  <Link className="nav-link d-flex align-items-center" to="/cart" title="My Cart">
                    <i className="fa fa-shopping-cart fs-5"></i>
                    <span className="d-lg-none ms-2">My Cart</span>
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