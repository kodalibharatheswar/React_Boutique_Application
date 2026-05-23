import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const ShippingPolicy = () => {
  return (
    <>
      <Navbar />
      
      <div className="main-content container">
        <h1>Anvi Studio Shipping Policy</h1>

        <section className="policy-section">
          <h2>1. Processing Time</h2>
          <p>
            Order processing time typically takes 1-3 business days. This does not include the 
            time required for customization or stitching of pre-ordered items, which will be 
            communicated separately.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Shipping Rates and Delivery Estimates</h2>
          <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
          <ul>
            <li><strong>Standard Shipping:</strong> 4-7 business days.</li>
            <li><strong>Free Shipping:</strong> Available on all orders over ₹1999 (Code: FREESHIP).</li>
            <li>We currently ship only within India.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Shipment Confirmation and Order Tracking</h2>
          <p>
            You will receive a Shipment Confirmation email containing your tracking number(s) 
            once your order has shipped.
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

export default ShippingPolicy;