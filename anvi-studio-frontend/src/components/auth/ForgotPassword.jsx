import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.forgotPassword(identifier);
      
      if (response.success) {
        navigate('/reset-otp', {
          state: {
            email: response.email,
            message: response.message
          }
        });
      }
    } catch (err) {
      setError(err.message || 'Could not find an account matching that identifier.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h3 className="text-center mb-4">
          <i className="fas fa-lock me-2"></i>
          Forgot Password
        </h3>

        <p className="text-muted small text-center mb-4">
          Enter your registered email or phone number below. We will send an OTP to your email address to confirm your identity.
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="identifier" className="form-label">
              Email or Phone Number
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              className="form-control"
              placeholder="Email or Phone Number (+91...)"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError('');
              }}
              required
            />
            <div className="form-text text-muted">
              Must be your registered account identifier.
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-brand mt-3"
            disabled={loading || !identifier.trim()}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending OTP...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i>
                Send OTP
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

export default ForgotPassword;