# AGENTS.md

Repository-level instructions for AI-assisted work on this site. `README.md` explains the structure and the common edits; read it first.

## What this is

Cherryann Yang's portfolio: a static site in plain HTML and CSS with one small script. No framework, no build step, no dependencies. Keep it that way unless she asks otherwise.

## Rules

1. Do not invent content. Every fact on the site comes from her resume or from something she wrote. If a page needs a fact you do not have, ask.
2. `work/resume.html` is a word-for-word copy of `Cherryann_Yang_Resume.pdf`, and `resume.css` sets it with the PDF's own fonts, sizes and gaps (the numbers there are the PDF's measurements in points). Do not reword it, reorder it, restyle it, or correct it on your own. Change it only when the PDF changes.
3. The sidebar (`<header class="side">`) is identical on every page, apart from the `../` prefix inside `work/` and which menu item carries `aria-current`. Change it everywhere or nowhere.
4. Follow the six rules under "How it looks" in `README.md`. In particular: the pixel font is only for the headline and project titles; nothing in Satoshi is bold; topic headings stay small and gray; every colour is black, white or a Classic Gray token; no rounded corners, no shadows, no cards.
5. Use the existing classes and tokens in `styles.css` before adding new ones. Colours come from the tokens at the top of that file, and `site.js` reads its colours from them too.
6. Motion stays in section 9 of `styles.css`, inside the `prefers-reduced-motion` block.
7. Do not add captions, labels or decoration she did not ask for.
8. Write in her voice: plain, casual, first person, no sales language, no em dashes.

## After editing

Run `python3 tools/check.py` from the repository root and fix anything it reports. Then open the changed pages at desktop and phone widths.
