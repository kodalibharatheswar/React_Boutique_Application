import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import customerService from '../../services/customerService';

const VerifyNewEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get newEmail from URL query parameters
    const emailParam = searchParams.get('newEmail');
    
    if (!emailParam || emailParam.trim() === '') {
      setError('Error: Please provide the new email address to start verification.');
      return;
    }
    
    setNewEmail(emailParam);
  }, [searchParams]);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 6 digits
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setEmailChangeError('Please enter a valid 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      setEmailChangeError('');
      
      const response = await customerService.finalizeEmailChange(newEmail, otp);
      
      if (response.success) {
        // Show success message briefly before redirecting
        alert(response.message || 'Email changed successfully! Please log in with your new email.');
        
        // Redirect to logout
        if (response.requiresLogout) {
          window.location.href = '/logout';
        } else {
          navigate('/customer/profile');
        }
      }
    } catch (err) {
      setEmailChangeError(
        err.response?.data?.message || 
        'Invalid or expired verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-email-container">
      <div className="otp-card">
        <i className="fas fa-lock icon-email"></i>
        <h1 className="h4 mb-3 fw-bold">Verify Your New Email Address</h1>

        <p className="text-muted mb-4">
          A verification code (OTP) has been sent to your new email:{' '}
          <strong>{newEmail || 'new.email@example.com'}</strong>.
          Enter the code below to complete the change.
        </p>

        {/* Display error messages */}
        {emailChangeError && (
          <div className="alert alert-danger" role="alert">
            {emailChangeError}
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!error && (
          <form onSubmit={handleSubmit}>
            {/* Hidden field for new email */}
            <input type="hidden" name="newEmail" value={newEmail} />

            <div className="mb-4">
              <label htmlFor="otp" className="form-label visually-hidden">
                Enter OTP
              </label>
              <input
                type="text"
                name="otp"
                id="otp"
                className="form-control otp-input"
                maxLength="6"
                value={otp}
                onChange={handleOtpChange}
                placeholder="------"
                required
                autoFocus
                autoComplete="off"
              />
              <div className="form-text text-muted">Code expires in 5 minutes.</div>
            </div>

            <button 
              type="submit" 
              className="btn btn-brand w-100 mt-2"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Verifying...
                </>
              ) : (
                <>
                  <i className="fa fa-check-circle me-2"></i> Confirm Email Change
                </>
              )}
            </button>
          </form>
        )}

        <Link 
          to="/customer/profile" 
          className="d-block mt-4 text-secondary small text-decoration-none"
        >
          Cancel and Return to Profile
        </Link>
      </div>
    </div>
  );
};

export default VerifyNewEmail;