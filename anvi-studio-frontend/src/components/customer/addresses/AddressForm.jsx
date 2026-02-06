import React, { useState, useEffect } from 'react';

const AddressForm = ({ address, onSave, onClose, saving }) => {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    recipientName: '',
    phoneNumber: '',
    streetAddress: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (address) {
      // Editing existing address
      setFormData({
        id: address.id || null,
        name: address.name || '',
        recipientName: address.recipientName || '',
        phoneNumber: address.phoneNumber || '',
        streetAddress: address.streetAddress || '',
        landmark: address.landmark || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        isDefault: address.isDefault || false
      });
    } else {
      // Adding new address - reset form
      setFormData({
        id: null,
        name: '',
        recipientName: '',
        phoneNumber: '',
        streetAddress: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
    }
    setErrors({});
  }, [address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Address nickname is required';
    }

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="addressForm">
      <div className="modal-body">
        <input type="hidden" name="id" value={formData.id || ''} />

        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Address Nickname <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Home, Work, Office"
            required
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="recipientName" className="form-label">
            Recipient Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="recipientName"
            name="recipientName"
            className={`form-control ${errors.recipientName ? 'is-invalid' : ''}`}
            value={formData.recipientName}
            onChange={handleChange}
            placeholder="Full name of the person receiving"
            required
          />
          {errors.recipientName && <div className="invalid-feedback">{errors.recipientName}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="phoneNumber" className="form-label">
            Phone Number <span className="text-danger">*</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            required
          />
          {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="streetAddress" className="form-label">
            Street Address / House No. <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="streetAddress"
            name="streetAddress"
            className={`form-control ${errors.streetAddress ? 'is-invalid' : ''}`}
            value={formData.streetAddress}
            onChange={handleChange}
            placeholder="House/Flat No., Building Name, Street"
            required
          />
          {errors.streetAddress && <div className="invalid-feedback">{errors.streetAddress}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="landmark" className="form-label">Landmark (Optional)</label>
          <input
            type="text"
            id="landmark"
            name="landmark"
            className="form-control"
            value={formData.landmark}
            onChange={handleChange}
            placeholder="Near hospital, mall, etc."
          />
        </div>

        <div className="row g-3">
          <div className="col-md-6 mb-3">
            <label htmlFor="city" className="form-label">
              City <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              className={`form-control ${errors.city ? 'is-invalid' : ''}`}
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              required
            />
            {errors.city && <div className="invalid-feedback">{errors.city}</div>}
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="state" className="form-label">
              State <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="state"
              name="state"
              className={`form-control ${errors.state ? 'is-invalid' : ''}`}
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              required
            />
            {errors.state && <div className="invalid-feedback">{errors.state}</div>}
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="pincode" className="form-label">
            Pincode <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="pincode"
            name="pincode"
            className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
            value={formData.pincode}
            onChange={handleChange}
            placeholder="6-digit pincode"
            maxLength="6"
            required
          />
          {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
        </div>

        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="isDefault">
            Set as Default Address
          </label>
        </div>
      </div>

      <div className="modal-footer">
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={onClose}
          disabled={saving}
        >
          Close
        </button>
        <button 
          type="submit" 
          className="btn btn-brand"
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Saving...
            </>
          ) : (
            formData.id ? 'Update Address' : 'Save Address'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;