// ==========================================
// VMC SYNC - Shared Data & Sync Engine
// ==========================================

// Keys for Storage
const STORAGE_KEYS = {
  BANNER: 'vmc_campus_banner',
  ANNOUNCEMENTS: 'vmc_announcements'
};

// --- ADMIN SIDE FUNCTIONS ---

// 1. Publish Urgent Banner
function publishBanner() {
  const text = document.getElementById('admin-banner-input').value.trim();
  if (!text) return;
  
  localStorage.setItem(STORAGE_KEYS.BANNER, text);
  notifyDataChanged();
  alert('Banner updated!');
}

function clearBanner() {
  localStorage.removeItem(STORAGE_KEYS.BANNER);
  notifyDataChanged();
}

// 2. Publish New Announcement
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
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  const existingPosts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) || [];
  existingPosts.unshift(newPost); // Add to top

  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(existingPosts));
  
  // Reset form & trigger update
  document.getElementById('admin-announcement-form').reset();
  notifyDataChanged();
  renderAdminList();
}

// 3. Delete Announcement
function deleteAnnouncement(id) {
  let existingPosts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) || [];
  existingPosts = existingPosts.filter(post => post.id !== id);
  
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(existingPosts));
  notifyDataChanged();
  renderAdminList();
}


// --- USER SIDE FUNCTIONS ---

// 1. Render Banner on UI
function loadUserBanner() {
  const bannerContainer = document.getElementById('admin-banner-container');
  const bannerText = document.getElementById('banner-text');
  const savedBanner = localStorage.getItem(STORAGE_KEYS.BANNER);

  if (savedBanner && bannerContainer && bannerText) {
    bannerText.textContent = savedBanner;
    bannerContainer.classList.remove('hidden');
  } else if (bannerContainer) {
    bannerContainer.classList.add('hidden');
  }
}

// 2. Render Feed Posts on UI
function loadUserAnnouncements() {
  const container = document.getElementById('announcements-list');
  if (!container) return;

  const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) || [];

  if (posts.length === 0) {
    container.innerHTML = '<p class="empty-msg">No announcements at this time.</p>';
    return;
  }

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

// Render Admin Management List
function renderAdminList() {
  const adminContainer = document.getElementById('admin-posts-list');
  if (!adminContainer) return;

  const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) || [];
  
  adminContainer.innerHTML = posts.map(post => `
    <div class="admin-item-row">
      <span><strong>${escapeHTML(post.title)}</strong> (${post.category})</span>
      <button onclick="deleteAnnouncement('${post.id}')" class="btn-delete">Delete</button>
    </div>
  `).join('');
}


// --- REAL-TIME CONNECTOR & LISTENERS ---

// Trigger custom sync event for same window updates
function notifyDataChanged() {
  window.dispatchEvent(new Event('vmcDataUpdated'));
}

// Global UI refresh listener
function refreshAllViews() {
  loadUserBanner();
  loadUserAnnouncements();
  renderAdminList();
}

// Helper function to prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Listen for updates across different browser tabs or windows
window.addEventListener('storage', refreshAllViews);

// Listen for updates within the same browser tab
window.addEventListener('vmcDataUpdated', refreshAllViews);

// Initialize on load
document.addEventListener('DOMContentLoaded', refreshAllViews);

// Add new keys to STORAGE_KEYS
const STORAGE_KEYS = {
  BANNER: 'vmc_campus_banner',
  ANNOUNCEMENTS: 'vmc_announcements',
  CAMPUS_STATUS: 'vmc_campus_status',
  EVENTS: 'vmc_upcoming_events'
};

// ==========================================
// 1. CAMPUS STATUS LOGIC
// ==========================================

function updateCampusStatus() {
  const status = document.getElementById('campus-status-select').value;
  const note = document.getElementById('campus-status-note').value.trim();

  const statusData = {
    status,
    note: note || 'No additional notes provided.',
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  localStorage.setItem(STORAGE_KEYS.CAMPUS_STATUS, JSON.stringify(statusData));
  notifyDataChanged();
  alert('Campus Status Updated!');
}

function loadCampusStatus() {
  const statusData = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPUS_STATUS));
  const titleEl = document.getElementById('status-title');
  const noteEl = document.getElementById('status-note');
  const dotEl = document.getElementById('status-dot');

  if (!statusData || !titleEl) return;

  titleEl.textContent = statusData.status;
  noteEl.textContent = statusData.note;

  // Change dot icon based on status
  if (statusData.status.includes('Suspended')) dotEl.textContent = '🔴';
  else if (statusData.status.includes('Online')) dotEl.textContent = '🟡';
  else if (statusData.status.includes('Exam')) dotEl.textContent = '🔵';
  else dotEl.textContent = '🟢';
}


// ==========================================
// 2. UPCOMING EVENTS LOGIC
// ==========================================

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

  // Sort chronologically by date
  existingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(existingEvents));

  document.getElementById('admin-event-form').reset();
  notifyDataChanged();
}

function deleteEvent(id) {
  let events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
  events = events.filter(e => e.id !== id);

  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  notifyDataChanged();
}

function loadUpcomingEvents() {
  const container = document.getElementById('upcoming-events-container');
  const adminContainer = document.getElementById('admin-events-list');

  const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];

  // Render on Main Student UI
  if (container) {
    if (events.length === 0) {
      container.innerHTML = '<p class="empty-msg">No upcoming events scheduled right now.</p>';
    } else {
      container.innerHTML = events.map(evt => `
        <div class="event-card">
          <div class="event-date-badge">📅 ${evt.date}</div>
          <h3>${escapeHTML(evt.title)}</h3>
          <p><strong>📍 Location:</strong> ${escapeHTML(evt.location)}</p>
          <p>${escapeHTML(evt.description)}</p>
        </div>
      `).join('');
    }
  }

  // Render on Admin UI for management
  if (adminContainer) {
    if (events.length === 0) {
      adminContainer.innerHTML = '<p>No posted events.</p>';
    } else {
      adminContainer.innerHTML = events.map(evt => `
        <div class="admin-item-row">
          <span><strong>${escapeHTML(evt.title)}</strong> (${evt.date})</span>
          <button onclick="deleteEvent('${evt.id}')" class="btn-delete">Remove</button>
        </div>
      `).join('');
    }
  }
}

// Update the global refresh function to load the new modules
function refreshAllViews() {
  if (typeof loadUserBanner === 'function') loadUserBanner();
  if (typeof loadUserAnnouncements === 'function') loadUserAnnouncements();
  loadCampusStatus();
  loadUpcomingEvents();
}
