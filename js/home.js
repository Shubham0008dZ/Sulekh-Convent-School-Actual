// ============================================================
// SULEKH CONVENT SCHOOL - Home Page JavaScript
// File: js/home.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  loadSliders();
  loadHomeNotices();
  loadGalleryPreview();
  loadAchievements();
  initCounters();
  initScrollReveal();
  document.getElementById("admissionYear").textContent = new Date().getFullYear() + "–" + (new Date().getFullYear() + 1).toString().slice(-2);
});

// ============================================================
// HERO SLIDER
// ============================================================
let currentSlide = 0;
let slides = [];
let autoSlideTimer;

async function loadSliders() {
  try {
    const result = await apiGet("getSliders");
    if (result.success && result.data.length > 0) {
      slides = result.data;
      renderSliders(slides);
    } else {
      // Default slide already in HTML
      slides = [{ ID: "default" }];
      initSliderControls();
    }
  } catch (e) {
    slides = [{ ID: "default" }];
    initSliderControls();
  }
}

function renderSliders(data) {
  const container = document.getElementById("heroSlides");
  container.innerHTML = "";

  data.forEach((slide, i) => {
    const div = document.createElement("div");
    div.className = "hero-slide" + (i === 0 ? " active" : "");
    div.style.backgroundImage = slide.ImageURL ? `url('${slide.ImageURL}')` : "linear-gradient(135deg, #0d1f3c, #1a3a6b)";
    div.innerHTML = `
      <div class="hero-overlay"></div>
      <div class="hero-content container">
        <div class="hero-badge">Welcome to</div>
        <h1 class="hero-title">${sanitize(slide.Title || "Sulekh Convent School")}</h1>
        <p class="hero-sub">${sanitize(slide.Subtitle || "Shaping Future Leaders")}</p>
        <div class="hero-btns">
          <a href="${slide.ButtonLink || 'admissions.html'}" class="btn btn-gold">
            <i class="fas fa-graduation-cap"></i> ${sanitize(slide.ButtonText || "Apply for Admission")}
          </a>
          <a href="about.html" class="btn btn-outline" style="border-color:rgba(255,255,255,0.5);color:#fff;">
            Learn More <i class="fas fa-arrow-right"></i>
          </a>
        </div>
        ${isAdmin() ? `
        <div class="admin-actions" style="position:absolute;bottom:20px;right:20px;">
          <button class="btn-edit-item" onclick="openEditSliderModal('${slide.ID}', ${JSON.stringify(slide).replace(/"/g, '&quot;')})">
            <i class="fas fa-edit"></i> Edit Slide
          </button>
          <button class="btn-delete-item" onclick="deleteItem('deleteSlider', '${slide.ID}', loadSliders)">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>` : ""}
      </div>
    `;
    container.appendChild(div);
  });

  initSliderControls();
}

function initSliderControls() {
  const allSlides = document.querySelectorAll(".hero-slide");
  const dotsContainer = document.getElementById("sliderDots");
  dotsContainer.innerHTML = "";

  allSlides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "slider-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  document.getElementById("sliderPrev").addEventListener("click", () => {
    goToSlide((currentSlide - 1 + allSlides.length) % allSlides.length);
  });
  document.getElementById("sliderNext").addEventListener("click", () => {
    goToSlide((currentSlide + 1) % allSlides.length);
  });

  if (allSlides.length > 1) startAutoSlide();
}

function goToSlide(index) {
  const allSlides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".slider-dot");

  allSlides[currentSlide].classList.remove("active");
  if (dots[currentSlide]) dots[currentSlide].classList.remove("active");

  currentSlide = index;
  allSlides[currentSlide].classList.add("active");
  if (dots[currentSlide]) dots[currentSlide].classList.add("active");

  resetAutoSlide();
}

function startAutoSlide() {
  autoSlideTimer = setInterval(() => {
    const allSlides = document.querySelectorAll(".hero-slide");
    goToSlide((currentSlide + 1) % allSlides.length);
  }, 5000);
}

function resetAutoSlide() {
  clearInterval(autoSlideTimer);
  startAutoSlide();
}

// ============================================================
// NOTICES
// ============================================================
async function loadHomeNotices() {
  try {
    const result = await apiGet("getNotices");
    if (!result.success) return;

    const data = result.data.slice(0, 8);
    renderNoticeTicker(data);
    renderNoticeCards(data.slice(0, 4));
  } catch (e) {
    console.log("Notices load failed");
  }
}

function renderNoticeTicker(notices) {
  const ticker = document.getElementById("noticeTicker");
  if (!notices.length) {
    ticker.innerHTML = '<div style="padding:20px;color:rgba(255,255,255,0.5);text-align:center;font-size:0.85rem;">No notices yet</div>';
    return;
  }
  ticker.innerHTML = notices.map(n => `
    <div class="ticker-item" onclick="window.location.href='noticeboard.html'">
      <div class="t-badge">${sanitize(n.Category || "General")}</div>
      <div class="t-title">${sanitize(n.Title)}</div>
      <div class="t-date"><i class="fas fa-calendar"></i> ${formatDate(n.Date)}</div>
    </div>
  `).join("");
}

function renderNoticeCards(notices) {
  const container = document.getElementById("noticeCards");
  if (!notices.length) {
    container.innerHTML = '<p style="color:var(--text-light)">No notices available.</p>';
    return;
  }
  container.innerHTML = notices.map(n => `
    <div class="notice-card ${n.IsImportant === "TRUE" || n.IsImportant === true ? "important" : ""}">
      <div class="nc-category">
        ${n.IsImportant === "TRUE" ? '<i class="fas fa-exclamation-circle"></i> Important · ' : ""}
        ${sanitize(n.Category || "General")}
      </div>
      <div class="nc-title">${sanitize(n.Title)}</div>
      <div class="nc-date"><i class="fas fa-calendar-alt"></i> ${formatDate(n.Date)}</div>
      ${isAdmin() ? `
      <div class="admin-actions">
        <button class="btn-edit-item" onclick="openEditNoticeModal('${n.ID}', event)"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn-delete-item" onclick="deleteItem('deleteNotice', '${n.ID}', loadHomeNotices)"><i class="fas fa-trash"></i></button>
      </div>` : ""}
    </div>
  `).join("");
}

// ============================================================
// GALLERY PREVIEW
// ============================================================
async function loadGalleryPreview() {
  try {
    const result = await apiGet("getGallery");
    if (!result.success) { renderDefaultGallery(); return; }

    const data = result.data.slice(0, 6);
    if (!data.length) { renderDefaultGallery(); return; }

    const container = document.getElementById("galleryPreviewGrid");
    container.innerHTML = data.map(item => `
      <div class="gp-item">
        <img src="${item.ImageURL}" alt="${sanitize(item.Caption || '')}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=60'"/>
        <div class="gp-overlay"><span>${sanitize(item.Caption || item.Category || "")}</span></div>
      </div>
    `).join("");
  } catch (e) {
    renderDefaultGallery();
  }
}

function renderDefaultGallery() {
  const imgs = [
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=70",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=70",
    "https://images.unsplash.com/photo-1562774053-701939374585?w=400&q=70",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=70",
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=70",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=70",
  ];
  const captions = ["School Events", "Classroom", "Campus", "Annual Function", "Science Lab", "Students"];
  const container = document.getElementById("galleryPreviewGrid");
  container.innerHTML = imgs.map((url, i) => `
    <div class="gp-item">
      <img src="${url}" alt="${captions[i]}" loading="lazy"/>
      <div class="gp-overlay"><span>${captions[i]}</span></div>
    </div>
  `).join("");
}

// ============================================================
// ACHIEVEMENTS
// ============================================================
const ACHIEVEMENT_ICONS = ["fas fa-trophy", "fas fa-medal", "fas fa-star", "fas fa-award", "fas fa-certificate"];

async function loadAchievements() {
  const container = document.getElementById("achievementsGrid");
  try {
    const result = await apiGet("getAchievements");
    if (!result.success || !result.data.length) {
      renderDefaultAchievements();
      return;
    }

    container.innerHTML = result.data.slice(0, 6).map((ach, i) => `
      <div class="achievement-card">
        <div class="ach-icon"><i class="${ACHIEVEMENT_ICONS[i % ACHIEVEMENT_ICONS.length]}"></i></div>
        <div class="ach-content">
          <h4>${sanitize(ach.Title)}</h4>
          <p>${sanitize(ach.Description)}</p>
          <div class="ach-year">${sanitize(ach.Year || "")}</div>
          ${isAdmin() ? `
          <div class="admin-actions">
            <button class="btn-edit-item" onclick="openEditAchievementModal('${ach.ID}')"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn-delete-item" onclick="deleteItem('deleteAchievement', '${ach.ID}', loadAchievements)"><i class="fas fa-trash"></i></button>
          </div>` : ""}
        </div>
      </div>
    `).join("");
  } catch (e) {
    renderDefaultAchievements();
  }
}

function renderDefaultAchievements() {
  const defaults = [
    { icon: "fas fa-trophy", title: "Best School Award", desc: "Received Best School Award by District Education Board for academic excellence.", year: "2024" },
    { icon: "fas fa-medal", title: "100% Board Results", desc: "Achieved 100% pass rate in Class X & XII board examinations consistently.", year: "2024" },
    { icon: "fas fa-star", title: "Sports Champions", desc: "Won District-level inter-school sports competition in athletics.", year: "2023" },
  ];

  document.getElementById("achievementsGrid").innerHTML = defaults.map(a => `
    <div class="achievement-card">
      <div class="ach-icon"><i class="${a.icon}"></i></div>
      <div class="ach-content">
        <h4>${a.title}</h4>
        <p>${a.desc}</p>
        <div class="ach-year">${a.year}</div>
      </div>
    </div>
  `).join("");
}

// ============================================================
// COUNTERS ANIMATION
// ============================================================
function initCounters() {
  const counters = document.querySelectorAll(".stat-num");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current >= target) clearInterval(timer);
  }, 16);
}

// ============================================================
// ADMIN: SLIDER MODALS
// ============================================================
function openAddSliderModal() {
  openModal("Add New Slide", `
    <div id="sliderForm">
      <div class="form-group">
        <label>Slide Title</label>
        <input type="text" name="Title" placeholder="e.g. Excellence in Education" />
      </div>
      <div class="form-group">
        <label>Subtitle / Description</label>
        <textarea name="Subtitle" placeholder="Short description for the slide..."></textarea>
      </div>
      <div class="form-group">
        <label>Background Image URL</label>
        <input type="url" name="ImageURL" placeholder="https://..." />
      </div>
      <div class="form-group">
        <label>Button Text</label>
        <input type="text" name="ButtonText" placeholder="e.g. Apply Now" />
      </div>
      <div class="form-group">
        <label>Button Link</label>
        <input type="text" name="ButtonLink" placeholder="e.g. admissions.html" />
      </div>
    </div>
  `, async () => {
    const data = getFormData("sliderForm");
    data.Active = "TRUE";
    const result = await apiPost("addSlider", { data });
    if (result.success) {
      showToast("Slide add ho gaya!", "success");
      closeModal();
      loadSliders();
    } else {
      showToast(result.message || "Error!", "error");
    }
  });
}

function openEditSliderModal(id, slide) {
  openModal("Edit Slide", `
    <div id="sliderForm">
      <div class="form-group">
        <label>Slide Title</label>
        <input type="text" name="Title" value="${sanitize(slide.Title || '')}" />
      </div>
      <div class="form-group">
        <label>Subtitle</label>
        <textarea name="Subtitle">${sanitize(slide.Subtitle || '')}</textarea>
      </div>
      <div class="form-group">
        <label>Background Image URL</label>
        <input type="url" name="ImageURL" value="${slide.ImageURL || ''}" />
      </div>
      <div class="form-group">
        <label>Button Text</label>
        <input type="text" name="ButtonText" value="${sanitize(slide.ButtonText || '')}" />
      </div>
      <div class="form-group">
        <label>Button Link</label>
        <input type="text" name="ButtonLink" value="${slide.ButtonLink || ''}" />
      </div>
    </div>
  `, async () => {
    const data = getFormData("sliderForm");
    const result = await apiPost("updateSlider", { id, data });
    if (result.success) {
      showToast("Slide update ho gaya!", "success");
      closeModal();
      loadSliders();
    } else {
      showToast(result.message || "Error!", "error");
    }
  });
}

// ============================================================
// ADMIN: NOTICE MODALS
// ============================================================
function openAddNoticeModal() {
  openModal("Add New Notice", `
    <div id="noticeForm">
      <div class="form-group">
        <label>Notice Title *</label>
        <input type="text" name="Title" placeholder="Notice ka title..." required />
      </div>
      <div class="form-group">
        <label>Content / Details</label>
        <textarea name="Content" placeholder="Notice ki details..."></textarea>
      </div>
      <div class="form-group">
        <label>Category</label>
        <select name="Category">
          <option>General</option>
          <option>Exam</option>
          <option>Holiday</option>
          <option>Event</option>
          <option>Admission</option>
          <option>Fee</option>
          <option>Sports</option>
          <option>Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" name="Date" value="${new Date().toISOString().split('T')[0]}" />
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" name="IsImportant" value="TRUE" style="width:auto;margin-right:6px;" />
          Mark as Important
        </label>
      </div>
      <div class="form-group">
        <label>Attachment URL (optional)</label>
        <input type="url" name="AttachmentURL" placeholder="Google Drive PDF link..." />
      </div>
    </div>
  `, async () => {
    const data = getFormData("noticeForm");
    const checkbox = document.querySelector('#noticeForm input[name="IsImportant"]');
    data.IsImportant = checkbox && checkbox.checked ? "TRUE" : "FALSE";
    if (!data.Title) { showToast("Title zaroori hai!", "error"); return; }

    const result = await apiPost("addNotice", { data });
    if (result.success) {
      showToast("Notice add ho gaya!", "success");
      closeModal();
      loadHomeNotices();
    } else {
      showToast(result.message || "Error!", "error");
    }
  });
}

function openEditNoticeModal(id, event) {
  if (event) event.stopPropagation();
  openModal("Edit Notice", `
    <div id="noticeForm">
      <div class="form-group">
        <label>Notice Title</label>
        <input type="text" name="Title" placeholder="Notice title..." />
      </div>
      <div class="form-group">
        <label>Content</label>
        <textarea name="Content" placeholder="Notice content..."></textarea>
      </div>
      <div class="form-group">
        <label>Category</label>
        <select name="Category">
          <option>General</option><option>Exam</option><option>Holiday</option>
          <option>Event</option><option>Admission</option><option>Fee</option>
        </select>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" name="Date" />
      </div>
    </div>
  `, async () => {
    const data = getFormData("noticeForm");
    const result = await apiPost("updateNotice", { id, data });
    if (result.success) {
      showToast("Notice update ho gaya!", "success");
      closeModal();
      loadHomeNotices();
    } else {
      showToast(result.message || "Error!", "error");
    }
  });
}

// ============================================================
// ADMIN: ACHIEVEMENT MODALS
// ============================================================
function openAddAchievementModal() {
  openModal("Add Achievement", `
    <div id="achForm">
      <div class="form-group">
        <label>Title *</label>
        <input type="text" name="Title" placeholder="Achievement ka naam..." />
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea name="Description" placeholder="Achievement ki details..."></textarea>
      </div>
      <div class="form-group">
        <label>Year</label>
        <input type="text" name="Year" placeholder="2024" value="${new Date().getFullYear()}" />
      </div>
      <div class="form-group">
        <label>Category</label>
        <select name="Category">
          <option>Academic</option><option>Sports</option><option>Cultural</option>
          <option>Award</option><option>Other</option>
        </select>
      </div>
    </div>
  `, async () => {
    const data = getFormData("achForm");
    const result = await apiPost("addAchievement", { data });
    if (result.success) {
      showToast("Achievement add ho gaya!", "success");
      closeModal();
      loadAchievements();
    } else {
      showToast(result.message || "Error!", "error");
    }
  });
}
