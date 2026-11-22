# cherryann-site

Plain HTML and CSS with one small script. There is no build step: open `index.html` in a browser and it works. The glide between pages only shows when the site is served (GitHub Pages, or `python3 -m http.server` in this folder), not when the files are opened directly.

```
index.html                     the main page: headline, Now, projects, experience, highlights, extracurriculars, contact
work/
  knowledge-curation.html      one page per project
  gaia-agent.html
  beijing-pm25.html
  antibody-prediction.html
  resume.html                  the resume, set like the PDF
  knowledge-curation-poster.pdf
styles.css                     everything visual, in nine numbered sections
resume.css                     only used by work/resume.html: the PDF's sizes and gaps, in points
site.js                        frame dots, opening screen, menu, sidebar clock, hover dots
images/portrait.webp
images/cursor*.png              the pixel mouse pointers (set near the top of section 2 in styles.css)
images/poster.webp
images/feed/                   pictures for highlights
favicon.ico and images/favicon*, apple-touch-icon.png   the cherry icon, in the forms browsers ask for
fonts/                         m3x6 (pixel titles) and Latin Modern (resume page). Satoshi loads from Fontshare
tools/check.py                 run after editing: python3 tools/check.py
Cherryann_Yang_Resume.pdf
```

Every page has the same three parts: the sidebar (`<header class="side">`), the page (`<main>`), and a floating gray block on the right (`<aside class="rail">`). On small screens the block moves under the page. Project pages give theirs the class `rail-first` so the facts come before the write-up on a phone.

## How it looks, in six rules

1. The site is one white block inside a dark pixel frame. The frame stays put while the page scrolls. Square corners.
2. Two voices. The pixel font is the loud one, kept for the headline and project titles. Put `class="pixel"` on an `<h1>` or `<h2>` to set it in pixels. Satoshi is the quiet one for everything else, and it is never bold.
3. Topic headings (Experience, Feed, Facts) are small and gray. They label a part of the page.
4. Colour is black, white and Classic Gray, lighter or darker. Nothing else, apart from pictures and the resume sheet.
5. The small drawn things (photo frame, arrows, the Now dot) are built from square dots, like the font. Every box has one square missing from each corner. To give a new box the same corners, add its selector to the "Pixel corners" list in section 2 of `styles.css`.
6. Nothing tints until you hover.

## Change the Now line

In `index.html`, edit the sentence inside `<div class="callout">`.

## Add a project

1. Copy `work/gaia-agent.html` to `work/your-project.html`. Change the `<title>`, the label, the `<h1>`, the lede, the sections, and the facts in the floating block.
2. Add a block for it in `index.html` by copying one of the `<article class="block">` elements. The whole block is the link.
3. Add it to the "More work" list at the bottom of the other project pages.

The `style="view-transition-name: ..."` on a block's title and on its page's `<h1>` must be the same word. That is what makes the title glide from one to the other.

## Add a job or an activity

Both are in `index.html`, under Experience and Extracurriculars, and use the same row. The tools line and the description are optional:

```html
<li>
  <h3>Title</h3>
  <p class="meta">Place<br>Dates</p>
  <ul class="chips tags"><li>Python</li><li>SQLite</li></ul>
  <p>One line about it.</p>
</li>
```

## Add a highlight

Highlights are moments, written the way you would post them: "I presented...", "We won...". Roles and memberships go under Extracurriculars instead. In `index.html`, under Highlights, copy an `<article class="post">` and put it first.

```html
<article class="post" tabindex="0">
  <h3>I did the thing!</h3>
  <p class="meta">Month Year</p>
  <img class="thumb" src="images/feed/your-picture.webp" width="960" height="720" alt="" loading="lazy">
  <div class="extra"><div>
    <div class="photos">
      <img class="photo" src="images/feed/your-picture.webp" width="960" height="720" alt="What the picture shows" loading="lazy">
    </div>
    <p>A few lines.</p>
    <p><a href="https://...">Post on LinkedIn</a></p>
  </div></div>
</article>
```

Pictures go in `images/feed/`, about 960px wide. The `thumb` line is the small picture on the closed row. A post works without any pictures: leave out the `thumb` line and the `photos` block.

## Add a picture to a project page

Put the file in `images/`, then anywhere between sections:

```html
<figure>
  <img src="../images/your-picture.webp" width="1600" height="900" alt="What the picture shows" loading="lazy">
  <figcaption>One line about it.</figcaption>
</figure>
```

## Change the menu

The menu jumps to parts of the main page. Each link ends in `#` and the `id` of a section in `index.html` (`#experience` goes to `<section id="experience">`). The sidebar is repeated at the top of every `.html` file, so change it in one file and use find-and-replace across the folder for the rest. Pages inside `work/` use `../` in front of their links.

## Update the resume

Replace `Cherryann_Yang_Resume.pdf`, then change the same lines in `work/resume.html`. `python3 tools/check.py` compares the two word for word if `pdftotext` is installed.

The page is set from the PDF's own measurements, so on a tablet or anything wider it has the same fonts, sizes and line breaks as the PDF, and on a phone it wraps to fit. You only need to touch `resume.css` if the LaTeX template changes. Two things to keep when editing `work/resume.html`:

- every `<p class="row">` holds exactly two `<span>`s, the left half and the right half
- the Projects, Technical Skills and Extracurricular sections carry a class (`projects`, `skills`, `extra`) because the PDF spaces them a little differently

## Change the look

Everything adjustable is a token at the top of `styles.css`:

- the grays: `--gray` is Classic Gray itself, and `--gray-light`, `--gray-dark`, `--gray-text` and the rest are lighter or darker versions of it
- `--night`, `--night-1` and `--night-2` are the frame and its dots
- `--frame` is how thick the frame is
- `--stroke` is the weight of every line
- `--body` is the size of normal text

The pixel font is only sharp at 32, 48 and 64px. Other sizes blur it.

A button gets the pixel arrow with `class="btn go"`. Links to other sites get one on their own.

All animation lives in section 9 of `styles.css`. Delete that section to turn it off. How full the hover dots are is `DENSITY` in `site.js`.

## Publish on GitHub Pages

1. On github.com, make a new public repository named `cherryann518.github.io`.
2. On the new repository's page, choose "uploading an existing file", drag in everything inside this folder (the files and folders, not the folder itself), and commit.
3. Go to Settings, then Pages. Under "Build and deployment", set Source to "Deploy from a branch", pick `main` and `/ (root)`, and save.
4. After a minute or two the site is at `https://cherryann518.github.io/`.

To update it later, upload the changed files the same way. They replace the old ones.

## Fonts and credits

`fonts/README.txt` lists every font file, where it came from and its licence. Two things to know before publishing:

- m3x6 is by Daniel Linssen and is free to use with attribution. The credit is in `fonts/README.txt` and in `styles.css`.
- Satoshi is from Fontshare (Indian Type Foundry). It is free to use, but its licence does not let the font files sit in a public repository, so the first line of `styles.css` loads it from Fontshare's own servers instead. Without a connection the site falls back to Helvetica.

The photo of the poster session in the feed is from the College of IST's post and is credited under the picture.
