import React, { useState } from 'react';
import { formatCurrency } from '../../../utils/formatters';

const CouponCard = ({ coupon }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCoupon = async () => {
    try {
      // Modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(coupon.code);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      fallbackCopyTextToClipboard(coupon.code);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Fallback: Failed to copy', err);
      alert('Failed to copy coupon code. Please copy manually: ' + text);
    }

    document.body.removeChild(textArea);
  };

  const formatExpiryDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isExpired = () => {
    const today = new Date();
    const expiryDate = new Date(coupon.expirationDate);
    return today > expiryDate;
  };

  return (
    <div className={`card coupon-card shadow-sm p-4 h-100 ${isExpired() ? 'expired' : ''}`}>
      {/* Coupon Code and Copy Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="coupon-code">{coupon.code}</span>
        <button
          className={`btn btn-sm copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopyCoupon}
          disabled={isExpired()}
        >
          {copied ? (
            <>
              <i className="fa fa-check me-1"></i> Copied!
            </>
          ) : (
            <>
              <i className="fa fa-copy me-1"></i> Copy
            </>
          )}
        </button>
      </div>

      {/* Coupon Description */}
      <h5 className="mb-3">{coupon.description}</h5>

      {/* Minimum Purchase */}
      <p className="text-muted small mb-2">
        {coupon.minPurchaseAmount ? (
          <>
            <i className="fa fa-shopping-cart me-1"></i>
            Min Purchase: {formatCurrency(coupon.minPurchaseAmount)}
          </>
        ) : (
          <>
            <i className="fa fa-gift me-1"></i>
            No minimum purchase
          </>
        )}
      </p>

      {/* Discount Details */}
      {coupon.discountType && (
        <p className="text-success small mb-2">
          <i className="fa fa-tag me-1"></i>
          {coupon.discountType === 'PERCENTAGE' ? (
            <>Get {coupon.discountValue}% off</>
          ) : (
            <>Get {formatCurrency(coupon.discountValue)} off</>
          )}
          {coupon.maxDiscountAmount && (
            <> (Max: {formatCurrency(coupon.maxDiscountAmount)})</>
          )}
        </p>
      )}

      {/* Expiration Date */}
      <p className={`small mb-0 ${isExpired() ? 'text-danger fw-bold' : 'text-danger'}`}>
        <i className="fa fa-clock me-1"></i>
        {isExpired() ? 'Expired on: ' : 'Expires: '}
        {formatExpiryDate(coupon.expirationDate)}
      </p>

      {/* Expired Badge */}
      {isExpired() && (
        <div className="mt-3">
          <span className="badge bg-danger">EXPIRED</span>
        </div>
      )}
    </div>
  );
};

export default CouponCard;