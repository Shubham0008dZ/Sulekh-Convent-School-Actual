// ============================================================
// SULEKH CONVENT SCHOOL - Admin Dashboard JS
// File: js/admin-dashboard.js
// ============================================================

// Override global modal IDs since dashboard uses same IDs
let modalSaveCallback = null;

document.addEventListener("DOMContentLoaded", () => {
  // Auth guard — redirect to login if not admin
  if (!localStorage.getItem("adminToken")) {
    window.location.href = "admin-login.html";
    return;
  }

  // Set admin name
  const username = localStorage.getItem("adminUsername") || "Admin";
  const role     = localStorage.getItem("adminRole") || "admin";
  document.getElementById("dashAdminName").textContent = username;
  document.getElementById("dashAdminRole").textContent = role;
  document.getElementById("welcomeName").textContent = username;

  // Date
  document.getElementById("dashDate").innerHTML =
    new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  initSidebarNav();
  initSidebarToggle();
  loadDashboardOverview();
});

// ============================================================
// SIDEBAR NAVIGATION
// ============================================================
function initSidebarNav() {
  document.querySelectorAll(".snav-item[data-section]").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      switchSection(item.dataset.section);
      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        document.getElementById("dashSidebar").classList.remove("open");
      }
    });
  });
}

function switchSection(name) {
  // Deactivate all
  document.querySelectorAll(".snav-item").forEach(i => i.classList.remove("active"));
  document.querySelectorAll(".dash-section").forEach(s => s.classList.remove("active"));

  // Activate selected
  const navItem = document.querySelector(`.snav-item[data-section="${name}"]`);
  const section = document.getElementById(`section-${name}`);

  if (navItem) navItem.classList.add("active");
  if (section) section.classList.add("active");

  // Update page title
  const titles = {
    overview: "Dashboard", sliders: "Home Sliders", notices: "Notice Board",
    gallery: "Gallery", faculty: "Faculty", results: "Results",
    achievements: "Achievements", fees: "Fee Structure",
    contact: "Contact Info", users: "Admin Users"
  };
  document.getElementById("dashPageTitle").textContent = titles[name] || "Dashboard";

  // Load section data
  const loaders = {
    overview:     loadDashboardOverview,
    sliders:      loadSlidersTable,
    notices:      loadNoticesTable,
    gallery:      loadGalleryTable,
    faculty:      loadFacultyTable,
    results:      loadResultsTable,
    achievements: loadAchievementsTable,
    fees:         loadFeesTable,
    contact:      loadContactForm,
  };
  if (loaders[name]) loaders[name]();
}

function initSidebarToggle() {
  const toggle  = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("dashSidebar");
  toggle.addEventListener("click", () => sidebar.classList.toggle("open"));
  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dashboard-sidebar") && !e.target.closest("#sidebarToggle")) {
      sidebar.classList.remove("open");
    }
  });
}

// ============================================================
// OVERVIEW
// ============================================================
async function loadDashboardOverview() {
  try {
    const [notices, gallery, faculty, results] = await Promise.all([
      apiGet("getNotices"),
      apiGet("getGallery"),
      apiGet("getFaculty"),
      apiGet("getResults"),
    ]);

    const nc = notices.success ? notices.data.length : 0;
    document.getElementById("statNotices").textContent = nc;
    document.getElementById("noticeCount").textContent = nc;
    document.getElementById("statGallery").textContent = gallery.success ? gallery.data.length : 0;
    document.getElementById("statFaculty").textContent = faculty.success ? faculty.data.length : 0;
    document.getElementById("statResults").textContent = results.success ? results.data.length : 0;

    // Recent notices preview
    if (notices.success) renderRecentNotices(notices.data.slice(0, 5));

  } catch (e) {
    console.log("Overview load error:", e);
  }
}

function renderRecentNotices(data) {
  const el = document.getElementById("recentNoticesPreview");
  if (!data.length) {
    el.innerHTML = '<p style="padding:20px;color:var(--text-light);">Koi notice nahi hai abhi.</p>';
    return;
  }
  el.innerHTML = data.map(n => `
    <div class="recent-notice-item">
      <div class="rni-dot ${n.IsImportant === 'TRUE' ? 'important' : 'normal'}"></div>
      <div>
        <div class="rni-title">${sanitize(n.Title)}</div>
        <div class="rni-meta">
          <span><i class="fas fa-tag"></i> ${sanitize(n.Category || 'General')}</span>
          <span><i class="fas fa-calendar"></i> ${formatDate(n.Date)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ============================================================
// SLIDERS TABLE
// ============================================================
async function loadSlidersTable() {
  const wrap = document.getElementById("slidersTable");
  try {
    const result = await apiGet("getSliders");
    const data = result.success ? result.data : [];
    wrap.innerHTML = `
      <div class="dash-table-wrap">
        <table class="dash-table">
          <thead><tr>
            <th>Title</th><th>Subtitle</th><th>Button</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            ${data.length ? data.map(s => `
              <tr>
                <td><strong>${sanitize(s.Title || '—')}</strong></td>
                <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${sanitize(s.Subtitle || '—')}</td>
                <td>${sanitize(s.ButtonText || '—')}</td>
                <td><span class="dt-badge ${s.Active !== 'FALSE' ? 'active' : 'inactive'}">${s.Active !== 'FALSE' ? 'Active' : 'Inactive'}</span></td>
                <td><div class="td-actions">
                  <button class="btn-edit-item" onclick="openDashEditSliderModal('${s.ID}')"><i class="fas fa-edit"></i></button>
                  <button class="btn-delete-item" onclick="deleteItem('deleteSlider','${s.ID}',loadSlidersTable)"><i class="fas fa-trash"></i></button>
                </div></td>
              </tr>
            `).join('') : '<tr class="no-data-row"><td colspan="5">Koi slide nahi hai. Pehle slide add karein.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) { wrap.innerHTML = '<p style="padding:20px;color:red;">Load failed.</p>'; }
}

// ============================================================
// NOTICES TABLE
// ============================================================
async function loadNoticesTable() {
  const wrap = document.getElementById("noticesTable");
  try {
    const result = await apiGet("getNotices");
    const data = result.success ? result.data : [];
    wrap.innerHTML = `
      <div class="dash-table-wrap">
        <table class="dash-table">
          <thead><tr>
            <th>Title</th><th>Category</th><th>Date</th><th>Priority</th><th>Actions</th>
          </tr></thead>
          <tbody>
            ${data.length ? data.map(n => `
              <tr>
                <td><strong>${sanitize(n.Title)}</strong></td>
                <td>${sanitize(n.Category || 'General')}</td>
                <td>${formatDate(n.Date)}</td>
                <td><span class="dt-badge ${n.IsImportant === 'TRUE' ? 'important' : 'normal'}">${n.IsImportant === 'TRUE' ? 'Important' : 'Normal'}</span></td>
                <td><div class="td-actions">
                  <button class="btn-edit-item" onclick="openDashEditNoticeModal('${n.ID}')"><i class="fas fa-edit"></i></button>
                  <button class="btn-delete-item" onclick="deleteItem('deleteNotice','${n.ID}',loadNoticesTable)"><i class="fas fa-trash"></i></button>
                </div></td>
              </tr>
            `).join('') : '<tr class="no-data-row"><td colspan="5">Koi notice nahi hai.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) { wrap.innerHTML = '<p style="padding:20px;color:red;">Load failed.</p>'; }
}

// ============================================================
// GALLERY TABLE
// ============================================================
async function loadGalleryTable() {
  const wrap = document.getElementById("galleryTable");
  try {
    const result = await apiGet("getGallery");
    const data = result.success ? result.data : [];
    wrap.innerHTML = `
      <div class="dash-table-wrap">
        <table class="dash-table">
          <thead><tr>
            <th>Photo</th><th>Caption</th><th>Category</th><th>Date</th><th>Actions</th>
          </tr></thead>
          <tbody>
            ${data.length ? data.map(g => `
              <tr>
                <td><img class="dash-thumb" src="${g.ImageURL}" alt="" onerror="this.style.display='none'" /></td>
                <td>${sanitize(g.Caption || '—')}</td>
                <td>${sanitize(g.Category || '—')}</td>
                <td>${formatDate(g.Date)}</td>
                <td><div class="td-actions">
                  <button class="btn-delete-item" onclick="deleteItem('deleteGallery','${g.ID}',loadGalleryTable)"><i class="fas fa-trash"></i> Delete</button>
                </div></td>
              </tr>
            `).join('') : '<tr class="no-data-row"><td colspan="5">Gallery mein koi photo nahi hai.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) { wrap.innerHTML = '<p style="padding:20px;color:red;">Load failed.</p>'; }
}

// ============================================================
// FACULTY TABLE
// ============================================================
async function loadFacultyTable() {
  const wrap = document.getElementById("facultyTable");
  try {
    const result = await apiGet("getFaculty");
    const data = result.success ? result.data : [];
    wrap.innerHTML = `
      <div class="dash-table-wrap">
        <table class="dash-table">
          <thead><tr>
            <th>Name</th><th>Designation</th><th>Subject</th><th>Qualification</th><th>Experience</th><th>Actions</th>
          </tr></thead>
          <tbody>
            ${data.length ? data.map(f => `
              <tr>
                <td><strong>${sanitize(f.Name)}</strong></td>
                <td>${sanitize(f.Designation || '—')}</td>
                <td>${sanitize(f.Subject || '—')}</td>
                <td>${sanitize(f.Qualification || '—')}</td>
                <td>${f.Experience ? sanitize(f.Experience) + ' yrs' : '—'}</td>
                <td><div class="td-actions">
                  <button class="btn-edit-item" onclick="openDashEditFacultyModal('${f.ID}')"><i class="fas fa-edit"></i></button>
                  <button class="btn-delete-item" onclick="deleteItem('deleteFaculty','${f.ID}',loadFacultyTable)"><i class="fas fa-trash"></i></button>
                </div></td>
              </tr>
            `).join('') : '<tr class="no-data-row"><td colspan="6">Koi faculty member nahi hai.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) { wrap.innerHTML = '<p style="padding:20px;color:red;">Load failed.</p>'; }
}

// ============================================================
// RESULTS TABLE
// ============================================================
async function loadResultsTable() {
  const wrap = document.getElementById("resultsTable");
  try {
    const result = await apiGet("getResults");
    const data = result.success ? result.data : [];
    wrap.innerHTML = `
      <div class="dash-table-wrap">
        <table class="dash-table">
          <thead><tr>
            <th>Class</th><th>Year</th><th>Title</th><th>Highlights</th><th>Actions</th>
          </tr></thead>
          <tbody>
            ${data.length ? data.map(r => `
              <tr>
                <td><strong>${sanitize(r.Class || '—')}</strong></td>
                <td>${sanitize(r.Year || '—')}</td>
                <td>${sanitize(r.Title || '—')}</td>
                <td style="font-size:0.82rem;color:var(--text-light);">${sanitize(r.Highlights || '—')}</td>
                <td><div class="td-actions">
                  <button class="btn-edit-item" onclick="openDashEditResultModal('${r.ID}')"><i class="fas fa-edit"></i></button>
                  <button class="btn-delete-item" onclick="deleteItem('deleteResult','${r.ID}',loadResultsTable)"><i class="fas fa-trash"></i></button>
                </div></td>
              </tr>
            `).join('') : '<tr class="no-data-row"><td colspan="5">Koi result nahi hai.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) { wrap.innerHTML = '<p style="padding:20px;color:red;">Load failed.</p>'; }
}

// ============================================================
// ACHIEVEMENTS TABLE
// ============================================================
async function loadAchievementsTable() {
  const wrap = document.getElementById("achievementsTable");
  try {
    const result = await apiGet("getAchievements");
    const data = result.success ? result.data : [];
    wrap.innerHTML = `
      <div class="dash-table-wrap">
        <table class="dash-table">
          <thead><tr>
            <th>Title</th><th>Year</th><th>Category</th><th>Description</th><th>Actions</th>
          </tr></thead>
          <tbody>
            ${data.length ? data.map(a => `
              <tr>
                <td><strong>${sanitize(a.Title)}</strong></td>
                <td>${sanitize(a.Year || '—')}</td>
                <td>${sanitize(a.Category || '—')}</td>
                <td style="font-size:0.82rem;color:var(--text-light);max-width:250px;">${sanitize((a.Description || '').slice(0, 80))}${(a.Description || '').length > 80 ? '...' : ''}</td>
                <td><div class="td-actions">
                  <button class="btn-edit-item" onclick="openDashEditAchModal('${a.ID}')"><i class="fas fa-edit"></i></button>
                  <button class="btn-delete-item" onclick="deleteItem('deleteAchievement','${a.ID}',loadAchievementsTable)"><i class="fas fa-trash"></i></button>
                </div></td>
              </tr>
            `).join('') : '<tr class="no-data-row"><td colspan="5">Koi achievement nahi hai.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) { wrap.innerHTML = '<p style="padding:20px;color:red;">Load failed.</p>'; }
}

// ============================================================
// FEE TABLE
// ============================================================
async function loadFeesTable() {
  const wrap = document.getElementById("feesTable");
  try {
    const result = await apiGet("getFeeStructure");
    const data = result.success ? result.data : [];
    wrap.innerHTML = `
      <div class="dash-table-wrap">
        <table class="dash-table">
          <thead><tr>
            <th>Class</th><th>Fee Type</th><th>Amount (₹)</th><th>Session</th><th>Due Date</th><th>Actions</th>
          </tr></thead>
          <tbody>
            ${data.length ? data.map(f => `
              <tr>
                <td><strong>${sanitize(f.Class || '—')}</strong></td>
                <td>${sanitize(f.FeeType || '—')}</td>
                <td style="font-weight:700;color:var(--primary);">₹ ${sanitize(String(f.Amount || ''))}</td>
                <td>${sanitize(f.Session || '—')}</td>
                <td>${sanitize(f.DueDate || '—')}</td>
                <td><div class="td-actions">
                  <button class="btn-edit-item" onclick="openDashEditFeeModal('${f.ID}')"><i class="fas fa-edit"></i></button>
                  <button class="btn-delete-item" onclick="deleteItem('deleteFee','${f.ID}',loadFeesTable)"><i class="fas fa-trash"></i></button>
                </div></td>
              </tr>
            `).join('') : '<tr class="no-data-row"><td colspan="6">Koi fee entry nahi hai.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) { wrap.innerHTML = '<p style="padding:20px;color:red;">Load failed.</p>'; }
}

// ============================================================
// CONTACT FORM
// ============================================================
let contactData = {};

async function loadContactForm() {
  const grid = document.getElementById("contactEditGrid");
  try {
    const result = await apiGet("getContactInfo");
    if (result.success) contactData = result.data;

    const fields = [
      { key: "Address",           label: "School Address",        type: "text" },
      { key: "Phone1",            label: "Primary Phone",         type: "tel" },
      { key: "Phone2",            label: "Secondary Phone",       type: "tel" },
      { key: "Email",             label: "Email Address",         type: "email" },
      { key: "Timing",            label: "Office Timing",         type: "text" },
      { key: "Principal",         label: "Principal Name",        type: "text" },
      { key: "EstablishedYear",   label: "Established Year",      type: "text" },
      { key: "Affiliation",       label: "Affiliation Board",     type: "text" },
      { key: "AffiliationNumber", label: "Affiliation Number",    type: "text" },
      { key: "Website",           label: "Website URL",           type: "url" },
      { key: "FacebookURL",       label: "Facebook URL",          type: "url" },
      { key: "YoutubeURL",        label: "YouTube Channel URL",   type: "url" },
      { key: "TwitterURL",        label: "Twitter URL",           type: "url" },
      { key: "MapEmbedURL",       label: "Google Maps Embed URL", type: "url" },
    ];

    grid.innerHTML = fields.map(f => `
      <div class="form-group">
        <label>${f.label}</label>
        <input type="${f.type}" id="cf_${f.key}" name="${f.key}"
          value="${sanitize(contactData[f.key] || '')}"
          placeholder="${f.label}..." />
      </div>
    `).join('');

  } catch (e) {
    grid.innerHTML = '<p style="padding:20px;color:red;">Load failed. API URL check karein.</p>';
  }
}

async function saveContactInfo() {
  const data = {};
  document.querySelectorAll("#contactEditGrid input").forEach(inp => {
    if (inp.name) data[inp.name] = inp.value.trim();
  });

  try {
    const result = await apiPost("updateContact", { data });
    if (result.success) {
      showToast("Contact info save ho gayi!", "success");
    } else {
      showToast(result.message || "Save failed!", "error");
    }
  } catch (e) {
    showToast("Network error!", "error");
  }
}

// ============================================================
// ADD MODALS
// ============================================================
function openDashAddSliderModal() {
  openModal("Add New Slide", `
    <div id="dashSliderForm">
      <div class="form-group"><label>Title *</label><input type="text" name="Title" /></div>
      <div class="form-group"><label>Subtitle</label><textarea name="Subtitle" rows="3"></textarea></div>
      <div class="form-group"><label>Background Image URL</label><input type="url" name="ImageURL" placeholder="https://..." /></div>
      <div class="form-group"><label>Button Text</label><input type="text" name="ButtonText" placeholder="Apply Now" /></div>
      <div class="form-group"><label>Button Link</label><input type="text" name="ButtonLink" placeholder="admissions.html" /></div>
    </div>
  `, async () => {
    const data = getFormData("dashSliderForm");
    data.Active = "TRUE";
    if (!data.Title) { showToast("Title zaroori hai!", "error"); return; }
    const result = await apiPost("addSlider", { data });
    if (result.success) { showToast("Slide add ho gayi!", "success"); closeModal(); loadSlidersTable(); }
    else showToast(result.message, "error");
  });
}

function openDashEditSliderModal(id) {
  openModal("Edit Slide", `
    <div id="dashSliderEditForm">
      <div class="form-group"><label>Title</label><input type="text" name="Title" /></div>
      <div class="form-group"><label>Subtitle</label><textarea name="Subtitle" rows="3"></textarea></div>
      <div class="form-group"><label>Image URL</label><input type="url" name="ImageURL" /></div>
      <div class="form-group"><label>Button Text</label><input type="text" name="ButtonText" /></div>
      <div class="form-group"><label>Button Link</label><input type="text" name="ButtonLink" /></div>
      <div class="form-group"><label>Active?</label>
        <select name="Active"><option value="TRUE">Yes</option><option value="FALSE">No</option></select>
      </div>
    </div>
  `, async () => {
    const data = getFormData("dashSliderEditForm");
    const result = await apiPost("updateSlider", { id, data });
    if (result.success) { showToast("Update ho gaya!", "success"); closeModal(); loadSlidersTable(); }
    else showToast(result.message, "error");
  });
}

function openDashAddNoticeModal() {
  openModal("Add Notice", `
    <div id="dashNoticeForm">
      <div class="form-group"><label>Title *</label><input type="text" name="Title" /></div>
      <div class="form-group"><label>Content</label><textarea name="Content" rows="4"></textarea></div>
      <div class="form-group"><label>Category</label>
        <select name="Category">
          <option>General</option><option>Exam</option><option>Holiday</option>
          <option>Event</option><option>Admission</option><option>Fee</option><option>Sports</option>
        </select>
      </div>
      <div class="form-group"><label>Date</label><input type="date" name="Date" value="${new Date().toISOString().split('T')[0]}" /></div>
      <div class="form-group" style="display:flex;align-items:center;gap:10px;">
        <input type="checkbox" id="dashImpCheck" style="width:auto;" />
        <label for="dashImpCheck" style="margin:0;">Mark as Important</label>
      </div>
      <div class="form-group"><label>Attachment URL (PDF)</label><input type="url" name="AttachmentURL" /></div>
    </div>
  `, async () => {
    const data = getFormData("dashNoticeForm");
    data.IsImportant = document.getElementById("dashImpCheck")?.checked ? "TRUE" : "FALSE";
    if (!data.Title) { showToast("Title zaroori hai!", "error"); return; }
    const result = await apiPost("addNotice", { data });
    if (result.success) { showToast("Notice add ho gaya!", "success"); closeModal(); loadNoticesTable(); }
    else showToast(result.message, "error");
  });
}

function openDashEditNoticeModal(id) {
  openModal("Edit Notice", `
    <div id="dashNoticeEditForm">
      <div class="form-group"><label>Title</label><input type="text" name="Title" /></div>
      <div class="form-group"><label>Content</label><textarea name="Content" rows="4"></textarea></div>
      <div class="form-group"><label>Category</label>
        <select name="Category">
          <option>General</option><option>Exam</option><option>Holiday</option>
          <option>Event</option><option>Admission</option><option>Fee</option>
        </select>
      </div>
      <div class="form-group"><label>Date</label><input type="date" name="Date" /></div>
      <div class="form-group"><label>Attachment URL</label><input type="url" name="AttachmentURL" /></div>
    </div>
  `, async () => {
    const data = getFormData("dashNoticeEditForm");
    const result = await apiPost("updateNotice", { id, data });
    if (result.success) { showToast("Update ho gaya!", "success"); closeModal(); loadNoticesTable(); }
    else showToast(result.message, "error");
  });
}

function openDashAddPhotoModal() {
  openModal("Add Photo", `
    <div id="dashPhotoForm">
      <div class="form-group"><label>Image URL *</label><input type="url" name="ImageURL" placeholder="https://..." /></div>
      <div class="form-group"><label>Caption</label><input type="text" name="Caption" /></div>
      <div class="form-group"><label>Category</label>
        <select name="Category">
          <option>Events</option><option>Sports</option><option>Annual Day</option>
          <option>Infrastructure</option><option>Academics</option><option>Other</option>
        </select>
      </div>
      <div class="form-group"><label>Date</label><input type="date" name="Date" value="${new Date().toISOString().split('T')[0]}" /></div>
    </div>
  `, async () => {
    const data = getFormData("dashPhotoForm");
    if (!data.ImageURL) { showToast("Image URL zaroori hai!", "error"); return; }
    const result = await apiPost("addGallery", { data });
    if (result.success) { showToast("Photo add ho gayi!", "success"); closeModal(); loadGalleryTable(); }
    else showToast(result.message, "error");
  });
}

function openDashAddFacultyModal() {
  openModal("Add Faculty Member", `
    <div id="dashFacForm">
      <div class="form-group"><label>Full Name *</label><input type="text" name="Name" /></div>
      <div class="form-group"><label>Designation</label>
        <select name="Designation">
          <option>Principal</option><option>Vice Principal</option><option>PGT</option>
          <option>TGT</option><option>PRT</option><option>PTI</option><option>Other</option>
        </select>
      </div>
      <div class="form-group"><label>Subject / Department</label><input type="text" name="Subject" /></div>
      <div class="form-group"><label>Qualification</label><input type="text" name="Qualification" /></div>
      <div class="form-group"><label>Experience (years)</label><input type="number" name="Experience" /></div>
      <div class="form-group"><label>Photo URL</label><input type="url" name="PhotoURL" /></div>
    </div>
  `, async () => {
    const data = getFormData("dashFacForm");
    if (!data.Name) { showToast("Naam zaroori hai!", "error"); return; }
    const result = await apiPost("addFaculty", { data });
    if (result.success) { showToast("Faculty add ho gaya!", "success"); closeModal(); loadFacultyTable(); }
    else showToast(result.message, "error");
  });
}

function openDashEditFacultyModal(id) {
  openModal("Edit Faculty Member", `
    <div id="dashFacEditForm">
      <div class="form-group"><label>Full Name</label><input type="text" name="Name" /></div>
      <div class="form-group"><label>Designation</label><input type="text" name="Designation" /></div>
      <div class="form-group"><label>Subject</label><input type="text" name="Subject" /></div>
      <div class="form-group"><label>Qualification</label><input type="text" name="Qualification" /></div>
      <div class="form-group"><label>Experience (years)</label><input type="number" name="Experience" /></div>
      <div class="form-group"><label>Photo URL</label><input type="url" name="PhotoURL" /></div>
      <div class="form-group"><label>Bio</label><textarea name="Bio" rows="3"></textarea></div>
    </div>
  `, async () => {
    const data = getFormData("dashFacEditForm");
    const result = await apiPost("updateFaculty", { id, data });
    if (result.success) { showToast("Update ho gaya!", "success"); closeModal(); loadFacultyTable(); }
    else showToast(result.message, "error");
  });
}

function openDashAddResultModal() {
  openModal("Add Result", `
    <div id="dashResultForm">
      <div class="form-group"><label>Class *</label><input type="text" name="Class" placeholder="Class X Board" /></div>
      <div class="form-group"><label>Year *</label><input type="text" name="Year" value="${new Date().getFullYear()}" /></div>
      <div class="form-group"><label>Title</label><input type="text" name="Title" placeholder="100% Pass Rate" /></div>
      <div class="form-group"><label>Description</label><textarea name="Description" rows="3"></textarea></div>
      <div class="form-group"><label>Highlights</label><input type="text" name="Highlights" placeholder="Top: 98%, Average: 82%" /></div>
      <div class="form-group"><label>PDF URL</label><input type="url" name="FileURL" /></div>
    </div>
  `, async () => {
    const data = getFormData("dashResultForm");
    if (!data.Class) { showToast("Class zaroori hai!", "error"); return; }
    const result = await apiPost("addResult", { data });
    if (result.success) { showToast("Result add ho gaya!", "success"); closeModal(); loadResultsTable(); }
    else showToast(result.message, "error");
  });
}

function openDashEditResultModal(id) {
  openModal("Edit Result", `
    <div id="dashResultEditForm">
      <div class="form-group"><label>Class</label><input type="text" name="Class" /></div>
      <div class="form-group"><label>Year</label><input type="text" name="Year" /></div>
      <div class="form-group"><label>Title</label><input type="text" name="Title" /></div>
      <div class="form-group"><label>Description</label><textarea name="Description" rows="3"></textarea></div>
      <div class="form-group"><label>Highlights</label><input type="text" name="Highlights" /></div>
      <div class="form-group"><label>PDF URL</label><input type="url" name="FileURL" /></div>
    </div>
  `, async () => {
    const data = getFormData("dashResultEditForm");
    const result = await apiPost("updateResult", { id, data });
    if (result.success) { showToast("Update ho gaya!", "success"); closeModal(); loadResultsTable(); }
    else showToast(result.message, "error");
  });
}

function openDashAddAchModal() {
  openModal("Add Achievement", `
    <div id="dashAchForm">
      <div class="form-group"><label>Title *</label><input type="text" name="Title" /></div>
      <div class="form-group"><label>Description</label><textarea name="Description" rows="3"></textarea></div>
      <div class="form-group"><label>Year</label><input type="text" name="Year" value="${new Date().getFullYear()}" /></div>
      <div class="form-group"><label>Category</label>
        <select name="Category"><option>Academic</option><option>Sports</option><option>Cultural</option><option>Award</option><option>Other</option></select>
      </div>
    </div>
  `, async () => {
    const data = getFormData("dashAchForm");
    if (!data.Title) { showToast("Title zaroori hai!", "error"); return; }
    const result = await apiPost("addAchievement", { data });
    if (result.success) { showToast("Achievement add ho gayi!", "success"); closeModal(); loadAchievementsTable(); }
    else showToast(result.message, "error");
  });
}

function openDashEditAchModal(id) {
  openModal("Edit Achievement", `
    <div id="dashAchEditForm">
      <div class="form-group"><label>Title</label><input type="text" name="Title" /></div>
      <div class="form-group"><label>Description</label><textarea name="Description" rows="3"></textarea></div>
      <div class="form-group"><label>Year</label><input type="text" name="Year" /></div>
      <div class="form-group"><label>Category</label>
        <select name="Category"><option>Academic</option><option>Sports</option><option>Cultural</option><option>Award</option><option>Other</option></select>
      </div>
    </div>
  `, async () => {
    const data = getFormData("dashAchEditForm");
    const result = await apiPost("updateAchievement", { id, data });
    if (result.success) { showToast("Update ho gaya!", "success"); closeModal(); loadAchievementsTable(); }
    else showToast(result.message, "error");
  });
}

function openDashAddFeeModal() {
  openModal("Add Fee Entry", `
    <div id="dashFeeForm">
      <div class="form-group"><label>Class *</label><input type="text" name="Class" placeholder="Class I – V" /></div>
      <div class="form-group"><label>Fee Type *</label><input type="text" name="FeeType" placeholder="Tuition Fee (Monthly)" /></div>
      <div class="form-group"><label>Amount (₹) *</label><input type="number" name="Amount" /></div>
      <div class="form-group"><label>Session</label><input type="text" name="Session" value="${new Date().getFullYear()}-${String(new Date().getFullYear()+1).slice(-2)}" /></div>
      <div class="form-group"><label>Due Date</label><input type="text" name="DueDate" placeholder="10th of every month" /></div>
      <div class="form-group"><label>Notes</label><input type="text" name="Notes" /></div>
    </div>
  `, async () => {
    const data = getFormData("dashFeeForm");
    if (!data.Class || !data.FeeType || !data.Amount) { showToast("Class, Type aur Amount zaroori hain!", "error"); return; }
    const result = await apiPost("addFee", { data });
    if (result.success) { showToast("Fee entry add ho gayi!", "success"); closeModal(); loadFeesTable(); }
    else showToast(result.message, "error");
  });
}

function openDashEditFeeModal(id) {
  openModal("Edit Fee Entry", `
    <div id="dashFeeEditForm">
      <div class="form-group"><label>Class</label><input type="text" name="Class" /></div>
      <div class="form-group"><label>Fee Type</label><input type="text" name="FeeType" /></div>
      <div class="form-group"><label>Amount (₹)</label><input type="number" name="Amount" /></div>
      <div class="form-group"><label>Session</label><input type="text" name="Session" /></div>
      <div class="form-group"><label>Due Date</label><input type="text" name="DueDate" /></div>
      <div class="form-group"><label>Notes</label><input type="text" name="Notes" /></div>
    </div>
  `, async () => {
    const data = getFormData("dashFeeEditForm");
    const result = await apiPost("updateFee", { id, data });
    if (result.success) { showToast("Update ho gaya!", "success"); closeModal(); loadFeesTable(); }
    else showToast(result.message, "error");
  });
}

function openAddUserModal() {
  openModal("Change Admin Password", `
    <div id="userForm">
      <p style="color:var(--text-light);font-size:0.85rem;margin-bottom:16px;">
        Password change karne ke liye Google Sheet ki <strong>Users</strong> tab mein directly edit karein.<br>
        Ya neeche apna username aur naya password enter karein (Google Sheet update hoga).
      </p>
      <div class="form-group"><label>Username *</label><input type="text" name="Username" placeholder="admin" /></div>
      <div class="form-group"><label>New Password *</label><input type="password" name="Password" placeholder="Minimum 6 characters" /></div>
      <div class="form-group"><label>Role</label>
        <select name="Role"><option value="superadmin">Super Admin</option><option value="admin">Admin</option></select>
      </div>
    </div>
    <p style="color:#e74c3c;font-size:0.82rem;margin-top:12px;">
      <i class="fas fa-exclamation-triangle"></i> Note: This directly updates Google Sheet. Use carefully.
    </p>
  `, () => {
    showToast("Google Sheet mein directly Users tab update karein for security.", "error");
    closeModal();
  });
}

// ============================================================
// MODAL HELPERS (override global for dashboard)
// ============================================================
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
  if (typeof modalSaveCallback === "function") modalSaveCallback();
}

// Close on overlay click
document.addEventListener("click", (e) => {
  const overlay = document.getElementById("globalModal");
  if (overlay && e.target === overlay) closeModal();
});
