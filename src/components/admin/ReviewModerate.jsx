import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import './AdminStyles.css';

const ReviewModerate = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/admin/reviews/pending');
            if (response.data && response.data.reviews) {
                setReviews(response.data.reviews);
            } else if (Array.isArray(response.data)) {
                setReviews(response.data);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
            // Fallback for UI building
            // setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axiosInstance.post(`/admin/review/approve/${id}`);
            setSuccessMessage('Review approved successfully.');
            fetchReviews();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error approving review:', err);
            setError('Failed to approve review.');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject and delete this review?')) {
            return;
        }

        try {
            // HTML form uses POST to /admin/review/delete/{id}
            await axiosInstance.post(`/admin/review/delete/${id}`);
            setSuccessMessage('Review rejected and deleted.');
            fetchReviews();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error rejecting review:', err);
            setError('Failed to reject review.');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/auth/logout');
            navigate('/login');
        } catch (err) {
            navigate('/login');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i key={i} className={`fas fa-star ${i <= rating ? 'text-warning' : 'text-muted opacity-25'}`}></i>
            );
        }
        return stars;
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
                    <Link to="/admin/reviews/moderate" className="nav-link active"><i className="fas fa-star me-2"></i> Reviews</Link>
                    <Link to="/admin/contacts" className="nav-link text-light"><i className="fas fa-envelope me-2"></i> Messages</Link>
                    <Link to="/admin/live-studio" className="nav-link text-light"><i className="fas fa-video me-2"></i> Live Studio</Link>
                    <hr className="border-secondary mx-3 my-2" />
                    <Link to="/admin/profile" className="nav-link text-light"><i className="fas fa-user-cog me-2"></i> My Account</Link>
                    <a href="#" className="nav-link text-light" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i> Logout</a>
                </div>
                <div className="mt-auto p-3 position-absolute bottom-0 w-100" style={{maxWidth: '240px'}}>
                    <Link to="/" className="btn btn-outline-light btn-sm w-100">View Site</Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-main-content flex-grow-1 p-4" style={{ marginLeft: '240px' }}>
                <div className="container-fluid max-w-5xl">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="admin-title text-dark fw-bold m-0">
                            <i className="fas fa-star-half-alt text-secondary me-2"></i> 
                            Review Moderation <span className="badge bg-secondary ms-2 rounded-pill fs-6">{reviews.length} Pending</span>
                        </h2>
                        <Link to="/admin/dashboard" className="btn btn-secondary btn-sm">
                            <i className="fas fa-arrow-left me-2"></i> Back to Dashboard
                        </Link>
                    </div>

                    {successMessage && (
                        <div className="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
                            <i className="fas fa-check-circle me-2"></i> {successMessage}
                            <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                        </div>
                    )}
                    
                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
                            <i className="fas fa-exclamation-triangle me-2"></i> {error}
                            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="alert alert-success text-center p-5 border-0 shadow-sm bg-white rounded-4">
                            <i className="fas fa-check-circle fa-3x mb-3 text-success"></i>
                            <h4 className="fw-bold text-success mb-0">No new reviews pending moderation!</h4>
                            <p className="text-muted mt-2">All caught up.</p>
                        </div>
                    ) : (
                        <div className="row g-4 mb-5">
                            {reviews.map(review => (
                                <div key={review.id} className="col-12">
                                    <div className="card shadow-sm p-4 border-0 rounded-4" style={{ borderLeft: '5px solid #0d6efd' }}>
                                        <div className="row">
                                            {/* Review Content */}
                                            <div className="col-md-8">
                                                <div className="d-flex align-items-center mb-2">
                                                    <div className="me-3 fs-5">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <span className="fw-bold fs-5 text-dark">{review.rating}/5</span>
                                                </div>
                                                
                                                <p className="small text-muted mb-3">
                                                    By: <strong className="text-dark">{review.user?.username || 'Guest'}</strong> on {formatDate(review.datePosted)}
                                                </p>
                                                
                                                <div className="p-3 bg-light rounded-3 text-dark fst-italic position-relative">
                                                    <i className="fas fa-quote-left text-primary opacity-25 position-absolute top-0 start-0 m-2 mt-1 fs-5"></i>
                                                    <p className="mb-0 ps-4 position-relative" style={{ zIndex: 1 }}>{review.comment}</p>
                                                </div>
                                            </div>

                                            {/* Product Info & Actions */}
                                            <div className="col-md-4 d-flex flex-column justify-content-between border-start ps-4">
                                                <div>
                                                    <h6 className="text-uppercase text-secondary small fw-bold mb-2">Product:</h6>
                                                    <Link to={`/products/${review.product?.id}`} target="_blank" className="text-decoration-none fw-bold text-primary fs-6 d-block mb-1">
                                                        {review.product?.name || 'Unknown Product'}
                                                    </Link>
                                                    <p className="small text-muted mb-0">ID: {review.product?.id}</p>
                                                </div>

                                                <div className="d-flex gap-2 mt-4">
                                                    <button 
                                                        onClick={() => handleApprove(review.id)}
                                                        className="btn btn-success flex-grow-1"
                                                    >
                                                        <i className="fas fa-check me-2"></i> Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(review.id)}
                                                        className="btn btn-outline-danger flex-grow-1"
                                                    >
                                                        <i className="fas fa-times me-2"></i> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewModerate;
