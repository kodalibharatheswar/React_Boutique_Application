import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      
      <div className="main-content container">
        <h1>Anvi Studio Privacy Policy</h1>

        <section className="policy-section">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as your name, email address, 
            phone number, shipping address, and payment information when you place an order or 
            register an account.
          </p>
          <p>
            <strong>Usage Data:</strong> We automatically collect data about your device and how 
            you interact with our site, including IP address, browser type, and pages visited.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li>To process your orders and manage payment transactions.</li>
            <li>To provide personalized customer support and manage your account.</li>
            <li>To send promotional emails (if you opt-in to the newsletter/offers).</li>
            <li>To improve our website functionality and product offerings.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Data Security & Storage</h2>
          <p>
            We implement various security measures to maintain the safety of your personal data. 
            Your passwords are encrypted (hashed) and not stored in plaintext.
          </p>
          <p>
            We do not sell, trade, or rent your personally identifiable information to third parties.
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

export default PrivacyPolicy;