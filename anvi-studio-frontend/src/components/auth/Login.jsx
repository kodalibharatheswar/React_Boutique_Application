import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.username, formData.password);
      
      if (response.success) {
        navigate('/');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      if (err.requiresVerification) {
        navigate('/confirm-otp', { 
          state: { 
            email: err.email,
            message: err.message 
          } 
        });
      } else {
        setError(err.message || 'Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark position-absolute top-0 w-100">
        <div className="container-fluid">
          <Link className="navbar-brand ms-3" to="/">Anvi Studio</Link>
        </div>
      </nav>

      <div className="auth-container">
        <div className="auth-card">
          <h3 className="text-center mb-4">Customer Login</h3>

          {successMessage && (
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Email or Phone Number
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-control"
                placeholder="Email or Phone Number (+91...)"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <div className="form-text">
                Use your registered email (username) or phone number.
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="d-flex justify-content-end mb-3" style={{ marginTop: '-8px' }}>
              <Link to="/forgot-password" className="small text-decoration-none">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="btn btn-brand"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <Link to="/register">New Customer? Register Now</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;