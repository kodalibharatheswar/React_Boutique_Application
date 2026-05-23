import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import Footer from '../../common/Footer';
import customerService from '../../../services/customerService';

const Profile = () => {
  const navigate = useNavigate();
  
  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    preferredSize: '',
    gender: '',
    dateOfBirth: '',
    newsletterOptIn: false
  });
  
  const [currentEmail, setCurrentEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');
  const [strengthColor, setStrengthColor] = useState('gray');
  
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');

  // Email change modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newEmailError, setNewEmailError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    checkPasswordStrength();
  }, [passwordData.newPassword]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await customerService.getProfile();
      
      if (!data.success) {
        navigate('/login');
        return;
      }

      const customer = data.customer;
      setCurrentEmail(customer.user?.username || '');
      setProfileData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phoneNumber: customer.phoneNumber || '',
        preferredSize: customer.preferredSize || '',
        gender: customer.gender || '',
        dateOfBirth: customer.dateOfBirth || '',
        newsletterOptIn: customer.newsletterOptIn || false
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

  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await customerService.updateProfile({
        ...profileData,
        username: currentEmail
      });
      
      if (response.success) {
        setSuccessMessage(response.message || 'Profile updated successfully!');
        setErrorMessage('');
        window.scrollTo(0, 0);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile.');
      setSuccessMessage('');
      window.scrollTo(0, 0);
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Password strength checker
  const checkPasswordStrength = () => {
    const password = passwordData.newPassword;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    setPasswordStrength(Math.min(strength, 4));

    if (password.length === 0) {
      setStrengthText('Min 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&).');
      setStrengthColor('gray');
    } else if (strength < 5) {
      setStrengthText('Weak. Needs 8+ chars, uppercase, lowercase, number, AND a special character.');
      setStrengthColor('#ffc107');
    } else if (strength === 5) {
      setStrengthText('Strong! Matches policy requirements.');
      setStrengthColor('#4CAF50');
    }
  };

  // Validate password change
  const validatePasswordChange = () => {
    let isValid = true;
    
    setCurrentPasswordError('');
    setNewPasswordError('');
    setPasswordMatchError('');

    if (!passwordData.currentPassword) {
      setCurrentPasswordError('Current password is required.');
      isValid = false;
    }

    const PASSWORD_POLICY_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!PASSWORD_POLICY_PATTERN.test(passwordData.newPassword)) {
      setNewPasswordError('Error: Password must meet complexity requirements.');
      isValid = false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMatchError('Error: New passwords do not match.');
      isValid = false;
    }

    if (passwordData.currentPassword === passwordData.newPassword && passwordData.newPassword.length > 0) {
      setNewPasswordError('Error: New password cannot be the same as current password.');
      isValid = false;
    }

    return isValid;
  };

  // Handle password submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordChange()) {
      return;
    }

    try {
      const response = await customerService.changePassword(passwordData);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Password changed successfully!');
        setPasswordError('');
        
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Redirect to logout if required
        if (response.requiresLogout) {
          setTimeout(() => {
            window.location.href = '/logout';
          }, 2000);
        }
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
      window.scrollTo(0, 0);
    }
  };

  // Email change functions
  const validateNewEmail = () => {
    setNewEmailError('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!newEmail) {
      setNewEmailError('New email address is required.');
      return false;
    }
    
    if (!emailRegex.test(newEmail)) {
      setNewEmailError('Please enter a valid email address.');
      return false;
    }
    
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setNewEmailError('The new email must be different from your current email.');
      return false;
    }
    
    return true;
  };

  const handleEmailChangeSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateNewEmail()) {
      return;
    }

    try {
      const response = await customerService.initiateEmailChange(newEmail);
      
      if (response.success) {
        // Navigate to email verification page
        navigate(`/customer/profile/verify-new-email?newEmail=${encodeURIComponent(newEmail)}`);
      }
    } catch (err) {
      setEmailChangeError(err.response?.data?.message || 'Failed to initiate email change.');
      setShowEmailModal(false);
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
        <h1 className="hero-title display-5 mb-4">
          Welcome, {profileData.firstName || 'Customer'}
        </h1>
        <h2 className="h4 text-muted mb-4">Manage Your Account Profile</h2>
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
        
        {emailChangeError && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {emailChangeError}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setEmailChangeError('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="row g-4 mb-5">
          
          {/* Column 1: Personal Details Update */}
          <div className="col-lg-7">
            <div className="card profile-card shadow-sm p-4">
              <h5 className="card-title mb-4">
                <i className="fa fa-user-edit me-2"></i> Personal Details
              </h5>
              
              <form onSubmit={handleProfileSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      className="form-control" 
                      id="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      className="form-control" 
                      id="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="username" className="form-label">Login Email (Username)</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="username"
                      value={currentEmail}
                      disabled
                    />
                    <div className="form-text text-danger small">
                      Email cannot be changed here. Use the 'Change Email' button.
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phoneNumber"
                      className="form-control" 
                      id="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <label htmlFor="preferredSize" className="form-label">Preferred Size</label>
                    <select 
                      name="preferredSize"
                      className="form-select" 
                      id="preferredSize"
                      value={profileData.preferredSize}
                      onChange={handleProfileChange}
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
                      className="form-select" 
                      id="gender"
                      value={profileData.gender}
                      onChange={handleProfileChange}
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
                      className="form-control" 
                      id="dateOfBirth"
                      value={profileData.dateOfBirth}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="col-12 mt-3">
                    <div className="form-check">
                      <input 
                        type="checkbox" 
                        name="newsletterOptIn"
                        className="form-check-input" 
                        id="newsletterOptIn"
                        checked={profileData.newsletterOptIn}
                        onChange={handleProfileChange}
                      />
                      <label className="form-check-label" htmlFor="newsletterOptIn">
                        Sign up for the Anvi Studio newsletter (exclusive offers).
                      </label>
                    </div>
                  </div>
                  
                  <div className="col-12 mt-4">
                    <button type="submit" className="btn btn-brand w-100">
                      <i className="fa fa-save me-2"></i> Save Details
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Column 2: Security & Actions */}
          <div className="col-lg-5">
            
            {/* Change Password Card */}
            <div className="card profile-card shadow-sm p-4 mb-4">
              <h5 className="card-title mb-4">
                <i className="fa fa-lock me-2"></i> Change Password
              </h5>
              
              {passwordError && (
                <div className="alert alert-danger" role="alert">
                  {passwordError}
                </div>
              )}
              
              <form onSubmit={handlePasswordSubmit}>
                {/* Current Password */}
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <div className="input-group">
                    <input 
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      className="form-control" 
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <span 
                      className="input-group-text password-toggle-btn"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <i className={`fa ${showCurrentPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                    </span>
                  </div>
                  {currentPasswordError && (
                    <div className="text-error">{currentPasswordError}</div>
                  )}
                </div>

                {/* New Password */}
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <div className="input-group">
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      className="form-control" 
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <span 
                      className="input-group-text password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <i className={`fa ${showNewPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                    </span>
                  </div>
                  
                  {/* Password Strength Meter */}
                  <div className="mt-2">
                    <div 
                      className={`password-strength-bar strength-${passwordStrength}`}
                    ></div>
                    <small 
                      className="form-text" 
                      style={{ color: strengthColor }}
                    >
                      {strengthText}
                    </small>
                  </div>
                  
                  {newPasswordError && (
                    <div className="text-error">{newPasswordError}</div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <div className="input-group">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      className="form-control" 
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <span 
                      className="input-group-text password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`fa ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                    </span>
                  </div>
                  {passwordMatchError && (
                    <div className="text-error">{passwordMatchError}</div>
                  )}
                </div>

                <button type="submit" className="btn btn-brand w-100">
                  <i className="fa fa-key me-2"></i> Update Password
                </button>
              </form>
            </div>

            {/* Change Email Card */}
            <div className="card profile-card shadow-sm p-4">
              <h5 className="card-title mb-3">
                <i className="fa fa-envelope me-2"></i> Change Email Address
              </h5>
              <p className="text-muted small">
                Current Email: <strong>{currentEmail}</strong>
              </p>
              <button 
                className="btn btn-outline-brand w-100"
                onClick={() => setShowEmailModal(true)}
              >
                <i className="fa fa-edit me-2"></i> Request Email Change
              </button>
            </div>
          </div>
        </div>

        {/* Back to Shopping Button */}
        <Link to="/" className="btn btn-secondary mb-5">
          <i className="fa fa-arrow-left me-2"></i> Back to Shopping
        </Link>
      </div>

      {/* Change Email Modal */}
      {showEmailModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Email Address</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowEmailModal(false);
                    setNewEmail('');
                    setNewEmailError('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEmailChangeSubmit}>
                  <div className="mb-3">
                    <label htmlFor="newEmail" className="form-label">New Email Address</label>
                    <input 
                      type="email"
                      className="form-control"
                      id="newEmail"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                    {newEmailError && (
                      <div className="text-error">{newEmailError}</div>
                    )}
                  </div>
                  <p className="text-muted small">
                    A verification code will be sent to this email address. You must verify it to complete the change.
                  </p>
                  <button type="submit" className="btn btn-brand w-100">
                    Send Verification Code
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default Profile;