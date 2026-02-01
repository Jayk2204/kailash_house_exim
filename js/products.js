const db = firebase.firestore();

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 6;

/* ================= MODAL ================= */
window.openInquiryModal = function(id, name){
  const modal = document.getElementById("inquiryModal");
  modal.style.display = "flex";
  document.body.classList.add("modal-open");

  inqProductId.value = id;
  inqProductName.value = name;
  inquiryProductTitle.innerText = "Inquiry for " + name;
}

window.closeInquiryModal = function(){
  document.getElementById("inquiryModal").style.display = "none";
  document.body.classList.remove("modal-open");
  inquiryForm.reset();
}

document.getElementById("inquiryModal")?.addEventListener("click", e=>{
  if(e.target.id === "inquiryModal") closeInquiryModal();
});

/* ================= FETCH ================= */
function fetchProducts(){
  db.collection("products")
    .onSnapshot(snapshot=>{
      allProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      filteredProducts = allProducts.filter(p => p.status === "active");
      currentPage = 1;
      renderProducts();
    });
}

/* ================= RENDER ================= */
function renderProducts(){
  const grid = document.getElementById("all-products-grid");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if(!grid) return;

  const start = (currentPage-1)*productsPerPage;
  const end = start + productsPerPage;
  const items = filteredProducts.slice(start,end);

  if(currentPage===1) grid.innerHTML="";

  items.forEach(p=>{
    const card = document.createElement("div");
    card.className="product-card";

    const specs = (p.specs||[]).map(s=>`<span class="product-spec">${s}</span>`).join("");

    card.innerHTML=`
      <div class="product-img">
        <img src="${p.image?.url||p.image}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'">
        <div class="product-category">${p.category.toUpperCase()}</div>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="product-specs">${specs}</div>
        <div class="product-cta">
          <button class="btn btn-primary btn-small" onclick="openInquiryModal('${p.id}','${p.name}')">
            Inquiry
          </button>
          <a class="btn btn-secondary btn-small"
             href="https://wa.me/8780565907?text=Inquiry%20for%20${encodeURIComponent(p.name)}">
             WhatsApp
          </a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  loadMoreBtn.style.display = end >= filteredProducts.length ? "none" : "inline-flex";
}

/* ================= FILTER ================= */
document.querySelectorAll(".filter-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");

    const f = btn.dataset.filter;
    filteredProducts = f==="all" ? [...allProducts] : allProducts.filter(p=>p.category===f);

    currentPage=1;
    renderProducts();
  });
});

/* ================= SEARCH ================= */
productSearch?.addEventListener("input",e=>{
  const t = e.target.value.toLowerCase();
  filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(t) ||
    p.description.toLowerCase().includes(t) ||
    p.category.toLowerCase().includes(t)
  );
  currentPage=1;
  renderProducts();
});

/* ================= LOAD MORE ================= */
loadMoreBtn?.addEventListener("click",()=>{
  currentPage++;
  renderProducts();
});

/* ================= SUBMIT ================= */
inquiryForm?.addEventListener("submit", async e=>{
  e.preventDefault();
  try{
    await db.collection("inquiries").add({
      productId: inqProductId.value,
      productName: inqProductName.value,
      name: inqName.value,
      phone: inqPhone.value,
      qty: inqQty.value,
      message: inqMessage.value,
      status:"new",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Inquiry Sent ✅");
    closeInquiryModal();
  }catch(err){
    console.error(err);
    alert("Failed ❌");
  }
});

/* ================= INIT ================= */
fetchProducts();
