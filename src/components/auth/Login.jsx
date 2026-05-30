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
        // Store JWT in localStorage so Navbar's checkAuth() sends it as Bearer header
        if (response.accessToken) {
          localStorage.setItem('authToken', response.accessToken);
        }

        // Full page reload so Navbar mounts fresh and reads the new token
        const userRole = response.user?.role || '';
        if (userRole === 'ROLE_ADMIN' || userRole === 'ADMIN') {
          window.location.replace('/admin/profile');
        } else {
          window.location.replace('/');
        }
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
      } else if (err.socialLogin) {
        // Social account tried to log in with email+password
        setError(err.message || 'This account uses Google Sign-In. Please use the "Continue with Google" button below.');
      } else {
        setError(err.message || 'Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };


  const googleOAuthUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '') + '/oauth2/authorization/google';

  return (
    <>
      <div className="auth-container">
        <div className="auth-card" style={{ border: '1px solid var(--border-color)', boxShadow: 'none' }}>
          
          {/* Brand Logo inside the card */}
          <div className="text-center mb-2">
            <Link to="/" style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', fontWeight: '500', color: 'var(--brand-dark)', textDecoration: 'none', letterSpacing: '2px', textTransform: 'uppercase' }}>
              ANVI STUDIO
            </Link>
          </div>

          <h3 className="text-center mb-4" style={{ fontFamily: 'Playfair Display', fontWeight: '500', fontSize: '1.5rem', color: '#666' }}>Customer Login</h3>

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

          {/* Google OAuth Login Button */}
          <div className="mb-4 text-center">
            <a 
              href={googleOAuthUrl} 
              className="btn w-100 d-flex justify-content-center align-items-center py-2"
              style={{ backgroundColor: '#ffffff', color: '#3c4043', border: '1px solid #dadce0', borderRadius: '4px', fontWeight: '500', transition: 'all 0.2s ease', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.30)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" className="me-3">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.73 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continue with Google
            </a>
          </div>

          <div className="d-flex align-items-center mb-4">
            <hr className="flex-grow-1 text-muted" />
            <span className="mx-3 text-muted small text-uppercase">Or sign in with email</span>
            <hr className="flex-grow-1 text-muted" />
          </div>

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