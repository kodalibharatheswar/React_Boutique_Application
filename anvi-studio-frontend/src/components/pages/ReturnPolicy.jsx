import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const ReturnPolicy = () => {
  return (
    <>
      <Navbar />
      
      <div className="main-content container">
        <h1>Anvi Studio Return Policy</h1>

        <section className="policy-section">
          <h2>1. Eligibility for Returns & Exchanges</h2>
          <p>
            We accept returns or exchanges only if the product received is damaged, defective, 
            or incorrect (wrong size/color delivered).
          </p>
          <p>
            <strong>Time Frame:</strong> You must notify us of any issues within <strong>7 days</strong> of delivery.
          </p>
          <p className="text-danger">
            Customized, altered, or stitched items are <strong>not eligible</strong> for return 
            or exchange unless defective.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Condition of Item</h2>
          <p>
            The item must be unused, unwashed, unworn, and returned with all original tags, 
            packaging, and accessories intact. Items returned without original tags will not be accepted.
          </p>
        </section>

        <section className="policy-section">
          <h2>3. Process</h2>
          <ol>
            <li>
              Contact our customer service team at{' '}
              <a href="mailto:avnistudio@gmail.com">avnistudio@gmail.com</a> within 7 days, 
              providing your Order ID and photographic evidence of the defect/damage.
            </li>
            <li>
              Once approved, we will arrange for reverse pick-up within 3-5 business days.
            </li>
            <li>
              After inspection, we will process the refund or ship the exchange item. 
              Refunds typically take 5-10 business days.
            </li>
          </ol>
        </section>

        <Link to="/" className="btn btn-secondary">
          <i className="fa fa-arrow-left me-2"></i> Back to Homepage
        </Link>
      </div>
      
      <Footer />
    </>
  );
};

export default ReturnPolicy;