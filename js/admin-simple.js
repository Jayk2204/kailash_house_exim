// Simple Admin Panel with Local Storage
document.addEventListener('DOMContentLoaded', function() {
    // Password Protection
    const passwordScreen = document.getElementById('passwordScreen');
    const adminPanel = document.getElementById('adminPanel');
    const passwordInput = document.getElementById('adminPassword');
    const loginBtn = document.getElementById('loginBtn');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const passwordError = document.getElementById('passwordError');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Admin password (Change this in production!)
    const ADMIN_PASSWORD = 'kailash123';
    
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showAdminPanel();
    }
    
    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Login
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const enteredPassword = passwordInput.value.trim();
            
            if (enteredPassword === ADMIN_PASSWORD) {
                // Save login state
                localStorage.setItem('adminLoggedIn', 'true');
                showAdminPanel();
            } else {
                passwordError.textContent = 'Incorrect password! Try: kailash123';
                passwordInput.focus();
            }
        });
        
        // Allow Enter key to login
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            hideAdminPanel();
        });
    }
    
    // Tab Navigation
    const tabLinks = document.querySelectorAll('.sidebar-nav a[data-tab]');
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Load content for the tab
            loadTabContent(tabId);
        });
    });
    
    // Product Image Preview
    const productImageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (productImageInput && imagePreview) {
        productImageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.innerHTML = '<i class="fas fa-image"></i><span>No image selected</span>';
            }
        });
    }
    
    // Add Product Form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const productName = document.getElementById('productName').value;
            const productCategory = document.getElementById('productCategory').value;
            const productDescription = document.getElementById('productDescription').value;
            const productImage = document.getElementById('productImage').files[0];
            const productStatus = document.getElementById('productStatus').value;
            
            if (!productImage) {
                alert('Please select a product image!');
                return;
            }
            
            // Create product object
            const product = {
                id: Date.now().toString(),
                name: productName,
                category: productCategory,
                description: productDescription,
                status: productStatus,
                image: productImage.name,
                createdAt: new Date().toISOString()
            };
            
            // Save to localStorage
            saveProduct(product);
            
            // Save image locally (simplified - in production use server upload)
            saveProductImage(productImage, product.id);
            
            // Reset form
            addProductForm.reset();
            imagePreview.innerHTML = '<i class="fas fa-image"></i><span>No image selected</span>';
            
            // Show success message
            alert('Product added successfully!');
            
            // Switch to products tab
            switchTab('products');
        });
    }
    
    // Load initial data
    loadDashboardData();
    loadProducts();
    loadInquiries();
});

// Show/Hide Admin Panel
function showAdminPanel() {
    document.getElementById('passwordScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
}

function hideAdminPanel() {
    document.getElementById('passwordScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminPassword').value = '';
    document.getElementById('passwordError').textContent = '';
}

// Tab Functions
function switchTab(tabId) {
    // Update sidebar
    document.querySelectorAll('.sidebar-nav a').forEach(link => link.classList.remove('active'));
    document.querySelector(`.sidebar-nav a[data-tab="${tabId}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`${tabId}-tab`).classList.add('active');
    
    // Load content
    loadTabContent(tabId);
}

function loadTabContent(tabId) {
    switch(tabId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadProducts();
            break;
        case 'inquiries':
            loadInquiries();
            break;
        case 'settings':
            // Nothing special to load
            break;
    }
}

// Data Storage Functions
function saveProduct(product) {
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
}

function saveProductImage(imageFile, productId) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        localStorage.setItem(`product-image-${productId}`, imageData);
    };
    reader.readAsDataURL(imageFile);
}

function getProducts() {
    return JSON.parse(localStorage.getItem('products') || '[]');
}

function saveInquiry(inquiry) {
    let inquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
    inquiries.push(inquiry);
    localStorage.setItem('inquiries', JSON.stringify(inquiries));
}

function getInquiries() {
    return JSON.parse(localStorage.getItem('inquiries') || '[]');
}

// Load Data Functions
function loadDashboardData() {
    const products = getProducts();
    const inquiries = getInquiries();
    
    // Update counts
    document.getElementById('totalProductsCount').textContent = products.length;
    document.getElementById('totalInquiriesCount').textContent = inquiries.length;
    document.getElementById('pendingInquiriesCount').textContent = inquiries.filter(i => i.status === 'new').length;
    document.getElementById('completedInquiriesCount').textContent = inquiries.filter(i => i.status === 'completed').length;
    
    // Update badge
    document.getElementById('inquiryCount').textContent = inquiries.filter(i => i.status === 'new').length;
    
    // Load recent inquiries
    loadRecentInquiries();
}

function loadProducts() {
    const products = getProducts();
    const tableBody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    <i class="fas fa-box-open"></i>
                    <p>No products added yet</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    products.forEach(product => {
        const imageData = localStorage.getItem(`product-image-${product.id}`);
        const imageSrc = imageData || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
        
        html += `
            <tr>
                <td>
                    <img src="${imageSrc}" alt="${product.name}">
                </td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</td>
                <td>
                    <span class="status-badge ${product.status === 'active' ? 'status-completed' : 'status-cancelled'}">
                        ${product.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-small btn-secondary" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

function loadInquiries() {
    const inquiries = getInquiries();
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const filteredInquiries = statusFilter === 'all' 
        ? inquiries 
        : inquiries.filter(i => i.status === statusFilter);
    
    const inquiriesList = document.getElementById('inquiriesList');
    
    if (filteredInquiries.length === 0) {
        inquiriesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope"></i>
                <p>No inquiries received yet</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    filteredInquiries.forEach((inquiry, index) => {
        html += `
            <div class="inquiry-item ${inquiry.status === 'new' ? 'unread' : ''}">
                <div class="inquiry-header">
                    <div class="inquiry-product">${inquiry.productName}</div>
                    <div class="inquiry-date">${formatDate(inquiry.createdAt)}</div>
                </div>
                
                <div class="inquiry-customer">
                    <div class="customer-info">
                        <i class="fas fa-user"></i>
                        <span>${inquiry.name}</span>
                    </div>
                    <div class="customer-info">
                        <i class="fas fa-envelope"></i>
                        <span>${inquiry.email}</span>
                    </div>
                    <div class="customer-info">
                        <i class="fas fa-phone"></i>
                        <span>${inquiry.phone}</span>
                    </div>
                    <div class="customer-info">
                        <i class="fas fa-globe"></i>
                        <span>${inquiry.country}</span>
                    </div>
                </div>
                
                ${inquiry.quantity !== 'Not specified' ? `
                    <div class="customer-info">
                        <i class="fas fa-balance-scale"></i>
                        <span>Quantity: ${inquiry.quantity} ${inquiry.unit}</span>
                    </div>
                ` : ''}
                
                ${inquiry.message !== 'No additional requirements' ? `
                    <div class="inquiry-message">
                        <strong>Requirements:</strong> ${inquiry.message}
                    </div>
                ` : ''}
                
                <div class="inquiry-actions">
                    <select class="status-select" onchange="updateInquiryStatus(${index}, this.value)">
                        <option value="new" ${inquiry.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="contacted" ${inquiry.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="processing" ${inquiry.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="completed" ${inquiry.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${inquiry.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    <button class="btn btn-small btn-secondary" onclick="viewInquiry(${index})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="deleteInquiry(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    inquiriesList.innerHTML = html;
}

function loadRecentInquiries() {
    const inquiries = getInquiries().slice(0, 5); // Get first 5
    const recentInquiriesList = document.getElementById('recentInquiriesList');
    
    if (inquiries.length === 0) {
        recentInquiriesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope-open"></i>
                <p>No inquiries yet</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    inquiries.forEach(inquiry => {
        html += `
            <div class="inquiry-item ${inquiry.status === 'new' ? 'unread' : ''}" style="margin-bottom: 10px;">
                <div class="inquiry-header">
                    <div class="inquiry-product">${inquiry.productName}</div>
                    <div class="inquiry-date">${formatDate(inquiry.createdAt)}</div>
                </div>
                <div class="customer-info">
                    <i class="fas fa-user"></i>
                    <span>${inquiry.name} • ${inquiry.email}</span>
                </div>
                <div class="status-badge ${'status-' + inquiry.status}">
                    ${inquiry.status}
                </div>
            </div>
        `;
    });
    
    recentInquiriesList.innerHTML = html;
}

// Action Functions
function editProduct(productId) {
    alert('Edit feature will be added soon!');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = getProducts();
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
        loadDashboardData();
    }
}

function updateInquiryStatus(index, status) {
    let inquiries = getInquiries();
    if (inquiries[index]) {
        inquiries[index].status = status;
        localStorage.setItem('inquiries', JSON.stringify(inquiries));
        
        // Reload the specific inquiry item
        loadInquiries();
        loadDashboardData();
    }
}

function viewInquiry(index) {
    const inquiries = getInquiries();
    const inquiry = inquiries[index];
    
    if (inquiry) {
        alert(`
            Inquiry Details:
            
            Product: ${inquiry.productName}
            Name: ${inquiry.name}
            Email: ${inquiry.email}
            Phone: ${inquiry.phone}
            Company: ${inquiry.company}
            Country: ${inquiry.country}
            Quantity: ${inquiry.quantity} ${inquiry.unit}
            Message: ${inquiry.message}
            
            Status: ${inquiry.status}
            Received: ${formatDate(inquiry.createdAt)}
        `);
    }
}

function deleteInquiry(index) {
    if (confirm('Are you sure you want to delete this inquiry?')) {
        let inquiries = getInquiries();
        inquiries.splice(index, 1);
        localStorage.setItem('inquiries', JSON.stringify(inquiries));
        loadInquiries();
        loadDashboardData();
    }
}

function refreshInquiries() {
    loadInquiries();
}

function exportData() {
    const products = getProducts();
    const inquiries = getInquiries();
    
    const data = {
        products: products,
        inquiries: inquiries,
        exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `kailash-exim-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Data exported successfully!');
}

function showChangePassword() {
    document.getElementById('changePasswordModal').style.display = 'flex';
}

function hideChangePassword() {
    document.getElementById('changePasswordModal').style.display = 'none';
    document.getElementById('passwordChangeForm').reset();
}

// Password Change Form
const passwordChangeForm = document.getElementById('passwordChangeForm');
if (passwordChangeForm) {
    passwordChangeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (currentPassword !== ADMIN_PASSWORD) {
            alert('Current password is incorrect!');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters long!');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        
        // Note: In production, this would update the actual password
        // For this demo version, we'll just show a message
        alert('Password change feature requires server-side implementation. For now, you can change the password in the JavaScript code.');
        hideChangePassword();
    });
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}