import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import './AdminStyles.css'; // We'll create a shared CSS file for admin pages

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [currentCategory, setCurrentCategory] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModalInfo, setDeleteModalInfo] = useState({ show: false, id: null, name: '' });

    // New Product Form State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: '',
        sku: '',
        productColor: '',
        isAvailable: true,
        price: '',
        discountPercent: 0,
        stockQuantity: '',
        imageUrl: '',
        additionalImageUrls: '', // Comma separated for now
        videoUrl: '',
        audioUrl: '',
        description: '',
        additionalInformation: '',
        sizeOptions: '',
        sizeGuideUrl: '',
        estimatedDelivery: '',
        productTags: '',
        deliveryAndReturnPolicy: ''
    });

    const navigate = useNavigate();

    // Fetch products based on category filter
    const fetchProducts = async (category = '') => {
        setLoading(true);
        try {
            // Updated API endpoint assuming standard REST backend that returns JSON
            const url = category ? `/admin/products?category=${encodeURIComponent(category)}` : '/admin/products';
            const response = await axiosInstance.get(url);
            if (response.data && response.data.products) {
                setProducts(response.data.products);
            } else if (Array.isArray(response.data)) {
                setProducts(response.data);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            // Fallback for development if API is not returning expected format
            // setError('Failed to load products. Please check if you have admin privileges.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories for the filter and add product dropdown
    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/admin/categories');
            if (response.data && response.data.categories) {
                setAllCategories(response.data.categories);
            } else if (Array.isArray(response.data)) {
                setAllCategories(response.data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    const handleCategoryFilter = () => {
        setCurrentCategory(selectedCategory);
        fetchProducts(selectedCategory);
    };

    const handleAddInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewProduct({
            ...newProduct,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleAddProductSubmit = async (e) => {
        e.preventDefault();
        try {
            // Prepare the payload, converting comma-separated strings to arrays where needed
            const payload = {
                ...newProduct,
                additionalImageUrls: newProduct.additionalImageUrls
                    ? newProduct.additionalImageUrls.split(',').map(url => url.trim()).filter(url => url !== '')
                    : []
            };

            await axiosInstance.post('/admin/product', payload);
            setShowAddModal(false);
            fetchProducts(currentCategory); // Refresh list

            // Reset form
            setNewProduct({
                name: '', category: '', sku: '', productColor: '', isAvailable: true,
                price: '', discountPercent: 0, stockQuantity: '', imageUrl: '',
                additionalImageUrls: '', videoUrl: '', audioUrl: '',
                description: '', additionalInformation: '', sizeOptions: '',
                sizeGuideUrl: '', estimatedDelivery: '', productTags: '', deliveryAndReturnPolicy: ''
            });
            alert('Product added successfully!');
        } catch (err) {
            console.error('Error adding product:', err);
            alert('Failed to add product. Please try again.');
        }
    };

    const confirmDelete = (id, name) => {
        setDeleteModalInfo({ show: true, id, name });
    };

    const handleDeleteProduct = async () => {
        try {
            await axiosInstance.delete(`/admin/product/${deleteModalInfo.id}`);
            setDeleteModalInfo({ show: false, id: null, name: '' });
            fetchProducts(currentCategory); // Refresh the list
            alert('Product deleted successfully');
        } catch (err) {
            console.error('Error deleting product:', err);
            alert('Failed to delete product.');
        }
    };

    // Handle logout action for sidebar
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/auth/logout');
            navigate('/login');
        } catch (err) {
            navigate('/login');
        }
    };

    // Calculate discounted price matching the backend logic
    const calculateDiscountedPrice = (price, discountPercent) => {
        if (!discountPercent || discountPercent <= 0) return price;
        return (price - (price * (discountPercent / 100))).toFixed(2);
    };

    return (
        <div className="admin-layout d-flex">
            {/* Sidebar Component could be extracted, keeping it inline for now as per HTML */}
            <div className="admin-sidebar bg-dark text-white p-3">
                <div className="px-3 mb-4 mt-3">
                    <h4 className="fw-bold">Anvi Studio</h4>
                    <p className="small text-muted">Admin Control</p>
                </div>
                <div className="nav flex-column admin-nav">
                    <Link to="/admin/dashboard" className="nav-link active"><i className="fas fa-box me-2"></i> Catalog</Link>
                    <Link to="/admin/orders" className="nav-link text-light"><i className="fas fa-shopping-bag me-2"></i> Orders</Link>
                    <Link to="/admin/reviews/moderate" className="nav-link text-light"><i className="fas fa-star me-2"></i> Reviews</Link>
                    <Link to="/admin/contacts" className="nav-link text-light"><i className="fas fa-envelope me-2"></i> Messages</Link>
                    <Link to="/admin/live-studio" className="nav-link text-light"><i className="fas fa-video me-2"></i> Live Studio</Link>
                    <hr className="border-secondary mx-3 my-2" />
                    <Link to="/admin/profile" className="nav-link text-light"><i className="fas fa-user-cog me-2"></i> My Account</Link>
                    <a href="#" className="nav-link text-light" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i> Logout</a>
                </div>
                <div className="mt-auto p-3 position-absolute bottom-0 w-100" style={{ maxWidth: '240px' }}>
                    <Link to="/" className="btn btn-outline-light btn-sm w-100">View Site</Link>
                </div>
            </div>

            <div className="admin-main-content flex-grow-1 p-4 bg-light" style={{ marginLeft: '240px', minHeight: '100vh' }}>

                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i> {error}
                        <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                    </div>
                )}

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold">Product Catalog</h2>
                    <button className="btn admin-btn-primary px-4" onClick={() => setShowAddModal(true)}>
                        <i className="fas fa-plus me-2"></i> Add New Product
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="card border-0 shadow-sm p-3 mb-4 rounded-3">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                            <label className="form-label fw-bold text-secondary small">Filter by Category</label>
                            <div className="d-flex flex-column flex-sm-row gap-2">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="form-select shadow-none focus-ring focus-ring-danger"
                                >
                                    <option value="">All Categories</option>
                                    {allCategories.map((cat, idx) => (
                                        <option key={idx} value={cat}>{cat}</option>
                                    ))}
                                    {/* Fallback options if API fails to load categories */}
                                    {allCategories.length === 0 && (
                                        <>
                                            <option value="Sarees">Sarees</option>
                                            <option value="Lehengas">Lehengas</option>
                                            <option value="Dresses">Dresses</option>
                                        </>
                                    )}
                                </select>
                                <button className="btn btn-dark px-4 text-nowrap" onClick={handleCategoryFilter}>Apply Filter</button>
                            </div>
                        </div>
                        <div className="col-md-6 text-end">
                            <span className="text-muted small">{products.length} products found</span>
                        </div>
                    </div>
                </div>

                {/* Product Table */}
                <div className="card border-0 shadow-sm rounded-3">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 text-nowrap">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Product</th>
                                    <th>SKU</th>
                                    <th>Price</th>
                                    <th>Discount</th>
                                    <th>Stock</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5">
                                            <div className="spinner-border text-danger" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading && products.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted">
                                            <i className="fas fa-box-open fa-3x mb-3 text-secondary"></i>
                                            <p>No products found in this category.</p>
                                        </td>
                                    </tr>
                                )}

                                {!loading && products.map(product => (
                                    <tr key={product.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={product.imageUrl || 'https://placehold.co/50x50?text=No+Img'}
                                                    alt={product.name}
                                                    className="rounded me-3"
                                                    style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50?text=No+Img'; }}
                                                />
                                                <div>
                                                    <div className="fw-bold">{product.name}</div>
                                                    <div className="text-muted small">{product.productColor}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-muted font-monospace">{product.sku || 'N/A'}</td>
                                        <td>
                                            {product.discountPercent > 0 ? (
                                                <div>
                                                    <span className="fw-bold text-danger">₹{calculateDiscountedPrice(product.price, product.discountPercent)}</span>
                                                    <div className="text-muted text-decoration-line-through x-small">₹{product.price}</div>
                                                </div>
                                            ) : (
                                                <span className="fw-bold">₹{product.price}</span>
                                            )}
                                        </td>
                                        <td>
                                            {product.discountPercent > 0 ? (
                                                <span className="badge bg-success">{product.discountPercent}% OFF</span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-2 ${product.stockQuantity < 5 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                                                {product.stockQuantity} in stock
                                            </span>
                                        </td>
                                        <td>{product.category}</td>
                                        <td>
                                            <span className={`badge ${product.isAvailable ? 'bg-info text-dark' : 'bg-secondary'}`}>
                                                {product.isAvailable ? 'Visible' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="btn-group btn-group-sm">
                                                <Link to={`/admin/product/edit/${product.id}`} className="btn btn-outline-dark" title="Edit Product">
                                                    <i className="fas fa-edit"></i>
                                                </Link>
                                                <button
                                                    onClick={() => confirmDelete(product.id, product.name)}
                                                    className="btn btn-outline-danger"
                                                    title="Delete Product"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ADD PRODUCT MODAL */}
            {showAddModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <form className="modal-content" onSubmit={handleAddProductSubmit}>
                            <div className="modal-header bg-dark text-white">
                                <h5 className="modal-title fw-bold"><i className="fas fa-plus-circle me-2"></i> Add New Catalog Item</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-3">
                                    {/* Basic Information */}
                                    <div className="col-12 border-bottom pb-2 mb-2">
                                        <h6 className="admin-text-primary fw-bold">1. Basic Information</h6>
                                    </div>
                                    <div className="col-md-8">
                                        <label className="form-label fw-bold small text-muted">Product Name*</label>
                                        <input type="text" name="name" value={newProduct.name} onChange={handleAddInputChange} className="form-control shadow-none" required placeholder="Ex: Banarasi Silk Saree" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small text-muted">Category*</label>
                                        <select name="category" value={newProduct.category} onChange={handleAddInputChange} className="form-select shadow-none" required>
                                            <option value="">Select Category</option>
                                            {allCategories.map((cat, idx) => (
                                                <option key={idx} value={cat}>{cat}</option>
                                            ))}
                                            {/* Fallbacks */}
                                            {allCategories.length === 0 && (
                                                <>
                                                    <option value="Sarees">Sarees</option>
                                                    <option value="Lehengas">Lehengas</option>
                                                    <option value="Dresses">Dresses</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small text-muted">SKU (Unique Identifier)</label>
                                        <input type="text" name="sku" value={newProduct.sku} onChange={handleAddInputChange} className="form-control shadow-none" placeholder="Ex: AS-SAR-001" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small text-muted">Product Color</label>
                                        <input type="text" name="productColor" value={newProduct.productColor} onChange={handleAddInputChange} className="form-control shadow-none" placeholder="Ex: Royal Blue" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small text-muted">Visibility</label>
                                        <select name="isAvailable" value={newProduct.isAvailable} onChange={handleAddInputChange} className="form-select shadow-none">
                                            <option value={true}>Visible to Customers</option>
                                            <option value={false}>Hidden from Catalog</option>
                                        </select>
                                    </div>

                                    {/* Inventory & Pricing */}
                                    <div className="col-12 border-bottom pb-2 mt-4 mb-2">
                                        <h6 className="admin-text-primary fw-bold">2. Inventory & Pricing</h6>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small text-muted">Original Price (₹)*</label>
                                        <input type="number" step="0.01" name="price" value={newProduct.price} onChange={handleAddInputChange} className="form-control shadow-none" required placeholder="0.00" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small text-muted">Discount Percentage (%)</label>
                                        <input type="number" name="discountPercent" value={newProduct.discountPercent} onChange={handleAddInputChange} className="form-control shadow-none" min="0" max="100" placeholder="0" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small text-muted">Stock Quantity*</label>
                                        <input type="number" name="stockQuantity" value={newProduct.stockQuantity} onChange={handleAddInputChange} className="form-control shadow-none" required placeholder="0" />
                                    </div>

                                    {/* Media & Content */}
                                    <div className="col-12 border-bottom pb-2 mt-4 mb-2">
                                        <h6 className="admin-text-primary fw-bold">3. Media & Content</h6>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-muted">Main Product Image URL*</label>
                                        <input type="text" name="imageUrl" value={newProduct.imageUrl} onChange={handleAddInputChange} className="form-control shadow-none" required placeholder="https://example.com/main-image.jpg" />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-muted">Additional Images (Comma separated URLs)</label>
                                        <textarea name="additionalImageUrls" value={newProduct.additionalImageUrls} onChange={handleAddInputChange} className="form-control shadow-none" rows="2" placeholder="Ex: https://example.com/img2.jpg, https://example.com/img3.jpg"></textarea>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted">Video URL (Optional)</label>
                                        <input type="text" name="videoUrl" value={newProduct.videoUrl} onChange={handleAddInputChange} className="form-control shadow-none" placeholder="Ex: https://example.com/video.mp4" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted">Audio URL (Optional)</label>
                                        <input type="text" name="audioUrl" value={newProduct.audioUrl} onChange={handleAddInputChange} className="form-control shadow-none" placeholder="Ex: https://example.com/audio.mp3" />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-muted">Short Description*</label>
                                        <textarea name="description" value={newProduct.description} onChange={handleAddInputChange} className="form-control shadow-none" rows="2" required placeholder="Quick summary for product list..."></textarea>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-muted">Additional Information (Fabric Details, Wash Care)</label>
                                        <textarea name="additionalInformation" value={newProduct.additionalInformation} onChange={handleAddInputChange} className="form-control shadow-none" rows="3" placeholder="Detailed fabric info, wash care instructions, etc."></textarea>
                                    </div>

                                    {/* Specifications & SEO */}
                                    <div className="col-12 border-bottom pb-2 mt-4 mb-2">
                                        <h6 className="admin-text-primary fw-bold">4. Specifications & SEO</h6>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted">Size Options (Comma Separated)</label>
                                        <input type="text" name="sizeOptions" value={newProduct.sizeOptions} onChange={handleAddInputChange} className="form-control shadow-none" placeholder="Ex: S, M, L, XL or 38, 40" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted">Size Guide URL (Optional)</label>
                                        <input type="text" name="sizeGuideUrl" value={newProduct.sizeGuideUrl} onChange={handleAddInputChange} className="form-control shadow-none" placeholder="https://example.com/sizechart.jpg" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted">Estimated Delivery Time</label>
                                        <input type="text" name="estimatedDelivery" value={newProduct.estimatedDelivery} onChange={handleAddInputChange} className="form-control shadow-none" placeholder="Ex: 3-5 Business Days" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted">Product Tags (SEO/Related)</label>
                                        <input type="text" name="productTags" value={newProduct.productTags} onChange={handleAddInputChange} className="form-control shadow-none" placeholder="Ex: silk, partywear, new-arrival" />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-muted">Delivery and Return Policy (Specific for Product)</label>
                                        <textarea name="deliveryAndReturnPolicy" value={newProduct.deliveryAndReturnPolicy} onChange={handleAddInputChange} className="form-control shadow-none" rows="2" placeholder="Leave empty for default policy..."></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn admin-btn-primary px-6">Create Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteModalInfo.show && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title fw-bold">Confirm Deletion</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setDeleteModalInfo({ show: false, id: null, name: '' })}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p>Are you sure you want to delete product <strong>{deleteModalInfo.name}</strong> (ID: {deleteModalInfo.id})?</p>
                                <div className="alert alert-danger small mb-0 border-0">
                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                    This action is irreversible and will remove the product from all customer carts and wishlists.
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setDeleteModalInfo({ show: false, id: null, name: '' })}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={handleDeleteProduct}>Delete Permanently</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
