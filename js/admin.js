// ===============================
// Admin Panel JS (PRO CRM – FINAL ALL FIXED + IMGBB SAFE PATCH)
// ===============================

let productsListener = null;
let inquiriesListener = null;
let editingProductId = null;

// pagination
let currentInquiryPage = 1;
const INQUIRIES_PER_PAGE = 3;
let filteredInquiries = [];
let allInquiries = [];
let existingImageUrl = null;


// 🔐 ImageBB API KEY (PASTE YOURS)
const IMGBB_API_KEY = "c2a57968ac9e3f5cf23caea37d08df2e";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80";

// elements
let productsTableBody;
let inquiriesList;
let totalProductsCount;
let totalInquiriesCount;
let inquiryCountBadge;

// ===============================
document.addEventListener("DOMContentLoaded", () => {
  productsTableBody = document.getElementById("productsTableBody");
  inquiriesList = document.getElementById("inquiriesList");
  totalProductsCount = document.getElementById("totalProductsCount");
  totalInquiriesCount = document.getElementById("totalInquiriesCount");
  inquiryCountBadge = document.getElementById("inquiryCount");

  setupPasswordProtection();
  setupTabNavigation();
  setupForms();
  setupImagePreview();

  document.getElementById("statusFilter")?.addEventListener("change", e => {
    const v = e.target.value;

    if (v === "all") filteredInquiries = [...allInquiries];
    else if (v === "pending") filteredInquiries = allInquiries.filter(q => q.status !== "completed");
    else if (v === "completed") filteredInquiries = allInquiries.filter(q => q.status === "completed");
    else if (v === "unread") filteredInquiries = allInquiries.filter(q => !q.read);

    currentInquiryPage = 1;
    renderPaginatedInquiries();
  });

  document.getElementById("searchInquiries")?.addEventListener("input", e => {
    const v = e.target.value.toLowerCase();
    filteredInquiries = allInquiries.filter(q =>
      q.name?.toLowerCase().includes(v) ||
      q.productName?.toLowerCase().includes(v) ||
      q.phone?.includes(v) ||
      q.message?.toLowerCase().includes(v)
    );
    currentInquiryPage = 1;
    renderPaginatedInquiries();
  });

  const hash = location.hash.replace("#", "");
  switchTab(hash || "dashboard");
});

// ===============================
function setupPasswordProtection() {
  loginBtn.onclick = () => {
    if (adminPassword.value === ADMIN_PASSWORD) {
      passwordScreen.style.display = "none";
      adminPanel.style.display = "block";
      loadProducts();
      loadInquiries();
    } else {
      passwordError.textContent = "❌ Incorrect password";
    }
  };
}

// ===============================
function setupTabNavigation() {
  document.querySelectorAll(".sidebar-nav a").forEach(link => {
    link.onclick = e => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    };
  });
}

function switchTab(tab) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.getElementById(tab + "-tab")?.classList.add("active");
  setActiveNav(tab);
  location.hash = tab;
}

// ===============================
function setupImagePreview() {
  productImage?.addEventListener("change", () => {
    const reader = new FileReader();
    reader.onload = e => imagePreview.innerHTML = `<img src="${e.target.result}">`;
    reader.readAsDataURL(productImage.files[0]);
  });
}

function setupForms() {
  addProductForm?.addEventListener("submit", async e => {
    e.preventDefault();
    await handleSaveProduct(addProductForm);
  });
}

// ===============================
// 🔥 ADDED: ImageBB Upload (NO LOGIC BREAK)
// ===============================
async function uploadImageToImageBB(file) {
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: fd
  });

  const json = await res.json();
  if (!json.success) throw new Error("ImageBB upload failed");

  return json.data.url;
}

// ===============================
// PRODUCT SAVE (ONLY IMAGE PART FIXED)
// ===============================
async function handleSaveProduct(form) {
  const name = form.productName.value.trim();
  const category = form.productCategory.value.trim();
  const status = form.productStatus.value;

  const fileInput =
    form.productImage ||
    document.getElementById("productImage");

  const file = fileInput?.files?.[0];

  if (!name || !category) {
    alert("Please fill all required fields");
    return;
  }

  let image = existingImageUrl || DEFAULT_IMAGE;

  if (file) {
    image = await uploadImageToImageBB(file);
  }

const data = {
  id: editingProductId || null,        // ✅ keep id
  name,
  category,
  description: form.productDescription?.value.trim() || "",
  specs: form.productSpecs?.value
    ? form.productSpecs.value.split(",").map(s => s.trim())
    : [],
  status,
  image,
  createdAt: editingProductId
    ? firebase.firestore.FieldValue.serverTimestamp()
    : firebase.firestore.FieldValue.serverTimestamp(),
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
};


  const ref = firebase.firestore().collection("products");

if (editingProductId) {
  await ref.doc(editingProductId).update(data);
  editingProductId = null;
} else {
  data.id = ref.doc().id; // ✅ auto store doc id
  await ref.doc(data.id).set(data);
}


  form.reset();
  imagePreview.innerHTML = "";
  existingImageUrl = null; // ✅ reset
  switchTab("products");
}

// ===============================
// PRODUCTS
// ===============================
function loadProducts() {
  if (productsListener) productsListener();

  productsListener = firebase.firestore().collection("products")
    .onSnapshot(snap => {
      let html = "";
      snap.forEach(doc => {
        const p = doc.data();
        html += `
          <tr>
            <td><img src="${p.image || DEFAULT_IMAGE}" width="60"></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td><span class="status ${p.status}">${p.status}</span></td>
            <td>
              <button onclick="editProduct('${doc.id}')">✏️</button>
              <button onclick="deleteProduct('${doc.id}')">🗑</button>
            </td>
          </tr>`;
      });

      productsTableBody.innerHTML = html || `<tr><td colspan="5">No products</td></tr>`;
      totalProductsCount.textContent = snap.size;
    });
}

// ===============================
async function editProduct(id) {
  const doc = await firebase.firestore().collection("products").doc(id).get();
  if (!doc.exists) return;

  const p = doc.data();
  editingProductId = id;
  existingImageUrl = p.image || DEFAULT_IMAGE; // ✅ IMPORTANT

  addProductForm.productName.value = p.name;
  addProductForm.productCategory.value = p.category;
  addProductForm.productStatus.value = p.status;

  imagePreview.innerHTML = `<img src="${existingImageUrl}">`;

  switchTab("add-product");

}


// ===============================
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  await firebase.firestore().collection("products").doc(id).delete();
}

// ===============================
// INQUIRIES (CRM)
// ===============================
function loadInquiries() {
  if (inquiriesListener) inquiriesListener();

  inquiriesListener = firebase.firestore()
    .collection("inquiries")
    .orderBy("createdAt", "desc")
    .onSnapshot(snap => {
      allInquiries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      filteredInquiries = [...allInquiries];
      currentInquiryPage = 1;

      renderPaginatedInquiries();
      updateDashboard(allInquiries);
      renderRecentInquiries(allInquiries);
    });
}


// ===============================
function renderPaginatedInquiries() {
  const start = (currentInquiryPage - 1) * INQUIRIES_PER_PAGE;
  const end = start + INQUIRIES_PER_PAGE;
  renderInquiries(filteredInquiries.slice(start, end));
  renderPaginationControls();
}

// ===============================
function renderInquiries(data) {
  let html = "";
  let pending = 0;

  data.forEach(q => {
    if (q.status !== "completed") pending++;

    const phone = q.phone?.replace(/\D/g, "");
    const wpMsg = encodeURIComponent(`Hello ${q.name}, regarding ${q.productName}`);

    html += `
      <div class="inquiry-item ${q.read ? "" : "unread"}">
        <div class="inquiry-header">
          <div class="inquiry-meta">
            <h4>${q.productName}</h4>
            <div class="inquiry-date">${q.createdAt?.toDate().toLocaleString()}</div>
          </div>
          <div class="inquiry-actions">
            ${q.status !== "completed" ? `
              <button class="btn btn-small btn-secondary" onclick="markAsRead('${q.id}')">Mark Read</button>
              <button class="btn btn-small btn-primary" onclick="markCompleted('${q.id}')">Completed</button>
            ` : `<span class="status completed">Completed</span>`}
            <a class="btn btn-small btn-secondary" target="_blank"
               href="https://wa.me/${phone}?text=${wpMsg}">WhatsApp</a>
          </div>
        </div>
        <div class="inquiry-body">
          <p><strong>Name:</strong> ${q.name}</p>
          <p><strong>Phone:</strong> ${q.phone}</p>
          <p><strong>Qty:</strong> ${q.qty}</p>
          <p><strong>Message:</strong> ${q.message || "-"}</p>
        </div>
      </div>`;
  });

  inquiriesList.innerHTML = html || `<div class="empty-state">No inquiries</div>`;
  totalInquiriesCount.textContent = filteredInquiries.length;
  inquiryCountBadge.textContent = pending;
}

// ===============================
function renderPaginationControls() {
  const totalPages = Math.ceil(filteredInquiries.length / INQUIRIES_PER_PAGE);
  if (totalPages <= 1) return;

  inquiriesList.insertAdjacentHTML("beforeend", `
    <div class="pagination">
      <button ${currentInquiryPage === 1 ? "disabled" : ""} onclick="prevInquiryPage()">Prev</button>
      <span>Page ${currentInquiryPage} / ${totalPages}</span>
      <button ${currentInquiryPage === totalPages ? "disabled" : ""} onclick="nextInquiryPage()">Next</button>
    </div>
  `);
}

function nextInquiryPage() {
  currentInquiryPage++;
  renderPaginatedInquiries();
}
function prevInquiryPage() {
  currentInquiryPage--;
  renderPaginatedInquiries();
}

// ===============================
function markAsRead(id) {
  firebase.firestore().collection("inquiries").doc(id).update({
    read: true,
    status: "pending"
  });
}

function markCompleted(id) {
  firebase.firestore().collection("inquiries").doc(id).update({
    status: "completed",
    read: true,
    completedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// ===============================
function updateDashboard(data) {
  document.getElementById("totalInquiriesCount").innerText = data.length;
  document.getElementById("pendingInquiriesCount").innerText =
    data.filter(q => q.status !== "completed").length;
  document.getElementById("completedInquiriesCount").innerText =
    data.filter(q => q.status === "completed").length;
}

// ===============================
function renderRecentInquiries(data) {
  const list = document.getElementById("recentInquiriesList");

  const recent = data.filter(q => !q.read && q.status !== "completed").slice(0, 3);

  if (!recent.length) {
    list.innerHTML = `<div class="empty-state"><p>No pending inquiries 🎉</p></div>`;
    return;
  }

  list.innerHTML = recent.map(q => `
    <div class="recent-item" onclick="switchTab('inquiries')">
      <div class="recent-info">
        <h4>${q.productName}</h4>
        <p>${q.name} • ${q.phone}</p>
        <span class="recent-date">${q.createdAt?.toDate().toLocaleString()}</span>
      </div>
      <div class="recent-status">
        <span class="status ${q.status || "new"}">${q.status || "new"}</span>
      </div>
    </div>
  `).join("");
}

// ===============================
function setActiveNav(tab) {
  document.querySelectorAll(".sidebar-nav a").forEach(a => a.classList.remove("active"));
  document.querySelector(`.sidebar-nav a[data-tab="${tab}"]`)?.classList.add("active");
}

// ===============================
function openInquiryFilter(type) {
  switchTab("inquiries");
  const select = document.getElementById("statusFilter");

  if (type === "pending") {
    select.value = "pending";
    filteredInquiries = allInquiries.filter(q => q.status !== "completed");
  } else {
    select.value = "completed";
    filteredInquiries = allInquiries.filter(q => q.status === "completed");
  }

  currentInquiryPage = 1;
  renderPaginatedInquiries();
}
// ===============================
// MAKE FUNCTIONS GLOBAL (INLINE HTML FIX)
// ===============================
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.switchTab = switchTab;
