// ============================================================
// SULEKH CONVENT SCHOOL - Academics JS
// File: js/academics.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  loadAcademicsData();
});

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const tab = document.getElementById("tab-" + btn.dataset.tab);
      if (tab) tab.classList.add("active");
    });
  });
}

async function loadAcademicsData() {
  try {
    const result = await apiGet("getAcademics");
    if (!result.success || !result.data.length) return;
    result.data.forEach(row => {
      const el = document.querySelector(`[data-editable="${row.Field || row.Section}"]`);
      if (el && row.Content) el.innerHTML = row.Content;
    });
  } catch (e) {}
}

// Admin inline edit
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-editable]");
  if (!el || !isAdmin()) return;
  const field = el.dataset.editable;

  openModal(`Edit: ${field}`, `
    <div id="acEditForm">
      <div class="form-group">
        <label>Content</label>
        <textarea name="Content" style="min-height:140px;">${el.innerHTML}</textarea>
      </div>
    </div>
  `, async () => {
    const content = document.querySelector("#acEditForm textarea").value;
    const result = await apiPost("updateAcademics", { id: field, data: { Field: field, Content: content } });
    if (result.success) {
      el.innerHTML = content;
      showToast("Update ho gaya!", "success");
      closeModal();
    } else showToast(result.message, "error");
  });
});

function openAddActivityModal() {
  openModal("Add Co-curricular Activity", `
    <div id="actForm">
      <div class="form-group"><label>Activity Name</label><input type="text" name="Title" /></div>
      <div class="form-group"><label>Description</label><textarea name="Content"></textarea></div>
      <div class="form-group"><label>Icon Class (Font Awesome)</label><input type="text" name="Icon" placeholder="fas fa-running" /></div>
    </div>
  `, async () => {
    const data = getFormData("actForm");
    data.Section = "activity";
    const result = await apiPost("addAcademics", { data });
    if (result.success) { showToast("Activity add ho gayi!", "success"); closeModal(); location.reload(); }
    else showToast(result.message, "error");
  });
}
