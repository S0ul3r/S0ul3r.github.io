import * as Templates from './portfolioTemplates.js';

/**
 * @param {object} cv
 * @param {Record<string, string>} devicons
 * @param {Record<string, string>} tagHue
 * @param {{ escapeHtml: (v: unknown) => string; extractYouTubeVideoId: (u: string) => string | null }} helpers
 */
export function mountPortfolioView(cv, devicons, tagHue, helpers) {
  const set = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  const mark = Templates.buildWordmark(cv.basics.name);
  set('wordmark', mark);
  set('boot-wordmark', mark);
  set('overlay-nav', Templates.buildNavLinks(cv, helpers));
  const social = Templates.buildSocial(cv, helpers);
  set('overlay-social', social);
  set('contact-social', social);
  set('about-bio', helpers.escapeHtml(cv.summary.content));
  set('tab-education', Templates.buildEducation(cv, helpers));
  set('tab-certifications', Templates.buildCertifications(cv, helpers));
  set('tab-skills', Templates.buildSkills(cv, devicons, helpers));
  set('tab-experience', Templates.buildExperience(cv, helpers));
  set('service-grid', Templates.buildServices(cv, helpers));
  set('carousel-stage', Templates.buildCarousel(cv, tagHue, helpers));

  const lead = document.getElementById('work-lead');
  if (lead) {
    lead.textContent =
      'I help teams ship durable software: services, web products, cloud delivery, and the Scrum practice around them.';
  }

  const role = document.getElementById('boot-role');
  if (role) role.textContent = cv.basics.roleLine || cv.basics.headline;

  const copy = document.getElementById('copyright');
  if (copy) copy.textContent = `© ${new Date().getFullYear()} ${cv.basics.name}`;
}
