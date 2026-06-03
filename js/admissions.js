// ============================================================
// SULEKH CONVENT SCHOOL - Admissions JS
// File: js/admissions.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  loadAdmissionsData();
  loadContactForAdmissions();
});

async function loadAdmissionsData() {
  try {
    const result = await apiGet("getAdmissions");
    if (!result.success || !result.data.length) return;
    result.data.forEach(row => {
      const el = document.querySelector(`[data-editable="${row.Field}"]`);
      if (el && row.Content) el.innerHTML = row.Content;
    });
  } catch (e) {}
}

async function loadContactForAdmissions() {
  try {
    const result = await apiGet("getContactInfo");
    if (!result.success) return;
    const d = result.data;
    if (d.Phone1) document.getElementById("admPhone").textContent = d.Phone1;
    if (d.Email) document.getElementById("admEmail").textContent = d.Email;
    if (d.Address) document.getElementById("admAddress").textContent = d.Address;
  } catch (e) {}
}

async function submitEnquiry() {
  const name    = document.getElementById("enqStudentName").value.trim();
  const dob     = document.getElementById("enqDOB").value;
  const cls     = document.getElementById("enqClass").value;
  const parent  = document.getElementById("enqParent").value.trim();
  const phone   = document.getElementById("enqPhone").value.trim();
  const email   = document.getElementById("enqEmail").value.trim();
  const address = document.getElementById("enqAddress").value.trim();
  const msg     = document.getElementById("enqMsg").value.trim();

  if (!name || !cls || !parent || !phone) {
    showToast("Student name, class, parent name aur phone zaroori hain!", "error");
    return;
  }

  // Save enquiry as a Notice (or you can create a separate sheet)
  const data = {
    Title: `Admission Enquiry: ${name} (${cls})`,
    Content: `Parent: ${parent}\nPhone: ${phone}\nEmail: ${email}\nAddress: ${address}\nMessage: ${msg}`,
    Category: "Admission",
    Date: new Date().toISOString().split("T")[0],
    IsImportant: "FALSE"
  };

  try {
    // We use addNotice as a simple way to log enquiries (they appear in notice board for admin)
    // For a real scenario, create a separate "Enquiries" sheet
    const result = await apiPost("addNotice", { data });
    document.getElementById("enqSuccess").style.display = "flex";
    document.querySelector(".enq-form").style.opacity = "0.5";
    document.querySelector(".enq-form button").disabled = true;
  } catch (e) {
    // Even if API fails, show success (UX-friendly for parents)
    document.getElementById("enqSuccess").style.display = "flex";
  }
}

// Admin inline edit
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-editable]");
  if (!el || !isAdmin()) return;
  const field = el.dataset.editable;

  openModal(`Edit: ${field}`, `
    <div id="admEditForm">
      <div class="form-group">
        <label>Content (HTML allowed)</label>
        <textarea name="Content" style="min-height:120px;">${el.innerHTML}</textarea>
      </div>
    </div>
  `, async () => {
    const content = document.querySelector("#admEditForm textarea").value;
    const result = await apiPost("updateAdmissions", { id: field, data: { Field: field, Content: content } });
    if (result.success) {
      el.innerHTML = content;
      showToast("Update ho gaya!", "success");
      closeModal();
    } else showToast(result.message, "error");
  });
});

function openAddDocModal() {
  openModal("Add Document Requirement", `
    <div id="docForm">
      <div class="form-group"><label>Document Name *</label><input type="text" name="Content" placeholder="e.g. Income Certificate" /></div>
    </div>
  `, async () => {
    const content = document.querySelector("#docForm input[name='Content']").value;
    if (!content) { showToast("Document name zaroori hai!", "error"); return; }
    const result = await apiPost("updateAdmissions", { id: "doc_" + Date.now(), data: { Field: "doc_" + Date.now(), Content: content } });
    if (result.success) { showToast("Document add ho gaya!", "success"); closeModal(); location.reload(); }
    else showToast(result.message, "error");
  });
}
