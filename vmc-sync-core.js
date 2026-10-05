/* ==========================================================================
   VMC SYNC - CORE ENGINE, THEME MANAGEMENT, REACTIONS, COMMENTS & DELETE
   ========================================================================== */

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
  initTheme();
  renderAppHub();
  renderSchedule();
  renderMainFeed();
});

/* DARK / LIGHT MODE SWITCHER */
function initTheme() {
  const savedTheme = localStorage.getItem('vmc_theme_mode') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleThemeMode() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', targetTheme);
  localStorage.setItem('vmc_theme_mode', targetTheme);
  updateThemeIcon(targetTheme);
}

function updateThemeIcon(theme) {
  const iconSpan = document.getElementById('theme-icon');
  if (iconSpan) {
    iconSpan.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

function resetFeedToHome() {
  closePostModal();
  activeFeedFilter = 'ALL';

  const filterBtns = document.querySelectorAll('.feed-filter-btn');
  filterBtns.forEach(btn => btn.classList.remove('active'));
  
  const allBtn = document.getElementById('feed-filter-all');
  if (allBtn) allBtn.classList.add('active');

  const searchInput = document.querySelector('.search-input');
  if (searchInput) searchInput.value = '';

  renderMainFeed();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchToolkitTab(tabId, btnElement) {
  document.querySelectorAll('.toolkit-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.toolkit-tab-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`tab-${tabId}`).style.display = 'block';
  if (btnElement) btnElement.classList.add('active');
}

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
    <div class="app-card-mini tooltip-right" data-tooltip="${escapeHTML(app.title)} (${app.category})">
      <div class="app-card-left">
        <span class="app-icon">${app.icon}</span>
        <div>
          <h5 class="app-title">${escapeHTML(app.title)}</h5>
          <span class="app-category">${app.category}</span>
        </div>
      </div>
      <a href="${app.url}" target="_blank" rel="noopener noreferrer" class="btn-app-launch tooltip-left" data-tooltip="Open in external tab">Open ↗</a>
    </div>
  `).join('');
}

function addGpaRow() {
  const tbody = document.getElementById('gpa-course-rows');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" placeholder="Course" class="input-field course-name"></td>
    <td><input type="number" value="3" min="1" max="6" class="input-field course-units"></td>
    <td><input type="number" value="85" min="0" max="100" class="input-field course-grade"></td>
    <td><button class="btn-danger-xs tooltip-top" data-tooltip="Delete course row" onclick="removeGpaRow(this)">✕</button></td>
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
    container.innerHTML = '<p style="font-size:11px; color:var(--text-muted);">No classes added yet.</p>';
    return;
  }

  container.innerHTML = schedules.map(s => `
    <div class="tooltip-right" data-tooltip="${escapeHTML(s.subject)} at ${escapeHTML(s.room)}" style="background:var(--bg-primary); padding:6px; border-radius:4px; margin-top:6px; font-size:11px; color:var(--text-main);">
      <strong>${escapeHTML(s.subject)}</strong> (${s.day})
      <br>🕒 ${escapeHTML(s.start)} - ${escapeHTML(s.end)} | 📍 ${escapeHTML(s.room)}
      <button class="btn-danger-xs tooltip-left" data-tooltip="Remove class" style="float:right;" onclick="deleteSchedule(${s.id})">✕</button>
    </div>
  `).join('');
}

function deleteSchedule(id) {
  let schedules = JSON.parse(localStorage.getItem('vmc_schedules') || '[]');
  schedules = schedules.filter(s => s.id !== id);
  localStorage.setItem('vmc_schedules', JSON.stringify(schedules));
  renderSchedule();
}

/* EMOJI HELPER FOR FORM INPUTS */
function insertEmojiTo(elementId, emoji) {
  const field = document.getElementById(elementId);
  if (!field) return;

  const start = field.selectionStart || field.value.length;
  const end = field.selectionEnd || field.value.length;
  const text = field.value;

  field.value = text.substring(0, start) + emoji + text.substring(end);
  field.focus();
  field.selectionStart = field.selectionEnd = start + emoji.length;
}

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
    userReaction: null, // Strictly holds 1 active reaction per post
    comments: [],
    showComments: false
  };

  if (type === 'LOSTFOUND') {
    newPost.status = document.getElementById('post-lf-status').value;
    newPost.location = document.getElementById('post-lf-location').value;
    newPost.contact = document.getElementById('post-lf-contact').value;
  }

  const posts = JSON.parse(localStorage.getItem('vmc_campus_posts') || '[]');
  posts.unshift(newPost);
  localStorage.setItem('vmc_campus_posts', JSON.stringify(posts));

  document.getElementById('post-title').value = '';
  document.getElementById('post-content').value = '';

  closePostModal();
  renderMainFeed();
}

/* POST DELETION */
function deletePost(postId) {
  if (confirm('Are you sure you want to delete this post?')) {
    let posts = JSON.parse(localStorage.getItem('vmc_campus_posts') || '[]');
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('vmc_campus_posts', JSON.stringify(posts));
    renderMainFeed();
  }
}

/* STRICT 1-REACTION LIMIT PER POST */
function handleSingleReaction(postId, emoji) {
  let posts = JSON.parse(localStorage.getItem('vmc_campus_posts') || '[]');
  posts = posts.map(p => {
    if (p.id === postId) {
      // Toggle reaction off if clicking active reaction, otherwise overwrite existing reaction
      p.userReaction = (p.userReaction === emoji) ? null : emoji;
    }
    return p;
  });
  localStorage.setItem('vmc_campus_posts', JSON.stringify(posts));
  renderMainFeed();
}

/* FUNCTIONAL COMMENTS SYSTEM */
function toggleCommentsSection(postId) {
  let posts = JSON.parse(localStorage.getItem('vmc_campus_posts') || '[]');
  posts = posts.map(p => {
    if (p.id === postId) {
      p.showComments = !p.showComments;
    }
    return p;
  });
  localStorage.setItem('vmc_campus_posts', JSON.stringify(posts));
  renderMainFeed();
}

function submitComment(e, postId) {
  e.preventDefault();
  const input = document.getElementById(`comment-input-${postId}`);
  if (!input || !input.value.trim()) return;

  const commentText = input.value.trim();
  let posts = JSON.parse(localStorage.getItem('vmc_campus_posts') || '[]');

  posts = posts.map(p => {
    if (p.id === postId) {
      if (!p.comments) p.comments = [];
      p.comments.push({
        id: Date.now(),
        author: 'Student Account',
        text: commentText,
        time: 'Just now'
      });
      p.showComments = true;
    }
    return p;
  });

  localStorage.setItem('vmc_campus_posts', JSON.stringify(posts));
  renderMainFeed();
}

function deleteComment(postId, commentId) {
  let posts = JSON.parse(localStorage.getItem('vmc_campus_posts') || '[]');
  posts = posts.map(p => {
    if (p.id === postId && p.comments) {
      p.comments = p.comments.filter(c => c.id !== commentId);
    }
    return p;
  });
  localStorage.setItem('vmc_campus_posts', JSON.stringify(posts));
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
      <div class="post-card" style="text-align:center; color:var(--text-muted);">
        <p>No VMC SYNC posts yet. Be the first to start a conversation!</p>
      </div>`;
    return;
  }

  const reactionsList = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  container.innerHTML = posts.map(post => {
    const activeReaction = post.userReaction || null;
    const commentsList = post.comments || [];
    const showComments = post.showComments || false;

    return `
      <div class="post-card">
        <div class="post-header">
          <div class="post-header-left">
            <div class="avatar-placeholder">🎓</div>
            <div class="post-author-info">
              <h4>${escapeHTML(post.author)}</h4>
              <span class="post-time">${post.timestamp}</span>
            </div>
          </div>
          
          <div class="post-header-right">
            <span class="announcement-badge ${post.type === 'LOSTFOUND' ? 'warning' : ''}">
              ${post.type}
            </span>
            <button class="btn-delete-post tooltip-left" data-tooltip="Delete Post" onclick="deletePost(${post.id})">🗑️</button>
          </div>
        </div>

        <div class="post-body">
          <h4 style="margin: 4px 0; color:var(--text-main);">${escapeHTML(post.title)}</h4>
          <p>${escapeHTML(post.content)}</p>
          
          ${post.type === 'LOSTFOUND' ? `
            <div style="background:var(--bg-primary); padding:8px; border-radius:6px; margin-top:8px; font-size:12px;">
              <p style="margin:2px 0;">📍 <strong>Location:</strong> ${escapeHTML(post.location || 'N/A')}</p>
              <p style="margin:2px 0;">📞 <strong>Contact:</strong> ${escapeHTML(post.contact || 'N/A')}</p>
              <p style="margin:2px 0;">🏷️ <strong>Status:</strong> ${post.status}</p>
            </div>
          ` : ''}
        </div>

        <!-- REACTION SELECTION (STRICT 1-REACTION LIMIT) -->
        <div class="post-reaction-bar">
          <div class="reaction-picker">
            ${reactionsList.map(emoji => `
              <button class="reaction-btn ${activeReaction === emoji ? 'active' : ''} tooltip-top" 
                      data-tooltip="${activeReaction === emoji ? 'Remove Reaction' : 'React with ' + emoji}"
                      onclick="handleSingleReaction(${post.id}, '${emoji}')">
                ${emoji}
              </button>
            `).join('')}
          </div>
          
          <div>
            ${activeReaction ? `<span class="reaction-summary-badge">Your Reaction: ${activeReaction}</span>` : ''}
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="post-footer-actions">
          <button class="post-action-btn tooltip-top" data-tooltip="Toggle comments section" onclick="toggleCommentsSection(${post.id})">
            💬 Comments (${commentsList.length})
          </button>
        </div>

        <!-- COMMENTS SECTION -->
        ${showComments ? `
          <div class="comments-section">
            <form onsubmit="submitComment(event, ${post.id})" class="comment-input-row">
              <input type="text" id="comment-input-${post.id}" placeholder="Write a comment..." class="comment-input" required>
              <button type="submit" class="btn-primary-sm">Send</button>
            </form>

            <div class="emoji-picker-bar" style="margin-bottom: 10px;">
              <span class="emoji-picker-label">Comment Emojis:</span>
              <button type="button" class="emoji-chip" onclick="insertEmojiTo('comment-input-${post.id}', '👍')">👍</button>
              <button type="button" class="emoji-chip" onclick="insertEmojiTo('comment-input-${post.id}', '❤️')">❤️</button>
              <button type="button" class="emoji-chip" onclick="insertEmojiTo('comment-input-${post.id}', '🙌')">🙌</button>
              <button type="button" class="emoji-chip" onclick="insertEmojiTo('comment-input-${post.id}', '🔥')">🔥</button>
            </div>

            <div class="comments-list">
              ${commentsList.length === 0 ? '<p style="font-size:11px; color:var(--text-muted); margin:0;">No comments yet.</p>' : ''}
              ${commentsList.map(c => `
                <div class="comment-item">
                  <div class="avatar-placeholder" style="width:28px; height:28px; font-size:14px;">👤</div>
                  <div class="comment-bubble">
                    <button class="btn-delete-comment tooltip-left" data-tooltip="Delete comment" onclick="deleteComment(${post.id}, ${c.id})">✕</button>
                    <div class="comment-author">${escapeHTML(c.author)}</div>
                    <div class="comment-text">${escapeHTML(c.text)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function escapeHTML(str) {
  return str ? str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  ) : '';
}
