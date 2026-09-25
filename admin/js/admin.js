/**
 * Portfolio Admin CMS Logic (Universal Firebase Compat)
 */

const firebaseConfig = {
  apiKey: "AIzaSyD5eitP3x2kYvcJIuTiE0dkHGvVwaak2Fc",
  authDomain: "portfolio-dfb1b.firebaseapp.com",
  projectId: "portfolio-dfb1b",
  storageBucket: "portfolio-dfb1b.firebasestorage.app",
  messagingSenderId: "387216500569",
  appId: "1:387216500569:web:5e94b380c0c8d88264ce48"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// State
let currentProjects = [];
let pendingDeleteId = null;

// DOM Elements
const authWrapper = document.getElementById('authWrapper');
const adminLayout = document.getElementById('adminLayout');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const currentUserDisplay = document.getElementById('currentUserDisplay');

const statTotalProjects = document.getElementById('statTotalProjects');
const statPublishedProjects = document.getElementById('statPublishedProjects');
const statFeaturedProjects = document.getElementById('statFeaturedProjects');
const statDraftProjects = document.getElementById('statDraftProjects');

const projectSearchInput = document.getElementById('projectSearchInput');
const categoryFilterSelect = document.getElementById('categoryFilterSelect');
const projectsTableBody = document.getElementById('projectsTableBody');
const seedDataBtn = document.getElementById('seedDataBtn');

const projectModal = document.getElementById('projectModal');
const projectForm = document.getElementById('projectForm');
const modalFormTitle = document.getElementById('modalFormTitle');
const openAddProjectModalBtn = document.getElementById('openAddProjectModalBtn');
const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');
const cancelProjectModalBtn = document.getElementById('cancelProjectModalBtn');
const editProjectId = document.getElementById('editProjectId');

const projectTitle = document.getElementById('projectTitle');
const projectCategory = document.getElementById('projectCategory');
const projectTagline = document.getElementById('projectTagline');
const projectDescription = document.getElementById('projectDescription');
const projectFullDescription = document.getElementById('projectFullDescription');
const projectTags = document.getElementById('projectTags');
const projectFeatures = document.getElementById('projectFeatures');

// Cover Image Dropzone Elements
const coverDropzone = document.getElementById('coverDropzone');
const projectImageFile = document.getElementById('projectImageFile');
const projectImage = document.getElementById('projectImage');
const coverDropzoneEmpty = document.getElementById('coverDropzoneEmpty');
const coverDropzonePreview = document.getElementById('coverDropzonePreview');
const coverPreviewImg = document.getElementById('coverPreviewImg');
const coverSizeBadge = document.getElementById('coverSizeBadge');
const changeCoverBtn = document.getElementById('changeCoverBtn');
const removeCoverBtn = document.getElementById('removeCoverBtn');
const toggleUrlCoverBtn = document.getElementById('toggleUrlCoverBtn');
const coverUrlInputWrapper = document.getElementById('coverUrlInputWrapper');
const projectImageUrlInput = document.getElementById('projectImageUrlInput');

// Logo Upload Elements
const projectLogoFile = document.getElementById('projectLogoFile');
const projectLogo = document.getElementById('projectLogo');
const uploadLogoBtn = document.getElementById('uploadLogoBtn');
const removeLogoBtn = document.getElementById('removeLogoBtn');
const logoPreviewImg = document.getElementById('logoPreviewImg');
const logoPlaceholderIcon = document.getElementById('logoPlaceholderIcon');

const projectGithub = document.getElementById('projectGithub');
const projectDemo = document.getElementById('projectDemo');
const projectPublished = document.getElementById('projectPublished');
const projectFeatured = document.getElementById('projectFeatured');

const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const deleteProjectTitleDisplay = document.getElementById('deleteProjectTitleDisplay');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const cancelDeleteModalBtn = document.getElementById('cancelDeleteModalBtn');
const confirmDeleteActionBtn = document.getElementById('confirmDeleteActionBtn');

const toastContainer = document.getElementById('toastContainer');

/* ==========================================================================
   1. Authentication Listeners & Handlers
   ========================================================================== */

auth.onAuthStateChanged((user) => {
  if (user) {
    // Authenticated
    if (authWrapper) authWrapper.style.display = 'none';
    if (adminLayout) adminLayout.style.display = 'flex';
    if (currentUserDisplay) currentUserDisplay.innerText = user.email || 'Admin';
    loadProjects();
  } else {
    // Unauthenticated
    if (authWrapper) authWrapper.style.display = 'flex';
    if (adminLayout) adminLayout.style.display = 'none';
  }
});

// Login Form Submit
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span>Verifying...</span>';

    try {
      await auth.signInWithEmailAndPassword(email, password);
      showToast('Welcome back, Admin!', 'success');
      loginForm.reset();
    } catch (err) {
      console.error('Login error:', err);
      let msg = 'Failed to sign in. Please verify your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed attempts. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Network error. Please check your internet connection.';
      } else if (err.message) {
        msg = err.message;
      }
      showToast(msg, 'error');
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = `<span>Sign In to Dashboard</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
    }
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await auth.signOut();
      showToast('Logged out successfully', 'info');
    } catch (err) {
      showToast('Error logging out', 'error');
    }
  });
}

/* ==========================================================================
   2. Firestore Projects Management (CRUD)
   ========================================================================== */

async function loadProjects() {
  if (!projectsTableBody) return;

  projectsTableBody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px;">
        Loading projects from Firestore...
      </td>
    </tr>
  `;

  try {
    const snapshot = await db.collection('projects').get();
    
    if (snapshot.empty) {
      // Auto-seed default projects if database is empty
      console.log('Firestore is empty. Auto-seeding initial projects...');
      for (const proj of defaultSeedProjects) {
        await db.collection('projects').add({
          ...proj,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      const newSnapshot = await db.collection('projects').get();
      currentProjects = [];
      newSnapshot.forEach(docSnap => {
        currentProjects.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      showToast('Loaded & seeded initial portfolio projects!', 'success');
    } else {
      currentProjects = [];
      snapshot.forEach(docSnap => {
        currentProjects.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
    }

    // Sort dynamically by creation date (newest first)
    currentProjects.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0));
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0));
      if (timeA && timeB && timeA !== timeB) return timeB - timeA;
      return (a.order || 99) - (b.order || 99);
    });

    updateStats();
    renderProjectsTable();
  } catch (err) {
    console.error('Error fetching projects:', err);
    projectsTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--accent-danger); padding: 40px;">
          Error loading projects: ${err.message}. Make sure Firestore rules allow read access.
        </td>
      </tr>
    `;
    showToast('Failed to load projects from Firestore', 'error');
  }
}

function updateStats() {
  const total = currentProjects.length;
  const published = currentProjects.filter(p => p.published).length;
  const featured = currentProjects.filter(p => p.featured).length;
  const drafts = total - published;

  if (statTotalProjects) statTotalProjects.innerText = total;
  if (statPublishedProjects) statPublishedProjects.innerText = published;
  if (statFeaturedProjects) statFeaturedProjects.innerText = featured;
  if (statDraftProjects) statDraftProjects.innerText = drafts;
}

function resolveAdminAssetPath(path) {
  if (!path) return '../assets/images/developer.jpg';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('assets/')) {
    return '../' + path;
  }
  if (path.startsWith('./assets/')) {
    return '../' + path.substring(2);
  }
  return path;
}

function renderProjectsTable() {
  if (!projectsTableBody) return;

  const searchQuery = (projectSearchInput?.value || '').toLowerCase().trim();
  const catFilter = categoryFilterSelect?.value || 'all';

  const filtered = currentProjects.filter(p => {
    const matchesSearch = !searchQuery || 
      (p.title && p.title.toLowerCase().includes(searchQuery)) ||
      (p.tags && p.tags.join(' ').toLowerCase().includes(searchQuery));
    const matchesCat = catFilter === 'all' || p.category === catFilter;
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    projectsTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 48px;">
          ${currentProjects.length === 0 ? 'No projects in database yet. Click "+ Add New Project" or "Seed Existing Projects" to begin.' : 'No projects match the selected filter.'}
        </td>
      </tr>
    `;
    return;
  }

  projectsTableBody.innerHTML = filtered.map(p => {
    const catClass = p.category === 'mobile' ? 'cat-mobile' : p.category === 'web' ? 'cat-web' : p.category === 'presentation' ? 'cat-presentation' : 'cat-ai';
    const catLabel = p.category === 'mobile' ? 'Mobile' : p.category === 'web' ? 'Web' : p.category === 'presentation' ? 'Presentation' : 'AI';
    const tagsHtml = (p.tags || []).slice(0, 3).map(t => `<span class="badge" style="background:rgba(255,255,255,0.05); font-size:0.7rem; padding:2px 6px; border-radius:4px; margin-right:4px;">${t}</span>`).join('');
    const thumbSrc = resolveAdminAssetPath(p.image);

    return `
      <tr data-id="${p.id}">
        <td>
          <div class="project-meta-cell">
            <img src="${thumbSrc}" alt="${p.title}" class="table-thumb" onerror="this.src='../assets/images/developer.jpg'">
            <div>
              <div class="project-table-title">${p.title || 'Untitled Project'}</div>
              <div class="project-table-sub">${p.tagline || ''}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge-cat ${catClass}">${catLabel}</span>
        </td>
        <td>
          <div style="display:flex; flex-wrap:wrap; gap:2px;">${tagsHtml}</div>
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" class="toggle-featured" data-id="${p.id}" ${p.featured ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" class="toggle-published" data-id="${p.id}" ${p.published ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </td>
        <td style="text-align: right;">
          <div style="display:inline-flex; gap:8px;">
            <button class="btn btn-secondary btn-sm edit-project-btn" data-id="${p.id}" title="Edit Project">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              <span>Edit</span>
            </button>
            <button class="btn btn-danger btn-sm delete-project-btn" data-id="${p.id}" data-title="${p.title}" title="Delete Project">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  attachTableEventListeners();
}

function attachTableEventListeners() {
  // Toggle Published
  document.querySelectorAll('.toggle-published').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const id = e.target.getAttribute('data-id');
      const isPublished = e.target.checked;
      try {
        await db.collection('projects').doc(id).update({
          published: isPublished,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        const proj = currentProjects.find(p => p.id === id);
        if (proj) proj.published = isPublished;
        updateStats();
        showToast(`Project ${isPublished ? 'published' : 'moved to drafts'}`, 'success');
      } catch (err) {
        e.target.checked = !isPublished;
        showToast('Failed to update status', 'error');
      }
    });
  });

  // Toggle Featured
  document.querySelectorAll('.toggle-featured').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const id = e.target.getAttribute('data-id');
      const isFeatured = e.target.checked;
      try {
        await db.collection('projects').doc(id).update({
          featured: isFeatured,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        const proj = currentProjects.find(p => p.id === id);
        if (proj) proj.featured = isFeatured;
        updateStats();
        showToast(`Project ${isFeatured ? 'marked as Featured' : 'removed from Featured'}`, 'success');
      } catch (err) {
        e.target.checked = !isFeatured;
        showToast('Failed to update featured flag', 'error');
      }
    });
  });

  // Edit Button
  document.querySelectorAll('.edit-project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openEditModal(id);
    });
  });

  // Delete Button
  document.querySelectorAll('.delete-project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      openDeleteConfirmModal(id, title);
    });
  });
}

// Search & Category Filter Listeners
if (projectSearchInput) projectSearchInput.addEventListener('input', renderProjectsTable);
if (categoryFilterSelect) categoryFilterSelect.addEventListener('change', renderProjectsTable);

/* ==========================================================================
   3. Image Compression & Dropzone Helpers
   ========================================================================== */

/**
 * Resize and compress an image file to a lightweight data URL
 * Client-side compression guarantees zero extra costs and instant loading
 */
function compressImage(file, maxWidth = 1200, maxHeight = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function setCoverImage(dataUrlOrPath) {
  if (!dataUrlOrPath) {
    if (projectImage) projectImage.value = '';
    if (projectImageUrlInput) projectImageUrlInput.value = '';
    if (coverPreviewImg) coverPreviewImg.src = '';
    if (coverDropzoneEmpty) coverDropzoneEmpty.style.display = 'flex';
    if (coverDropzonePreview) coverDropzonePreview.style.display = 'none';
    return;
  }
  if (projectImage) projectImage.value = dataUrlOrPath;
  if (projectImageUrlInput) projectImageUrlInput.value = dataUrlOrPath;
  if (coverPreviewImg) coverPreviewImg.src = resolveAdminAssetPath(dataUrlOrPath);
  if (coverDropzoneEmpty) coverDropzoneEmpty.style.display = 'none';
  if (coverDropzonePreview) coverDropzonePreview.style.display = 'block';

  if (coverSizeBadge) {
    if (dataUrlOrPath.startsWith('data:')) {
      const approxKb = Math.round(dataUrlOrPath.length * 0.75 / 1024);
      coverSizeBadge.innerText = `${approxKb} KB (Optimized)`;
    } else {
      coverSizeBadge.innerText = 'Image Linked';
    }
  }
}

function setLogoImage(dataUrlOrPath) {
  if (!dataUrlOrPath) {
    if (projectLogo) projectLogo.value = '';
    if (logoPreviewImg) {
      logoPreviewImg.src = '';
      logoPreviewImg.style.display = 'none';
    }
    if (logoPlaceholderIcon) logoPlaceholderIcon.style.display = 'block';
    if (removeLogoBtn) removeLogoBtn.style.display = 'none';
    return;
  }
  if (projectLogo) projectLogo.value = dataUrlOrPath;
  if (logoPreviewImg) {
    logoPreviewImg.src = resolveAdminAssetPath(dataUrlOrPath);
    logoPreviewImg.style.display = 'block';
  }
  if (logoPlaceholderIcon) logoPlaceholderIcon.style.display = 'none';
  if (removeLogoBtn) removeLogoBtn.style.display = 'inline-block';
}

// Cover Dropzone Click & Drag Interactions
if (coverDropzone) {
  coverDropzone.addEventListener('click', (e) => {
    if (e.target.closest('#coverDropzoneEmpty') || e.target === coverDropzone) {
      if (projectImageFile) projectImageFile.click();
    }
  });

  coverDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    coverDropzone.classList.add('drag-over');
  });

  coverDropzone.addEventListener('dragleave', () => {
    coverDropzone.classList.remove('drag-over');
  });

  coverDropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    coverDropzone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (JPG, PNG, WEBP)', 'error');
        return;
      }
      try {
        showToast('Compressing and loading image...', 'info');
        const compressed = await compressImage(file);
        setCoverImage(compressed);
        showToast('Cover image uploaded and optimized!', 'success');
      } catch (err) {
        showToast('Failed to process image file', 'error');
      }
    }
  });
}

if (projectImageFile) {
  projectImageFile.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (JPG, PNG, WEBP)', 'error');
        return;
      }
      try {
        showToast('Compressing and loading image...', 'info');
        const compressed = await compressImage(file);
        setCoverImage(compressed);
        showToast('Cover image uploaded and optimized!', 'success');
      } catch (err) {
        showToast('Failed to process image file', 'error');
      }
    }
  });
}

if (removeCoverBtn) {
  removeCoverBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setCoverImage('');
    if (projectImageFile) projectImageFile.value = '';
  });
}

if (changeCoverBtn) {
  changeCoverBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (projectImageFile) projectImageFile.click();
  });
}

if (toggleUrlCoverBtn) {
  toggleUrlCoverBtn.addEventListener('click', () => {
    if (coverUrlInputWrapper) {
      const isVisible = coverUrlInputWrapper.style.display !== 'none';
      coverUrlInputWrapper.style.display = isVisible ? 'none' : 'block';
      toggleUrlCoverBtn.innerText = isVisible ? 'Or enter URL/path' : 'Hide URL input';
    }
  });
}

if (projectImageUrlInput) {
  projectImageUrlInput.addEventListener('input', (e) => {
    setCoverImage(e.target.value.trim());
  });
}

// Logo File Interactions
if (uploadLogoBtn && projectLogoFile) {
  uploadLogoBtn.addEventListener('click', () => projectLogoFile.click());
  projectLogoFile.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImage(file, 200, 200, 0.9);
        setLogoImage(compressed);
        showToast('Logo badge loaded!', 'success');
      } catch (err) {
        showToast('Failed to load logo image', 'error');
      }
    }
  });
}

if (removeLogoBtn) {
  removeLogoBtn.addEventListener('click', () => {
    setLogoImage('');
    if (projectLogoFile) projectLogoFile.value = '';
  });
}

/* ==========================================================================
   4. Add / Edit Modal Controls
   ========================================================================== */

function openAddModal() {
  editProjectId.value = '';
  modalFormTitle.innerText = 'Add New Project';
  projectForm.reset();
  projectPublished.checked = true;
  projectFeatured.checked = false;
  setCoverImage('');
  setLogoImage('');
  if (coverUrlInputWrapper) coverUrlInputWrapper.style.display = 'none';
  if (toggleUrlCoverBtn) toggleUrlCoverBtn.innerText = 'Or enter URL/path';
  projectModal.classList.add('active');
}

function openEditModal(id) {
  const project = currentProjects.find(p => p.id === id);
  if (!project) return;

  editProjectId.value = id;
  modalFormTitle.innerText = `Edit: ${project.title}`;
  
  projectTitle.value = project.title || '';
  projectCategory.value = project.category || 'mobile';
  projectTagline.value = project.tagline || '';
  projectDescription.value = project.description || '';
  projectFullDescription.value = project.fullDescription || project.description || '';
  projectTags.value = (project.tags || []).join(', ');
  projectFeatures.value = (project.features || []).join('\n');
  projectGithub.value = project.githubUrl || '';
  projectDemo.value = project.demoUrl || '';
  projectPublished.checked = project.published !== false;
  projectFeatured.checked = !!project.featured;

  setCoverImage(project.image || '');
  setLogoImage(project.logo || '');
  if (coverUrlInputWrapper) coverUrlInputWrapper.style.display = 'none';
  if (toggleUrlCoverBtn) toggleUrlCoverBtn.innerText = 'Or enter URL/path';

  projectModal.classList.add('active');
}

function closeProjectModal() {
  projectModal.classList.remove('active');
}

// Open/Close Modal Listeners
if (openAddProjectModalBtn) openAddProjectModalBtn.addEventListener('click', openAddModal);
if (closeProjectModalBtn) closeProjectModalBtn.addEventListener('click', closeProjectModal);
if (cancelProjectModalBtn) cancelProjectModalBtn.addEventListener('click', closeProjectModal);

// Project Form Submission (Create or Update)
if (projectForm) {
  projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = editProjectId.value.trim();
    const titleVal = projectTitle.value.trim();
    const categoryVal = projectCategory.value;
    const taglineVal = projectTagline.value.trim();
    const descVal = projectDescription.value.trim();
    const fullDescVal = projectFullDescription.value.trim() || descVal;
    const tagsArr = projectTags.value.split(',').map(t => t.trim()).filter(Boolean);
    const featuresArr = projectFeatures.value.split('\n').map(f => f.trim()).filter(Boolean);
    const imageVal = projectImage.value.trim();
    const logoVal = projectLogo.value.trim();
    const githubVal = projectGithub.value.trim();
    const demoVal = projectDemo.value.trim() || '#';
    const publishedVal = projectPublished.checked;
    const featuredVal = projectFeatured.checked;

    if (!titleVal || !taglineVal || !descVal || !imageVal || tagsArr.length === 0) {
      showToast('Please fill out all required fields and upload an image', 'error');
      return;
    }

    const payload = {
      title: titleVal,
      category: categoryVal,
      tagline: taglineVal,
      description: descVal,
      fullDescription: fullDescVal,
      tags: tagsArr,
      features: featuresArr,
      image: imageVal,
      logo: logoVal,
      githubUrl: githubVal,
      demoUrl: demoVal,
      published: publishedVal,
      featured: featuredVal,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const submitBtn = document.getElementById('saveProjectSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Saving...';

    try {
      if (id) {
        // Update Existing
        await db.collection('projects').doc(id).update(payload);
        showToast('Project updated successfully!', 'success');
      } else {
        // Create New with dynamic timestamp
        payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('projects').add(payload);
        showToast('Project published successfully!', 'success');
      }
      closeProjectModal();
      await loadProjects();
    } catch (err) {
      console.error('Save error:', err);
      showToast(`Error saving project: ${err.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Save Project';
    }
  });
}

/* ==========================================================================
   4. Delete Project Confirmation
   ========================================================================== */

function openDeleteConfirmModal(id, title) {
  pendingDeleteId = id;
  deleteProjectTitleDisplay.innerText = `"${title || 'this project'}"`;
  deleteConfirmModal.classList.add('active');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  deleteConfirmModal.classList.remove('active');
}

if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
if (cancelDeleteModalBtn) cancelDeleteModalBtn.addEventListener('click', closeDeleteModal);

if (confirmDeleteActionBtn) {
  confirmDeleteActionBtn.addEventListener('click', async () => {
    if (!pendingDeleteId) return;

    confirmDeleteActionBtn.disabled = true;
    confirmDeleteActionBtn.innerText = 'Deleting...';

    try {
      await db.collection('projects').doc(pendingDeleteId).delete();
      showToast('Project deleted permanently', 'info');
      closeDeleteModal();
      await loadProjects();
    } catch (err) {
      console.error('Delete error:', err);
      showToast(`Failed to delete: ${err.message}`, 'error');
    } finally {
      confirmDeleteActionBtn.disabled = false;
      confirmDeleteActionBtn.innerText = 'Delete Permanently';
    }
  });
}

/* ==========================================================================
   5. Seed Initial 4 Default Projects
   ========================================================================== */

const defaultSeedProjects = [
  {
    title: 'Foody',
    tagline: 'Personalized Nutrition & Diet Planning',
    category: 'mobile',
    image: 'assets/images/f.jpg',
    logo: 'assets/images/foody_logo.png',
    description: 'A complete nutrition mobile app built with Flutter and Dart that helps users calculate optimal daily calories, generate customized meal and diet plans based on health goals, and track weekly health progress in real-time.',
    fullDescription: 'Foody was designed and engineered as a modern, high-performance personal wellness assistant. Built on Flutter and Dart, it provides a seamless 60fps experience with custom meal scheduling algorithms, Riverpod state management, and real-time offline caching with Firebase.',
    tags: ['Flutter', 'Dart', 'Riverpod', 'Python', 'Firebase'],
    features: [
      'Personalized caloric requirement algorithms based on BMI & metabolic goals',
      'Daily recipe suggestions with macro-nutrient breakdown (Protein, Carbs, Fat)',
      'Smooth state management with Riverpod and real-time offline caching',
      'Interactive health analytics dashboard and progress milestone tracking'
    ],
    demoUrl: '#',
    githubUrl: 'https://github.com/codizing',
    published: true,
    featured: true,
    order: 1
  },
  {
    title: 'Coffee Shop',
    tagline: 'Complete Digital Coffee Experience',
    category: 'mobile',
    image: 'assets/images/coffeee.jpg',
    logo: 'assets/images/coffee_logo.png',
    description: 'A modern mobile ordering platform connecting coffee connoisseurs with artisanal baristas. Features customized drinks, interactive order status, secure payment processing, and customer loyalty rewards program.',
    fullDescription: 'The Coffee Shop application provides an ultra-fluid ordering workflow with custom roast, milk, and syrup modifiers. Includes an integrated loyalty rewards stamp card and push notifications for order progress updates.',
    tags: ['Flutter', 'Firebase', 'UI/UX', 'Cloud Functions', 'Stripe'],
    features: [
      'High-performance cart with custom roast, milk, and sweetener modifiers',
      'Live order tracking with push notifications via Firebase Cloud Messaging',
      'Loyalty stamp cards and in-app automated reward redemption',
      'Ultra-fluid micro-interactions and dark luxury aesthetic'
    ],
    demoUrl: '#',
    githubUrl: 'https://github.com/codizing',
    published: true,
    featured: true,
    order: 2
  },
  {
    title: 'Driving School',
    tagline: 'Web Platform & Booking System',
    category: 'web',
    image: 'assets/images/driving_school.jpg',
    logo: '',
    description: 'A complete web platform designed to streamline operations between driving schools, certified instructors, and students. Featuring automated lesson booking, student progress milestones, and comprehensive administrative dashboards.',
    fullDescription: 'Engineered as a fullstack web portal to eliminate scheduling conflicts and automate student lesson tracking. Instructors manage calendar availability and submit grading rubrics directly to students.',
    tags: ['HTML5', 'CSS3', 'PHP', 'WordPress', 'MySQL'],
    features: [
      'Intuitive instructor calendar booking with conflict prevention algorithms',
      'Student driving readiness dashboard and test syllabus checklist',
      'Secure payment gateway integration with automated invoicing',
      'Instructor grading portal with feedback reports for learners'
    ],
    demoUrl: '#',
    githubUrl: 'https://github.com/codizing',
    published: true,
    featured: true,
    order: 3
  },
  {
    title: 'CogniFlow AI',
    tagline: 'Intelligent Knowledge & Document Assistant',
    category: 'ai',
    image: 'assets/images/developer.jpg',
    logo: '',
    description: 'Enterprise AI solution leveraging Large Language Models and vector search embeddings to index organizational knowledge bases and provide instant, cited answers.',
    fullDescription: 'CogniFlow AI combines dense vector embeddings and retrieval-augmented generation (RAG) to unlock proprietary knowledge bases. Built with LangChain and Python for lightning fast question answering with source citations.',
    tags: ['Python', 'OpenAI API', 'LangChain', 'FastAPI', 'ChromaDB'],
    features: [
      'Semantic document retrieval using dense vector embeddings',
      'Streaming responses with transparent source citation links',
      'Custom LLM guardrails for enterprise privacy compliance',
      'Modular RESTful API integration for external client tools'
    ],
    demoUrl: '#',
    githubUrl: 'https://github.com/codizing',
    published: true,
    featured: true,
    order: 4
  },
  {
    title: 'Startup Pitch Deck',
    tagline: 'Investor Presentation & Visual System',
    category: 'presentation',
    image: 'assets/images/hero_showcase.jpg',
    logo: '',
    description: 'A high-impact executive presentation deck and custom design system crafted for startup investor rounds, client proposals, and product launch keynotes.',
    fullDescription: 'Custom PowerPoint slide templates and visual storyboarding designed to translate complex technological platforms into compelling investor presentations. Features bespoke data visualizations, infographics, and interactive Figma prototyping.',
    tags: ['PowerPoint', 'Figma', 'Visual Storytelling', 'Infographics'],
    features: [
      'Custom master slide design system & color token palette',
      'Data-driven charts and financial projection infographics',
      'High-conversion investor pitch deck structure',
      'Cross-platform export in PPTX, PDF, and interactive Figma'
    ],
    demoUrl: '#',
    githubUrl: 'https://github.com/codizing',
    published: true,
    featured: true,
    order: 5
  }
];

if (seedDataBtn) {
  seedDataBtn.addEventListener('click', async () => {
    if (!confirm('Import the 4 default portfolio projects into Firestore? Existing matching projects will not be overwritten.')) return;

    seedDataBtn.disabled = true;
    seedDataBtn.innerText = 'Seeding...';

    try {
      let addedCount = 0;
      for (const proj of defaultSeedProjects) {
        const exists = currentProjects.some(p => p.title.toLowerCase() === proj.title.toLowerCase());
        if (!exists) {
          await db.collection('projects').add({
            ...proj,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          addedCount++;
        }
      }
      showToast(`Successfully seeded ${addedCount} projects!`, 'success');
      await loadProjects();
    } catch (err) {
      console.error('Seed error:', err);
      showToast(`Failed to seed data: ${err.message}`, 'error');
    } finally {
      seedDataBtn.disabled = false;
      seedDataBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span>Seed Existing Projects</span>`;
    }
  });
}

/* ==========================================================================
   6. Toast Notifications Helper
   ========================================================================== */

function showToast(message, type = 'info') {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
