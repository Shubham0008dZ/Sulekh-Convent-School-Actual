// ============================================================
// SULEKH CONVENT SCHOOL - About Page JS
// File: js/about.js
// ============================================================

// isAdminStub needed in about.html inline template
function isAdminStub() { return ""; }

document.addEventListener("DOMContentLoaded", () => {
  loadAboutContent();
  initScrollReveal();
});

async function loadAboutContent() {
  try {
    const result = await apiGet("getAbout");
    if (!result.success || !result.data.length) return;

    result.data.forEach(row => {
      const el = document.querySelector(`[data-editable="${row.Field}"]`);
      if (el && row.Content) el.innerHTML = row.Content;
    });
  } catch (e) {
    console.log("About content load skipped");
  }
}

// Admin inline edit for about page
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-editable]");
  if (!el || !isAdmin()) return;

  const field = el.dataset.editable;
  const currentContent = el.innerHTML;

  openModal(`Edit: ${field}`, `
    <div id="aboutEditForm">
      <div class="form-group">
        <label>Content (HTML allowed)</label>
        <textarea name="Content" style="min-height:160px;">${currentContent}</textarea>
      </div>
    </div>
  `, async () => {
    const content = document.querySelector("#aboutEditForm textarea[name='Content']").value;
    const result = await apiPost("updateAbout", {
      id: field,
      data: { Field: field, Content: content }
    });
    if (result.success) {
      el.innerHTML = content;
      showToast("Content update ho gaya!", "success");
      closeModal();
    } else {
      showToast(result.message || "Error!", "error");
    }
  });
});
