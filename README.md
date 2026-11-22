# cherryann-site

Plain HTML and CSS with one small script. No build step: open `index.html` in a browser. The glide between pages only shows when the site is served (GitHub Pages, or `python3 -m http.server` in this folder).

```
index.html                main page
work/                     one page per project, plus resume.html
styles.css                everything visual, in nine numbered sections
resume.css                only for work/resume.html (PDF sizes, in points)
site.js                   frame, menu, clock, hover dots
images/                   portrait, cursors, feed pictures, favicons
fonts/                    m3x6 and Latin Modern (Satoshi loads from Fontshare)
tools/check.py            run after editing: python3 tools/check.py
Cherryann_Yang_Resume.pdf
```

Every page has the same three parts: the sidebar (`<header class="side">`), the page (`<main>`), and a floating block on the right (`<aside class="rail">`). On small screens the block moves under the page. Project pages use `rail-first` so facts come first on a phone.

## How it looks, in six rules

1. The site is one white block inside a dark pixel frame. The frame stays put while the page scrolls. Square corners.
2. Two voices. The pixel font is for the headline and project titles (`class="pixel"` on an `<h1>` or `<h2>`). Satoshi is for everything else, and it is never bold.
3. Topic headings (Experience, Feed, Facts) are small and gray.
4. Colour is black, white and Classic Gray. Nothing else, apart from pictures and the resume sheet.
5. Drawn things (photo frame, arrows, the Now dot) are built from square dots. Every box has one square missing from each corner; add new boxes to the "Pixel corners" list in section 2 of `styles.css`.
6. Nothing tints until you hover.

## Common edits

**Now line.** In `index.html`, edit the sentence inside `<div class="callout">`.

**Project.** Copy `work/gaia-agent.html` to `work/your-project.html`. Add an `<article class="block">` on `index.html`. Add it to the "More work" list on the other project pages. The `style="view-transition-name: ..."` on the block title and the page `<h1>` must match.

**Job or activity.** In `index.html`, under Experience or Extracurriculars:

```html
<li>
  <h3>Title</h3>
  <p class="meta">Place<br>Dates</p>
  <ul class="chips tags"><li>Python</li></ul>
  <p>One line about it.</p>
</li>
```

The tools line and description are optional.

**Highlight.** Moments go under Highlights ("I presented...", "We won..."); roles go under Extracurriculars. Copy an `<article class="post">` and put it first. Pictures go in `images/feed/`, about 960px wide. A post works without pictures: leave out the `thumb` and `photos` blocks.

**Resume.** Replace `Cherryann_Yang_Resume.pdf`, then match the same lines in `work/resume.html`. `python3 tools/check.py` compares them if `pdftotext` is installed. Touch `resume.css` only if the LaTeX template changes. Keep every `<p class="row">` as exactly two `<span>`s, and keep the `projects`, `skills`, and `extra` classes on those sections.

**Look.** Tokens at the top of `styles.css` set the grays, frame, stroke and body size. The pixel font is sharp only at 32, 48 and 64px. Animation is section 9 of `styles.css`; hover-dot density is `DENSITY` in `site.js`.

**Menu.** Links end in `#` plus a section `id` on `index.html`. The sidebar is repeated in every `.html` file, so change it everywhere. Pages in `work/` use a `../` prefix.

Font licences and credits are in `fonts/README.txt`.
