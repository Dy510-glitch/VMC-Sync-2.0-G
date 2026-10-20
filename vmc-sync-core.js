/**
 * VMC SYNC - CORE JAVASCRIPT ENGINE
 * Handles multi-tab sync, theme management, assignment tracking, toolkit apps, multiple media uploads, and post options.
 */

const DEFAULT_STATE = {
  theme: "light",
  currentFilter: "All",
  campusStatus: "Campus Open",
  posts: [
    { 
      id: 1, 
      author: "Randy T.", 
      type: "Academic", 
      time: "10 mins ago", 
      text: "Welcome to VMC Sync! Don't forget to submit your Information Systems project.", 
      reactions: { "👍": 1 }, 
      comments: [],
      media: { images: [], videos: [], audios: [] }
    }
  ],
  tasks: [
    { id: 201, title: "System Integration Module", course: "IS302", due: "2026-10-30", priority: "High", completed: false }
  ],
  lostFound: [
    { id: 301, title: "Black Umbrella", type: "Lost", location: "Canteen Area", desc: "Left near table 4 during lunch break." }
  ],
  announcements: [
    { id: 401, title: "Midterm Exams Schedule", text: "Midterms will start next week. Check your student portals for room assignments." }
  ],
  toolkitSuggestions: [
    { id: 501, name: "Mendeley Reference Manager", category: "Document Editor", link: "https://www.mendeley.com", desc: "Generates automatic APA/IEEE citations and manages research papers." }
  ],
  events: [
    { id: 601, title: "VMC IT & Systems Colloquium 2026", date: "Nov 15, 2026 • 1:00 PM", location: "Audio-Visual Room", desc: "Annual gathering showcasing student software prototypes and tech talks." }
  ]
};

function getState() {
  const data = localStorage.getItem("VMC_SYNC_DATA");
  return data ? JSON.parse(data) : DEFAULT_STATE;
}

function saveState(state) {
  try {
    localStorage.setItem("VMC_SYNC_DATA", JSON.stringify(state));
    window.dispatchEvent(new Event("vmc_state_changed"));
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      alert("Storage quota exceeded! Please clear some posts or upload smaller media files.");
    }
  }
}

if (!localStorage.getItem("VMC_SYNC_DATA")) {
  saveState(DEFAULT_STATE);
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  if (document.querySelector(".app-filter-bar")) initNavigation();
  renderApp();

  window.addEventListener("vmc_state_changed", renderApp);
  window.addEventListener("storage", renderApp);

  document.addEventListener("click", (e) => {
    if (!e.target.closest('.post-menu-container')) {
      document.querySelectorAll('.post-menu-dropdown').forEach(d => d.style.display = 'none');
    }
  });
});

/* THEME TOGGLE */
function initTheme() {
  const state = getState();
  document.documentElement.setAttribute("data-theme", state.theme);
  const icon = document.getElementById("theme-icon");
  if (icon) icon.className = state.theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";

  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      if (icon) icon.className = next === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
      
      const state = getState();
      state.theme = next;
      saveState(state);
    });
  }
}

/* NAVIGATION */
function initNavigation() {
  document.querySelectorAll(".app-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".app-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const view = chip.getAttribute("data-view");
      document.querySelectorAll(".portal-view").forEach(v => v.style.display = "none");
      const target = document.getElementById(`view-${view}`);
      if (target) target.style.display = "block";
    });
  });
}

function renderApp() {
  const state = getState();
  const statusEl = document.getElementById("display-campus-status");
  if (statusEl) statusEl.innerText = state.campusStatus;
  
  if (document.getElementById("feed-posts-container")) renderFeed(state.posts, state.currentFilter);
  if (document.getElementById("task-table-body")) renderTasks(state.tasks);
  if (document.getElementById("lostfound-grid")) renderLostFound(state.lostFound);
  if (document.getElementById("announcements-container")) renderAnnouncements(state.announcements);
  if (document.getElementById("toolkit-suggestions-list")) renderToolkitSuggestions(state.toolkitSuggestions);
  if (document.getElementById("events-list-container")) renderEvents(state.events);

  if (document.getElementById("admin-feed-moderation")) renderAdminFeed(state.posts);
  if (document.getElementById("admin-toolkit-moderation")) renderAdminToolkit(state.toolkitSuggestions);
}

/* 1. CAMPUS FEED & MULTIPLE MEDIA GALLERY */
window.filterFeed = function(filter, btn) {
  document.querySelectorAll(".feed-filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const state = getState();
  state.currentFilter = filter;
  renderFeed(state.posts, filter);
};

function renderFeed(posts, filter) {
  const container = document.getElementById("feed-posts-container");
  const filtered = filter === "All" ? posts : posts.filter(p => p.type === filter);

  container.innerHTML = filtered.map(p => `
    <div class="post-card">
      <div class="post-header" style="position:relative;">
        <div style="display:flex; gap:10px; align-items:center;">
          <div class="avatar-placeholder" style="width:32px; height:32px; font-size:14px;">${p.author[0]}</div>
          <div>
            <h4>${p.author} <span style="font-size:11px; font-weight:normal; color:var(--accent-blue);">[${p.type}]</span></h4>
            <span class="post-time">${p.time}</span>
          </div>
        </div>

        <div class="post-menu-container" style="position:relative;">
          <button class="action-btn" onclick="togglePostMenu(event, ${p.id})" style="padding:4px 8px; font-size:14px;"><i class="fa-solid fa-ellipsis"></i></button>
          <div id="post-menu-${p.id}" class="post-menu-dropdown" style="display:none; position:absolute; right:0; top:28px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.15); width:140px; z-index:100; overflow:hidden;">
            <button onclick="editPost(${p.id})" style="width:100%; text-align:left; background:none; border:none; padding:8px 12px; font-size:12px; color:var(--text-main); cursor:pointer;"><i class="fa-solid fa-pen"></i> Edit Post</button>
            <button onclick="copyPostLink(${p.id})" style="width:100%; text-align:left; background:none; border:none; padding:8px 12px; font-size:12px; color:var(--text-main); cursor:pointer;"><i class="fa-solid fa-link"></i> Copy Link</button>
            <button onclick="reportPost(${p.id})" style="width:100%; text-align:left; background:none; border:none; padding:8px 12px; font-size:12px; color:var(--text-main); cursor:pointer;"><i class="fa-solid fa-flag"></i> Report</button>
            <button onclick="deletePost(${p.id})" style="width:100%; text-align:left; background:none; border:none; padding:8px 12px; font-size:12px; color:#d93025; cursor:pointer; border-top:1px solid var(--border-color);"><i class="fa-solid fa-trash"></i> Delete Post</button>
          </div>
        </div>
      </div>
      
      <div class="post-body">
        <p id="post-text-${p.id}">${p.text}</p>
        
        <!-- MULTIPLE IMAGES GALLERY -->
        ${p.media && p.media.images && p.media.images.length > 0 ? `
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:6px; margin-top:10px;">
            ${p.media.images.map(img => `<img src="${img}" style="width:100%; height:180px; border-radius:6px; object-fit:cover;">`).join('')}
          </div>
        ` : ''}

        <!-- MULTIPLE VIDEOS GALLERY -->
        ${p.media && p.media.videos && p.media.videos.length > 0 ? `
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
            ${p.media.videos.map(vid => `<video src="${vid}" controls style="width:100%; max-height:280px; border-radius:6px;"></video>`).join('')}
          </div>
        ` : ''}

        <!-- MULTIPLE AUDIO TRACKS -->
        ${p.media && p.media.audios && p.media.audios.length > 0 ? `
          <div style="display:flex; flex-direction:column; gap:6px; margin-top:10px;">
            ${p.media.audios.map(aud => `<div style="background:var(--bg-primary); padding:6px; border-radius:6px;"><audio src="${aud}" controls style="width:100%;"></audio></div>`).join('')}
          </div>
        ` : ''}
      </div>

      <div class="post-reaction-bar">
        <button class="reaction-btn ${p.userReacted ? 'active' : ''}" onclick="toggleReaction(${p.id})">👍 Like</button>
        <div class="reaction-summary-badge">👍 ${Object.values(p.reactions).reduce((a,b)=>a+b, 0)} • ${p.comments.length} Comments</div>
      </div>
      <div class="comments-section">
        <div class="comment-input-row">
          <input type="text" class="comment-input" placeholder="Write a comment..." onkeypress="handleCommentKey(event, ${p.id})">
        </div>
        <div class="comments-list">
          ${p.comments.map(c => `
            <div class="comment-item">
              <div class="comment-bubble">
                <div class="comment-author">${c.author} <button class="btn-delete-comment" onclick="deleteComment(${p.id},${c.id})">Del</button></div>
                <div class="comment-text">${c.text}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

window.togglePostMenu = function(e, id) {
  e.stopPropagation();
  document.querySelectorAll('.post-menu-dropdown').forEach(d => {
    if (d.id !== `post-menu-${id}`) d.style.display = 'none';
  });
  const menu = document.getElementById(`post-menu-${id}`);
  if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
};

window.editPost = function(id) {
  const state = getState();
  const post = state.posts.find(p => p.id === id);
  if (post) {
    const updatedText = prompt("Edit your post content:", post.text);
    if (updatedText !== null && updatedText.trim() !== "") {
      post.text = updatedText.trim();
      saveState(state);
    }
  }
};

window.deletePost = function(id) {
  if (confirm("Are you sure you want to delete this post?")) {
    const state = getState();
    state.posts = state.posts.filter(p => p.id !== id);
    saveState(state);
  }
};

window.copyPostLink = function(id) {
  navigator.clipboard.writeText(`${window.location.origin}#post-${id}`);
  alert("Post link copied to clipboard!");
};

window.reportPost = function(id) {
  alert("Post has been flagged and submitted for administrator moderation.");
};

window.openPostModal = function(type) {
  const modal = document.getElementById("post-modal");
  if (modal) {
    document.getElementById("modal-post-type").value = type;
    modal.style.display = "flex";
  }
};
window.closePostModal = function() {
  const modal = document.getElementById("post-modal");
  if (modal) modal.style.display = "none";
};

// Batch read multiple files as Base64 DataURLs
function readMultipleFiles(files) {
  return Promise.all(Array.from(files).map(file => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }));
}

const postForm = document.getElementById("create-post-form");
if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const imageFiles = document.getElementById("media-image-input").files;
    const videoFiles = document.getElementById("media-video-input").files;
    const audioFiles = document.getElementById("media-audio-input").files;

    const imagesData = await readMultipleFiles(imageFiles);
    const videosData = await readMultipleFiles(videoFiles);
    const audiosData = await readMultipleFiles(audioFiles);

    const state = getState();
    state.posts.unshift({
      id: Date.now(),
      author: "Randy T.",
      type: document.getElementById("post-category-select").value || "General",
      time: "Just now",
      text: document.getElementById("modal-post-text").value,
      reactions: { "👍": 0 },
      comments: [],
      media: {
        images: imagesData,
        videos: videosData,
        audios: audiosData
      }
    });

    saveState(state);
    postForm.reset();
    closePostModal();
  });
}

window.toggleReaction = function(id) {
  const state = getState();
  const post = state.posts.find(p => p.id === id);
  if (post) {
    post.userReacted = !post.userReacted;
    post.reactions["👍"] += post.userReacted ? 1 : -1;
    saveState(state);
  }
};

window.handleCommentKey = function(e, postId) {
  if (e.key === "Enter" && e.target.value.trim() !== "") {
    const state = getState();
    const post = state.posts.find(p => p.id === postId);
    if (post) {
      post.comments.push({ id: Date.now(), author: "Randy T.", text: e.target.value.trim() });
      saveState(state);
      e.target.value = "";
    }
  }
};

window.deleteComment = function(postId, commentId) {
  const state = getState();
  const post = state.posts.find(p => p.id === postId);
  if (post) {
    post.comments = post.comments.filter(c => c.id !== commentId);
    saveState(state);
  }
};

/* 2. ASSIGNMENT TRACKER */
const taskForm = document.getElementById("add-task-form");
if (taskForm) {
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const state = getState();
    state.tasks.push({
      id: Date.now(),
      title: document.getElementById("task-title").value,
      course: document.getElementById("task-course").value,
      due: document.getElementById("task-due").value,
      priority: document.getElementById("task-priority").value,
      completed: false
    });
    saveState(state);
    taskForm.reset();
  });
}

function renderTasks(tasks) {
  const tbody = document.getElementById("task-table-body");
  if (!tbody) return;
  tbody.innerHTML = tasks.map(t => `
    <tr>
      <td><input type="checkbox" ${t.completed ? "checked" : ""} onchange="toggleTask(${t.id})"></td>
      <td style="${t.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${t.title}</td>
      <td>${t.course}</td>
      <td>${t.due}</td>
      <td>${t.priority}</td>
      <td><button class="btn-secondary-sm" style="color:var(--accent-blue);" onclick="deleteTask(${t.id})">Del</button></td>
    </tr>
  `).join('');
}

window.toggleTask = function(id) {
  const state = getState();
  const task = state.tasks.find(t => t.id === id);
  if (task) { task.completed = !task.completed; saveState(state); }
};

window.deleteTask = function(id) {
  const state = getState();
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveState(state);
};

/* 3. GPA & TOOLKIT SUGGESTIONS */
const addGpaBtn = document.getElementById("add-gpa-row");
if (addGpaBtn) {
  addGpaBtn.addEventListener("click", () => {
    const container = document.getElementById("gpa-rows-container");
    const row = document.createElement("div");
    row.className = "form-row gpa-row";
    row.innerHTML = `
      <input type="text" placeholder="Subject" class="input-field gpa-subject">
      <input type="number" placeholder="Units" class="input-field gpa-units" min="1" max="6" value="3">
      <select class="input-field gpa-grade">
        <option value="1.0">1.00</option><option value="1.25">1.25</option><option value="1.5">1.50</option>
        <option value="1.75">1.75</option><option value="2.0">2.00</option><option value="2.25">2.25</option>
        <option value="2.5">2.50</option><option value="3.0">3.00</option><option value="5.0">5.00</option>
      </select>
    `;
    container.appendChild(row);
  });
}

const calcGpaBtn = document.getElementById("calc-gpa-btn");
if (calcGpaBtn) {
  calcGpaBtn.addEventListener("click", () => {
    const units = document.querySelectorAll(".gpa-units");
    const grades = document.querySelectorAll(".gpa-grade");
    let totalUnits = 0, weightedPoints = 0;
    units.forEach((uInput, idx) => {
      const u = parseFloat(uInput.value) || 0;
      const g = parseFloat(grades[idx].value) || 0;
      totalUnits += u;
      weightedPoints += (u * g);
    });
    if (totalUnits > 0) {
      document.getElementById("gpa-score").innerText = (weightedPoints / totalUnits).toFixed(2);
      document.getElementById("gpa-result-display").style.display = "block";
    }
  });
}

const suggestForm = document.getElementById("suggest-tool-form");
if (suggestForm) {
  suggestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const state = getState();
    state.toolkitSuggestions.push({
      id: Date.now(),
      name: document.getElementById("tool-name").value,
      category: document.getElementById("tool-category-select").value,
      link: document.getElementById("tool-link").value,
      desc: document.getElementById("tool-desc").value
    });
    saveState(state);
    suggestForm.reset();
    alert("Toolkit suggestion submitted!");
  });
}

function renderToolkitSuggestions(suggestions) {
  const container = document.getElementById("toolkit-suggestions-list");
  if (!container) return;
  container.innerHTML = suggestions.map(s => `
    <div style="padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-primary);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <a href="${s.link}" target="_blank" style="font-weight: bold; font-size: 13px; color: var(--accent-blue); text-decoration: none;">${s.name} <i class="fa-solid fa-external-link-alt" style="font-size:10px;"></i></a>
        <span style="font-size:10px; font-weight:bold; background:var(--bg-subtle); padding:2px 6px; border-radius:4px;">${s.category || 'Utility'}</span>
      </div>
      <p style="font-size: 11px; margin: 4px 0 0 0; color: var(--text-main);">${s.desc}</p>
    </div>
  `).join('');
}

/* 4. LOST & FOUND */
window.openLostModal = function() { document.getElementById("lost-modal").style.display = "flex"; };
window.closeLostModal = function() { document.getElementById("lost-modal").style.display = "none"; };

const lostForm = document.getElementById("report-lost-form");
if (lostForm) {
  lostForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const state = getState();
    state.lostFound.push({
      id: Date.now(), title: document.getElementById("lost-title").value,
      type: document.getElementById("lost-type").value, location: document.getElementById("lost-location").value,
      desc: document.getElementById("lost-desc").value
    });
    saveState(state);
    lostForm.reset();
    closeLostModal();
  });
}

function renderLostFound(items) {
  const grid = document.getElementById("lostfound-grid");
  if (!grid) return;
  grid.innerHTML = items.map(i => `
    <div class="sidebar-card" style="margin-bottom:0;">
      <span style="font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; background:${i.type==='Lost'?'#ffebe9':'#e6f4ea'}; color:${i.type==='Lost'?'#d93025':'#137333'};">${i.type}</span>
      <h4 style="margin:6px 0 2px 0; font-size:13px;">${i.title}</h4>
      <p style="font-size:11px; color:var(--text-muted); margin:0;">📍 ${i.location}</p>
      <p style="font-size:11px; margin:4px 0 0 0;">${i.desc}</p>
    </div>
  `).join('');
}

/* 5. EVENT MANAGEMENT */
function renderEvents(events) {
  const container = document.getElementById("events-list-container");
  if (!container) return;
  container.innerHTML = events.map(e => `
    <div class="sidebar-card" style="margin-bottom:0;">
      <h4 style="margin:0 0 4px 0; font-size:14px; color:var(--accent-blue);">${e.title}</h4>
      <p style="font-size:12px; font-weight:bold; color:var(--text-muted); margin:0 0 4px 0;"><i class="fa-regular fa-clock"></i> ${e.date} | 📍 ${e.location}</p>
      <p style="font-size:12px; margin:0;">${e.desc}</p>
    </div>
  `).join('');
}

function renderAnnouncements(announcements) {
  const container = document.getElementById("announcements-container");
  if (!container) return;
  container.innerHTML = announcements.map(a => `
    <div class="announcement-item">
      <h4>${a.title}</h4>
      <p>${a.text}</p>
    </div>
  `).join('');
}

/* 6. ADMIN CONTROLS */
const adminControlsForm = document.getElementById("admin-controls-form");
if (adminControlsForm) {
  adminControlsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const state = getState();
    state.campusStatus = document.getElementById("admin-campus-status").value;
    state.announcements.unshift({
      id: Date.now(),
      title: document.getElementById("admin-announcement-title").value,
      text: document.getElementById("admin-announcement-text").value
    });
    saveState(state);
    adminControlsForm.reset();
    alert("Campus settings and announcement broadcasted successfully!");
  });
}

const adminEventForm = document.getElementById("admin-event-form");
if (adminEventForm) {
  adminEventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const state = getState();
    state.events.push({
      id: Date.now(),
      title: document.getElementById("event-title").value,
      date: document.getElementById("event-date").value,
      location: document.getElementById("event-location").value,
      desc: document.getElementById("event-desc").value
    });
    saveState(state);
    adminEventForm.reset();
    alert("Campus event published!");
  });
}

function renderAdminFeed(posts) {
  const container = document.getElementById("admin-feed-moderation");
  if (!container) return;
  container.innerHTML = posts.map(p => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border:1px solid var(--border-color); border-radius:6px; background:var(--bg-primary);">
      <span style="font-size:12px;"><strong>${p.author}:</strong> ${p.text.substring(0,35)}...</span>
      <button class="btn-secondary-sm" style="background:#ffebe9; color:#d93025;" onclick="adminDeletePost(${p.id})">Delete</button>
    </div>
  `).join('');
}

window.adminDeletePost = function(id) {
  const state = getState();
  state.posts = state.posts.filter(p => p.id !== id);
  saveState(state);
};

function renderAdminToolkit(suggestions) {
  const container = document.getElementById("admin-toolkit-moderation");
  if (!container) return;
  container.innerHTML = suggestions.map(s => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border:1px solid var(--border-color); border-radius:6px; background:var(--bg-primary);">
      <span style="font-size:12px;"><strong>${s.name}</strong> (${s.category || 'Utility'})</span>
      <button class="btn-secondary-sm" style="background:#ffebe9; color:#d93025;" onclick="adminDeleteSuggestion(${s.id})">Remove</button>
    </div>
  `).join('');
}

window.adminDeleteSuggestion = function(id) {
  const state = getState();
  state.toolkitSuggestions = state.toolkitSuggestions.filter(s => s.id !== id);
  saveState(state);
};
