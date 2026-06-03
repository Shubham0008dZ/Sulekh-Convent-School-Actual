// ============================================================
// SULEKH CONVENT SCHOOL - Notice Board JS
// File: js/noticeboard.js
// ============================================================

let allNotices = [];
let currentCat = "all";

document.addEventListener("DOMContentLoaded", () => {
  loadNotices();
  initCatFilters();
});

async function loadNotices() {
  try {
    const result = await apiGet("getNotices");
    if (result.success) {
      allNotices = result.data;
      renderNotices(allNotices);
    } else renderNotices([]);
  } catch (e) { renderNotices([]); }
}

function renderNotices(data) {
  const list = document.getElementById("noticeList");
  if (!data.length) {
    list.innerHTML = `<div class="no-notices"><i class="fas fa-bell-slash"></i><p>Koi notice nahi hai abhi.</p></div>`;
    return;
  }

  list.innerHTML = data.map(n => `
    <div class="notice-full-card ${n.IsImportant === "TRUE" ? "important" : ""}">
      <div class="nf-category">${sanitize(n.Category || 'General')}</div>
      <div class="nf-top">
        <div class="nf-title">
          ${sanitize(n.Title)}
          ${n.IsImportant === "TRUE" ? '<span class="nf-important-badge">Important</span>' : ''}
        </div>
        <div class="nf-meta">
          <span><i class="fas fa-calendar"></i>${formatDate(n.Date)}</span>
        </div>
      </div>
      ${n.Content ? `<div class="nf-content">${sanitize(n.Content)}</div>` : ''}
      ${n.AttachmentURL ? `<a href="${n.AttachmentURL}" target="_blank" class="nf-attachment"><i class="fas fa-paperclip"></i> Download Attachment</a>` : ''}
      ${isAdmin() ? `
      <div class="admin-actions" style="margin-top:14px;">
        <button class="btn-edit-item" onclick="openEditNotice('${n.ID}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn-delete-item" onclick="deleteItem('deleteNotice','${n.ID}',loadNotices)"><i class="fas fa-trash"></i> Delete</button>
      </div>` : ''}
    </div>
  `).join('');
}

function initCatFilters() {
  document.querySelectorAll(".notice-cat-filters .filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".notice-cat-filters .filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCat = btn.dataset.cat;
      filterNotices();
    });
  });
}

function filterNotices() {
  const search = document.getElementById("noticeSearch").value.toLowerCase();
  let filtered = allNotices;
  if (currentCat !== "all") filtered = filtered.filter(n => n.Category === currentCat);
  if (search) filtered = filtered.filter(n =>
    (n.Title || "").toLowerCase().includes(search) ||
    (n.Content || "").toLowerCase().includes(search)
  );
  renderNotices(filtered);
}

function openAddNoticeModal() {
  openModal("Add New Notice", `
    <div id="noticeForm">
      <div class="form-group"><label>Notice Title *</label><input type="text" name="Title" /></div>
      <div class="form-group"><label>Content / Details</label><textarea name="Content" rows="4"></textarea></div>
      <div class="form-group"><label>Category</label>
        <select name="Category">
          <option>General</option><option>Exam</option><option>Holiday</option>
          <option>Event</option><option>Admission</option><option>Fee</option><option>Sports</option>
        </select>
      </div>
      <div class="form-group"><label>Date</label><input type="date" name="Date" value="${new Date().toISOString().split('T')[0]}" /></div>
      <div class="form-group" style="display:flex;align-items:center;gap:10px;">
        <input type="checkbox" name="IsImportant" id="impCheck" style="width:auto;" />
        <label for="impCheck" style="margin:0;">Mark as Important</label>
      </div>
      <div class="form-group"><label>Attachment URL (Google Drive PDF)</label><input type="url" name="AttachmentURL" /></div>
    </div>
  `, async () => {
    const data = getFormData("noticeForm");
    data.IsImportant = document.getElementById("impCheck").checked ? "TRUE" : "FALSE";
    if (!data.Title) { showToast("Title zaroori hai!", "error"); return; }
    const result = await apiPost("addNotice", { data });
    if (result.success) { showToast("Notice add ho gaya!", "success"); closeModal(); loadNotices(); }
    else showToast(result.message, "error");
  });
}

function openEditNotice(id) {
  const notice = allNotices.find(n => n.ID === id);
  if (!notice) return;
  openModal("Edit Notice", `
    <div id="noticeEditForm">
      <div class="form-group"><label>Title</label><input type="text" name="Title" value="${sanitize(notice.Title)}" /></div>
      <div class="form-group"><label>Content</label><textarea name="Content" rows="4">${sanitize(notice.Content || '')}</textarea></div>
      <div class="form-group"><label>Category</label>
        <select name="Category">
          <option ${notice.Category==='General'?'selected':''}>General</option>
          <option ${notice.Category==='Exam'?'selected':''}>Exam</option>
          <option ${notice.Category==='Holiday'?'selected':''}>Holiday</option>
          <option ${notice.Category==='Event'?'selected':''}>Event</option>
          <option ${notice.Category==='Admission'?'selected':''}>Admission</option>
          <option ${notice.Category==='Fee'?'selected':''}>Fee</option>
        </select>
      </div>
      <div class="form-group"><label>Date</label><input type="date" name="Date" value="${notice.Date || ''}" /></div>
      <div class="form-group"><label>Attachment URL</label><input type="url" name="AttachmentURL" value="${notice.AttachmentURL || ''}" /></div>
    </div>
  `, async () => {
    const data = getFormData("noticeEditForm");
    const result = await apiPost("updateNotice", { id, data });
    if (result.success) { showToast("Notice update ho gaya!", "success"); closeModal(); loadNotices(); }
    else showToast(result.message, "error");
  });
}
