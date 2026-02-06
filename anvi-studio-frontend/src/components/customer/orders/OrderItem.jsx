import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatters';

const OrderItem = ({ order, onCancelOrder, onWriteReview }) => {
  
  const parseOrderItems = (orderItemsSnapshot) => {
    if (!orderItemsSnapshot) return [];
    
    const items = orderItemsSnapshot.split(';').filter(item => item.trim());
    return items.map(item => {
      const idMatch = item.match(/\[ID:(\d+)\]/);
      const productId = idMatch ? idMatch[1] : null;
      const productName = item.substring(0, item.indexOf('[ID:')).trim();
      const priceInfo = item.substring(item.indexOf(']') + 1).trim();
      
      return {
        productId,
        productName,
        priceInfo
      };
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-PENDING';
      case 'PROCESSING':
        return 'status-PROCESSING';
      case 'SHIPPED':
        return 'status-SHIPPED';
      case 'DELIVERED':
        return 'status-DELIVERED';
      case 'CANCELLED':
      case 'RETURNED':
      case 'RETURN_REQUESTED':
        return 'status-CANCELLED';
      default:
        return '';
    }
  };

  const orderItems = parseOrderItems(order.orderItemsSnapshot);

  return (
    <div className="card order-card shadow-sm p-4">
      
      {/* Order Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-0 fw-bold">Order #{order.id}</h5>
          <small className="text-muted">
            Placed: {new Date(order.orderDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </small>
        </div>
        <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Order Items */}
      <div className="p-3 bg-light rounded mb-3">
        <h6 className="small fw-bold mb-2">Items in Order:</h6>
        
        {order.orderItemsSnapshot ? (
          <ul className="list-unstyled small mb-0">
            {orderItems.map((item, index) => (
              <li key={index} className="order-item-detail">
                <div className="d-flex align-items-center w-100">
                  <img 
                    src={`https://placehold.co/80x80/ccc/333?text=Product`}
                    alt={item.productName}
                    className="product-image-thumb me-3"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/80x80/ccc/333?text=No+Image';
                    }}
                  />
                  <div className="flex-grow-1">
                    <Link 
                      to={`/products/${item.productId}`} 
                      className="item-link"
                    >
                      {item.productName}
                    </Link>
                    <div className="text-muted small">{item.priceInfo}</div>
                  </div>
                  
                  {/* Review Button (only for delivered orders) */}
                  {order.status === 'DELIVERED' && (
                    <button
                      className="btn btn-sm btn-outline-primary ms-2"
                      onClick={() => onWriteReview(order.id, item.productId, item.productName)}
                    >
                      <i className="fa fa-star me-1"></i> Write Review
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted small mb-0">Items details are unavailable</p>
        )}
      </div>

      {/* Order Footer */}
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <strong>Total:</strong> {formatCurrency(order.totalAmount)}
        </div>
        
        <div className="d-flex gap-2">
          <Link 
            to={`/order/track/${order.id}`} 
            className="btn btn-sm btn-dark"
          >
            <i className="fa fa-truck me-1"></i> Track Order
          </Link>
          
          {(order.status === 'PROCESSING' || order.status === 'PENDING') && (
            <button
              className="btn btn-sm btn-danger"
              onClick={() => onCancelOrder(order.id)}
            >
              <i className="fa fa-times me-1"></i> Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderItem;