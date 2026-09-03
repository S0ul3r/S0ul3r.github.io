/**
 * @param {string} name
 */
export function buildWordmark(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      const init = part.slice(0, 1);
      const rest = part.slice(1);
      return `<span class="wordmark-init">${init}</span><span class="wordmark-rest">${rest}</span>`;
    })
    .join(' ');
}

/**
 * @param {object} cv
 * @param {{ escapeHtml: (v: unknown) => string }} h
 */
export function buildNavLinks(cv, { escapeHtml }) {
  return cv.nav
    .map((n) => `<a href="${escapeHtml(n.href)}">${escapeHtml(n.label)}</a>`)
    .join('');
}

/**
 * @param {object} cv
 * @param {{ escapeHtml: (v: unknown) => string }} h
 */
export function buildSocial(cv, { escapeHtml }) {
  const { github, linkedin, email, phone } = cv.basics;
  const tel = String(phone || '').replace(/[^\d+]/g, '');
  return `
    <a href="${escapeHtml(github.url)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
      <i class="ph ph-github-logo" aria-hidden="true"></i>
    </a>
    <a href="mailto:${escapeHtml(email)}" aria-label="Email">
      <i class="ph ph-envelope-simple" aria-hidden="true"></i>
    </a>
    <a href="${escapeHtml(linkedin.url)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
      <i class="ph ph-linkedin-logo" aria-hidden="true"></i>
    </a>
    <a href="tel:${escapeHtml(tel)}" aria-label="Phone">
      <i class="ph ph-phone" aria-hidden="true"></i>
    </a>
  `;
}

/**
 * @param {object} cv
 * @param {{ escapeHtml: (v: unknown) => string }} h
 */
export function buildEducation(cv, { escapeHtml }) {
  const edu = cv.education
    .map(
      (e) => `<li><span>${escapeHtml(e.period)}</span><br>${
        e.website
          ? `<a href="${escapeHtml(e.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(e.school)}</a>`
          : escapeHtml(e.school)
      } - ${escapeHtml(e.area)}</li>`
    )
    .join('');
  const certs = cv.certifications
    .map((c) => `<li><span>${escapeHtml(c.date)} · ${escapeHtml(c.issuer)}</span><br>${escapeHtml(c.title)}</li>`)
    .join('');
  return `<ul class="edu-list">${edu}${certs}</ul>`;
}

/**
 * @param {object} cv
 * @param {Record<string, string>} devicons
 * @param {{ escapeHtml: (v: unknown) => string }} h
 */
export function buildSkills(cv, devicons, { escapeHtml }) {
  const cols = (cv.skillColumns || [])
    .map((col) => {
      const icons = col.keywords
        .map((k) => {
          const cls = devicons[k];
          const icon = cls ? `<i class="${cls} colored" title="${escapeHtml(k)}"></i>` : escapeHtml(k);
          return `<span title="${escapeHtml(k)}">${icon}</span>`;
        })
        .join('');
      return `<div><h3>${escapeHtml(col.name)}</h3><div class="skill-icons">${icons}</div></div>`;
    })
    .join('');
  const langs = cv.languages
    .map((l) => `${escapeHtml(l.language)} (${escapeHtml(l.fluency)})`)
    .join(' / ');
  const interests = cv.interests
    .map((i) => `${escapeHtml(i.name)}: ${i.keywords.map((k) => escapeHtml(k)).join(', ')}`)
    .join(' · ');
  return `${cols ? `<div class="skill-cols">${cols}</div>` : ''}<p class="lang-row">${langs}</p><p class="lang-row">${interests}</p>`;
}

/**
 * @param {object} cv
 * @param {{ escapeHtml: (v: unknown) => string }} h
 */
export function buildExperience(cv, { escapeHtml }) {
  const jobs = cv.experience
    .map(
      (e) => `<li><span>${escapeHtml(e.period)}</span><br><strong>${escapeHtml(e.position)}</strong> · ${
        e.website
          ? `<a href="${escapeHtml(e.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(e.company)}</a>`
          : escapeHtml(e.company)
      }<p>${escapeHtml(e.description)}</p></li>`
    )
    .join('');
  return `<ul class="exp-list">${jobs}</ul>`;
}

/**
 * @param {object} cv
 * @param {{ escapeHtml: (v: unknown) => string }} h
 */
export function buildServices(cv, { escapeHtml }) {
  return (cv.services || [])
    .map(
      (s) => `<article class="service-card reveal">
        <i class="ph ph-${escapeHtml(s.icon)}" aria-hidden="true"></i>
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.body)}</p>
      </article>`
    )
    .join('');
}

/**
 * @param {object} cv
 * @param {Record<string, string>} tagHue
 * @param {{ escapeHtml: (v: unknown) => string; extractYouTubeVideoId: (u: string) => string | null }} h
 */
export function buildCarousel(cv, tagHue, { escapeHtml, extractYouTubeVideoId }) {
  return cv.projects
    .map((p, index) => {
      const ytId = p.videoUrl ? extractYouTubeVideoId(p.videoUrl) : null;
      const tags = (p.tags || [])
        .map((t) => {
          const color = tagHue[t] || '#cfcfcf';
          return `<span class="tag" style="color:${color}">${escapeHtml(t)}</span>`;
        })
        .join('');
      const links = [
        p.website
          ? `<a href="${escapeHtml(p.website)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(p.name)}"><i class="ph ph-arrow-square-out"></i></a>`
          : '',
        ytId
          ? `<button type="button" data-youtube-modal data-youtube-id="${escapeHtml(ytId)}" data-video-title="${escapeHtml(p.name)}" aria-label="Play video"><i class="ph ph-youtube-logo"></i></button>`
          : '',
      ].join('');
      const imageClass = p.imageFit === 'contain' ? ' slab-image-contain' : '';
      return `<article class="slab" data-index="${index}" aria-label="View ${escapeHtml(p.name)} project">
        <div class="slab-frame">
          <div class="slab-face slab-face-front">
            ${p.image ? `<img class="${imageClass.trim()}" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" />` : ''}
          </div>
          <div class="slab-face slab-face-left"></div>
          <div class="slab-face slab-face-right"></div>
        </div>
        <div class="slab-info">
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.description)}</p>
          <div class="tags">${tags}</div>
          <div class="slab-links">${links}</div>
        </div>
      </article>`;
    })
    .join('');
}
