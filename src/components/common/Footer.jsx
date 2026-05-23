import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import authService from '../../services/authService';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authService.checkAuth();
      setIsAuthenticated(response.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axiosInstance.post('/public/newsletter/subscribe', { email });
      
      if (response.data.success) {
        setMessage('Thank you for subscribing!');
        setMessageType('success');
        setEmail('');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to subscribe.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="custom-footer" id="footer">
      {/* Top Section: Payment & Shipping */}
      <div className="footer-top-bar">
        <div className="container">
          <div className="row align-items-center py-4">
            <div className="col-md-7 mb-3 mb-md-0 d-flex align-items-center flex-wrap">
              <span className="footer-heading-small me-4">SECURE PAYMENT OPTIONS</span>
              <div className="payment-icons d-flex gap-3">
                <div className="payment-icon" title="Visa"><i className="fab fa-cc-visa"></i></div>
                <div className="payment-icon" title="Mastercard"><i className="fab fa-cc-mastercard"></i></div>
                <div className="payment-icon" title="PayPal"><i className="fab fa-cc-paypal"></i></div>
                <div className="payment-icon" title="Stripe"><i className="fab fa-cc-stripe"></i></div>
                <div className="payment-icon" title="Apple Pay"><i className="fab fa-cc-apple-pay"></i></div>
                <div className="payment-icon" title="Amazon Pay"><i className="fab fa-cc-amazon-pay"></i></div>
              </div>
            </div>
            <div className="col-md-5 d-flex align-items-center justify-content-md-end flex-wrap">
              <span className="footer-heading-small me-4">SHIPPING PARTNERS</span>
              <div className="shipping-icons d-flex gap-3 align-items-center">
                 <i className="fas fa-shipping-fast fs-3 opacity-50"></i>
                 <span className="small opacity-50 fw-500" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>FAST & SECURE DELIVERY<br/>ACROSS INDIA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main py-5">
        <div className="container">
          {/* Logo & Tagline Section */}
          <div className="row mb-5 align-items-center">
            <div className="col-12 text-center">
              <Link to="/" className="text-decoration-none d-flex align-items-center justify-content-center mb-2">
                <img 
                  src="/images/Chaknik_Logo.png" 
                  alt="Anvi Studio Logo" 
                  style={{ height: '60px', marginRight: '15px' }} 
                />
                <span style={{ fontFamily: 'Playfair Display', fontSize: '2rem', fontWeight: '500', color: '#fff', letterSpacing: '2px' }}>ANVI STUDIO</span>
              </Link>
              <p className="footer-text" style={{ fontStyle: 'italic', letterSpacing: '1px' }}>Handpicked ethnic wear for every occasion.</p>
            </div>
          </div>

          <div className="row g-4">
            {/* Col 1: Quick Links */}
            <div className="col-lg-2 col-md-6">
              <h6 className="footer-heading">QUICK LINKS</h6>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/products">All Products</Link></li>
                <li><Link to="/products?status=onSale">Offers</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* Col 2: Account */}
            <div className="col-lg-2 col-md-6">
              <h6 className="footer-heading">ACCOUNT</h6>
              <ul className="footer-links">
                {!isAuthenticated ? (
                  <>
                    <li><Link to="/login">Login / Register</Link></li>
                    <li><Link to="/login">My Account</Link></li>
                    <li><Link to="/login">Purchase History</Link></li>
                    <li><Link to="/wishlist-unauth">My Wishlist</Link></li>
                    <li><Link to="/cart-unauth">My Cart</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/customer/profile">My Account</Link></li>
                    <li><Link to="/customer/orders">Purchase History</Link></li>
                    <li><Link to="/wishlist">My Wishlist</Link></li>
                    <li><Link to="/cart">My Cart</Link></li>
                  </>
                )}
              </ul>
            </div>

            {/* Col 3: Help & Info */}
            <div className="col-lg-3 col-md-6">
              <h6 className="footer-heading">HELP & INFORMATION</h6>
              <ul className="footer-links">
                <li><Link to="/policy/shipping">Shipping Policy</Link></li>
                <li><Link to="/policy/return">Return & Exchange</Link></li>
                <li><Link to="/policy/privacy">Privacy Policy</Link></li>
                <li><Link to="/policy/terms">Terms & Conditions</Link></li>
                <li><a href="/images/sizechart.jpg" target="_blank" rel="noopener noreferrer">Measurement Guide</a></li>
                <li><Link to="/custom-request">Customization Request</Link></li>
              </ul>
            </div>

            {/* Col 4: Contact Us & Social Media */}
            <div className="col-lg-2 col-md-6">
              <h6 className="footer-heading">CONTACT US</h6>
              <div className="footer-text mb-3" style={{ fontSize: '0.85rem' }}>
                <p className="mb-1"><i className="fas fa-map-marker-alt me-2 text-white-50"></i> Vijayawada, India</p>
                <p className="mb-1">
                  <i className="fas fa-envelope me-2 text-white-50"></i> 
                  <a href="mailto:avnistudio@gmail.com" className="text-white-50 text-decoration-none hover-brand">avnistudio@gmail.com</a>
                </p>
                <p className="mb-0"><i className="fas fa-phone me-2 text-white-50"></i> +91 9490334557</p>
              </div>

              <h6 className="footer-heading mt-4">SOCIAL MEDIA</h6>
              <div className="footer-socials d-flex gap-3">
                <a href="https://www.facebook.com/bharatheswar.kodali/" target="_blank" rel="noopener noreferrer" title="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="https://www.instagram.com/avnistudio" target="_blank" rel="noopener noreferrer" title="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="https://wa.me/919490334557" target="_blank" rel="noopener noreferrer" title="WhatsApp"><i className="fab fa-whatsapp"></i></a>
                <a href="#!" target="_blank" rel="noopener noreferrer" title="Pinterest"><i className="fab fa-pinterest-p"></i></a>
              </div>
            </div>

            {/* Col 5: Sign Up */}
            <div className="col-lg-3 col-md-6">
              <h6 className="footer-heading">SIGN UP</h6>
              <p className="footer-text mb-4" style={{ fontSize: '0.8rem' }}>
                Subscribe to our newsletter to receive updates on new products and exclusive deals.
              </p>
              
              {message && (
                <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} py-2 px-3 small mb-3 border-0 rounded-0`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleNewsletterSubmit} className="newsletter-form d-flex">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email Address" 
                  className="newsletter-input flex-grow-1" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <button 
                  type="submit" 
                  className="newsletter-btn"
                  disabled={loading}
                >
                  {loading ? '...' : 'SEND'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom py-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
              <span className="footer-text" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>LANGUAGE: ENGLISH</span>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <span className="footer-text" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                &copy; {new Date().getFullYear()} BY ANVI STUDIO. ALL RIGHTS RESERVED. HANDPICKED ETHNIC WEAR FROM INDIA.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
