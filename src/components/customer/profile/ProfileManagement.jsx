import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import Footer from '../../common/Footer';
import customerService from '../../../services/customerService';

const ProfileManagement = () => {
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [profileData, setProfileData] = useState({
    username: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    preferredSize: '',
    gender: '',
    dateOfBirth: '',
    newsletterOptIn: false
  });
  
  const [emailVerified, setEmailVerified] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await customerService.getProfile();
      
      if (!data.success) {
        navigate('/login');
        return;
      }

      const customerData = data.customer;
      setCustomer(customerData);
      setEmailVerified(customerData.user?.emailVerified || false);
      
      setProfileData({
        username: customerData.user?.username || '',
        phoneNumber: customerData.phoneNumber || '',
        firstName: customerData.firstName || '',
        lastName: customerData.lastName || '',
        preferredSize: customerData.preferredSize || '',
        gender: customerData.gender || '',
        dateOfBirth: customerData.dateOfBirth || '',
        newsletterOptIn: customerData.newsletterOptIn || false
      });
      
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setErrorMessage('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await customerService.updateProfile(profileData);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Profile updated successfully!');
        setErrorMessage('');
        window.scrollTo(0, 0);
        
        // Refresh profile data
        setTimeout(() => {
          fetchProfile();
        }, 1000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile.');
      setSuccessMessage('');
      window.scrollTo(0, 0);
    }
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
            <p className="mt-3">Loading your profile...</p>
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
        <h1 className="mb-4 display-6 fw-bold">Manage Your Profile</h1>

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

        <div className="card profile-card shadow p-4 mb-5">
          <h4 className="card-title mb-4">Personal & Login Details</h4>

          <form onSubmit={handleSubmit}>
            
            {/* Hidden field for current username */}
            <input type="hidden" name="currentUsername" value={profileData.username} />

            {/* Account Credentials Fieldset */}
            <fieldset className="mb-4 pb-3 border-bottom">
              <legend className="h6 text-primary">Account Credentials</legend>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="username" className="form-label">
                    Email Address (Login ID)
                  </label>
                  <input 
                    type="email" 
                    name="username" 
                    id="username" 
                    className="form-control"
                    value={profileData.username}
                    onChange={handleInputChange}
                    required
                  />
                  {!emailVerified && (
                    <div className="form-text text-danger">
                      <i className="fa fa-exclamation-triangle"></i> 
                      {' '}<strong>WARNING:</strong> Account is unverified. Changing your email requires <strong>re-verification</strong>.
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phoneNumber" 
                    id="phoneNumber" 
                    className="form-control"
                    value={profileData.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <p className="mt-3 mb-0 small">
                <Link to="/forgot-password">Change Password</Link>
              </p>
            </fieldset>

            {/* Personal Information Fieldset */}
            <fieldset className="mb-4">
              <legend className="h6 text-primary">Personal Information</legend>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    id="firstName" 
                    className="form-control"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    id="lastName" 
                    className="form-control"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="preferredSize" className="form-label">Preferred Size</label>
                  <select 
                    name="preferredSize" 
                    id="preferredSize" 
                    className="form-select"
                    value={profileData.preferredSize}
                    onChange={handleInputChange}
                  >
                    <option value="">Select (Optional)</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="gender" className="form-label">Gender</label>
                  <select 
                    name="gender" 
                    id="gender" 
                    className="form-select"
                    value={profileData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select (Optional)</option>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="UNISEX">Unisex</option>
                    <option value="OTHER">Prefer not to say</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    id="dateOfBirth" 
                    className="form-control"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </fieldset>

            {/* Preferences Fieldset */}
            <fieldset className="mb-4">
              <legend className="h6 text-primary">Preferences</legend>
              <div className="form-check">
                <input 
                  type="checkbox" 
                  name="newsletterOptIn" 
                  id="newsletterOptIn" 
                  className="form-check-input"
                  checked={profileData.newsletterOptIn}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="newsletterOptIn">
                  Sign me up for the Anvi Studio newsletter (exclusive offers).
                </label>
              </div>
              <div className="form-text text-muted small mt-2">
                Terms of Service accepted: <i className="fa fa-check text-success"></i> (Cannot be changed)
              </div>
            </fieldset>

            <button type="submit" className="btn btn-brand w-100 mt-3">
              <i className="fa fa-save me-2"></i> Save Profile Updates
            </button>
          </form>
        </div>

        <Link to="/" className="btn btn-secondary mb-5">
          <i className="fa fa-arrow-left me-2"></i> Back to Shopping
        </Link>
      </div>
      
      <Footer />
    </>
  );
};

export default ProfileManagement;