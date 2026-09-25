/**
 * Abdelaziz Portfolio - Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCounters();
  initProjectModals();
  initProjectFilters();
  initContactForm();
  initFAQ();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Dark / Light)
   -------------------------------------------------------------------------- */
// function initTheme() {
//   const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
//   const savedTheme = localStorage.getItem('az-portfolio-theme') || 'dark';
  
//   applyTheme(savedTheme);

//   themeToggleBtns.forEach(btn => {
//     btn.addEventListener('click', () => {
//       const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
//       const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
//       applyTheme(newTheme);
//       localStorage.setItem('az-portfolio-theme', newTheme);
//     });
//   });
// }

// function applyTheme(theme) {
//   document.documentElement.setAttribute('data-theme', theme);
//   const themeIcons = document.querySelectorAll('.theme-icon');
//   themeIcons.forEach(icon => {
//     if (theme === 'light') {
//       // Moon icon for switching back to dark
//       icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
//       icon.setAttribute('title', 'Switch to Dark Mode');
//     } else {
//       // Sun icon for switching to light
//       icon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
//       icon.setAttribute('title', 'Switch to Light Mode');
//     }
//   });
// }

/* --------------------------------------------------------------------------
   2. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    menuBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close when clicking nav link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

/* --------------------------------------------------------------------------
   3. Animated Stat Counters
   -------------------------------------------------------------------------- */
function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(el) {
  const text = el.innerText.trim();
  if (text.includes('∞')) return; // keep infinity symbol intact

  const target = parseInt(text, 10);
  if (isNaN(target)) return;

  const suffix = text.includes('+') ? '+' : '';
  let count = 0;
  const duration = 1200;
  const stepTime = Math.max(20, Math.floor(duration / target));

  const timer = setInterval(() => {
    count++;
    el.innerText = `${count}${suffix}`;
    if (count >= target) {
      clearInterval(timer);
    }
  }, stepTime);
}

/* --------------------------------------------------------------------------
   4. Projects Data & Modal Details
   -------------------------------------------------------------------------- */
const projectsDatabase = {
  foody: {
    title: 'Foody',
    tagline: 'Personalized Nutrition & Diet Planning',
    category: 'mobile',
    image: 'assets/images/f.jpg',
    description: 'A complete nutrition mobile app built with Flutter and Dart that helps users calculate optimal daily calories, generate customized meal and diet plans based on health goals, and track weekly health progress in real-time.',
    tags: ['Flutter', 'Dart', 'Riverpod', 'Python', 'Firebase'],
    features: [
      'Personalized caloric requirement algorithms based on BMI & metabolic goals',
      'Daily recipe suggestions with macro-nutrient breakdown (Protein, Carbs, Fat)',
      'Smooth state management with Riverpod and real-time offline caching',
      'Interactive health analytics dashboard and progress milestone tracking'
    ],
    demoUrl: '#',
    githubUrl: 'https://github.com/abdelaziz/foody-app'
  },
  coffee: {
    title: 'Coffee Shop',
    tagline: 'Complete Digital Coffee Experience',
    category: 'mobile',
    image: 'assets/images/coffeee.jpg',
    description: 'A modern mobile ordering platform connecting coffee connoisseurs with artisanal baristas. Features customized drinks, interactive order status, secure payment processing, and customer loyalty rewards program.',
    tags: ['Flutter', 'Firebase', 'UI/UX', 'Cloud Functions', 'Stripe'],
    features: [
      'High-performance cart with custom roast, milk, and sweetener modifiers',
      'Live order tracking with push notifications via Firebase Cloud Messaging',
      'Loyalty stamp cards and in-app automated reward redemption',
      'Ultra-fluid micro-interactions and dark luxury aesthetic'
    ],
    demoUrl: '#',
    githubUrl: 'https://github.com/abdelaziz/coffee-shop-app'
  },
  driving: {
    title: 'Driving School',
    tagline: 'Web Platform & Booking System',
    category: 'web',
    image: 'assets/images/driving_school.jpg',
    description: 'A complete web platform designed to streamline operations between driving schools, certified instructors, and students. Featuring automated lesson booking, student progress milestones, and comprehensive administrative dashboards.',
    tags: ['HTML5', 'CSS3', 'PHP', 'WordPress', 'MySQL'],
    features: [
      'Intuitive instructor calendar booking with conflict prevention algorithms',
      'Student driving readiness dashboard and test syllabus checklist',
      'Secure payment gateway integration with automated invoicing',
      'Instructor grading portal with feedback reports for learners'
    ],
    demoUrl: '#',
    githubUrl: 'https://github.com/abdelaziz/driving-school-platform'
  },
  aiassistant: {
    title: 'CogniFlow AI',
    tagline: 'Intelligent Knowledge & Document Assistant',
    category: 'ai',
    image: 'assets/images/developer.jpg',
    description: 'Enterprise AI solution leveraging Large Language Models and vector search embeddings to index organizational knowledge bases and provide instant, cited answers.',
    tags: ['Python', 'OpenAI API', 'LangChain', 'FastAPI', 'ChromaDB'],
    features: [
      'Semantic document retrieval using dense vector embeddings',
      'Streaming responses with transparent source citation links',
      'Custom LLM guardrails for enterprise privacy compliance',
      'Modular RESTful API integration for external client tools'
    ],
    demoUrl: '#',
    githubUrl: 'https://github.com/abdelaziz/cogniflow-ai'
  }
};

function initProjectModals() {
  const modalOverlay = document.getElementById('projectModal');
  if (!modalOverlay) return;

  const closeBtn = modalOverlay.querySelector('.modal-close-btn');

  function openProjectModal(projectId) {
    // 1. Search in dynamic window.PROJECTS_DATA from Firestore
    let project = null;
    if (window.PROJECTS_DATA && window.PROJECTS_DATA.length > 0) {
      project = window.PROJECTS_DATA.find(p => p.id === projectId || p.title?.toLowerCase() === projectId?.toLowerCase());
    }
    // 2. Fallback to static database object
    if (!project) {
      project = projectsDatabase[projectId];
    }
    if (!project) return;

    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalImage = document.getElementById('modalImage');
    const modalVideoFrame = document.getElementById('modalVideoFrame');
    const modalVideoPlayer = document.getElementById('modalVideoPlayer');
    const tagsContainer = document.getElementById('modalTags');
    const featuresContainer = document.getElementById('modalFeatures');
    const demoBtn = document.getElementById('modalDemoBtn');
    const ghBtn = document.getElementById('modalGhBtn');

    if (modalTitle) modalTitle.innerText = project.title;
    if (modalSubtitle) modalSubtitle.innerText = project.tagline || '';
    if (modalDesc) modalDesc.innerText = project.fullDescription || project.description || '';

    // Handle Media Display (Video Embed / Video File / Image / GIF)
    const videoUrl = project.demoUrl || '';
    const embedUrl = getEmbedUrl(videoUrl);
    const isDirectVideo = (project.image && (project.image.endsWith('.mp4') || project.image.endsWith('.webm') || project.image.startsWith('data:video/'))) ||
                          (videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm')));

    if (embedUrl && modalVideoFrame) {
      modalVideoFrame.src = embedUrl;
      modalVideoFrame.style.display = 'block';
      if (modalImage) modalImage.style.display = 'none';
      if (modalVideoPlayer) modalVideoPlayer.style.display = 'none';
    } else if (isDirectVideo && modalVideoPlayer) {
      modalVideoPlayer.src = project.image.endsWith('.mp4') ? project.image : videoUrl;
      modalVideoPlayer.style.display = 'block';
      if (modalImage) modalImage.style.display = 'none';
      if (modalVideoFrame) modalVideoFrame.style.display = 'none';
    } else if (modalImage) {
      modalImage.src = project.image || 'assets/images/developer.jpg';
      modalImage.alt = project.title;
      modalImage.style.display = 'block';
      if (modalVideoFrame) {
        modalVideoFrame.src = '';
        modalVideoFrame.style.display = 'none';
      }
      if (modalVideoPlayer) {
        modalVideoPlayer.pause();
        modalVideoPlayer.style.display = 'none';
      }
    }

    if (tagsContainer) {
      tagsContainer.innerHTML = (project.tags || []).map(t => `<span class="tag-badge">${t}</span>`).join('');
    }

    if (featuresContainer) {
      const featuresList = project.features && project.features.length > 0
        ? project.features
        : ['Cross-platform high performance', 'Clean domain architecture', 'Real-time cloud synchronization'];
      featuresContainer.innerHTML = featuresList.map(f => `<li>${f}</li>`).join('');
    }

    if (demoBtn) {
      if (project.demoUrl && project.demoUrl !== '#') {
        demoBtn.href = project.demoUrl;
        demoBtn.style.display = 'inline-flex';
        if (project.category === 'presentation') {
          demoBtn.innerHTML = `<span>Watch Full Video / Presentation</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        } else {
          demoBtn.innerHTML = `<span>Launch Live Demo</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
        }
      } else {
        demoBtn.style.display = 'none';
      }
    }

    if (ghBtn) {
      const isPresentation = project.category === 'presentation';
      if (project.githubUrl && project.githubUrl !== '#' && !isPresentation) {
        ghBtn.href = project.githubUrl;
        ghBtn.style.display = 'inline-flex';
      } else {
        ghBtn.style.display = 'none';
      }
    }

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function getEmbedUrl(url) {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }
    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/i);
    if (loomMatch && loomMatch[1]) {
      return `https://www.loom.com/embed/${loomMatch[1]}?autoplay=1`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
    return null;
  }

  function closeProjectModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    const modalVideoFrame = document.getElementById('modalVideoFrame');
    const modalVideoPlayer = document.getElementById('modalVideoPlayer');
    if (modalVideoFrame) modalVideoFrame.src = '';
    if (modalVideoPlayer) {
      modalVideoPlayer.pause();
      modalVideoPlayer.src = '';
    }
  }

  // Bind click event using event delegation for all view buttons and project cards
  document.addEventListener('click', (e) => {
    const targetBtn = e.target.closest('[data-project-id]');
    if (targetBtn) {
      e.preventDefault();
      const projectId = targetBtn.getAttribute('data-project-id');
      openProjectModal(projectId);
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeProjectModal();
    });
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeProjectModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeProjectModal();
    }
  });
}

/* --------------------------------------------------------------------------
   5. Projects Filtering on Projects Page
   -------------------------------------------------------------------------- */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const projectCards = document.querySelectorAll('.project-card[data-category]');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   6. Contact Form Validation & Toast
   -------------------------------------------------------------------------- */
function initContactForm() {
  const contactForms = document.querySelectorAll('.contact-form');
  contactForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = form.querySelector('input[type="text"]');
      const emailInput = form.querySelector('input[type="email"]');
      const msgInput = form.querySelector('textarea');

      if (!nameInput.value.trim() || !emailInput.value.trim() || !msgInput.value.trim()) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>Sending...</span>`;
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        form.reset();
        showToast('Thank you! Your message has been sent successfully.', 'success');
      }, 900);
    });
  });
}

function showToast(message, type = 'success') {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? '✓' : '⚠';
  toast.innerHTML = `<span style="color:var(--accent-primary);font-weight:bold;font-size:1.1rem;">${icon}</span><span>${message}</span>`;
  
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* --------------------------------------------------------------------------
   7. FAQ Accordion (Contact Page)
   -------------------------------------------------------------------------- */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}
