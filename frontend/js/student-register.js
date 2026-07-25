const hostname = window.location.hostname || '127.0.0.1';
const API_BASE = `http://${hostname}:8000/api`;

/* ================================
   STUDENT REGISTER — JAVASCRIPT
================================ */

function toggleEye(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  btn.style.color = isPass ? 'var(--accent)' : 'var(--muted)';
}

function checkStrength(val) {
  const bar  = document.getElementById('strengthBar');
  const hint = document.getElementById('passHint');
  if (!bar || !hint) return;

  // Trigger match check as well
  validatePasswordMatch();

  if (!val) {
    bar.style.width = '0%';
    hint.textContent = 'Use letters, numbers & symbols';
    hint.style.color = 'var(--muted)';
    return;
  }

  let score = 0;
  if (val.length >= 8)          score++;
  if (/[A-Z]/.test(val))        score++;
  if (/[0-9]/.test(val))        score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { w: '25%', color: '#f87171', label: 'Weak — too simple' },
    { w: '50%', color: '#fb923c', label: 'Fair — add complexity' },
    { w: '75%', color: '#facc15', label: 'Good — almost there' },
    { w: '100%',color: '#4ade80', label: 'Strong — Excellent!' },
  ];
  const idx = Math.max(0, Math.min(score - 1, 3));
  bar.style.width      = levels[idx].w;
  bar.style.background = levels[idx].color;
  hint.textContent     = 'Strength: ' + levels[idx].label;
  hint.style.color     = levels[idx].color;
}

// IMPROVED REAL-TIME MATCH CHECK
function validatePasswordMatch() {
  const pass = document.getElementById('pass');
  const cpass = document.getElementById('cpass');
  const cpassFg = document.getElementById('fg-cpass');
  const cpassErr = document.getElementById('cpass-err');
  
  const passVal = pass.value;
  const cpassVal = cpass.value;

  // 1. Clear state if empty
  if (!cpassVal) {
    cpassFg.classList.remove('invalid');
    cpass.classList.remove('invalid-input');
    cpassErr.style.display = 'none';
    return;
  }

  // 2. Exact Match Case (Positive)
  if (passVal === cpassVal) {
    cpassFg.classList.remove('invalid');
    cpass.classList.remove('invalid-input');
    cpassErr.style.display = 'block';
    cpassErr.textContent = 'Passwords match';
    cpassErr.style.color = '#4ade80'; // Green
    return;
  }

  // 3. Mismatch Case (Only show if length is equal or more to prevent early annoyance)
  if (cpassVal.length >= passVal.length) {
    cpassFg.classList.add('invalid');
    cpass.classList.add('invalid-input');
    cpassErr.style.display = 'block';
    cpassErr.textContent = 'Passwords mismatch';
    cpassErr.style.color = '#f87171'; // Red (reset to default)
  } else {
    // Shorter and not matching yet - keep it quiet
    cpassFg.classList.remove('invalid');
    cpass.classList.remove('invalid-input');
    cpassErr.style.display = 'none';
  }
}

// Attach listener to confirm password field
document.addEventListener('DOMContentLoaded', () => {
    const cpassInput = document.getElementById('cpass');
    if (cpassInput) {
        cpassInput.addEventListener('input', validatePasswordMatch);
    }
});

function clearAllErrors() {
  const fgs = document.querySelectorAll('.form-group');
  const inputs = document.querySelectorAll('input, select');
  fgs.forEach(fg => fg.classList.remove('invalid'));
  inputs.forEach(i => i.classList.remove('invalid-input'));
  
  const otpErr = document.getElementById('regOtpErr');
  const otpInput = document.getElementById('regOtp');
  if (otpErr) otpErr.style.display = 'none';
  if (otpInput) otpInput.classList.remove('invalid-input');
}

function markValid(fgId) {
  const fg = document.getElementById(fgId);
  if (fg) fg.classList.remove('invalid');
  const input = fg ? fg.querySelector('input, select') : null;
  if (input) input.classList.remove('invalid-input');
}

function markInvalid(fgId) {
  const fg = document.getElementById(fgId);
  if (fg) fg.classList.add('invalid');
  const input = fg ? fg.querySelector('input, select') : null;
  if (input) input.classList.add('invalid-input');
  return false;
}

// Global data to hold form values until OTP is verified
let pendingData = null;

async function handleRegistration(e) {
  e.preventDefault();
  clearAllErrors();
  let valid = true;

  /* text / email inputs */
  const simple = [
    { id: 'fname',    fg: 'fg-fname' },
    { id: 'lname',    fg: 'fg-lname' },
    { id: 'userEmailBox',    fg: 'fg-email' },
    { id: 'roll',     fg: 'fg-roll' },
  ];

  simple.forEach(f => {
    const val = document.getElementById(f.id).value.trim();
    if (!val) { markInvalid(f.fg); valid = false; }
    else        markValid(f.fg);
  });

  /* email format */
  const emailEl = document.getElementById('userEmailBox');
  if (emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    markInvalid('fg-email'); valid = false;
  }

  /* mobile */
  const mob    = document.getElementById('mobile');
  const mobFg  = document.getElementById('fg-mobile');
  const mobErr = document.getElementById('mobile-err');
  const mobVal = mob.value.trim();
  if (!mobVal || !/^0?1[3-9]\d{8}$/.test(mobVal)) {
    mobFg.classList.add('invalid');
    mob.classList.add('invalid-input');
    mobErr.style.display = 'block';
    valid = false;
  } else {
    mobFg.classList.remove('invalid');
    mob.classList.remove('invalid-input');
    mobErr.style.display = 'none';
  }

  /* gender */
  const genderChecked = document.querySelector('input[name="gender"]:checked');
  const genderFg  = document.getElementById('fg-gender');
  const genderErr = document.getElementById('gender-err');
  if (!genderChecked) {
    genderFg.classList.add('invalid');
    genderErr.style.display = 'block';
    valid = false;
  } else {
    genderFg.classList.remove('invalid');
    genderErr.style.display = 'none';
  }

  /* selects */
  const selects = [
    { id: 'session',  fg: 'fg-session' },
    { id: 'semester', fg: 'fg-semester' },
    { id: 'dept',     fg: 'fg-dept' },
  ];
  selects.forEach(s => {
    const el = document.getElementById(s.id);
    if (!el.value) { markInvalid(s.fg); valid = false; }
    else             markValid(s.fg);
  });

  /* password length */
  const pass = document.getElementById('pass');
  if (!pass.value || pass.value.length < 8) {
    markInvalid('fg-pass'); valid = false;
  } else {
    markValid('fg-pass');
  }

  /* confirm password final check */
  const cpass    = document.getElementById('cpass');
  const cpassFg  = document.getElementById('fg-cpass');
  const cpassErr = document.getElementById('cpass-err');
  if (!cpass.value || cpass.value !== pass.value) {
    cpassFg.classList.add('invalid');
    cpass.classList.add('invalid-input');
    cpassErr.style.display = 'block';
    cpassErr.textContent = 'Passwords mismatch';
    cpassErr.style.color = '#f87171';
    valid = false;
  } else {
    // Keep it green or clean
    cpassFg.classList.remove('invalid');
    cpass.classList.remove('invalid-input');
  }

  if (!valid) {
    const firstErr = document.querySelector('.form-group.invalid');
    if (firstErr) {
      firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const label = firstErr.querySelector('label');
      alert("Validation Error! Please correctly fill out the: [ " + (label ? label.innerText : "") + " ] box.");
    }
    return;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  setBtnLoading(btn, true);

  // If valid, store data and send OTP
  pendingData = {
    role: 'student',
    first_name: document.getElementById('fname').value.trim(),
    last_name: document.getElementById('lname').value.trim(),
    email: document.getElementById('userEmailBox').value.trim(),
    mobile: document.getElementById('mobile').value.trim(),
    department: document.getElementById('dept').value,
    gender: genderChecked.value,
    roll: document.getElementById('roll').value.trim(),
    session: document.getElementById('session').value,
    semester: document.getElementById('semester').value,
    password: pass.value
  };

  try {
    const res = await fetch(`${API_BASE}/send-registration-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingData.email, role: 'student' })
    });
    const data = await res.json();
    
    setBtnLoading(btn, false);

    if (data.status === 'success') {
      document.getElementById('regTargetEmail').innerHTML = pendingData.email;
      document.getElementById('regForm').style.display = 'none';
      document.getElementById('otpSection').style.display = 'block';
    } else {
      markInvalid('fg-email');
      const emailErr = document.querySelector('#fg-email .err-msg');
      if (emailErr) {
        emailErr.textContent = data.message || 'Failed to send OTP.';
        emailErr.style.display = 'block';
      }
    }
  } catch (err) {
    setBtnLoading(btn, false);
    showToast('Network error! Please try again.');
    console.error(err);
  }
}

async function verifyAndRegister() {
  const otpInput = document.getElementById('regOtp');
  const otpErr = document.getElementById('regOtpErr');
  const otpVal = otpInput.value.trim();
  
  otpInput.classList.remove('invalid-input');
  otpErr.style.display = 'none';

  if (otpVal.length < 6) {
    otpInput.classList.add('invalid-input');
    otpErr.textContent = 'Enter a valid 6-digit code!';
    otpErr.style.display = 'block';
    return;
  }

  const payload = { ...pendingData, registration_otp: otpVal };
  const btn = document.querySelector('#otpSection button');
  setBtnLoading(btn, true);

  try {
    const res = await fetch(`${API_BASE}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    setBtnLoading(btn, false);

    if (data.status === 'success') {
      // Registration শেষে email ও role এক-বারের জন্য সেভ করা হচ্ছে
      sessionStorage.setItem('newlyRegisteredEmail', pendingData.email);
      sessionStorage.setItem('newlyRegisteredRole', 'student');
      window.location.href = 'loginpage1.html';
    } else {
      otpInput.classList.add('invalid-input');
      otpErr.textContent = data.message || 'Verification failed!';
      otpErr.style.display = 'block';
    }
  } catch (err) {
    setBtnLoading(btn, false);
    showToast('Verification server error!');
    console.error(err);
  }
}

async function resendOtp() {
  const link = document.getElementById('resendOtpLink');
  if (!link || link.style.pointerEvents === 'none') return;

  const targetEmail = (pendingData && pendingData.email) 
    ? pendingData.email 
    : document.getElementById('regTargetEmail').innerText.trim();

  if (!targetEmail) {
    showToast('Email missing! Please re-enter email.');
    return;
  }

  // Add cooldown
  link.style.pointerEvents = 'none';
  link.style.opacity = '0.5';
  let seconds = 30;
  
  const timer = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(timer);
      link.innerHTML = 'Resend Code';
      link.style.pointerEvents = 'auto';
      link.style.opacity = '1';
    } else {
      link.innerHTML = `Resend in (${seconds}s)`;
    }
  }, 1000);

  try {
    const res = await fetch(`${API_BASE}/send-registration-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, role: 'student' })
    });
    const data = await res.json();
    if (data.status === 'success') {
      showToast('A new OTP code has been sent to your email!');
    } else {
      showToast(data.message || 'Failed to resend!');
    }
  } catch (err) {
    showToast('Failed to connect to server!');
    console.error(err);
  }
}

function cancelOtp() {
  clearAllErrors();
  document.getElementById('otpSection').style.display = 'none';
  document.getElementById('regForm').style.display = 'block';
}



function setBtnLoading(btn, isLoading) {
  if (!btn) return;
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

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  const otpInput = document.getElementById('regOtp');
  if (otpInput) {
    otpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        verifyAndRegister();
      }
    });
  }
});