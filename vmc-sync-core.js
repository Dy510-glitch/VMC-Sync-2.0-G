// ==========================================
// VMC SYNC - Shared Data & Sync Engine
// ==========================================

const STORAGE_KEYS = {
  BANNER: 'vmc_campus_banner',
  ANNOUNCEMENTS: 'vmc_announcements',
  CAMPUS_STATUS: 'vmc_campus_status',
  EVENTS: 'vmc_upcoming_events'
};

// --- DEFAULT SEED DATA ---
function seedDefaultData() {
  if (!localStorage.getItem(STORAGE_KEYS.BANNER)) {
    localStorage.setItem(STORAGE_KEYS.BANNER, 'Welcome to VMC SYNC — Midterm Examinations schedule updated below.');
  }
  if (!localStorage.getItem(STORAGE_KEYS.CAMPUS_STATUS)) {
    localStorage.setItem(STORAGE_KEYS.CAMPUS_STATUS, JSON.stringify({
      status: '🟢 Normal Operations',
      note: 'All regular classes and campus administrative services operating on schedule.',
      updatedAt: '08:00 AM'
    }));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify([
      {
        id: 'post_1',
        title: 'Midterm Examination Schedule AY 2026-2027',
        category: 'Academics',
        content: 'Please check your portal accounts for individual exam room assignments and schedules.',
        date: 'SEP 25, 2026'
      },
      {
        id: 'post_2',
        title: 'Annual Campus Cultural Festival Launch',
        category: 'Events',
        content: 'Registration for booth activities and stage performances is now open at the Student Council office.',
        date: 'SEP 20, 2026'
      }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([
      {
        id: 'evt_1',
        title: 'VMC Sports Fest 2026',
        date: '2026-10-15',
        location: 'Main Gymnasium / Quadrangle',
        description: 'Inter-department sports tournament and cheer dance competition.'
      },
      {
        id: 'evt_2',
        title: 'Information Systems Seminar Series',
        date: '2026-10-22',
        location: 'VMC Auditorium',
        description: 'Industry insights on cloud infrastructure and web app deployment.'
      }
    ]));
  }
}

// --- ADMIN SIDE ACTIONS ---

function publishBanner() {
  const inputEl = document.getElementById('admin-banner-input');
  if (!inputEl) return;
  const text = inputEl.value.trim();
  if (!text) return;

  localStorage.setItem(STORAGE_KEYS.BANNER, text);
  notifyDataChanged();
  alert('Urgent banner updated successfully!');
}

function clearBanner() {
  localStorage.removeItem(STORAGE_KEYS.BANNER);
  const inputEl = document.getElementById('admin-banner-input');
  if (inputEl) inputEl.value = '';
  notifyDataChanged();
  alert('Urgent banner cleared!');
}

function handleAnnouncementSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('announcement-title').value;
  const category = document.getElementById('announcement-category').value;
  const content = document.getElementById('announcement-content').value;

  const newPost = {
    id: 'post_' + Date.now(),
    title,
    category,
    content,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
  };

  const existingPosts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) || [];
  existingPosts.unshift(newPost);

  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(existingPosts));
  document.getElementById('admin-announcement-form').reset();
  notifyDataChanged();
  alert('Announcement published to Student UI!');
}

function deleteAnnouncement(id) {
  let existingPosts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) || [];
  existingPosts = existingPosts.filter(post => post.id !== id);
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(existingPosts));
  notifyDataChanged();
}

function updateCampusStatus() {
  const selectEl = document.getElementById('campus-status-select');
  const noteEl = document.getElementById('campus-status-note');
  if (!selectEl) return;

  const status = selectEl.value;
  const note = noteEl ? noteEl.value.trim() : '';

  const statusData = {
    status: status,
    note: note || 'No additional details provided.',
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  localStorage.setItem(STORAGE_KEYS.CAMPUS_STATUS, JSON.stringify(statusData));
  notifyDataChanged();
  alert('Campus Status updated!');
}

function handleEventSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('event-title').value;
  const date = document.getElementById('event-date').value;
  const location = document.getElementById('event-location').value;
  const description = document.getElementById('event-description').value;

  const newEvent = {
    id: 'evt_' + Date.now(),
    title,
    date,
    location,
    description
  };

  const existingEvents = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
  existingEvents.push(newEvent);
  existingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(existingEvents));
  document.getElementById('admin-event-form').reset();
  notifyDataChanged();
  alert('Event added successfully!');
}

function deleteEvent(id) {
  let events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
  events = events.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  notifyDataChanged();
}

// --- RENDERING ENGINE ---

function loadUserBanner() {
  const bannerContainer = document.getElementById('admin-banner-container');
  const bannerText = document.getElementById('banner-text');
  const savedBanner = localStorage.getItem(STORAGE_KEYS.BANNER);

  if (savedBanner && bannerContainer && bannerText) {
    bannerText.textContent = savedBanner;
    bannerContainer.style.display = 'block';
  } else if (bannerContainer) {
    bannerContainer.style.display = 'none';
  }
}

function loadUserAnnouncements() {
  const container = document.getElementById('announcements-list');
  const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) || [];

  if (container) {
    if (posts.length === 0) {
      container.innerHTML = '<p class="empty-msg">No announcements at this time.</p>';
    } else {
      container.innerHTML = posts.map(post => `
        <article class="feed-card" id="${post.id}">
          <div class="card-header">
            <span class="badge ${post.category.toLowerCase()}">${post.category}</span>
            <span class="post-date">${post.date}</span>
          </div>
          <h3>${escapeHTML(post.title)}</h3>
          <p>${escapeHTML(post.content)}</p>
        </article>
      `).join('');
    }
  }

  renderAdminAnnouncementsList(posts);
}

function renderAdminAnnouncementsList(posts) {
  const adminContainer = document.getElementById('admin-posts-list');
  if (!adminContainer) return;

  const data = posts || JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) || [];
  if (data.length === 0) {
    adminContainer.innerHTML = '<p>No posted announcements.</p>';
    return;
  }

  adminContainer.innerHTML = data.map(post => `
    <div class="admin-item-row">
      <span><strong>[${post.category}] ${escapeHTML(post.title)}</strong> (${post.date})</span>
      <button onclick="deleteAnnouncement('${post.id}')" class="btn-danger">Delete</button>
    </div>
  `).join('');
}

function loadCampusStatus() {
  const savedData = localStorage.getItem(STORAGE_KEYS.CAMPUS_STATUS);
  if (!savedData) return;

  const statusData = JSON.parse(savedData);
  const titleEl = document.getElementById('status-title');
  const noteEl = document.getElementById('status-note');
  const dotEl = document.getElementById('status-dot');

  if (titleEl) titleEl.textContent = statusData.status;
  if (noteEl) noteEl.textContent = statusData.note;

  if (dotEl) {
    if (statusData.status.includes('Suspended')) dotEl.textContent = '🔴';
    else if (statusData.status.includes('Online')) dotEl.textContent = '🟡';
    else if (statusData.status.includes('Exam')) dotEl.textContent = '🔵';
    else dotEl.textContent = '🟢';
  }
}

function loadUpcomingEvents() {
  const container = document.getElementById('upcoming-events-container');
  const adminContainer = document.getElementById('admin-events-list');
  const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];

  if (container) {
    if (events.length === 0) {
      container.innerHTML = '<p class="empty-msg">No upcoming events scheduled right now.</p>';
    } else {
      container.innerHTML = events.map(evt => `
        <div class="event-card">
          <div class="event-date-badge">📅 ${evt.date}</div>
          <h3>${escapeHTML(evt.title)}</h3>
          <p class="event-loc"><strong>📍 Location:</strong> ${escapeHTML(evt.location)}</p>
          <p>${escapeHTML(evt.description)}</p>
        </div>
      `).join('');
    }
  }

  if (adminContainer) {
    if (events.length === 0) {
      adminContainer.innerHTML = '<p>No posted events.</p>';
    } else {
      adminContainer.innerHTML = events.map(evt => `
        <div class="admin-item-row">
          <span><strong>${escapeHTML(evt.title)}</strong> (${evt.date} @ ${escapeHTML(evt.location)})</span>
          <button onclick="deleteEvent('${evt.id}')" class="btn-danger">Delete</button>
        </div>
      `).join('');
    }
  }
}

// --- UTILITIES & BROADCAST LISTENERS ---

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function notifyDataChanged() {
  window.dispatchEvent(new Event('vmcDataUpdated'));
}

function refreshAllViews() {
  loadUserBanner();
  loadUserAnnouncements();
  loadCampusStatus();
  loadUpcomingEvents();
}

window.addEventListener('storage', refreshAllViews);
window.addEventListener('vmcDataUpdated', refreshAllViews);

document.addEventListener('DOMContentLoaded', () => {
  seedDefaultData();
  refreshAllViews();
});

/* ==========================================================================
   COMMUNITY CHAT, LOST & FOUND, AND WEBRTC VIDEO ENGINE
   (Requires socket.io CDN included in index.html)
   ========================================================================== */

// 1. SOCKET.IO REAL-TIME CONNECTIVITY
let socket;
if (typeof io !== 'undefined') {
  socket = io('http://localhost:3000'); // Replace with your Node server URL

  socket.on('receive_group_message', (data) => {
    appendChatMessage(data);
  });

  socket.on('incoming_video_call', (data) => {
    handleIncomingCall(data);
  });

  socket.on('admin_audit_event', (eventData) => {
    logAdminAudit(eventData);
  });
}

// 2. CHAT FUNCTIONS
function joinChatRoom(roomName) {
  if (!socket) return;
  socket.emit('join_room', { room: roomName, user: getCurrentUser() });
}

function sendGroupMessage() {
  const input = document.getElementById('chat-message-input');
  if (!input || !input.value.trim()) return;

  const msgData = {
    sender: getCurrentUser(),
    room: 'General-Student-Lounge',
    text: input.value.trim(),
    timestamp: new Date().toLocaleTimeString()
  };

  socket.emit('send_group_message', msgData);
  input.value = '';
}

function appendChatMessage(data) {
  const chatWindow = document.getElementById('chat-window-messages');
  if (!chatWindow) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-bubble';
  msgDiv.innerHTML = `<strong>${escapeHTML(data.sender)}:</strong> ${escapeHTML(data.text)} <small>${data.timestamp}</small>`;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 3. WEBRTC VIDEO CALL SIGNALLING
let localStream;
let peerConnection;
const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

async function startVideoCall(targetUser) {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('local-video').srcObject = localStream;

    peerConnection = new RTCPeerConnection(rtcConfig);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', { target: targetUser, candidate: event.candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      document.getElementById('remote-video').srcObject = event.streams[0];
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit('video_call_offer', { target: targetUser, offer: offer, caller: getCurrentUser() });
    alert(`Calling ${targetUser}...`);
  } catch (err) {
    console.error('Failed to access camera/microphone:', err);
  }
}

function getCurrentUser() {
  return localStorage.getItem('vmc_student_name') || 'Student_' + Math.floor(Math.random() * 1000);
}

function logAdminAudit(event) {
  const auditLog = document.getElementById('admin-chat-audit-log');
  if (auditLog) {
    const entry = document.createElement('div');
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${event.type}: ${event.details}`;
    auditLog.appendChild(entry);
  }
}

/* ==========================================================================
   STUDENT TOOLKIT & LOST AND FOUND CORE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderSchedule();
  renderLostFoundItems();
  initCountdownTimer();
});

// 1. TOOLKIT TAB SWITCHING
function switchToolkitTab(tabId) {
  document.querySelectorAll('.toolkit-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.toolkit-tab-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`tab-${tabId}`).style.display = 'block';
  event.currentTarget.classList.add('active');
}

// 2. GPA CALCULATOR LOGIC
function addGpaRow() {
  const tbody = document.getElementById('gpa-course-rows');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" placeholder="Course Code" class="input-field course-name"></td>
    <td><input type="number" value="3" min="1" max="6" class="input-field course-units"></td>
    <td><input type="number" value="85" min="0" max="100" class="input-field course-grade"></td>
    <td><button class="btn-danger-sm" onclick="removeGpaRow(this)">Remove</button></td>
  `;
  tbody.appendChild(tr);
}

function removeGpaRow(btn) {
  const row = btn.closest('tr');
  if (document.querySelectorAll('#gpa-course-rows tr').length > 1) {
    row.remove();
  }
}

function calculateGPA() {
  const units = document.querySelectorAll('.course-units');
  const grades = document.querySelectorAll('.course-grade');

  let totalUnits = 0;
  let weightedSum = 0;

  for (let i = 0; i < units.length; i++) {
    const u = parseFloat(units[i].value) || 0;
    const g = parseFloat(grades[i].value) || 0;
    totalUnits += u;
    weightedSum += (u * g);
  }

  const resultBox = document.getElementById('gpa-result-box');
  if (totalUnits === 0) {
    resultBox.style.display = 'block';
    resultBox.textContent = 'Please enter valid unit values.';
    return;
  }

  const gpaPercent = (weightedSum / totalUnits).toFixed(2);
  resultBox.style.display = 'block';
  resultBox.innerHTML = `Weighted Percentage Average: <strong>${gpaPercent}%</strong> (Total Units: ${totalUnits})`;
}

// 3. SCHEDULE PLANNER LOGIC
function addScheduleEntry(e) {
  e.preventDefault();
  const subject = document.getElementById('sched-subject').value;
  const day = document.getElementById('sched-day').value;
  const start = document.getElementById('sched-time-start').value;
  const end = document.getElementById('sched-time-end').value;
  const room = document.getElementById('sched-room').value;

  const schedules = JSON.parse(localStorage.getItem('vmc_schedules') || '[]');
  schedules.push({ id: Date.now(), subject, day, start, end, room });
  localStorage.setItem('vmc_schedules', JSON.stringify(schedules));

  document.getElementById('schedule-form').reset();
  renderSchedule();
}

function renderSchedule() {
  const container = document.getElementById('schedule-list');
  if (!container) return;
  const schedules = JSON.parse(localStorage.getItem('vmc_schedules') || '[]');

  if (schedules.length === 0) {
    container.innerHTML = '<p>No classes added yet.</p>';
    return;
  }

  container.innerHTML = schedules.map(item => `
    <div class="lf-card">
      <span class="badge badge-found">${escapeHTML(item.day)}</span>
      <h4>${escapeHTML(item.subject)}</h4>
      <p>🕒 ${escapeHTML(item.start)} - ${escapeHTML(item.end)}</p>
      <p>📍 Room: ${escapeHTML(item.room)}</p>
      <button class="btn-danger-sm" style="margin-top:8px;" onclick="deleteSchedule(${item.id})">Delete</button>
    </div>
  `).join('');
}

function deleteSchedule(id) {
  let schedules = JSON.parse(localStorage.getItem('vmc_schedules') || '[]');
  schedules = schedules.filter(s => s.id !== id);
  localStorage.setItem('vmc_schedules', JSON.stringify(schedules));
  renderSchedule();
}

// 4. LOST AND FOUND HUB LOGIC
let activeLfFilter = 'ALL';

function openLostFoundModal() { document.getElementById('lostfound-modal').style.display = 'flex'; }
function closeLostFoundModal() { document.getElementById('lostfound-modal').style.display = 'none'; }

function submitLostFoundItem(e) {
  e.preventDefault();
  const type = document.getElementById('lf-type').value;
  const title = document.getElementById('lf-title').value;
  const location = document.getElementById('lf-location').value;
  const contact = document.getElementById('lf-contact').value;
  const desc = document.getElementById('lf-desc').value;

  const newItem = {
    id: Date.now(),
    type,
    title,
    location,
    contact,
    desc,
    datePosted: new Date().toLocaleDateString()
  };

  const items = JSON.parse(localStorage.getItem('vmc_lostfound_items') || '[]');
  items.unshift(newItem);
  localStorage.setItem('vmc_lostfound_items', JSON.stringify(items));

  closeLostFoundModal();
  renderLostFoundItems();

  // Notify backend if socket exists (so Admin monitoring log receives live updates)
  if (typeof socket !== 'undefined' && socket) {
    socket.emit('send_group_message', {
      room: 'Admin-Audit',
      sender: 'SYSTEM',
      text: `[Lost & Found] New ${type} post: ${title}`
    });
  }
}

function filterLostFound(type, btn) {
  activeLfFilter = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderLostFoundItems();
}

function renderLostFoundItems() {
  const container = document.getElementById('lostfound-items-container');
  if (!container) return;

  let items = JSON.parse(localStorage.getItem('vmc_lostfound_items') || '[]');

  if (activeLfFilter !== 'ALL') {
    items = items.filter(item => item.type === activeLfFilter);
  }

  if (items.length === 0) {
    container.innerHTML = '<p>No items posted under this view.</p>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="lf-card">
      <span class="badge ${item.type === 'LOST' ? 'badge-lost' : 'badge-found'}">${item.type}</span>
      <small style="float:right; color:#718096;">${item.datePosted}</small>
      <h4 style="margin: 6px 0;">${escapeHTML(item.title)}</h4>
      <p style="font-size:13px;">📍 <strong>Location:</strong> ${escapeHTML(item.location)}</p>
      <p style="font-size:13px; color:#4a5568; margin: 8px 0;">${escapeHTML(item.desc)}</p>
      <p style="font-size:12px; color:#2b6cb0;">📞 <strong>Contact:</strong> ${escapeHTML(item.contact)}</p>
    </div>
  `).join('');
}

function escapeHTML(str) {
  return str ? str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  ) : '';
}

/* ==========================================================================
   STUDENT TOOLKIT - CREATIVE & PRODUCTIVITY APPS DIRECTORY
   ========================================================================== */

const studentAppsData = [
  // DOCUMENT TOOLS
  {
    id: 'google-docs',
    title: 'Google Docs',
    category: 'DOCS',
    categoryLabel: 'Documents',
    badgeClass: 'badge-doc',
    icon: '📄',
    desc: 'Real-time collaborative word processor for essays, reports, and assignments.',
    url: 'https://docs.google.com'
  },
  {
    id: 'word-online',
    title: 'Microsoft Word',
    category: 'DOCS',
    categoryLabel: 'Documents',
    badgeClass: 'badge-doc',
    icon: '📝',
    desc: 'Free web version of MS Word for academic writing and document formatting.',
    url: 'https://www.microsoft365.com/launch/word'
  },

  // PRESENTATION TOOLS
  {
    id: 'google-slides',
    title: 'Google Slides',
    category: 'SLIDES',
    categoryLabel: 'Presentations',
    badgeClass: 'badge-slides',
    icon: '📊',
    desc: 'Build team slide decks and online presentations for class projects.',
    url: 'https://slides.google.com'
  },
  {
    id: 'canva-slides',
    title: 'Canva Presentations',
    category: 'SLIDES',
    categoryLabel: 'Presentations',
    badgeClass: 'badge-slides',
    icon: '✨',
    desc: 'Design polished, professional pitch decks with thousands of ready templates.',
    url: 'https://www.canva.com/presentations/'
  },

  // PHOTO EDITING TOOLS
  {
    id: 'photopea',
    title: 'Photopea Editor',
    category: 'PHOTO',
    categoryLabel: 'Photo Editing',
    badgeClass: 'badge-photo',
    icon: '🎨',
    desc: 'Advanced web-based image editor supporting PSD, AI, and Sketch formats.',
    url: 'https://www.photopea.com'
  },
  {
    id: 'pixlr-express',
    title: 'Pixlr Express',
    category: 'PHOTO',
    categoryLabel: 'Photo Editing',
    badgeClass: 'badge-photo',
    icon: '🖼️',
    desc: 'Quick online photo editing, filters, background removal, and touch-ups.',
    url: 'https://pixlr.com'
  },

  // VIDEO EDITING TOOLS
  {
    id: 'capcut-web',
    title: 'CapCut Web',
    category: 'VIDEO',
    categoryLabel: 'Video Editing',
    badgeClass: 'badge-video',
    icon: '🎬',
    desc: 'Online video editor with automatic captions, transitions, and filters.',
    url: 'https://www.capcut.com/editor'
  },
  {
    id: 'clipchamp',
    title: 'Clipchamp',
    category: 'VIDEO',
    categoryLabel: 'Video Editing',
    badgeClass: 'badge-video',
    icon: '🎥',
    desc: 'Easy-to-use video creator with screen recording and timeline editing.',
    url: 'https://clipchamp.com'
  }
];

let activeAppFilter = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
  renderAppHub();
});

function switchToolkitTab(tabId, btnElement) {
  document.querySelectorAll('.toolkit-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.toolkit-tab-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`tab-${tabId}`).style.display = 'block';
  if (btnElement) {
    btnElement.classList.add('active');
  }
}

function filterApps(category, btnElement) {
  activeAppFilter = category;
  document.querySelectorAll('.app-chip').forEach(chip => chip.classList.remove('active'));
  if (btnElement) {
    btnElement.classList.add('active');
  }
  renderAppHub();
}

function renderAppHub() {
  const container = document.getElementById('apps-grid-container');
  if (!container) return;

  let apps = studentAppsData;
  if (activeAppFilter !== 'ALL') {
    apps = studentAppsData.filter(app => app.category === activeAppFilter);
  }

  if (apps.length === 0) {
    container.innerHTML = '<p style="color:#718096;">No tools available under this category.</p>';
    return;
  }

  container.innerHTML = apps.map(app => `
    <div class="app-card">
      <div>
        <div class="app-card-header">
          <div class="app-icon-wrapper">${app.icon}</div>
          <div>
            <h4 class="app-card-title">${escapeHTML(app.title)}</h4>
            <span class="app-badge ${app.badgeClass}">${app.categoryLabel}</span>
          </div>
        </div>
        <p class="app-card-desc">${escapeHTML(app.desc)}</p>
      </div>
      <a href="${app.url}" target="_blank" rel="noopener noreferrer" class="btn-launch-app">
        Open Tool ↗
      </a>
    </div>
  `).join('');
}
