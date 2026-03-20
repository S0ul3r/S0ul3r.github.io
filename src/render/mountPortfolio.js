import * as Templates from './portfolioTemplates.js';

/**
 * Injects all CV-driven HTML into the static shell.
 * @param {object} cv
 * @param {Record<string, string>} devicons
 * @param {{ escapeHtml: (v: unknown) => string; extractYouTubeVideoId: (u: string) => string | null }} helpers
 */
export function mountPortfolioView(cv, devicons, helpers) {
  const { escapeHtml, extractYouTubeVideoId } = helpers;
  const ctx = { escapeHtml, extractYouTubeVideoId };

  const setHtml = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  const summaryEl = document.getElementById('hero-summary');
  if (summaryEl) summaryEl.textContent = cv.summary.content;

  setHtml('sidebar-nav', Templates.buildNavHtml(cv, devicons, ctx));
  setHtml('sidebar-social', Templates.buildSocialHtml(cv, devicons, ctx));
  setHtml('experience-list', Templates.buildExperienceHtml(cv, devicons, ctx));
  setHtml('projects-list', Templates.buildProjectsHtml(cv, devicons, ctx));
  setHtml('skills-list', Templates.buildSkillsHtml(cv, devicons, ctx));
  setHtml('certifications-list', Templates.buildCertificationsHtml(cv, devicons, ctx));
  setHtml('education-list', Templates.buildEducationHtml(cv, devicons, ctx));
  setHtml('languages-list', Templates.buildLanguagesHtml(cv, devicons, ctx));
  setHtml('interests-list', Templates.buildInterestsHtml(cv, devicons, ctx));
}
