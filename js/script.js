// Mobile Navigation Toggle
const hamburger = document.querySelector('.mobile-toggle');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Product Data for Homepage
const featuredProducts = [
    {
        id: 1,
        name: "Makhana Nuts",
        image: "images/makhana.png",
        description: "Premium quality fox nuts, rich in protein and antioxidants. Carefully processed to retain natural nutrition.",
        price: "Export Grade"
    },
    {
        id: 2,
        name: "Ashwagandha Powder",
        image: "images/Ashwagandha.png",
        description: "Pure, potent ashwagandha powder with high withanolide content. Sourced from organic farms.",
        price: "Medicinal Grade"
    },
    {
        id: 3,
        name: "Cashew Nuts",
        image: "images/Cashew.png",
        description: "Premium quality cashew nuts, rich in healthy fats and minerals. Available in various grades.",
        price: "Premium Grade"
    }
];

// Load Featured Products on Homepage
function loadFeaturedProducts() {
    const featuredProductsGrid = document.getElementById('featured-products');
    
    if (featuredProductsGrid) {
        featuredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <div class="product-img">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">${product.price}</div>
                    <div class="product-cta">
                        <a href="products.html" class="btn btn-primary btn-small">
                            <span>View Details</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
            
            featuredProductsGrid.appendChild(productCard);
        });
    }
}

// Form Submission
const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
    quoteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const product = this.querySelector('select').value;
        
        // Show success message
        alert(`Thank you ${name}! Your export inquiry for ${product} has been received. Our export team will contact you at ${email} within 24 hours.`);
        
        // Reset form
        this.reset();
    });
}

// Back to Top Button
const backToTopBtn = document.querySelector('.back-to-top');

if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedProducts();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.background = 'rgba(18, 18, 18, 0.98)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = 'rgba(18, 18, 18, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            }
        }
    });
});

// ===============================
// Navbar Active Link Fix (NO HTML SCRIPT)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-menu a");

  if (!navLinks.length) return;

  let currentPage = window.location.pathname.split("/").pop();

  // default page
  if (currentPage === "") currentPage = "index.html";

  navLinks.forEach(link => {
    const linkPage = link.getAttribute("href");

    // remove old active
    link.classList.remove("active");

    // exact match
    if (linkPage === currentPage) {
      link.classList.add("active");
    }

    // homepage special case
    if (currentPage === "index.html" && linkPage === "index.html") {
      link.classList.add("active");
    }
  });
});
// ===============================
// FIX: Cross-page anchor navigation
// products.html → index.html#section
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = location.pathname.split("/").pop();

  document.querySelectorAll('.nav-menu a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();

      const target = link.getAttribute("href"); // #about etc

      if (currentPage !== "index.html" && currentPage !== "") {
        // we are on products.html
        window.location.href = "index.html" + target;
      } else {
        // already on index
        const el = document.querySelector(target);
        if (el) {
          window.scrollTo({
            top: el.offsetTop - 100,
            behavior: "smooth"
          });
        }
      }
    });
  });
});
// ===============================
// Active nav fix
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname.split("/").pop();

  document.querySelectorAll(".nav-menu a").forEach(a => {
    a.classList.remove("active");

    if (
      (path === "" || path === "index.html") && a.getAttribute("href") === "index.html"
    ) {
      a.classList.add("active");
    }

    if (path === "products.html" && a.getAttribute("href") === "products.html") {
      a.classList.add("active");
    }
  });
});
// ===============================
// Secret admin shortcut
// ===============================
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
    window.location.href = "admin-panel.html";
  }
});
