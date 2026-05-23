import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import authService from '../../services/authService';
import ProductCard from '../common/ProductCard';
// Utilizing existing common CSS or adding specific styles if needed.
import './ProductStyles.css';

const ProductList = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Parse URL parameters for initial state
    const queryParams = new URLSearchParams(location.search);
    const initialCategory = queryParams.get('category') || '';
    const initialKeyword = queryParams.get('keyword') || '';

    // State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        category: initialCategory,
        keyword: initialKeyword,
        minPrice: 0,
        maxPrice: 100000,
        status: '',
        color: '',
        sortBy: 'latest' // default sort
    });

    // Fetch initial filter options (Categories, Colors)
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [catRes, colorRes] = await Promise.all([
                    axiosInstance.get('/public/categories').catch(() => ({ data: [] })),
                    axiosInstance.get('/public/colors').catch(() => ({ data: [] }))
                ]);
                setCategories(catRes.data || []);
                setColors(colorRes.data || []);
            } catch (err) {
                console.error("Failed to load filter options", err);
                // Fallbacks if API isn't ready
                setCategories(['Lehengas', 'Sarees', 'Anarkalis', 'Kurtas']);
                setColors(['Red', 'Blue', 'Green', 'Pink', 'Black']);
            }
        };
        fetchFilterOptions();
    }, []);

    // Fetch products based on filters
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Check auth state
            const authRes = await authService.checkAuth();
            setIsAuthenticated(authRes.authenticated);

            // Convert filters object to query string, ignoring empty values
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
                    params.append(key, filters[key]);
                }
            });

            // Update URL to reflect current filters so users can share links
            navigate({ search: params.toString() }, { replace: true });

            const response = await axiosInstance.get(`/public/products?${params.toString()}`);
            setProducts(response.data.products || response.data || []);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setError("Unable to load products. Please try again later.");
            setProducts([]); // Clear on error
        } finally {
            setLoading(false);
        }
    }, [filters, navigate]);

    // Trigger fetch when filters change
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Sync filters with URL when it changes externally (like from Navbar)
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const category = queryParams.get('category') || '';
        const keyword = queryParams.get('keyword') || '';
        const sortBy = queryParams.get('sortBy') || 'latest';
        
        // Update filters if they differ from URL
        if (category !== filters.category || keyword !== filters.keyword || sortBy !== filters.sortBy) {
            setFilters(prev => ({
                ...prev,
                category,
                keyword,
                sortBy,
                // Reset other filters when changing category/keyword from URL
                minPrice: 0,
                maxPrice: 100000,
                status: '',
                color: ''
            }));
        }
    }, [location.search]);


    // Handlers
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryClick = (e, categoryName) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, category: categoryName }));
    };

    const handlePriceApply = (e) => {
        e.preventDefault();
        // Price is already updated onChange in the state, this just prevents default form submission 
        // if wrapped in a form, but we can also trigger a manual refetch if we debounced
        fetchProducts();
    };

    const handleAddToCart = async (e, productId, stock) => {
        e.preventDefault();
        if (stock === 0) return;
        try {
            await axiosInstance.post('/cart/add', { productId, quantity: 1 });
            alert("Added to cart!"); // Replace with proper toast notification
        } catch (err) {
            if(err.response?.status === 401 || err.response?.status === 403 || !err.response) {
                navigate('/cart-unauth');
            } else {
                alert("Failed to add to cart.");
            }
        }
    };

    const handleAddToWishlist = async (e, productId) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/wishlist/add/${productId}`, {});
            alert("Added to wishlist!"); // Replace with proper toast notification
        } catch (err) {
            if(err.response?.status === 401 || err.response?.status === 403 || !err.response) {
                navigate('/wishlist-unauth');
            } else {
                 alert("Failed to add to wishlist.");
            }
        }
    };

    // Format currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price);
    };

    return (
        <div className="product-list-page d-flex flex-column min-vh-100">
            <div className="main-content flex-grow-1">
                <div className="container my-5">
                    
                    <h1 className="hero-title display-5 mb-4">
                        {filters.keyword ? `Search: "${filters.keyword}"` : (filters.category || 'Product Catalog')}
                    </h1>
                    <hr />

                    <div className="row g-4 mt-4">
                        
                        {/* Left Column: Filter Sidebar */}
                        <div className="col-lg-3 mb-4 mb-lg-0">
                            
                            {/* Mobile Filter Toggle */}
                            <div className="d-lg-none">
                                <button 
                                    className="btn btn-outline-dark w-100 fw-bold d-flex justify-content-between align-items-center py-3 shadow-sm rounded-3" 
                                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                                >
                                    <span><i className="fas fa-filter me-2"></i> {showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
                                    <i className={`fas fa-chevron-${showMobileFilters ? 'up' : 'down'}`}></i>
                                </button>
                            </div>

                            <div className={`filter-sidebar mt-3 mt-lg-0 ${showMobileFilters ? 'd-block' : 'd-none d-lg-block'}`}>
                                <div className="d-flex justify-content-between align-items-center mb-3 d-lg-none border-bottom pb-2">
                                    <h5 className="fw-bold m-0">Filters</h5>
                                    <button className="btn btn-sm btn-light" onClick={() => setShowMobileFilters(false)}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <h5 className="fw-bold mb-4 d-none d-lg-block" style={{ fontFamily: "'Playfair Display', serif" }}>Filters</h5>

                                {/* Filter Group: Price Range */}
                                <div className="filter-group">
                                    <h6 className="fw-bold">Filter by Price</h6>
                                    
                                    <label className="small">Min Price: ₹ <span>{formatPrice(filters.minPrice)}</span></label>
                                    <input type="range" className="form-range" name="minPrice" min="0" max="100000" step="100" value={filters.minPrice} onChange={handleFilterChange} />

                                    <label className="small">Max Price: ₹ <span>{formatPrice(filters.maxPrice)}</span></label>
                                    <input type="range" className="form-range" name="maxPrice" min="0" max="100000" step="100" value={filters.maxPrice} onChange={handleFilterChange} />

                                    <button onClick={handlePriceApply} className="btn btn-sm btn-outline-secondary w-100 mt-2">Apply Price Filter</button>
                                </div>

                                {/* Filter Group: Status / Stock */}
                                <div className="filter-group">
                                    <h6 className="fw-bold">Filter by Status</h6>
                                    
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="status" id="statusInStock" value="inStock" checked={filters.status === 'inStock'} onChange={handleFilterChange} />
                                        <label className="form-check-label" htmlFor="statusInStock">In Stock</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="status" id="statusLowStock" value="lowStock" checked={filters.status === 'lowStock'} onChange={handleFilterChange} />
                                        <label className="form-check-label" htmlFor="statusLowStock">Low Stock (5 or less)</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="status" id="statusOnSale" value="onSale" checked={filters.status === 'onSale'} onChange={handleFilterChange} />
                                        <label className="form-check-label" htmlFor="statusOnSale">On Sale (Any Discount)</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="status" id="statusClearance" value="clearance" checked={filters.status === 'clearance'} onChange={handleFilterChange} />
                                        <label className="form-check-label" htmlFor="statusClearance">Clearance (50%+ Off)</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="status" id="statusAll" value="" checked={filters.status === '' || !filters.status} onChange={handleFilterChange} />
                                        <label className="form-check-label" htmlFor="statusAll">All Status</label>
                                    </div>
                                    <button onClick={handlePriceApply} className="btn btn-sm btn-outline-secondary w-100 mt-2">Apply Status Filter</button>
                                </div>

                                {/* Filter Group: Color Swatches */}
                                <div className="filter-group">
                                    <h6 className="fw-bold">Colour</h6>
                                    <div className="d-flex flex-wrap">
                                        {colors.map(colorName => (
                                            <label key={colorName} className="color-label">
                                                <input type="radio" name="color" value={colorName} style={{ display: 'none' }} checked={filters.color === colorName} onChange={handleFilterChange} />
                                                <div className="color-swatch-wrapper">
                                                    <span className="color-swatch" style={{ backgroundColor: colorName }} title={colorName}></span>
                                                </div>
                                                <span>{colorName}</span>
                                            </label>
                                        ))}
                                        
                                        {/* Clear color filter */}
                                        <label className="color-label">
                                            <input type="radio" name="color" value="" style={{ display: 'none' }} checked={filters.color === '' || !filters.color} onChange={handleFilterChange} />
                                            <div className="color-swatch-wrapper">
                                                <span className="color-swatch" style={{ backgroundColor: 'white', borderColor: '#ddd' }}></span>
                                            </div>
                                            <span>All</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Sidebar: Product Categories */}
                                <div className="filter-group">
                                    <h6 className="fw-bold">Product Categories</h6>
                                    <ul className="list-unstyled small">
                                        {categories.map(cat => (
                                            <li key={cat}>
                                                <a href="#!" onClick={(e) => handleCategoryClick(e, cat)} className={`text-decoration-none text-dark ${filters.category === cat ? 'fw-bold' : ''}`}>
                                                    {cat}
                                                </a>
                                            </li>
                                        ))}
                                        <li>
                                            <a href="#!" onClick={(e) => handleCategoryClick(e, '')} className={`text-decoration-none text-dark ${filters.category === '' ? 'fw-bold active' : ''}`}>
                                                All Products
                                            </a>
                                        </li>
                                    </ul>
                                </div>

                            </div>
                        </div>

                        {/* Right Column: Sorting and Product Grid */}
                        <div className="col-lg-9">
                            
                            {/* Top Bar: Sorting */}
                            <div className="d-flex justify-content-end align-items-center mb-4">
                                <label htmlFor="sortBySelect" className="form-label me-2 mb-0 small">Sort By:</label>
                                <select name="sortBy" id="sortBySelect" className="form-select form-select-sm d-inline-block w-auto" value={filters.sortBy} onChange={handleFilterChange}>
                                    <option value="latest">Latest Arrivals</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="priceAsc">Price: Low to High</option>
                                    <option value="priceDesc">Price: High to Low</option>
                                </select>
                            </div>

                            {/* Status Messages */}
                            {error && (
                                <div className="alert alert-danger shadow-sm"><i className="fas fa-exclamation-triangle me-2"></i>{error}</div>
                            )}

                            {loading ? (
                                <div className="text-center py-5 my-5">
                                    <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}></div>
                                    <p className="text-muted fw-bold">Loading catalog...</p>
                                </div>
                            ) : products.length === 0 && !error ? (
                                <div className="alert alert-warning text-center">
                                    <p className="lead mb-0">No products found matching the current filters.</p>
                                </div>
                            ) : (
                                <div className="row g-4 mb-5">
                                    {products.map(p => (
                                        <div className="col-sm-6 col-md-4" key={p.id}>
                                            <ProductCard 
                                                product={p} 
                                                handleAddToWishlist={handleAddToWishlist}
                                                isAuthenticated={isAuthenticated}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProductList;
