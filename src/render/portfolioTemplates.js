/**
 * Pure HTML string builders for CV sections (no DOM side effects).
 */

function iconFor(devicons, keyword) {
  const cls = devicons[keyword];
  return cls ? `<i class="${cls} colored"></i>` : '';
}

function renderTags(devicons, tags, escapeHtml) {
  if (!tags?.length) return '';
  const items = tags.map((t) => {
    const icon = iconFor(devicons, t);
    return `<span class="tag">${icon} ${escapeHtml(t)}</span>`;
  });
  return `<div class="tags">${items.join('')}</div>`;
}

/** @param {object} cv @param {Record<string, string>} _devicons @param {{ escapeHtml: (s: unknown) => string }} h */
export function buildNavHtml(cv, _devicons, { escapeHtml }) {
  return cv.nav.map((n) => `<a class="nav-link" href="${escapeHtml(n.href)}">${escapeHtml(n.label)}</a>`).join('');
}

/** @param {object} cv @param {Record<string, string>} _devicons @param {{ escapeHtml: (s: unknown) => string }} h */
export function buildSocialHtml(cv, _devicons, { escapeHtml }) {
  const { github, linkedin, email } = cv.basics;
  return `
  <a href="${escapeHtml(github.url)}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="GitHub">
    <i class="devicon-github-original"></i>
  </a>
  <a href="${escapeHtml(linkedin.url)}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="LinkedIn">
    <i class="devicon-linkedin-plain"></i>
  </a>
  <a href="mailto:${escapeHtml(email)}" class="social-link" aria-label="Email">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  </a>
`;
}

/** @param {object} cv @param {Record<string, string>} devicons @param {{ escapeHtml: (s: unknown) => string }} h */
export function buildExperienceHtml(cv, devicons, { escapeHtml }) {
  return cv.experience
    .map(
      (e) => `
  <article class="card reveal">
    <div class="card-inner">
      <div class="card-period">${escapeHtml(e.period)}</div>
      <div class="card-body">
        <h3 class="card-title">
          ${e.website ? `<a href="${escapeHtml(e.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(e.position)}</a>` : escapeHtml(e.position)}
        </h3>
        <p class="card-subtitle">
          ${e.website ? `<a href="${escapeHtml(e.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(e.company)}</a>` : escapeHtml(e.company)}${e.location ? ` · ${escapeHtml(e.location)}` : ''}
        </p>
        <p class="card-description">${escapeHtml(e.description)}</p>
        ${renderTags(devicons, e.tags, escapeHtml)}
      </div>
    </div>
  </article>`
    )
    .join('');
}

/**
 * @param {object} cv
 * @param {Record<string, string>} devicons
 * @param {{ escapeHtml: (s: unknown) => string; extractYouTubeVideoId: (u: string) => string | null }} h
 */
export function buildProjectsHtml(cv, devicons, { escapeHtml, extractYouTubeVideoId }) {
  return cv.projects
    .map((p) => {
      const imageLink = p.videoUrl || p.website;
      const imageSrc = p.image ? escapeHtml(p.image) : '';
      const ytId = p.videoUrl ? extractYouTubeVideoId(p.videoUrl) : null;
      const ytAttr = ytId ? ` data-youtube-hover="${escapeHtml(ytId)}"` : '';

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

      const imageAnchorClass = ytId ? 'card-project-image card-project-image--yt' : 'card-project-image';
      let imageHtml = '';
      if (imageSrc) {
        const thumbInner = `<img class="project-thumb project-thumb-small" src="${imageSrc}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" />
          ${previewHtml}`;
        if (ytId) {
          imageHtml = `<button type="button" class="${imageAnchorClass}" title="${escapeHtml(p.name)}"${ytAttr} data-youtube-modal data-youtube-id="${escapeHtml(ytId)}" data-video-title="${escapeHtml(p.name)}">
          ${thumbInner}
        </button>`;
        } else {
          imageHtml = `<a href="${escapeHtml(imageLink)}" target="_blank" rel="noopener noreferrer" class="${imageAnchorClass}" title="${escapeHtml(p.name)}">
          ${thumbInner}
        </a>`;
        }
      }

      const cardMod = imageSrc ? ' card-project--with-preview' : '';

      return `
  <article class="card card-project reveal${cardMod}">
    ${imageHtml}
    <div class="card-project-body">
      <h3 class="card-title">
        ${p.website
          ? `<a href="${escapeHtml(p.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.name)} <span class="arrow" aria-hidden="true">↗</span></a>`
          : escapeHtml(p.name)}
      </h3>
      <p class="card-description">${escapeHtml(p.description)}</p>
      ${renderTags(devicons, p.tags, escapeHtml)}
    </div>
  </article>`;
    })
    .join('');
}

/** @param {object} cv @param {Record<string, string>} devicons @param {{ escapeHtml: (s: unknown) => string }} h */
export function buildSkillsHtml(cv, devicons, { escapeHtml }) {
  return cv.skills
    .map(
      (s) => `
  <div class="skill-group reveal">
    <h4 class="skill-name">${escapeHtml(s.name)}</h4>
    <div class="skill-tags">
      ${s.keywords.map((k) => `<span class="skill-tag">${iconFor(devicons, k)} ${escapeHtml(k)}</span>`).join('')}
    </div>
  </div>`
    )
    .join('');
}

/** @param {object} cv @param {Record<string, string>} _devicons @param {{ escapeHtml: (s: unknown) => string }} h */
export function buildCertificationsHtml(cv, _devicons, { escapeHtml }) {
  return cv.certifications
    .map(
      (c) => `
  <div class="card card-compact reveal">
    <div class="card-inner">
      <div class="card-period">${escapeHtml(c.date)}</div>
      <div class="card-body">
        <h4 class="card-title">${escapeHtml(c.title)}</h4>
        <p class="card-subtitle">${escapeHtml(c.issuer)}</p>
      </div>
    </div>
  </div>`
    )
    .join('');
}

/** @param {object} cv @param {Record<string, string>} _devicons @param {{ escapeHtml: (s: unknown) => string }} h */
export function buildEducationHtml(cv, _devicons, { escapeHtml }) {
  return cv.education
    .map(
      (e) => `
  <div class="card card-compact reveal">
    <div class="card-inner">
      <div class="card-period">${escapeHtml(e.period)}</div>
      <div class="card-body">
        <h4 class="card-title">${e.website ? `<a href="${escapeHtml(e.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(e.school)}</a>` : escapeHtml(e.school)}</h4>
        <p class="card-subtitle">${escapeHtml(e.area)}</p>
      </div>
    </div>
  </div>`
    )
    .join('');
}

/** @param {object} cv @param {Record<string, string>} _devicons @param {{ escapeHtml: (s: unknown) => string }} h */
export function buildLanguagesHtml(cv, _devicons, { escapeHtml }) {
  return cv.languages
    .map(
      (l) => `
  <div class="language-row reveal">
    <span class="language-name">${escapeHtml(l.language)}</span>
    <span class="language-fluency">${escapeHtml(l.fluency)}</span>
  </div>`
    )
    .join('');
}

/** @param {object} cv @param {Record<string, string>} _devicons @param {{ escapeHtml: (s: unknown) => string; extractYouTubeVideoId: (u: string) => string | null }} h */
export function buildInterestsHtml(cv, _devicons, { escapeHtml, extractYouTubeVideoId }) {
  const rows = cv.interests
    .map(
      (i) => `
  <div class="interest reveal">
    <h4 class="interest-name">${escapeHtml(i.name)}</h4>
    <p class="interest-keywords">${i.keywords.map((k) => escapeHtml(k)).join(', ')}</p>
  </div>`
    )
    .join('');

  const interestYtId = cv.interestsVideo ? extractYouTubeVideoId(cv.interestsVideo.url) : null;
  const videoBlock =
    cv.interestsVideo && interestYtId
      ? `
  <button
    type="button"
    class="interest-video reveal"
    data-youtube-modal
    data-youtube-id="${escapeHtml(interestYtId)}"
    data-video-title="${escapeHtml(cv.interestsVideo.label)}"
    aria-haspopup="dialog"
    aria-label="Play video: ${escapeHtml(cv.interestsVideo.label)}"
  >
    <img src="${escapeHtml(cv.interestsVideo.thumbnail)}" alt="" loading="lazy" decoding="async" />
    <span class="interest-video-label">${escapeHtml(cv.interestsVideo.label)} · Watch here</span>
  </button>`
      : '';

  return rows + videoBlock;
}
