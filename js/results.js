// ============================================================
// SULEKH CONVENT SCHOOL - Results JS
// File: js/results.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  loadResults();
  loadAchievements();
  loadToppers();
});

async function loadResults() {
  try {
    const result = await apiGet("getResults");
    if (result.success && result.data.length) renderResults(result.data);
    else renderDefaultResults();
  } catch (e) { renderDefaultResults(); }
}

function renderResults(data) {
  const grid = document.getElementById("resultsGrid");
  grid.innerHTML = data.map(r => `
    <div class="result-card">
      <div class="result-year">${sanitize(r.Year || '')}</div>
      <div class="result-class">${sanitize(r.Class || '')}</div>
      <div class="result-title">${sanitize(r.Title || '')}</div>
      <div class="result-desc">${sanitize(r.Description || '')}</div>
      ${r.Highlights ? `<div class="result-highlights"><i class="fas fa-star"></i> ${sanitize(r.Highlights)}</div>` : ''}
      ${r.FileURL ? `<a href="${r.FileURL}" target="_blank" class="result-link"><i class="fas fa-download"></i> Download Result</a>` : ''}
      ${isAdmin() ? `
      <div class="admin-actions">
        <button class="btn-edit-item" onclick="openEditResultModal('${r.ID}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn-delete-item" onclick="deleteItem('deleteResult','${r.ID}',loadResults)"><i class="fas fa-trash"></i></button>
      </div>` : ''}
    </div>
  `).join('');
}

function renderDefaultResults() {
  const defaults = [
    { Year: "2024", Class: "Class X Board", Title: "100% Pass Rate", Description: "All students passed Class X board exams with flying colors.", Highlights: "Top score: 98% | Average: 82%" },
    { Year: "2024", Class: "Class XII Science", Title: "Excellent Board Results", Description: "Outstanding performance in senior secondary board examinations.", Highlights: "Top score: 97% | Average: 80%" },
    { Year: "2023", Class: "Class X Board", Title: "95% Pass Rate", Description: "Consistent academic excellence maintained in board results.", Highlights: "Top score: 96% | Average: 79%" },
  ];
  document.getElementById("resultsGrid").innerHTML = defaults.map(r => `
    <div class="result-card">
      <div class="result-year">${r.Year}</div>
      <div class="result-class">${r.Class}</div>
      <div class="result-title">${r.Title}</div>
      <div class="result-desc">${r.Description}</div>
      <div class="result-highlights"><i class="fas fa-star"></i> ${r.Highlights}</div>
    </div>
  `).join('');
}

async function loadAchievements() {
  try {
    const result = await apiGet("getAchievements");
    if (result.success && result.data.length) renderAchievements(result.data);
    else renderDefaultAchievements();
  } catch (e) { renderDefaultAchievements(); }
}

const ACH_ICONS = ["fas fa-trophy","fas fa-medal","fas fa-award","fas fa-star","fas fa-certificate","fas fa-crown"];

function renderAchievements(data) {
  document.getElementById("achFullGrid").innerHTML = data.map((a, i) => `
    <div class="ach-full-card">
      <div class="ach-full-icon"><i class="${ACH_ICONS[i % ACH_ICONS.length]}"></i></div>
      <div class="ach-full-content">
        <h4>${sanitize(a.Title)}</h4>
        <p>${sanitize(a.Description)}</p>
        <div class="ach-meta">
          ${a.Year ? `<span class="ach-tag"><i class="fas fa-calendar"></i> ${sanitize(a.Year)}</span>` : ''}
          ${a.Category ? `<span class="ach-tag">${sanitize(a.Category)}</span>` : ''}
        </div>
        ${isAdmin() ? `
        <div class="admin-actions">
          <button class="btn-edit-item" onclick="openEditAchModal('${a.ID}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-delete-item" onclick="deleteItem('deleteAchievement','${a.ID}',loadAchievements)"><i class="fas fa-trash"></i></button>
        </div>` : ''}
      </div>
    </div>
  `).join('');
}

function renderDefaultAchievements() {
  const d = [
    { Title:"Best School Award", Description:"Received Best School Award from District Education Board for academic excellence.", Year:"2024", Category:"Academic" },
    { Title:"100% Board Results", Description:"Achieved 100% pass rate in Class X & XII consistently.", Year:"2024", Category:"Academic" },
    { Title:"Sports District Champions", Description:"Won district-level inter-school athletics competition.", Year:"2023", Category:"Sports" },
    { Title:"Science Olympiad Winners", Description:"Students won gold medals in National Science Olympiad.", Year:"2023", Category:"Academic" },
  ];
  renderAchievements(d);
}

async function loadToppers() {
  // Toppers come from Results sheet with Title containing "Topper"
  // For now render static defaults
  const defaults = [
    { name:"Ananya Sharma", cls:"Class XII", marks:"98%", rank:1 },
    { name:"Rahul Verma", cls:"Class X", marks:"97%", rank:2 },
    { name:"Priya Singh", cls:"Class XII", marks:"96%", rank:3 },
    { name:"Amit Gupta", cls:"Class X", marks:"95%", rank:4 },
    { name:"Sneha Joshi", cls:"Class XII", marks:"94%", rank:5 },
  ];
  const rankClass = ["gold","silver","bronze","",""];
  document.getElementById("toppersGrid").innerHTML = defaults.map((t, i) => `
    <div class="topper-card">
      <div class="topper-rank ${rankClass[i]}">${t.rank}</div>
      <div class="topper-placeholder"><i class="fas fa-user-graduate"></i></div>
      <div class="topper-name">${t.name}</div>
      <div class="topper-class">${t.cls}</div>
      <div class="topper-marks">${t.marks}</div>
    </div>
  `).join('');
}

// Admin Modals
function openAddResultModal() {
  openModal("Add Result", `
    <div id="resultForm">
      <div class="form-group"><label>Class *</label><input type="text" name="Class" placeholder="e.g. Class X Board" /></div>
      <div class="form-group"><label>Year *</label><input type="text" name="Year" placeholder="2024" value="${new Date().getFullYear()}" /></div>
      <div class="form-group"><label>Title</label><input type="text" name="Title" placeholder="e.g. 100% Pass Rate" /></div>
      <div class="form-group"><label>Description</label><textarea name="Description"></textarea></div>
      <div class="form-group"><label>Highlights</label><input type="text" name="Highlights" placeholder="Top score, pass %" /></div>
      <div class="form-group"><label>Result PDF URL (Google Drive)</label><input type="url" name="FileURL" /></div>
    </div>
  `, async () => {
    const data = getFormData("resultForm");
    if (!data.Class) { showToast("Class zaroori hai!", "error"); return; }
    const result = await apiPost("addResult", { data });
    if (result.success) { showToast("Result add ho gaya!", "success"); closeModal(); loadResults(); }
    else showToast(result.message, "error");
  });
}

function openEditResultModal(id) {
  openModal("Edit Result", `
    <div id="resultEditForm">
      <div class="form-group"><label>Class</label><input type="text" name="Class" /></div>
      <div class="form-group"><label>Year</label><input type="text" name="Year" /></div>
      <div class="form-group"><label>Title</label><input type="text" name="Title" /></div>
      <div class="form-group"><label>Description</label><textarea name="Description"></textarea></div>
      <div class="form-group"><label>Highlights</label><input type="text" name="Highlights" /></div>
      <div class="form-group"><label>PDF URL</label><input type="url" name="FileURL" /></div>
    </div>
  `, async () => {
    const data = getFormData("resultEditForm");
    const result = await apiPost("updateResult", { id, data });
    if (result.success) { showToast("Update ho gaya!", "success"); closeModal(); loadResults(); }
    else showToast(result.message, "error");
  });
}

function openAddAchModal() {
  openModal("Add Achievement", `
    <div id="achForm">
      <div class="form-group"><label>Title *</label><input type="text" name="Title" /></div>
      <div class="form-group"><label>Description</label><textarea name="Description"></textarea></div>
      <div class="form-group"><label>Year</label><input type="text" name="Year" value="${new Date().getFullYear()}" /></div>
      <div class="form-group"><label>Category</label>
        <select name="Category"><option>Academic</option><option>Sports</option><option>Cultural</option><option>Award</option><option>Other</option></select>
      </div>
    </div>
  `, async () => {
    const data = getFormData("achForm");
    const result = await apiPost("addAchievement", { data });
    if (result.success) { showToast("Add ho gaya!", "success"); closeModal(); loadAchievements(); }
    else showToast(result.message, "error");
  });
}

function openAddTopperModal() {
  openModal("Add Topper", `
    <div id="topperForm">
      <p style="color:var(--text-light);font-size:0.85rem;margin-bottom:16px;">Toppers ko Results sheet mein save kiya jayega.</p>
      <div class="form-group"><label>Student Name *</label><input type="text" name="Title" placeholder="Student ka naam" /></div>
      <div class="form-group"><label>Class</label><input type="text" name="Class" placeholder="Class X / XII" /></div>
      <div class="form-group"><label>Marks / Percentage</label><input type="text" name="Highlights" placeholder="95%" /></div>
      <div class="form-group"><label>Year</label><input type="text" name="Year" value="${new Date().getFullYear()}" /></div>
      <div class="form-group"><label>Photo URL</label><input type="url" name="FileURL" /></div>
    </div>
  `, async () => {
    const data = getFormData("topperForm");
    data.Description = "Topper";
    const result = await apiPost("addResult", { data });
    if (result.success) { showToast("Topper add ho gaya!", "success"); closeModal(); loadToppers(); }
    else showToast(result.message, "error");
  });
}
