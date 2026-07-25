
/* ================================
   COMMON UI LOGIC — JAVASCRIPT
================================ */

/* ---- REGISTRATION থেকে AUTO-PREFILL ---- */
document.addEventListener('DOMContentLoaded', () => {

  // ── Auto-select role from URL param ?role=student or ?role=teacher ──
  const urlParams = new URLSearchParams(window.location.search);
  const urlRole = urlParams.get('role');
  if (urlRole === 'student' || urlRole === 'teacher') {
    const roleInput = document.querySelector(`input[name="role"][value="${urlRole}"]`);
    if (roleInput) {
      roleInput.checked = true;
      switchRole(urlRole, roleInput.closest('.role-btn'));
    }
  }

  // ── Auto-prefill after Registration ──
  const regEmail = sessionStorage.getItem('newlyRegisteredEmail');
  const regRole  = sessionStorage.getItem('newlyRegisteredRole');

  if (regEmail && regRole) {
    sessionStorage.removeItem('newlyRegisteredEmail');
    sessionStorage.removeItem('newlyRegisteredRole');

    const roleInput = document.querySelector(`input[name="role"][value="${regRole}"]`);
    if (roleInput) {
      roleInput.checked = true;
      switchRole(regRole, roleInput.closest('.role-btn'));
    }

    const emailField = document.getElementById('email');
    if (emailField) {
      emailField.value = regEmail;
      emailField.focus();
      emailField.blur();
    }
  }
});

function switchRole(role, el) {
  // Update Hidden Role
  document.getElementById('current_role').value = role;

  // UI Updates
  const title    = document.getElementById('pageTitle');
  const subtitle = document.getElementById('pageSubtitle');
  const regLink  = document.getElementById('regLink');
  const card     = document.getElementById('loginCard');

  if (role === 'teacher') {
    title.innerHTML    = '<span>Teacher</span> Portal';
    subtitle.innerText = 'Secure access for faculty members';
    regLink.innerText  = 'Register as Teacher';
    regLink.href       = 'teacher-register.html';
    card.classList.remove('student-card');
    card.classList.add('teacher-card');
    card.style.borderTop = 'none'; // Use CSS classes instead
  } else {
    title.innerHTML    = '<span>Student</span> Portal';
    subtitle.innerText = 'Manage your academic dashboard';
    regLink.innerText  = 'Register as Student';
    regLink.href       = 'student-register.html';
    card.classList.remove('teacher-card');
    card.classList.add('student-card');
    card.style.borderTop = 'none'; // Use CSS classes instead
  }
  
  // Clear Errors when switching
  clearErrors();
}

function clearErrors() {
  const fgs = document.querySelectorAll('.form-group');
  const inputs = document.querySelectorAll('input');
  const errs = document.querySelectorAll('.inline-error');
  
  fgs.forEach(fg => fg.classList.remove('invalid'));
  inputs.forEach(i => i.classList.remove('invalid-input'));
  errs.forEach(e => e.style.display = 'none');
}

async function doLogin() {
  clearErrors();
  
  const email = document.getElementById('email');
  const pass  = document.getElementById('pass');
  const role  = document.getElementById('current_role').value;
  const btn   = document.querySelector('.btn-login');

  let valid = true;
  if (!email.value.trim()) {
    document.getElementById('fg-email').classList.add('invalid');
    email.classList.add('invalid-input');
    valid = false;
  }
  if (!pass.value.trim()) {
    document.getElementById('fg-pass').classList.add('invalid');
    pass.classList.add('invalid-input');
    valid = false;
  }

  if (!valid) return;

  setBtnLoading(btn, true);

  const hostname = window.location.hostname || '127.0.0.1';
  const API_BASE = (hostname === 'localhost' || hostname === '127.0.0.1') ? `http://${hostname}:8000/api` : '/api';

  try {
    const res = await fetch(`${API_BASE}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_or_mobile: email.value.trim(),
        password: pass.value.trim(),
        role: role
      })
    });
    
    const data = await res.json();
    if (data.status === 'success') {
      if (data.data) {
        localStorage.setItem('user_name', data.data.first_name + ' ' + data.data.last_name);
        localStorage.setItem('user_role', data.data.role);
        localStorage.setItem('user_email', data.data.email);
        localStorage.setItem('user_roll', data.data.roll || '');
        localStorage.setItem('user_phone', data.data.mobile || data.data.phone || '');
        localStorage.setItem('user_photo', data.data.profile_picture || '');
        localStorage.setItem('user_picture', data.data.profile_picture || '');
        localStorage.setItem('user_semester', data.data.semester || '');
        localStorage.setItem('user_department', data.data.department || '');
        localStorage.setItem('user', JSON.stringify(data.data));

        
        // Dynamic redirection based on role
        if (data.data.role === 'teacher') {
          window.location.href = 'teacher-dashboard.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }
    } else {
      setBtnLoading(btn, false);
      
      if (data.message === 'Email not found') {
        const fg = document.getElementById('fg-email');
        const err = document.getElementById('email-err');
        fg.classList.add('invalid');
        email.classList.add('invalid-input');
        err.style.display = 'block';
      } else if (data.message === 'Wrong password') {
        const fg = document.getElementById('fg-pass');
        const err = document.getElementById('pass-err');
        fg.classList.add('invalid');
        pass.classList.add('invalid-input');
        err.style.display = 'block';
      } else {
        showToast(data.message || 'Login failed!');
      }
    }
  } catch (err) {
    setBtnLoading(btn, false);
    showToast('Server error! Please try again.');
    console.error(err);
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function toggleEye(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  
  // Icon styling
  btn.style.color = isPass ? 'var(--accent)' : 'var(--muted)';
}

function setBtnLoading(btn, isLoading) {
  if (isLoading) {
    btn.classList.add('btn-loading');
    const sp = document.createElement('div');
    sp.className = 'spinner';
    btn.appendChild(sp);
  } else {
    btn.classList.remove('btn-loading');
    const sp = btn.querySelector('.spinner');
    if (sp) sp.remove();
  }
}