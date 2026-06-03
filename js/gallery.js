// ============================================================
// SULEKH CONVENT SCHOOL - Gallery JS
// File: js/gallery.js
// ============================================================

let allPhotos = [];
let lbIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Check URL param for category filter
  const urlParams = new URLSearchParams(window.location.search);
  const cat = urlParams.get("cat") || "all";
  const activeBtn = document.querySelector(`.filter-btn[data-cat="${cat}"]`);
  if (activeBtn) {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    activeBtn.classList.add("active");
  }
  loadGallery(cat);
  initFilters();
});

async function loadGallery(category = "all") {
  try {
    const result = await apiGet("getGallery", category !== "all" ? { category } : {});
    if (result.success && result.data.length) {
      allPhotos = result.data;
      renderGallery(allPhotos);
    } else {
      renderDefaultGallery();
    }
  } catch (e) {
    renderDefaultGallery();
  }
}

function renderGallery(photos) {
  const grid = document.getElementById("galleryGrid");
  if (!photos.length) {
    grid.innerHTML = `<div class="no-photos"><i class="fas fa-image"></i><p>Is category mein koi photo nahi hai.</p></div>`;
    return;
  }

  grid.innerHTML = photos.map((p, i) => `
    <div class="gallery-item" onclick="openLightbox(${i})">
      <img src="${p.ImageURL}" alt="${sanitize(p.Caption || '')}"
           loading="lazy"
           onerror="this.src='https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=60'" />
      <div class="gallery-item-overlay">
        <div class="gi-category">${sanitize(p.Category || '')}</div>
        <div class="gi-caption">${sanitize(p.Caption || '')}</div>
      </div>
      <div class="gi-zoom"><i class="fas fa-expand"></i></div>
      ${isAdmin() ? `<button class="gi-delete" onclick="event.stopPropagation();deleteItem('deleteGallery','${p.ID}',() => loadGallery())"><i class="fas fa-trash"></i></button>` : ''}
    </div>
  `).join('');
}

function renderDefaultGallery() {
  const imgs = [
    { ImageURL: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=70", Caption: "School Building", Category: "Infrastructure" },
    { ImageURL: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=70", Caption: "Annual Day Celebration", Category: "Annual Day" },
    { ImageURL: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=70", Caption: "Science Lab", Category: "Academics" },
    { ImageURL: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=70", Caption: "Sports Day", Category: "Sports" },
    { ImageURL: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&q=70", Caption: "Cultural Event", Category: "Events" },
    { ImageURL: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=70", Caption: "Prize Distribution", Category: "Events" },
    { ImageURL: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=70", Caption: "School Library", Category: "Infrastructure" },
    { ImageURL: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=70", Caption: "Computer Lab", Category: "Academics" },
  ];
  allPhotos = imgs.map((p, i) => ({ ...p, ID: "default_" + i }));
  renderGallery(allPhotos);
}

function initFilters() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.cat;
      if (cat === "all") {
        renderGallery(allPhotos);
      } else {
        renderGallery(allPhotos.filter(p => p.Category === cat));
      }
    });
  });
}

// Lightbox
function openLightbox(index) {
  lbIndex = index;
  const photo = allPhotos[lbIndex];
  document.getElementById("lbImg").src = photo.ImageURL;
  document.getElementById("lbCaption").textContent = photo.Caption || photo.Category || "";
  document.getElementById("lightbox").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
  document.body.style.overflow = "";
}

function lightboxNav(dir) {
  lbIndex = (lbIndex + dir + allPhotos.length) % allPhotos.length;
  openLightbox(lbIndex);
}

// Close on ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") lightboxNav(-1);
  if (e.key === "ArrowRight") lightboxNav(1);
});

// Close lightbox on overlay click
document.getElementById("lightbox").addEventListener("click", (e) => {
  if (e.target === document.getElementById("lightbox")) closeLightbox();
});

// Admin: Add photo
function openAddPhotoModal() {
  openModal("Add Photo to Gallery", `
    <div id="photoForm">
      <div class="form-group"><label>Image URL *</label><input type="url" name="ImageURL" placeholder="https://..." /></div>
      <div class="form-group"><label>Caption</label><input type="text" name="Caption" placeholder="Photo ka description..." /></div>
      <div class="form-group"><label>Category</label>
        <select name="Category">
          <option>Events</option><option>Sports</option><option>Annual Day</option>
          <option>Infrastructure</option><option>Academics</option><option>Other</option>
        </select>
      </div>
      <div class="form-group"><label>Date</label><input type="date" name="Date" value="${new Date().toISOString().split('T')[0]}" /></div>
      <p style="font-size:0.8rem;color:var(--text-light);margin-top:8px;">
        <i class="fas fa-info-circle"></i> Google Drive image URL use karne ke liye: Share > Copy link > Replace "/view" with "/ux/view"
      </p>
    </div>
  `, async () => {
    const data = getFormData("photoForm");
    if (!data.ImageURL) { showToast("Image URL zaroori hai!", "error"); return; }
    const result = await apiPost("addGallery", { data });
    if (result.success) {
      showToast("Photo add ho gayi!", "success");
      closeModal();
      loadGallery();
    } else showToast(result.message, "error");
  });
}
