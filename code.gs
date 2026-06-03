// ============================================================
// SULEKH CONVENT SCHOOL - Google Apps Script Backend
// File: code.gs
// All backend logic for the school website
// ============================================================

// ⚠️ IMPORTANT: Replace this with your Google Sheet ID
const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";

// Sheet tab names (must match exactly in Google Sheet)
const SHEETS = {
  USERS: "Users",
  HOME_SLIDERS: "HomeSliders",
  NOTICES: "Notices",
  GALLERY: "Gallery",
  FACULTY: "Faculty",
  ADMISSIONS: "Admissions",
  FEE_STRUCTURE: "FeeStructure",
  RESULTS: "Results",
  CONTACT_INFO: "ContactInfo",
  ACADEMICS: "Academics",
  ABOUT: "About",
  ACHIEVEMENTS: "Achievements"
};

// ============================================================
// CORS HEADERS - Required for frontend to call this API
// ============================================================
function setCORSHeaders(output) {
  return output
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ============================================================
// MAIN ENTRY POINTS
// ============================================================

function doGet(e) {
  const params = e.parameter;
  const action = params.action;
  let result;

  try {
    switch (action) {
      case "getSliders":       result = getSliders(); break;
      case "getNotices":       result = getNotices(); break;
      case "getGallery":       result = getGallery(params.category); break;
      case "getFaculty":       result = getFaculty(); break;
      case "getAdmissions":    result = getAdmissions(); break;
      case "getFeeStructure":  result = getFeeStructure(); break;
      case "getResults":       result = getResults(); break;
      case "getContactInfo":   result = getContactInfo(); break;
      case "getAcademics":     result = getAcademics(); break;
      case "getAbout":         result = getAbout(); break;
      case "getAchievements":  result = getAchievements(); break;
      default:
        result = { success: false, message: "Unknown action: " + action };
    }
  } catch (err) {
    result = { success: false, message: err.toString() };
  }

  return setCORSHeaders(
    ContentService.createTextOutput(JSON.stringify(result))
  );
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return setCORSHeaders(
      ContentService.createTextOutput(JSON.stringify({ success: false, message: "Invalid JSON" }))
    );
  }

  const action = body.action;
  let result;

  try {
    // Auth check for all write operations
    if (action !== "login") {
      const authCheck = verifySession(body.sessionToken);
      if (!authCheck.valid) {
        return setCORSHeaders(
          ContentService.createTextOutput(JSON.stringify({ success: false, message: "Unauthorized" }))
        );
      }
    }

    switch (action) {
      case "login":           result = adminLogin(body.username, body.password); break;
      case "logout":          result = adminLogout(body.sessionToken); break;

      // Sliders
      case "addSlider":       result = addRow(SHEETS.HOME_SLIDERS, body.data); break;
      case "updateSlider":    result = updateRow(SHEETS.HOME_SLIDERS, body.id, body.data); break;
      case "deleteSlider":    result = deleteRow(SHEETS.HOME_SLIDERS, body.id); break;

      // Notices
      case "addNotice":       result = addRow(SHEETS.NOTICES, body.data); break;
      case "updateNotice":    result = updateRow(SHEETS.NOTICES, body.id, body.data); break;
      case "deleteNotice":    result = deleteRow(SHEETS.NOTICES, body.id); break;

      // Gallery
      case "addGallery":      result = addRow(SHEETS.GALLERY, body.data); break;
      case "updateGallery":   result = updateRow(SHEETS.GALLERY, body.id, body.data); break;
      case "deleteGallery":   result = deleteRow(SHEETS.GALLERY, body.id); break;

      // Faculty
      case "addFaculty":      result = addRow(SHEETS.FACULTY, body.data); break;
      case "updateFaculty":   result = updateRow(SHEETS.FACULTY, body.id, body.data); break;
      case "deleteFaculty":   result = deleteRow(SHEETS.FACULTY, body.id); break;

      // Admissions
      case "updateAdmissions": result = updateRow(SHEETS.ADMISSIONS, body.id, body.data); break;

      // Fee Structure
      case "addFee":          result = addRow(SHEETS.FEE_STRUCTURE, body.data); break;
      case "updateFee":       result = updateRow(SHEETS.FEE_STRUCTURE, body.id, body.data); break;
      case "deleteFee":       result = deleteRow(SHEETS.FEE_STRUCTURE, body.id); break;

      // Results
      case "addResult":       result = addRow(SHEETS.RESULTS, body.data); break;
      case "updateResult":    result = updateRow(SHEETS.RESULTS, body.id, body.data); break;
      case "deleteResult":    result = deleteRow(SHEETS.RESULTS, body.id); break;

      // Contact Info
      case "updateContact":   result = updateContactInfo(body.data); break;

      // Academics
      case "addAcademics":    result = addRow(SHEETS.ACADEMICS, body.data); break;
      case "updateAcademics": result = updateRow(SHEETS.ACADEMICS, body.id, body.data); break;
      case "deleteAcademics": result = deleteRow(SHEETS.ACADEMICS, body.id); break;

      // About
      case "updateAbout":     result = updateRow(SHEETS.ABOUT, body.id, body.data); break;

      // Achievements
      case "addAchievement":    result = addRow(SHEETS.ACHIEVEMENTS, body.data); break;
      case "updateAchievement": result = updateRow(SHEETS.ACHIEVEMENTS, body.id, body.data); break;
      case "deleteAchievement": result = deleteRow(SHEETS.ACHIEVEMENTS, body.id); break;

      default:
        result = { success: false, message: "Unknown action: " + action };
    }
  } catch (err) {
    result = { success: false, message: err.toString() };
  }

  return setCORSHeaders(
    ContentService.createTextOutput(JSON.stringify(result))
  );
}

// ============================================================
// AUTHENTICATION
// ============================================================

// In-memory session store (resets on script restart, good enough for school use)
const SESSION_STORE = {};

function adminLogin(username, password) {
  if (!username || !password) {
    return { success: false, message: "Username aur password dono zaroori hain" };
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const idIdx    = headers.indexOf("UserID");
  const nameIdx  = headers.indexOf("Username");
  const passIdx  = headers.indexOf("Password");
  const roleIdx  = headers.indexOf("Role");

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (
      row[nameIdx].toString().trim() === username.trim() &&
      row[passIdx].toString().trim() === password.trim()
    ) {
      const token = Utilities.getUuid();
      const expiry = Date.now() + (8 * 60 * 60 * 1000); // 8 hours
      SESSION_STORE[token] = {
        userId: row[idIdx],
        username: row[nameIdx],
        role: row[roleIdx],
        expiry: expiry
      };
      return {
        success: true,
        token: token,
        username: row[nameIdx],
        role: row[roleIdx],
        message: "Login successful"
      };
    }
  }

  return { success: false, message: "Invalid username ya password" };
}

function adminLogout(token) {
  if (SESSION_STORE[token]) {
    delete SESSION_STORE[token];
  }
  return { success: true, message: "Logged out" };
}

function verifySession(token) {
  if (!token || !SESSION_STORE[token]) {
    return { valid: false };
  }
  const session = SESSION_STORE[token];
  if (Date.now() > session.expiry) {
    delete SESSION_STORE[token];
    return { valid: false };
  }
  return { valid: true, session: session };
}

// ============================================================
// GENERIC CRUD HELPERS
// ============================================================

function getSheetData(sheetName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = data[i][idx];
    });
    rows.push(obj);
  }
  return rows;
}

function addRow(sheetName, data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Auto-generate ID
  const newId = "ID_" + Date.now();
  data["ID"] = newId;
  data["CreatedAt"] = new Date().toISOString();

  const row = headers.map(h => data[h] !== undefined ? data[h] : "");
  sheet.appendRow(row);

  return { success: true, id: newId, message: "Record add ho gaya" };
}

function updateRow(sheetName, id, data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIdx = headers.indexOf("ID");

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIdx].toString() === id.toString()) {
      headers.forEach((h, idx) => {
        if (data[h] !== undefined) {
          sheet.getRange(i + 1, idx + 1).setValue(data[h]);
        }
      });
      // Update timestamp
      const updatedIdx = headers.indexOf("UpdatedAt");
      if (updatedIdx >= 0) {
        sheet.getRange(i + 1, updatedIdx + 1).setValue(new Date().toISOString());
      }
      return { success: true, message: "Record update ho gaya" };
    }
  }

  return { success: false, message: "Record nahi mila ID: " + id };
}

function deleteRow(sheetName, id) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIdx = headers.indexOf("ID");

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIdx].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Record delete ho gaya" };
    }
  }

  return { success: false, message: "Record nahi mila" };
}

// ============================================================
// DATA FETCH FUNCTIONS
// ============================================================

function getSliders() {
  const rows = getSheetData(SHEETS.HOME_SLIDERS);
  const active = rows.filter(r => r["Active"] !== "FALSE" && r["Active"] !== false);
  return { success: true, data: active };
}

function getNotices() {
  const rows = getSheetData(SHEETS.NOTICES);
  rows.sort((a, b) => new Date(b["Date"]) - new Date(a["Date"]));
  return { success: true, data: rows };
}

function getGallery(category) {
  let rows = getSheetData(SHEETS.GALLERY);
  if (category && category !== "all") {
    rows = rows.filter(r => r["Category"] === category);
  }
  return { success: true, data: rows };
}

function getFaculty() {
  const rows = getSheetData(SHEETS.FACULTY);
  return { success: true, data: rows };
}

function getAdmissions() {
  const rows = getSheetData(SHEETS.ADMISSIONS);
  return { success: true, data: rows };
}

function getFeeStructure() {
  const rows = getSheetData(SHEETS.FEE_STRUCTURE);
  return { success: true, data: rows };
}

function getResults() {
  const rows = getSheetData(SHEETS.RESULTS);
  rows.sort((a, b) => new Date(b["Year"]) - new Date(a["Year"]));
  return { success: true, data: rows };
}

function getContactInfo() {
  const rows = getSheetData(SHEETS.CONTACT_INFO);
  const contact = {};
  rows.forEach(r => {
    contact[r["Field"]] = r["Value"];
  });
  return { success: true, data: contact };
}

function getAcademics() {
  const rows = getSheetData(SHEETS.ACADEMICS);
  return { success: true, data: rows };
}

function getAbout() {
  const rows = getSheetData(SHEETS.ABOUT);
  return { success: true, data: rows };
}

function getAchievements() {
  const rows = getSheetData(SHEETS.ACHIEVEMENTS);
  return { success: true, data: rows };
}

// Special handler for contact info (key-value store)
function updateContactInfo(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.CONTACT_INFO);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const fieldIdx = headers.indexOf("Field");
  const valueIdx = headers.indexOf("Value");

  Object.keys(data).forEach(field => {
    let found = false;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][fieldIdx] === field) {
        sheet.getRange(i + 1, valueIdx + 1).setValue(data[field]);
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([field, data[field]]);
    }
  });

  return { success: true, message: "Contact info update ho gaya" };
}

// ============================================================
// SETUP FUNCTION - Run once to create all sheets with headers
// ============================================================
function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  const sheetConfigs = {
    [SHEETS.USERS]: ["UserID", "Username", "Password", "Role", "CreatedAt"],
    [SHEETS.HOME_SLIDERS]: ["ID", "ImageURL", "Title", "Subtitle", "ButtonText", "ButtonLink", "Active", "Order", "CreatedAt", "UpdatedAt"],
    [SHEETS.NOTICES]: ["ID", "Title", "Content", "Date", "Category", "IsImportant", "AttachmentURL", "CreatedAt", "UpdatedAt"],
    [SHEETS.GALLERY]: ["ID", "ImageURL", "Caption", "Category", "Date", "CreatedAt", "UpdatedAt"],
    [SHEETS.FACULTY]: ["ID", "Name", "Designation", "Subject", "Qualification", "Experience", "PhotoURL", "Bio", "Order", "CreatedAt", "UpdatedAt"],
    [SHEETS.ADMISSIONS]: ["ID", "Field", "Content", "LastUpdated"],
    [SHEETS.FEE_STRUCTURE]: ["ID", "Class", "FeeType", "Amount", "Session", "DueDate", "Notes", "CreatedAt", "UpdatedAt"],
    [SHEETS.RESULTS]: ["ID", "Class", "Year", "Title", "Description", "FileURL", "Highlights", "CreatedAt", "UpdatedAt"],
    [SHEETS.CONTACT_INFO]: ["Field", "Value"],
    [SHEETS.ACADEMICS]: ["ID", "Section", "Title", "Content", "Icon", "Order", "CreatedAt", "UpdatedAt"],
    [SHEETS.ABOUT]: ["ID", "Section", "Title", "Content", "ImageURL", "Order", "CreatedAt", "UpdatedAt"],
    [SHEETS.ACHIEVEMENTS]: ["ID", "Title", "Description", "Year", "Category", "ImageURL", "CreatedAt", "UpdatedAt"]
  };

  Object.entries(sheetConfigs).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      Logger.log("Created sheet: " + name);
    }
    // Only add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1a3a6b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
    }
  });

  // Add default admin user if Users sheet is empty (only headers)
  const userSheet = ss.getSheetByName(SHEETS.USERS);
  if (userSheet.getLastRow() <= 1) {
    userSheet.appendRow([
      "USR001",
      "admin",
      "admin@123",  // ⚠️ Change this password immediately!
      "superadmin",
      new Date().toISOString()
    ]);
    Logger.log("Default admin user created - Username: admin, Password: admin@123");
  }

  // Add default contact info
  const contactSheet = ss.getSheetByName(SHEETS.CONTACT_INFO);
  if (contactSheet.getLastRow() <= 1) {
    const defaults = [
      ["Address", "Sulekh Convent School, Bareilly, Uttar Pradesh - 243001"],
      ["Phone1", "+91 XXXXXXXXXX"],
      ["Phone2", "+91 XXXXXXXXXX"],
      ["Email", "info@sulekhconvent.edu.in"],
      ["Website", "www.sulekhconvent.edu.in"],
      ["EstablishedYear", "XXXX"],
      ["Principal", "Principal Name"],
      ["MapEmbedURL", "https://maps.app.goo.gl/VgKqLEx6uSNLLjwo6"],
      ["FacebookURL", ""],
      ["YoutubeURL", ""],
      ["TwitterURL", ""],
      ["Timing", "Mon-Sat: 7:30 AM - 2:00 PM"],
      ["AffiliationNumber", "XXXXXXXXXXXX"],
      ["Affiliation", "CBSE / UP Board"]
    ];
    defaults.forEach(row => contactSheet.appendRow(row));
  }

  Logger.log("✅ Setup complete! All sheets created.");
  SpreadsheetApp.getUi().alert("Setup complete! Sabhi sheets ban gayi hain. Default admin: username=admin, password=admin@123");
}
