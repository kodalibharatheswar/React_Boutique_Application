import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import Footer from '../../common/Footer';
import AddressForm from './AddressForm';
import addressService from '../../../services/addressService';

const Addresses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're in checkout flow (coming from cart)
  const isCheckoutFlow = location.state?.fromCart || false;
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Selected address for checkout
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAddresses();
      
      if (data.success) {
        setAddresses(data.addresses || []);
        
        // Auto-select default address if in checkout flow
        if (isCheckoutFlow) {
          const defaultAddress = data.addresses?.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          }
        }
      } else {
        setErrorMessage('Failed to load addresses.');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setErrorMessage('Failed to load addresses. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAddress(null);
  };

  const handleSaveAddress = async (addressData) => {
    try {
      setSaving(true);
      const response = await addressService.saveAddress(addressData);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Address saved successfully!');
        setShowModal(false);
        setEditingAddress(null);
        fetchAddresses(); // Refresh addresses
        window.scrollTo(0, 0);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save address.');
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    try {
      const response = await addressService.deleteAddress(addressId);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Address deleted successfully!');
        fetchAddresses(); // Refresh addresses
        window.scrollTo(0, 0);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete address.');
      window.scrollTo(0, 0);
    }
  };

  const handleContinueToPayment = () => {
    if (!selectedAddressId) {
      alert('Please select a delivery address before proceeding to payment.');
      return;
    }
    
    // Navigate to payment page with selected address
    navigate('/payment/modes', { 
      state: { addressId: selectedAddressId }
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="main-content container mt-5">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading addresses...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="main-content container mt-5">
        <h1 className="hero-title display-5 mb-4">
          <i className="fa fa-map-marker-alt me-2"></i> 
          {isCheckoutFlow ? 'Select Delivery Address' : 'Saved Addresses'}
        </h1>

        {/* Breadcrumb for checkout flow */}
        {isCheckoutFlow && (
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/cart">Cart</Link>
              </li>
              <li className="breadcrumb-item active">Address</li>
              <li className="breadcrumb-item text-muted">Payment</li>
            </ol>
          </nav>
        )}
        
        <hr />

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {successMessage}
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
            {errorMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setErrorMessage('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 text-muted small">
            {isCheckoutFlow 
              ? 'Choose one address below to proceed to payment.' 
              : 'Manage your saved delivery addresses.'}
          </h5>
          <button 
            type="button" 
            className="btn btn-brand btn-sm"
            onClick={handleAddAddress}
          >
            <i className="fa fa-plus me-2"></i> Add New Address
          </button>
        </div>

        {/* Empty State */}
        {addresses.length === 0 && (
          <div className="alert alert-info text-center p-4">
            <p className="lead mb-0">No delivery addresses saved yet.</p>
            <p className="mt-2">Add your first address for faster checkout!</p>
          </div>
        )}

        {/* Addresses Grid */}
        {addresses.length > 0 && (
          <>
            <div className="row g-4 mb-5">
              {addresses.map(address => (
                <div key={address.id} className="col-lg-6">
                  <label className="w-100 d-block">
                    {/* Radio button for checkout flow */}
                    {isCheckoutFlow && (
                      <input
                        type="radio"
                        name="addressId"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="form-check-input visually-hidden address-radio"
                      />
                    )}

                    {/* Address Card */}
                    <div 
                      className={`card address-card shadow-sm p-4 h-100 ${
                        isCheckoutFlow && selectedAddressId === address.id ? 'selected' : ''
                      }`}
                      onClick={() => {
                        if (isCheckoutFlow) {
                          setSelectedAddressId(address.id);
                        }
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="mb-1 fw-bold">{address.name}</h5>
                        {address.isDefault && (
                          <span className="badge default-badge">Default</span>
                        )}
                      </div>
                      <hr className="mt-2 mb-3" />
                      
                      <p className="mb-1">
                        <strong>Recipient:</strong> {address.recipientName}
                      </p>
                      <p className="mb-1">
                        <strong>Phone:</strong> {address.phoneNumber}
                      </p>
                      <p className="mb-1 text-muted small">{address.streetAddress}</p>
                      {address.landmark && (
                        <p className="mb-1 text-muted small">{address.landmark}</p>
                      )}
                      <p className="mb-3 text-muted small">
                        {address.city}, {address.state} - {address.pincode}
                      </p>

                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
                          }}
                        >
                          <i className="fa fa-edit me-1"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(address.id);
                          }}
                        >
                          <i className="fa fa-trash me-1"></i> Delete
                        </button>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {/* Continue to Payment Button - Only in checkout flow */}
            {isCheckoutFlow && (
              <div className="col-12 text-center mt-5 mb-5">
                <button 
                  type="button" 
                  className="btn btn-brand btn-lg"
                  onClick={handleContinueToPayment}
                >
                  <i className="fa fa-angle-right me-2"></i> Continue to Payment
                </button>
              </div>
            )}
          </>
        )}

        {/* Back Button - Only when NOT in checkout flow */}
        {!isCheckoutFlow && (
          <div className="mt-4 mb-5">
            <Link to="/customer/profile" className="btn btn-secondary">
              <i className="fa fa-arrow-left me-2"></i> Back to Profile
            </Link>
          </div>
        )}
      </div>

      {/* Address Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <AddressForm
                address={editingAddress}
                onSave={handleSaveAddress}
                onClose={handleCloseModal}
                saving={saving}
              />
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default Addresses;