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
