/**
 * TEACHER DASHBOARD LOGIC
 */

const hostname = window.location.hostname || '127.0.0.1';
const API_BASE = (hostname === 'localhost' || hostname === '127.0.0.1') ? `http://${hostname}:8000/api` : '/api';
const MEDIA_BASE = (hostname === 'localhost' || hostname === '127.0.0.1') ? `http://${hostname}:8000` : '';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and is a teacher
    const userName = localStorage.getItem('user_name') || 'Teacher';
    const userRole = localStorage.getItem('user_role');
    const userPhoto = localStorage.getItem('user_photo');
    
    document.getElementById('topbarUserName').textContent = userName;
    document.getElementById('welcomeText').textContent = `Welcome, ${userName}!`;

    if (userPhoto) {
        document.querySelector('.profile-img').innerHTML = `<img src="${MEDIA_BASE}${userPhoto}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    }
    
    // Set default date to today
    const dateInput = document.getElementById('attDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Load Initial Dashboard Data
    fetchDashboardData();

    // Initialize Drag & Drop for File Upload
    initNoticeDragDrop();
});

function initNoticeDragDrop() {
    const dropZone = document.querySelector('.custom-file-upload');
    const fileInput = document.getElementById('noticeAttachment');

    if (dropZone && fileInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, e => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-active'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-active'), false);
        });

        dropZone.addEventListener('drop', e => {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                fileInput.files = files;
                updateFileName(fileInput);
            }
        }, false);
    }
}

// --- NAVIGATION ---
function showSection(sectionId, event) {
    if (event) event.preventDefault();
    
    // Hide all sections
    const sections = document.querySelectorAll('#contentArea section');
    sections.forEach(s => s.style.display = 'none');
    
    // Also hide injected t-section wrappers
    document.querySelectorAll('[id^="t-section-"]').forEach(el => el.style.display = 'none');
    
    // Show target section
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
    }
    
    // Update active nav link
    const links = document.querySelectorAll('.nav-link');
    links.forEach(l => l.classList.remove('active'));
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        const activeLink = Array.from(links).find(l => l.getAttribute('onclick')?.includes(sectionId));
        if (activeLink) activeLink.classList.add('active');
    }

    // Refresh data depending on section
    if (sectionId === 'dashboard') {
        fetchDashboardData();
    } else if (sectionId === 'profile') {
        fetchProfileData();
    } else if (sectionId === 'student-list') {
        fetchStudents();
    } else if (sectionId === 'teacher-list') {
        fetchTeachers();
    } else if (sectionId === 'notice') {
        fetchAllNotices();
    } else if (sectionId === 'routine') {
        loadRoutineData();
    } else if (sectionId === 'assignment') {
        loadTeacherAssignments();
    } else if (sectionId === 'quiz-create') {
        quizQuestionCount = 0;
        addQuizQuestion();
        loadTeacherQuizzes();
    } else if (sectionId === 'books-manage') {
        loadTeacherBooks(); // shows prompt if no dept/sem selected
    } else if (sectionId === 'cr-manage') {
        loadStudentsForCR();
        loadTeacherCRs();
        setTimeout(updateCRGroupOptions, 50);
    } else if (sectionId === 'msg-inbox') {
        loadTeacherMessages('inbox');
    } else if (sectionId === 'complaint-view') {
        loadTeacherComplaints();
    }
}

// --- LISTING & SEARCH ---
async function fetchStudents() {
    const department = document.getElementById('listDept').value;
    const session = document.getElementById('listSession').value;
    const semester = document.getElementById('listSemester').value;
    
    try {
        const response = await fetch(`${API_BASE}/get-students/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ department, session, semester })
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            const tbody = document.getElementById('fullStudentTableBody');
            tbody.innerHTML = result.data.map(s => `
                <tr onclick="showStudentOverview(${s.id})" style="cursor: pointer;">
                    <td>
                        <div class="profile-img" style="width:32px; height:32px;">
                            ${s.profile_picture ? `<img src="${MEDIA_BASE}${s.profile_picture}?t=${new Date().getTime()}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : `<i class="fas fa-user"></i>`}
                        </div>
                    </td>
                    <td>${s.roll || '--'}</td>
                    <td>${s.name}</td>
                    <td>${s.department || '--'}</td>
                    <td>${s.session || '--'}</td>
                    <td>${s.semester || '--'}</td>
                    <td>
                        <button class="delete-btn" onclick="event.stopPropagation(); deleteStudent(${s.id})" title="Delete Student" style="background: none; border: none; color: #f87171; cursor: pointer;">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        showToast('Error fetching students', 'error');
    }
}

async function showTeacherOverview(email) {
    const modal = document.getElementById('overviewModal');
    const body = document.getElementById('overviewBody');
    const title = document.getElementById('overviewModalTitle');
    
    title.textContent = 'Teacher Overview';
    modal.classList.add('open');
    body.innerHTML = '<div style="text-align:center; padding: 40px;"><div class="loading-spinner"></div><p>Loading details...</p></div>';

    try {
        const response = await fetch(`${API_BASE}/get-teachers/`);
        const result = await response.json();
        const t = result.data.find(item => item.email === email);
        
        if (t) {
            const desig = t.designation || 'Faculty';
            const theme = getDesignationTheme(desig);
            const dc = theme.color;
            
            body.innerHTML = `
                <div class="overview-profile">
                    ${t.profile_picture ? `<img src="${MEDIA_BASE}${t.profile_picture}" style="border: 3px solid ${dc}; box-shadow: 0 0 25px ${theme.glow};">` : `<div class="profile-img" style="width:110px; height:110px; border: 3px solid ${dc}; box-shadow: 0 0 25px ${theme.glow}; background: rgba(0,0,0,0.3);"><i class="fas ${theme.icon}" style="font-size: 48px; color: ${dc};"></i></div>`}
                    <div>
                        <h4 style="color: var(--text); font-size: 26px; margin-bottom: 6px;">${t.name}</h4>
                        ${t.mobile ? `
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                            <span style="font-size: 15px; color: rgba(255,255,255,0.7);">
                                <i class="fas fa-phone" style="margin-right: 5px; color: ${dc};"></i>${formatMobile(t.mobile)}
                            </span>
                            <button onclick="copyContact('${formatMobile(t.mobile)}', 'Mobile')"
                                style="background: ${theme.badgeBg}; border: 1px solid ${theme.border}; color: ${dc}; padding: 3px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; transition: all 0.2s;">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>` : ''}
                        <span style="display: block; font-size: 15px; color: var(--accent2); margin-bottom: 12px;">${t.email}</span>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <div style="display: inline-block; padding: 6px 16px; background: ${theme.badgeBg}; border: 1px solid ${theme.border}; color: ${dc}; border-radius: 20px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 15px ${theme.glow};">
                                <i class="fas ${theme.icon}" style="margin-right: 6px;"></i>${desig}
                            </div>
                            <div style="display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); border-radius: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                <i class="fas fa-chalkboard-teacher" style="margin-right: 5px;"></i>TEACHER
                            </div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 24px; margin-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 800; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.5px;">Professional Details</span>
                </div>

                <div class="overview-details-grid" style="margin-top: 0;">
                    <div class="detail-item">
                        <label style="font-size: 13px;"><i class="fas fa-building" style="margin-right: 5px; color: ${dc};"></i>Department</label>
                        <span class="detail-val" style="font-size: 16px;">${t.department || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label style="font-size: 13px;"><i class="fas fa-door-open" style="margin-right: 5px; color: ${dc};"></i>Office / Room</label>
                        <span class="detail-val" style="font-size: 16px;">${t.room_number || 'N/A'}</span>
                    </div>
                    <div class="detail-item" style="grid-column: span 2;">
                        <label style="font-size: 13px;"><i class="fas fa-graduation-cap" style="margin-right: 5px; color: ${dc};"></i>Qualification</label>
                        <span class="detail-val" style="font-weight: 400; font-size: 15px; color: rgba(255,255,255,0.8); line-height: 1.5;">${t.qualification || 'Information not provided'}</span>
                    </div>
                    <div class="detail-item" style="grid-column: span 2;">
                        <label style="font-size: 13px;"><i class="fas fa-star" style="margin-right: 5px; color: ${dc};"></i>Specialized Subjects</label>
                        <span class="detail-val" style="font-weight: 400; font-size: 15px; color: rgba(255,255,255,0.8); line-height: 1.5;">${t.specialized_subjects || 'Information not provided'}</span>
                    </div>
                    <div class="detail-item" style="grid-column: span 2;">
                        <label style="font-size: 13px;"><i class="fas fa-users-class" style="margin-right: 5px; color: ${dc};"></i>Taking Classes / Batches</label>
                        <span class="detail-val" style="font-weight: 400; font-size: 15px; color: rgba(255,255,255,0.8); line-height: 1.5;">${t.assigned_classes || 'Information not provided'}</span>
                    </div>
                    <div class="detail-item" style="grid-column: span 2;">
                        <label style="font-size: 13px;"><i class="fas fa-calendar-alt" style="margin-right: 5px; color: ${dc};"></i>Current Schedule (Routine)</label>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                            ${t.subjects && t.subjects.length > 0 ? 
                                t.subjects.map(s => `<span style="padding: 6px 16px; font-size: 13px; background: ${theme.badgeBg}; color: ${dc}; border: 1px solid ${theme.border}; border-radius: 20px; font-weight: 700;">${s}</span>`).join('') : 
                                '<span class="detail-val" style="font-size: 15px; opacity: 0.5;">No active routine found</span>'}
                        </div>
                    </div>
                </div>

                <div style="margin-top: 30px; text-align: center; border-top: 1px solid var(--border); padding-top: 20px;">
                    <button class="btn-login" style="width: 100%; border-radius: 12px; margin-bottom: 0; background: linear-gradient(135deg, ${dc}, #00d4ff); border: none; font-weight: 700; color: #000; box-shadow: 0 4px 20px ${theme.glow}; cursor: pointer;" onclick="closeOverviewModal()">Close Details</button>
                </div>
            `;
        }
    } catch (err) {
        body.innerHTML = '<p style="color: #ef4444; text-align:center;">Failed to load teacher details.</p>';
    }
}

async function showStudentOverview(studentId) {
    const modal = document.getElementById('overviewModal');
    const body = document.getElementById('overviewBody');
    const title = document.getElementById('overviewModalTitle');
    
    title.textContent = 'Student Overview';
    modal.classList.add('open');
    body.innerHTML = '<div style="text-align:center; padding: 40px;"><div class="loading-spinner"></div><p>Loading student details...</p></div>';

    try {
        // Fetch basic info
        const resInfo = await fetch(`${API_BASE}/search-users/?q=${studentId}`);
        const resultInfo = await resInfo.json();
        const s = resultInfo.data.find(item => item.id == studentId);
        
        // Fetch attendance stats
        const resStats = await fetch(`${API_BASE}/get-student-stats/?student_id=${studentId}`);
        const resultStats = await resStats.json();
        const stats = resultStats.data;
        
        if (s && stats) {
            const perfClass = stats.performance === 'Verry Good' ? 'perf-very-good' : 
                               stats.performance === 'Good' ? 'perf-medium' : 
                               stats.performance === 'Normal' ? 'perf-normal' : 'perf-bad';
            
            body.innerHTML = `
                <div class="overview-profile">
                    ${s.profile_picture ? `<img src="${MEDIA_BASE}${s.profile_picture}?t=${new Date().getTime()}">` : `<div class="profile-img" style="width:100px; height:100px;"><i class="fas fa-user" style="font-size: 40px;"></i></div>`}
                    <div>
                        <h4 style="color: var(--text);">${s.name}</h4>
                        <span style="display: block; font-size: 13px; color: var(--accent2); margin-bottom: 8px;">${s.email}</span>
                        <div style="display: inline-block; padding: 4px 12px; background: rgba(0, 255, 255, 0.15); border: 1px solid rgba(0, 255, 255, 0.4); color: #00ffff; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);">${s.role}</div>
                    </div>
                </div>

                <div style="margin-top: 25px; margin-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 6px;">
                    <span style="font-size: 10px; font-weight: 800; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 1.5px;">Class Attendance Details</span>
                </div>

                <div class="overview-stats-grid">
                    <div class="stat-box" style="background: rgba(0, 255, 255, 0.1); border: 1px solid rgba(0, 255, 255, 0.4); box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);">
                        <span class="stat-label" style="color: rgba(0, 255, 255, 0.7);">Total</span>
                        <span class="stat-value" style="color: #00ffff; text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);">${stats.total_classes}</span>
                    </div>
                    <div class="stat-box" style="background: rgba(0, 255, 255, 0.1); border: 1px solid rgba(0, 255, 255, 0.4); box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);">
                        <span class="stat-label" style="color: rgba(0, 255, 255, 0.7);">Attend</span>
                        <span class="stat-value" style="color: #00ffff; text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);">${stats.attended_classes}</span>
                    </div>
                    <div class="stat-box" style="background: rgba(0, 255, 255, 0.1); border: 1px solid rgba(0, 255, 255, 0.4); box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);">
                        <span class="stat-label" style="color: rgba(0, 255, 255, 0.7);">Missed</span>
                        <span class="stat-value" style="color: #00ffff; text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);">${stats.missed_classes}</span>
                    </div>
                    <div class="stat-box" style="background: rgba(0, 255, 255, 0.1); border: 1px solid rgba(0, 255, 255, 0.4); box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);">
                        <span class="stat-label" style="color: rgba(0, 255, 255, 0.7);">Rate</span>
                        <span class="stat-value" style="color: #00ffff; text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);">${stats.attendance_rate}</span>
                    </div>
                </div>

                <div class="overall-rating-section">
                    <div class="rating-header">
                        <span class="rating-text">Overall Student Rating:</span>
                        <span class="rating-percent" style="color: var(--modal-accent); text-shadow: 0 0 10px rgba(0, 255, 255, 0.4);">${stats.attendance_rate}</span>
                    </div>
                    <div class="rating-bar-container">
                        <div class="rating-bar" style="width: ${stats.attendance_rate}; background: linear-gradient(90deg, #ff007f, #7928ca, #00d4ff, #00ff88); background-size: 200% 200%; box-shadow: 0 0 15px rgba(0, 212, 255, 0.6);"></div>
                    </div>
                </div>

                <div class="overview-details-grid" style="margin-top: 25px;">
                    <div class="detail-item">
                        <label>Roll Number</label>
                        <span class="detail-val">${s.roll || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Session</label>
                        <span class="detail-val">${s.session || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Semester</label>
                        <span class="detail-val">${s.semester || 'N/A'}</span>
                    </div>
                    <div class="detail-item" style="grid-column: span 2;">
                        <label>Academic Performance</label>
                        <div class="perf-wrapper">
                            <span class="perf-badge-premium ${perfClass}">${stats.performance}</span>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 30px; text-align: center; border-top: 1px solid var(--border); padding-top: 20px;">
                    <button class="btn-login" style="width: 100%; border-radius: 12px; margin-bottom: 0; background: linear-gradient(135deg, #00ffff, #00d4ff); border: none; font-weight: 700; color: #000; box-shadow: 0 4px 20px rgba(0, 255, 255, 0.45); cursor: pointer;" onclick="closeOverviewModal()">Close Details</button>
                </div>
            `;
        }
    } catch (err) {
        body.innerHTML = '<p style="color: #ef4444; text-align:center;">Failed to load student details.</p>';
    }
}

function closeOverviewModal() {
    document.getElementById('overviewModal').classList.remove('open');
}

let rollSearchTimeout;
function handleRollSearch(event) {
    const query = event.target.value.trim();
    const suggestions = document.getElementById('rollSuggestions');
    
    // Always perform instant local filtering
    filterListByRoll();

    if (query.length < 1) {
        suggestions.style.display = 'none';
        suggestions.innerHTML = '';
        return;
    }

    clearTimeout(rollSearchTimeout);
    rollSearchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${API_BASE}/search-users/?q=${encodeURIComponent(query)}`);
            const result = await response.json();
            
            if (result.status === 'success') {
                // We only want students who match the roll
                const studentMatches = result.data.filter(item => item.role === 'student');

                if (studentMatches.length > 0) {
                    suggestions.innerHTML = studentMatches.map(s => `
                        <div class="suggestion-item" onclick="selectRollSuggestion('${s.roll}', ${s.id})">
                             <div class="profile-img" style="width:24px; height:24px; font-size:12px;">
                                ${s.profile_picture ? `<img src="${MEDIA_BASE}${s.profile_picture}" style="border-radius:50%;">` : `<i class="fas fa-user"></i>`}
                            </div>
                            <div class="s-info">
                                <span class="s-name" style="font-size: 13px;">${s.name}</span>
                                <span class="s-meta">Roll No: ${s.roll}</span>
                            </div>
                        </div>
                    `).join('');
                    suggestions.style.display = 'block';
                } else {
                    suggestions.style.display = 'none';
                }
            }
        } catch (err) {
            console.error('Roll search error:', err);
        }
    }, 250);
}

function selectRollSuggestion(roll, id) {
    const input = document.getElementById('rollSearchInput');
    input.value = roll;
    document.getElementById('rollSuggestions').style.display = 'none';
    filterListByRoll();
    showStudentOverview(id);
}

function filterListByRoll() {
    const input = document.getElementById('rollSearchInput');
    const filter = input.value.toUpperCase();
    const tbody = document.getElementById('fullStudentTableBody');
    const rows = tbody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const td = rows[i].getElementsByTagName('td')[1]; // Roll column (Index 1)
        if (td) {
            const txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    }
}

let allTeachersData = []; // Store globally for filtering

async function fetchTeachers() {
    try {
        const response = await fetch(`${API_BASE}/get-teachers/`);
        const result = await response.json();
        
        if (result.status === 'success') {
            allTeachersData = result.data;
            renderTeacherGrid(allTeachersData);
        }
    } catch (err) {
        showToast('Error fetching teachers', 'error');
    }
}

function formatMobile(mobile) {
    if (!mobile) return null;
    let m = mobile.trim();
    // Remove leading + if present
    if (m.startsWith('+')) return m; // already has country code
    // Remove leading 880 (without +)
    if (m.startsWith('880') && m.length > 10) return '+' + m;
    // Remove leading 0 and add +880
    if (m.startsWith('0')) return '+880' + m.slice(1);
    return '+880' + m;
}

function getDesignationTheme(desig) {
    const themes = {
        'Principal': {
            color: '#ffd700',
            bg: 'linear-gradient(145deg, rgba(255, 215, 0, 0.12), rgba(255, 159, 67, 0.05))',
            border: 'rgba(255, 215, 0, 0.45)',
            glow: 'rgba(255, 215, 0, 0.35)',
            badgeBg: 'rgba(255, 215, 0, 0.2)',
            badgeBorder: 'rgba(255, 215, 0, 0.5)',
            icon: 'fa-crown'
        },
        'Vice Principal': {
            color: '#e056fd',
            bg: 'linear-gradient(145deg, rgba(224, 86, 253, 0.12), rgba(192, 132, 252, 0.05))',
            border: 'rgba(224, 86, 253, 0.45)',
            glow: 'rgba(224, 86, 253, 0.35)',
            badgeBg: 'rgba(224, 86, 253, 0.2)',
            badgeBorder: 'rgba(224, 86, 253, 0.5)',
            icon: 'fa-award'
        },
        'Head of Department': {
            color: '#00e676',
            bg: 'linear-gradient(145deg, rgba(0, 230, 118, 0.12), rgba(16, 185, 129, 0.05))',
            border: 'rgba(0, 230, 118, 0.45)',
            glow: 'rgba(0, 230, 118, 0.35)',
            badgeBg: 'rgba(0, 230, 118, 0.2)',
            badgeBorder: 'rgba(0, 230, 118, 0.5)',
            icon: 'fa-user-shield'
        },
        'Professor': {
            color: '#00d4ff',
            bg: 'linear-gradient(145deg, rgba(0, 212, 255, 0.12), rgba(59, 130, 246, 0.05))',
            border: 'rgba(0, 212, 255, 0.45)',
            glow: 'rgba(0, 212, 255, 0.35)',
            badgeBg: 'rgba(0, 212, 255, 0.2)',
            badgeBorder: 'rgba(0, 212, 255, 0.5)',
            icon: 'fa-user-graduate'
        },
        'Associate Professor': {
            color: '#38bdf8',
            bg: 'linear-gradient(145deg, rgba(56, 189, 248, 0.12), rgba(14, 165, 233, 0.05))',
            border: 'rgba(56, 189, 248, 0.45)',
            glow: 'rgba(56, 189, 248, 0.35)',
            badgeBg: 'rgba(56, 189, 248, 0.2)',
            badgeBorder: 'rgba(56, 189, 248, 0.5)',
            icon: 'fa-book-reader'
        },
        'Assistant Professor': {
            color: '#f97316',
            bg: 'linear-gradient(145deg, rgba(249, 115, 22, 0.12), rgba(251, 191, 36, 0.05))',
            border: 'rgba(249, 115, 22, 0.45)',
            glow: 'rgba(249, 115, 22, 0.35)',
            badgeBg: 'rgba(249, 115, 22, 0.2)',
            badgeBorder: 'rgba(249, 115, 22, 0.5)',
            icon: 'fa-chalkboard-teacher'
        },
        'Senior Instructor': {
            color: '#ff2a85',
            bg: 'linear-gradient(145deg, rgba(255, 42, 133, 0.12), rgba(244, 63, 94, 0.05))',
            border: 'rgba(255, 42, 133, 0.45)',
            glow: 'rgba(255, 42, 133, 0.35)',
            badgeBg: 'rgba(255, 42, 133, 0.2)',
            badgeBorder: 'rgba(255, 42, 133, 0.5)',
            icon: 'fa-star'
        },
        'Instructor': {
            color: '#a3e635',
            bg: 'linear-gradient(145deg, rgba(163, 230, 53, 0.12), rgba(132, 204, 22, 0.05))',
            border: 'rgba(163, 230, 53, 0.45)',
            glow: 'rgba(163, 230, 53, 0.35)',
            badgeBg: 'rgba(163, 230, 53, 0.2)',
            badgeBorder: 'rgba(163, 230, 53, 0.5)',
            icon: 'fa-laptop-code'
        },
        'Junior Instructor': {
            color: '#818cf8',
            bg: 'linear-gradient(145deg, rgba(129, 140, 248, 0.12), rgba(99, 102, 241, 0.05))',
            border: 'rgba(129, 140, 248, 0.45)',
            glow: 'rgba(129, 140, 248, 0.35)',
            badgeBg: 'rgba(129, 140, 248, 0.2)',
            badgeBorder: 'rgba(129, 140, 248, 0.5)',
            icon: 'fa-user-astronaut'
        }
    };

    return themes[desig] || {
        color: '#00f0ff',
        bg: 'linear-gradient(145deg, rgba(0, 240, 255, 0.1), rgba(108, 143, 255, 0.05))',
        border: 'rgba(0, 240, 255, 0.35)',
        glow: 'rgba(0, 240, 255, 0.25)',
        badgeBg: 'rgba(0, 240, 255, 0.2)',
        badgeBorder: 'rgba(0, 240, 255, 0.5)',
        icon: 'fa-chalkboard-teacher'
    };
}

function renderTeacherGrid(teachers) {
    const grid = document.getElementById('teacherGrid');
    const badge = document.getElementById('teacherCountBadge');
    const noResult = document.getElementById('teacherNoResult');

    if (badge) badge.textContent = `${teachers.length} Faculty Member${teachers.length !== 1 ? 's' : ''}`;

    if (teachers.length === 0) {
        grid.innerHTML = '';
        if (noResult) noResult.style.display = 'block';
        return;
    }
    if (noResult) noResult.style.display = 'none';

    grid.innerHTML = teachers.map(t => {
        const desig = t.designation || 'Faculty';
        const theme = getDesignationTheme(desig);
        const dc = theme.color;
        const formattedMobile = formatMobile(t.mobile);
        return `
        <div class="teacher-card-item" onclick="showTeacherOverview('${t.email}')" style="background: ${theme.bg}; border: 1px solid ${theme.border}; box-shadow: 0 8px 25px ${theme.glow};">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: ${dc}; border-top-left-radius: 20px; border-top-right-radius: 20px;"></div>
            <div style="position: relative; display: inline-block; margin-bottom: 14px;">
                ${t.profile_picture 
                    ? `<img src="${MEDIA_BASE}${t.profile_picture}" style="border: 3px solid ${dc}; box-shadow: 0 0 20px ${theme.glow};">` 
                    : `<div class="profile-img" style="width:86px; height:86px; margin: 0 auto; border: 3px solid ${dc}; box-shadow: 0 0 20px ${theme.glow}; background: rgba(0,0,0,0.3);"><i class="fas ${theme.icon}" style="font-size: 36px; color: ${dc};"></i></div>`}
            </div>
            <span class="t-name" style="font-size: 16px; font-weight: 700;">${t.name}</span>
            <span class="t-desig" style="background: ${theme.badgeBg}; border: 1px solid ${theme.badgeBorder}; color: ${dc}; box-shadow: 0 0 10px ${theme.glow}; padding: 5px 14px; font-size: 11px;">
                <i class="fas ${theme.icon}" style="margin-right: 5px;"></i>${desig}
            </span>
            <span class="t-dept" style="color: rgba(255,255,255,0.7); font-weight: 500;">${t.department || 'General Department'}</span>
            
            ${t.subjects && t.subjects.length > 0 ? `
                <div style="margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;">
                    <span style="font-size: 10px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.5px;">Teaches:</span>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; justify-content: center;">
                        ${t.subjects.map(sub => `<span style="background: ${theme.badgeBg}; color: ${dc}; border: 1px solid ${theme.border}; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 600;">${sub}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            ${t.specialized_subjects ? `
                <div style="margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;">
                    <span style="font-size: 10px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.5px;">Specialized:</span>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; justify-content: center;">
                        ${t.specialized_subjects.split(',').map(s => s.trim()).filter(s => s).map(sub => `<span style="background: ${theme.badgeBg}; color: ${dc}; border: 1px solid ${theme.border}; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 600;">${sub}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Contact Info with Copy -->
            <div style="margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px; display: flex; flex-direction: column; gap: 7px;">
                ${formattedMobile ? `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 6px 10px;"
                     onclick="event.stopPropagation()">
                    <span style="font-size: 11px; color: rgba(255,255,255,0.7); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
                        <i class="fas fa-phone" style="margin-right: 5px; color: ${dc};"></i>${formattedMobile}
                    </span>
                    <button onclick="copyContact('${formattedMobile}', 'Mobile')" title="Copy Mobile"
                        style="background: ${theme.badgeBg}; border: 1px solid ${theme.border}; color: ${dc}; padding: 3px 8px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 700; white-space: nowrap; transition: all 0.2s;">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                ` : ''}
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 6px 10px;"
                     onclick="event.stopPropagation()">
                    <span style="font-size: 11px; color: rgba(255,255,255,0.7); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
                        <i class="fas fa-envelope" style="margin-right: 5px; color: ${dc};"></i>${t.email}
                    </span>
                    <button onclick="copyContact('${t.email}', 'Email')" title="Copy Email"
                        style="background: ${theme.badgeBg}; border: 1px solid ${theme.border}; color: ${dc}; padding: 3px 8px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 700; white-space: nowrap; transition: all 0.2s;">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function filterTeachers() {
    const nameQuery = document.getElementById('teacherSearchInput').value.trim().toLowerCase();
    const desigQuery = document.getElementById('teacherDesigFilter').value.trim().toLowerCase();

    let filtered = allTeachersData;

    if (nameQuery) {
        filtered = filtered.filter(t => t.name.toLowerCase().includes(nameQuery));
    }
    if (desigQuery) {
        filtered = filtered.filter(t => (t.designation || '').toLowerCase() === desigQuery);
    }

    renderTeacherGrid(filtered);
}

function resetTeacherFilters() {
    document.getElementById('teacherSearchInput').value = '';
    document.getElementById('teacherDesigFilter').value = '';
    renderTeacherGrid(allTeachersData);
}

function copyContact(value, type) {
    navigator.clipboard.writeText(value).then(() => {
        showToast(`${type} copied: ${value}`, 'success');
    }).catch(() => {
        showToast('Could not copy to clipboard', 'error');
    });
}


// --- STUDENT MANAGEMENT ---
function showAddStudentModal() {
    document.getElementById('addStudentModal').classList.add('open');
}

function closeAddStudentModal() {
    document.getElementById('addStudentModal').classList.remove('open');
    document.getElementById('addStudentForm').reset();
}

async function registerStudentByTeacher(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Creating account...';

    const payload = {
        role: 'student',
        first_name: document.getElementById('addFirstName').value,
        last_name: document.getElementById('addLastName').value,
        roll: document.getElementById('addRoll').value,
        mobile: document.getElementById('addMobile').value,
        email: document.getElementById('addEmail').value,
        department: document.getElementById('addDept').value,
        session: document.getElementById('addSession').value,
        semester: document.getElementById('addSemester').value,
        gender: document.getElementById('addGender').value,
        password: 'student123' // Default password for teacher-created accounts
    };

    try {
        const response = await fetch(`${API_BASE}/register-student-by-teacher/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.status === 'success') {
            showToast('Student registered successfully!', 'success');
            closeAddStudentModal();
            fetchStudents(); // Refresh list
            fetchDashboardData(); // Refresh total count
        } else {
            showToast(result.message || 'Error creating account', 'error');
        }
    } catch (err) {
        showToast('Network error occurred', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Create Student Account';
    }
}

async function deleteStudent(studentId) {
    const modal = document.getElementById('deleteConfirmModal');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    // Open custom modal
    modal.classList.add('open');
    
    // Prepare the confirm action
    confirmBtn.onclick = async () => {
        closeDeleteModal();
        try {
            const response = await fetch(`${API_BASE}/delete-student/${studentId}/`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.status === 'success') {
                showToast('Student deleted successfully!', 'success');
                fetchStudents(); // Refresh list
                fetchDashboardData(); // Refresh dashboard count
            } else {
                showToast(result.message || 'Error deleting student', 'error');
            }
        } catch (err) {
            showToast('Network error occurred', 'error');
        }
    };
}

function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').classList.remove('open');
}

let searchTimeout;
function handleGlobalSearch(event) {
    const query = event.target.value.trim();
    const suggestions = document.getElementById('searchSuggestions');
    
    if (query.length < 2) {
        suggestions.style.display = 'none';
        return;
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${API_BASE}/search-users/?q=${encodeURIComponent(query)}`);
            const result = await response.json();
            
            if (result.status === 'success' && result.data.length > 0) {
                suggestions.innerHTML = result.data.map(item => `
                    <div class="suggestion-item" onclick="viewSearchResult(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                        ${item.profile_picture ? `<img src="${MEDIA_BASE}${item.profile_picture}">` : `<i class="fas fa-user"></i>`}
                        <div class="s-info">
                            <span class="s-name">${item.name}</span>
                            <span class="s-meta">${item.role === 'student' ? `Roll: ${item.roll}` : `Faculty Member`}</span>
                        </div>
                    </div>
                `).join('');
                suggestions.style.display = 'block';
            } else {
                suggestions.style.display = 'none';
            }
        } catch (err) {
            console.error('Search error:', err);
        }
    }, 300);
}

function viewSearchResult(item) {
    document.getElementById('searchSuggestions').style.display = 'none';
    document.getElementById('mainSearchInput').value = item.name;
    
    // For now, if student, show student list and highlight? 
    // Simplified: show toast with info
    showToast(`Found: ${item.name} (${item.role})`);
}

// Close suggestions on click outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        document.getElementById('searchSuggestions').style.display = 'none';
    }
});

// --- PROFILE DATA ---
async function fetchProfileData() {
    const email = localStorage.getItem('user_email');
    if (!email) return;

    try {
        const response = await fetch(`${API_BASE}/get-profile/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const result = await response.json();

        if (result.status === 'success') {
            const data = result.data;
            document.getElementById('profFirstName').value = data.first_name;
            document.getElementById('profLastName').value = data.last_name;
            document.getElementById('profEmail').value = data.email;
            document.getElementById('profMobile').value = data.mobile;
            document.getElementById('profRoom').value = data.room_number || '';
            document.getElementById('profQual').value = data.qualification || '';
            document.getElementById('profSpecializedSubjects').value = data.specialized_subjects || '';
            document.getElementById('profAssignedClasses').value = data.assigned_classes || '';
            // Prefill designation dropdown
            const desigSelect = document.getElementById('profDesignation');
            if (desigSelect && data.designation) desigSelect.value = data.designation;

            if (data.profile_picture) {
                const preview = document.getElementById('profilePreview');
                preview.src = `${MEDIA_BASE}${data.profile_picture}`;
                preview.style.display = 'block';
                document.getElementById('profilePlaceholder').style.display = 'none';
                
                // Also update topbar
                document.querySelector('.profile-img').innerHTML = `<img src="${MEDIA_BASE}${data.profile_picture}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            }
        }
    } catch (err) {
        console.error('Error fetching profile:', err);
    }
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('profilePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
            document.getElementById('profilePlaceholder').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

async function updateProfile() {
    const currentEmail = localStorage.getItem('user_email');
    const formData = new FormData();
    formData.append('current_email', currentEmail);
    formData.append('first_name', document.getElementById('profFirstName').value);
    formData.append('last_name', document.getElementById('profLastName').value);
    formData.append('email', document.getElementById('profEmail').value);
    formData.append('mobile', document.getElementById('profMobile').value);
    formData.append('room_number', document.getElementById('profRoom').value);
    formData.append('qualification', document.getElementById('profQual').value);
    formData.append('specialized_subjects', document.getElementById('profSpecializedSubjects').value);
    formData.append('assigned_classes', document.getElementById('profAssignedClasses').value);
    formData.append('designation', document.getElementById('profDesignation').value);

    const fileInput = document.getElementById('profileUpload');
    if (fileInput.files[0]) {
        formData.append('profile_picture', fileInput.files[0]);
    }

    try {
        const response = await fetch(`${API_BASE}/update-profile/`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === 'success') {
            showToast('Profile updated successfully!');
            // Update local storage if email/name changed
            localStorage.setItem('user_email', result.data.email);
            localStorage.setItem('user_name', result.data.first_name + ' ' + result.data.last_name);
            
            // Sync UI
            document.getElementById('topbarUserName').textContent = localStorage.getItem('user_name');
            if (result.data.profile_picture) {
                document.querySelector('.profile-img').innerHTML = `<img src="${MEDIA_BASE}${result.data.profile_picture}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            }
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('Error updating profile', 'error');
    }
}

async function changePassword() {
    const email = localStorage.getItem('user_email');
    const curr = document.getElementById('currPass').value;
    const nPass = document.getElementById('newPass').value;
    const cPass = document.getElementById('confPass').value;

    if (!curr || !nPass || !cPass) {
        showToast('Please fill all password fields', 'error');
        return;
    }
    if (nPass !== cPass) {
        showToast('New passwords do not match!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/change-password/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, current_password: curr, new_password: nPass })
        });
        const result = await response.json();

        if (result.status === 'success') {
            showToast('Password changed successfully!');
            document.getElementById('currPass').value = '';
            document.getElementById('newPass').value = '';
            document.getElementById('confPass').value = '';
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('Error changing password', 'error');
    }
}

let globalNotices = [];

// --- DASHBOARD DATA ---
async function fetchDashboardData() {
    try {
        const response = await fetch(`${API_BASE}/teacher-dashboard-data/`);
        const result = await response.json();
        
        if (result.status === 'success') {
            const data = result.data;
            document.getElementById('statTotalStudents').textContent = data.total_students;
            document.getElementById('statTodayAttendance').textContent = data.attendance_today;
            document.getElementById('statClassesToday').textContent = data.classes_today;
            
            globalNotices = data.notices;
            // Render Notices
            renderNotices(data.notices);
            // Render Routine
            renderRoutine(data.routines);
            // Update Notification Bell
            updateNotificationBell(data.notices);
        }
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
    }
}

function updateNotificationBell(notices) {
    const lastViewedId = parseInt(localStorage.getItem('lastViewedNoticeId') || '0');
    const badge = document.getElementById('notificationBadge');
    const dropdownBody = document.getElementById('notificationDropdownBody');
    
    let unreadCount = 0;
    notices.forEach(n => {
        if (n.id > lastViewedId) unreadCount++;
    });
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
    
    if (notices.length === 0) {
        dropdownBody.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--muted); font-size: 13px;">No new notifications</div>';
    } else {
        dropdownBody.innerHTML = notices.map(n => `
            <div class="notification-item">
                <h5>${n.title}</h5>
                <p title="${n.content}">${n.content}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 10px; color: rgba(255,255,255,0.4);">${n.date}</span>
                    <button class="read-more-btn" onclick="openNoticeFromNotification(${n.id})">Read More</button>
                </div>
            </div>
        `).join('');
    }
}

function renderNotices(notices) {
    const container = document.getElementById('dashboardNotices');
    if (notices.length === 0) {
        container.innerHTML = '<p class="subtitle">No recent notices.</p>';
        return;
    }
    
    container.innerHTML = notices.map(n => `
        <div class="notice-item" style="cursor: pointer;" onclick="openNoticeFromNotification(${n.id})">
            <h4>${n.title}</h4>
            <p>${n.content}</p>
            <span class="notice-date">${n.date}</span>
        </div>
    `).join('');
}

function renderRoutine(routines) {
    const container = document.getElementById('dashboardRoutine');
    if (routines.length === 0) {
        container.innerHTML = '<p class="subtitle">No classes scheduled for today.</p>';
        return;
    }
    
    container.innerHTML = routines.map(r => `
        <div class="routine-item">
            <div class="routine-time">${r.time}</div>
            <div class="routine-info">
                <h4>${r.subject}</h4>
                <span>Room: ${r.room} • Semester: ${r.semester || '--'}</span>
            </div>
        </div>
    `).join('');
}

// --- ATTENDANCE SYSTEM ---
let currentStudents = [];

async function loadStudents() {
    const department = document.getElementById('attDepartment').value;
    const semester = document.getElementById('attSemester').value;
    const session = document.getElementById('attSession').value;
    const subject = document.getElementById('attSubject').value;
    const subjectCode = document.getElementById('attSubjectCode').value || '';
    const date = document.getElementById('attDate').value;
    
    if (!department || !semester || !session || !subject || !date) {
        showToast('Please select Department, Semester, Session, Subject, and Date', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/get-students-for-attendance/`, {
            method: 'POST',
            body: JSON.stringify({ department, semester, session, subject, subject_code: subjectCode, date }),
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            currentStudents = result.data;
            renderStudentTable(currentStudents);
            document.getElementById('attendanceStep2').style.display = 'block';
            showToast(`Loaded ${currentStudents.length} students`);
        }
    } catch (err) {
        showToast('Error loading students', 'error');
    }
}

function renderStudentTable(students) {
    // Clear marks on new load
    for(const key in attendanceMarks) delete attendanceMarks[key];

    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = students.map(s => {
        const isActiveP = s.status === 'P' ? 'active' : '';
        const isActiveA = s.status === 'A' ? 'active' : '';
        const isActiveL = s.status === 'L' ? 'active' : '';
        
        if(s.status) {
            attendanceMarks[s.id] = s.status;
        }

        return `
            <tr data-id="${s.id}">
                <td>${s.roll || '--'}</td>
                <td>${s.first_name} ${s.last_name}</td>
                <td>
                    <div class="attendance-options">
                        <div class="attendance-opt p ${isActiveP}" onclick="markStudent(${s.id}, 'P', this)">P</div>
                        <div class="attendance-opt a ${isActiveA}" onclick="markStudent(${s.id}, 'A', this)">A</div>
                        <div class="attendance-opt l ${isActiveL}" onclick="markStudent(${s.id}, 'L', this)">L</div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

const attendanceMarks = {}; // Stores {student_id: status}

function markStudent(id, status, el) {
    // Clear siblings
    const parent = el.parentElement;
    parent.querySelectorAll('.attendance-opt').forEach(opt => opt.classList.remove('active'));
    
    // Set active
    el.classList.add('active');
    attendanceMarks[id] = status;
}

function markAll(status) {
    currentStudents.forEach(s => {
        const row = document.querySelector(`tr[data-id="${s.id}"]`);
        if (row) {
            const opt = row.querySelector(`.attendance-opt.${status.toLowerCase()}`);
            if (opt) markStudent(s.id, status, opt);
        }
    });
}

async function saveAttendance() {
    const semester = document.getElementById('attSemester').value;
    const session = document.getElementById('attSession').value;
    const subject = document.getElementById('attSubject').value;
    const subjectCode = document.getElementById('attSubjectCode').value || '';
    const date = document.getElementById('attDate').value;
    
    const marks = [];
    currentStudents.forEach(s => {
        marks.push({
            student_id: s.id,
            status: attendanceMarks[s.id] || 'A' // Default Absent if not marked
        });
    });

    try {
        const response = await fetch(`${API_BASE}/save-attendance/`, {
            method: 'POST',
            body: JSON.stringify({
                semester, session, subject, 
                subject_code: subjectCode,
                date,
                attendance: marks
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            showToast('Attendance saved successfully!');
            // Reset the form fields
            document.getElementById('attSemester').value = '';
            document.getElementById('attSession').value = '';
            document.getElementById('attDepartment').value = '';
            document.getElementById('attSubject').value = '';
            document.getElementById('attSubjectCode').value = '';
            
            // Hide the student table
            document.getElementById('attendanceStep2').style.display = 'none';
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('Error saving attendance', 'error');
    }
}

// --- UTILS ---
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.background = type === 'error' ? '#ef4444' : '#1e2333';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function logout() {
    localStorage.clear();
    window.location.href = 'loginpage1.html';
}

// --- MONTHLY REPORT ---
async function openMonthlyReport() {
    const department = document.getElementById('attDepartment').value;
    const semester = document.getElementById('attSemester').value;
    const session = document.getElementById('attSession').value;
    const subject = document.getElementById('attSubject').value;
    const date = document.getElementById('attDate').value;

    if (!department || !semester || !session || !date) {
        showToast('Please select Department, Semester, Session, and Date for the report range.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/get-monthly-report/`, {
            method: 'POST',
            body: JSON.stringify({ department, semester, session, subject, date }),
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();

        if (result.status === 'success') {
            const printWindow = window.open('', '_blank');
            const data = result.data;
            const monthLabel = result.month; // e.g., 2026-04

            const dateParts = date.split('-');
            const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

            let html = `
                <html>
                <head>
                    <title>Monthly Attendance Report - ${monthLabel}</title>
                    <style>
                        body { font-family: 'Inter', 'Arial', sans-serif; padding: 40px; color: #1e293b; background: white; }
                        h1 { text-align: center; color: #0f172a; margin-bottom: 5px; font-size: 28px; }
                        .info-header { text-align: center; margin-bottom: 30px; font-size: 14px; color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
                        .info-header strong { color: #0f172a; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                        th, td { border: 1px solid #e2e8f0; padding: 14px 16px; text-align: left; }
                        th { background-color: #f8fafc; color: #334155; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
                        td { font-size: 14px; color: #334155; }
                        tr:nth-child(even) { background-color: #f8fafc; }
                        .rate-good { color: #059669; font-weight: 700; background: #d1fae5; padding: 4px 8px; border-radius: 6px; display: inline-block; }
                        .rate-bad { color: #dc2626; font-weight: 700; background: #fee2e2; padding: 4px 8px; border-radius: 6px; display: inline-block; }
                        .print-btn { padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3); }
                        .print-btn:hover { background: #2563eb; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; padding: 0; }
                            .print-btn { display: none; }
                            table { box-shadow: none; border: 1px solid #cbd5e1; }
                        }
                    </style>
                </head>
                <body>
                    <div style="text-align: right; margin-bottom: 20px;">
                        <button class="print-btn" onclick="window.print()">Print Official Report</button>
                    </div>
                    <h1>Student Attendance Report</h1>
                    <div class="info-header">
                        <strong>Date:</strong> ${formattedDate} &nbsp;|&nbsp; <strong>Department:</strong> ${department} <br><br>
                        <strong>Semester:</strong> ${semester} &nbsp;|&nbsp; <strong>Session:</strong> ${session} &nbsp;|&nbsp; <strong>Subject:</strong> ${subject || 'All Subjects'}
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 15%">College Roll</th>
                                <th style="width: 30%">Student Name</th>
                                <th style="width: 12%">Total</th>
                                <th style="width: 12%">Present</th>
                                <th style="width: 10%">Late</th>
                                <th style="width: 10%">Missed</th>
                                <th style="width: 11%">Status</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            if (data.length === 0) {
                html += `<tr><td colspan="7" style="text-align: center; color: #94a3b8; font-style: italic; padding: 30px;">No attendance records found for this specific month and criteria.</td></tr>`;
            } else {
                data.forEach(s => {
                    const rateVal = parseFloat(s.rate);
                    const rateClass = rateVal >= 60 ? 'rate-good' : 'rate-bad';
                    html += `
                        <tr>
                            <td><strong>${s.roll || '--'}</strong></td>
                            <td>${s.name}</td>
                            <td>${s.total}</td>
                            <td><span style="color: #059669; font-weight: 500;">${s.present}</span></td>
                            <td>${s.late > 0 ? `<span style="color: #ea580c; font-weight: 600;">${s.late}</span>` : '0'}</td>
                            <td><span style="color: #dc2626; font-weight: 500;">${s.absent}</span></td>
                            <td><span class="${rateClass}">${s.rate}</span></td>
                        </tr>
                    `;
                });
            }

            html += `
                        </tbody>
                    </table>
                    <div style="margin-top: 50px; display: flex; justify-content: space-between; color: #64748b; font-size: 13px;">
                        <div>
                            ____________________________<br><br>
                            Teacher Signature
                        </div>
                        <div>
                            ____________________________<br><br>
                            Head of Department
                        </div>
                    </div>
                </body>
                </html>
            `;
            
            printWindow.document.write(html);
            printWindow.document.close();
            // Automatically prompt print dialog after half a sec so styles load
            setTimeout(() => { printWindow.print(); }, 500);
        } else {
            showToast(result.message || 'Error generating report', 'error');
        }
    } catch (err) {
        showToast('Network error while generating report', 'error');
    }
}

// --- NOTICE & NOTIFICATIONS SYSTEM ---

// Toggle the main notification dropdown
function toggleNotificationDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('open');
    
    // If opening, mark all currently fetched notices as "viewed" by updating the latest ID
    if (dropdown.classList.contains('open') && globalNotices.length > 0) {
        const latestId = globalNotices[0].id;
        localStorage.setItem('lastViewedNoticeId', latestId);
        // Hide badge but don't rebuild dropdown menu yet so they can still click "Read More"
        const badge = document.getElementById('notificationBadge');
        if (badge) badge.style.display = 'none';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const btn = document.querySelector('.notification-btn');
    const dropdown = document.getElementById('notificationDropdown');
    if (btn && dropdown && !btn.contains(e.target)) {
        dropdown.classList.remove('open');
    }
});

// Click "Read More" from dashboard or notification
function openNoticeFromNotification(id) {
    // 1. Send user to 'notice' section
    showSection('notice');
    // 2. Fetch all notices if not already fetched
    fetchAllNotices().then(() => {
        // Highlight logic could go here
        const el = document.getElementById('notice-card-' + id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.border = '1px solid var(--accent)';
            el.style.boxShadow = '0 0 15px rgba(108, 143, 255, 0.3)';
            setTimeout(() => {
                el.style.border = '1px solid rgba(255,255,255,0.06)';
                el.style.boxShadow = 'none';
            }, 3000);
        }
    });
}

// Fetch all notices for the Notice Portal view
window.allNoticesMap = {};

async function fetchAllNotices() {
    const listContainer = document.getElementById('allNoticesContainer');
    listContainer.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 50px;">Loading notices...</p>';
    try {
        const response = await fetch(`${API_BASE}/get-notices/`);
        const result = await response.json();
        
        if (result.status === 'success') {
            const data = result.data;
            window.allNoticesMap = {};
            data.forEach(n => { window.allNoticesMap[n.id] = n; });

            if (data.length === 0) {
                listContainer.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 50px;">No notices available.</p>';
            } else {
                listContainer.innerHTML = data.map(n => {
                    let attachmentHtml = '';
                    let imagePreviewHtml = '';
                    
                    if (n.attachment) {
                        const fileUrl = `${MEDIA_BASE}${n.attachment}`;
                        const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(n.attachment);
                        
                        if (isImage) {
                            imagePreviewHtml = `<img src="${fileUrl}" class="notice-image-preview" onclick="openLightbox('${fileUrl}')" title="Click to Zoom">`;
                            attachmentHtml = `
                                <a href="${fileUrl}" download class="notice-attachment-btn" style="margin-top: 0;">
                                    <i class="fas fa-download"></i> Download Image
                                </a>
                            `;
                        } else {
                            attachmentHtml = `
                                <a href="${fileUrl}" target="_blank" class="notice-attachment-btn" style="margin-top: 0;">
                                    <i class="fas fa-external-link-alt"></i> View PDF / Document
                                </a>
                            `;
                        }
                    }

                    return `
                    <div class="notice-item" id="notice-card-${n.id}" style="background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); transition: all 0.3s; position: relative; overflow: hidden;">
                        <h3 style="margin: 0 0 12px 0; font-size: 20px; color: var(--text); font-weight: 700;">${n.title}</h3>
                        <div style="font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 16px; display: flex; gap: 18px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px;">
                            <span><i class="fas fa-calendar-alt" style="margin-right: 6px; color: var(--accent);"></i> ${n.date}</span>
                            <span><i class="fas fa-user-edit" style="margin-right: 6px; color: var(--accent2);"></i> ${n.posted_by}</span>
                        </div>
                        <p style="color: var(--muted); line-height: 1.7; font-size: 17px; margin: 0; white-space: pre-wrap; word-break: break-all;">${n.content}</p>
                        ${imagePreviewHtml}
                        
                        <div class="notice-footer">
                            ${attachmentHtml || '<span></span>'}
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <button onclick="openEditNoticeModal(${n.id})" style="background: rgba(99,102,241,0.2); color: #818cf8; border: 1px solid rgba(99,102,241,0.4); padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="delete-notice-btn" onclick="deleteNotice(${n.id})">
                                    <i class="fas fa-trash-alt" style="font-size: 12px;"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('');
            }
        }
    } catch (err) {
        listContainer.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 50px;">Failed to load notices.</p>';
    }
}

// Notice Edit Modal Logic
function openEditNoticeModal(id) {
    const n = (window.allNoticesMap && window.allNoticesMap[id]) || {};
    document.getElementById('editNoticeId').value = id;
    document.getElementById('editNoticeTitle').value = n.title || '';
    document.getElementById('editNoticeContent').value = n.content || '';
    if (document.getElementById('editNoticeTargetDept')) document.getElementById('editNoticeTargetDept').value = n.target_department || 'All';
    if (document.getElementById('editNoticeTargetSem')) document.getElementById('editNoticeTargetSem').value = n.target_semester || 'All';
    const modal = document.getElementById('editNoticeModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('open');
    }
}

function closeEditNoticeModal() {
    const modal = document.getElementById('editNoticeModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
    }
}

async function saveNoticeEdit(e) {
    e.preventDefault();
    const id = document.getElementById('editNoticeId').value;
    const title = document.getElementById('editNoticeTitle').value.trim();
    const content = document.getElementById('editNoticeContent').value.trim();
    const targetDept = document.getElementById('editNoticeTargetDept')?.value || 'All';
    const targetSem = document.getElementById('editNoticeTargetSem')?.value || 'All';
    const attachment = document.getElementById('editNoticeAttachment')?.files[0];
    const email = localStorage.getItem('user_email') || 'rsridoykhan000@gmail.com';

    if (!title || !content) {
        showToast('Please enter title and content.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('target_department', targetDept);
    formData.append('target_semester', targetSem);
    if (attachment) formData.append('attachment', attachment);

    try {
        const response = await fetch(`${API_BASE}/edit-notice/${id}/`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === 'success') {
            closeEditNoticeModal();
            showToast('Notice updated successfully! ✅');
            fetchAllNotices();
            if (typeof fetchDashboardData === 'function') fetchDashboardData();
        } else {
            showToast(result.message || 'Failed to update notice.', 'error');
        }
    } catch (err) {
        showToast('Error updating notice. Check server.', 'error');
    }
}

// Lightbox Logic — single canonical definition
let currentZoom = 1;

function openLightbox(src) {
    const lb = document.getElementById('imageLightbox');
    const img = document.getElementById('lightboxImg');
    const download = document.getElementById('lightboxDownload');
    if (!lb || !img) return;
    currentZoom = 1;
    img.style.transform = 'scale(1)';
    img.src = src;
    if (download) download.href = src;
    lb.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = document.getElementById('imageLightbox');
    const img = document.getElementById('lightboxImg');
    if (lb) lb.style.display = 'none';
    if (img) img.src = '';
    document.body.style.overflow = '';
    currentZoom = 1;
}

function zoomImage(delta) {
    currentZoom = Math.max(0.3, Math.min(5, currentZoom + delta));
    const img = document.getElementById('lightboxImg');
    if (img) img.style.transform = `scale(${currentZoom})`;
}

function resetZoom() {
    currentZoom = 1;
    const img = document.getElementById('lightboxImg');
    if (img) img.style.transform = 'scale(1)';
}

// Close lightbox with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { closeLightbox(); }
});
// Zoom with mouse wheel inside lightbox
document.addEventListener('wheel', function(e) {
    const lb = document.getElementById('imageLightbox');
    if (lb && lb.style.display === 'flex') {
        e.preventDefault();
        zoomImage(e.deltaY > 0 ? -0.1 : 0.1);
    }
}, { passive: false });


// Delete a notice logic
let noticeToDeleteId = null;

function openDeleteNoticeModal(id) {
    noticeToDeleteId = id;
    const modal = document.getElementById('deleteConfirmModal');
    
    // Ensure display is block/flex before adding open class
    modal.style.display = 'flex';
    
    // Small timeout to allow browser to register display change before animation
    setTimeout(() => {
        modal.classList.add('open');
    }, 10);
    
    // Wire up confirm button
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.onclick = handleNoticeDeletion;
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.classList.remove('open');
        setTimeout(() => {
            modal.style.display = 'none';
            // Reset button state to default after modal is hidden
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Delete';
            }
        }, 300); // match CSS transition duration
    }
    noticeToDeleteId = null;
}

async function handleNoticeDeletion() {
    if (!noticeToDeleteId) return;

    const userEmail = localStorage.getItem('user_email');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const ogText = confirmBtn.textContent;
    
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting...';

    try {
        const response = await fetch(`${API_BASE}/delete-notice/${noticeToDeleteId}/`, {
            method: 'POST',
            body: JSON.stringify({ email: userEmail }),
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();

        if (result.status === 'success') {
            showToast('Notice deleted successfully!');
            closeDeleteModal();
            fetchAllNotices();
            fetchDashboardData();
        } else {
            showToast(result.message, 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = ogText;
        }
    } catch (err) {
        showToast('Error deleting notice', 'error');
        confirmBtn.disabled = false;
        confirmBtn.textContent = ogText;
    }
}

function deleteNotice(id) {
    openDeleteNoticeModal(id);
}


function setNoticePreset(type) {
    const title = document.getElementById('noticeTitle');
    const content = document.getElementById('noticeContent');
    const dept = document.getElementById('noticeTargetDept');
    const sem = document.getElementById('noticeTargetSem');

    if (type === 'class_off') {
        if (title) title.value = '🚨 Class Cancelled / Teacher Absent Notice';
        if (content) content.value = 'Dear Students,\n\nPlease be informed that today\'s class is cancelled due to unavoidable circumstances. A make-up class will be scheduled soon. Thank you.';
    } else if (type === 'rescheduled') {
        if (title) title.value = '🕒 Class Schedule Change / Rescheduled';
        if (content) content.value = 'Dear Students,\n\nOur upcoming class schedule has been modified. Please check the updated class routine for new time slots and room numbers.';
    } else if (type === 'exam') {
        if (title) title.value = '📝 Class Test / Quiz Announcement';
        if (content) content.value = 'Dear Students,\n\nA class test / quiz will be held during our next class slot. Please prepare the recent topics covered in class.';
    }
}

// Create a new notice
async function postNewNotice(e) {
    e.preventDefault();
    const title = document.getElementById('noticeTitle').value;
    const content = document.getElementById('noticeContent').value;
    const targetDept = document.getElementById('noticeTargetDept') ? document.getElementById('noticeTargetDept').value : 'All';
    const targetSem = document.getElementById('noticeTargetSem') ? document.getElementById('noticeTargetSem').value : 'All';
    const attachmentFile = document.getElementById('noticeAttachment').files[0];
    const userEmail = localStorage.getItem('user_email');

    const formData = new FormData();
    formData.append('email', userEmail);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('target_department', targetDept);
    formData.append('target_semester', targetSem);
    if (attachmentFile) {
        formData.append('attachment', attachmentFile);
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const ogText = submitBtn.textContent;
    submitBtn.textContent = 'Posting...';
    try {
        const response = await fetch(`${API_BASE}/create-notice/`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            showToast('Notice posted successfully!');
            document.getElementById('createNoticeForm').reset();
            // Reset custom file upload label
            const fileNameDisplay = document.getElementById('file-upload-name');
            const icon = document.getElementById('upload-icon');
            const previewContainer = document.getElementById('image-preview-container');
            const previewImg = document.getElementById('upload-preview');

            if (fileNameDisplay) {
                fileNameDisplay.textContent = 'Choose a file or drag & drop';
                fileNameDisplay.style.color = 'var(--muted)';
            }
            if (icon) icon.style.display = 'block';
            if (previewContainer) previewContainer.style.display = 'none';
            if (previewImg) previewImg.src = '';
            // Automatically refresh both views so the new notice shows up
            fetchAllNotices();
            fetchDashboardData();
            submitBtn.textContent = ogText;
        } else {
            showToast(result.message, 'error');
            submitBtn.textContent = ogText;
        }
    } catch (err) {
        showToast('Error posting notice', 'error');
        submitBtn.textContent = ogText;
    }
}

// Update file upload UI with selected name
function updateFileName(input) {
    const fileNameDisplay = document.getElementById('file-upload-name');
    const icon = document.getElementById('upload-icon');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('upload-preview');

    if (fileNameDisplay) {
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            fileNameDisplay.textContent = `Selected: ${file.name}`;
            fileNameDisplay.style.color = 'var(--accent)';

            // Handling Image Preview
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    previewContainer.style.display = 'block';
                    if (icon) icon.style.display = 'none';
                }
                reader.readAsDataURL(file);
            } else {
                // Not an image, show icon and hide preview
                if (previewContainer) previewContainer.style.display = 'none';
                if (icon) icon.style.display = 'block';
            }
        } else {
            fileNameDisplay.textContent = 'Choose a file or drag & drop';
            fileNameDisplay.style.color = 'var(--muted)';
            if (previewContainer) previewContainer.style.display = 'none';
            if (icon) icon.style.display = 'block';
        }
    }
}

// ---- LIGHTBOX duplicate removed — single definition above ----


/* ==============================================================================
   ROUTINE MANAGEMENT SYSTEM FRONTEND LOGIC
============================================================================== */

let allRoutineData = [];
let currentRoutineView = 'matrix';

const TIME_SLOTS_HEADER = [
    { label: '08:00 - 08:45', start: '08:00', end: '08:45' },
    { label: '08:45 - 09:30', start: '08:45', end: '09:30' },
    { label: '09:30 - 10:15', start: '09:30', end: '10:15' },
    { label: '10:15 - 11:00', start: '10:15', end: '11:00' },
    { label: '11:00 - 11:45', start: '11:00', end: '11:45' },
    { label: '11:45 - 12:30', start: '11:45', end: '12:30' },
    { label: '12:30 - 01:15', start: '12:30', end: '13:15' }
];

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

async function loadRoutineData() {
    const dept = document.getElementById('routineFilterDept') ? document.getElementById('routineFilterDept').value : 'All';
    const sem = document.getElementById('routineFilterSem') ? document.getElementById('routineFilterSem').value : 'All';
    const shift = document.getElementById('routineFilterShift') ? document.getElementById('routineFilterShift').value : 'All';
    const teacher = document.getElementById('routineFilterTeacher') ? document.getElementById('routineFilterTeacher').value : 'All';
    const day = document.getElementById('routineFilterDay') ? document.getElementById('routineFilterDay').value : 'All';
    const search = document.getElementById('routineSearchInput') ? document.getElementById('routineSearchInput').value.trim() : '';

    const now = new Date();
    const daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = daysName[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5);

    try {
        const url = `${API_BASE}/get-routine/?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}&shift=${encodeURIComponent(shift)}&teacher=${encodeURIComponent(teacher)}&day=${encodeURIComponent(day)}&search=${encodeURIComponent(search)}&client_day=${currentDay}&client_time=${currentTime}`;
        const res = await fetch(url);
        const result = await res.json();

        if (result.status === 'success') {
            allRoutineData = result.data;
            updateSmartClassAlert(result.current_class, result.next_class, result.current_day, result.upcoming_alert, result.minutes_until_next);
            renderRoutineMatrix(allRoutineData);
            renderRoutineTable(allRoutineData);
            updateDashboardRoutineWidget(allRoutineData, result.current_class, result.upcoming_alert);
        }
    } catch (err) {
        console.error('Routine load error:', err);
    }
}

function updateSmartClassAlert(currentClass, nextClass, dayName, upcomingAlert, minutesUntilNext) {
    const statusTag = document.getElementById('alertStatusTag');
    const mainText = document.getElementById('alertMainText');
    const nextText = document.getElementById('alertNextText');
    const alertBanner = document.getElementById('smartClassAlert');

    if (!statusTag || !mainText || !nextText) return;

    if (currentClass) {
        // Class is running right now — ONGOING
        if (alertBanner) alertBanner.style.background = 'linear-gradient(135deg, rgba(0, 230, 118, 0.15), rgba(0, 212, 255, 0.15))';
        if (alertBanner) alertBanner.style.borderColor = 'rgba(0, 230, 118, 0.4)';
        statusTag.innerHTML = `🟢 CURRENTLY RUNNING CLASS (${currentClass.start_time} - ${currentClass.end_time})`;
        statusTag.style.color = '#00e676';
        mainText.innerHTML = `<span style="color:#00d4ff;">${currentClass.subject_code ? currentClass.subject_code + ' ' : ''}${currentClass.subject}</span> with <strong>${currentClass.teacher_initials || currentClass.teacher_name}</strong> in <span style="color:#ffd700;">${currentClass.room}</span>`;
    } else if (upcomingAlert) {
        // Class starts within 10 minutes — WARNING ALERT
        const cls = upcomingAlert.class;
        if (alertBanner) {
            alertBanner.style.background = 'linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 69, 0, 0.15))';
            alertBanner.style.borderColor = 'rgba(255, 165, 0, 0.5)';
            alertBanner.style.animation = 'pulse-alert 2s infinite';
        }
        statusTag.innerHTML = `⚡ CLASS STARTS IN ${upcomingAlert.minutes_left} MINUTE${upcomingAlert.minutes_left > 1 ? 'S' : ''}!`;
        statusTag.style.color = '#ff9800';
        mainText.innerHTML = `<span style="color:#ff9800; font-size: 18px;">${cls.subject_code ? cls.subject_code + ' ' : ''}${cls.subject}</span> with <strong>${cls.teacher_initials || cls.teacher_name}</strong> in <span style="color:#ffd700;">${cls.room}</span>`;
    } else {
        // No class running
        if (alertBanner) alertBanner.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(129, 140, 248, 0.1))';
        if (alertBanner) alertBanner.style.borderColor = 'rgba(0, 212, 255, 0.3)';
        if (alertBanner) alertBanner.style.animation = 'none';
        statusTag.innerHTML = `â³ NO CLASS RUNNING RIGHT NOW (${dayName})`;
        statusTag.style.color = '#00d4ff';
        mainText.innerHTML = `Free Time / Self Study Period`;
    }

    if (nextClass) {
        let extraInfo = '';
        if (minutesUntilNext && minutesUntilNext > 0) {
            extraInfo = ` — in ${minutesUntilNext} min`;
        }
        nextText.innerHTML = `<strong>${nextClass.subject}</strong> (${nextClass.teacher_initials}) at ${nextClass.start_time} in ${nextClass.room}${extraInfo}`;
    } else {
        nextText.innerHTML = `No more classes scheduled today 🎉`;
    }
}

function renderRoutineMatrix(data) {
    const tbody = document.getElementById('routineMatrixBody');
    if (!tbody) return;

    tbody.innerHTML = WEEK_DAYS.map(day => {
        const daySlots = data.filter(d => d.day.toLowerCase() === day.toLowerCase());

        let cellsHtml = '';
        TIME_SLOTS_HEADER.forEach(ts => {
            const item = daySlots.find(s => {
                // Direct match first
                if (s.start_time === ts.start) return true;
                // Numeric fuzzy match (Â±20 minutes)
                const stNum = parseInt(s.start_time.replace(':', ''));
                const tsNum = parseInt(ts.start.replace(':', ''));
                return Math.abs(stNum - tsNum) <= 20;
            });

            if (item) {
                const teacherBadge = item.teacher_initials || item.teacher_name || '';
                cellsHtml += `
                    <td class="routine-cell active-slot" onclick="openAddSlotModal(${item.id})">
                        <div class="r-code">${item.subject_code || ''}</div>
                        <div class="r-subject">${item.subject}</div>
                        <div class="r-teacher">(${teacherBadge})</div>
                        <div class="r-room">${item.room}</div>
                        <div class="r-actions" onclick="event.stopPropagation()">
                            <button onclick="openAddSlotModal(${item.id})" title="Edit"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteRoutineSlot(${item.id})" title="Delete" style="color:#f87171;"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
            } else {
                cellsHtml += `
                    <td class="routine-cell free-slot" title="Click to add extra class" onclick="openAddSlotModal(null, '${day}', '${ts.start}', '${ts.end}')">
                        <div style="font-size: 11px; color: var(--muted); opacity: 0.6;">Off</div>
                        <div class="add-hover-btn"><i class="fas fa-plus"></i> Add</div>
                    </td>
                `;
            }
        });

        return `
            <tr>
                <td class="day-cell">${day}</td>
                ${cellsHtml}
            </tr>
        `;
    }).join('');
}

function renderRoutineTable(data) {
    const tbody = document.getElementById('routineTableBody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding:30px;">No routine slots found matching filters.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td><strong>${item.day}</strong></td>
            <td><span class="badge" style="background:rgba(0,212,255,0.15); color:#00d4ff;">${item.time_slot}</span></td>
            <td>${item.subject_code || '--'}</td>
            <td><strong>${item.subject}</strong></td>
            <td>${item.teacher_name || item.teacher_initials || '--'}</td>
            <td><span class="badge" style="background:rgba(255,215,0,0.15); color:#ffd700;">${item.room}</span></td>
            <td>
                <button onclick="openAddSlotModal(${item.id})" style="background:none; border:none; color:#00d4ff; cursor:pointer; margin-right:8px;" title="Edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteRoutineSlot(${item.id})" style="background:none; border:none; color:#f87171; cursor:pointer;" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');
}

function switchRoutineView(view) {
    currentRoutineView = view;
    document.getElementById('routineMatrixView').style.display = view === 'matrix' ? 'block' : 'none';
    document.getElementById('routineTableView').style.display = view === 'table' ? 'block' : 'none';
    document.getElementById('routineFilesView').style.display = view === 'files' ? 'block' : 'none';

    document.getElementById('btnViewMatrix').classList.toggle('active', view === 'matrix');
    document.getElementById('btnViewTable').classList.toggle('active', view === 'table');
    document.getElementById('btnViewFiles').classList.toggle('active', view === 'files');

    if (view === 'files') {
        fetchRoutineFiles();
    }
}

function resetRoutineFilters() {
    if (document.getElementById('routineFilterDept')) document.getElementById('routineFilterDept').value = 'All';
    if (document.getElementById('routineFilterSem')) document.getElementById('routineFilterSem').value = 'All';
    if (document.getElementById('routineFilterShift')) document.getElementById('routineFilterShift').value = 'All';
    if (document.getElementById('routineFilterTeacher')) document.getElementById('routineFilterTeacher').value = 'All';
    if (document.getElementById('routineFilterDay')) document.getElementById('routineFilterDay').value = 'All';
    if (document.getElementById('routineSearchInput')) document.getElementById('routineSearchInput').value = '';
    loadRoutineData();
}

function openAddSlotModal(slotId = null, preDay = null, preStart = null, preEnd = null) {
    const modal = document.getElementById('routineSlotModal');
    const form = document.getElementById('routineSlotForm');
    const title = document.getElementById('routineModalTitle');

    if (!modal || !form) return;
    form.reset();

    if (slotId) {
        title.innerHTML = '<i class="fas fa-edit" style="color: #00d4ff;"></i> Edit Routine Slot';
        const item = allRoutineData.find(r => r.id === slotId);
        if (item) {
            document.getElementById('slotId').value = item.id;
            document.getElementById('slotDay').value = item.day;
            document.getElementById('slotShift').value = item.shift;
            document.getElementById('slotStartTime').value = item.start_time;
            document.getElementById('slotEndTime').value = item.end_time;
            document.getElementById('slotSubjectCode').value = item.subject_code;
            document.getElementById('slotSubject').value = item.subject;
            document.getElementById('slotTeacherInitials').value = item.teacher_initials;
            document.getElementById('slotRoom').value = item.room;
            document.getElementById('slotDept').value = item.department;
            document.getElementById('slotSemester').value = item.semester;
        }
    } else {
        title.innerHTML = '<i class="fas fa-plus-circle" style="color: #00e676;"></i> Add Extra Class Slot';
        document.getElementById('slotId').value = '';
        if (preDay) document.getElementById('slotDay').value = preDay;
        if (preStart) document.getElementById('slotStartTime').value = preStart;
        if (preEnd) document.getElementById('slotEndTime').value = preEnd;
    }

    modal.classList.add('open');
}

function closeRoutineModal() {
    const modal = document.getElementById('routineSlotModal');
    if (modal) modal.classList.remove('open');
}

async function saveRoutineSlotForm(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const ogText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const payload = {
        id: document.getElementById('slotId').value || null,
        day: document.getElementById('slotDay').value,
        shift: document.getElementById('slotShift').value,
        start_time: document.getElementById('slotStartTime').value.trim(),
        end_time: document.getElementById('slotEndTime').value.trim(),
        subject_code: document.getElementById('slotSubjectCode').value.trim(),
        subject: document.getElementById('slotSubject').value.trim(),
        teacher_initials: document.getElementById('slotTeacherInitials').value.trim(),
        room: document.getElementById('slotRoom').value.trim(),
        department: document.getElementById('slotDept').value,
        semester: document.getElementById('slotSemester').value,
        email: localStorage.getItem('user_email') || ''
    };

    try {
        const res = await fetch(`${API_BASE}/save-routine-slot/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        btn.textContent = ogText;
        btn.disabled = false;

        if (data.status === 'success') {
            showToast(data.message, 'success');
            closeRoutineModal();
            loadRoutineData();
        } else {
            showToast(data.message || 'Error saving routine', 'error');
        }
    } catch (err) {
        btn.textContent = ogText;
        btn.disabled = false;
        showToast('Server error while saving routine', 'error');
    }
}

async function deleteRoutineSlot(slotId) {
    if (!confirm('Are you sure you want to delete this routine slot?')) return;

    try {
        const res = await fetch(`${API_BASE}/delete-routine-slot/${slotId}/`, { method: 'POST' });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('Slot deleted!', 'success');
            loadRoutineData();
        } else {
            showToast(data.message || 'Error deleting slot', 'error');
        }
    } catch (err) {
        showToast('Server error deleting slot', 'error');
    }
}

function openUploadRoutineModal() {
    const modal = document.getElementById('uploadRoutineModal');
    if (modal) modal.classList.add('open');
}

function closeUploadRoutineModal() {
    const modal = document.getElementById('uploadRoutineModal');
    if (modal) modal.classList.remove('open');
}

async function handleRoutineFileUpload(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const fileInput = document.getElementById('routineInputFile');
    if (!fileInput.files || fileInput.files.length === 0) {
        showToast('Please select a PDF, Image or Excel file first!', 'error');
        return;
    }

    btn.textContent = 'Uploading & Importing...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('title', document.getElementById('routineFileTitle').value);
    formData.append('department', document.getElementById('routineFileDept').value);
    formData.append('semester', document.getElementById('routineFileSem').value);
    formData.append('shift', document.getElementById('routineFileShift').value);
    formData.append('file', fileInput.files[0]);

    try {
        const res = await fetch(`${API_BASE}/upload-routine-file/`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        btn.textContent = 'Upload Routine';
        btn.disabled = false;

        if (data.status === 'success') {
            showToast(data.message, 'success');
            closeUploadRoutineModal();
            loadRoutineData();
            if (currentRoutineView === 'files') fetchRoutineFiles();
        } else {
            showToast(data.message || 'Error uploading file', 'error');
        }
    } catch (err) {
        btn.textContent = 'Upload Routine';
        btn.disabled = false;
        showToast('Upload error', 'error');
    }
}

async function fetchRoutineFiles() {
    const grid = document.getElementById('routineFilesGrid');
    if (!grid) return;
    grid.innerHTML = '<p style="color:var(--muted);">Loading uploaded documents...</p>';

    try {
        const res = await fetch(`${API_BASE}/get-routine-files/`);
        const result = await res.json();

        if (result.status === 'success' && result.data.length > 0) {
            grid.innerHTML = result.data.map(f => {
                const isImg = f.file_type === 'image';
                const isPdf = f.file_type === 'pdf';
                const fileIcon = isPdf ? 'fa-file-pdf' : (isImg ? 'fa-file-image' : 'fa-file-excel');
                const fileColor = isPdf ? '#ef4444' : (isImg ? '#00d4ff' : '#10b981');
                const fileUrl = f.file_url.startsWith('http') ? f.file_url : `${MEDIA_BASE}${f.file_url}`;

                return `
                    <div class="section-card" style="padding: 18px; position: relative; border-color: ${fileColor}44; background: ${fileColor}08;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <i class="fas ${fileIcon}" style="font-size: 32px; color: ${fileColor};"></i>
                            <div style="overflow: hidden;">
                                <h4 style="font-size: 14px; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${f.title}</h4>
                                <span style="font-size: 11px; color: var(--muted);">${f.uploaded_at}</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 15px;">
                            <a href="${fileUrl}" target="_blank" style="flex: 1; text-align: center; background: rgba(255,255,255,0.06); border: 1px solid var(--border); color: var(--text); padding: 7px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none;">
                                <i class="fas fa-eye"></i> View
                            </a>
                            <a href="${fileUrl}" download style="flex: 1; text-align: center; background: ${fileColor}; color: #000; padding: 7px; border-radius: 8px; font-size: 12px; font-weight: 700; text-decoration: none;">
                                <i class="fas fa-download"></i> Download
                            </a>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            grid.innerHTML = '<p style="color:var(--muted); text-align:center; grid-column:span 3; padding:30px;">No reference routine documents uploaded yet.</p>';
        }
    } catch (err) {
        grid.innerHTML = '<p style="color:#ef4444;">Error loading documents.</p>';
    }
}

function updateDashboardRoutineWidget(data, currentClass) {
    const widget = document.getElementById('dashboardRoutine');
    if (!widget) return;

    const now = new Date();
    const daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = daysName[now.getDay()];

    const todaySlots = data.filter(d => d.day.toLowerCase() === today.toLowerCase());
    todaySlots.sort((a, b) => a.start_time.localeCompare(b.start_time));

    let liveHtml = '';
    if (currentClass) {
        liveHtml = `
            <div style="background: linear-gradient(135deg, rgba(0,230,118,0.15), rgba(0,212,255,0.15)); border: 1px solid #00e676; border-radius: 12px; padding: 12px 16px; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <span style="font-size: 10px; font-weight: 800; color: #00e676; text-transform: uppercase;">🟢 CLASS RUNNING NOW (${currentClass.start_time} - ${currentClass.end_time})</span>
                    <h4 style="font-size: 15px; font-weight: 700; margin: 3px 0 0 0; color: var(--text);">${currentClass.subject}</h4>
                </div>
                <span style="background: #00e676; color: #000; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800;">${currentClass.room}</span>
            </div>
        `;
    }

    if (todaySlots.length === 0) {
        widget.innerHTML = liveHtml + `<p class="subtitle" style="text-align: left;">No routine classes scheduled for today (${today}).</p>`;
        return;
    }

    widget.innerHTML = liveHtml + `
        <div style="display: flex; flex-direction: column; gap: 8px;">
            ${todaySlots.map(s => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 12px; font-weight: 700; color: #00d4ff; min-width: 90px;">${s.time_slot}</span>
                        <span style="font-size: 13px; font-weight: 600;">${s.subject} <small style="color:var(--muted);">(${s.teacher_initials})</small></span>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; background: rgba(255,215,0,0.15); color: #ffd700; padding: 3px 8px; border-radius: 6px;">${s.room}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function printOrDownloadRoutine() {
    window.print();
}

/* ==============================================================================
   ASSIGNMENT MANAGEMENT SYSTEM FRONTEND LOGIC
============================================================================== */

async function loadTeacherAssignments() {
    const grid = document.getElementById('teacherAssignmentsGrid');
    if (!grid) return;

    const dept = document.getElementById('assignFilterDept') ? document.getElementById('assignFilterDept').value : 'All';
    const sem = document.getElementById('assignFilterSem') ? document.getElementById('assignFilterSem').value : 'All';
    const shift = document.getElementById('assignFilterShift') ? document.getElementById('assignFilterShift').value : 'All';

    grid.innerHTML = '<p style="color:var(--muted); grid-column:span 3; text-align:center; padding:30px;">Loading assignments...</p>';

    try {
        const url = `${API_BASE}/get-assignments/?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}&shift=${encodeURIComponent(shift)}`;
        const res = await fetch(url);
        const result = await res.json();

        if (result.status === 'success' && result.data.length > 0) {
            grid.innerHTML = result.data.map(a => {
                const fileLinkHtml = a.file_url ? `
                    <a href="${a.file_url.startsWith('http') ? a.file_url : 'MEDIA_BASE + a.file_url}" target="_blank" style="font-size:12px; color:#00d4ff; text-decoration:none; display:inline-flex; align-items:center; gap:5px; margin-right:12px;">
                        <i class="fas fa-file-download"></i> Attachment File
                    </a>
                ` : '';

                const driveLinkHtml = a.drive_link ? `
                    <a href="${a.drive_link}" target="_blank" style="font-size:12px; color:#10b981; text-decoration:none; display:inline-flex; align-items:center; gap:5px;">
                        <i class="fab fa-google-drive"></i> Google Drive Link
                    </a>
                ` : '';

                return `
                    <div class="section-card" style="padding: 20px; border: 1px solid rgba(167,139,250,0.3); background: rgba(167,139,250,0.04); display: flex; flex-direction: column; justify-content: space-between; border-radius: 16px;">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                <span class="badge" style="background: rgba(167,139,250,0.2); color: #a78bfa; font-weight: 700;">${a.subject} (${a.subject_code || 'Code N/A'})</span>
                                <span style="font-size: 11px; color: var(--muted);"><i class="fas fa-clock"></i> Due: <strong style="color:#ffd700;">${a.due_date}</strong></span>
                            </div>
                            <h3 style="font-size: 16px; font-weight: 700; margin: 8px 0; color: var(--text);">${a.title}</h3>
                            <p style="font-size: 13px; color: var(--muted); margin-bottom: 12px; line-height: 1.4;">${a.description || 'No detailed instructions provided.'}</p>
                            
                            <div style="font-size: 11px; color: var(--muted); margin-bottom: 12px;">
                                <span>🎯 Target: <strong>${a.department}</strong> (${a.semester}, ${a.shift})</span><br>
                                <span>💯 Total Marks: <strong>${a.total_marks}</strong></span>
                            </div>

                            <div style="margin-bottom: 16px;">
                                ${fileLinkHtml}
                                ${driveLinkHtml}
                            </div>
                        </div>

                        <div style="display: flex; gap: 10px; border-top: 1px solid var(--border); padding-top: 15px; margin-top: 10px;">
                            <button onclick="openViewSubmissionsModal(${a.id}, '${a.title.replace(/'/g, "\\'")}')" style="flex: 1; background: linear-gradient(135deg, #00d4ff, #0284c7); color: #000; border: none; padding: 8px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <i class="fas fa-users"></i> View Submissions (${a.total_submissions})
                            </button>
                            <button onclick="deleteAssignment(${a.id})" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #f87171; padding: 8px 12px; border-radius: 8px; cursor: pointer;" title="Delete Assignment">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            grid.innerHTML = '<p style="color:var(--muted); text-align:center; grid-column:span 3; padding:40px;">No assignments published yet for this filter.</p>';
        }
    } catch (err) {
        grid.innerHTML = '<p style="color:#ef4444; grid-column:span 3; text-align:center;">Error loading assignments.</p>';
    }
}

function openCreateAssignmentModal() {
    const modal = document.getElementById('createAssignmentModal');
    if (modal) modal.classList.add('open');
}

function closeCreateAssignmentModal() {
    const modal = document.getElementById('createAssignmentModal');
    if (modal) modal.classList.remove('open');
}

async function handleCreateAssignment(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const ogText = btn.textContent;
    btn.textContent = 'Publishing...';
    btn.disabled = true;

    const userEmail = localStorage.getItem('user_email') || 'asmrifat9090@gmail.com';
    const formData = new FormData();
    formData.append('email', userEmail);
    formData.append('title', document.getElementById('assignTitle') ? document.getElementById('assignTitle').value.trim() : '');
    formData.append('subject', document.getElementById('assignSubject') ? document.getElementById('assignSubject').value.trim() : 'General');
    formData.append('subject_code', document.getElementById('assignSubjectCode') ? document.getElementById('assignSubjectCode').value.trim() : '');
    formData.append('department', document.getElementById('assignDept') ? document.getElementById('assignDept').value : 'Computer Science & Technology');
    formData.append('semester', document.getElementById('assignSem') ? document.getElementById('assignSem').value : '5th Semester');
    formData.append('shift', document.getElementById('assignShift') ? document.getElementById('assignShift').value : '1st Shift');
    formData.append('total_marks', document.getElementById('assignMarks') ? document.getElementById('assignMarks').value : 100);
    formData.append('due_date', document.getElementById('assignDueDate') ? document.getElementById('assignDueDate').value.trim() : '');
    formData.append('drive_link', document.getElementById('assignDriveLink') ? document.getElementById('assignDriveLink').value.trim() : '');
    formData.append('description', document.getElementById('assignDesc') ? document.getElementById('assignDesc').value.trim() : '');
    
    const fileInput = document.getElementById('assignInputFile');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }

    try {
        const res = await fetch(`${API_BASE}/create-assignment/`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        btn.textContent = ogText;
        btn.disabled = false;

        if (data.status === 'success') {
            showToast(data.message, 'success');
            document.getElementById('createAssignmentForm').reset();
            closeCreateAssignmentModal();
            loadTeacherAssignments();
        } else {
            showToast(data.message || 'Error creating assignment', 'error');
        }
    } catch (err) {
        btn.textContent = ogText;
        btn.disabled = false;
        showToast('Server error creating assignment', 'error');
    }
}

async function deleteAssignment(id) {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
        const res = await fetch(`${API_BASE}/delete-assignment/${id}/`, { method: 'POST' });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('Assignment deleted!', 'success');
            loadTeacherAssignments();
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Error deleting assignment', 'error');
    }
}

async function openViewSubmissionsModal(assignmentId, title) {
    const modal = document.getElementById('viewSubmissionsModal');
    const subTitle = document.getElementById('submissionsModalSub');
    const tbody = document.getElementById('submissionsTableBody');

    if (!modal || !tbody) return;
    if (subTitle) subTitle.textContent = title;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--muted);">Loading student submissions...</td></tr>';
    modal.classList.add('open');

    try {
        const res = await fetch(`${API_BASE}/get-assignment-submissions/${assignmentId}/`);
        const result = await res.json();

        if (result.status === 'success') {
            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--muted);">No student submissions received yet for this assignment.</td></tr>';
                return;
            }

            tbody.innerHTML = result.data.map(sub => {
                const fileBtn = sub.file_url ? `
                    <a href="${sub.file_url.startsWith('http') ? sub.file_url : 'MEDIA_BASE + sub.file_url}" target="_blank" style="background:rgba(0,212,255,0.15); color:#00d4ff; padding:4px 8px; border-radius:6px; font-size:11px; text-decoration:none; font-weight:700;">
                        <i class="fas fa-file-download"></i> File
                    </a>
                ` : '';

                const driveBtn = sub.drive_link ? `
                    <a href="${sub.drive_link}" target="_blank" style="background:rgba(16,185,129,0.15); color:#10b981; padding:4px 8px; border-radius:6px; font-size:11px; text-decoration:none; font-weight:700;">
                        <i class="fab fa-google-drive"></i> Drive
                    </a>
                ` : '';

                return `
                    <tr>
                        <td><strong>${sub.roll}</strong></td>
                        <td>${sub.student_name}</td>
                        <td>${fileBtn} ${driveBtn}</td>
                        <td><small style="color:var(--muted);">${sub.submitted_at}</small></td>
                        <td><strong style="color:#ffd700;">${sub.marks_obtained || '--'}</strong> / ${result.total_marks}</td>
                        <td>
                            <button onclick="gradeStudentSubmission(${sub.id}, '${sub.marks_obtained || ''}', '${(sub.feedback || '').replace(/'/g, "\\'")}')" style="background:linear-gradient(135deg, #00e676, #059669); color:#000; border:none; padding:5px 10px; border-radius:6px; font-weight:700; font-size:11px; cursor:pointer;">
                                <i class="fas fa-check-circle"></i> Grade & Feedback
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ef4444;">Error loading submissions.</td></tr>';
    }
}

function closeViewSubmissionsModal() {
    const modal = document.getElementById('viewSubmissionsModal');
    if (modal) modal.classList.remove('open');
}

async function gradeStudentSubmission(subId, currentMarks, currentFeedback) {
    const marks = prompt('Enter Marks Obtained (out of total marks):', currentMarks);
    if (marks === null) return;

    const feedback = prompt('Enter Teacher Feedback / Remarks (Optional):', currentFeedback);

    try {
        const res = await fetch(`${API_BASE}/grade-submission/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submission_id: subId, marks_obtained: marks, feedback: feedback || '' })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('Graded successfully!', 'success');
            closeViewSubmissionsModal();
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Error saving grade', 'error');
    }
}


/* ==============================================================================
   QUIZ MANAGEMENT SYSTEM (TEACHER PANEL)
============================================================================== */
let quizQuestionCount = 0;
const getTeacherEmail = () => localStorage.getItem('user_email') || 'teacher@gmail.com';

function addQuizQuestion() {
    quizQuestionCount++;
    const container = document.getElementById('quizQBuilder');
    if (!container) return;

    const div = document.createElement('div');
    div.id = `qCard-${quizQuestionCount}`;
    div.style.cssText = 'background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:14px; padding:18px; margin-bottom:14px';
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
            <span style="font-size:14px; font-weight:700; color:var(--accent)">Question #${quizQuestionCount}</span>
            <button onclick="removeQuizQuestion(${quizQuestionCount})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:14px"><i class="fas fa-trash-alt"></i> Remove</button>
        </div>
        <input type="text" class="q-text" placeholder="Type Question..." style="width:100%; padding:10px; background:var(--input-bg); border:1px solid var(--border); border-radius:10px; color:var(--text); font-size:14px; outline:none; margin-bottom:12px; box-sizing:border-box;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px">
            <input type="text" class="q-optA" placeholder="Option A" style="padding:8px 12px; background:var(--input-bg); border:1px solid var(--border); border-radius:8px; color:var(--text); font-size:13px; box-sizing:border-box;">
            <input type="text" class="q-optB" placeholder="Option B" style="padding:8px 12px; background:var(--input-bg); border:1px solid var(--border); border-radius:8px; color:var(--text); font-size:13px; box-sizing:border-box;">
            <input type="text" class="q-optC" placeholder="Option C" style="padding:8px 12px; background:var(--input-bg); border:1px solid var(--border); border-radius:8px; color:var(--text); font-size:13px; box-sizing:border-box;">
            <input type="text" class="q-optD" placeholder="Option D" style="padding:8px 12px; background:var(--input-bg); border:1px solid var(--border); border-radius:8px; color:var(--text); font-size:13px; box-sizing:border-box;">
        </div>
        <div style="display:flex; gap:14px; align-items:center;">
            <label style="font-size:12px; font-weight:700; color:var(--muted)">Correct Option:</label>
            <select class="q-correct" style="padding:6px 12px; background:var(--input-bg); border:1px solid var(--border); border-radius:8px; color:var(--text); font-size:13px">
                <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
            </select>
            <label style="font-size:12px; font-weight:700; color:var(--muted); margin-left:auto">Marks:</label>
            <input type="number" class="q-marks" value="5" style="width:60px; padding:6px; background:var(--input-bg); border:1px solid var(--border); border-radius:8px; color:var(--text); font-size:13px">
        </div>
    `;
    container.appendChild(div);
}

function removeQuizQuestion(id) {
    const el = document.getElementById(`qCard-${id}`);
    if (el) el.remove();
}

async function createTeacherQuiz() {
    const title = document.getElementById('qzTitle')?.value?.trim();
    const subject = document.getElementById('qzSubject')?.value?.trim();
    const department = document.getElementById('qzDept')?.value?.trim();
    const semester = document.getElementById('qzSemester')?.value;
    const language = document.getElementById('qzLanguage')?.value;
    const duration_minutes = document.getElementById('qzDuration')?.value;
    const total_marks = document.getElementById('qzTotalMarks')?.value;
    const start_time = document.getElementById('qzStart')?.value;
    const end_time = document.getElementById('qzEnd')?.value;

    if (!title || !subject) {
        showToast('Please enter quiz title and subject.', 'error');
        return;
    }
    if (!department) {
        showToast('Please select a Department for the quiz.', 'error');
        return;
    }
    if (!semester) {
        showToast('Please select a Semester for the quiz.', 'error');
        return;
    }

    const qCards = document.querySelectorAll('#quizQBuilder > div');
    const questions = [];
    qCards.forEach(card => {
        const qText = card.querySelector('.q-text')?.value?.trim();
        const optA = card.querySelector('.q-optA')?.value?.trim();
        const optB = card.querySelector('.q-optB')?.value?.trim();
        const optC = card.querySelector('.q-optC')?.value?.trim();
        const optD = card.querySelector('.q-optD')?.value?.trim();
        const correct = card.querySelector('.q-correct')?.value;
        const marks = card.querySelector('.q-marks')?.value;

        if (qText && optA && optB) {
            questions.push({
                question_text: qText,
                option_a: optA,
                option_b: optB,
                option_c: optC || '',
                option_d: optD || '',
                correct_answer: correct,
                marks: parseInt(marks || 5)
            });
        }
    });

    if (!questions.length) {
        showToast('Please add at least 1 valid question with Options A and B.', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/quiz/create/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teacher_email: getTeacherEmail(),
                title, subject, department, semester, language,
                duration_minutes: parseInt(duration_minutes || 30),
                total_marks: parseInt(total_marks || 100),
                start_time, end_time,
                questions
            })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('Quiz created successfully! 🎉');
            document.getElementById('qzTitle').value = '';
            document.getElementById('qzSubject').value = '';
            document.getElementById('quizQBuilder').innerHTML = '';
            quizQuestionCount = 0;
            addQuizQuestion();
            loadTeacherQuizzes();
        } else {
            showToast(data.message || 'Error creating quiz', 'error');
        }
    } catch (e) {
        showToast('Server connection error while creating quiz', 'error');
    }
}

async function loadTeacherQuizzes() {
    const container = document.getElementById('teacherQuizList');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/quiz/list/?teacher_email=${encodeURIComponent(getTeacherEmail())}`);
        const data = await res.json();

        if (data.status === 'success' && data.data.length) {
            container.innerHTML = data.data.map(q => `
                <div style="background:var(--card-bg, #1e2336); border:1px solid var(--border, rgba(255,255,255,0.12)); border-radius:16px; padding:20px; box-shadow:0 6px 20px rgba(0,0,0,0.15)">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px">
                        <div>
                            <div style="font-size:18px; font-weight:800; color:#ffffff; letter-spacing:0.2px;">${q.title ? (q.title.charAt(0).toUpperCase() + q.title.slice(1)) : 'Quiz'}</div>
                            <div style="font-size:14px; font-weight:700; color:#a78bfa; margin-top:4px;">📚 ${q.subject} • 🎓 ${q.semester} <span style="font-size:12px; opacity:0.8">(${q.language || 'Bangla'})</span></div>
                            <div style="font-size:13px; font-weight:600; color:#cbd5e1; margin-top:6px; display:flex; gap:12px; align-items:center;">
                                <span><i class="fas fa-clock" style="color:#f59e0b"></i> ${q.duration_minutes} Mins</span>
                                <span>•</span>
                                <span><i class="fas fa-question-circle" style="color:#60a5fa"></i> ${q.questions_count} Questions</span>
                                <span>•</span>
                                <span style="color:#34d399; font-weight:800">💯 Marks: ${q.total_marks}</span>
                            </div>
                        </div>
                        <div style="display:flex; gap:10px">
                            <button onclick="viewQuizResults(${q.id})" style="padding:8px 16px; background:linear-gradient(135deg,#6c8fff,#a78bfa); color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(108,143,255,0.3)"><i class="fas fa-poll"></i> Results</button>
                            <button onclick="deleteTeacherQuiz(${q.id})" style="padding:8px 14px; background:rgba(239,68,68,0.12); color:#ef4444; border:1px solid rgba(239,68,68,0.35); border-radius:10px; font-size:13px; font-weight:700; cursor:pointer"><i class="fas fa-trash-alt"></i> Delete</button>
                        </div>
                    </div>
                </div>

            `).join('');
        } else {
            container.innerHTML = '<div style="color:var(--muted); font-size:13px; text-align:center; padding:20px;">No quizzes created yet.</div>';
        }
    } catch (e) {
        container.innerHTML = '<div style="color:#ef4444; font-size:13px; text-align:center; padding:20px;">Error loading quizzes.</div>';
    }
}

async function viewQuizResults(quizId) {
    try {
        const res = await fetch(`${API_BASE}/quiz/${quizId}/results/`);
        const data = await res.json();
        if (data.status === 'success') {
            // Remove any existing quiz modal first
            const existing = document.getElementById('quiz-result-modal-overlay');
            if (existing) existing.remove();

            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.id = 'quiz-result-modal-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 23, 42, 0.75);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.25s ease-out;
            `;

            // Define standard animation if not present
            if (!document.getElementById('modal-anim-styles')) {
                const style = document.createElement('style');
                style.id = 'modal-anim-styles';
                style.innerHTML = `
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                `;
                document.head.appendChild(style);
            }

            let studentsHtml = '';
            if (data.data.length) {
                studentsHtml = data.data.map((s, i) => {
                    const isPass = s.percentage >= 50;
                    const badgeBg = isPass ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
                    const badgeColor = isPass ? '#10b981' : '#ef4444';
                    return `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.06)">
                            <div style="display:flex; align-items:center; gap:12px">
                                <span style="font-size:13px; font-weight:700; color:var(--muted); min-width:20px">${i + 1}.</span>
                                <div>
                                    <div style="font-size:14px; font-weight:700; color:var(--text)">${s.student_name}</div>
                                    <div style="font-size:12px; color:var(--muted)">Roll: ${s.roll || '--'}</div>
                                </div>
                            </div>
                            <div style="text-align:right">
                                <span style="padding:4px 8px; border-radius:6px; font-size:12px; font-weight:800; background:${badgeBg}; color:${badgeColor}">
                                    ${s.score}/${data.total_marks} (${s.percentage}%)
                                </span>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                studentsHtml = `
                    <div style="text-align:center; padding:32px 0; color:var(--muted);">
                        <i class="fas fa-info-circle" style="font-size:24px; margin-bottom:8px; display:block"></i>
                        No student submissions received yet.
                    </div>
                `;
            }

            const modal = document.createElement('div');
            modal.style.cssText = `
                background: var(--card2, #1b1e2f);
                border: 1px solid var(--border, rgba(255,255,255,0.08));
                border-radius: 20px;
                width: 90%;
                max-width: 480px;
                padding: 24px;
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
            `;

            modal.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px">
                    <div>
                        <h3 style="font-size:18px; font-weight:800; margin:0; color:var(--text)">📊 Quiz Results</h3>
                        <p style="font-size:13px; color:var(--muted); margin:4px 0 0 0">${data.quiz_title} • Total Submissions: ${data.total_submissions}</p>
                    </div>
                    <button onclick="document.getElementById('quiz-result-modal-overlay').remove()" style="background:none; border:none; color:var(--muted); font-size:18px; cursor:pointer; padding:4px"><i class="fas fa-times"></i></button>
                </div>
                <div style="max-height:300px; overflow-y:auto; padding-right:4px; margin-bottom:20px">
                    ${studentsHtml}
                </div>
                <button onclick="document.getElementById('quiz-result-modal-overlay').remove()" style="width:100%; padding:11px; background:linear-gradient(135deg,#6c8fff,#a78bfa); color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(108,143,255,0.3)">Close</button>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            // Close modal on click outside
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.remove();
            });
        }
    } catch (e) {
        showToast('Error fetching results', 'error');
    }
}

async function deleteTeacherQuiz(quizId) {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
        const res = await fetch(`${API_BASE}/quiz/${quizId}/delete/`, { method: 'POST' });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('Quiz deleted successfully!');
            loadTeacherQuizzes();
        } else {
            showToast(data.message || 'Error deleting quiz', 'error');
        }
    } catch (e) {
        showToast('Error deleting quiz', 'error');
    }
}

// Window function bindings
window.addQuizQuestion = addQuizQuestion;
window.removeQuizQuestion = removeQuizQuestion;
window.createTeacherQuiz = createTeacherQuiz;
window.loadTeacherQuizzes = loadTeacherQuizzes;
window.viewQuizResults = viewQuizResults;
window.deleteTeacherQuiz = deleteTeacherQuiz;

/* ============================================================
   PROBIDHAN 2022 DATASET — TEACHER PANEL
   Uses shared canonical data from public.js (window.PROBIDHAN_2022_DATA)
============================================================ */
const PROBIDHAN_2022_TEACHER_DATA = (typeof window !== 'undefined' && window.PROBIDHAN_2022_DATA)
  ? window.PROBIDHAN_2022_DATA
  : {};

function normalizeTeacherDept(name) {
  if (!name) return 'computer';
  let s = name.toLowerCase().trim();
  if (s.includes('computer') || s.includes('cst')) return 'computer';
  if (s.includes('civil')) return 'civil';
  if (s.includes('electrical') && !s.includes('electronic')) return 'electrical';
  if (s.includes('electronic')) return 'electronics';
  if (s.includes('mechanical')) return 'mechanical';
  if (s.includes('power')) return 'power';
  if (s.includes('telecom')) return 'telecom';
  return 'computer';
}

function loadTeacherBooks(isUserClick) {
  const container = document.getElementById('teacherBooksGrid');
  if (!container) return;

  const deptVal = document.getElementById('tBookDeptFilter')?.value || '';
  const semVal = document.getElementById('tBookSemFilter')?.value || '';

  if (!deptVal || !semVal) {
    if (isUserClick) {
      showToast('Please select both Department and Semester first.', 'error');
    } else {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:var(--muted)">
          <i class="fas fa-book-reader" style="font-size:52px;color:rgba(167,139,250,0.3);margin-bottom:18px;display:block"></i>
          <p style="font-size:16px;font-weight:600;margin:0 0 6px 0;color:var(--text)">Select Department &amp; Semester</p>
          <p style="font-size:13px;margin:0">Choose options above and click "View Book List" to see subjects.</p>
        </div>`;
    }
    return;
  }

  const key = normalizeTeacherDept(deptVal);
  const deptData = PROBIDHAN_2022_TEACHER_DATA[key] || PROBIDHAN_2022_TEACHER_DATA['computer'];
  const books = (deptData.semesters && deptData.semesters[semVal]) || [];
  const totalCount = books.length;

  const summaryHtml = `
    <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12)); border: 1px solid rgba(129, 140, 248, 0.25); border-radius: 16px; padding: 18px 24px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
      <div>
        <div style="font-size: 17px; font-weight: 800; color: var(--text, #f8fafc); display: flex; align-items: center; gap: 10px;">
          <span style="background: rgba(129,140,248,0.2); width: 34px; height: 34px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: var(--accent, #818cf8); font-size: 16px;"><i class="fas fa-graduation-cap"></i></span>
          ${deptData.deptName}
        </div>
        <div style="font-size: 13px; color: var(--muted, #94a3b8); margin-top: 6px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="background: rgba(245,158,11,0.15); color: #fbbf24; padding: 3px 10px; border-radius: 20px; font-weight: 700; border: 1px solid rgba(245,158,11,0.3); font-size: 12px;"><i class="fas fa-certificate" style="margin-right: 4px;"></i>${deptData.probidhan}</span>
          <span style="color: var(--text, #cbd5e1); font-weight: 600;"><i class="fas fa-layer-group" style="color:#a78bfa; margin-right: 4px;"></i>${semVal}</span>
        </div>
      </div>
      <span style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #1e1b4b; font-size: 13px; font-weight: 800; padding: 6px 16px; border-radius: 20px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3); display: inline-flex; align-items: center; gap: 6px;">
        <i class="fas fa-list-ol"></i> Total ${totalCount} Subjects
      </span>
    </div>
  `;

  let tableRows = '';
  if (books.length > 0) {
    tableRows = books.map(item => `
      <tr style="border-bottom: 1px solid var(--border, rgba(148, 163, 184, 0.12)); transition: background 0.2s;" onmouseover="this.style.background='rgba(99, 102, 241, 0.08)'" onmouseout="this.style.background='transparent'">
        <td style="width: 75px; text-align: center; padding: 14px 16px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; background: rgba(99, 102, 241, 0.15); color: var(--accent, #818cf8); font-weight: 800; font-size: 13px; border: 1px solid rgba(99, 102, 241, 0.3);">${item.sl}</span>
        </td>
        <td style="padding: 14px 20px; font-weight: 600; color: var(--text, #f1f5f9); font-size: 14px;">${item.subject}</td>
        <td style="width: 150px; text-align: center; padding: 14px 16px;">
          <span style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24; font-family: monospace; font-size: 13px; font-weight: 800; padding: 5px 12px; border-radius: 8px; display: inline-block; letter-spacing: 0.5px;">${item.code}</span>
        </td>
      </tr>
    `).join('');
  } else {
    tableRows = `
      <tr>
        <td colspan="3" style="text-align: center; color: var(--muted, #94a3b8); padding: 40px; font-size: 14px;">
          No subject data found for the selected semester.
        </td>
      </tr>`;
  }

  const tableHtml = `
    <div style="background: var(--card-bg, rgba(15, 23, 42, 0.6)); border: 1px solid var(--border, rgba(148, 163, 184, 0.2)); border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: rgba(99, 102, 241, 0.1); border-bottom: 1.5px solid var(--border, rgba(148, 163, 184, 0.2));">
            <th style="width: 75px; text-align: center; padding: 16px; font-size: 12px; font-weight: 800; color: var(--accent, #818cf8); text-transform: uppercase; letter-spacing: 0.8px;">SL</th>
            <th style="padding: 16px 20px; font-size: 12px; font-weight: 800; color: var(--accent, #818cf8); text-transform: uppercase; letter-spacing: 0.8px;">Subject Name</th>
            <th style="width: 150px; text-align: center; padding: 16px; font-size: 12px; font-weight: 800; color: var(--accent, #818cf8); text-transform: uppercase; letter-spacing: 0.8px;">Subject Code</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = summaryHtml + tableHtml;
}


/* ==============================================================================
   CR MANAGEMENT SYSTEM (TEACHER PANEL)
============================================================================== */
function updateCRGroupOptions() {
  const sem = document.getElementById('crSem')?.value;
  const wrapper = document.getElementById('crGroupWrapper');
  const groupSel = document.getElementById('crGroup');
  if (!wrapper || !groupSel) return;

  const noGroupSems = ['1st Semester', '2nd Semester', '8th Semester'];
  if (noGroupSems.includes(sem)) {
    wrapper.style.display = 'none';
    groupSel.value = '';
  } else if (sem === '3rd Semester') {
    wrapper.style.display = '';
    groupSel.innerHTML = `
      <option value="A">Group A</option>
      <option value="B">Group B</option>
      <option value="Combined">Combined</option>`;
  } else {
    wrapper.style.display = '';
    groupSel.innerHTML = `
      <option value="Combined">Combined</option>
      <option value="A">Group A</option>
      <option value="B">Group B</option>`;
  }
}

async function loadStudentsForCR() {
  const dept = document.getElementById('crDept')?.value || 'All';
  const sel = document.getElementById('crStudentSel');
  if (!sel) return;

  try {
    const res = await fetch(`${API_BASE}/get-students/?department=${encodeURIComponent(dept)}`);
    const data = await res.json();
    if (data.status === 'success') {
      const students = data.data;
      sel.innerHTML = `<option value="">-- Select Student (${students.length} found) --</option>` +
        students.map(s => `<option value="${s.id}">${s.name || 'Unnamed'} (Roll: ${s.roll || '--'}, Sem: ${s.semester || '--'}, ${s.department || ''})</option>`).join('');
      if (!students.length) sel.innerHTML = '<option value="">No students found for selected filters</option>';
    }
  } catch (e) { sel.innerHTML = '<option value="">Error loading students</option>'; }
}

async function assignCR() {
  const student_id = document.getElementById('crStudentSel')?.value;
  const semester = document.getElementById('crSem')?.value;
  const group = document.getElementById('crGroup')?.value || '';
  const gender = document.getElementById('crGender')?.value;

  if (!student_id) { showToast('Please select a student first.', 'error'); return; }

  try {
    const res = await fetch(`${API_BASE}/cr/assign/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacher_email: getTeacherEmail(), student_id: parseInt(student_id), semester, group, gender })
    });
    const data = await res.json();
    if (data.status === 'success') {
      showToast(`✅ ${data.message}`);
      loadTeacherCRs();
    } else {
      showToast(data.message || 'Failed to assign CR.', 'error');
    }
  } catch (e) { showToast('An error occurred. Please try again.', 'error'); }
}

async function loadTeacherCRs() {
  const container = document.getElementById('teacherCRGrid');
  if (!container) return;

  container.innerHTML = '<div style="color:var(--muted);font-size:13px;grid-column:1/-1;">Loading CR roster...</div>';

  try {
    const res = await fetch(`${API_BASE}/cr/get/?include_pending=true`);
    const data = await res.json();

    if (data.status === 'success' && data.data.length) {
      container.innerHTML = data.data.map(cr => {
        const isPending = !cr.is_approved;
        const statusBadge = isPending
          ? `<span style="background:rgba(245,158,11,0.15); color:#f59e0b; font-size:11px; font-weight:800; padding:3px 10px; border-radius:12px;">â³ Pending Approval</span>`
          : `<span style="background:rgba(0,230,118,0.15); color:#00e676; font-size:11px; font-weight:800; padding:3px 10px; border-radius:12px;">✅ Official CR</span>`;

        const approveBtn = isPending ? `
          <button onclick="approveCR(${cr.id})" style="background:linear-gradient(135deg,#00e676,#00b0ff); color:#1a1d2e; border:none; padding:6px 14px; border-radius:8px; font-size:12px; font-weight:800; cursor:pointer;">
            <i class="fas fa-check"></i> Approve as CR
          </button>
        ` : '';

        return `
          <div style="background:rgba(255,255,255,0.03); border:${isPending ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border)'}; border-radius:14px; padding:18px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
              ${statusBadge}
              <button onclick="removeCR(${cr.id})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:13px;"><i class="fas fa-trash"></i> Remove</button>
            </div>
            <div style="font-size:16px; font-weight:700; color:var(--text);">${cr.name}</div>
            <div style="font-size:12px; color:var(--muted); margin-top:2px;">Roll: ${cr.roll} &bull; ${cr.department || 'CST'} &bull; Mobile: ${cr.mobile || 'N/A'}</div>
            <div style="font-size:12px; color:var(--accent); font-weight:700; margin-top:4px;">${cr.semester}${cr.group ? ` (Group ${cr.group})` : ''} &bull; ${cr.gender} CR</div>
            
            <div style="margin-top:12px; display:flex; justify-content:flex-end;">
              ${approveBtn}
            </div>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = '<div style="color:var(--muted);font-size:13px;grid-column:1/-1">No CR nominations or records found.</div>';
    }
  } catch (e) {
    container.innerHTML = '<div style="color:var(--muted);font-size:13px;grid-column:1/-1">Unable to load CR list.</div>';
  }
}

async function approveCR(crId) {
  if (!confirm('Approve this student as official Class Representative?')) return;
  try {
    const res = await fetch(`${API_BASE}/cr/approve/${crId}/`, { method: 'POST' });
    const data = await res.json();
    if (data.status === 'success') {
      showToast('✅ Student approved as official CR!');
      loadTeacherCRs();
    } else {
      showToast(data.message || 'Failed to approve CR.', 'error');
    }
  } catch (e) {
    showToast('Error approving CR.', 'error');
  }
}

async function removeCR(crId) {
  if (!confirm('Are you sure you want to remove this CR?')) return;
  try {
    await fetch(`${API_BASE}/cr/remove/${crId}/`, { method: 'POST' });
    loadTeacherCRs();
  } catch (e) {}
}

/* ==============================================================================
   MESSAGES & COMPLAINTS MANAGEMENT
============================================================================== */
let teacherMsgTab = 'inbox';

async function loadTeacherMessages(box) {
  teacherMsgTab = box || 'inbox';
  const container = document.getElementById('teacherMsgContainer');
  if (!container) return;

  const inboxBtn = document.getElementById('tMsgInboxBtn');
  const sentBtn = document.getElementById('tMsgSentBtn');
  if (inboxBtn && sentBtn) {
    if (box === 'inbox') {
      inboxBtn.style.background = 'linear-gradient(135deg,#6c8fff,#a78bfa)'; inboxBtn.style.color = '#fff';
      sentBtn.style.background = 'var(--input-bg)'; sentBtn.style.color = 'var(--muted)';
    } else {
      sentBtn.style.background = 'linear-gradient(135deg,#6c8fff,#a78bfa)'; sentBtn.style.color = '#fff';
      inboxBtn.style.background = 'var(--input-bg)'; inboxBtn.style.color = 'var(--muted)';
    }
  }

  container.innerHTML = '<div style="color:var(--muted);font-size:13px">Loading messages...</div>';
  try {
    const res = await fetch(`${API_BASE}/messages/?email=${encodeURIComponent(getTeacherEmail())}&box=${box}`);
    const data = await res.json();

    if (data.status === 'success' && data.data.length) {
      container.innerHTML = data.data.map(m => `
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:14px;padding:18px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <div>
              <span style="font-size:15px;font-weight:700;color:var(--text);">${m.subject}</span>
              <div style="font-size:12px;color:var(--muted);margin-top:2px">
                ${box==='inbox'? `From: <strong>${m.sender_name}</strong> (Student)` : `To: <strong>${m.receiver_name}</strong>`}
              </div>
            </div>
            <span style="font-size:11px;color:var(--muted)">${m.sent_at}</span>
          </div>
          <div style="font-size:14px;color:var(--text);line-height:1.6;margin-bottom:10px">${m.content}</div>
          ${m.replies.map(r => `
            <div style="margin-left:16px;border-left:3px solid #6c8fff;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:0 8px 8px 0;margin-bottom:6px;font-size:13px">
              <strong>${r.sender_name}:</strong> ${r.content}
            </div>
          `).join('')}
          <div style="display:flex;gap:8px;margin-top:10px">
            <input type="text" id="tReply-${m.id}" placeholder="Type reply..." style="flex:1;padding:8px 12px;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none">
            <button onclick="replyFromTeacher(${m.id}, 'tReply-${m.id}')" style="padding:8px 16px;background:linear-gradient(135deg,#6c8fff,#a78bfa);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">Send Reply</button>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px;">No messages found.</div>';
    }
  } catch (e) {}
}

async function replyFromTeacher(parentId, inputId) {
  const content = document.getElementById(inputId)?.value?.trim();
  if (!content) return;
  try {
    const res = await fetch(`${API_BASE}/messages/reply/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_email: getTeacherEmail(), parent_id: parentId, content })
    });
    const data = await res.json();
    if (data.status === 'success') {
      document.getElementById(inputId).value = '';
      loadTeacherMessages(teacherMsgTab);
      showToast('Reply sent!');
    }
  } catch (e) {}
}

async function loadTeacherComplaints() {
  const container = document.getElementById('teacherComplaintsContainer');
  if (!container) return;
  const filter = document.getElementById('tComplaintFilter')?.value || 'all';

  container.innerHTML = '<div style="color:var(--muted);font-size:13px">Loading complaints...</div>';
  try {
    const res = await fetch(`${API_BASE}/complaints/?email=${encodeURIComponent(getTeacherEmail())}`);
    const data = await res.json();

    if (data.status === 'success' && data.data.length) {
      let filtered = data.data;
      if (filter === 'pending') filtered = filtered.filter(c => !c.is_resolved);
      if (filter === 'resolved') filtered = filtered.filter(c => c.is_resolved);

      container.innerHTML = filtered.map(c => `
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:14px;padding:18px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;flex-wrap:wrap;gap:8px">
            <div>
              <span style="background:rgba(48,207,208,0.1);color:#30cfd0;font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px">${c.category || 'General'}</span>
              <span style="font-size:13px;font-weight:700;color:var(--accent);margin-left:8px"><i class="fas fa-user"></i> ${c.student_name} (Roll: ${c.student_roll})</span>
            </div>
            <span style="font-size:11px;color:var(--muted)">${c.submitted_at}</span>
          </div>
          <div style="font-size:14px;color:var(--text);line-height:1.6;margin-bottom:12px;background:rgba(0,0,0,0.2);padding:12px;border-radius:10px">${c.content}</div>
          ${c.response ? `
            <div style="background:rgba(67,233,123,0.08);border-left:3px solid #43e97b;padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;margin-top:8px">
              <strong style="color:#43e97b">Your Response:</strong> ${c.response}
            </div>
          ` : `
            <div style="display:flex;gap:8px;margin-top:10px">
              <input type="text" id="cResp-${c.id}" placeholder="Type official response..." style="flex:1;padding:8px 12px;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none">
              <button onclick="respondToComplaint(${c.id}, 'cResp-${c.id}')" style="padding:8px 16px;background:linear-gradient(135deg,#30cfd0,#667eea);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">Send Response</button>
            </div>
          `}
        </div>
      `).join('');
    } else {
      container.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px;">No complaints submitted.</div>';
    }
  } catch (e) {}
}

async function respondToComplaint(complaintId, inputId) {
  const responseText = document.getElementById(inputId)?.value?.trim();
  if (!responseText) return;

  try {
    const res = await fetch(`${API_BASE}/complaints/respond/${complaintId}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacher_email: getTeacherEmail(), response: responseText })
    });
    const data = await res.json();
    if (data.status === 'success') {
      showToast('Response sent!');
      loadTeacherComplaints();
    }
  } catch (e) {}
}

// Window bindings
window.openEditNoticeModal = openEditNoticeModal;
window.closeEditNoticeModal = closeEditNoticeModal;
window.saveNoticeEdit = saveNoticeEdit;
window.loadTeacherBooks = loadTeacherBooks;
window.updateCRGroupOptions = updateCRGroupOptions;
window.loadStudentsForCR = loadStudentsForCR;
window.assignCR = assignCR;
window.loadTeacherCRs = loadTeacherCRs;
window.approveCR = approveCR;
window.removeCR = removeCR;
window.loadTeacherMessages = loadTeacherMessages;
window.replyFromTeacher = replyFromTeacher;
window.loadTeacherComplaints = loadTeacherComplaints;
window.respondToComplaint = respondToComplaint;



