// ============================================================
// SULEKH CONVENT SCHOOL - Contact Page JS
// File: js/contact.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  loadContactDetails();
  if (isAdmin()) {
    document.getElementById("adminContactEditBtn").style.display = "block";
    // Hide the admin login CTA if already admin
    const cta = document.getElementById("adminLoginCTABtn");
    if (cta) cta.closest("section").style.display = "none";
  }
});

async function loadContactDetails() {
  try {
    const result = await apiGet("getContactInfo");
    if (!result.success) return;
    const d = result.data;

    // Info cards
    if (d.Address)   setTextById("contactAddress", d.Address);
    if (d.Phone1)    setTextById("contactPhone1", d.Phone1);
    if (d.Phone2)    setTextById("contactPhone2", d.Phone2);
    if (d.Email)     setTextById("contactEmail", d.Email);
    if (d.Timing)    setTextById("contactTiming", d.Timing);

    // Call / email links
    if (d.Phone1) document.getElementById("contactPhoneLink").href = "tel:" + d.Phone1;
    if (d.Email)  document.getElementById("contactEmailLink").href = "mailto:" + d.Email;

    // Quick info
    if (d.Affiliation)       setTextById("contactAffiliation", d.Affiliation);
    if (d.AffiliationNumber) setTextById("contactAffNo", d.AffiliationNumber);
    if (d.Principal)         setTextById("contactPrincipal", d.Principal);
    if (d.EstablishedYear)   setTextById("contactEst", d.EstablishedYear);
    if (d.Website)           setTextById("contactWebsite", d.Website);

    // Social
    if (d.FacebookURL) document.getElementById("contactFb").href = d.FacebookURL;
    if (d.YoutubeURL)  document.getElementById("contactYt").href = d.YoutubeURL;
    if (d.TwitterURL)  document.getElementById("contactTw").href = d.TwitterURL;

    // Map embed
    if (d.MapEmbedURL) {
      document.getElementById("mapEmbed").src = d.MapEmbedURL;
    } else if (d.Address) {
      const q = encodeURIComponent(d.Address);
      document.getElementById("mapEmbed").src =
        `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
    }

  } catch (e) {
    console.log("Contact load error:", e);
  }
}

function setTextById(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.textContent = text;
}

// Contact Form Submit
async function submitContactForm() {
  const name    = document.getElementById("cfName").value.trim();
  const phone   = document.getElementById("cfPhone").value.trim();
  const email   = document.getElementById("cfEmail").value.trim();
  const subject = document.getElementById("cfSubject").value;
  const message = document.getElementById("cfMessage").value.trim();

  if (!name || !phone || !message) {
    showToast("Naam, phone aur message zaroori hain!", "error");
    return;
  }

  // Save as a notice/enquiry in Google Sheet
  const data = {
    Title: `Contact Enquiry: ${name} – ${subject || "General"}`,
    Content: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    Category: "General",
    Date: new Date().toISOString().split("T")[0],
    IsImportant: "FALSE"
  };

  try {
    await apiPost("addNotice", { data });
  } catch (e) {}

  // Show success regardless (UX-friendly)
  document.getElementById("cfSuccess").style.display = "flex";
  document.querySelector(".contact-form-card button").disabled = true;
  document.querySelector(".contact-form-card button").style.opacity = "0.6";
}

// Admin: Edit All Contact Info Modal
function openEditContactModal() {
  const fields = [
    { key: "Address",           label: "School Address",       id: "contactAddress" },
    { key: "Phone1",            label: "Primary Phone",        id: "contactPhone1" },
    { key: "Phone2",            label: "Secondary Phone",      id: "contactPhone2" },
    { key: "Email",             label: "Email Address",        id: "contactEmail" },
    { key: "Timing",            label: "Office Hours/Timing",  id: "contactTiming" },
    { key: "Principal",         label: "Principal Name",       id: "contactPrincipal" },
    { key: "EstablishedYear",   label: "Established Year",     id: "contactEst" },
    { key: "Affiliation",       label: "Affiliation Board",    id: "contactAffiliation" },
    { key: "AffiliationNumber", label: "Affiliation Number",   id: "contactAffNo" },
    { key: "Website",           label: "Website URL",          id: "contactWebsite" },
    { key: "FacebookURL",       label: "Facebook URL",         id: "contactFb" },
    { key: "YoutubeURL",        label: "YouTube URL",          id: "contactYt" },
    { key: "TwitterURL",        label: "Twitter URL",          id: "contactTw" },
    { key: "MapEmbedURL",       label: "Google Maps Embed URL (iframe src)", id: "mapEmbed" },
  ];

  const formHTML = `
    <div id="contactEditForm">
      ${fields.map(f => `
        <div class="form-group">
          <label>${f.label}</label>
          <input type="text" name="${f.key}"
            value="${sanitize(document.getElementById(f.id)?.textContent?.trim() || document.getElementById(f.id)?.getAttribute('src') || '')}"
          />
        </div>
      `).join('')}
    </div>
  `;

  openModal("Edit Contact Information", formHTML, async () => {
    const form = document.getElementById("contactEditForm");
    const data = {};
    form.querySelectorAll("input").forEach(inp => {
      if (inp.name && inp.value.trim()) data[inp.name] = inp.value.trim();
    });

    const result = await apiPost("updateContact", { data });
    if (result.success) {
      showToast("Contact info update ho gayi!", "success");
      closeModal();
      loadContactDetails();
    } else {
      showToast(result.message || "Error saving!", "error");
    }
  });
}
