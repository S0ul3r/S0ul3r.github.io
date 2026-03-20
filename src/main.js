import './style.css';
import { cv, devicons } from './data.js';
import { initParticles, updateMouse } from './particles.js';

function esc(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function youtubeIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?[^#]*v=))([\w-]{11})/);
  return m ? m[1] : null;
}

function iconFor(keyword) {
  const cls = devicons[keyword];
  return cls ? `<i class="${cls} colored"></i>` : '';
}

function renderTags(tags) {
  if (!tags?.length) return '';
  const items = tags.map((t) => {
    const icon = iconFor(t);
    return `<span class="tag">${icon} ${esc(t)}</span>`;
  });
  return `<div class="tags">${items.join('')}</div>`;
}

const summaryEl = document.getElementById('hero-summary');
summaryEl.textContent = cv.summary.content;

const navEl = document.getElementById('sidebar-nav');
navEl.innerHTML = cv.nav
  .map((n) => `<a class="nav-link" href="${n.href}">${n.label}</a>`)
  .join('');

const socialEl = document.getElementById('sidebar-social');
socialEl.innerHTML = `
  <a href="${esc(cv.basics.github.url)}" target="_blank" rel="noopener" class="social-link" aria-label="GitHub">
    <i class="devicon-github-original"></i>
  </a>
  <a href="${esc(cv.basics.linkedin.url)}" target="_blank" rel="noopener" class="social-link" aria-label="LinkedIn">
    <i class="devicon-linkedin-plain"></i>
  </a>
  <a href="mailto:${esc(cv.basics.email)}" class="social-link" aria-label="Email">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  </a>
`;

document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('experience-list').innerHTML = cv.experience
  .map(
    (e) => `
  <article class="card reveal">
    <div class="card-inner">
      <div class="card-period">${esc(e.period)}</div>
      <div class="card-body">
        <h3 class="card-title">
          ${e.website ? `<a href="${esc(e.website)}" target="_blank" rel="noopener">${esc(e.position)}</a>` : esc(e.position)}
        </h3>
        <p class="card-subtitle">
          ${e.website ? `<a href="${esc(e.website)}" target="_blank" rel="noopener">${esc(e.company)}</a>` : esc(e.company)}${e.location ? ` · ${esc(e.location)}` : ''}
        </p>
        <p class="card-description">${esc(e.description)}</p>
        ${renderTags(e.tags)}
      </div>
    </div>
  </article>`
  )
  .join('');

document.getElementById('projects-list').innerHTML = cv.projects
  .map((p) => {
    const imageLink = p.videoUrl || p.website;
    const imageSrc = p.image ? esc(p.image) : '';
    const ytId = youtubeIdFromUrl(p.videoUrl);
    const ytAttr = ytId ? ` data-youtube-hover="${esc(ytId)}"` : '';
    const previewHtml = ytId
      ? `<div class="project-thumb-preview project-thumb-preview--yt" aria-hidden="true">
          <iframe
            class="project-preview-iframe"
            title=""
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>`
      : `<img class="project-thumb-preview" src="${imageSrc}" alt="" aria-hidden="true" loading="lazy" decoding="async" />`;
    const imageHtml = imageSrc
      ? `<a href="${esc(imageLink)}" target="_blank" rel="noopener" class="card-project-image${ytId ? ' card-project-image--yt' : ''}" title="${esc(p.name)}"${ytAttr}>
          <img class="project-thumb project-thumb-small" src="${imageSrc}" alt="${esc(p.name)}" loading="lazy" decoding="async" />
          ${previewHtml}
        </a>`
      : '';

    return `
  <article class="card card-project reveal">
    ${imageHtml}
    <div class="card-project-body">
      <h3 class="card-title">
        ${p.website
          ? `<a href="${esc(p.website)}" target="_blank" rel="noopener">${esc(p.name)} <span class="arrow">↗</span></a>`
          : esc(p.name)}
      </h3>
      <p class="card-description">${esc(p.description)}</p>
      ${renderTags(p.tags)}
    </div>
  </article>`;
  })
  .join('');

const projectThumbImgs = document.querySelectorAll(
  '#projects-list .card-project-image img.project-thumb-small'
);
projectThumbImgs.forEach((img) => {
  const parent = img.parentElement;
  const setVars = () => {
    if (parent?.hasAttribute('data-youtube-hover')) return;

    const nw = img.naturalWidth || img.width;
    const nh = img.naturalHeight || img.height;
    if (!nw || !nh) return;

    const maxW = 720;
    const maxH = 580;
    const scale = Math.min(maxW / nw, maxH / nh, 1);

    parent.style.setProperty('--img-w', `${Math.round(nw * scale)}px`);
    parent.style.setProperty('--img-h', `${Math.round(nh * scale)}px`);
  };

  if (img.complete) setVars();
  img.addEventListener('load', setVars, { once: true });
});

document.querySelectorAll('#projects-list .card-project-image[data-youtube-hover]').forEach((link) => {
  const id = link.getAttribute('data-youtube-hover');
  const iframe = link.querySelector('iframe.project-preview-iframe');
  if (!id || !iframe) return;

  // Standard youtube.com embed: fewer blockers than youtube-nocookie; mute+playsinline required for autoplay
  const embedUrl =
    `https://www.youtube.com/embed/${encodeURIComponent(id)}` +
    '?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1';

  let hideTimer = 0;
  const startPreview = () => {
    window.clearTimeout(hideTimer);
    if (!iframe.getAttribute('src')) {
      iframe.src = embedUrl;
      iframe.title = 'YouTube video preview';
    }
  };
  const stopPreview = () => {
    window.clearTimeout(hideTimer);
    // Delay clearing so brief pointer moves (fixed preview vs <a> hit area) don't unload before first paint
    hideTimer = window.setTimeout(() => {
      iframe.removeAttribute('src');
    }, 500);
  };

  link.addEventListener('mouseenter', startPreview);
  link.addEventListener('mouseleave', stopPreview);
  link.addEventListener('focusin', startPreview);
  link.addEventListener('focusout', stopPreview);
});

document.getElementById('skills-list').innerHTML = cv.skills
  .map(
    (s) => `
  <div class="skill-group reveal">
    <h4 class="skill-name">${esc(s.name)}</h4>
    <div class="skill-tags">
      ${s.keywords.map((k) => `<span class="skill-tag">${iconFor(k)} ${esc(k)}</span>`).join('')}
    </div>
  </div>`
  )
  .join('');

document.getElementById('certifications-list').innerHTML = cv.certifications
  .map(
    (c) => `
  <div class="card card-compact reveal">
    <div class="card-inner">
      <div class="card-period">${esc(c.date)}</div>
      <div class="card-body">
        <h4 class="card-title">${esc(c.title)}</h4>
        <p class="card-subtitle">${esc(c.issuer)}</p>
      </div>
    </div>
  </div>`
  )
  .join('');

document.getElementById('education-list').innerHTML = cv.education
  .map(
    (e) => `
  <div class="card card-compact reveal">
    <div class="card-inner">
      <div class="card-period">${esc(e.period)}</div>
      <div class="card-body">
        <h4 class="card-title">${e.website ? `<a href="${esc(e.website)}" target="_blank" rel="noopener">${esc(e.school)}</a>` : esc(e.school)}</h4>
        <p class="card-subtitle">${esc(e.area)}</p>
      </div>
    </div>
  </div>`
  )
  .join('');

document.getElementById('languages-list').innerHTML = cv.languages
  .map(
    (l) => `
  <div class="language-row reveal">
    <span class="language-name">${esc(l.language)}</span>
    <span class="language-fluency">${esc(l.fluency)}</span>
  </div>`
  )
  .join('');

// ── Render interests ──

const interestsListEl = document.getElementById('interests-list');
interestsListEl.innerHTML =
  cv.interests
    .map(
      (i) => `
  <div class="interest reveal">
    <h4 class="interest-name">${esc(i.name)}</h4>
    <p class="interest-keywords">${i.keywords.map((k) => esc(k)).join(', ')}</p>
  </div>`
    )
    .join('') +
  (cv.interestsVideo
    ? `
  <a href="${esc(cv.interestsVideo.url)}" target="_blank" rel="noopener" class="interest-video reveal" aria-label="${esc(cv.interestsVideo.label)}">
    <img src="${esc(cv.interestsVideo.thumbnail)}" alt="${esc(cv.interestsVideo.label)}" loading="lazy" />
    <span class="interest-video-label">${esc(cv.interestsVideo.label)} → YouTube</span>
  </a>`
    : '');

const glowEl = document.getElementById('mouse-glow');

initParticles();

document.addEventListener('mousemove', (e) => {
  updateMouse(e.clientX, e.clientY);
  requestAnimationFrame(() => {
    glowEl.style.setProperty('--glow-x', e.clientX + 'px');
    glowEl.style.setProperty('--glow-y', e.clientY + 'px');
  });
});

function typeText(element, text, speed = 70) {
  return new Promise((resolve) => {
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    element.textContent = '';
    element.appendChild(cursor);

    const interval = setInterval(() => {
      element.textContent = text.slice(0, ++i);
      element.appendChild(cursor);
      if (i >= text.length) {
        clearInterval(interval);
        resolve(cursor);
      }
    }, speed);
  });
}

async function runTypingAnimation() {
  const nameEl = document.getElementById('hero-name-visible');
  const headlineEl = document.getElementById('hero-headline');

  const cursor1 = await typeText(nameEl, cv.basics.name, 70);
  cursor1.remove();

  const cursor2 = await typeText(headlineEl, cv.basics.headline, 40);

  setTimeout(() => {
    cursor2.classList.add('fade-out');
  }, 2000);
}

runTypingAnimation();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 5) * 80}ms`;
  revealObserver.observe(el);
});

const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
  const viewportTop = 0.25 * window.innerHeight;
  let activeId = sections[0]?.id ?? '';
  for (const section of sections) {
    const top = section.getBoundingClientRect().top;
    if (top <= viewportTop) {
      activeId = section.id;
    }
  }
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
  });
}

window.addEventListener('scroll', () => requestAnimationFrame(updateActiveNav));
window.addEventListener('resize', () => requestAnimationFrame(updateActiveNav));
updateActiveNav();
