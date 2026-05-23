import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import './AdminStyles.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Status options matching backend enums
    const statusTypes = [
        'CREATED', 'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURN_PICKED', 'RETURNED'
    ];

    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/admin/orders');
            if (response.data && response.data.orders) {
                setOrders(response.data.orders);
            } else if (Array.isArray(response.data)) {
                setOrders(response.data);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            // Fallback for development/UI building
            setOrders([
               // Sample data if API fails to load
            ]);
            // setError('Failed to load orders. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await axiosInstance.post(`/admin/order/updateStatus/${orderId}`, null, {
                params: { newStatus }
            });
            setSuccessMessage(`Order #${orderId} status updated to ${newStatus}`);
            fetchOrders(); // Refresh the list
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating order status:', err);
            setError(`Failed to update order #${orderId}.`);
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleFinalizeReturn = async (orderId) => {
        if (!window.confirm(`APPROVE RETURN & INITIATE REFUND for order ${orderId}?`)) {
            return;
        }

        try {
            // Note: In HTML it was a POST to /admin/order/finalizeReturn/{id} with orderId hidden param
            const form = new URLSearchParams();
            form.append('orderId', orderId);
            
            await axiosInstance.post(`/admin/order/finalizeReturn/${orderId}`, form, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            
            setSuccessMessage(`Return finalized and refund initiated for Order #${orderId}`);
            fetchOrders();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error finalizing return:', err);
            setError(`Failed to finalize return for order #${orderId}.`);
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

    // Helper for formatting dates if available
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Helper to get status badge class
    const getStatusClass = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-warning text-dark';
            case 'PROCESSING': return 'bg-primary';
            case 'SHIPPED': return 'bg-info text-dark';
            case 'DELIVERED': return 'bg-success';
            case 'CANCELLED': return 'bg-secondary';
            case 'RETURNED': return 'bg-danger';
            case 'RETURN_REQUESTED': return 'bg-danger'; // Specific hex in HTML was #ff5733
            default: return 'bg-secondary';
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
                    <Link to="/admin/orders" className="nav-link active"><i className="fas fa-shopping-bag me-2"></i> Orders</Link>
                    <Link to="/admin/reviews/moderate" className="nav-link text-light"><i className="fas fa-star me-2"></i> Reviews</Link>
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
                <div className="container-fluid max-w-6xl">
                    <h2 className="mb-4 text-dark fw-bold admin-title">
                        <i className="fas fa-receipt me-2 text-secondary"></i> Order Management Dashboard
                    </h2>

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

                    <div className="card shadow-sm border-0 rounded-3 mb-5">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-danger" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="alert alert-info text-center p-4 m-3 border-0 bg-light">
                                <i className="fas fa-box-open fa-3x mb-3 text-secondary"></i>
                                <h5>No orders found</h5>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover align-middle mb-0 text-nowrap">
                                    <thead className="bg-dark text-white">
                                        <tr>
                                            <th className="ps-3 py-3 fw-normal">ID</th>
                                            <th className="py-3 fw-normal">Date</th>
                                            <th className="py-3 fw-normal">Customer (ID)</th>
                                            <th className="py-3 fw-normal">Total</th>
                                            <th className="py-3 fw-normal">Status</th>
                                            <th className="py-3 fw-normal">Items Snapshot</th>
                                            <th className="pe-3 py-3 fw-normal text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id} className={order.status === 'RETURN_REQUESTED' ? 'table-warning' : ''}>
                                                <td className="ps-3 fw-bold">{order.id}</td>
                                                <td>{formatDate(order.orderDate)}</td>
                                                <td>
                                                    <strong>{order.user?.username || 'Guest'}</strong>
                                                    <br/><small className="text-muted">(ID: {order.user?.id || 'N/A'})</small>
                                                </td>
                                                <td className="fw-bold">₹ {parseFloat(order.totalAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                                <td>
                                                    <span className={`badge ${getStatusClass(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td style={{ maxWidth: '250px' }}>
                                                    <div className="small text-muted text-truncate" title={order.orderItemsSnapshot}>
                                                        {order.orderItemsSnapshot ? order.orderItemsSnapshot.replace(/\[IMG:.*?\]/g, '').replace(/;/g, ', ') : 'No items data'}
                                                    </div>
                                                    <div className="small text-secondary text-truncate mt-1" title={order.shippingAddressSnapshot}>
                                                        <i className="fas fa-map-marker-alt me-1"></i>
                                                        {order.shippingAddressSnapshot || 'No address data'}
                                                    </div>
                                                </td>
                                                <td className="pe-3 text-center">
                                                    
                                                    {/* Status Update Dropdown */}
                                                    <div className="dropdown d-inline-block">
                                                        <button 
                                                            className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                                            type="button" 
                                                            id={`dropdownMenu-${order.id}`}
                                                            data-bs-toggle="dropdown" 
                                                            aria-expanded="false"
                                                        >
                                                            Update Status
                                                        </button>
                                                        <ul className="dropdown-menu shadow" aria-labelledby={`dropdownMenu-${order.id}`}>
                                                            {statusTypes.map(status => (
                                                                <li key={status}>
                                                                    <button 
                                                                        className={`dropdown-item ${order.status === status ? 'active bg-light text-dark fw-bold' : ''}`}
                                                                        onClick={() => handleUpdateStatus(order.id, status)}
                                                                        disabled={order.status === status}
                                                                    >
                                                                        Set to {status}
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Return Finalization Button */}
                                                    {order.status === 'RETURN_REQUESTED' && (
                                                        <button 
                                                            onClick={() => handleFinalizeReturn(order.id)}
                                                            className="btn btn-sm btn-danger ms-2"
                                                        >
                                                            <i className="fas fa-check me-1"></i> Finalize Return/Refund
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;
