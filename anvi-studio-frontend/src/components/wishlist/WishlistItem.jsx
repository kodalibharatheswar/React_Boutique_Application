import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

const WishlistItem = ({ item, onRemove }) => {
  const product = item.product;
  const hasDiscount = product.discountPercent > 0;
  const isClearance = product.clearance || product.isClearance;

  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove this item from your wishlist?')) {
      await onRemove(product.id);
    }
  };

  return (
    <div className="col-12">
      <div className="card wishlist-card shadow-sm p-3">
        <div className="row align-items-center">
          
          {/* Image */}
          <div className="col-md-2 col-4">
            <img 
              src={product.imageUrl || 'https://placehold.co/120x120/ccc/333?text=Product'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/120x120/ccc/333?text=Error';
              }}
              className="product-image"
              alt={product.name}
            />
          </div>

          {/* Details */}
          <div className="col-md-6 col-8">
            <h5 className="mb-1">
              {product.name}
              
              {/* Sale/Clearance Status */}
              {isClearance && (
                <span className="item-sale-tag item-clearance">
                  <i className="fa fa-fire"></i> CLEARANCE
                </span>
              )}
              {!isClearance && hasDiscount && (
                <span className="item-sale-tag item-sale">
                  <i className="fa fa-tag"></i> SALE
                </span>
              )}
            </h5>
            
            <p className="text-muted small mb-0">{product.category}</p>

            {/* Price Display */}
            <p className="fw-bold fs-5 text-success mb-0">
              {hasDiscount && (
                <span className="text-secondary d-inline">
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
            </p>
          </div>

          {/* Actions */}
          <div className="col-md-4 text-md-end text-center mt-3 mt-md-0">
            <Link 
              to={`/products/${product.id}`} 
              className="btn btn-outline-dark btn-sm me-2"
            >
              View Details
            </Link>

            <button 
              type="button"
              onClick={handleRemove}
              className="btn btn-danger btn-sm"
            >
              <i className="fa fa-trash me-1"></i> Remove
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WishlistItem;