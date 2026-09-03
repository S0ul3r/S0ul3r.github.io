# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruiters, hiring managers, and collaborators who need a fast read of Jakub Kulewicz as a full-stack engineer and Scrum Master, then a path to projects and contact.

## Product Purpose

Personal portfolio for Jakub Kulewicz. It presents commercial experience, shipped projects, skills, education, and a way to get in touch. Success is a visitor who understands what he builds, can verify it in projects, and can email or message him.

## Positioning

Owner of PolishTango.com and a .NET / TypeScript engineer who also leads delivery as Scrum Master. The site is the public CV and project index for that combination, not a generic developer template.

## Operating Context

Static Vite site deployed to GitHub Pages (`s0ul3r.github.io`, optional `s0ul3r.dev`). Content is authored in `src/data.js`. No authenticated product surface. Contact is email, LinkedIn, GitHub, and phone.

## Constraints

- Preserve factual CV content: name, headline, summary, employers, dates, project names, links, screenshots, certifications, education, languages, interests.
- Do not invent employers, metrics, clients, or capabilities that are not in `src/data.js`.
- Keep the YouTube video modal for projects and the piano clip that already use it.
- English UI. Location is Wrocław, Poland.
- Visual direction is user-pinned: cinematic dark wireframe portfolio in the language of [gustavobatista.dev](https://gustavobatista.dev/) (Awwwards-nominated Three.js experience). Recreate the atmosphere with original code and assets; do not copy their models, music, game, or source.

## Evidence

- Commercial work at Unit4 (2021-current), ZoneIT (2019), Takeaway.com (2016), plus personal products.
- Public products: PolishTango, TangoDJ, CoinFlipWeb, and GitHub projects listed in `src/data.js`.
- Microsoft Azure Fundamentals (2023); Cisco CCNA certs (2022).

## Voice

Direct, professional, specific. Job titles and stack names over slogans.

## Open decisions

- No hosted CV PDF in the repo, so there is no Download CV file until one is added.
- No EmailJS (or other form backend) configured; contact form falls back to the visitor's mail client.
