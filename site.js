// Small behaviours. The site reads fine without any of them.

const root = document.documentElement;
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

// Colours come from styles.css, so they are only ever set in one place.
const tone = (name) => {
  let hex = getComputedStyle(root).getPropertyValue(name).trim().slice(1);
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join(""); // #000 is short for #000000
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
};

// Both dot patterns below decide each dot against this 4x4 dither pattern,
// which is what gives them the stippled, old-screen look.
const DOT = 6; // screen pixels per dot
const dither = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((n) => (n + 0.5) / 16);
const limit = (x, y) => dither[(y & 3) * 4 + (x & 3)];


// The frame: slow dark gray dots on black, around the white block. (CSS cuts
// the middle out of this canvas, so only the frame shows.) It runs on the
// clock, so it carries on from where it was when you change page.
{
  const NIGHT = [tone("--night"), tone("--night-1"), tone("--night-2")];
  const canvas = document.createElement("canvas");
  canvas.className = "backdrop";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");

  const draw = () => {
    const w = (canvas.width = Math.ceil(innerWidth / DOT));
    const h = (canvas.height = Math.ceil(innerHeight / DOT));
    const image = ctx.createImageData(w, h);
    const t = Date.now() / 1000;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // Two soft waves crossing each other, between 0 and 1.
        const a = 0.5 + 0.5 * Math.sin(x * 0.045 + t * 0.2) * Math.cos(y * 0.06 - t * 0.14);
        const b = 0.5 + 0.5 * Math.sin((x + y) * 0.03 - t * 0.11);
        const colour = NIGHT[a * 0.8 > limit(x, y) ? 1 : b * 0.7 > limit(x, y) ? 2 : 0];
        image.data.set([colour[0], colour[1], colour[2], 255], (y * w + x) * 4);
      }
    }
    ctx.putImageData(image, 0, 0);
  };
  draw();
  if (!still) setInterval(draw, 120);
  addEventListener("resize", draw);
}


// Opening: the first time someone lands on the Work page in a visit, the
// block is blank, types a line, waits a moment and shows the page. (The
// page's <head> decides whether to show it, so there is no flash of the page.)
async function opening() {
  if (!root.classList.contains("opening")) return;
  const screen = document.createElement("div");
  screen.className = "opening-screen";
  screen.innerHTML = '<p><span class="caret"></span></p>';
  document.body.append(screen);
  const line = screen.querySelector("span");
  const text = "Cherryann’s Portfolio";
  await sleep(250);
  for (let i = 1; i <= text.length; i++) {
    line.textContent = text.slice(0, i);
    await sleep(40 + Math.random() * 45);
  }
  await sleep(650);
  sessionStorage.setItem("entered", "yes");
  root.classList.remove("opening");
  screen.classList.add("done");
  setTimeout(() => screen.remove(), 500);
}
opening();


// Menu: on the main page, the black bar follows the part of the page you are
// reading. (On other pages it stays on Work.)
{
  const links = [...document.querySelectorAll(".side nav a")].filter((link) => link.pathname === location.pathname);
  const parts = links.map((link) => document.getElementById(link.hash.slice(1) || "work")).filter(Boolean);
  if (parts.length === links.length && parts.length > 1) {
    const mark = () => {
      const line = innerHeight * 0.4; // the part crossing this line is the current one
      let current = 0;
      parts.forEach((part, i) => { if (part.getBoundingClientRect().top < line) current = i; });
      links.forEach((link, i) => (i === current ? link.setAttribute("aria-current", "true") : link.removeAttribute("aria-current")));
    };
    mark();
    addEventListener("scroll", mark, { passive: true });
  }
}


// Local time in the sidebar.
for (const clock of document.querySelectorAll("[data-clock]")) {
  const tick = () => {
    clock.textContent = new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit", timeZone: clock.dataset.clock }).format(new Date());
  };
  tick();
  setInterval(tick, 30000);
}


// Hover: a cloud of pale dots under a project block. One cloud follows the
// cursor and a second drifts on its own.
const DENSITY = 0.44; // how full the clouds are: lower is sparser
const TINT = [tone("--gray"), tone("--gray-pale")];
const REACH = 0.65; // how far each cloud spreads: 1 would fill the whole block
// Room the dots leave around a line of text: screen pixels kept clear at its
// sides, and pixels trimmed off its top and bottom first.
const GAP = 2;
const TRIM = 3;

for (const block of document.querySelectorAll(".block")) {
  const canvas = document.createElement("canvas");
  canvas.className = "glow";
  canvas.setAttribute("aria-hidden", "true");
  block.append(canvas);
  const ctx = canvas.getContext("2d");
  let frame = 0;
  let mx = 0.3;
  let my = 0.4;
  let clear = new Uint8Array(0); // one cell per dot: 1 where a line of text sits, so no dot lands behind it

  const draw = (now) => {
    const { width: w, height: h } = canvas;
    const image = ctx.createImageData(w, h);
    const t = now / 1000;
    const cx = 0.5 + 0.38 * Math.cos(t * 0.45); // the drifting cloud
    const cy = 0.5 + 0.38 * Math.sin(t * 0.6);
    const wide = w / h;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (clear[y * w + x]) continue;
        const u = x / w;
        const v = y / h;
        const near = Math.max(0, 1 - Math.hypot((u - mx) * wide, v - my) / (1.1 * REACH));
        const far = Math.max(0, 1 - Math.hypot((u - cx) * wide, v - cy) / (1.4 * REACH));
        const colour = near * DENSITY > limit(x, y) ? TINT[0] : far * DENSITY * 0.85 > limit(x, y) ? TINT[1] : null;
        if (colour) image.data.set([colour[0], colour[1], colour[2], 255], (y * w + x) * 4);
      }
    }
    ctx.putImageData(image, 0, 0);
    if (!still) frame = requestAnimationFrame(draw);
  };
  const start = () => {
    const box = block.getBoundingClientRect();
    const w = (canvas.width = Math.ceil(box.width / DOT));
    const h = (canvas.height = Math.ceil(box.height / DOT));
    const cell = box.width / w;
    const range = document.createRange();
    clear = new Uint8Array(w * h);
    for (const text of block.querySelectorAll("p")) {
      range.selectNodeContents(text);
      for (const line of range.getClientRects()) {
        const left = Math.max(0, Math.floor((line.left - box.left - GAP) / cell));
        const right = Math.min(w, Math.ceil((line.right - box.left + GAP) / cell));
        const top = Math.max(0, Math.floor((line.top - box.top + TRIM) / cell));
        const bottom = Math.min(h, Math.ceil((line.bottom - box.top - TRIM) / cell));
        for (let y = top; y < bottom; y++) clear.fill(1, y * w + left, y * w + right);
      }
    }
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
  };
  const stop = () => setTimeout(() => cancelAnimationFrame(frame), 400);

  block.addEventListener("pointerenter", start);
  block.addEventListener("focusin", start);
  block.addEventListener("pointermove", (event) => {
    const box = block.getBoundingClientRect();
    mx = (event.clientX - box.left) / box.width;
    my = (event.clientY - box.top) / box.height;
  });
  block.addEventListener("pointerleave", stop);
  block.addEventListener("focusout", stop);
}


// Playground: a snake that crawls around the edge of the tile. It eats the dot
// ahead of it, grows, and starts over when it gets long. It idles slowly and
// speeds up under the cursor.
{
  const tile = document.querySelector(".playtile");
  if (tile) {
    const TRACK = tone("--gray-deep");
    const BODY = tone("--paper");
    const TAIL = tone("--gray-dark");
    const canvas = document.createElement("canvas");
    canvas.className = "playframe";
    canvas.setAttribute("aria-hidden", "true");
    tile.append(canvas);
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let edge = []; // the cells around the outside, as [x, y], going clockwise
    let hot = false;
    let seen = false;
    let clock = 0; // runs faster while the cursor is over the tile
    let last = 0;
    let food = 0.37; // where the next dot is, as a share of the way round
    let length = 8;

    const size = () => {
      const box = tile.getBoundingClientRect();
      w = canvas.width = Math.round(box.width / DOT);
      h = canvas.height = Math.round(box.height / DOT);
      edge = [];
      for (let x = 1; x < w - 1; x++) edge.push([x, 0]); // the four corners are left out,
      for (let y = 1; y < h - 1; y++) edge.push([w - 1, y]); // like the nicked corners
      for (let x = w - 2; x > 0; x--) edge.push([x, h - 1]); // every box here has
      for (let y = h - 2; y > 0; y--) edge.push([0, y]);
    };
    const dot = ([x, y], colour) => {
      ctx.fillStyle = `rgb(${colour})`;
      ctx.fillRect(x, y, 1, 1);
    };
    const draw = (now) => {
      clock += (Math.min(now - last, 100) / 1000) * (hot ? 3 : 1);
      last = now;
      const n = edge.length;
      const head = Math.floor(clock * 9) % n;
      const meal = Math.floor(food * n);
      ctx.clearRect(0, 0, w, h);
      for (const cell of edge) dot(cell, TRACK);
      if (head === meal) {
        length = length > n * 0.3 ? 8 : length + 3;
        food = (food + 0.23 + Math.random() * 0.4) % 1;
      } else if (hot || Math.floor(clock * 3) % 2) dot(edge[meal], BODY); // the dot blinks until the cursor arrives
      for (let k = 0; k < length; k++) dot(edge[(head - k + n) % n], k < length - 2 ? BODY : TAIL);
      if (!still && seen) requestAnimationFrame(draw);
    };
    const run = () => {
      last = performance.now();
      requestAnimationFrame(draw);
    };

    new ResizeObserver(() => {
      size();
      if (still) run(); // nothing is moving, so draw it once at the new size
    }).observe(tile);
    new IntersectionObserver(([entry]) => {
      const was = seen;
      seen = entry.isIntersecting; // it only runs while it is on screen
      if (seen && !was && !still) run();
    }).observe(tile);
    tile.addEventListener("pointerenter", () => (hot = true));
    tile.addEventListener("pointerleave", () => (hot = false));
  }
}
