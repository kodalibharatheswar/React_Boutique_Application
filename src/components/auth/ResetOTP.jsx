import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const ResetOTP = () => {
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
      navigate('/forgot-password');
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
      const response = await authService.verifyResetOTP(email, otp);
      
      if (response.success) {
        navigate('/reset-password', {
          state: { email }
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
        <i className="fas fa-key icon-large icon-brand"></i>
        <h4 className="mb-3 fw-bold">OTP Validation</h4>

        <p className="text-muted small mb-4">
          A reset OTP was sent to <strong>{email}</strong>. Enter it below to proceed.
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
            className="btn btn-brand mt-3"
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Validating...
              </>
            ) : (
              <>
                <i className="fas fa-check-circle me-2"></i>
                Validate OTP
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetOTP;