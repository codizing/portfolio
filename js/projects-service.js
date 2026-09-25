/**
 * Public Dynamic Projects Service (Universal Firebase + Instant Local Fallback)
 */

(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyD5eitP3x2kYvcJIuTiE0dkHGvVwaak2Fc",
    authDomain: "portfolio-dfb1b.firebaseapp.com",
    projectId: "portfolio-dfb1b",
    storageBucket: "portfolio-dfb1b.firebasestorage.app",
    messagingSenderId: "387216500569",
    appId: "1:387216500569:web:5e94b380c0c8d88264ce48"
  };

  // Default Fallback Projects (Guarantees zero flash of empty content)
  const defaultProjects = [
    {
      id: 'foody',
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
      id: 'coffee',
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
      id: 'driving',
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
      id: 'aiassistant',
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
      id: 'presentation-deck',
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

  window.PROJECTS_DATA = [...defaultProjects];

  // Initialize Firebase if library loaded
  let db = null;
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      try {
        firebase.initializeApp(firebaseConfig);
      } catch (e) {
        console.warn('Firebase init:', e);
      }
    }
    try {
      db = firebase.firestore();
    } catch (e) {}
  }

  function createProjectCardHTML(project) {
    const cat = project.category || 'mobile';
    const logoHtml = project.logo 
      ? `<img src="${project.logo}" alt="${project.title} Logo" style="width:100%; height:100%; object-fit:contain; border-radius:50%;">`
      : (cat === 'mobile' ? '📱' : cat === 'web' ? '🌐' : cat === 'presentation' ? '📊' : '🧠');

    const badgeBg = cat === 'mobile' 
      ? 'background:rgba(0, 229, 153, 0.12); border-color:rgba(0, 229, 153, 0.3);' 
      : cat === 'web' 
      ? 'background:rgba(0, 180, 216, 0.12); border-color:rgba(0, 180, 216, 0.3);'
      : cat === 'presentation'
      ? 'background:rgba(255, 114, 98, 0.12); border-color:rgba(255, 114, 98, 0.3);'
      : 'background:rgba(168, 85, 247, 0.12); border-color:rgba(168, 85, 247, 0.3);';

    const tagsHtml = (project.tags || []).map(t => `<span class="tag-badge">${t}</span>`).join('');

    return `
      <div class="project-card" data-category="${cat}" data-project-id="${project.id}">
        <div>
          <div class="project-top-row">
            <div class="project-logo-badge" style="${badgeBg} padding:4px;">
              ${logoHtml}
            </div>
            <div class="project-title-meta">
              <h3>${project.title}</h3>
              <span class="project-subtitle">${project.tagline || ''}</span>
            </div>
          </div>
          <p class="project-description">
            ${project.description || ''}
          </p>
          <div class="project-tags">
            ${tagsHtml}
          </div>
        </div>

        <div class="project-card-footer">
          <button class="btn-project-view" data-project-id="${project.id}">
            <span>View Case Study</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          <div class="project-preview-thumb">
            <img src="${project.image || 'assets/images/developer.jpg'}" alt="${project.title} preview" loading="lazy" onerror="this.src='assets/images/developer.jpg'">
          </div>
        </div>
      </div>
    `;
  }

  async function fetchPublishedProjects() {
    if (!db) return window.PROJECTS_DATA;

    try {
      const snapshot = await db.collection('projects').where('published', '==', true).get();
      if (!snapshot.empty) {
        const fetched = [];
        snapshot.forEach(docSnap => {
          fetched.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        fetched.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0));
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0));
          if (timeA && timeB && timeA !== timeB) return timeB - timeA;
          return (a.order || 99) - (b.order || 99);
        });
        window.PROJECTS_DATA = fetched;
      }
    } catch (err) {
      console.warn('Firestore fetch fallback:', err.message);
    }
    return window.PROJECTS_DATA;
  }

  async function initDynamicProjects() {
    await fetchPublishedProjects();

    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) {
      projectsGrid.innerHTML = window.PROJECTS_DATA.map(p => createProjectCardHTML(p)).join('');
    }

    const homeFeaturedGrid = document.querySelector('#homeFeaturedProjectsGrid');
    if (homeFeaturedGrid) {
      const featured = window.PROJECTS_DATA.filter(p => p.featured !== false);
      homeFeaturedGrid.innerHTML = featured.slice(0, 4).map(p => createProjectCardHTML(p)).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDynamicProjects();
  });
})();
