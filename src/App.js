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
import OAuth2RedirectHandler from './components/auth/OAuth2RedirectHandler';
// import VerifyNewEmail from './components/auth/VerifyNewEmail';

// Import common components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HeroSlider from './components/common/HeroSlider';
import Categories from './components/common/Categories';
import FeaturedProducts from './components/common/FeaturedProducts';
import WhatsAppButton from './components/common/WhatsAppButton';
import LiveShoppingModal from './components/common/LiveShoppingModal';

import PrivateRoute from './components/common/PrivateRoute';

// Import pages
import About from './components/pages/About';
import Contact from './components/pages/Contact';
import CustomRequest from './components/pages/CustomRequest';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import ReturnPolicy from './components/pages/ReturnPolicy';
import TermsConditions from './components/pages/TermsConditions';
import ShippingPolicy from './components/pages/ShippingPolicy';

// Import Product Components
import ProductList from './components/products/ProductList';
import ProductDetail from './components/products/ProductDetail';

// Import Payment Components
import PaymentModes from './components/payment/PaymentModes';
import PaymentSuccess from './components/payment/PaymentSuccess';
import PaymentCancel from './components/payment/PaymentCancel';


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
import OrderTracking from './components/customer/orders/OrderTracking';
import Addresses from './components/customer/addresses/Addresses';
import Coupons from './components/customer/coupons/Coupons';
import GiftCards from './components/customer/giftcards/GiftCards';
import Dashboard from './components/customer/dashboard/Dashboard';

// Import Admin components
import AdminDashboard from './components/admin/Dashboard';
import AdminOrders from './components/admin/Orders';
import AdminProfile from './components/admin/Profile';
import AdminEditProduct from './components/admin/EditProduct';
import AdminContactMessages from './components/admin/ContactMessages';
import AdminReviewModerate from './components/admin/ReviewModerate';
import AdminLiveStudio from './components/admin/LiveStudio';

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
          
          {/* OAuth2 Redirect Handler */}
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          
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

          {/* Product Pages */}
          <Route path="/products" element={
            <>
              <Navbar />
              <ProductList />
              <Footer />
            </>
          } />
          <Route path="/products/:id" element={
            <>
              <Navbar />
              <ProductDetail />
              <Footer />
            </>
          } />

          {/* Cart & Wishlist - Authenticated */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Payment Routes */}
          <Route path="/payment" element={
             <>
               <Navbar />
               <PaymentModes />
               <Footer />
             </>
          } />
          <Route path="/payment-success" element={
             <>
               <Navbar />
               <PaymentSuccess />
               <Footer />
             </>
          } />
          <Route path="/payment-cancel" element={
             <>
               <Navbar />
               <PaymentCancel />
               <Footer />
             </>
          } />

          {/* Customer Dashboard */}
          <Route path="/customer/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          {/* Customer Profile */}
          <Route path="/customer/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/customer/profile/manage" element={
            <PrivateRoute>
              <ProfileManagement />
            </PrivateRoute>
          } />
          <Route path="/customer/profile/verify-new-email" element={
            <PrivateRoute>
              <VerifyNewEmail />
            </PrivateRoute>
          } />

          {/* Customer Orders */}
          <Route path="/customer/orders" element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          } />
          
          {/* Order Tracking */}
          <Route path="/order/track/:id" element={
            <PrivateRoute>
              <OrderTracking />
            </PrivateRoute>
          } />

          {/* Customer Addresses */}
          <Route path="/customer/addresses" element={
            <PrivateRoute>
              <Addresses />
            </PrivateRoute>
          } />
          
          {/* Customer Coupons */}
          <Route path="/customer/coupons" element={
            <PrivateRoute>
              <Coupons />
            </PrivateRoute>
          } />

          {/* Customer Gift Cards */}
          <Route path="/customer/gift-cards" element={
            <PrivateRoute>
              <GiftCards />
            </PrivateRoute>
          } />

          {/* Cart & Wishlist - Unauthenticated */}
          <Route path="/cart-unauth" element={<CartUnauth />} />
          <Route path="/wishlist-unauth" element={<WishlistUnauth />} />

          {/* Policy Pages */}
          <Route path="/policy/privacy" element={<PrivacyPolicy />} />
          <Route path="/policy/return" element={<ReturnPolicy />} />
          <Route path="/policy/terms" element={<TermsConditions />} />
          <Route path="/policy/shipping" element={<ShippingPolicy />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/orders" element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminOrders />
            </PrivateRoute>
          } />
          <Route path="/admin/profile" element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminProfile />
            </PrivateRoute>
          } />
          <Route path="/admin/product/edit/:id" element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminEditProduct />
            </PrivateRoute>
          } />
          <Route path="/admin/contacts" element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminContactMessages />
            </PrivateRoute>
          } />
          <Route path="/admin/reviews/moderate" element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminReviewModerate />
            </PrivateRoute>
          } />
          <Route path="/admin/live-studio" element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminLiveStudio />
            </PrivateRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

          

          {/* WhatsApp Button - Shows on all pages */}
        <WhatsAppButton />
        <LiveShoppingModal />
      </div>
    </Router>
  );
}

export default App;