const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-link');
const revealItems = document.querySelectorAll('.reveal');
const contactForm = document.querySelector('.contact-form');
const themeToggle = document.querySelector('.theme-toggle');
const pageSections = document.querySelectorAll('main section[id]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wordRevealSelector = '.hero-content h1, .hero-content h2, .hero-text, .page-hero h1, .page-hero > p:not(.eyebrow)';
const wordRevealTargets = document.querySelectorAll(wordRevealSelector);

document.documentElement.classList.add('js-enabled');

window.requestAnimationFrame(() => {
  document.body.classList.add('is-ready');
});

function prepareWordReveal(element) {
  if (prefersReducedMotion || element.dataset.wordsReady === 'true') {
    return;
  }

  const fullText = element.textContent.trim();
  const words = fullText.split(/\s+/).filter(Boolean);

  if (words.length < 2) {
    return;
  }

  element.textContent = '';
  element.classList.add('word-reveal');
  element.setAttribute('aria-label', fullText);

  words.forEach((word, index) => {
    const wordWrap = document.createElement('span');
    wordWrap.className = 'word';
    wordWrap.style.setProperty('--word-delay', `${Math.min(index * 55, 560)}ms`);

    const wordInner = document.createElement('span');
    wordInner.className = 'word-inner';
    wordInner.setAttribute('aria-hidden', 'true');
    wordInner.textContent = word;

    wordWrap.appendChild(wordInner);
    element.appendChild(wordWrap);
  });

  element.dataset.wordsReady = 'true';
}

function revealWordsIn(container) {
  if (prefersReducedMotion) {
    return;
  }

  const targets = container.querySelectorAll(wordRevealSelector);
  targets.forEach((target) => target.classList.add('words-visible'));
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
    themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  }
}

function setActiveNav(hash) {
  navItems.forEach((item) => {
    const isActive = item.getAttribute('href') === hash;
    item.classList.toggle('active', isActive);

    if (isActive) {
      item.setAttribute('aria-current', 'page');
    } else {
      item.removeAttribute('aria-current');
    }
  });
}

if (themeToggle) {
  const currentTheme = document.documentElement.dataset.theme || 'dark';
  setTheme(currentTheme);

  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  });
}

if (pageSections.length > 0 && navItems.length > 0) {
  const initialHash = window.location.hash && document.querySelector(window.location.hash) ? window.location.hash : '#home';
  setActiveNav(initialHash);

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNav(`#${entry.target.id}`);
        }
      });
    }, {
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0.12,
    });

    pageSections.forEach((section) => sectionObserver.observe(section));
  }
}

wordRevealTargets.forEach((target) => prepareWordReveal(target));

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      if (navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

revealItems.forEach((item, index) => {
  item.style.setProperty('--reveal-delay', `${Math.min(index * 70, 420)}ms`);
});

if ('IntersectionObserver' in window && revealItems.length > 0) {
  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealWordsIn(entry.target);
        observerInstance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => {
    item.classList.add('visible');
    revealWordsIn(item);
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) {
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Message Sent';
      submitButton.disabled = true;
      window.setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        contactForm.reset();
      }, 1800);
    }
  });
}
