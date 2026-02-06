import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axiosInstance.post('/public/newsletter/subscribe', { email });
      
      if (response.data.success) {
        setMessage('Thank you for subscribing to our newsletter!');
        setMessageType('success');
        setEmail('');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to subscribe. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="py-5" style={{ backgroundColor: 'var(--dark)', color: '#fff', fontSize: '0.95rem' }} id="footer">
      <div className="container">
        <div className="row g-4">
          {/* Column 1: Brand Info & Newsletter */}
          <div className="col-lg-3 col-md-6 mb-3">
            <h5 className="fw-bold mb-2 d-flex align-items-center">
              <img 
                src="/images/Chaknik_Logo.png" 
                alt="Anvi Studio Logo" 
                style={{ height: '75px', marginRight: '4px' }} 
              />
              Anvi Studio
            </h5>
            <p className="small text-white-50">
              Handpicked ethnic wear for every occasion.
            </p>

            {/* Newsletter Subscription */}
            <h6 className="fw-bold mt-4 mb-3">Newsletter</h6>
            <p className="small text-white-50">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>

            {message && (
              <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} alert-sm mb-2`}>
                {message}
              </div>
            )}

            <form onSubmit={handleNewsletterSubmit} className="d-flex flex-column">
              <input 
                type="email" 
                name="email" 
                placeholder="Your Email ID" 
                className="form-control form-control-sm mb-2" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <button 
                type="submit" 
                className="btn btn-sm btn-outline-light"
                disabled={loading}
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>

          {/* Column 2: Useful Links */}
          <div className="col-lg-2 col-md-6 mb-3">
            <h6 className="fw-bold mb-3">Useful Links</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-white text-decoration-none py-1 d-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-white text-decoration-none py-1 d-block">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?status=onSale" className="text-white text-decoration-none py-1 d-block">
                  Offers
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white text-decoration-none py-1 d-block">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white text-decoration-none py-1 d-block">
                  Contact
                </Link>
              </li>
              <li>
                <a 
                  href="/images/sizechart.jpg" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white text-decoration-none py-1 d-block"
                >
                  Measurement Guide
                </a>
              </li>
              <li>
                <Link 
                  to="/custom-request" 
                  className="text-white text-decoration-none py-1 d-block fw-bold"
                >
                  Customization Request
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: My Account & Policies */}
          <div className="col-lg-2 col-md-6 mb-3">
            <h6 className="fw-bold mb-3">My Account</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/login" className="text-white text-decoration-none py-1 d-block">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/customer/profile" className="text-white text-decoration-none py-1 d-block">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/customer/orders" className="text-white text-decoration-none py-1 d-block">
                  Purchase History
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-white text-decoration-none py-1 d-block">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/customer/orders" className="text-white text-decoration-none py-1 d-block">
                  Track Order
                </Link>
              </li>
            </ul>

            <h6 className="fw-bold mt-4 mb-3">Policies</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/policy/return" className="text-white text-decoration-none py-1 d-block">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link to="/policy/privacy" className="text-white text-decoration-none py-1 d-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policy/terms" className="text-white text-decoration-none py-1 d-block">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/policy/shipping" className="text-white text-decoration-none py-1 d-block">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us & Social Media */}
          <div className="col-lg-5 col-md-6 mb-3">
            <h6 className="fw-bold mb-3">Contact Us</h6>
            <p className="small text-white-50 mb-2">
              <i className="fas fa-map-marker-alt me-2"></i> Location: Vijayawada, India
            </p>
            <p className="small text-white-50 mb-2">
              <i className="fas fa-envelope me-2"></i> Email:{' '}
              <a href="mailto:avnistudio@gmail.com" className="text-white text-decoration-none">
                avnistudio@gmail.com
              </a>
            </p>
            <p className="small text-white-50 mb-4">
              <i className="fas fa-phone me-2"></i> Phone Number: +91 9490334557
            </p>

            <h6 className="fw-bold mt-4 mb-3">Follow Us</h6>
            <div className="d-flex fs-4">
              <a 
                href="https://www.facebook.com/bharatheswar.kodali/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white me-3"
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a 
                href="https://www.instagram.com/avnistudio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white me-3"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href="https://wa.me/919490334557" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;