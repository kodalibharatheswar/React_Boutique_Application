import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import './AdminStyles.css';

const Profile = () => {
    const [profileData, setProfileData] = useState({
        currentUsername: '',
        newUsername: '',
        recoveryPhoneNumber: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [serverError, setServerError] = useState('');
    const [forceUpdate, setForceUpdate] = useState(false);

    const navigate = useNavigate();

    // Regex patterns from original HTML
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const PHONE_REGEX = /^[+]?[0-9]{10,15}$/;

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            // Fetch current profile info
            const response = await axiosInstance.get('/admin/profile');
            if (response.data) {
                setProfileData(prev => ({
                    ...prev,
                    currentUsername: response.data.username || '',
                    recoveryPhoneNumber: response.data.recoveryPhone || ''
                }));
                
                // If a forceUpdateMessage is returned, show the modal equivalent
                if (response.data.needsCredentialUpdate) {
                    setForceUpdate(true);
                }
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            // Fallback for UI building
            setProfileData(prev => ({
                ...prev,
                currentUsername: 'admin@example.com',
                recoveryPhoneNumber: '+1234567890'
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
        // Clear error for this field when typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        let newErrors = {};
        let isValid = true;

        if (!PHONE_REGEX.test(profileData.recoveryPhoneNumber)) {
            newErrors.recoveryPhoneNumber = "Please enter a valid recovery phone number (10-15 digits).";
            isValid = false;
        }

        if (profileData.newPassword && !PASSWORD_REGEX.test(profileData.newPassword)) {
            newErrors.newPassword = "Password must be 8+ chars, contain uppercase, lowercase, number, and special character.";
            isValid = false;
        }

        if (profileData.newPassword !== profileData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
            isValid = false;
        }

        // Require password if username or phone is changed
        if ((profileData.newUsername || profileData.recoveryPhoneNumber) && !profileData.newPassword) {
             // Depending on backend requirements, this might just update without password
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setMessage('');
        setServerError('');

        if (!validateForm()) {
            return;
        }

        try {
            const updatePayload = {
                newUsername: profileData.newUsername || profileData.currentUsername,
                recoveryPhoneNumber: profileData.recoveryPhoneNumber,
                newPassword: profileData.newPassword || ''
            };

            const response = await axiosInstance.put('/admin/profile', updatePayload);
            
            setMessage(response.data.message || 'Profile updated successfully.');
            setForceUpdate(false);
            
            // If username or password was changed, we might need to re-login
            if (profileData.newUsername || profileData.newPassword) {
                setTimeout(() => navigate('/login'), 2000);
            }
            
            // Clear passwords
            setProfileData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
            
        } catch (err) {
            console.error('Profile update error:', err);
            setServerError(err.response?.data?.error || 'Failed to update profile. Please try again.');
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/auth/logout');
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
            // Force navigate anyway
            navigate('/login');
        }
    };

    return (
        <div className="admin-layout d-flex bg-light">
            {/* Sidebar */}
            <div className="admin-sidebar bg-dark text-white p-3">
                <div className="px-3 mb-4 mt-3">
                    <h4 className="fw-bold">Anvi Studio</h4>
                    <p className="small text-muted">Admin Control</p>
                </div>
                <div className="nav flex-column admin-nav">
                    <Link to="/admin/dashboard" className="nav-link text-light"><i className="fas fa-box me-2"></i> Catalog</Link>
                    <Link to="/admin/orders" className="nav-link text-light"><i className="fas fa-shopping-bag me-2"></i> Orders</Link>
                    <Link to="/admin/reviews/moderate" className="nav-link text-light"><i className="fas fa-star me-2"></i> Reviews</Link>
                    <Link to="/admin/contacts" className="nav-link text-light"><i className="fas fa-envelope me-2"></i> Messages</Link>
                    <Link to="/admin/live-studio" className="nav-link text-light"><i className="fas fa-video me-2"></i> Live Studio</Link>
                    <hr className="border-secondary mx-3 my-2" />
                    <Link to="/admin/profile" className="nav-link active"><i className="fas fa-user-cog me-2"></i> My Account</Link>
                    <a href="#" className="nav-link text-light" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i> Logout</a>
                </div>
                <div className="mt-auto p-3 position-absolute bottom-0 w-100" style={{maxWidth: '240px'}}>
                    <Link to="/" className="btn btn-outline-light btn-sm w-100">View Site</Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-main-content flex-grow-1 p-4" style={{ marginLeft: '240px' }}>
                <div className="container-fluid max-w-4xl">
                    <h2 className="mb-4 text-dark fw-bold">Admin Profile Management</h2>

                    {forceUpdate && (
                        <div className="alert alert-warning border-warning shadow-sm" role="alert">
                            <h5 className="alert-heading text-danger fw-bold">
                                <i className="fas fa-exclamation-triangle me-2"></i> Immediate Action Required
                            </h5>
                            <hr />
                            <p className="mb-1">You are currently logged in with default administrator credentials (e.g., `admin`/`password123`).</p>
                            <p className="fw-bold text-danger mb-0">For security reasons, you must change your password and username immediately.</p>
                        </div>
                    )}

                    {message && (
                        <div className="alert alert-success shadow-sm" role="alert">
                            <i className="fas fa-check-circle me-2"></i> {message}
                        </div>
                    )}

                    {serverError && (
                        <div className="alert alert-danger shadow-sm" role="alert">
                            <i className="fas fa-exclamation-circle me-2"></i> {serverError}
                        </div>
                    )}

                    <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
                        <h4 className="card-title fw-bold mb-4 border-bottom pb-3">Update Login Credentials</h4>

                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-danger" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-secondary small">Current Username / Email</label>
                                        <input 
                                            type="text" 
                                            className="form-control bg-light" 
                                            value={profileData.currentUsername} 
                                            disabled 
                                        />
                                        <div className="form-text">This is your current login ID.</div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-secondary small">New Username / Email</label>
                                        <input 
                                            type="text" 
                                            name="newUsername" 
                                            value={profileData.newUsername}
                                            onChange={handleInputChange}
                                            className="form-control" 
                                            placeholder={`Current: ${profileData.currentUsername}`}
                                        />
                                        <div className="form-text">This will be your new primary login ID.</div>
                                    </div>

                                    <div className="col-md-12">
                                        <label className="form-label fw-bold text-secondary small">Recovery Phone Number</label>
                                        <input 
                                            type="tel" 
                                            name="recoveryPhoneNumber" 
                                            value={profileData.recoveryPhoneNumber}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.recoveryPhoneNumber ? 'is-invalid' : ''}`} 
                                            required
                                        />
                                        <div className="form-text text-danger">This number is essential for password recovery if you lose access to your email.</div>
                                        {errors.recoveryPhoneNumber && <div className="invalid-feedback">{errors.recoveryPhoneNumber}</div>}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-secondary small">New Password</label>
                                        <div className="input-group">
                                            <input 
                                                type={showNewPassword ? "text" : "password"} 
                                                name="newPassword" 
                                                value={profileData.newPassword}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`} 
                                                placeholder="Leave blank to keep current"
                                            />
                                            <span 
                                                className="input-group-text bg-white" 
                                                style={{cursor: 'pointer'}}
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                <i className={`fas ${showNewPassword ? 'fa-eye' : 'fa-eye-slash'} text-muted`}></i>
                                            </span>
                                            {errors.newPassword && <div className="invalid-feedback d-block">{errors.newPassword}</div>}
                                        </div>
                                        <div className="form-text text-muted small mt-2">
                                            Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character (@$!%*?&).
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-secondary small">Confirm New Password</label>
                                        <div className="input-group">
                                            <input 
                                                type={showConfirmPassword ? "text" : "password"} 
                                                name="confirmPassword" 
                                                value={profileData.confirmPassword}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} 
                                                disabled={!profileData.newPassword}
                                            />
                                            <span 
                                                className="input-group-text bg-white" 
                                                style={{cursor: 'pointer'}}
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                <i className={`fas ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'} text-muted`}></i>
                                            </span>
                                            {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
                                        </div>
                                    </div>

                                    <div className="col-12 mt-4 pt-3 border-top">
                                        <button type="submit" className="btn admin-btn-primary px-4 py-2">
                                            <i className="fas fa-save me-2"></i> Save Changes {profileData.newPassword ? 'and Log Out' : ''}
                                        </button>
                                        <Link to="/admin/dashboard" className="btn btn-light ms-2 px-4 py-2 border">
                                            Cancel
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
