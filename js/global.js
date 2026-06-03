// ============================================================
// SULEKH CONVENT SCHOOL - Global JavaScript
// File: js/global.js
// Used by: ALL pages
// ============================================================

// ⚠️ IMPORTANT: Replace with your Google Apps Script Web App URL
// After deploying code.gs, paste the URL here
const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";

// ============================================================
// NAVBAR HTML - injected into all pages
// ============================================================
const NAVBAR_HTML = `
<div class="top-bar">
  <div class="container">
    <div class="top-bar-left">
      <span><i class="fas fa-phone"></i> <span id="tb-phone">Loading...</span></span>
      <span><i class="fas fa-envelope"></i> <span id="tb-email">Loading...</span></span>
    </div>
    <div class="top-bar-right">
      <span><i class="fas fa-clock"></i> <span id="tb-timing">Mon-Sat: 7:30 AM - 2:00 PM</span></span>
      <span><i class="fas fa-map-marker-alt"></i> Bareilly, U.P.</span>
    </div>
  </div>
</div>

<nav class="navbar" id="mainNavbar">
  <div class="container">
    <a href="index.html" class="navbar-brand">
      <div class="logo-circle">SC</div>
      <div class="brand-text">
        <div class="school-name">Sulekh Convent School</div>
        <div class="school-tagline">Shaping Future Leaders</div>
      </div>
    </a>

    <ul class="nav-links" id="navLinks">
      <li><a href="index.html">Home</a></li>
      <li>
        <a href="about.html">About Us <i class="fas fa-chevron-down arrow"></i></a>
        <ul class="dropdown">
          <li><a href="about.html#overview">School Overview</a></li>
          <li><a href="about.html#vision">Vision & Mission</a></li>
          <li><a href="about.html#principal">Principal's Message</a></li>
          <li><a href="about.html#history">Our History</a></li>
          <li><a href="about.html#infrastructure">Infrastructure</a></li>
        </ul>
      </li>
      <li>
        <a href="academics.html">Academics <i class="fas fa-chevron-down arrow"></i></a>
        <ul class="dropdown">
          <li><a href="academics.html#curriculum">Curriculum</a></li>
          <li><a href="academics.html#classes">Classes (Nursery–XII)</a></li>
          <li><a href="academics.html#subjects">Subjects Offered</a></li>
          <li><a href="academics.html#activities">Co-curricular Activities</a></li>
          <li><a href="academics.html#labs">Laboratories & Library</a></li>
        </ul>
      </li>
      <li>
        <a href="admissions.html">Admissions <i class="fas fa-chevron-down arrow"></i></a>
        <ul class="dropdown">
          <li><a href="admissions.html#process">Admission Process</a></li>
          <li><a href="admissions.html#eligibility">Eligibility Criteria</a></li>
          <li><a href="admissions.html#documents">Required Documents</a></li>
          <li><a href="admissions.html#form">Enquiry Form</a></li>
        </ul>
      </li>
      <li><a href="faculty.html">Faculty</a></li>
      <li>
        <a href="gallery.html">Gallery <i class="fas fa-chevron-down arrow"></i></a>
        <ul class="dropdown">
          <li><a href="gallery.html?cat=all">All Photos</a></li>
          <li><a href="gallery.html?cat=Events">Events</a></li>
          <li><a href="gallery.html?cat=Sports">Sports</a></li>
          <li><a href="gallery.html?cat=Annual Day">Annual Day</a></li>
          <li><a href="gallery.html?cat=Infrastructure">Infrastructure</a></li>
        </ul>
      </li>
      <li>
        <a href="results.html">Results <i class="fas fa-chevron-down arrow"></i></a>
        <ul class="dropdown">
          <li><a href="results.html">Board Results</a></li>
          <li><a href="results.html#achievements">Achievements</a></li>
          <li><a href="results.html#toppers">Toppers</a></li>
        </ul>
      </li>
      <li><a href="noticeboard.html">Notice Board</a></li>
      <li><a href="fee-structure.html">Fee Structure</a></li>
      <li>
        <a href="contact.html">Contact <i class="fas fa-chevron-down arrow"></i></a>
        <ul class="dropdown">
          <li><a href="contact.html">Contact Us</a></li>
          <li><a href="admin-login.html" id="adminNavLink"><i class="fas fa-lock"></i> Admin Login</a></li>
        </ul>
      </li>
    </ul>

    <button class="hamburger" id="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
`;

// ============================================================
// FOOTER HTML - injected into all pages
// ============================================================
const FOOTER_HTML = `
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-col footer-brand">
        <div class="logo-area">
          <div class="logo-circle-sm">SC</div>
          <div class="f-school-name">Sulekh Convent School<br><small style="color:var(--accent);font-size:0.7rem;">Bareilly, Uttar Pradesh</small></div>
        </div>
        <p>Nurturing young minds with quality education, strong values, and holistic development since our establishment. Committed to excellence in academics and character building.</p>
        <div class="footer-social">
          <a href="#" id="fb-link" title="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="#" id="yt-link" title="YouTube"><i class="fab fa-youtube"></i></a>
          <a href="#" id="tw-link" title="Twitter"><i class="fab fa-twitter"></i></a>
          <a href="https://maps.app.goo.gl/VgKqLEx6uSNLLjwo6" target="_blank" title="Location"><i class="fas fa-map-marker-alt"></i></a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Quick Links</h4>
        <ul class="footer-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html">About Us</a></li>
          <li><a href="academics.html">Academics</a></li>
          <li><a href="admissions.html">Admissions</a></li>
          <li><a href="faculty.html">Faculty</a></li>
          <li><a href="results.html">Results</a></li>
          <li><a href="fee-structure.html">Fee Structure</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Important Links</h4>
        <ul class="footer-links">
          <li><a href="noticeboard.html">Notice Board</a></li>
          <li><a href="gallery.html">Photo Gallery</a></li>
          <li><a href="contact.html">Contact Us</a></li>
          <li><a href="admissions.html#form">Apply Now</a></li>
          <li><a href="admin-login.html">Admin Login</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contact Us</h4>
        <ul class="footer-contact">
          <li><i class="fas fa-map-marker-alt"></i><span id="f-address">Bareilly, Uttar Pradesh</span></li>
          <li><i class="fas fa-phone"></i><span id="f-phone">Loading...</span></li>
          <li><i class="fas fa-envelope"></i><span id="f-email">Loading...</span></li>
          <li><i class="fas fa-clock"></i><span id="f-timing">Mon-Sat: 7:30 AM – 2:00 PM</span></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;width:100%">
      <span>© <span id="footer-year"></span> Sulekh Convent School. All rights reserved.</span>
      <span>Designed with <span style="color:#e74c3c">♥</span> for quality education</span>
    </div>
  </div>
</footer>
`;

// ============================================================
// ADMIN BAR HTML
// ============================================================
const ADMIN_BAR_HTML = `
<div class="admin-edit-bar" id="adminEditBar">
  <div class="admin-badge"><i class="fas fa-shield-alt"></i> Admin Mode</div>
  <span id="adminNameDisplay" style="color:rgba(255,255,255,0.7);font-size:0.8rem;"></span>
  <a href="admin-dashboard.html" class="btn-logout" style="background:rgba(200,168,75,0.2);border-color:rgba(200,168,75,0.3);">
    <i class="fas fa-tachometer-alt"></i> Dashboard
  </a>
  <button class="btn-logout" onclick="adminLogout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
</div>
<div class="toast" id="globalToast"></div>
`;

// ============================================================
// MODAL HTML
// ============================================================
const MODAL_HTML = `
<div class="modal-overlay" id="globalModal">
  <div class="modal-box">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <h3 id="modalTitle">Edit Content</h3>
    <div id="modalBody"></div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" id="modalSaveBtn" onclick="saveModalData()">
        <i class="fas fa-save"></i> Save Changes
      </button>
    </div>
  </div>
</div>
`;

// ============================================================
// INIT - runs on every page
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  injectNavbarFooter();
  initNavbar();
  loadContactInfo();
  checkAdminSession();
  document.getElementById("footer-year").textContent = new Date().getFullYear();
});

function injectNavbarFooter() {
  const navbarContainer = document.getElementById("navbar-container");
  const footerContainer = document.getElementById("footer-container");

  if (navbarContainer) navbarContainer.innerHTML = NAVBAR_HTML;
  if (footerContainer) {
    footerContainer.innerHTML = FOOTER_HTML;
    document.body.insertAdjacentHTML("beforeend", ADMIN_BAR_HTML);
    document.body.insertAdjacentHTML("beforeend", MODAL_HTML);
  }

  // Mark active nav link
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links > li > a").forEach(link => {
    const href = link.getAttribute("href");
    if (href && href.split("#")[0] === currentPage) {
      link.parentElement.classList.add("active");
    }
  });
}

function initNavbar() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("open");
  });

  // Mobile: tap to open dropdown
  navLinks.querySelectorAll("li > a").forEach(link => {
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 768 && link.querySelector(".arrow")) {
        e.preventDefault();
        link.parentElement.classList.toggle("open");
      }
    });
  });

  // Sticky navbar
  window.addEventListener("scroll", () => {
    const navbar = document.getElementById("mainNavbar");
    if (navbar) {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    }
  });

  // Close nav on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar")) {
      navLinks.classList.remove("open");
      hamburger.classList.remove("active");
    }
  });
}

// ============================================================
// API CALLS
// ============================================================
async function apiGet(action, params = {}) {
  // Return empty success if API not configured yet
  if (!API_URL || API_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
    return { success: false, data: [], message: "API not configured" };
  }
  try {
    const url = new URL(API_URL);
    url.searchParams.set("action", action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const resp = await fetch(url.toString());
    return resp.json();
  } catch (e) {
    return { success: false, data: [], message: e.toString() };
  }
}

async function apiPost(action, data = {}) {
  // Block writes if API not configured
  if (!API_URL || API_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
    return { success: false, message: "API URL configure karein pehle." };
  }
  try {
    const token = localStorage.getItem("adminToken");
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, sessionToken: token, ...data })
    });
    return resp.json();
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// ============================================================
// CONTACT INFO LOADER
// ============================================================
async function loadContactInfo() {
  try {
    const result = await apiGet("getContactInfo");
    if (!result.success) return;
    const d = result.data;

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.textContent = val;
    };

    setEl("tb-phone",  d.Phone1);
    setEl("tb-email",  d.Email);
    if (d.Timing) setEl("tb-timing", d.Timing);
    setEl("f-address", d.Address);
    setEl("f-phone",   d.Phone1 + (d.Phone2 ? " / " + d.Phone2 : ""));
    setEl("f-email",   d.Email);
    if (d.Timing) setEl("f-timing", d.Timing);

    if (d.FacebookURL && document.getElementById("fb-link")) document.getElementById("fb-link").href = d.FacebookURL;
    if (d.YoutubeURL  && document.getElementById("yt-link")) document.getElementById("yt-link").href = d.YoutubeURL;
    if (d.TwitterURL  && document.getElementById("tw-link")) document.getElementById("tw-link").href = d.TwitterURL;

  } catch (e) {
    // Silently ignore — API not yet configured
  }
}

// ============================================================
// ADMIN AUTH
// ============================================================
function checkAdminSession() {
  const token = localStorage.getItem("adminToken");
  const username = localStorage.getItem("adminUsername");

  if (token) {
    document.body.classList.add("admin-mode");
    const bar = document.getElementById("adminEditBar");
    if (bar) bar.classList.add("visible");
    if (username && document.getElementById("adminNameDisplay")) {
      document.getElementById("adminNameDisplay").textContent = username;
    }
  }
}

function adminLogout() {
  const token = localStorage.getItem("adminToken");
  if (token) {
    apiPost("logout", { sessionToken: token });
  }
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUsername");
  localStorage.removeItem("adminRole");
  document.body.classList.remove("admin-mode");
  const bar = document.getElementById("adminEditBar");
  if (bar) bar.classList.remove("visible");
  showToast("Logout successful!", "success");
  setTimeout(() => window.location.href = "index.html", 1200);
}

function isAdmin() {
  return !!localStorage.getItem("adminToken");
}

// ============================================================
// MODAL SYSTEM
// ============================================================
let modalSaveCallback = null;

function openModal(title, bodyHTML, saveCallback) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = bodyHTML;
  modalSaveCallback = saveCallback;
  document.getElementById("globalModal").classList.add("open");
}

function closeModal() {
  document.getElementById("globalModal").classList.remove("open");
  modalSaveCallback = null;
}

function saveModalData() {
  if (typeof modalSaveCallback === "function") {
    modalSaveCallback();
  }
}

// Close modal on overlay click
document.addEventListener("click", (e) => {
  const overlay = document.getElementById("globalModal");
  if (overlay && e.target === overlay) closeModal();
});

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = "success") {
  const toast = document.getElementById("globalToast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.classList.remove("show"); }, 3500);
}

// ============================================================
// GENERIC DELETE HANDLER
// ============================================================
async function deleteItem(action, id, onSuccess) {
  if (!confirm("Are you sure? Ye record permanently delete ho jayega!")) return;

  try {
    const result = await apiPost(action, { id });
    if (result.success) {
      showToast("Record delete ho gaya!", "success");
      if (typeof onSuccess === "function") onSuccess();
    } else {
      showToast(result.message || "Delete failed", "error");
    }
  } catch (e) {
    showToast("Network error!", "error");
  }
}

// ============================================================
// UTILITY HELPERS
// ============================================================
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric"
    });
  } catch { return dateStr; }
}

function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function getFormData(formId) {
  const form = document.getElementById(formId);
  const data = {};
  form.querySelectorAll("input, textarea, select").forEach(el => {
    if (el.name) data[el.name] = el.value.trim();
  });
  return data;
}

// Scroll reveal animation
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}
