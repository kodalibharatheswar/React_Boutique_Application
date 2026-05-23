import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setPasswordMatchError('');
  };

  const validatePassword = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    if (!passwordRegex.test(formData.newPassword)) {
      setError('Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, and one number.');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordMatchError('The new password and confirmation password do not match.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.resetPassword(
        email,
        formData.newPassword,
        formData.confirmPassword
      );
      
      if (response.success) {
        navigate('/login', {
          state: { message: response.message }
        });
      }
    } catch (err) {
      setError(err.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h3 className="text-center mb-4">
          <i className="fas fa-unlock-alt me-2"></i>
          Set New Password
        </h3>

        <p className="text-muted small text-center mb-4">
          You are resetting the password for: <strong>{email}</strong>
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className="form-control"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
            <div className="form-text text-muted">
              Min 8 chars, 1 uppercase, 1 lowercase, 1 number.
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {passwordMatchError && (
              <div className="text-danger small mt-1">
                {passwordMatchError}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-brand mt-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Resetting...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Reset Password
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

export default ResetPassword;