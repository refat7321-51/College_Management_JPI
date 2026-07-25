const hostname = window.location.hostname || '127.0.0.1';
const API_BASE = (hostname === 'localhost' || hostname === '127.0.0.1') ? `http://${hostname}:8000/api` : '/api';

/* ================================
   TEACHER REGISTER — JAVASCRIPT
================================ */

/* Admin PIN is now verified on the Backend for security */

/* ---- PIN BOX NAVIGATION ---- */
function pinMove(el, nextIdx) {
  el.value = el.value.replace(/[^0-9]/g, '');
  if (el.value.length === 1) {
    el.classList.add('filled');
    if (nextIdx >= 0 && nextIdx <= 5) {
      document.getElementById('p' + nextIdx).focus();
    }
  } else if (el.value.length === 0) {
    el.classList.remove('filled');
  }
}

function pinBack(event, el, prevIdx) {
  if (event.key === 'Backspace' && el.value === '' && prevIdx >= 0) {
    const prev = document.getElementById('p' + prevIdx);
    prev.value = '';
    prev.classList.remove('filled');
    prev.focus();
  }
}

function getPin() {
  let pin = '';
  for (let i = 0; i <= 5; i++) {
    pin += document.getElementById('p' + i).value;
  }
  return pin;
}

function clearPin() {
  const boxes = document.querySelectorAll('.pin-box');
  boxes.forEach(b => {
    b.value = '';
    b.classList.remove('filled');
    b.classList.remove('invalid-input');
  });
  if (boxes[0]) boxes[0].focus();
}

/* ---- EYE TOGGLE ---- */
function toggleEye(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  btn.style.color = isPass ? 'var(--gold)' : 'var(--muted)';
}

/* ---- PASSWORD STRENGTH ---- */
function checkStrength(val) {
  const bar = document.getElementById('strengthBar');
  const hint = document.getElementById('passHint');
  if (!bar || !hint) return;

  // Trigger match check as well
  validateTeacherPasswordMatch();

  if (!val) {
    bar.style.width = '0%';
    hint.textContent = 'Use letters, numbers & symbols';
    hint.style.color = 'var(--muted)';
    return;
  }

  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { w: '25%', color: '#f87171', label: 'Weak — too simple' },
    { w: '50%', color: '#fb923c', label: 'Fair — add complexity' },
    { w: '75%', color: '#facc15', label: 'Good — almost there' },
    { w: '100%', color: '#4ade80', label: 'Strong — Excellent!' },
  ];
  const idx = Math.max(0, Math.min(score - 1, 3));
  bar.style.width = levels[idx].w;
  bar.style.background = levels[idx].color;
  hint.textContent = 'Strength: ' + levels[idx].label;
  hint.style.color = levels[idx].color;
}

// IMPROVED REAL-TIME MATCH CHECK
function validateTeacherPasswordMatch() {
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
        cpassInput.addEventListener('input', validateTeacherPasswordMatch);
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
}

/* ---- MODAL ---- */
function openModal() {
  document.getElementById('pinModal').classList.add('open');
}

function closeModal() {
  document.getElementById('pinModal').classList.remove('open');
  clearPin();
}

// Global data to hold form values until OTP is verified
let pendingTeacherData = null;

async function handleTeacherRegistration(e) {
  e.preventDefault();
  clearAllErrors();
  let valid = true;

  /* text inputs */
  const textFields = [
    { id: 'fname', fg: 'fg-fname' },
    { id: 'lname', fg: 'fg-lname' },
    { id: 'userEmailBox', fg: 'fg-email' },
  ];

  textFields.forEach(f => {
    const val = document.getElementById(f.id).value.trim();
    if (!val) { markInvalid(f.fg); valid = false; }
    else markValid(f.fg);
  });

  /* email format */
  const emailVal = document.getElementById('userEmailBox').value.trim();
  if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    markInvalid('fg-email'); valid = false;
  }

  /* mobile */
  const mob = document.getElementById('mobile');
  const mobVal = mob.value.trim();
  const mobFg = document.getElementById('fg-mobile');
  const mobErr = document.getElementById('mobile-err');
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

  /* department */
  const deptVal = document.getElementById('dept').value;
  if (!deptVal) { markInvalid('fg-dept'); valid = false; }
  else markValid('fg-dept');

  /* gender */
  const genderChecked = document.querySelector('input[name="gender"]:checked');
  const genderFg = document.getElementById('fg-gender');
  const genderErr = document.getElementById('gender-err');
  if (!genderChecked) {
    genderFg.classList.add('invalid');
    genderErr.style.display = 'block';
    valid = false;
  } else {
    genderFg.classList.remove('invalid');
    genderErr.style.display = 'none';
  }

  /* PIN */
  const pin = getPin();
  const pinFg = document.getElementById('fg-pin');
  const pinErr = document.getElementById('pin-err');
  if (pin.length < 6) {
    pinFg.classList.add('invalid');
    pinErr.style.display = 'block';
    valid = false;
  } else {
    pinFg.classList.remove('invalid');
    pinErr.style.display = 'none';
  }

  /* password */
  const pass = document.getElementById('pass');
  if (!pass.value || pass.value.length < 8) {
    markInvalid('fg-pass'); valid = false;
  } else {
    markValid('fg-pass');
  }

  /* confirm password final check */
  const cpass = document.getElementById('cpass');
  const cpassFg = document.getElementById('fg-cpass');
  const cpassErr = document.getElementById('cpass-err');
  if (!cpass.value || cpass.value !== pass.value) {
    cpassFg.classList.add('invalid');
    cpass.classList.add('invalid-input');
    cpassErr.style.display = 'block';
    cpassErr.textContent = 'Passwords mismatch';
    cpassErr.style.color = '#f87171';
    valid = false;
  } else {
    // Keep clean
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

  // Submit button state
  const btn = e.target.querySelector('button[type="submit"]');
  setBtnLoading(btn, true);

  // Store data locally until OTP is verified
  pendingTeacherData = {
    role: 'teacher',
    first_name: document.getElementById('fname').value.trim(),
    last_name: document.getElementById('lname').value.trim(),
    email: emailVal,
    mobile: mobVal,
    department: deptVal,
    gender: genderChecked.value,
    password: pass.value,
    pin: pin  // Pass the PIN to backend for verification
  };

  try {
    const res = await fetch(`${API_BASE}/send-registration-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: pendingTeacherData.email,
        role: pendingTeacherData.role,
        pin: pendingTeacherData.pin 
      })
    });
    const data = await res.json();
    
    setBtnLoading(btn, false);

    if (data.status === 'success') {
      document.getElementById('regTargetEmail').innerHTML = pendingTeacherData.email;
      document.getElementById('teacherForm').style.display = 'none';
      document.getElementById('otpSection').style.display = 'block';
    } else {
      if (data.message.includes("PIN")) {
        // PIN error handling
        const pinBoxes = document.querySelectorAll('.pin-box');
        pinBoxes.forEach(b => b.classList.add('invalid-input'));
        openModal();
      } else {
        // Other errors (e.g. email already exists)
        markInvalid('fg-email');
        const emailErr = document.querySelector('#fg-email .err-msg');
        if (emailErr) {
          emailErr.textContent = data.message || 'Error occurred while sending OTP.';
          emailErr.style.display = 'block';
        }
      }
    }
  } catch (err) {
    setBtnLoading(btn, false);
    showToast('Network error! Please try again.');
    console.error(err);
  }
}

async function verifyAndRegisterTeacher() {
  const otpInput = document.getElementById('regOtp');
  const otpErr = document.getElementById('regOtpErr');
  const otpVal = otpInput.value.trim();
  
  otpInput.classList.remove('invalid-input');
  otpErr.style.display = 'none';

  if (otpVal.length < 6) {
    otpInput.classList.add('invalid-input');
    otpErr.textContent = 'Enter the 6-digit code!';
    otpErr.style.display = 'block';
    return;
  }

  const payload = { ...pendingTeacherData, registration_otp: otpVal };
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
      sessionStorage.setItem('newlyRegisteredEmail', pendingTeacherData.email);
      sessionStorage.setItem('newlyRegisteredRole', 'teacher');
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
  if (link.style.pointerEvents === 'none') return;

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
      body: JSON.stringify({ email: pendingTeacherData.email, role: 'teacher', pin: pendingTeacherData.pin })
    });
    const data = await res.json();
    if (data.status === 'success') {
      showToast('A new code has been sent!');
    } else {
      showToast(data.message || 'Failed to resend!');
    }
  } catch (err) {
    console.error(err);
  }
}

function cancelOtpTeacher() {
  clearAllErrors();
  document.getElementById('otpSection').style.display = 'none';
  document.getElementById('teacherForm').style.display = 'block';
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
  // OTP Enter listener
  const otpInput = document.getElementById('regOtp');
  if (otpInput) {
    otpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        verifyAndRegisterTeacher();
      }
    });
  }

  // PIN box Enter listener
  const pinBoxes = document.querySelectorAll('.pin-box');
  pinBoxes.forEach(box => {
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        // Find teacherForm submit button and trigger click or just handle
        const form = document.getElementById('teacherForm');
        if (form) {
            const event = new Event('submit', { cancelable: true });
            form.dispatchEvent(event);
        }
      }
    });
  });
});