// Product Data with Categories
const products = [
    {
        id: 1,
        name: "Makhana Nuts",
        image: "images/makhana.png",
        description: "Premium quality fox nuts, rich in protein and antioxidants. Carefully processed to retain natural nutrition.",
        category: "nuts",
        specs: ["Export Grade A", "Clean & Uniform", "Rich in Protein", "Antioxidant Rich"]
    },
    {
        id: 2,
        name: "Ashwagandha Powder",
        image: "images/Ashwagandha.png",
        description: "Pure, potent ashwagandha powder with high withanolide content. Sourced from organic farms.",
        category: "powders",
        specs: ["High Withanolide", "Organic Certified", "Fine Grinding", "Pure Extract"]
    },
    {
        id: 3,
        name: "Moringa Powder",
        image: "images/Moringa.png",
        description: "Nutrient-rich moringa leaf powder, packed with vitamins and minerals. 100% natural and pure.",
        category: "powders",
        specs: ["Rich in Vitamins", "High Protein", "Antioxidant", "No Additives"]
    },
    {
        id: 4,
        name: "Onion Powder",
        image: "images/onion.png",
        description: "Dehydrated onion powder with strong flavor and aroma. Perfect for culinary and industrial use.",
        category: "spices",
        specs: ["Strong Aroma", "Consistent Flavor", "Hygienic Processing", "Long Shelf Life"]
    },
    {
        id: 5,
        name: "Cashew Nuts",
        image: "images/Cashew.png",
        description: "Premium quality cashew nuts, rich in healthy fats and minerals. Available in various grades.",
        category: "nuts",
        specs: ["Premium Grade", "Rich in Minerals", "Natural Oil", "Various Sizes"]
    },
    {
        id: 6,
        name: "Finger Turmeric",
        image: "images/Finger-Turmeric.jpg",
        description: "Whole finger turmeric with high curcumin content. Sourced from traditional turmeric-growing regions.",
        category: "spices",
        specs: ["High Curcumin", "Traditional Sourcing", "Whole Fingers", "Medicinal Grade"]
    },
    {
        id: 7,
        name: "Turmeric Powder",
        image: "images/turemicpowder.png",
        description: "Finely ground turmeric powder with vibrant color and aroma. Rich in curcuminoids.",
        category: "spices",
        specs: ["Vibrant Color", "Rich Aroma", "High Curcuminoids", "Fine Grinding"]
    },
    {
        id: 8,
        name: "Chilli Powder",
        image: "images/Chilli-Powder.png",
        description: "Spicy red chilli powder with consistent heat level. Available in different spice levels.",
        category: "spices",
        specs: ["Consistent Heat", "Vibrant Red", "Different Grades", "Pure Grinding"]
    },
    {
        id: 9,
        name: "Coriander Powder",
        image: "images/Coriander-Powder.png",
        description: "Aromatic coriander powder perfect for culinary uses. Made from high-quality coriander seeds.",
        category: "spices",
        specs: ["Strong Aroma", "Fine Texture", "Pure Grinding", "Fresh Seeds"]
    },
    {
        id: 10,
        name: "Ground Cumin Powder",
        image: "images/Ground-Cumin-Powder.png",
        description: "Freshly ground cumin powder with distinctive earthy flavor. Perfect for Indian and Middle Eastern cuisine.",
        category: "spices",
        specs: ["Earthy Flavor", "Fresh Grinding", "Pure Quality", "No Additives"]
    },
    {
        id: 11,
        name: "Garlic Powder",
        image: "images/Garlic-Powder.png",
        description: "Dehydrated garlic powder with strong flavor and long shelf life. Hygienically processed.",
        category: "spices",
        specs: ["Strong Flavor", "Long Shelf Life", "Hygienic", "No Preservatives"]
    },
    {
        id: 12,
        name: "Ginger Powder",
        image: "images/Ginger-Powder.png",
        description: "Pure ginger powder with pungent aroma and health benefits. Rich in gingerol and antioxidants.",
        category: "spices",
        specs: ["Pungent Aroma", "Rich in Gingerol", "Pure Grinding", "Health Benefits"]
    }
];

// Product Display with Pagination
let currentPage = 1;
const productsPerPage = 6;
let filteredProducts = [...products];

function loadProducts(page = 1) {
    const productsGrid = document.getElementById('all-products-grid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!productsGrid) return;
    
    // Calculate start and end index
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    // Clear grid if it's first page
    if (page === 1) {
        productsGrid.innerHTML = '';
    }
    
    // Add products to grid
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.category = product.category;
        
        const specsHTML = product.specs.map(spec => 
            `<span class="product-spec">${spec}</span>`
        ).join('');
        
        productCard.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
                <div class="product-category">${product.category.toUpperCase()}</div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-specs">
                    ${specsHTML}
                </div>
                <div class="product-cta">
                    <a href="index.html#contact" class="btn btn-primary btn-small">
                        <span>Inquire Now</span>
                        <i class="fas fa-envelope"></i>
                    </a>
                    <a href="https://wa.me/8780565907?text=Inquiry%20for%20${encodeURIComponent(product.name)}" class="btn btn-secondary btn-small">
                        <span>WhatsApp</span>
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Show/Hide Load More button
    if (loadMoreBtn) {
        if (endIndex >= filteredProducts.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
    }
}

// Filter Products by Category
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('productSearch');
    
    // Category Filter
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter products
            const filter = button.dataset.filter;
            if (filter === 'all') {
                filteredProducts = [...products];
            } else {
                filteredProducts = products.filter(product => product.category === filter);
            }
            
            // Reset pagination and reload
            currentPage = 1;
            loadProducts();
        });
    });
    
    // Search Filter
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length > 2) {
                filteredProducts = products.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm)
                );
            } else {
                filteredProducts = [...products];
            }
            
            // Reset pagination and reload
            currentPage = 1;
            loadProducts();
        });
    }
}

// Category Cards Click
function setupCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            
            // Update active filter button
            filterButtons.forEach(btn => {
                if (btn.dataset.filter === category) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Filter products
            filteredProducts = products.filter(product => product.category === category);
            
            // Reset pagination and reload
            currentPage = 1;
            loadProducts();
            
            // Scroll to products
            document.querySelector('.all-products').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Load More Button
const loadMoreBtn = document.getElementById('loadMoreBtn');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
        currentPage++;
        loadProducts(currentPage);
        
        // Scroll to newly loaded products
        const productsGrid = document.getElementById('all-products-grid');
        if (productsGrid && productsGrid.children.length > productsPerPage) {
            const lastProduct = productsGrid.children[productsGrid.children.length - productsPerPage];
            lastProduct.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}

// Initialize products page
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupFilterButtons();
    setupCategoryCards();
    
    // Add styles for product specs
    const style = document.createElement('style');
    style.textContent = `
        .product-category {
            position: absolute;
            top: 15px;
            right: 15px;
            background: var(--primary);
            color: var(--text-light);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .product-specs {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 1rem 0;
        }
        
        .product-spec {
            background: rgba(26, 95, 35, 0.1);
            color: var(--primary);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .product-cta {
            display: flex;
            gap: 10px;
            margin-top: 1rem;
        }
        
        .btn-small {
            padding: 8px 16px;
            font-size: 0.9rem;
            flex: 1;
        }
        
        .btn-small i {
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
});