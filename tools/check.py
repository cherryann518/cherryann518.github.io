"""Check the site after editing it. Standard library only.

    python3 tools/check.py

It looks for the mistakes that are easy to make by hand:
  - a link, stylesheet, script or image path that points at nothing
  - the sidebar differing from one page to the next
  - a page with no <h1>, more than one, or a skipped heading level
  - an image without alt text, an unclosed tag
  - the resume page drifting from the PDF (needs `pdftotext`; skipped without it)
  - a row on the resume page that is not exactly two <span>s
"""
import difflib
import pathlib
import re
import shutil
import subprocess
import sys
from html.parser import HTMLParser

SITE = pathlib.Path(__file__).resolve().parent.parent
VOID = {"meta", "img", "br", "hr", "link", "input"}


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.problems, self.refs, self.headings, self.ids = [], [], [], [], []
        self.paper_depth = None  # depth of the resume sheet while inside it
        self.paper_text = []
        self.row_depth, self.row_children = None, []  # a <p class="row"> on the sheet, and its direct children

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.append(a["id"])
        for key in ("href", "src"):
            if key in a and tag in ("a", "img", "link", "script"):
                self.refs.append(a[key] or "")
        if tag == "img" and not a.get("alt"):
            self.problems.append("image without alt text")
        if re.fullmatch(r"h[1-6]", tag):
            self.headings.append(int(tag[1]))
        if tag not in VOID:
            self.stack.append(tag)
            if tag == "article" and "paper" in (a.get("class") or "").split():
                self.paper_depth = len(self.stack)
            if self.row_depth and len(self.stack) == self.row_depth + 1:
                self.row_children.append(tag)
            if self.paper_depth and tag == "p" and "row" in (a.get("class") or "").split():
                self.row_depth, self.row_children = len(self.stack), []

    def handle_endtag(self, tag):
        if not self.stack or self.stack[-1] != tag:
            self.problems.append(f"</{tag}> does not match the open tag (open: {self.stack[-3:]})")
            return
        if self.paper_depth == len(self.stack):
            self.paper_depth = None
        if self.row_depth == len(self.stack):
            if self.row_children != ["span", "span"]:
                self.problems.append(f"a resume row should hold exactly two <span>s, left and right (found {self.row_children})")
            self.row_depth = None
        self.stack.pop()

    def handle_data(self, data):
        if self.paper_depth:
            self.paper_text.append(data)


def words(text):
    return re.sub(r"[•\s]+", " ", text).split()


def main():
    ok = True
    sidebars = {}
    resume_words = None

    for path in sorted(SITE.rglob("*.html")):
        rel = path.relative_to(SITE)
        src = path.read_text(encoding="utf-8")
        page = Page()
        page.feed(src)
        problems = page.problems
        if page.stack:
            problems.append(f"unclosed tags: {page.stack}")
        if page.headings.count(1) != 1:
            problems.append(f"expected one <h1>, found {page.headings.count(1)}")
        for prev, cur in zip(page.headings, page.headings[1:]):
            if cur > prev + 1:
                problems.append(f"heading jumps from h{prev} to h{cur}")
        for ref in page.refs:
            if ref.startswith(("http://", "https://", "mailto:")):
                continue
            if ref.startswith("#"):
                if ref[1:] not in page.ids:
                    problems.append(f"nothing on the page has id {ref}")
                continue
            target = (path.parent / ref.split("#")[0]).resolve()
            if not ref or not target.is_file():
                problems.append(f"broken path: {ref!r}")

        match = re.search(r'<header class="side">(.*?)</header>', src, re.S)
        if not match:
            problems.append("no sidebar")
        else:
            side = match.group(1).replace('"../', '"')
            side = re.sub(r' aria-current="(page|true)"', "", side)
            sidebars[str(rel)] = side
            if src.count("aria-current") != 1:
                problems.append("the menu should mark exactly one item with aria-current")
        if page.paper_text:
            resume_words = words("".join(page.paper_text))

        print(f"{'ok ' if not problems else 'FIX'} {rel}")
        for problem in problems:
            ok = False
            print(f"      {problem}")

    if len(set(sidebars.values())) > 1:
        ok = False
        base = next(iter(sidebars.values()))
        odd = [name for name, side in sidebars.items() if side != base]
        print(f"FIX the sidebar differs on: {', '.join(odd)}")

    pdf = SITE / "Cherryann_Yang_Resume.pdf"
    if resume_words and pdf.is_file() and shutil.which("pdftotext"):
        text = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], capture_output=True, text=True).stdout
        pdf_words = words(text)
        diff = [d for d in difflib.unified_diff(pdf_words, resume_words, "PDF", "work/resume.html", lineterm="", n=2)]
        if diff:
            ok = False
            print("FIX the resume page and the PDF differ:")
            print("      " + "\n      ".join(diff[:40]))
        else:
            print(f"ok  resume page matches the PDF word for word ({len(pdf_words)} words)")
    elif resume_words:
        print("--  resume page not compared with the PDF (pdftotext not installed)")

    print("All good." if ok else "Something needs fixing.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
