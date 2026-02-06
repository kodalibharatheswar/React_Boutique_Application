import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const CartUnauth = () => {
  return (
    <>
      <Navbar />
      
      <div className="main-content container">
        <div className="empty-state">
          <h2 className="empty-title">Your cart is empty</h2>

          <Link to="/" className="btn btn-continue">
            CONTINUE SHOPPING
          </Link>

          <p className="mt-5 mb-1">Have an account?</p>
          <p>
            <Link to="/login" className="login-link">Login</Link> to checkout faster.
          </p>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default CartUnauth;