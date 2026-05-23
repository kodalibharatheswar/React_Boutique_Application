import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import './AdminStyles.css';

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/admin/contacts');
            if (response.data && response.data.messages) {
                setMessages(response.data.messages);
            } else if (Array.isArray(response.data)) {
                setMessages(response.data);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
            // Fallback for UI building if API is not perfectly aligned
            // setMessages([]); 
        } finally {
            setLoading(false);
        }
    };

    const handleMarkHandled = async (id) => {
        if (!window.confirm('Mark message as handled and delete?')) {
            return;
        }

        try {
            await axiosInstance.delete(`/admin/contact/delete/${id}`);
            setSuccessMessage('Message marked as handled.');
            fetchMessages(); // Refresh list
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error deleting message:', err);
            setError('Failed to mark message as handled.');
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
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
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
                    <Link to="/admin/contacts" className="nav-link active"><i className="fas fa-envelope me-2"></i> Messages</Link>
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
                        <h2 className="admin-title text-dark fw-bold m-0 pl-2">Customer Queries and Messages</h2>
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
                            <div className="spinner-border text-danger" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="alert alert-info text-center p-4 border-0 shadow-sm bg-white rounded-3">
                            <i className="fas fa-check-circle fa-2x mb-3 text-success"></i>
                            <h5 className="mb-0">No pending customer messages found.</h5>
                        </div>
                    ) : (
                        <div className="row g-4 mb-5">
                            {messages.map(message => (
                                <div key={message.id} className="col-12">
                                    <div className="card shadow-sm p-4 border-0 rounded-3" style={{ borderLeft: '5px solid #ff4d6d' }}>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h5 className="mb-1 text-dark fw-bold">{message.name}</h5>
                                                <p className="text-muted small mb-2">
                                                    <i className="fas fa-envelope me-1"></i> {message.email}
                                                    {message.phoneNumber && (
                                                        <span className="ms-2">
                                                            <i className="fas fa-phone me-1 ms-2 border-start ps-2"></i> {message.phoneNumber}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-secondary small mb-0">
                                                    <i className="far fa-clock me-1"></i> Received: <span>{formatDate(message.dateSubmitted)}</span>
                                                </p>
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleMarkHandled(message.id)}
                                                className="btn btn-outline-danger btn-sm px-3"
                                            >
                                                <i className="fas fa-check-circle me-1"></i> Mark Handled
                                            </button>
                                        </div>
                                        <hr className="text-muted my-3" />
                                        <div className="bg-light p-3 rounded text-dark" style={{ whiteSpace: 'pre-wrap' }}>
                                            {message.message}
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

export default ContactMessages;
