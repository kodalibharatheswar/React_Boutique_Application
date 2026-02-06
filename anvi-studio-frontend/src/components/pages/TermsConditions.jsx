import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const TermsConditions = () => {
  return (
    <>
      <Navbar />
      
      <div className="main-content container">
        <h1>Anvi Studio Terms & Conditions</h1>

        <section className="policy-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Anvi Studio website (the "Service"), you agree to be bound 
            by these Terms and Conditions. If you disagree with any part of the terms, then you 
            may not access the Service.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Products and Services</h2>
          <p>
            All descriptions of products or product pricing are subject to change at anytime 
            without notice. We reserve the right to discontinue any product at any time. We make 
            every effort to display the colors and images of our products as accurately as possible, 
            but we cannot guarantee that your device's display accurately reflects the true color.
          </p>
        </section>

        <section className="policy-section">
          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password 
            and for restricting access to your computer. You agree to accept responsibility for 
            all activities that occur under your account or password.
          </p>
        </section>

        <Link to="/" className="btn btn-secondary">
          <i className="fa fa-arrow-left me-2"></i> Back to Homepage
        </Link>
      </div>
      
      <Footer />
    </>
  );
};

export default TermsConditions;