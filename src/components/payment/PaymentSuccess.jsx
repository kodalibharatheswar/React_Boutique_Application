import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session_id') || queryParams.get('reference');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const styles = {
        container: {
            fontFamily: "'Roboto', sans-serif",
            backgroundColor: "#f7f7f7",
            minHeight: "75vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "20px"
        },
        card: {
            maxWidth: "500px",
            width: "100%",
            padding: "40px",
            borderRadius: "15px",
            backgroundColor: "white",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)"
        },
        icon: {
            fontSize: "4rem",
            color: "#28a745",
            marginBottom: "20px"
        },
        btnBrand: {
            backgroundColor: "#ff7c04",
            borderColor: "#ff7c04",
            color: "white",
            transition: "all 0.3s ease"
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card} className="animation-fade-in">
                <i className="fas fa-check-circle" style={styles.icon}></i>
                <h1 className="h3 mb-3 fw-bold">Payment Successful!</h1>
                
                <p className="text-muted mb-4">
                    Thank you for your order! Your payment has been successfully processed.
                </p>

                {sessionId && (
                    <div className="alert alert-info small mx-auto" style={{maxWidth: '400px'}}>
                        <p className="mb-0"><strong>Confirmation:</strong> Your order is being processed.</p>
                        <p className="mb-0 text-break">Reference: {sessionId}</p>
                    </div>
                )}

                <Link 
                    to="/customer/orders?success=true"
                    className="btn w-100 mt-3 fw-bold shadow-sm"
                    style={styles.btnBrand}
                    onMouseOver={(e) => {e.target.style.backgroundColor = '#cc6300'; e.target.style.borderColor = '#cc6300';}}
                    onMouseOut={(e) => {e.target.style.backgroundColor = '#ff7c04'; e.target.style.borderColor = '#ff7c04';}}
                >
                    <i className="fa fa-receipt me-2"></i> View My Orders
                </Link>
                
                <Link to="/" className="d-block mt-3 text-secondary small text-decoration-none hover-brand transition-colors">
                    Continue Shopping
                </Link>
            </div>
            <style>{`
                .animation-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .hover-brand:hover { color: #ff7c04 !important; }
                .transition-colors { transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease; }
            `}</style>
        </div>
    );
};

export default PaymentSuccess;
