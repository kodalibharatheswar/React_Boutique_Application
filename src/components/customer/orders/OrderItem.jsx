import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatters';
import axiosInstance from '../../../utils/axios';

const OrderItem = ({ order, onCancelOrder, onWriteReview }) => {
  const [productImages, setProductImages] = useState({});

  const parseOrderItems = (orderItemsSnapshot) => {
    if (!orderItemsSnapshot) return [];

    const items = orderItemsSnapshot.split(';').filter(item => item.trim());
    return items.map(item => {
      // Extract Product ID
      const idMatch = item.match(/\[ID:(\d+)\]/);
      const productId = idMatch ? idMatch[1] : null;

      // Extract Image URL if present
      const imgMatch = item.match(/\[IMG:(.*?)\]/);
      const imageUrl = imgMatch ? imgMatch[1] : null;

      // Extract Product Name (everything before the first tag [ID: or [IMG:)
      let nameEndIndex = item.indexOf('[ID:');
      if (item.indexOf('[IMG:') !== -1 && (nameEndIndex === -1 || item.indexOf('[IMG:') < nameEndIndex)) {
        nameEndIndex = item.indexOf('[IMG:');
      }
      const productName = nameEndIndex !== -1 ? item.substring(0, nameEndIndex).trim() : item.trim();

      // Extract Price Info (everything after the last ])
      const lastBracketIndex = item.lastIndexOf(']');
      const priceInfo = lastBracketIndex !== -1 ? item.substring(lastBracketIndex + 1).trim() : '';

      return {
        productId,
        productName,
        priceInfo,
        imageUrl
      };
    });
  };

  const orderItems = parseOrderItems(order.orderItemsSnapshot);

  // Fetch missing images
  useEffect(() => {
    const fetchMissingImages = async () => {
      const missingIds = orderItems
        .filter(item => !item.imageUrl && item.productId)
        .map(item => item.productId);

      if (missingIds.length === 0) return;

      const newImages = { ...productImages };
      let changed = false;

      for (const id of missingIds) {
        if (!newImages[id]) {
          try {
            const response = await axiosInstance.get(`/public/products/${id}`);
            if (response.data && response.data.product && response.data.product.imageUrl) {
              newImages[id] = response.data.product.imageUrl;
              changed = true;
            }
          } catch (err) {
            console.error(`Failed to fetch image for product ${id}:`, err);
          }
        }
      }

      if (changed) {
        setProductImages(newImages);
      }
    };

    fetchMissingImages();
  }, [order.orderItemsSnapshot]);

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
                    src={item.imageUrl || productImages[item.productId] || `https://placehold.co/80x80/ccc/333?text=${encodeURIComponent(item.productName.substring(0, 10))}`}
                    alt={item.productName}
                    className="product-image-thumb me-3"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
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