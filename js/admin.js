// Admin Panel JavaScript - For OLD STYLE

// Global variables
let productsListener = null;
let inquiriesListener = null;
const ADMIN_PASSWORD = 'kailash123';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const storage = firebase.storage();
    
    // Setup all functionalities
    setupPasswordProtection();
    setupTabNavigation();
    setupForms(db, storage);
    setupFilters();
    setupImagePreview();
    
    // Check for hash in URL
    const hash = window.location.hash.substring(1);
    if (hash) {
        setTimeout(() => switchTab(hash), 100);
    }
});

// Password protection
function setupPasswordProtection() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const passwordInput = document.getElementById('adminPassword');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    
    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Login
    loginBtn.addEventListener('click', function() {
        const password = passwordInput.value.trim();
        const errorDiv = document.getElementById('passwordError');
        
        if (password === ADMIN_PASSWORD) {
            // Show admin panel
            document.getElementById('passwordScreen').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            
            // Initialize data
            initializeAdminData();
        } else {
            errorDiv.textContent = 'Incorrect password. Please try again.';
            passwordInput.focus();
        }
    });
    
    // Enter key to login
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
    
    // Logout
    logoutBtn.addEventListener('click', function() {
        // Clear listeners
        if (productsListener) {
            productsListener();
            productsListener = null;
        }
        if (inquiriesListener) {
            inquiriesListener();
            inquiriesListener = null;
        }
        
        // Hide admin panel
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('passwordScreen').style.display = 'block';
        
        // Clear password
        passwordInput.value = '';
        document.getElementById('passwordError').textContent = '';
    });
}

// Initialize admin data
function initializeAdminData() {
    // Load products
    loadProducts();
    
    // Load inquiries
    loadInquiries();
    
    // Update stats
    updateDashboardStats();
}

// Tab navigation
function setupTabNavigation() {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
}

// Switch tabs
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected tab
    const tabElement = document.getElementById(tabName + '-tab');
    if (tabElement) {
        tabElement.classList.add('active');
        console.log('Tab element found and activated');
    } else {
        console.log('Tab element not found:', tabName + '-tab');
    }
    
    // Add active class to clicked nav item
    const navLink = document.querySelector(`[data-tab="${tabName}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Update URL hash
    window.location.hash = tabName;
    
    // If switching to products tab, refresh the list
    if (tabName === 'products') {
        loadProducts();
    }
    
    // If switching to inquiries tab, refresh
    if (tabName === 'inquiries') {
        loadInquiries();
    }
}

// Form setup
function setupForms(db, storage) {
    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleAddProduct(db, storage, this);
        });
    }
}

// Image preview setup
function setupImagePreview() {
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                // Check file size (2MB max)
                if (file.size > 2 * 1024 * 1024) {
                    alert('File size must be less than 2MB');
                    this.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    imagePreview.classList.add('has-image');
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Handle add product
async function handleAddProduct(db, storage, form) {
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value.trim();
    const specsText = document.getElementById('productSpecs').value.trim();
    const status = document.getElementById('productStatus').value;
    const imageFile = document.getElementById('productImage').files[0];
    
    // Validation
    if (!name || !category || !description || !imageFile) {
        alert('Please fill all required fields (*)');
        return;
    }
    
    // Process specs
    const specs = specsText ? specsText.split(',').map(s => s.trim()).filter(s => s) : [];
    
    try {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        // Generate ID
        const productId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        // Upload image to Firebase Storage
        const storageRef = storage.ref();
        const imageRef = storageRef.child(`products/${productId}/${imageFile.name}`);
        await imageRef.put(imageFile);
        const imageUrl = await imageRef.getDownloadURL();
        
        // Save product to Firestore
        await db.collection('products').doc(productId).set({
            id: productId,
            name: name,
            category: category,
            description: description,
            specs: specs,
            status: status,
            image: imageUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Product added successfully!');
        form.reset();
        
        // Reset image preview
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.innerHTML = '<i class="fas fa-image"></i><span>No image selected</span>';
            imagePreview.classList.remove('has-image');
        }
        
        // Switch to products tab
        switchTab('products');
        
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product: ' + error.message);
    } finally {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Product';
    }
}

// Load products from Firestore
function loadProducts() {
    const db = firebase.firestore();
    const productsTableBody = document.getElementById('productsTableBody');
    
    // Clear any existing listener
    if (productsListener) {
        productsListener();
    }
    
    // Set up real-time listener
    productsListener = db.collection('products')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            if (snapshot.empty) {
                productsTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-table">
                            <i class="fas fa-box-open"></i>
                            <p>No products added yet</p>
                        </td>
                    </tr>
                `;
                document.getElementById('totalProductsCount').textContent = '0';
                return;
            }
            
            let html = '';
            let productCount = 0;
            
            snapshot.forEach(doc => {
                const product = doc.data();
                productCount++;
                
                // Format date
                const date = product.createdAt ? 
                    new Date(product.createdAt.seconds * 1000).toLocaleDateString() : 
                    'N/A';
                
                html += `
                    <tr>
                        <td>
                            <img src="${product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}" 
                                 alt="${product.name}" 
                                 style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                        </td>
                        <td>${product.name}</td>
                        <td><span class="badge">${product.category}</span></td>
                        <td>${product.description.substring(0, 80)}${product.description.length > 80 ? '...' : ''}</td>
                        <td>
                            <span class="status ${product.status}">
                                ${product.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-small btn-secondary" onclick="editProduct('${product.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-small btn-danger" onclick="deleteProduct('${product.id}', '${product.name}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            productsTableBody.innerHTML = html;
            document.getElementById('totalProductsCount').textContent = productCount;
            
        }, error => {
            console.error('Error loading products:', error);
            productsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-table error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error loading products: ${error.message}</p>
                    </td>
                </tr>
            `;
        });
}

// Load inquiries from Firestore
function loadInquiries() {
    const db = firebase.firestore();
    const inquiriesList = document.getElementById('inquiriesList');
    const recentInquiriesList = document.getElementById('recentInquiriesList');
    
    // Clear any existing listener
    if (inquiriesListener) {
        inquiriesListener();
    }
    
    // Set up real-time listener
    inquiriesListener = db.collection('inquiries')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            if (snapshot.empty) {
                inquiriesList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-envelope"></i>
                        <p>No inquiries received yet</p>
                    </div>
                `;
                
                recentInquiriesList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-envelope-open"></i>
                        <p>No inquiries yet</p>
                    </div>
                `;
                
                document.getElementById('totalInquiriesCount').textContent = '0';
                document.getElementById('pendingInquiriesCount').textContent = '0';
                document.getElementById('completedInquiriesCount').textContent = '0';
                document.getElementById('inquiryCount').textContent = '0';
                return;
            }
            
            let allInquiries = [];
            let recentHtml = '';
            let filteredHtml = '';
            let totalCount = 0;
            let pendingCount = 0;
            let completedCount = 0;
            
            snapshot.forEach(doc => {
                const inquiry = doc.data();
                inquiry.id = doc.id;
                allInquiries.push(inquiry);
                
                totalCount++;
                if (inquiry.status === 'new' || inquiry.status === 'contacted' || inquiry.status === 'processing') pendingCount++;
                if (inquiry.status === 'completed') completedCount++;
                
                // Format date
                const date = inquiry.timestamp ? 
                    new Date(inquiry.timestamp.seconds * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : 
                    'N/A';
                
                // Recent inquiries (first 5)
                if (allInquiries.length <= 5) {
                    recentHtml += `
                        <div class="recent-item">
                            <div class="recent-info">
                                <h4>${inquiry.name}</h4>
                                <p>${inquiry.product || 'General Inquiry'}</p>
                                <span class="recent-date">${date}</span>
                            </div>
                            <div class="recent-status">
                                <span class="status ${inquiry.status}">${inquiry.status}</span>
                            </div>
                        </div>
                    `;
                }
                
                // Full inquiries list item
                filteredHtml += `
                    <div class="inquiry-item" data-status="${inquiry.status}">
                        <div class="inquiry-header">
                            <div class="inquiry-meta">
                                <h4>${inquiry.name}</h4>
                                <span class="inquiry-date">${date}</span>
                            </div>
                            <div class="inquiry-actions">
                                <select class="status-select" data-id="${inquiry.id}" onchange="updateInquiryStatus('${inquiry.id}', this.value)">
                                    <option value="new" ${inquiry.status === 'new' ? 'selected' : ''}>New</option>
                                    <option value="contacted" ${inquiry.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                                    <option value="processing" ${inquiry.status === 'processing' ? 'selected' : ''}>Processing</option>
                                    <option value="completed" ${inquiry.status === 'completed' ? 'selected' : ''}>Completed</option>
                                    <option value="cancelled" ${inquiry.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                                <button class="btn btn-small btn-danger" onclick="deleteInquiry('${inquiry.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="inquiry-body">
                            <p><strong>Email:</strong> ${inquiry.email}</p>
                            ${inquiry.phone ? `<p><strong>Phone:</strong> ${inquiry.phone}</p>` : ''}
                            ${inquiry.product ? `<p><strong>Product:</strong> ${inquiry.product}</p>` : ''}
                            ${inquiry.message ? `<p><strong>Message:</strong> ${inquiry.message}</p>` : ''}
                        </div>
                    </div>
                `;
            });
            
            // Update UI
            recentInquiriesList.innerHTML = recentHtml || `
                <div class="empty-state">
                    <i class="fas fa-envelope-open"></i>
                    <p>No inquiries yet</p>
                </div>
            `;
            
            inquiriesList.innerHTML = filteredHtml;
            filterInquiries();
            
            // Update counts
            document.getElementById('totalInquiriesCount').textContent = totalCount;
            document.getElementById('pendingInquiriesCount').textContent = pendingCount;
            document.getElementById('completedInquiriesCount').textContent = completedCount;
            document.getElementById('inquiryCount').textContent = totalCount;
            
        }, error => {
            console.error('Error loading inquiries:', error);
        });
}

// Setup filters
function setupFilters() {
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterInquiries);
    }
}

// Filter inquiries
function filterInquiries() {
    const filterValue = document.getElementById('statusFilter').value;
    const items = document.querySelectorAll('.inquiry-item');
    
    items.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-status') === filterValue) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Update inquiry status
async function updateInquiryStatus(inquiryId, newStatus) {
    try {
        await firebase.firestore().collection('inquiries').doc(inquiryId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating inquiry status:', error);
        alert('Error updating status: ' + error.message);
    }
}

// Delete product
async function deleteProduct(productId, productName) {
    if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
        try {
            await firebase.firestore().collection('products').doc(productId).delete();
            alert('Product deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product: ' + error.message);
        }
    }
}

// Delete inquiry
async function deleteInquiry(inquiryId) {
    if (confirm('Are you sure you want to delete this inquiry?')) {
        try {
            await firebase.firestore().collection('inquiries').doc(inquiryId).delete();
        } catch (error) {
            console.error('Error deleting inquiry:', error);
            alert('Error deleting inquiry: ' + error.message);
        }
    }
}

// Edit product (placeholder)
function editProduct(productId) {
    alert('Edit feature coming soon! Product ID: ' + productId);
}

// Refresh inquiries
function refreshInquiries() {
    loadInquiries();
}

// Update dashboard stats
function updateDashboardStats() {
    // Stats are updated in loadProducts() and loadInquiries()
}

// Export data
async function exportData() {
    try {
        const db = firebase.firestore();
        
        // Get all products
        const productsSnapshot = await db.collection('products').get();
        const products = productsSnapshot.docs.map(doc => doc.data());
        
        // Get all inquiries
        const inquiriesSnapshot = await db.collection('inquiries').get();
        const inquiries = inquiriesSnapshot.docs.map(doc => doc.data());
        
        // Create data object
        const exportData = {
            exportedAt: new Date().toISOString(),
            products: products,
            inquiries: inquiries
        };
        
        // Convert to JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        // Create download link
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kailash-exim-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Data exported successfully!');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data: ' + error.message);
    }
}

// Change password functions (placeholder)
function showChangePassword() {
    alert('Change password feature coming soon!');
}