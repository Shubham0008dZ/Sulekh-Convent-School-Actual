// ============================================================
// SULEKH CONVENT SCHOOL - Admin Login JavaScript
// File: js/admin-login.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // Redirect if already logged in
  if (localStorage.getItem("adminToken")) {
    window.location.href = "admin-dashboard.html";
    return;
  }

  // Enter key support
  document.getElementById("password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });
  document.getElementById("username").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("password").focus();
  });

  // Toggle password visibility
  document.getElementById("togglePass").addEventListener("click", () => {
    const passInput = document.getElementById("password");
    const icon = document.querySelector("#togglePass i");
    if (passInput.type === "password") {
      passInput.type = "text";
      icon.className = "fas fa-eye-slash";
    } else {
      passInput.type = "password";
      icon.className = "fas fa-eye";
    }
  });
});

async function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("loginError");
  const loginBtn = document.getElementById("loginBtn");
  const btnText  = document.getElementById("loginBtnText");
  const btnLoader = document.getElementById("loginBtnLoader");

  // Validation
  if (!username || !password) {
    showLoginError("Username aur password dono enter karein.");
    return;
  }

  // Loading state
  errorDiv.style.display = "none";
  loginBtn.disabled = true;
  btnText.style.display = "none";
  btnLoader.style.display = "inline";

  // ── DEMO / LOCAL MODE ──────────────────────────────────────
  // Jab tak Google Apps Script URL configure na ho,
  // hardcoded credentials se login hoga.
  // Google Sheet connect hone ke baad yeh block hata dena.
  const DEMO_USERS = [
    { username: "admin",    password: "admin@123",  role: "superadmin" },
    { username: "sulekh",   password: "sulekh@123", role: "admin" },
  ];

  const apiConfigured = API_URL && API_URL !== "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";

  if (!apiConfigured) {
    // Demo mode — check against local credentials
    const matched = DEMO_USERS.find(
      u => u.username === username && u.password === password
    );

    if (matched) {
      const token = "demo_token_" + Date.now();
      localStorage.setItem("adminToken",    token);
      localStorage.setItem("adminUsername", matched.username);
      localStorage.setItem("adminRole",     matched.role);

      loginBtn.style.background = "linear-gradient(135deg, #28a745, #20c997)";
      btnText.innerHTML = '<i class="fas fa-check"></i> Login Successful!';
      btnText.style.display = "inline";
      btnLoader.style.display = "none";

      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 800);
    } else {
      showLoginError("Invalid credentials. Default: admin / admin@123");
      loginBtn.disabled = false;
      btnText.style.display = "inline";
      btnLoader.style.display = "none";
    }
    return;
  }
  // ── END DEMO MODE ──────────────────────────────────────────

  // Real API call (when API_URL is configured)
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", username, password })
    });

    const result = await response.json();

    if (result.success) {
      localStorage.setItem("adminToken",    result.token);
      localStorage.setItem("adminUsername", result.username);
      localStorage.setItem("adminRole",     result.role);

      loginBtn.style.background = "linear-gradient(135deg, #28a745, #20c997)";
      btnText.innerHTML = '<i class="fas fa-check"></i> Login Successful!';
      btnText.style.display = "inline";
      btnLoader.style.display = "none";

      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 800);
    } else {
      showLoginError(result.message || "Invalid credentials. Please try again.");
      loginBtn.disabled = false;
      btnText.style.display = "inline";
      btnLoader.style.display = "none";
    }
  } catch (e) {
    showLoginError("Server se connect nahi ho paya. Demo mode try karein: admin / admin@123");
    loginBtn.disabled = false;
    btnText.style.display = "inline";
    btnLoader.style.display = "none";
  }
}

function showLoginError(msg) {
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
  errorDiv.style.display = "flex";
  // Shake animation
  errorDiv.style.animation = "none";
  void errorDiv.offsetHeight;
  errorDiv.style.animation = "shake 0.4s ease";
}
