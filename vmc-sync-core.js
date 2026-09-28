/* ==========================================================================
   VMC SYNC - CORE ENGINE
   ========================================================================== */

// 1. PRODUCTIVITY & CREATIVE APPS DATASET
const studentAppsData = [
  { id: 'gdocs', title: 'Google Docs', category: 'DOCS', icon: '📄', url: 'https://docs.google.com' },
  { id: 'msword', title: 'MS Word Web', category: 'DOCS', icon: '📝', url: 'https://www.microsoft365.com/launch/word' },
  { id: 'gslides', title: 'Google Slides', category: 'SLIDES', icon: '📊', url: 'https://slides.google.com' },
  { id: 'canva', title: 'Canva Presentations', category: 'SLIDES', icon: '✨', url: 'https://www.canva.com' },
  { id: 'photopea', title: 'Photopea Editor', category: 'PHOTO', icon: '🎨', url: 'https://www.photopea.com' },
  { id: 'pixlr', title: 'Pixlr Express', category: 'PHOTO', icon: '🖼️', url: 'https://pixlr.com' },
  { id: 'capcut', title: 'CapCut Web', category: 'VIDEO', icon: '🎬', url: 'https://www.capcut.com/editor' },
  { id: 'clipchamp', title: 'Clipchamp', category: 'VIDEO', icon: '🎥', url: 'https://clipchamp.com' }
];

let activeAppFilter = 'ALL';
let activeFeedFilter = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
  renderAppHub();
  renderSchedule();
  renderMainFeed();
});

// 2. NAVIGATION: HOME RESET FUNCTION
function resetFeedToHome() {
  // Close any open modals
  closePostModal();

  // Reset feed filter state to 'ALL'
  activeFeedFilter = 'ALL';

  // Update filter UI buttons state
  const filterBtns = document.querySelectorAll('.feed-filter-btn');
  filterBtns.forEach(btn => btn.classList.remove('active'));
  
  const allBtn = document.getElementById('feed-filter-all');
  if (allBtn) {
    allBtn.classList.add('active');
  }

  // Clear search input if present
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.value = '';
  }

  // Re-render feed stream
  renderMainFeed();

  // Smooth scroll to top of page/feed
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// 3. TOOLKIT TABS SWITCHER
function switchToolkitTab(tabId, btnElement) {
  document.querySelectorAll('.toolkit-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.toolkit-tab-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`tab-${tabId}`).style.display = 'block';
  if (btnElement) btnElement.classList.add('active');
}

// 4. APPS DIRECTORY RENDERER
function filterApps(category, btnElement) {
  activeAppFilter = category;
  document.querySelectorAll('.app-chip').forEach(c => c.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  renderAppHub();
}

function renderAppHub() {
  const container = document.getElementById('apps-grid-container');
  if (!container) return;

  let apps = studentAppsData;
  if (activeAppFilter !== 'ALL') {
    apps = studentAppsData.filter(app => app.category === activeAppFilter);
  }

  container.innerHTML = apps.map(app => `
    <div class="app-card-mini">
      <div class="app-card-left">
        <span class="app-icon">${app.icon}</span>
        <div>
          <h5 class="app-title">${escapeHTML(app.title)}</h5>
          <span class="app-category">${app.category}</span>
        </div>
      </div>
      <a href="${app.url}" target="_blank" rel="noopener noreferrer" class="btn-app-launch">Open ↗</a>
    </div>
  `).join('');
}

// 5. GPA CALCULATOR LOGIC
function addGpaRow() {
  const tbody = document.getElementById('gpa-course-rows');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" placeholder="Course" class="input-field course-name"></td>
    <td><input type="number" value="3" min="1" max="6" class="input-field course-units"></td>
    <td><input type="number" value="85" min="0" max="100" class="input-field course-grade"></td>
    <td><button class="btn-danger-xs" onclick="removeGpaRow(this)">✕</button></td>
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
    resultBox.textContent = 'Please enter valid course units.';
    return;
  }

  const gpa = (weightedSum / totalUnits).toFixed(2);
  resultBox.style.display = 'block';
  resultBox.innerHTML = `Average: <strong>${gpa}%</strong> (${totalUnits} Units)`;
}

// 6. SCHEDULE PLANNER LOGIC
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
    container.innerHTML = '<p style="font-size:11px; color:#65676b;">No classes added yet.</p>';
    return;
  }

  container.innerHTML = schedules.map(s => `
    <div style="background:#f0f2f5; padding:6px; border-radius:4px; margin-top:6px; font-size:11px;">
      <strong>${escapeHTML(s.subject)}</strong> (${s.day})
      <br>🕒 ${escapeHTML(s.start)} - ${escapeHTML(s.end)} | 📍 ${escapeHTML(s.room)}
      <button class="btn-danger-xs" style="float:right;" onclick="deleteSchedule(${s.id})">✕</button>
    </div>
  `).join('');
}

function deleteSchedule(id) {
  let schedules = JSON.parse(localStorage.getItem('vmc_schedules') || '[]');
  schedules = schedules.filter(s => s.id !== id);
  localStorage.setItem('vmc_schedules', JSON.stringify(schedules));
  renderSchedule();
}

// 7. MAIN POST CREATOR & FEED SYSTEM
function openPostModal(defaultType = 'DISCUSSION') {
  document.getElementById('create-post-modal').style.display = 'flex';
  const typeSelect = document.getElementById('post-type');
  if (typeSelect) {
    typeSelect.value = defaultType;
    togglePostTypeFields(defaultType);
  }
}

function closePostModal() {
  document.getElementById('create-post-modal').style.display = 'none';
}

function togglePostTypeFields(type) {
  const extra = document.getElementById('lostfound-extra-fields');
  if (extra) extra.style.display = type === 'LOSTFOUND' ? 'block' : 'none';
}

function handleCreatePost(e) {
  e.preventDefault();

  const type = document.getElementById('post-type').value;
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;

  const newPost = {
    id: Date.now(),
    type: type,
    author: 'Student Account',
    timestamp: 'Just now',
    title: title,
    content: content,
    likes: 0
  };

  if (type === 'LOSTFOUND') {
    newPost.status = document.getElementById('post-lf-status').value;
    newPost.location = document.getElementById('post-lf-location').value;
    newPost.contact = document.getElementById('post-lf-contact').value;
  }

  const posts = JSON.parse(localStorage.getItem('vmc_campus_posts') || '[]');
  posts.unshift(newPost);
  localStorage.setItem('vmc_campus_posts', JSON.stringify(posts));

  closePostModal();
  renderMainFeed();
}

function filterMainFeed(filter, btn) {
  activeFeedFilter = filter;
  document.querySelectorAll('.feed-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMainFeed();
}

function renderMainFeed() {
  const container = document.getElementById('campus-main-feed');
  if (!container) return;

  let posts = JSON.parse(localStorage.getItem('vmc_campus_posts') || '[]');

  if (activeFeedFilter !== 'ALL') {
    posts = posts.filter(p => p.type === activeFeedFilter);
  }

  if (posts.length === 0) {
    container.innerHTML = `
      <div class="post-card" style="text-align:center; color:#65676b;">
        <p>No VMC SYNC posts yet. Be the first to start a conversation!</p>
      </div>`;
    return;
  }

  container.innerHTML = posts.map(post => `
    <div class="post-card">
      <div class="post-header">
        <div class="creator-header">
          <div class="avatar-placeholder">🎓</div>
          <div class="post-author-info">
            <h4>${escapeHTML(post.author)}</h4>
            <span class="post-time">${post.timestamp}</span>
          </div>
        </div>
        <span class="announcement-badge ${post.type === 'LOSTFOUND' ? 'warning' : ''}">
          ${post.type}
        </span>
      </div>

      <div class="post-body">
        <h4 style="margin: 4px 0;">${escapeHTML(post.title)}</h4>
        <p>${escapeHTML(post.content)}</p>
        
        ${post.type === 'LOSTFOUND' ? `
          <div style="background:#f0f2f5; padding:8px; border-radius:6px; margin-top:8px; font-size:12px;">
            <p style="margin:2px 0;">📍 <strong>Location:</strong> ${escapeHTML(post.location || 'N/A')}</p>
            <p style="margin:2px 0;">📞 <strong>Contact:</strong> ${escapeHTML(post.contact || 'N/A')}</p>
            <p style="margin:2px 0;">🏷️ <strong>Status:</strong> ${post.status}</p>
          </div>
        ` : ''}
      </div>

      <div class="post-footer-actions">
        <button class="post-action-btn" onclick="likePost(${post.id})">👍 Like (${post.likes || 0})</button>
        <button class="post-action-btn" onclick="commentPost(${post.id})">💬 Comment</button>
      </div>
    </div>
  `).join('');
}

function likePost(postId) {
  let posts = JSON.parse(localStorage.getItem('vmc_campus_posts') || '[]');
  posts = posts.map(p => {
    if (p.id === postId) p.likes = (p.likes || 0) + 1;
    return p;
  });
  localStorage.setItem('vmc_campus_posts', JSON.stringify(posts));
  renderMainFeed();
}

function commentPost(postId) {
  alert('Commenting system active for Post #' + postId);
}

function escapeHTML(str) {
  return str ? str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  ) : '';
}
