import React from 'react';
import { formatCurrency } from '../../../utils/formatters';

const GiftCardBalance = ({ totalBalance, giftCards }) => {
  
  const calculateTotalBalance = () => {
    if (!giftCards || giftCards.length === 0) return 0;
    return giftCards.reduce((sum, card) => sum + (card.currentBalance || 0), 0);
  };

  const displayBalance = totalBalance !== undefined ? totalBalance : calculateTotalBalance();

  return (
    <div className="giftcard-card p-4 h-100">
      {/* Icon and Title */}
      <div className="d-flex align-items-center mb-3">
        <i className="fa fa-wallet me-2 fs-4"></i>
        <h5 className="mb-0">Total Available Balance</h5>
      </div>

      {/* Balance Display */}
      <div className="giftcard-balance mb-3">
        {formatCurrency(displayBalance)}
      </div>

      {/* Info Text */}
      <p className="small text-white-50 mb-0">
        <i className="fa fa-info-circle me-1"></i>
        Balance is automatically applied at checkout.
      </p>

      {/* Card Count */}
      {giftCards && giftCards.length > 0 && (
        <div className="mt-3 pt-3 border-top border-white border-opacity-25">
          <p className="small mb-0">
            <i className="fa fa-credit-card me-1"></i>
            {giftCards.length} active card{giftCards.length !== 1 ? 's' : ''} linked
          </p>
        </div>
      )}
    </div>
  );
};

export default GiftCardBalance;