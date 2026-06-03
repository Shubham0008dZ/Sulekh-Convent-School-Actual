// ============================================================
// SULEKH CONVENT SCHOOL - Faculty JS
// File: js/faculty.js
// ============================================================

let allFaculty = [];

document.addEventListener("DOMContentLoaded", () => {
  loadFaculty();
  initFilters();
});

async function loadFaculty() {
  try {
    const result = await apiGet("getFaculty");
    if (result.success && result.data.length) {
      allFaculty = result.data;
      renderFaculty(allFaculty);
    } else {
      renderDefaultFaculty();
    }
  } catch (e) {
    renderDefaultFaculty();
  }
}

function renderFaculty(data) {
  const grid = document.getElementById("facultyGrid");
  if (!data.length) {
    grid.innerHTML = `<div class="no-data"><i class="fas fa-users"></i><p>Koi faculty member nahi mili.</p></div>`;
    return;
  }

  grid.innerHTML = data.map(f => `
    <div class="faculty-card" data-dept="${sanitize(f.Subject || '')}">
      ${f.PhotoURL
        ? `<img class="faculty-photo" src="${f.PhotoURL}" alt="${sanitize(f.Name)}" onerror="this.parentElement.querySelector('.faculty-photo-placeholder').style.display='flex';this.style.display='none'"/>`
        : ''}
      <div class="faculty-photo-placeholder" ${f.PhotoURL ? 'style="display:none"' : ''}>
        <i class="fas fa-user-tie"></i>
      </div>
      <div class="faculty-info">
        <h3>${sanitize(f.Name)}</h3>
        <div class="faculty-desig">${sanitize(f.Designation || 'Teacher')}</div>
        <p class="faculty-subject"><i class="fas fa-book"></i> ${sanitize(f.Subject || '')}</p>
        <p class="faculty-qual">${sanitize(f.Qualification || '')}</p>
        ${f.Experience ? `<p class="faculty-exp"><i class="fas fa-clock"></i> ${sanitize(f.Experience)} years experience</p>` : ''}
        ${isAdmin() ? `
        <div class="admin-actions">
          <button class="btn-edit-item" onclick="openEditFacultyModal('${f.ID}', this)"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-delete-item" onclick="deleteItem('deleteFaculty', '${f.ID}', loadFaculty)"><i class="fas fa-trash"></i></button>
        </div>` : ''}
      </div>
    </div>
  `).join('');
}

function renderDefaultFaculty() {
  const defaults = [
    { Name: "Principal", Designation: "Principal", Subject: "Administration", Qualification: "M.A., B.Ed., Ph.D.", Experience: "20" },
    { Name: "Vice Principal", Designation: "Vice Principal", Subject: "Administration", Qualification: "M.Sc., B.Ed.", Experience: "15" },
    { Name: "Senior Teacher", Designation: "PGT", Subject: "Mathematics", Qualification: "M.Sc. Mathematics, B.Ed.", Experience: "12" },
    { Name: "Science Teacher", Designation: "PGT", Subject: "Science", Qualification: "M.Sc. Physics, B.Ed.", Experience: "10" },
    { Name: "English Teacher", Designation: "TGT", Subject: "Languages", Qualification: "M.A. English, B.Ed.", Experience: "8" },
    { Name: "Hindi Teacher", Designation: "TGT", Subject: "Languages", Qualification: "M.A. Hindi, B.Ed.", Experience: "9" },
    { Name: "Social Science", Designation: "TGT", Subject: "Social Science", Qualification: "M.A. History, B.Ed.", Experience: "7" },
    { Name: "Computer Teacher", Designation: "PRT", Subject: "Science", Qualification: "MCA, B.Ed.", Experience: "6" },
  ];
  allFaculty = defaults.map((f, i) => ({ ...f, ID: "default_" + i }));
  renderFaculty(allFaculty);
}

function initFilters() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      if (filter === "all") {
        renderFaculty(allFaculty);
      } else {
        const filtered = allFaculty.filter(f =>
          (f.Subject || "").toLowerCase().includes(filter.toLowerCase()) ||
          (f.Designation || "").toLowerCase().includes(filter.toLowerCase())
        );
        renderFaculty(filtered);
      }
    });
  });
}

// Admin modals
function openAddFacultyModal() {
  openModal("Add Faculty Member", `
    <div id="facForm">
      <div class="form-group"><label>Full Name *</label><input type="text" name="Name" placeholder="Teacher ka naam" /></div>
      <div class="form-group"><label>Designation</label>
        <select name="Designation">
          <option>Principal</option><option>Vice Principal</option><option>PGT</option>
          <option>TGT</option><option>PRT</option><option>PTI</option><option>Other</option>
        </select>
      </div>
      <div class="form-group"><label>Subject / Department</label><input type="text" name="Subject" placeholder="e.g. Mathematics" /></div>
      <div class="form-group"><label>Qualification</label><input type="text" name="Qualification" placeholder="e.g. M.Sc., B.Ed." /></div>
      <div class="form-group"><label>Experience (years)</label><input type="number" name="Experience" placeholder="10" /></div>
      <div class="form-group"><label>Photo URL (optional)</label><input type="url" name="PhotoURL" placeholder="https://..." /></div>
      <div class="form-group"><label>Short Bio</label><textarea name="Bio" rows="3"></textarea></div>
    </div>
  `, async () => {
    const data = getFormData("facForm");
    if (!data.Name) { showToast("Naam zaroori hai!", "error"); return; }
    const result = await apiPost("addFaculty", { data });
    if (result.success) { showToast("Faculty member add ho gaya!", "success"); closeModal(); loadFaculty(); }
    else showToast(result.message, "error");
  });
}

function openEditFacultyModal(id, btn) {
  const card = btn.closest(".faculty-card");
  const name  = card.querySelector("h3").textContent;
  const desig = card.querySelector(".faculty-desig").textContent;
  const subj  = card.querySelector(".faculty-subject").textContent.replace("", "").trim();
  const qual  = card.querySelector(".faculty-qual").textContent;

  openModal("Edit Faculty Member", `
    <div id="facEditForm">
      <div class="form-group"><label>Full Name</label><input type="text" name="Name" value="${sanitize(name)}" /></div>
      <div class="form-group"><label>Designation</label><input type="text" name="Designation" value="${sanitize(desig)}" /></div>
      <div class="form-group"><label>Subject</label><input type="text" name="Subject" value="${sanitize(subj)}" /></div>
      <div class="form-group"><label>Qualification</label><input type="text" name="Qualification" value="${sanitize(qual)}" /></div>
      <div class="form-group"><label>Experience (years)</label><input type="number" name="Experience" /></div>
      <div class="form-group"><label>Photo URL</label><input type="url" name="PhotoURL" /></div>
      <div class="form-group"><label>Bio</label><textarea name="Bio" rows="3"></textarea></div>
    </div>
  `, async () => {
    const data = getFormData("facEditForm");
    const result = await apiPost("updateFaculty", { id, data });
    if (result.success) { showToast("Update ho gaya!", "success"); closeModal(); loadFaculty(); }
    else showToast(result.message, "error");
  });
}
