/* ========================
   THEME MANAGER (Dark / Light)
======================== */

// Apply saved theme IMMEDIATELY (before page renders) to avoid flash
(function () {
  var saved = localStorage.getItem('cms_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

function toggleTheme() {
  var html = document.documentElement;
  var current = html.getAttribute('data-theme') || 'dark';
  var next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('cms_theme', next);
  updateThemeBtn();
}

function updateThemeBtn() {
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  // Icon element (FontAwesome)
  var icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }

  // Text/Emoji button
  var btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = isDark ? '☀️' : '🌙';
    btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }
}

// Set icon as soon as DOM is ready
document.addEventListener('DOMContentLoaded', updateThemeBtn);
window.toggleTheme = toggleTheme;
