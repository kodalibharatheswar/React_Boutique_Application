import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const ConfirmOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const stateEmail = location.state?.email;
    const urlParams = new URLSearchParams(location.search);
    const urlEmail = urlParams.get('email');
    
    const userEmail = stateEmail || urlEmail;

    if (!userEmail) {
      navigate('/login');
      return;
    }

    setEmail(userEmail);
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
      const response = await authService.confirmOTP(email, otp);
      
      if (response.success) {
        navigate('/login', {
          state: { message: response.message }
        });
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card text-center">
        <i className="fas fa-envelope-open-text icon-large icon-brand"></i>
        <h4 className="mb-3 fw-bold">Confirm Your Email Address</h4>

        <p className="text-muted mb-4">
          A 6-digit verification code (OTP) has been sent to
          <br />
          <strong>{email}</strong>.
          <br />
          Please enter the code below to activate your account.
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
            className="btn btn-brand"
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Verifying...
              </>
            ) : (
              <>
                <i className="fas fa-check-circle me-2"></i>
                Verify Account
              </>
            )}
          </button>
        </form>

        <Link to="/" className="d-block mt-4 text-secondary small">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default ConfirmOTP;