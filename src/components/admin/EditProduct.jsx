import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import './AdminStyles.css';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState({
        id: '',
        name: '',
        category: '',
        sku: '',
        price: '',
        discountPercent: 0,
        stockQuantity: '',
        imageUrl: '',
        additionalImageUrls: '', // Will be handled as string in form
        videoUrl: '',
        audioUrl: '',
        productColor: '',
        description: '',
        sizeOptions: '',
        sizeGuideUrl: '',
        estimatedDelivery: '',
        productTags: '',
        additionalInformation: '',
        deliveryAndReturnPolicy: '',
        isAvailable: true
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            try {
                // Fetch categories first
                const catRes = await axiosInstance.get('/admin/categories');
                if (catRes.data && catRes.data.categories) {
                    setCategories(catRes.data.categories);
                }

                // Fetch product details - using revised exact ID path
                const prodRes = await axiosInstance.get(`/admin/product/edit/${id}`);
                if (prodRes.data && prodRes.data.success) {
                    const productData = prodRes.data.product;
                    // Convert array to comma-separated string for editing
                    if (Array.isArray(productData.additionalImageUrls)) {
                        productData.additionalImageUrls = productData.additionalImageUrls.join(', ');
                    }
                    setProduct(productData);
                } else {
                    setError('Product data not found in response.');
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                const msg = err.response?.data?.message || err.message || 'Network Error';
                setError(`${msg}. Please verify the backend is running and you are logged in as admin.`);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct({
            ...product,
            [name]: type === 'checkbox' ? checked : value
        });

        // Reset image error if URL changes
        if (name === 'imageUrl') {
            setImageError(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // Prepare the payload, converting comma-separated strings to arrays where needed
            const payload = {
                ...product,
                additionalImageUrls: typeof product.additionalImageUrls === 'string'
                    ? product.additionalImageUrls.split(',').map(url => url.trim()).filter(url => url !== '')
                    : product.additionalImageUrls
            };

            // Use semantic REST PUT mapped to the backend update method
            await axiosInstance.put(`/admin/product/${product.id}`, payload);
            
            // Redirect back to dashboard after successful edit
            navigate('/admin/dashboard', { state: { message: `Product "${product.name}" updated successfully!` } });
        } catch (err) {
            console.error('Error updating product:', err);
            setError('Failed to save product updates. Please verify the data and try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/auth/logout');
            navigate('/login');
        } catch (err) {
            navigate('/login');
        }
    };

    return (
        <div className="admin-layout d-flex bg-light">
            {/* Sidebar */}
            <div className="admin-sidebar bg-dark text-white p-3">
                <div className="px-3 mb-4 mt-3">
                    <h4 className="fw-bold">Anvi Studio</h4>
                    <p className="small text-muted">Admin Control</p>
                </div>
                <div className="nav flex-column admin-nav">
                    <Link to="/admin/dashboard" className="nav-link text-light"><i className="fas fa-box me-2"></i> Catalog</Link>
                    <Link to="/admin/orders" className="nav-link text-light"><i className="fas fa-shopping-bag me-2"></i> Orders</Link>
                    <Link to="/admin/reviews/moderate" className="nav-link text-light"><i className="fas fa-star me-2"></i> Reviews</Link>
                    <Link to="/admin/contacts" className="nav-link text-light"><i className="fas fa-envelope me-2"></i> Messages</Link>
                    <Link to="/admin/live-studio" className="nav-link text-light"><i className="fas fa-video me-2"></i> Live Studio</Link>
                    <hr className="border-secondary mx-3 my-2" />
                    <Link to="/admin/profile" className="nav-link text-light"><i className="fas fa-user-cog me-2"></i> My Account</Link>
                    <a href="#" className="nav-link text-light" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i> Logout</a>
                </div>
                <div className="mt-auto p-3 position-absolute bottom-0 w-100" style={{maxWidth: '240px'}}>
                    <Link to="/" className="btn btn-outline-light btn-sm w-100">View Site</Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-main-content flex-grow-1 p-4" style={{ marginLeft: '240px' }}>
                <div className="container-fluid max-w-6xl">
                    <div className="d-flex align-items-center mb-4">
                        <h2 className="text-dark fw-bold mb-0">Edit Product: {product.name}</h2>
                    </div>

                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
                            <i className="fas fa-exclamation-triangle me-2"></i> {error}
                            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-5 mt-5">
                            <div className="spinner-border text-danger" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mt-3">Loading product data...</p>
                        </div>
                    ) : (
                        <div className="card shadow-sm border-0 rounded-4 p-4 mb-5">
                            <h4 className="card-title fw-bold border-bottom pb-3 mb-4">Product Details (ID: {product.id})</h4>

                            <form onSubmit={handleSubmit}>
                                <div className="row g-4">
                                    {/* Image Preview Column */}
                                    <div className="col-md-4">
                                        <h5 className="mb-3 text-secondary small fw-bold text-uppercase">Image Preview</h5>
                                        <div className="bg-light p-3 rounded-3 text-center mb-3">
                                            <img 
                                                src={!imageError && product.imageUrl ? product.imageUrl : 'https://placehold.co/300x300/ccc/333?text=No+Image'} 
                                                onError={() => setImageError(true)}
                                                className="img-fluid rounded" 
                                                alt="Product Preview"
                                                style={{ maxHeight: '350px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Details Column */}
                                    <div className="col-md-8">
                                        <div className="row g-3">
                                            {/* Core Identification */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-secondary small">Product Name</label>
                                                <input type="text" name="name" value={product.name || ''} onChange={handleInputChange} className="form-control" required />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-secondary small">Category</label>
                                                <select name="category" value={product.category || ''} onChange={handleInputChange} className="form-select" required>
                                                    <option value="" disabled>Select Category</option>
                                                    {categories.map((cat, idx) => (
                                                        <option key={idx} value={cat}>{cat}</option>
                                                    ))}
                                                    {categories.length === 0 && (
                                                        <option value={product.category}>{product.category}</option>
                                                    )}
                                                </select>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-secondary small">SKU (Model #)</label>
                                                <input type="text" name="sku" value={product.sku || ''} onChange={handleInputChange} className="form-control" placeholder="e.g., LEH2024-5" />
                                            </div>

                                            {/* Pricing and Inventory */}
                                            <div className="col-md-4">
                                                <label className="form-label fw-bold text-secondary small">Price (₹)</label>
                                                <input type="number" step="0.01" name="price" value={product.price || ''} onChange={handleInputChange} className="form-control" required />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label fw-bold text-secondary small">Discount (%)</label>
                                                <input type="number" name="discountPercent" value={product.discountPercent || 0} onChange={handleInputChange} className="form-control" min="0" max="100" />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label fw-bold text-secondary small">Stock Quantity</label>
                                                <input type="number" name="stockQuantity" value={product.stockQuantity || 0} onChange={handleInputChange} className="form-control" required />
                                            </div>

                                            {/* Image URL and Color */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-secondary small">Main Image URL</label>
                                                <input type="text" name="imageUrl" value={product.imageUrl || ''} onChange={handleInputChange} className="form-control" placeholder="https://..." />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-secondary small">Color</label>
                                                <input type="text" name="productColor" value={product.productColor || ''} onChange={handleInputChange} className="form-control" placeholder="e.g., Red, Teal, Pink" />
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label fw-bold text-secondary small">Additional Images (Comma separated URLs)</label>
                                                <textarea name="additionalImageUrls" value={product.additionalImageUrls || ''} onChange={handleInputChange} className="form-control" rows="2" placeholder="Ex: https://example.com/img2.jpg, https://example.com/img3.jpg"></textarea>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-secondary small">Video URL (Optional)</label>
                                                <input type="text" name="videoUrl" value={product.videoUrl || ''} onChange={handleInputChange} className="form-control" placeholder="Ex: https://example.com/video.mp4" />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-secondary small">Audio URL (Optional)</label>
                                                <input type="text" name="audioUrl" value={product.audioUrl || ''} onChange={handleInputChange} className="form-control" placeholder="Ex: https://example.com/audio.mp3" />
                                            </div>

                                            {/* Short Description */}
                                            <div className="col-12">
                                                <label className="form-label fw-bold text-secondary small">Short Description</label>
                                                <textarea name="description" value={product.description || ''} onChange={handleInputChange} className="form-control" rows="3" required></textarea>
                                            </div>

                                            {/* Size and Delivery */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-secondary small">Size Options (Comma Separated)</label>
                                                <input type="text" name="sizeOptions" value={product.sizeOptions || ''} onChange={handleInputChange} className="form-control" placeholder="e.g., S, M, L, XL or Free Size" />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-secondary small">Size Guide URL (Optional)</label>
                                                <input type="text" name="sizeGuideUrl" value={product.sizeGuideUrl || ''} onChange={handleInputChange} className="form-control" placeholder="/images/size-chart.png" />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-secondary small">Estimated Delivery Time</label>
                                                <input type="text" name="estimatedDelivery" value={product.estimatedDelivery || ''} onChange={handleInputChange} className="form-control" placeholder="e.g., 4-6 Business Days" />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-secondary small">Product Tags (SEO/Related)</label>
                                                <input type="text" name="productTags" value={product.productTags || ''} onChange={handleInputChange} className="form-control" placeholder="e.g., silk, party wear, green, lehenga" />
                                            </div>

                                            {/* Long Text Policies */}
                                            <div className="col-12">
                                                <label className="form-label fw-bold text-secondary small">Additional Information (Fabric Details, Wash Care)</label>
                                                <textarea name="additionalInformation" value={product.additionalInformation || ''} onChange={handleInputChange} className="form-control" rows="3" placeholder="Detailed fabric composition..."></textarea>
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label fw-bold text-secondary small">Delivery and Return Policy (Specific for Product)</label>
                                                <textarea name="deliveryAndReturnPolicy" value={product.deliveryAndReturnPolicy || ''} onChange={handleInputChange} className="form-control" rows="2" placeholder="Example: 7-day exchange only on damaged goods."></textarea>
                                            </div>

                                            {/* Visibility Checkbox */}
                                            <div className="col-12 mt-3 p-3 bg-light border rounded">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        role="switch" 
                                                        id="isAvailable"
                                                        name="isAvailable"
                                                        checked={product.isAvailable} 
                                                        onChange={handleInputChange}
                                                    />
                                                    <label className="form-check-label fw-bold" htmlFor="isAvailable">
                                                        Product is currently available for purchase (Visible to customers)
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="col-12 mt-4 pt-3 border-top d-flex gap-3">
                                                <button type="submit" className="btn admin-btn-primary px-5 py-2" disabled={saving}>
                                                    {saving ? (
                                                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...</>
                                                    ) : (
                                                        <><i className="fas fa-save me-2"></i> Save Product Updates</>
                                                    )}
                                                </button>
                                                <Link to="/admin/dashboard" className="btn btn-outline-secondary px-4 py-2">
                                                    Cancel
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
