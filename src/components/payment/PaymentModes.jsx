import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

// Mock Checkout Form Component
const MockCheckoutForm = ({ cartTotal, addressId, onSuccess, onError }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setMessage(null);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock Stripe validation (accepting standard 4242 test card)
        const cleanCard = cardNumber.replace(/\s+/g, '');
        if (cleanCard.startsWith('4242') && cleanCard.length >= 16) {
            onSuccess('pi_mock_' + Math.random().toString(36).substring(7), 'CARD');
        } else {
            setMessage("Your card was declined. Please use a valid test card (e.g., 4242 4242 4242 4242).");
            onError("Payment failed.");
        }

        setIsProcessing(false);
    };

    const handleCardChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        setCardNumber(formattedValue.substring(0, 19));
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        setExpiry(value);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-3">
                <label className="form-label small text-muted fw-bold">Card Information</label>
                <div className="border rounded px-3 py-2 bg-white d-flex align-items-center">
                    <i className="far fa-credit-card text-muted me-2"></i>
                    <input 
                        type="text" 
                        className="form-control border-0 p-0 shadow-none" 
                        placeholder="Card number (Try 4242...)" 
                        value={cardNumber}
                        onChange={handleCardChange}
                        required 
                    />
                </div>
            </div>
            
            <div className="row g-3 mb-4">
                <div className="col-6">
                    <label className="form-label small text-muted fw-bold">Expiration Date</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="MM / YY" 
                        value={expiry}
                        onChange={handleExpiryChange}
                        maxLength="5"
                        required 
                    />
                </div>
                <div className="col-6">
                    <label className="form-label small text-muted fw-bold">CVC</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        placeholder="CVC" 
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                        required 
                    />
                </div>
            </div>

            {message && <div className="alert alert-danger mt-3 mb-0 py-2 small">{message}</div>}
            
            <button 
                disabled={isProcessing || cardNumber.length < 16} 
                className="btn btn-dark w-100 mt-4 py-3 fw-bold tracking-wider fs-5 shadow-sm transition-colors border-0"
                style={{ backgroundColor: '#ff7c04', color: '#fff' }}
            >
                {isProcessing ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...</>
                ) : (
                    `Pay ₹${cartTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                )}
            </button>
            <p className="small text-muted mt-3 text-center">By clicking Pay, you agree to our Terms and Conditions. This is a secure, encrypted transaction.</p>
        </form>
    );
};

const PaymentModes = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const addressId = location.state?.addressId || new URLSearchParams(location.search).get('addressId');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('card');
    
    // Data States
    const [cartTotal, setCartTotal] = useState(0);
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const [shippingAddress, setShippingAddress] = useState(null);
    const [codProcessing, setCodProcessing] = useState(false);

    useEffect(() => {
        const fetchPaymentData = async () => {
            if (!addressId) {
                setError("No delivery address selected. Please return to cart.");
                setLoading(false);
                return;
            }

            try {
                // Fetch mock data or call your own cart API
                const cartRes = await axiosInstance.get('/cart');
                const addrRes = await axiosInstance.get('/customer/addresses');
                
                if (cartRes.data && cartRes.data.cartItems) {
                    setCartTotal(cartRes.data.cartTotal || 0);
                    setCartItemsCount(cartRes.data.cartItems.length || 0);
                }

                if (addrRes.data && addrRes.data.addresses) {
                    const addr = addrRes.data.addresses.find(a => a.id.toString() === addressId.toString());
                    setShippingAddress(addr);
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch payment details", err);
                setError("Unable to initialize payment. Please check your connection.");
                setLoading(false);
            }
        };

        fetchPaymentData();
        window.scrollTo(0, 0);
    }, [addressId]);

    const handlePaymentFinalize = async (paymentIntentId, method) => {
        try {
            await axiosInstance.post('/payment/confirm', {
                paymentIntentId: paymentIntentId,
                addressId: addressId,
                paymentMethod: method
            });
            
            navigate('/payment-success');
        } catch (err) {
            console.error("Failed to finalize order server-side", err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert("BACKEND ERROR: " + errorMsg);
            setError("Failed to create order: " + errorMsg);
            // Do NOT navigate to success if it fails!
        }
    };

    const handleCodSubmit = async (e) => {
        e.preventDefault();
        setCodProcessing(true);
        setError(null);
        try {
            await axiosInstance.post('/payment/confirm', {
                addressId: addressId,
                paymentMethod: 'COD'
            });
            navigate('/payment-success');
        } catch (err) {
            console.error("COD failed", err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert("BACKEND ERROR: " + errorMsg);
            setError("Failed to place Cash on Delivery order: " + errorMsg);
            setCodProcessing(false);
            // Do NOT navigate to success!
        }
    };

    if (loading) {
        return (
             <div className="container py-5 text-center mt-5 min-vh-75 d-flex flex-column justify-content-center align-items-center">
                <div className="spinner-border text-brand" style={{ color: '#ff7c04' }} role="status"></div>
                <p className="mt-3 text-muted fw-bold tracking-wider">Loading secure payment portal...</p>
            </div>
        );
    }

    return (
        <div className="main-content payment-bg flex-grow-1 py-5" style={{ backgroundColor: '#f9fafb' }}>
            <div className="container">
                <h1 className="hero-title display-5 mb-4 fw-bold text-dark" style={{ fontFamily: "'Playfair Display', serif" }}>
                    <i className="fa fa-credit-card me-3 opacity-75 text-brand" style={{ color: '#ff7c04' }}></i> 
                    Secure Checkout
                </h1>

                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4 bg-white px-4 py-3 rounded-pill shadow-sm d-inline-block">
                    <ol className="breadcrumb m-0 small fw-bold tracking-wider text-uppercase">
                        <li className="breadcrumb-item"><Link to="/cart" className="text-muted text-decoration-none hover-brand transition-colors">Cart</Link></li>
                        <li className="breadcrumb-item"><Link to="/customer/addresses" state={{ fromCart: true }} className="text-muted text-decoration-none hover-brand transition-colors">Address</Link></li>
                        <li className="breadcrumb-item active text-dark" aria-current="page" style={{ color: '#ff7c04' }}>Payment</li>
                    </ol>
                </nav>

                {error && (
                    <div className="alert alert-danger bg-white border-start border-danger border-4 shadow-sm mb-4 py-3">
                        <i className="fas fa-exclamation-circle text-danger me-2"></i> {error}
                    </div>
                )}

                <div className="row g-4 g-lg-5 mb-5">
                    
                    {/* Left Column: Payment Options */}
                    <div className="col-lg-8">
                        
                        {/* Delivery Address Review */}
                        <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm mb-4 border border-light">
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <h5 className="fw-bold m-0 text-dark"><i className="fas fa-map-marker-alt text-brand me-2" style={{ color: '#ff7c04' }}></i> Delivery Address</h5>
                                <button onClick={() => navigate('/customer/addresses', { state: { fromCart: true } })} className="btn btn-sm btn-outline-dark rounded-pill px-3">Change</button>
                            </div>
                            
                            {shippingAddress ? (
                                <div className="text-muted fs-6 lh-lg p-3 bg-light rounded-3 border">
                                    <span className="fw-bold text-dark d-block mb-1 fs-5">
                                        {shippingAddress.recipientName}
                                        {shippingAddress.isDefault && <span className="badge bg-dark ms-3 fw-normal small align-middle">Default</span>}
                                    </span>
                                    <span>{shippingAddress.streetAddress}</span><br/>
                                    <span>{shippingAddress.city} - <span className="fw-bold text-dark">{shippingAddress.pincode}</span></span><br/>
                                    <span>{shippingAddress.state}</span>
                                </div>
                            ) : (
                                <p className="text-danger small">No address associated. Cannot proceed.</p>
                            )}
                        </div>

                        {/* Payment Tabs */}
                        <div className="bg-white p-0 rounded-4 shadow-sm overflow-hidden border border-light">
                            <div className="row g-0 h-100">
                                {/* Navigation */}
                                <div className="col-md-4 bg-light border-end">
                                    <h6 className="px-4 pt-4 pb-2 fw-bold text-muted text-uppercase tracking-wider small">Select Method</h6>
                                    <ul className="nav flex-column nav-pills rounded-0" role="tablist">
                                        <li className="nav-item m-0">
                                            <button 
                                                className={`nav-link w-100 text-start px-4 py-3 rounded-0 border-start border-4 fw-bold transition-colors ${activeTab === 'card' ? 'active bg-white text-dark border-brand shadow-sm' : 'text-muted border-transparent hover-bg-light hover-text-dark'}`}
                                                onClick={() => setActiveTab('card')}
                                                style={activeTab === 'card' ? { borderLeftColor: '#ff7c04' } : {}}
                                            >
                                                <i className="fas fa-credit-card fa-fw me-2 opacity-75"></i> Credit/Debit Card
                                            </button>
                                        </li>
                                        <li className="nav-item m-0">
                                            <button 
                                                className={`nav-link w-100 text-start px-4 py-3 rounded-0 border-start border-4 fw-bold transition-colors ${activeTab === 'cod' ? 'active bg-white text-dark border-brand shadow-sm' : 'text-muted border-transparent hover-bg-light hover-text-dark'}`}
                                                onClick={() => setActiveTab('cod')}
                                                style={activeTab === 'cod' ? { borderLeftColor: '#ff7c04' } : {}}
                                            >
                                                <i className="fas fa-hand-holding-usd fa-fw me-2 opacity-75"></i> Cash on Delivery
                                            </button>
                                        </li>
                                        <li className="nav-item m-0">
                                            <button className="nav-link w-100 text-start px-4 py-3 rounded-0 text-muted opacity-50" disabled>
                                                <i className="fas fa-qrcode fa-fw me-2"></i> UPI <span className="badge bg-secondary ms-2 small">Soon</span>
                                            </button>
                                        </li>
                                        <li className="nav-item m-0">
                                            <button className="nav-link w-100 text-start px-4 py-3 rounded-0 text-muted opacity-50 border-bottom" disabled>
                                                <i className="fas fa-wallet fa-fw me-2"></i> Wallets <span className="badge bg-secondary ms-2 small">Soon</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                {/* Content */}
                                <div className="col-md-8 p-4 p-md-5">
                                    {/* Card Tab */}
                                    {activeTab === 'card' && (
                                        <div className="animation-fade-in">
                                            <h5 className="fw-bold text-dark mb-4 border-bottom pb-3">Pay securely by Card</h5>
                                            
                                            <div className="d-flex gap-2 mb-4 opacity-75">
                                                <i className="fab fa-cc-visa fa-2x text-dark"></i>
                                                <i className="fab fa-cc-mastercard fa-2x text-dark"></i>
                                                <i className="fab fa-cc-amex fa-2x text-dark"></i>
                                            </div>

                                            <MockCheckoutForm 
                                                cartTotal={cartTotal} 
                                                addressId={addressId} 
                                                onSuccess={handlePaymentFinalize}
                                                onError={(errMsg) => setError(errMsg)}
                                            />
                                        </div>
                                    )}

                                    {/* COD Tab */}
                                    {activeTab === 'cod' && (
                                        <div className="animation-fade-in">
                                            <h5 className="fw-bold text-dark mb-4 border-bottom pb-3">Cash on Delivery (COD)</h5>
                                            <p className="text-muted lh-lg mb-4">
                                                Pay in cash or using UPI/Card when your order is delivered.
                                            </p>
                                            <div className="bg-light p-3 rounded-3 border mb-4 text-muted small">
                                                <i className="fas fa-info-circle me-2 text-dark opacity-50"></i>
                                                COD availability depends on courier service at pincode <strong>{shippingAddress?.pincode}</strong>.
                                            </div>

                                            <form onSubmit={handleCodSubmit}>
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-dark w-100 py-3 fw-bold tracking-wider fs-5 shadow-sm transition-colors border-0"
                                                    style={{ backgroundColor: '#ff7c04', color: '#fff' }}
                                                    disabled={codProcessing || !shippingAddress}
                                                >
                                                    {codProcessing ? (
                                                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Placing Order...</>
                                                    ) : (
                                                        `Place Order • ₹${cartTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="col-lg-4">
                        <div className="bg-white p-4 p-xl-5 rounded-4 shadow-sm border border-light position-sticky" style={{ top: '2rem' }}>
                            <h4 className="fw-bold mb-4 pb-3 border-bottom text-dark">Order Summary</h4>
                            
                            <div className="d-flex justify-content-between mb-3 text-muted">
                                <span>Subtotal ({cartItemsCount} items)</span>
                                <span>₹{cartTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 text-muted">
                                <span>Platform Fee</span>
                                <span>₹0.00</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4 text-muted">
                                <span>Shipping Fee</span>
                                <span className="text-success fw-bold text-uppercase tracking-wider small bg-success bg-opacity-10 px-2 rounded">FREE</span>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center pt-4 border-top">
                                <span className="fw-bold text-dark fs-5">Total to Pay</span>
                                <span className="fw-bold text-brand display-6" style={{ color: '#ff7c04' }}>
                                    ₹{cartTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            
                            <div className="mt-4 text-center">
                                <div className="d-flex justify-content-center align-items-center gap-2 text-muted small opacity-75">
                                    <i className="fas fa-shield-alt"></i>
                                    <span>Safe and Secure Payments</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            <style>{`
                .payment-bg {
                    background-image: radial-gradient(#dee2e6 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                .hover-brand:hover { color: #ff7c04 !important; }
                .text-brand { color: #ff7c04 !important; }
                .border-brand { border-color: #ff7c04 !important; }
            `}</style>
        </div>
    );
};

export default PaymentModes;
