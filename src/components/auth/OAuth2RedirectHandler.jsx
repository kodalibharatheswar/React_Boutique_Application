import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuth2Redirect = async () => {
      const errorParam = searchParams.get('error');
      if (errorParam) {
        setError('Authentication failed. Please try again.');
        setTimeout(() => { window.location.replace('/login'); }, 2000);
        return;
      }

      // Read the JWT token passed as URL parameter by the backend success handler
      const token = searchParams.get('token');
      if (!token) {
        setError('No authentication token received. Please try again.');
        setTimeout(() => { window.location.replace('/login'); }, 2000);
        return;
      }

      try {
        // Decode JWT payload (base64url) to extract user info
        const base64Payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64Payload));

        const email = payload.sub;           // Subject = email
        const role  = payload.role || 'CUSTOMER'; // Custom claim added by SecurityConfig

        if (!email) {
          throw new Error('Invalid token: no subject (email) found');
        }

        // Store token in localStorage — axios interceptor will send it as Authorization: Bearer
        localStorage.setItem('authToken', token);

        // Store minimal user info (Navbar will fetch full profile including firstName via /check)
        const user = { email, role };
        localStorage.setItem('user', JSON.stringify(user));

        console.log('OAuth2 login successful:', { email, role });

        // Use window.location.replace (full page reload) instead of React navigate.
        // This ensures the Navbar mounts fresh and re-calls checkAuth() with the token
        // already in localStorage, so it correctly shows the user's name.
        if (role === 'ADMIN') {
          window.location.replace('/admin/dashboard');
        } else {
          window.location.replace('/');
        }
      } catch (err) {
        console.error('OAuth2 token processing error:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => { window.location.replace('/login'); }, 2500);
      }
    };

    handleOAuth2Redirect();
  }, [searchParams]);

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: '100vh', backgroundColor: 'var(--bg-light)' }}
    >
      {error ? (
        <div
          className="alert alert-danger"
          role="alert"
          style={{ maxWidth: '400px', textAlign: 'center' }}
        >
          {error}
        </div>
      ) : (
        <>
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: '3rem', height: '3rem' }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-4" style={{ fontFamily: 'Playfair Display' }}>
            Completing login...
          </h4>
          <p className="text-muted">Please wait while we set up your session.</p>
        </>
      )}
    </div>
  );
};

export default OAuth2RedirectHandler;
