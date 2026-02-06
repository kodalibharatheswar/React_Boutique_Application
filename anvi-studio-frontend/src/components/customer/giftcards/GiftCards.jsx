import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import Footer from '../../common/Footer';
import GiftCardBalance from './GiftCardBalance';
import giftCardService from '../../../services/giftCardService';
import { formatCurrency } from '../../../utils/formatters';

const GiftCards = () => {
  const navigate = useNavigate();
  
  const [giftCards, setGiftCards] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Redeem form state
  const [cardNumber, setCardNumber] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const data = await giftCardService.getGiftCards();
      
      if (data.success) {
        setGiftCards(data.giftCards || []);
        setTotalBalance(data.totalBalance || 0);
      } else {
        setErrorMessage('Failed to load gift cards.');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setErrorMessage('Failed to load gift cards. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemCard = async (e) => {
    e.preventDefault();
    
    // Validate card number
    const cleanedNumber = cardNumber.replace(/\s/g, '');
    if (cleanedNumber.length !== 16) {
      setErrorMessage('Please enter a valid 16-digit card number.');
      return;
    }
    
    try {
      setRedeeming(true);
      setErrorMessage('');
      const response = await giftCardService.redeemGiftCard(cleanedNumber);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Gift card redeemed successfully!');
        setCardNumber('');
        fetchGiftCards(); // Refresh gift cards
        window.scrollTo(0, 0);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to redeem gift card. Please check the card number and try again.');
      window.scrollTo(0, 0);
    } finally {
      setRedeeming(false);
    }
  };

  const formatCardNumber = (number) => {
    // Mask card number: XXXX-XXXX-XXXX-1234
    if (!number) return '';
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.length <= 4) return cleaned;
    
    const lastFour = cleaned.slice(-4);
    const masked = 'X'.repeat(Math.max(0, cleaned.length - 4));
    
    // Format as XXXX-XXXX-XXXX-1234
    const formatted = (masked + lastFour).match(/.{1,4}/g)?.join('-') || '';
    return formatted;
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'No expiry';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric'
    });
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const expiryDate = new Date(dateString);
    return today > expiryDate;
  };

  const handleCardNumberInput = (e) => {
    // Allow only numbers and limit to 16 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(value);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="main-content container mt-5">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading gift cards...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="main-content container mt-5">
        <h1 className="hero-title display-5 mb-4">
          <i className="fa fa-gift me-2"></i> My Gift Cards
        </h1>
        <hr />

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {successMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccessMessage('')}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        {errorMessage && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {errorMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setErrorMessage('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="row g-4 mb-5">
          {/* Gift Card Balance Display */}
          <div className="col-lg-6">
            <GiftCardBalance 
              totalBalance={totalBalance} 
              giftCards={giftCards}
            />
          </div>

          {/* Redeem New Card */}
          <div className="col-lg-6">
            <div className="card shadow-sm p-4 h-100">
              <h5 className="mb-3">
                <i className="fa fa-plus-circle me-2"></i>
                Redeem a New Gift Card
              </h5>
              
              <form onSubmit={handleRedeemCard}>
                <div className="input-group mb-3">
                  <input 
                    type="text" 
                    className="form-control redeem-input" 
                    placeholder="Enter 16-digit card number"
                    value={cardNumber}
                    onChange={handleCardNumberInput}
                    maxLength="16"
                    required
                    disabled={redeeming}
                  />
                  <button 
                    className="btn redeem-button" 
                    type="submit"
                    disabled={redeeming || cardNumber.length !== 16}
                  >
                    {redeeming ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Redeeming...
                      </>
                    ) : (
                      'Redeem'
                    )}
                  </button>
                </div>
                <small className="text-muted">
                  <i className="fa fa-shield-alt me-1"></i>
                  Enter the 16-digit number printed on your gift card
                </small>
              </form>

              {/* Card History */}
              <div className="mt-4">
                <p className="text-muted small mb-2">
                  <i className="fa fa-history me-1"></i> Card History:
                </p>
                
                {giftCards.length === 0 ? (
                  <div className="alert alert-warning small mb-0">
                    <i className="fa fa-info-circle me-1"></i>
                    No gift cards linked to your account yet.
                  </div>
                ) : (
                  <div className="card-history">
                    <ul className="list-unstyled small mb-0">
                      {giftCards.map((card, index) => (
                        <li 
                          key={card.id || index} 
                          className={`mb-2 pb-2 ${index !== giftCards.length - 1 ? 'border-bottom' : ''}`}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="text-muted mb-1">
                                <i className="fa fa-credit-card me-1"></i>
                                {formatCardNumber(card.cardNumber)}
                              </div>
                              <div className={`fw-bold ${isExpired(card.expirationDate) ? 'text-danger' : 'text-success'}`}>
                                {formatCurrency(card.currentBalance)}
                              </div>
                              {card.expirationDate && (
                                <div className={`small ${isExpired(card.expirationDate) ? 'text-danger' : 'text-muted'}`}>
                                  <i className="fa fa-clock me-1"></i>
                                  {isExpired(card.expirationDate) ? 'Expired: ' : 'Expires: '}
                                  {formatExpiryDate(card.expirationDate)}
                                </div>
                              )}
                            </div>
                            {isExpired(card.expirationDate) && (
                              <span className="badge bg-danger ms-2">Expired</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card shadow-sm p-4">
              <h5 className="mb-3">
                <i className="fa fa-question-circle me-2"></i>
                How Gift Cards Work
              </h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="d-flex align-items-start">
                    <div className="me-3">
                      <i className="fa fa-gift fa-2x text-primary"></i>
                    </div>
                    <div>
                      <h6 className="mb-1">Redeem</h6>
                      <p className="small text-muted mb-0">
                        Enter your 16-digit gift card number to add it to your account
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-start">
                    <div className="me-3">
                      <i className="fa fa-shopping-cart fa-2x text-success"></i>
                    </div>
                    <div>
                      <h6 className="mb-1">Shop</h6>
                      <p className="small text-muted mb-0">
                        Your gift card balance is automatically applied at checkout
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-start">
                    <div className="me-3">
                      <i className="fa fa-check-circle fa-2x text-warning"></i>
                    </div>
                    <div>
                      <h6 className="mb-1">Track</h6>
                      <p className="small text-muted mb-0">
                        View your balance and transaction history anytime
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-4 mb-5">
          <Link to="/customer/profile" className="btn btn-secondary">
            <i className="fa fa-arrow-left me-2"></i> Back to Profile
          </Link>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default GiftCards;