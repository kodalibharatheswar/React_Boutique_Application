import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity < 0) return;

    setQuantity(newQuantity);
    setIsUpdating(true);

    try {
      await onUpdateQuantity(item.id, newQuantity);
    } catch (error) {
      // Revert on error
      setQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      await onRemove(item.id);
    }
  };

  const product = item.product;
  const hasDiscount = product.discountPercent > 0;
  const isClearance = product.clearance || product.isClearance;

  return (
    <div className="card cart-card shadow-sm p-3">
      <div className="row align-items-center">
        
        {/* Image */}
        <div className="col-md-2 col-3">
          <img 
            src={product.imageUrl || 'https://placehold.co/100x100/ccc/333?text=Product'}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/100x100/ccc/333?text=Error';
            }}
            className="product-image"
            alt={product.name}
          />
        </div>

        {/* Details */}
        <div className="col-md-5 col-9">
          <h5 className="mb-1">{product.name}</h5>
          <p className="text-muted small mb-0">{product.category}</p>

          {/* Unit Price Display */}
          <p className="fw-bold fs-6 text-dark mb-0">
            Unit Price:{' '}
            
            {hasDiscount && (
              <span className="text-secondary">
                <span className="original-price">
                  ₹ {formatCurrency(product.price)}
                </span>
                <span className="badge bg-danger discount-badge">
                  -{product.discountPercent}%
                </span>
              </span>
            )}
            
            <span className="text-success">
              ₹ {formatCurrency(product.discountedPrice)}
            </span>

            {/* Sale/Clearance Status */}
            {isClearance && (
              <span className="item-sale-tag item-clearance">
                CLEARANCE
              </span>
            )}
            {!isClearance && hasDiscount && (
              <span className="item-sale-tag item-sale">
                SALE
              </span>
            )}
          </p>
        </div>

        {/* Quantity Control */}
        <div className="col-md-3 col-6 mt-3 mt-md-0">
          <div className="d-flex align-items-center justify-content-md-start">
            <label htmlFor={`quantity-${item.id}`} className="me-2 small">
              Qty:
            </label>
            <input 
              type="number" 
              id={`quantity-${item.id}`}
              name="quantity"
              value={quantity}
              min="0"
              className="form-control form-control-sm qty-input"
              onChange={handleQuantityChange}
              disabled={isUpdating}
            />
          </div>
          <small className="text-muted d-block mt-1">
            Total: ₹{formatCurrency(item.totalPrice)}
          </small>
        </div>

        {/* Remove Action */}
        <div className="col-md-2 col-6 mt-3 mt-md-0 text-end">
          <button 
            type="button"
            onClick={handleRemove}
            className="btn btn-outline-danger btn-sm"
            title="Remove item"
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CartItem;