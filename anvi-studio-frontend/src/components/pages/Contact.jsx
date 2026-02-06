import React, { useState } from 'react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import axiosInstance from '../../utils/axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    message: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await axiosInstance.post('/public/contact', formData);
      
      if (response.data.success) {
        setSuccessMessage('Thank you for contacting us! We will get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phoneNumber: '',
          message: ''
        });
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 
        'Failed to send message. Please try again or contact us directly via email or WhatsApp.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      {/* Main Content Wrapper */}
      <div className="main-content">
        <section className="py-5">
          <div className="container">
            <h1 className="hero-title display-5 mb-4 text-center">Get In Touch</h1>

            {/* Flash Messages */}
            {successMessage && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <span>{successMessage}</span>
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
                <span>{errorMessage}</span>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setErrorMessage('')}
                  aria-label="Close"
                ></button>
              </div>
            )}

            <div className="row g-4 mt-4">
              {/* Contact Form */}
              <div className="col-lg-7">
                <div className="card contact-card shadow p-4 h-100">
                  <h4 className="mb-4">Send Us a Message</h4>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Your Name</label>
                      <input 
                        type="text" 
                        name="name"
                        className="form-control" 
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required 
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        className="form-control" 
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required 
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phoneNumber" className="form-label">Phone Number (Optional)</label>
                      <input 
                        type="tel" 
                        name="phoneNumber"
                        className="form-control" 
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="message" className="form-label">Message/Query</label>
                      <textarea 
                        name="message"
                        className="form-control" 
                        id="message" 
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-brand w-100 mt-3"
                      disabled={loading}
                    >
                      <i className="fa fa-paper-plane me-2"></i> 
                      {loading ? 'Sending...' : 'Submit Message'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Contact Info */}
              <div className="col-lg-5">
                <div className="contact-info-block h-100 shadow-sm">
                  <h4 className="mb-4">Contact Information</h4>
                  <p className="mb-4">
                    We are available during business hours to assist you with any questions 
                    about orders, products, or customization requests.
                  </p>

                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-map-marker-alt fa-lg me-3"></i>
                    <div>
                      <p className="mb-0 fw-bold">Studio Address:</p>
                      <p className="mb-0 small">
                        Plot No : 68, Cross 2, 1st Floor, Municipal Employees Colony, 
                        Siddartha Nagar, Vijayawada - 520010
                      </p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-envelope fa-lg me-3"></i>
                    <div>
                      <p className="mb-0 fw-bold">Email:</p>
                      <a 
                        href="mailto:avnistudio@gmail.com" 
                        className="text-white text-decoration-none"
                      >
                        avnistudio@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <i className="fab fa-whatsapp fa-lg me-3"></i>
                    <div>
                      <p className="mb-0 fw-bold">WhatsApp:</p>
                      <a 
                        href="https://wa.me/919490334557" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white text-decoration-none"
                      >
                        +91 9490334557
                      </a>
                    </div>
                  </div>

                  {/* Google Maps Embed */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3824.2388373303657!2d80.6482618!3d16.5126839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4a06d0b3074099%3A0x69666061327137f8!2sVijayawada%2C%20Andhra%20Pradesh%2C%20India!5e0!3m2!1sen!2sin!v1626262626262!5m2!1sen!2sin"
                    width="100%"
                    height="180"
                    style={{ border: 0, marginTop: '20px', borderRadius: '8px' }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Anvi Studio Location"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
};

export default Contact;