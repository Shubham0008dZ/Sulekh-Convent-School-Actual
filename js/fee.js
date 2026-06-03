// ============================================================
// SULEKH CONVENT SCHOOL - Fee Structure JS
// File: js/fee.js
// ============================================================

let allFees = [];
let currentSession = "";

document.addEventListener("DOMContentLoaded", () => {
  loadFeeStructure();
  initEditableNotes();
});

async function loadFeeStructure() {
  try {
    const result = await apiGet("getFeeStructure");
    if (result.success && result.data.length) {
      allFees = result.data;
      buildSessionTabs(allFees);
    } else {
      renderDefaultFees();
    }
  } catch (e) {
    renderDefaultFees();
  }
}

function buildSessionTabs(data) {
  const sessions = [...new Set(data.map(f => f.Session).filter(Boolean))];
  const tabsEl = document.getElementById("feeSessionTabs");

  if (!sessions.length) { renderFeeTable(data); return; }

  currentSession = sessions[0];
  tabsEl.innerHTML = sessions.map((s, i) => `
    <button class="tab-btn ${i === 0 ? 'active' : ''}" onclick="switchSession('${s}', this)">${sanitize(s)}</button>
  `).join('');

  renderFeeTable(data.filter(f => f.Session === currentSession));
}

function switchSession(session, btn) {
  currentSession = session;
  document.querySelectorAll("#feeSessionTabs .tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderFeeTable(allFees.filter(f => f.Session === session));
}

function renderFeeTable(data) {
  const wrap = document.getElementById("feeTableWrap");
  if (!data.length) {
    wrap.innerHTML = `<div class="fee-no-data"><i class="fas fa-rupee-sign"></i><p>Is session ki fee abhi add nahi ki gayi.</p></div>`;
    return;
  }

  // Group by Class
  const byClass = {};
  data.forEach(row => {
    const cls = row.Class || "General";
    if (!byClass[cls]) byClass[cls] = [];
    byClass[cls].push(row);
  });

  let tableHTML = `
    <table class="fee-table">
      <thead>
        <tr>
          <th>Class</th>
          <th>Fee Type</th>
          <th>Amount (₹)</th>
          <th>Due Date</th>
          <th>Notes</th>
          ${isAdmin() ? '<th>Actions</th>' : ''}
        </tr>
      </thead>
      <tbody>
  `;

  Object.entries(byClass).forEach(([cls, rows]) => {
    rows.forEach((row, i) => {
      tableHTML += `
        <tr>
          ${i === 0 ? `<td rowspan="${rows.length}" style="font-weight:700;color:var(--primary-dark);vertical-align:top;padding-top:16px;">${sanitize(cls)}</td>` : ''}
          <td>${sanitize(row.FeeType || '')}</td>
          <td><span class="fee-amount">₹ ${sanitize(String(row.Amount || ''))}</span></td>
          <td>${sanitize(row.DueDate || '—')}</td>
          <td style="color:var(--text-light);font-size:0.83rem;">${sanitize(row.Notes || '')}</td>
          ${isAdmin() ? `
          <td>
            <div class="admin-cell">
              <button class="btn-edit-item" onclick="openEditFeeModal('${row.ID}')"><i class="fas fa-edit"></i></button>
              <button class="btn-delete-item" onclick="deleteItem('deleteFee','${row.ID}',loadFeeStructure)"><i class="fas fa-trash"></i></button>
            </div>
          </td>` : ''}
        </tr>
      `;
    });
  });

  tableHTML += `</tbody></table>`;
  wrap.innerHTML = tableHTML;
}

function renderDefaultFees() {
  const defaults = [
    { ID:"d1", Class:"Nursery / LKG / UKG", FeeType:"Tuition Fee (Monthly)", Amount:"800", Session:"2025-26", DueDate:"10th of every month", Notes:"" },
    { ID:"d2", Class:"Nursery / LKG / UKG", FeeType:"Annual Charges", Amount:"3500", Session:"2025-26", DueDate:"April", Notes:"One time" },
    { ID:"d3", Class:"Class I – V", FeeType:"Tuition Fee (Monthly)", Amount:"1000", Session:"2025-26", DueDate:"10th of every month", Notes:"" },
    { ID:"d4", Class:"Class I – V", FeeType:"Annual Charges", Amount:"4500", Session:"2025-26", DueDate:"April", Notes:"One time" },
    { ID:"d5", Class:"Class VI – VIII", FeeType:"Tuition Fee (Monthly)", Amount:"1200", Session:"2025-26", DueDate:"10th of every month", Notes:"" },
    { ID:"d6", Class:"Class VI – VIII", FeeType:"Annual Charges", Amount:"5000", Session:"2025-26", DueDate:"April", Notes:"One time" },
    { ID:"d7", Class:"Class IX – X", FeeType:"Tuition Fee (Monthly)", Amount:"1500", Session:"2025-26", DueDate:"10th of every month", Notes:"" },
    { ID:"d8", Class:"Class IX – X", FeeType:"Annual Charges", Amount:"6000", Session:"2025-26", DueDate:"April", Notes:"One time" },
    { ID:"d9", Class:"Class XI – XII", FeeType:"Tuition Fee (Monthly)", Amount:"1800", Session:"2025-26", DueDate:"10th of every month", Notes:"" },
    { ID:"d10", Class:"Class XI – XII", FeeType:"Annual Charges", Amount:"7000", Session:"2025-26", DueDate:"April", Notes:"One time" },
  ];
  allFees = defaults;
  buildSessionTabs(defaults);
}

function initEditableNotes() {
  if (!isAdmin()) return;
  document.querySelectorAll("[data-editable]").forEach(el => {
    el.style.cursor = "pointer";
    el.title = "Click to edit";
  });
}

// Admin inline edit for notes
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-editable]");
  if (!el || !isAdmin()) return;
  const field = el.dataset.editable;
  const currentText = el.textContent.trim();

  openModal(`Edit: ${field}`, `
    <div id="noteEditForm">
      <div class="form-group">
        <label>Content</label>
        <textarea name="Content" style="min-height:100px;">${sanitize(currentText)}</textarea>
      </div>
    </div>
  `, async () => {
    const content = document.querySelector("#noteEditForm textarea").value;
    el.innerHTML = `<i class="fas fa-circle"></i> ${content}`;
    showToast("Update ho gaya!", "success");
    closeModal();
    // Persist to sheet
    await apiPost("updateAdmissions", { id: field, data: { Field: field, Content: content } });
  });
});

// Admin Modals
function openAddFeeModal() {
  openModal("Add Fee Entry", `
    <div id="feeForm">
      <div class="form-group"><label>Class *</label><input type="text" name="Class" placeholder="e.g. Class I – V" /></div>
      <div class="form-group"><label>Fee Type *</label><input type="text" name="FeeType" placeholder="e.g. Tuition Fee (Monthly)" /></div>
      <div class="form-group"><label>Amount (₹) *</label><input type="number" name="Amount" placeholder="1000" /></div>
      <div class="form-group"><label>Session</label><input type="text" name="Session" placeholder="2025-26" value="${new Date().getFullYear()}-${String(new Date().getFullYear()+1).slice(-2)}" /></div>
      <div class="form-group"><label>Due Date</label><input type="text" name="DueDate" placeholder="10th of every month" /></div>
      <div class="form-group"><label>Notes</label><input type="text" name="Notes" placeholder="Optional note..." /></div>
    </div>
  `, async () => {
    const data = getFormData("feeForm");
    if (!data.Class || !data.FeeType || !data.Amount) {
      showToast("Class, Fee Type aur Amount zaroori hain!", "error");
      return;
    }
    const result = await apiPost("addFee", { data });
    if (result.success) {
      showToast("Fee entry add ho gayi!", "success");
      closeModal();
      loadFeeStructure();
    } else showToast(result.message, "error");
  });
}

function openEditFeeModal(id) {
  const fee = allFees.find(f => f.ID === id);
  if (!fee) return;

  openModal("Edit Fee Entry", `
    <div id="feeEditForm">
      <div class="form-group"><label>Class</label><input type="text" name="Class" value="${sanitize(fee.Class || '')}" /></div>
      <div class="form-group"><label>Fee Type</label><input type="text" name="FeeType" value="${sanitize(fee.FeeType || '')}" /></div>
      <div class="form-group"><label>Amount (₹)</label><input type="number" name="Amount" value="${fee.Amount || ''}" /></div>
      <div class="form-group"><label>Session</label><input type="text" name="Session" value="${sanitize(fee.Session || '')}" /></div>
      <div class="form-group"><label>Due Date</label><input type="text" name="DueDate" value="${sanitize(fee.DueDate || '')}" /></div>
      <div class="form-group"><label>Notes</label><input type="text" name="Notes" value="${sanitize(fee.Notes || '')}" /></div>
    </div>
  `, async () => {
    const data = getFormData("feeEditForm");
    const result = await apiPost("updateFee", { id, data });
    if (result.success) {
      showToast("Fee update ho gayi!", "success");
      closeModal();
      loadFeeStructure();
    } else showToast(result.message, "error");
  });
}

function openAddNoteModal() {
  openModal("Add Fee Note", `
    <div id="feeNoteForm">
      <div class="form-group"><label>Note Text *</label><textarea name="Content" rows="3" placeholder="Important note..."></textarea></div>
    </div>
  `, () => {
    const content = document.querySelector("#feeNoteForm textarea").value.trim();
    if (!content) { showToast("Note text zaroori hai!", "error"); return; }
    const li = document.createElement("li");
    li.innerHTML = `<i class="fas fa-circle"></i> ${sanitize(content)}`;
    document.getElementById("feeNotesList").appendChild(li);
    showToast("Note add ho gaya!", "success");
    closeModal();
  });
}
