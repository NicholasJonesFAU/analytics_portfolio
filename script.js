'use strict';

/**
 * Portfolio — data rendering, navigation, scroll effects, and animations.
 */

const SELECTORS = {
  header: '#header',
  navToggle: '#nav-toggle',
  navMenu: '#nav-menu',
  navOverlay: '#nav-overlay',
  navLink: '.nav__link',
  section: 'section[id]',
  fadeIn: '.fade-in',
  backToTop: '#back-to-top',
  year: '#year',
  projectsGrid: '#projects-grid',
  impactGrid: '#impact-grid',
  techShowcase: '#tech-showcase',
  impactCounter: '.impact-card__number',
};

const SCROLL = {
  headerOffset: 50,
  backToTopThreshold: 400,
};

const MEDIA_MOBILE = window.matchMedia('(max-width: 768px)');

let focusTrapHandler = null;
let lastFocusedBeforeMenu = null;

document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    header: document.querySelector(SELECTORS.header),
    navToggle: document.querySelector(SELECTORS.navToggle),
    navMenu: document.querySelector(SELECTORS.navMenu),
    navOverlay: document.querySelector(SELECTORS.navOverlay),
    navLinks: document.querySelectorAll(SELECTORS.navLink),
    sections: document.querySelectorAll(SELECTORS.section),
    backToTop: document.querySelector(SELECTORS.backToTop),
    year: document.querySelector(SELECTORS.year),
    projectsGrid: document.querySelector(SELECTORS.projectsGrid),
    impactGrid: document.querySelector(SELECTORS.impactGrid),
    techShowcase: document.querySelector(SELECTORS.techShowcase),
  };

  if (!elements.header || !elements.navToggle || !elements.navMenu) {
    return;
  }

  const data = await loadPortfolioData();
  renderMetrics(data.metrics, elements.impactGrid);
  renderTechnologyCategories(data, elements.techShowcase);
  renderProjects(data.projects, elements.projectsGrid);

  initNavigation(elements);
  initScrollEffects(elements);
  initRevealAnimations();
  initCounterAnimations();
  initFooterYear(elements.year);
  MEDIA_MOBILE.addEventListener('change', () => closeMobileMenu(elements));
});

/* --------------------------------------------
   Data loading & rendering
   -------------------------------------------- */
async function loadPortfolioData() {
  if (window.PORTFOLIO_DATA) {
    return window.PORTFOLIO_DATA;
  }

  try {
    const response = await fetch('data.json', { cache: 'no-cache' });
    if (response.ok) {
      return response.json();
    }
  } catch (_) {
    /* fall through */
  }

  return { projects: [], metrics: [], technologyCategories: [] };
}

function formatMetricNumber(value, useGrouping = false) {
  if (useGrouping) {
    return value.toLocaleString('en-US');
  }

  return String(value);
}

function renderMetrics(metrics, container) {
  if (!container || !Array.isArray(metrics)) {
    return;
  }

  container.innerHTML = metrics.map((metric) => {
    const formattedValue = formatMetricNumber(metric.value, metric.format);
    const displayValue = `${formattedValue}${metric.suffix || ''}`;

    return `
      <li class="impact-card fade-in">
        <p class="impact-card__value">
          <span
            class="impact-card__number"
            data-target="${metric.value}"
            data-suffix="${escapeHtml(metric.suffix || '')}"
            data-format="${metric.format ? 'true' : 'false'}"
            aria-label="${escapeHtml(displayValue)} ${escapeHtml(metric.label)}"
          >0${escapeHtml(metric.suffix || '')}</span>
        </p>
        <p class="impact-card__label">${escapeHtml(metric.label)}</p>
      </li>
    `;
  }).join('');
}

function renderTechnologyCategories(data, container) {
  if (!container) {
    return;
  }

  const categories = data.technologyCategories || (Array.isArray(data.featuredTechnologies)
    ? [{ name: 'Analytics Toolkit', emphasis: true, items: data.featuredTechnologies }]
    : []);

  if (!categories.length) {
    return;
  }

  container.innerHTML = categories.map((category) => {
    const emphasisClass = category.emphasis ? ' tech-showcase__category--emphasis' : '';

    return `
      <section class="tech-showcase__category${emphasisClass}">
        <h3 class="tech-showcase__category-title">${escapeHtml(category.name)}</h3>
        <ul class="tech-showcase__list" aria-label="${escapeHtml(category.name)}">
          ${category.items.map((tech) => `
            <li class="tech-showcase__item fade-in">
              <span class="tech-showcase__badge">${escapeHtml(tech)}</span>
            </li>
          `).join('')}
        </ul>
      </section>
    `;
  }).join('');
}

function renderProjectLink(project) {
  if (project.professionalWork) {
    return '<span class="project-card__status project-card__status--professional">Professional Work</span>';
  }

  if (!project.githubUrl) {
    return '<span class="project-card__status">Repository coming soon</span>';
  }

  const badgeNote = project.githubComingSoon
    ? '<span class="project-card__placeholder">Coming Soon</span>'
    : project.githubPlaceholder
      ? '<span class="project-card__placeholder">Placeholder URL</span>'
      : '';
  const linkTitle = project.githubComingSoon
    ? ' title="Repository link — project may still be in progress"'
    : project.githubPlaceholder
      ? ' title="Placeholder repository URL — update in data.js"'
      : '';

  return `
    <a href="${escapeHtml(project.githubUrl)}" class="project-card__link" target="_blank" rel="noopener noreferrer"${linkTitle} aria-label="View ${escapeHtml(project.title)} on GitHub${project.githubComingSoon ? ' (coming soon)' : ''}${project.githubPlaceholder ? ' (placeholder URL)' : ''}">
      View on GitHub
      ${badgeNote}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </a>
  `;
}

function renderProjects(projects, container) {
  if (!container || !Array.isArray(projects)) {
    return;
  }

  container.innerHTML = projects.map((project) => `
    <article class="project-card fade-in">
      <div class="project-card__header">
        ${project.tags.map((tag) => `<span class="project-card__tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
      <h3 class="project-card__title">${escapeHtml(project.title)}</h3>
      <p class="project-card__desc">${escapeHtml(project.description)}</p>
      <ul class="project-card__tech" aria-label="Technologies used">
        ${project.technologies.map((tech) => `<li>${escapeHtml(tech)}</li>`).join('')}
      </ul>
      <div class="project-card__impact">
        <h4 class="project-card__impact-title">Analytics Impact</h4>
        <p class="project-card__impact-text">${escapeHtml(project.impact)}</p>
      </div>
      ${renderProjectLink(project)}
    </article>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* --------------------------------------------
   Shared utilities
   -------------------------------------------- */
function createIntersectionObserver(callback, options = {}) {
  if (!('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, options);
}

function onScrollThrottled(callback) {
  let ticking = false;

  return () => {
    if (ticking) {
      return;
    }

    ticking = true;
    requestAnimationFrame(() => {
      callback();
      ticking = false;
    });
  };
}

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter((el) => !el.hidden && el.getAttribute('aria-hidden') !== 'true');
}

function trapFocus(container) {
  releaseFocusTrap();

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  focusTrapHandler = (event) => {
    if (event.key !== 'Tab') {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  document.addEventListener('keydown', focusTrapHandler);
}

function releaseFocusTrap() {
  if (focusTrapHandler) {
    document.removeEventListener('keydown', focusTrapHandler);
    focusTrapHandler = null;
  }
}

/* --------------------------------------------
   Navigation
   -------------------------------------------- */
function initNavigation(elements) {
  const { navToggle, navMenu, navOverlay, navLinks } = elements;

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.contains('open');
    isOpen ? closeMobileMenu(elements) : openMobileMenu(elements);
  });

  navOverlay?.addEventListener('click', () => closeMobileMenu(elements));

  navLinks.forEach((link) => {
    link.addEventListener('click', () => closeMobileMenu(elements));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMobileMenu(elements);
      navToggle.focus();
    }
  });
}

function openMobileMenu(elements) {
  const { navToggle, navMenu, navOverlay, navLinks } = elements;

  lastFocusedBeforeMenu = document.activeElement;
  navMenu.classList.add('open');
  navToggle.classList.add('active');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Close navigation menu');
  document.body.classList.add('nav-open');

  if (navOverlay) {
    navOverlay.hidden = false;
  }

  navMenu.setAttribute('aria-modal', 'true');
  trapFocus(navMenu);

  const firstLink = navLinks[0];
  if (firstLink) {
    firstLink.focus();
  }
}

function closeMobileMenu(elements) {
  const { navToggle, navMenu, navOverlay } = elements;

  navMenu.classList.remove('open');
  navToggle.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open navigation menu');
  document.body.classList.remove('nav-open');

  if (navOverlay) {
    navOverlay.hidden = true;
  }

  navMenu.removeAttribute('aria-modal');
  releaseFocusTrap();

  if (lastFocusedBeforeMenu && typeof lastFocusedBeforeMenu.focus === 'function') {
    lastFocusedBeforeMenu.focus();
  }

  lastFocusedBeforeMenu = null;
}

/* --------------------------------------------
   Scroll effects
   -------------------------------------------- */
function initScrollEffects({ header, navLinks, sections, backToTop }) {
  const sectionObserver = createIntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const sectionId = entry.target.id;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute('href') === `#${sectionId}`;
          link.classList.toggle('active', isActive);
          link.toggleAttribute('aria-current', isActive);
        });
      });
    },
    {
      rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim() || '72px'} 0px -55% 0px`,
      threshold: 0,
    }
  );

  sections.forEach((section) => sectionObserver?.observe(section));

  const handleScroll = onScrollThrottled(() => {
    const scrollY = window.scrollY;
    header.classList.toggle('scrolled', scrollY > SCROLL.headerOffset);

    if (backToTop) {
      const showBackToTop = scrollY > SCROLL.backToTopThreshold;
      backToTop.classList.toggle('visible', showBackToTop);
      backToTop.hidden = !showBackToTop;
    }
  });

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------
   Reveal animations
   -------------------------------------------- */
function initRevealAnimations() {
  const fadeElements = document.querySelectorAll(SELECTORS.fadeIn);
  const heroElements = document.querySelectorAll('.hero .fade-in');

  heroElements.forEach((element) => element.classList.add('visible'));

  const observer = createIntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  if (!observer) {
    fadeElements.forEach((element) => element.classList.add('visible'));
    return;
  }

  fadeElements.forEach((element) => {
    if (!element.classList.contains('visible')) {
      observer.observe(element);
    }
  });
}

/* --------------------------------------------
   Impact counter animations
   -------------------------------------------- */
function initCounterAnimations() {
  const counters = document.querySelectorAll(SELECTORS.impactCounter);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCounter = (element) => {
    const target = Number(element.dataset.target) || 0;
    const suffix = element.dataset.suffix || '';
    const useGrouping = element.dataset.format === 'true';
    const finalValue = `${formatMetricNumber(target, useGrouping)}${suffix}`;

    if (prefersReducedMotion) {
      element.textContent = finalValue;
      element.setAttribute('aria-label', finalValue);
      return;
    }

    const duration = 1500;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(target * eased);
      element.textContent = `${formatMetricNumber(current, useGrouping)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = finalValue;
        element.setAttribute('aria-label', finalValue);
      }
    };

    requestAnimationFrame(step);
  };

  const observer = createIntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  if (!observer) {
    counters.forEach(animateCounter);
    return;
  }

  counters.forEach((counter) => observer.observe(counter));
}

/* --------------------------------------------
   Footer year
   -------------------------------------------- */
function initFooterYear(yearEl) {
  if (!yearEl) {
    return;
  }

  const year = new Date().getFullYear();
  yearEl.textContent = String(year);
  yearEl.setAttribute('datetime', String(year));
}
