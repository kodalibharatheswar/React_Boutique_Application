import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

const VerifyNewEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    const stateEmail = location.state?.newEmail;
    const urlParams = new URLSearchParams(location.search);
    const urlEmail = urlParams.get('newEmail');
    
    const email = stateEmail || urlEmail;

    if (!email) {
      navigate('/customer/profile');
      return;
    }

    setNewEmail(email);
  }, [location, navigate]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setOtp(value);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('/customer/profile/change-email/finalize', {
        newEmail,
        otp
      });
      
      if (response.data.success) {
        navigate('/customer/profile', {
          state: { message: 'Email changed successfully!' }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card text-center">
        <i className="fas fa-lock icon-large icon-dark"></i>
        <h4 className="mb-3 fw-bold">Verify Your New Email Address</h4>

        <p className="text-muted mb-4">
          A verification code (OTP) has been sent to your new email:
          <br />
          <strong>{newEmail}</strong>.
          <br />
          Enter the code below to complete the change.
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="otp" className="form-label visually-hidden">
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              className="form-control otp-input"
              maxLength="6"
              value={otp}
              onChange={handleOtpChange}
              placeholder="------"
              required
              autoFocus
            />
            <div className="form-text text-muted">Code expires in 5 minutes.</div>
          </div>

          <button 
            type="submit" 
            className="btn btn-brand mt-2"
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Confirming...
              </>
            ) : (
              <>
                <i className="fas fa-check-circle me-2"></i>
                Confirm Email Change
              </>
            )}
          </button>
        </form>

        <Link to="/customer/profile" className="d-block mt-4 text-secondary small">
          Cancel and Return to Profile
        </Link>
      </div>
    </div>
  );
};

export default VerifyNewEmail;