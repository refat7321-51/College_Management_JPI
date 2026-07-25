/* ====================================================
   PUBLIC HOMEPAGE JS — Jashore Govt. Polytechnic Institute (JPI)
   ==================================================== */

const _ph = window.location.hostname;
const API = (_ph === 'localhost' || _ph === '127.0.0.1') ? `http://${_ph}:8000/api` : '/api';
const MEDIA_BASE = (_ph === 'localhost' || _ph === '127.0.0.1') ? `http://${_ph}:8000` : '';
let allTeachers = [];
let selectedDepartment = 'All';

// Scroll to top on every page load/refresh (prevent browser scroll restore)
if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
window.addEventListener('load', () => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); });

// Map stored department names to standard names
const DEPT_MAPPING = {
  'computer': 'Computer Science & Technology',
  'computer technology': 'Computer Science & Technology',
  'computer science & technology': 'Computer Science & Technology',
  'computer science and technology': 'Computer Science & Technology',
  'cst': 'Computer Science & Technology',

  'civil': 'Civil Technology',
  'civil technology': 'Civil Technology',

  'electrical': 'Electrical Technology',
  'electrical technology': 'Electrical Technology',

  'electronics': 'Electronics Technology',
  'electronics technology': 'Electronics Technology',

  'mechanical': 'Mechanical Technology',
  'mechanical technology': 'Mechanical Technology',

  'power': 'Power Technology',
  'power technology': 'Power Technology',

  'telecommunication': 'Telecommunication Technology',
  'telecommunication technology': 'Telecommunication Technology',
  'telecom': 'Telecommunication Technology',
  'telecom technology': 'Telecommunication Technology',

  'non-tech': 'Non-Tech Department',
  'non tech': 'Non-Tech Department',
  'nontech': 'Non-Tech Department',
};

function normalizeDept(name) {
  if (!name) return 'computer';
  let s = name.toLowerCase().trim();
  if (s.includes('computer') || s.includes('cst')) return 'computer';
  if (s.includes('civil')) return 'civil';
  if (s.includes('electrical') && !s.includes('electronic')) return 'electrical';
  if (s.includes('electronic')) return 'electronics';
  if (s.includes('mechanical')) return 'mechanical';
  if (s.includes('power')) return 'power';
  if (s.includes('telecom') || s.includes('telecommunication')) return 'telecom';
  return 'computer';
}
window.normalizeDept = normalizeDept;

let currentDeptFilter = 'All';
let currentSearchQuery = '';

// Priority rank for designations: Principal (1) -> Vice Principal (2) -> Head of Dept (3) -> Instructors (4+)
function getTeacherRank(t) {
  const desig = (t.designation || '').toLowerCase().trim();
  if (desig.includes('principal') && !desig.includes('vice')) return 1;
  if (desig.includes('vice principal') || desig.includes('vice-principal')) return 2;
  if (desig.includes('head') || desig.includes('hod') || desig.includes('chief instructor') || desig.includes('department head')) return 3;
  if (desig.includes('senior instructor') || desig.includes('assistant professor')) return 4;
  if (desig.includes('instructor')) return 5;
  if (desig.includes('junior instructor')) return 6;
  return 10;
}

// Fetch and render public teacher list
async function fetchPublicTeachers() {
  const grid = document.getElementById('teachersGrid') || document.getElementById('publicTeachersGrid');
  if (!grid) return;

  try {
    const res = await fetch(`${API}/get-teachers/`);
    if (!res.ok) throw new Error('Failed to fetch teacher list');
    const resData = await res.json();
    allTeachers = resData.data || resData.teachers || [];
    renderPublicTeachers();
  } catch (err) {
    console.error('Teacher list load error:', err);
    grid.innerHTML = `<div class="no-teachers"><p><i class="fas fa-exclamation-triangle"></i> Failed to load faculty directory. Please try again later.</p></div>`;
  }
}

function onDeptFilterChange(dept) {
  currentDeptFilter = dept;
  const banner = document.getElementById('activeDeptBanner');
  const bannerDeptName = document.getElementById('activeDeptName');
  if (banner && bannerDeptName) {
    if (dept !== 'All') {
      bannerDeptName.textContent = dept;
      banner.style.display = 'flex';
    } else {
      banner.style.display = 'none';
    }
  }
  renderPublicTeachers();
}

function filterTeachers() {
  const input = document.getElementById('teacherSearch');
  if (input) {
    currentSearchQuery = input.value.toLowerCase().trim();
  }
  renderPublicTeachers();
}

function resetDeptFilter() {
  currentDeptFilter = 'All';
  currentSearchQuery = '';
  const deptSelect = document.getElementById('teacherDeptFilter');
  if (deptSelect) deptSelect.value = 'All';
  const searchInput = document.getElementById('teacherSearch');
  if (searchInput) searchInput.value = '';
  const banner = document.getElementById('activeDeptBanner');
  if (banner) banner.style.display = 'none';
  renderPublicTeachers();
}

function renderPublicTeachers() {
  const grid = document.getElementById('teachersGrid') || document.getElementById('publicTeachersGrid');
  if (!grid) return;

  let filtered = allTeachers;

  // Department filter
  if (currentDeptFilter !== 'All') {
    filtered = filtered.filter(t => {
      const mapped = DEPT_MAPPING[(t.department || '').toLowerCase().trim()] || t.department;
      return mapped === currentDeptFilter || (t.department || '').toLowerCase().includes(currentDeptFilter.toLowerCase());
    });
  }

  // Name / Subject search filter
  if (currentSearchQuery) {
    filtered = filtered.filter(t => {
      const nameMatch = (t.name || `${t.first_name || ''} ${t.last_name || ''}`).toLowerCase().includes(currentSearchQuery);
      const deptMatch = (t.department || '').toLowerCase().includes(currentSearchQuery);
      const desigMatch = (t.designation || '').toLowerCase().includes(currentSearchQuery);
      const subjMatch = Array.isArray(t.subjects) ? t.subjects.some(s => s.toLowerCase().includes(currentSearchQuery)) : false;
      const specMatch = (t.specialized_subjects || '').toLowerCase().includes(currentSearchQuery);
      return nameMatch || deptMatch || desigMatch || subjMatch || specMatch;
    });
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-teachers"><p><i class="fas fa-info-circle"></i> No faculty members found matching your selection.</p></div>`;
    return;
  }

  // Sort by priority designation rank: Principal (1) -> Vice Principal (2) -> Head of Dept (3) -> Instructors (4+)
  filtered.sort((a, b) => {
    const rankA = getTeacherRank(a);
    const rankB = getTeacherRank(b);
    if (rankA !== rankB) return rankA - rankB;
    const nameA = (a.name || `${a.first_name || ''} ${a.last_name || ''}`).toLowerCase();
    const nameB = (b.name || `${b.first_name || ''} ${b.last_name || ''}`).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  grid.innerHTML = filtered.map(t => {
    const name = t.name || `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Faculty Member';
    const deptName = DEPT_MAPPING[(t.department || '').toLowerCase().trim()] || t.department || 'General';
    const photoUrl = t.profile_picture || t.photo || null;
    const initial = name ? name.charAt(0).toUpperCase() : 'T';

    const avatarHtml = photoUrl
      ? `<img src="${photoUrl}" alt="${name}" class="teacher-avatar">`
      : `<div class="teacher-avatar-placeholder">${initial}</div>`;

    const desig = t.designation || 'Instructor';
    const subjects = Array.isArray(t.subjects) && t.subjects.length > 0 
      ? t.subjects 
      : (t.specialized_subjects ? t.specialized_subjects.split(',').map(s => s.trim()) : []);

    const subjectsHtml = subjects.length > 0
      ? `<div class="teacher-subjects">${subjects.slice(0, 4).map(s => `<span>${s}</span>`).join('')}</div>`
      : '';

    return `
      <div class="teacher-card">
        ${avatarHtml}
        <h3 class="teacher-name">${name}</h3>
        <div class="teacher-desig">${desig}</div>
        <div class="teacher-dept"><i class="fas fa-graduation-cap" style="margin-right: 4px; color: var(--accent);"></i> ${deptName}</div>
        ${subjectsHtml}
        ${t.room_number ? `<div class="teacher-room"><i class="fas fa-door-open"></i> Room: ${t.room_number}</div>` : ''}
      </div>
    `;
  }).join('');
}

window.fetchPublicTeachers = fetchPublicTeachers;
window.onDeptFilterChange = onDeptFilterChange;
window.filterTeachers = filterTeachers;
window.resetDeptFilter = resetDeptFilter;

// Fetch public notices for notice ticker & public grid
async function fetchPublicNotices() {
  try {
    const res = await fetch(`${API}/get-notices/`);
    if (!res.ok) return;
    const data = await res.json();
    const notices = data.notices || [];

    // Update Notice Ticker
    const tickerTrack = document.getElementById('tickerTrack');
    if (tickerTrack) {
      if (notices.length > 0) {
        tickerTrack.innerHTML = notices.map(n => `
          <span class="ticker-item">
            <span class="ticker-tag">${n.dept || 'All Dept'}</span>
            <strong>${n.title}:</strong> ${n.content} (${n.date || ''})
          </span>
        `).join(' &nbsp;&nbsp;•&nbsp;&nbsp; ');
      } else {
        tickerTrack.innerHTML = `<span>No urgent notices at this time. Check back later for academic updates!</span>`;
      }
    }

    // Update Public Notices Grid
    const publicGrid = document.getElementById('publicNoticesGrid');
    if (publicGrid) {
      if (notices.length > 0) {
        publicGrid.innerHTML = notices.map(n => `
          <div class="notice-card-pub">
            <div class="notice-card-pub-header">
              <span class="notice-dept-pill"><i class="fas fa-building"></i> ${n.dept || 'General'}</span>
              <span class="notice-date-pill"><i class="fas fa-calendar-alt"></i> ${n.date || 'Recent'}</span>
            </div>
            <h3 class="notice-pub-title">${n.title}</h3>
            <p class="notice-pub-content">${n.content}</p>
            <div class="notice-pub-footer">
              <span class="notice-author"><i class="fas fa-user-edit"></i> Posted by: ${n.teacher_name || 'Faculty Office'}</span>
            </div>
          </div>
        `).join('');
      } else {
        publicGrid.innerHTML = `<div class="no-teachers" style="grid-column:1/-1"><p>📋 No public notices available at this moment.</p></div>`;
      }
    }
  } catch (err) {
    console.error('Failed to load notices:', err);
  }
}

// Fetch dynamic college stats (total teachers & students enrolled)
async function fetchCollegeStats() {
  try {
    const res = await fetch(`${API}/public/college-info/`);
    if (!res.ok) return;
    const resData = await res.json();
    if (resData.status === 'success' && resData.data) {
      const teacherElem = document.getElementById('statTeachers');
      const studentElem = document.getElementById('statStudents');
      if (teacherElem && resData.data.total_teachers !== undefined) {
        const count = resData.data.total_teachers;
        teacherElem.textContent = count > 0 ? `${count}+` : '15+';
      }
      if (studentElem && resData.data.total_students !== undefined) {
        const count = resData.data.total_students;
        studentElem.textContent = count > 0 ? `${count}+` : '1200+';
      }
    }
  } catch (err) {
    console.error('Failed to load college stats:', err);
  }
}

// ─── SMART NAVBAR: auto-hide on scroll down, show on scroll up ───────────
let lastScrollY = 0;
let scrollTimeout = null;

window.addEventListener('scroll', () => {
  const currentY = window.scrollY;
  const navbar = document.getElementById('navbar');

  if (navbar) {
    // Scrolled class for shadow
    if (currentY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Auto-hide: hide when scrolling DOWN, show when scrolling UP
    // Only hide after we've scrolled past the navbar height (70px)
    if (currentY > 70) {
      if (currentY > lastScrollY + 8) {
        // Scrolling DOWN → hide navbar
        navbar.classList.add('nav-hidden');
      } else if (currentY < lastScrollY - 4) {
        // Scrolling UP → show navbar
        navbar.classList.remove('nav-hidden');
      }
    } else {
      // Near top → always show
      navbar.classList.remove('nav-hidden');
    }
  }

  // Hero scroll arrow: hide once scrolled past 80px
  const heroScroll = document.querySelector('.hero-scroll');
  if (heroScroll) {
    if (currentY > 80) {
      heroScroll.classList.add('scrolled-hide');
    } else {
      heroScroll.classList.remove('scrolled-hide');
    }
  }

  lastScrollY = currentY;

  // Update active nav link (scroll spy)
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(updateActiveNavLink, 60);
});

// ─── SCROLL SPY: highlight active nav link based on visible section ───────
const NAV_SECTIONS = [
  { id: 'home',            href: '#home' },
  { id: 'departments',     href: '#departments' },
  { id: 'teachers',        href: '#teachers' },
  { id: 'books-directory', href: '#books-directory' },
  { id: 'about',           href: '#about' },
  { id: 'notices-public',  href: '#notices-public' },
];

function updateActiveNavLink() {
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
  const scrollMid = window.scrollY + navH + window.innerHeight * 0.25;

  let activeId = 'home';
  for (const sec of NAV_SECTIONS) {
    const el = document.getElementById(sec.id);
    if (el && el.offsetTop <= scrollMid) {
      activeId = sec.id;
    }
  }

  document.querySelectorAll('.nav-links-center .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === `#${activeId}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ─── SCROLL TO SECTION: smooth scroll keeping navbar offset ───────────────
function scrollToSection(sectionId, event) {
  if (event) event.preventDefault();
  const el = document.getElementById(sectionId);
  if (!el) return;
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
  const top = el.getBoundingClientRect().top + window.scrollY - navH - 8;
  window.scrollTo({ top, behavior: 'smooth' });

  // Also show navbar when nav link is clicked (in case it was hidden)
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.classList.remove('nav-hidden');
}
window.scrollToSection = scrollToSection;

// ─── MOBILE MENU TOGGLE ───────────────────────────────────────────────────
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}
window.toggleMobileMenu = toggleMobileMenu;

// ─── SCROLL REVEAL: fade-in sections as they enter viewport ───────────────
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(
    '.dept-card, .feature-card, .teacher-card, .section-header, ' +
    '.semester-info, .book-selection-card, .about-grid, .notice-pub-card, .footer-grid'
  ).forEach(el => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
    observer.observe(el);
  });
}

// ─── GLOBAL INIT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  fetchCollegeStats();
  fetchPublicTeachers();
  fetchPublicNotices();
  initScrollReveal();
  updateActiveNavLink(); // Set correct active on first load
});


// ============================================================
// PUBLIC SEMESTER BOOKS DIRECTORY (Probidhan 2022 — 1st to 8th Semester)
// ============================================================

const PROBIDHAN_2022_DATA = {
  // ─── COMPUTER SCIENCE & TECHNOLOGY (Technology Code: 85) ───────────────
  'computer': {
    deptName: 'Computer Science & Technology — Technology Code: 85 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl: 1, subject: 'Engineering Drawing', code: '21011' },
        { sl: 2, subject: 'Bangla-I', code: '25711' },
        { sl: 3, subject: 'English-I', code: '25712' },
        { sl: 4, subject: 'Mathematics-I', code: '25911' },
        { sl: 5, subject: 'Physics-I', code: '25912' },
        { sl: 6, subject: 'Computer Office Application', code: '28511' },
        { sl: 7, subject: 'Basic Electricity', code: '26711' }
      ],
      '2nd Semester': [
        { sl: 1, subject: 'Bangla-II', code: '25721' },
        { sl: 2, subject: 'English-II', code: '25722' },
        { sl: 3, subject: 'Physical Education & Life Skills Development', code: '25812' },
        { sl: 4, subject: 'Chemistry', code: '25913' },
        { sl: 5, subject: 'Mathematics-II', code: '25921' },
        { sl: 6, subject: 'Python Programming', code: '28521' },
        { sl: 7, subject: 'Computer Graphics Design-I', code: '28522' },
        { sl: 8, subject: 'Basic Electronics', code: '26811' }
      ],
      '3rd Semester': [
        { sl: 1, subject: 'Social Science', code: '25811' },
        { sl: 2, subject: 'Physics-II', code: '25922' },
        { sl: 3, subject: 'Mathematics-III', code: '25931' },
        { sl: 4, subject: 'Application Development Using Python', code: '28531' },
        { sl: 5, subject: 'Computer Graphics Design-II', code: '28532' },
        { sl: 6, subject: 'IT Support Services', code: '28533' },
        { sl: 7, subject: 'Digital Electronics-I', code: '26831' }
      ],
      '4th Semester': [
        { sl: 1, subject: 'Business Communication', code: '25831' },
        { sl: 2, subject: 'Java Programming', code: '28541' },
        { sl: 3, subject: 'Data Structure & Algorithm', code: '28542' },
        { sl: 4, subject: 'Computer Peripherals & Interfacing', code: '28543' },
        { sl: 5, subject: 'Web Design & Development-I', code: '28544' },
        { sl: 6, subject: 'Digital Electronics-II', code: '26841' },
        { sl: 7, subject: 'Environmental Studies', code: '29041' }
      ],
      '5th Semester': [
        { sl: 1, subject: 'Accounting', code: '25841' },
        { sl: 2, subject: 'Application Development Using Java', code: '28551' },
        { sl: 3, subject: 'Web Design & Development-II', code: '28552' },
        { sl: 4, subject: 'Computer Architecture & Microprocessor', code: '28553' },
        { sl: 5, subject: 'Data Communication', code: '28554' },
        { sl: 6, subject: 'Operating System', code: '28555' },
        { sl: 7, subject: 'Project Work-I', code: '28556' }
      ],
      '6th Semester': [
        { sl: 1, subject: 'Principles of Marketing', code: '25851' },
        { sl: 2, subject: 'Industrial Management', code: '25852' },
        { sl: 3, subject: 'Database Management System', code: '28561' },
        { sl: 4, subject: 'Computer Networking', code: '28562' },
        { sl: 5, subject: 'Sensor & IoT System', code: '28563' },
        { sl: 6, subject: 'Microcontroller Based System Design & Development', code: '28564' },
        { sl: 7, subject: 'Surveillance Security System', code: '28565' },
        { sl: 8, subject: 'Web Development Project', code: '28566' }
      ],
      '7th Semester': [
        { sl: 1, subject: 'Innovation & Entrepreneurship', code: '25853' },
        { sl: 2, subject: 'Digital Marketing Technique', code: '28571' },
        { sl: 3, subject: 'Network Administration & Services', code: '28572' },
        { sl: 4, subject: 'Cyber Security & Ethics', code: '28573' },
        { sl: 5, subject: 'Apps Development Project', code: '28574' },
        { sl: 6, subject: 'Multimedia & Animation', code: '28575' },
        { sl: 7, subject: 'Project Work-II', code: '28576' }
      ],
      '8th Semester': [
        { sl: 1, subject: 'Industrial Attachment', code: '28581' },
        { sl: 2, subject: 'Project Presentation', code: '28581' }
      ]
    }
  },

  // ─── CIVIL TECHNOLOGY (Technology Code: 64) ───────────────────────────────
  'civil': {
    deptName: 'Civil Technology — Technology Code: 64 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl: 1, subject: 'Engineering Drawing', code: '21011' },
        { sl: 2, subject: 'Bangla-I', code: '25711' },
        { sl: 3, subject: 'English-I', code: '25712' },
        { sl: 4, subject: 'Social Science', code: '25811' },
        { sl: 5, subject: 'Mathematics-I', code: '25911' },
        { sl: 6, subject: 'Chemistry', code: '25913' },
        { sl: 7, subject: 'Civil Engineering Materials', code: '26411' },
        { sl: 8, subject: 'Basic Electricity', code: '26711' }
      ],
      '2nd Semester': [
        { sl: 1, subject: 'Bangla-II', code: '25721' },
        { sl: 2, subject: 'English-II', code: '25722' },
        { sl: 3, subject: 'Physical Education & Life Skills Development', code: '25812' },
        { sl: 4, subject: 'Physics-I', code: '25912' },
        { sl: 5, subject: 'Mathematics-II', code: '25921' },
        { sl: 6, subject: 'Civil Engineering Drawing', code: '26421' },
        { sl: 7, subject: 'Basic Electronics', code: '26811' },
        { sl: 8, subject: 'Basic Workshop Practice', code: '27011' }
      ],
      '3rd Semester': [
        { sl: 1, subject: 'Business Communication', code: '25831' },
        { sl: 2, subject: 'Physics-II', code: '25922' },
        { sl: 3, subject: 'Mathematics-III', code: '25931' },
        { sl: 4, subject: 'Structural Mechanics', code: '26431' },
        { sl: 5, subject: 'Surveying-I', code: '26432' },
        { sl: 6, subject: 'Construction Process-I', code: '26433' },
        { sl: 7, subject: 'Computer Office Application', code: '28511' }
      ],
      '4th Semester': [
        { sl: 1, subject: 'Accounting', code: '25841' },
        { sl: 2, subject: 'Construction Process-II', code: '26441' },
        { sl: 3, subject: 'Estimating & Costing-I', code: '26442' },
        { sl: 4, subject: 'Civil CAD-I', code: '26443' },
        { sl: 5, subject: 'Surveying-II', code: '26444' },
        { sl: 6, subject: 'Geotechnical Engineering', code: '26445' },
        { sl: 7, subject: 'Hydrology', code: '26446' },
        { sl: 8, subject: 'Wood Workshop Practice', code: '26521' }
      ],
      '5th Semester': [
        { sl: 1, subject: 'Industrial Management', code: '25852' },
        { sl: 2, subject: 'Foundation Engineering', code: '26451' },
        { sl: 3, subject: 'Civil CAD-II', code: '26452' },
        { sl: 4, subject: 'Surveying-III', code: '26453' },
        { sl: 5, subject: 'Theory of Structure', code: '26454' },
        { sl: 6, subject: 'Water Supply Engineering', code: '26455' },
        { sl: 7, subject: 'Hydraulics', code: '26456' }
      ],
      '6th Semester': [
        { sl: 1, subject: 'Water Resources Engineering', code: '26461' },
        { sl: 2, subject: 'Advance Surveying', code: '26462' },
        { sl: 3, subject: 'Transportation Engineering-I', code: '26463' },
        { sl: 4, subject: 'Design of Structure-I', code: '26464' },
        { sl: 5, subject: 'Steel Structures', code: '28863' },
        { sl: 6, subject: 'Advanced Construction', code: '28861' },
        { sl: 7, subject: 'Environmental Studies', code: '29041' }
      ],
      '7th Semester': [
        { sl: 1, subject: 'Principles of Marketing', code: '25851' },
        { sl: 2, subject: 'Innovation & Entrepreneurship', code: '25853' },
        { sl: 3, subject: 'Civil Engineering Project', code: '26471' },
        { sl: 4, subject: 'Sanitary Engineering', code: '26472' },
        { sl: 5, subject: 'Transportation Engineering-II', code: '26473' },
        { sl: 6, subject: 'Design of Structure-II', code: '26474' },
        { sl: 7, subject: 'Estimating & Costing-II', code: '26475' },
        { sl: 8, subject: 'Construction Management & Documentation', code: '28871' }
      ],
      '8th Semester': [
        { sl: 1, subject: 'Industrial Attachment', code: '26481' },
        { sl: 2, subject: 'Project Presentation', code: '26481' }
      ]
    }
  },

  // ─── ELECTRICAL TECHNOLOGY (Technology Code: 67) ──────────────────────────
  'electrical': {
    deptName: 'Electrical Technology — Technology Code: 67 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl: 1, subject: 'Engineering Drawing', code: '21011' },
        { sl: 2, subject: 'Bangla-I', code: '25711' },
        { sl: 3, subject: 'English-I', code: '25712' },
        { sl: 4, subject: 'Physical Education & Life Skills Development', code: '25812' },
        { sl: 5, subject: 'Mathematics-I', code: '25911' },
        { sl: 6, subject: 'Physics-I', code: '25912' },
        { sl: 7, subject: 'Basic Electricity', code: '26711' },
        { sl: 8, subject: 'Electrical Engineering Materials', code: '26712' }
      ],
      '2nd Semester': [
        { sl: 1, subject: 'Bangla-II', code: '25721' },
        { sl: 2, subject: 'English-II', code: '25722' },
        { sl: 3, subject: 'Mathematics-II', code: '25921' },
        { sl: 4, subject: 'Physics-II', code: '25922' },
        { sl: 5, subject: 'Electrical Circuits-I', code: '26721' },
        { sl: 6, subject: 'Electrical Engineering Drawing', code: '26722' },
        { sl: 7, subject: 'Basic Electronics', code: '26811' }
      ],
      '3rd Semester': [
        { sl: 1, subject: 'Mathematics-III', code: '25931' },
        { sl: 2, subject: 'Chemistry', code: '25913' },
        { sl: 3, subject: 'Computer Office Application', code: '28511' },
        { sl: 4, subject: 'Electrical Circuits-II', code: '26731' },
        { sl: 5, subject: 'Electrical Appliances', code: '26732' },
        { sl: 6, subject: 'Industrial Electronics', code: '26833' }
      ],
      '4th Semester': [
        { sl: 1, subject: 'Social Science', code: '25811' },
        { sl: 2, subject: 'Accounting', code: '25841' },
        { sl: 3, subject: 'Electrical Installation, Planning and Estimating', code: '26741' },
        { sl: 4, subject: 'DC Machine', code: '26742' },
        { sl: 5, subject: 'Electrical Engineering Project-I', code: '26743' },
        { sl: 6, subject: 'Digital Electronics', code: '26845' },
        { sl: 7, subject: 'Applied Mechanics', code: '27044' }
      ],
      '5th Semester': [
        { sl: 1, subject: 'Principles of Marketing', code: '25851' },
        { sl: 2, subject: 'Industrial Management', code: '25852' },
        { sl: 3, subject: 'Generation of Electrical Power', code: '26751' },
        { sl: 4, subject: 'Electrical & Electronic Measurements-I', code: '26752' },
        { sl: 5, subject: 'Testing and Maintenance of Electrical Equipments', code: '26753' },
        { sl: 6, subject: 'Electrical Engineering Project-II', code: '26754' },
        { sl: 7, subject: 'Microprocessor & Microcontroller', code: '26853' }
      ],
      '6th Semester': [
        { sl: 1, subject: 'Programming in C', code: '28567' },
        { sl: 2, subject: 'AC Machine-I', code: '26761' },
        { sl: 3, subject: 'Transmission and Distribution of Electrical Power-I', code: '26762' },
        { sl: 4, subject: 'Electrical & Electronic Measurements-II', code: '26763' },
        { sl: 5, subject: 'Communication Engineering', code: '26842' },
        { sl: 6, subject: 'Environmental Studies', code: '29041' }
      ],
      '7th Semester': [
        { sl: 1, subject: 'Business Communication', code: '25831' },
        { sl: 2, subject: 'Innovation & Entrepreneurship', code: '25853' },
        { sl: 3, subject: 'AC Machine-II', code: '26771' },
        { sl: 4, subject: 'Transmission and Distribution of Electrical Power-II', code: '26772' },
        { sl: 5, subject: 'Switch Gear and Protection', code: '26773' },
        { sl: 6, subject: 'Electrical Engineering Project-III', code: '26774' },
        { sl: 7, subject: 'Automation Engineering & PLC', code: '26875' }
      ],
      '8th Semester': [
        { sl: 1, subject: 'Industrial Attachment', code: '26781' },
        { sl: 2, subject: 'Project Presentation', code: '26781' }
      ]
    }
  },

  // ─── TELECOMMUNICATION TECHNOLOGY (Technology Code: 94) ───────────────────
  'telecom': {
    deptName: 'Telecommunication Technology — Technology Code: 94 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl: 1, subject: 'Engineering Drawing', code: '21011' },
        { sl: 2, subject: 'Bangla-I', code: '25711' },
        { sl: 3, subject: 'English-I', code: '25712' },
        { sl: 4, subject: 'Mathematics-I', code: '25911' },
        { sl: 5, subject: 'Physics-I', code: '25912' },
        { sl: 6, subject: 'Basic Electricity', code: '26711' },
        { sl: 7, subject: 'Basics of Telecommunication', code: '29411' }
      ],
      '2nd Semester': [
        { sl: 1, subject: 'Bangla-II', code: '25721' },
        { sl: 2, subject: 'English-II', code: '25722' },
        { sl: 3, subject: 'Social Science', code: '25811' },
        { sl: 4, subject: 'Physical Education & Life Skills Development', code: '25812' },
        { sl: 5, subject: 'Mathematics-II', code: '25921' },
        { sl: 6, subject: 'Physics-II', code: '25922' },
        { sl: 7, subject: 'Electrical Circuits-I', code: '26721' },
        { sl: 8, subject: 'Basic Electronics', code: '26811' }
      ],
      '3rd Semester': [
        { sl: 1, subject: 'Chemistry', code: '25913' },
        { sl: 2, subject: 'Mathematics-III', code: '25931' },
        { sl: 3, subject: 'Computer Office Application', code: '28511' },
        { sl: 4, subject: 'Electrical Circuits-II', code: '26731' },
        { sl: 5, subject: 'Electronic Devices and Circuits', code: '26821' },
        { sl: 6, subject: 'Telecom Workshop and Outside Plant', code: '29431' }
      ],
      '4th Semester': [
        { sl: 1, subject: 'Accounting', code: '25841' },
        { sl: 2, subject: 'Programming in C', code: '28567' },
        { sl: 3, subject: 'Electrical Installation, Planning and Estimating', code: '26741' },
        { sl: 4, subject: 'Digital Electronics', code: '26845' },
        { sl: 5, subject: 'Radio and TV Engineering', code: '29441' },
        { sl: 6, subject: 'IT Support and IoT Basics', code: '29442' },
        { sl: 7, subject: 'Data Communications and Networking', code: '29443' }
      ],
      '5th Semester': [
        { sl: 1, subject: 'Principles of Marketing', code: '25851' },
        { sl: 2, subject: 'Industrial Management', code: '25852' },
        { sl: 3, subject: 'DC Machine', code: '26742' },
        { sl: 4, subject: 'Generation of Electrical Power', code: '26751' },
        { sl: 5, subject: 'Electrical & Electronic Measurements-I', code: '26752' },
        { sl: 6, subject: 'Microprocessor & Microcontroller', code: '26853' },
        { sl: 7, subject: 'Multimedia and Webpage Design', code: '29451' }
      ],
      '6th Semester': [
        { sl: 1, subject: 'AC Machine-I', code: '26761' },
        { sl: 2, subject: 'Electrical & Electronic Measurements-II', code: '26763' },
        { sl: 3, subject: 'Transmission and Distribution of Electrical Power', code: '26764' },
        { sl: 4, subject: 'Environmental Studies', code: '29041' },
        { sl: 5, subject: 'Wireless and Mobile Communication', code: '29462' },
        { sl: 6, subject: 'Signals and Switching System', code: '29463' }
      ],
      '7th Semester': [
        { sl: 1, subject: 'Business Communication', code: '25831' },
        { sl: 2, subject: 'Innovation & Entrepreneurship', code: '25853' },
        { sl: 3, subject: 'AC Machine-II', code: '26771' },
        { sl: 4, subject: 'Switch Gear and Protection', code: '26773' },
        { sl: 5, subject: 'Microwave Engineering and Antennas', code: '29471' },
        { sl: 6, subject: 'Optical Fiber Communication', code: '29472' },
        { sl: 7, subject: 'Satellite Communication and RADAR', code: '29473' }
      ],
      '8th Semester': [
        { sl: 1, subject: 'Industrial Attachment', code: '26781' },
        { sl: 2, subject: 'Project Presentation', code: '26781' }
      ]
    }
  },

  // ─── MECHANICAL TECHNOLOGY (Technology Code: 70) ──────────────────────────
  'mechanical': {
    deptName: 'Mechanical Technology — Technology Code: 70 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl: 1, subject: 'Engineering Drawing', code: '21011' },
        { sl: 2, subject: 'Bangla-I', code: '25711' },
        { sl: 3, subject: 'English-I', code: '25712' },
        { sl: 4, subject: 'Physical Education & Life Skills Development', code: '25812' },
        { sl: 5, subject: 'Mathematics-I', code: '25911' },
        { sl: 6, subject: 'Physics-I', code: '25912' },
        { sl: 7, subject: 'Basic Workshop Practice', code: '27011' },
        { sl: 8, subject: 'Machine Shop Practice-I', code: '27012' }
      ],
      '2nd Semester': [
        { sl: 1, subject: 'Bangla-II', code: '25721' },
        { sl: 2, subject: 'English-II', code: '25722' },
        { sl: 3, subject: 'Chemistry', code: '25913' },
        { sl: 4, subject: 'Mathematics-II', code: '25921' },
        { sl: 5, subject: 'Physics-II', code: '25922' },
        { sl: 6, subject: 'Basic Electricity', code: '26711' },
        { sl: 7, subject: 'Mechanical Engineering Drawing', code: '27021' }
      ],
      '3rd Semester': [
        { sl: 1, subject: 'Social Science', code: '25811' },
        { sl: 2, subject: 'Business Communication', code: '25831' },
        { sl: 3, subject: 'Mathematics-III', code: '25931' },
        { sl: 4, subject: 'Mechanical Engineering Materials', code: '27031' },
        { sl: 5, subject: 'Machine Shop Practice-II', code: '27032' },
        { sl: 6, subject: 'RAC Cycles and Components', code: '27231' },
        { sl: 7, subject: 'Computer Office Application', code: '28511' }
      ],
      '4th Semester': [
        { sl: 1, subject: 'Accounting', code: '25841' },
        { sl: 2, subject: 'Basic Electronics', code: '26811' },
        { sl: 3, subject: 'Engineering Mechanics', code: '27041' },
        { sl: 4, subject: 'Machine Shop Practice-III', code: '27042' },
        { sl: 5, subject: 'Metallurgy', code: '27043' },
        { sl: 6, subject: 'Engineering Thermodynamics', code: '27131' },
        { sl: 7, subject: 'Environmental Studies', code: '29041' }
      ],
      '5th Semester': [
        { sl: 1, subject: 'Industrial Management', code: '25852' },
        { sl: 2, subject: 'Fluid Mechanics & Machineries', code: '27051' },
        { sl: 3, subject: 'Mechanical Estimating & Costing', code: '27052' },
        { sl: 4, subject: 'Advanced Welding-I', code: '27053' },
        { sl: 5, subject: 'Foundry & Pattern Making', code: '27054' },
        { sl: 6, subject: 'Manufacturing Process', code: '27055' },
        { sl: 7, subject: 'Programming in C', code: '28567' }
      ],
      '6th Semester': [
        { sl: 1, subject: 'Principles of Marketing', code: '25851' },
        { sl: 2, subject: 'Automobile Fundamentals', code: '26211' },
        { sl: 3, subject: 'Strength of Materials', code: '27061' },
        { sl: 4, subject: 'Mechanical Measurement & Metrology', code: '27062' },
        { sl: 5, subject: 'CAD & CAM', code: '27063' },
        { sl: 6, subject: 'Advanced Welding-II', code: '27064' },
        { sl: 7, subject: 'Plant Engineering & Maintenance', code: '27065' }
      ],
      '7th Semester': [
        { sl: 1, subject: 'Innovation & Entrepreneurship', code: '25853' },
        { sl: 2, subject: 'Design of Machine Elements', code: '27071' },
        { sl: 3, subject: 'Tool Design', code: '27072' },
        { sl: 4, subject: 'Heat Treatment of Metal', code: '27073' },
        { sl: 5, subject: 'Mechanical Engineering Project', code: '27074' },
        { sl: 6, subject: 'Production Planning & Control', code: '27075' },
        { sl: 7, subject: 'Mechatronics & PLC', code: '29231' }
      ],
      '8th Semester': [
        { sl: 1, subject: 'Industrial Attachment + Project Presentation', code: '27081' }
      ]
    }
  },

  // ─── POWER TECHNOLOGY (Technology Code: 71) ───────────────────────────────
  'power': {
    deptName: 'Power Technology — Technology Code: 71 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl: 1, subject: 'Engineering Drawing', code: '21011' },
        { sl: 2, subject: 'Bangla-I', code: '25711' },
        { sl: 3, subject: 'English-I', code: '25712' },
        { sl: 4, subject: 'Social Science', code: '25811' },
        { sl: 5, subject: 'Physical Education & Life Skills Development', code: '25812' },
        { sl: 6, subject: 'Mathematics-I', code: '25911' },
        { sl: 7, subject: 'Physics-I', code: '25912' },
        { sl: 8, subject: 'Power Engineering Fundamental', code: '27111' }
      ],
      '2nd Semester': [
        { sl: 1, subject: 'Bangla-II', code: '25721' },
        { sl: 2, subject: 'English-II', code: '25722' },
        { sl: 3, subject: 'Chemistry', code: '25913' },
        { sl: 4, subject: 'Mathematics-II', code: '25921' },
        { sl: 5, subject: 'Basic Electricity', code: '26711' },
        { sl: 6, subject: 'Basic Workshop Practice', code: '27011' },
        { sl: 7, subject: 'Power Equipment Management & Safety', code: '27121' },
        { sl: 8, subject: 'Computer Office Application', code: '28511' }
      ],
      '3rd Semester': [
        { sl: 1, subject: 'Physics-II', code: '25922' },
        { sl: 2, subject: 'Mathematics-III', code: '25931' },
        { sl: 3, subject: 'Basic Electronics', code: '26811' },
        { sl: 4, subject: 'Machine Shop Practice-I', code: '27012' },
        { sl: 5, subject: 'Engineering Thermodynamics', code: '27131' },
        { sl: 6, subject: 'RAC Cycles and Components', code: '27231' }
      ],
      '4th Semester': [
        { sl: 1, subject: 'Accounting', code: '25841' },
        { sl: 2, subject: 'Engineering Mechanics', code: '27041' },
        { sl: 3, subject: 'Metallurgy', code: '27043' },
        { sl: 4, subject: 'IC Engine Details', code: '27141' },
        { sl: 5, subject: 'Fuels & Lubricants', code: '27142' },
        { sl: 6, subject: 'Suspension, Brake, Steering & Transmission System of Vehicle', code: '26262' },
        { sl: 7, subject: 'Programming in C', code: '28567' }
      ],
      '5th Semester': [
        { sl: 1, subject: 'Business Communication', code: '25831' },
        { sl: 2, subject: 'Industrial Management', code: '25852' },
        { sl: 3, subject: 'Automotive Body Building', code: '26241' },
        { sl: 4, subject: 'Fluid Mechanics & Machineries', code: '27051' },
        { sl: 5, subject: 'Advanced Welding-I', code: '27053' },
        { sl: 6, subject: 'Automotive Electricity, Electronics & Automation', code: '27151' },
        { sl: 7, subject: 'Power Plant Engineering', code: '27152' }
      ],
      '6th Semester': [
        { sl: 1, subject: 'Transmission and Distribution of Electrical Power', code: '26764' },
        { sl: 2, subject: 'Strength of Materials', code: '27061' },
        { sl: 3, subject: 'Mechanical Measurement & Metrology', code: '27062' },
        { sl: 4, subject: 'Plant Engineering & Maintenance', code: '27065' },
        { sl: 5, subject: 'Engine Overhauling, Inspection & Testing', code: '27161' },
        { sl: 6, subject: 'Environmental Studies', code: '29041' }
      ],
      '7th Semester': [
        { sl: 1, subject: 'Principles of Marketing', code: '25851' },
        { sl: 2, subject: 'Innovation & Entrepreneurship', code: '25853' },
        { sl: 3, subject: 'Design of Machine Elements', code: '27071' },
        { sl: 4, subject: 'Heat Treatment of Metal', code: '27073' },
        { sl: 5, subject: 'Service Station Operation & Estimating', code: '27171' },
        { sl: 6, subject: 'Hybrid & Electric Vehicle', code: '27172' },
        { sl: 7, subject: 'Power Engineering Project', code: '27173' }
      ],
      '8th Semester': [
        { sl: 1, subject: 'Industrial Attachment', code: '27181' },
        { sl: 2, subject: 'Project Presentation', code: '27181' }
      ]
    }
  },

  // ─── ELECTRONICS TECHNOLOGY (Technology Code: 68) ─────────────────────────
  'electronics': {
    deptName: 'Electronics Technology — Technology Code: 68 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl: 1, subject: 'Engineering Drawing', code: '21011' },
        { sl: 2, subject: 'English-I', code: '25712' },
        { sl: 3, subject: 'Mathematics-I', code: '25911' },
        { sl: 4, subject: 'Physics-I', code: '25912' },
        { sl: 5, subject: 'Bangla-I', code: '25711' },
        { sl: 6, subject: 'Basic Electricity', code: '26711' },
        { sl: 7, subject: 'Electronics Fundamentals', code: '68111' }
      ],
      '2nd Semester': [
        { sl: 1, subject: 'Bangla-II', code: '25721' },
        { sl: 2, subject: 'English-II', code: '25722' },
        { sl: 3, subject: 'Physical Education & Life Skills Development', code: '25812' },
        { sl: 4, subject: 'Chemistry', code: '25913' },
        { sl: 5, subject: 'Mathematics-II', code: '25921' },
        { sl: 6, subject: 'Electronic Devices & Circuits', code: '68211' },
        { sl: 7, subject: 'Basic Electronics Lab', code: '68212' }
      ],
      '3rd Semester': [
        { sl: 1, subject: 'Social Science', code: '25811' },
        { sl: 2, subject: 'Physics-II', code: '25922' },
        { sl: 3, subject: 'Mathematics-III', code: '25931' },
        { sl: 4, subject: 'Digital Electronics', code: '68311' },
        { sl: 5, subject: 'Electronic Instrumentation', code: '68312' },
        { sl: 6, subject: 'Communication Principles', code: '68313' }
      ],
      '4th Semester': [
        { sl: 1, subject: 'Bangla-III', code: '25731' },
        { sl: 2, subject: 'English-III', code: '25732' },
        { sl: 3, subject: 'Mathematics-IV', code: '25941' },
        { sl: 4, subject: 'Microprocessor & Microcontroller', code: '68411' },
        { sl: 5, subject: 'Linear Integrated Circuits', code: '68412' },
        { sl: 6, subject: 'Electronic Measurement', code: '68413' }
      ],
      '5th Semester': [
        { sl: 1, subject: 'Business Organization & Management', code: '25841' },
        { sl: 2, subject: 'Mathematics-V', code: '25951' },
        { sl: 3, subject: 'Radio & TV Servicing', code: '68511' },
        { sl: 4, subject: 'Mobile Communication Technology', code: '68512' },
        { sl: 5, subject: 'Power Electronics', code: '68513' },
        { sl: 6, subject: 'Medical Electronics', code: '68514' }
      ],
      '6th Semester': [
        { sl: 1, subject: 'Accounting', code: '25851' },
        { sl: 2, subject: 'Satellite Communication', code: '68611' },
        { sl: 3, subject: 'Optical Fiber Communication', code: '68612' },
        { sl: 4, subject: 'Industrial Electronics', code: '68613' },
        { sl: 5, subject: 'Computer Hardware & Maintenance', code: '68614' }
      ],
      '7th Semester': [
        { sl: 1, subject: 'Business Communication', code: '25831' },
        { sl: 2, subject: 'Innovation & Entrepreneurship', code: '25853' },
        { sl: 3, subject: 'VLSI Design', code: '68711' },
        { sl: 4, subject: 'Robotics & Automation', code: '68712' },
        { sl: 5, subject: 'IoT & Embedded Systems', code: '68713' }
      ],
      '8th Semester': [
        { sl: 1, subject: 'Industrial Attachment', code: '68811' },
        { sl: 2, subject: 'Project Presentation & Defense', code: '68812' }
      ]
    }
  }
};

window.PROBIDHAN_2022_DATA = PROBIDHAN_2022_DATA;

// Interactive function triggered when clicking "View Book List"
function showPublicBookList() {
  const deptVal = document.getElementById('publicBookDeptFilter')?.value;
  const semVal = document.getElementById('publicBookSemFilter')?.value;
  const resultsContainer = document.getElementById('bookResultsContainer');

  if (!resultsContainer) return;

  if (!deptVal || !semVal) {
    resultsContainer.innerHTML = `
      <div style="text-align:center;padding:40px 20px;color:var(--muted, #94a3b8);background:rgba(255,255,255,0.02);border:1px dashed rgba(255,255,255,0.1);border-radius:16px;">
        <i class="fas fa-info-circle" style="font-size:24px;margin-bottom:10px;color:#a78bfa;display:block;"></i>
        <p style="font-size:14px;font-weight:600;margin:0;">Please select both Department and Semester above to view book list.</p>
      </div>`;
    resultsContainer.style.display = 'block';
    return;
  }

  const key = normalizeDept(deptVal);
  const deptData = (PROBIDHAN_2022_DATA && PROBIDHAN_2022_DATA[key]) ? PROBIDHAN_2022_DATA[key] : (PROBIDHAN_2022_DATA ? PROBIDHAN_2022_DATA['computer'] : null);
  
  if (!deptData) {
    resultsContainer.innerHTML = `<div style="text-align:center;padding:40px;color:#ef4444;">Book list database loading... Please refresh.</div>`;
    resultsContainer.style.display = 'block';
    return;
  }

  const books = (deptData.semesters && deptData.semesters[semVal]) || [];

  const totalCount = books.length;

  const summaryHtml = `
    <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12)); border: 1px solid var(--border); border-radius: 16px; padding: 18px 24px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
      <div>
        <div style="font-size: 17px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 10px;">
          <span style="background: rgba(129,140,248,0.2); width: 34px; height: 34px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: var(--accent); font-size: 16px;"><i class="fas fa-graduation-cap"></i></span>
          ${deptData.deptName}
        </div>
        <div style="font-size: 13px; color: var(--muted); margin-top: 6px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="background: rgba(245,158,11,0.15); color: var(--gold); padding: 3px 10px; border-radius: 20px; font-weight: 700; border: 1px solid rgba(245,158,11,0.3); font-size: 12px;"><i class="fas fa-certificate" style="margin-right: 4px;"></i>${deptData.probidhan}</span>
          <span style="color: var(--text); font-weight: 600;"><i class="fas fa-layer-group" style="color: var(--accent2); margin-right: 4px;"></i>${semVal}</span>
        </div>
      </div>
      <span style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; font-size: 13px; font-weight: 800; padding: 6px 16px; border-radius: 20px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3); display: inline-flex; align-items: center; gap: 6px;">
        <i class="fas fa-list-ol"></i> Total ${totalCount} Subjects
      </span>
    </div>
  `;

  let tableRows = '';
  if (books.length > 0) {
    tableRows = books.map(item => `
      <tr style="border-bottom: 1px solid var(--border); transition: background 0.2s;" onmouseover="this.style.background='rgba(99, 102, 241, 0.08)'" onmouseout="this.style.background='transparent'">
        <td style="width: 75px; text-align: center; padding: 14px 16px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; background: rgba(99, 102, 241, 0.15); color: var(--accent); font-weight: 800; font-size: 13px; border: 1px solid var(--border);">${item.sl}</span>
        </td>
        <td style="padding: 14px 20px; font-weight: 600; color: var(--text); font-size: 14px;">${item.subject}</td>
        <td style="width: 150px; text-align: center; padding: 14px 16px;">
          <span style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); color: var(--gold); font-family: monospace; font-size: 13px; font-weight: 800; padding: 5px 12px; border-radius: 8px; display: inline-block; letter-spacing: 0.5px;">${item.code}</span>
        </td>
      </tr>
    `).join('');
  } else {
    tableRows = `
      <tr>
        <td colspan="3" style="text-align: center; color: var(--muted); padding: 40px; font-size: 14px;">
          No subject data found for the selected semester.
        </td>
      </tr>`;
  }

  const tableHtml = `
    <div style="background: var(--card); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: var(--card2); border-bottom: 1.5px solid var(--border);">
            <th style="width: 75px; text-align: center; padding: 16px; font-size: 12px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.8px;">SL</th>
            <th style="padding: 16px 20px; font-size: 12px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.8px;">Subject Name</th>
            <th style="width: 150px; text-align: center; padding: 16px; font-size: 12px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.8px;">Subject Code</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;

  resultsContainer.innerHTML = summaryHtml + tableHtml;
  resultsContainer.style.display = 'block';

  // Smooth scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.showPublicBookList = showPublicBookList;
window.PROBIDHAN_2022_DATA = PROBIDHAN_2022_DATA;
