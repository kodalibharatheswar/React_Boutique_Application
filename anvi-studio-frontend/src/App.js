import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ConfirmOTP from './components/auth/ConfirmOTP';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetOTP from './components/auth/ResetOTP';
import ResetPassword from './components/auth/ResetPassword';
// import VerifyNewEmail from './components/auth/VerifyNewEmail';

// Import common components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HeroSlider from './components/common/HeroSlider';
import Categories from './components/common/Categories';
import FeaturedProducts from './components/common/FeaturedProducts';
import WhatsAppButton from './components/common/WhatsAppButton';
import PrivateRoute from './components/common/PrivateRoute';

// Import pages
import About from './components/pages/About';
import Contact from './components/pages/Contact';
import CustomRequest from './components/pages/CustomRequest';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import ReturnPolicy from './components/pages/ReturnPolicy';
import TermsConditions from './components/pages/TermsConditions';
import ShippingPolicy from './components/pages/ShippingPolicy';


// Import cart and wishlist components
import Cart from './components/cart/Cart';
import CartUnauth from './components/cart/CartUnauth';
import Wishlist from './components/wishlist/Wishlist';
import WishlistUnauth from './components/wishlist/WishlistUnauth';

// Import customer components
import Profile from './components/customer/profile/Profile';
import ProfileManagement from './components/customer/profile/ProfileManagement';
import VerifyNewEmail from './components/auth/VerifyNewEmail';
import Orders from './components/customer/orders/Orders';
import Addresses from './components/customer/addresses/Addresses';
import Coupons from './components/customer/coupons/Coupons';
import GiftCards from './components/customer/giftcards/GiftCards';
import Dashboard from './components/customer/dashboard/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes - Auth Pages (No Navbar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm-otp" element={<ConfirmOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-otp" element={<ResetOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          
          {/* Protected Routes - Require Authentication */}
          <Route path="/verify-new-email" element={
            <PrivateRoute>
              <VerifyNewEmail />
            </PrivateRoute>
          } />

          {/* Home Page with Navbar, Hero, and Footer */}
          <Route path="/" element={
            <>
              <Navbar />
              <HeroSlider />
              <Categories />
              <FeaturedProducts />
              <Footer />
            </>
          } />


          {/* About Page */}
          <Route path="/about" element={<About />} />

          {/* Contact Page */}
          <Route path="/contact" element={<Contact />} />

          {/* Custom Request Page */}
          <Route path="/custom-request" element={<CustomRequest />} />

          {/* Cart & Wishlist - Authenticated */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Customer Dashboard */}
          <Route path="/customer/dashboard" element={<Dashboard />} />

          {/* Customer Profile */}
          <Route path="/customer/profile" element={<Profile />} />
          <Route path="/customer/profile/manage" element={<ProfileManagement />} />
          <Route path="/customer/profile/verify-new-email" element={<VerifyNewEmail />} />

          {/* Customer Orders */}
          <Route path="/customer/orders" element={<Orders />} />

          {/* Customer Addresses */}
          <Route path="/customer/addresses" element={<Addresses />} />
          
          {/* Customer Coupons */}
          <Route path="/customer/coupons" element={<Coupons />} />

          {/* Customer Gift Cards */}
          <Route path="/customer/gift-cards" element={<GiftCards />} />

          {/* Cart & Wishlist - Unauthenticated */}
          <Route path="/cart-unauth" element={<CartUnauth />} />
          <Route path="/wishlist-unauth" element={<WishlistUnauth />} />

          {/* Policy Pages */}
          <Route path="/policy/privacy" element={<PrivacyPolicy />} />
          <Route path="/policy/return" element={<ReturnPolicy />} />
          <Route path="/policy/terms" element={<TermsConditions />} />
          <Route path="/policy/shipping" element={<ShippingPolicy />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

          

          {/* WhatsApp Button - Shows on all pages */}
        <WhatsAppButton />
      </div>
    </Router>
  );
}

export default App;