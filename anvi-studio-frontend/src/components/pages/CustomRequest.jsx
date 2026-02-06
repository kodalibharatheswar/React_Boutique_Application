import React from 'react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const CustomRequest = () => {
  return (
    <>
      <Navbar />
      
      {/* MAIN CONTENT: CUSTOMIZATION SECTION */}
      <div className="main-content container">
        <div className="row justify-content-center">
          <div className="col-lg-10">

            <h1 className="hero-title display-5 mb-4 text-center">
              Your Dream Design Starts Here
            </h1>

            <div className="customization-section text-center">
              <i 
                className="fas fa-magic fa-4x text-primary mb-4" 
                style={{ color: 'var(--brand)' }}
              ></i>

              <h4 className="mb-3">Personalized Outfit Customization by Anvi Studio</h4>

              <p className="lead text-muted">Hello beautiful,</p>

              <p className="px-md-5 mx-md-5">
                We know you love our designs so dearly! If you have <strong>new designs</strong> in 
                mind that aren't on our website, or if you're struggling to decide on a color or 
                fabric that will look best on you, we are here to help. Whether you need a suggestion 
                for your <strong>big day outfit</strong> or a perfect ensemble for an event, we 
                welcome your request.
              </p>

              <p className="fw-bold mt-4">
                Get in touch with us directly on our social platforms or email us:
              </p>

              <div className="d-flex justify-content-center gap-4 mt-3">
                <a 
                  href="https://www.instagram.com/avnistudio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link" 
                  title="Instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a 
                  href="https://www.facebook.com/bharatheswar.kodali/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link" 
                  title="Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a 
                  href="mailto:avnistudio@gmail.com" 
                  className="social-link" 
                  title="Email"
                >
                  <i className="fas fa-envelope"></i>
                </a>
              </div>

              <p className="mt-4 small text-muted">
                We would love to see your dream dress take shape! 😊
              </p>
              <p className="mt-2 small text-danger fw-bold">
                For faster communication, please include design inspiration photos and your 
                contact number in your email.
              </p>

            </div>
          </div>
        </div>
      </div>
      {/* END MAIN CONTENT */}
      
      <Footer />
    </>
  );
};

export default CustomRequest;