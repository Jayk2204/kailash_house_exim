// ===============================
// Admin Panel JS (FINAL – EDIT + DELETE IMAGE)
// ===============================

let productsListener = null;
let inquiriesListener = null;
let editingProductId = null;
let oldDeleteUrl = null;

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80";

// IMGBB
const IMGBB_API_KEY = "c2a57968ac9e3f5cf23caea37d08df2e";
const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

// ===============================
document.addEventListener("DOMContentLoaded", () => {
  setupPasswordProtection();
  setupTabNavigation();
  setupForms();
  setupImagePreview();
});

// ===============================
function setupPasswordProtection() {
  loginBtn.onclick = () => {
    if (adminPassword.value === ADMIN_PASSWORD) {
      passwordScreen.style.display = "none";
      adminPanel.style.display = "block";
      initializeAdminData();
    } else {
      passwordError.textContent = "❌ Incorrect password";
    }
  };
}

function initializeAdminData() {
  loadProducts();
  loadInquiries();
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

  if (tab === "products") loadProducts();
  if (tab === "inquiries") loadInquiries();
}

// ===============================
function setupImagePreview() {
  productImage?.addEventListener("change", () => {
    const file = productImage.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => imagePreview.innerHTML = `<img src="${e.target.result}">`;
    reader.readAsDataURL(file);
  });
}

// ===============================
function setupForms() {
  addProductForm?.addEventListener("submit", async e => {
    e.preventDefault();
    await handleSaveProduct(addProductForm);
  });
}

// ===============================
// IMGBB UPLOAD
// ===============================
async function uploadToIMGBB(file) {
  const base64 = await fileToBase64(file);

  const fd = new FormData();
  fd.append("key", IMGBB_API_KEY);
  fd.append("image", base64.split(",")[1]);

  const res = await fetch(IMGBB_UPLOAD_URL, { method: "POST", body: fd });
  const data = await res.json();

  if (!data.success) throw new Error("Image upload failed");

  return {
    url: data.data.url,
    delete_url: data.data.delete_url
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===============================
// ADD / EDIT PRODUCT (ONE FUNCTION)
// ===============================
async function handleSaveProduct(form) {
  const btn = form.querySelector("button[type='submit']");
  btn.disabled = true;
  btn.innerText = editingProductId ? "Updating..." : "Saving...";

  try {
    let imageUrl = DEFAULT_IMAGE;
    let deleteUrl = null;

    if (productImage.files[0]) {
      const upload = await uploadToIMGBB(productImage.files[0]);
      imageUrl = upload.url;
      deleteUrl = upload.delete_url;

      // 🔥 delete old image if editing
      if (oldDeleteUrl) {
        fetch(oldDeleteUrl).catch(() => {});
      }
    }

    const data = {
      name: productName.value,
      category: productCategory.value,
      description: productDescription.value,
      image: imageUrl,
      delete_url: deleteUrl,
      specs: productSpecs.value.split(",").map(s => s.trim()).filter(Boolean),
      status: productStatus.value,
      updatedAt: new Date()
    };

    const ref = firebase.firestore().collection("products");

    if (editingProductId) {
      await ref.doc(editingProductId).update(data);
      alert("✅ Product updated");
    } else {
      const id = Date.now().toString();
      await ref.doc(id).set({ ...data, id, createdAt: new Date() });
      alert("✅ Product added");
    }

    form.reset();
    editingProductId = null;
    oldDeleteUrl = null;
    imagePreview.innerHTML = "<i class='fas fa-image'></i><span>No image</span>";
    switchTab("products");

  } catch (e) {
    alert("❌ " + e.message);
  } finally {
    btn.disabled = false;
    btn.innerText = "Save Product";
  }
}

// ===============================
// LOAD PRODUCTS
// ===============================
function loadProducts() {
  const tbody = productsTableBody;
  if (productsListener) productsListener();

  productsListener = firebase.firestore().collection("products")
    .onSnapshot(snap => {
      let html = "";
      snap.forEach(doc => {
        const p = doc.data();
        html += `
        <tr>
          <td><img src="${p.image || DEFAULT_IMAGE}" width="60" height="60"></td>
          <td>${p.name}</td>
          <td>${p.category}</td>
          <td>${p.description}</td>
          <td>${p.status}</td>
          <td>
            <button onclick="editProduct('${doc.id}')">✏️</button>
            <button onclick="deleteProduct('${doc.id}')">🗑</button>
          </td>
        </tr>`;
      });
      tbody.innerHTML = html || `<tr><td colspan="6">No products</td></tr>`;
      totalProductsCount.textContent = snap.size;
    });
}

// ===============================
// EDIT PRODUCT
// ===============================
async function editProduct(id) {
  const doc = await firebase.firestore().collection("products").doc(id).get();
  const p = doc.data();

  editingProductId = id;
  oldDeleteUrl = p.delete_url || null;

  productName.value = p.name;
  productCategory.value = p.category;
  productDescription.value = p.description;
  productSpecs.value = (p.specs || []).join(", ");
  productStatus.value = p.status;

  imagePreview.innerHTML = `<img src="${p.image}">`;

  switchTab("add-product");
}

// ===============================
// DELETE PRODUCT + DELETE IMAGE
// ===============================
async function deleteProduct(id) {
  if (!confirm("Delete product?")) return;

  const ref = firebase.firestore().collection("products").doc(id);
  const snap = await ref.get();
  const p = snap.data();

  if (p?.delete_url) {
    fetch(p.delete_url).catch(() => {});
  }

  await ref.delete();
  alert("Deleted");
}

// ===============================
function loadInquiries() {
  if (inquiriesListener) inquiriesListener();

  inquiriesListener = firebase.firestore().collection("inquiries")
    .onSnapshot(() => {});
}
