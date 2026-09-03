import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const IDS = ['home', 'about', 'work', 'projects', 'contact'];

/**
 * @param {{ onProgress?: (p: number) => void }} [opts]
 */
export function initSectionNav(opts = {}) {
  const dots = document.getElementById('dots');
  if (!(dots instanceof HTMLElement)) return;

  dots.innerHTML = IDS.map(
    (id, i) => `<button type="button" data-target="#${id}" aria-label="${id}"${i === 0 ? ' class="is-current"' : ''}></button>`
  ).join('');

  dots.addEventListener('click', (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const href = e.target.dataset.target;
    if (!href) return;
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  });

  const buttons = [...dots.querySelectorAll('button')];

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((en) => en.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible?.target?.id) return;
      buttons.forEach((btn) => {
        btn.classList.toggle('is-current', btn.dataset.target === `#${visible.target.id}`);
      });
    },
    { threshold: [0.45, 0.6] }
  );

  IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });

  const stage = document.getElementById('stage');
  if (stage && opts.onProgress) {
    ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => opts.onProgress(self.progress),
    });
  }
}
