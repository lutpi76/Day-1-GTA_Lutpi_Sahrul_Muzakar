// Muse AI landing page. Plain JavaScript, no libraries.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// ---------- 1. Mobile navigation ----------
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.getElementById("nav-menu");

function setMenu(open) {
  navMenu.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
}
navToggle.addEventListener("click", () => setMenu(!navMenu.classList.contains("open")));
navMenu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); }); // close after choosing a link
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

// ---------- 2. Scroll reveal ----------
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("visible")); // old browsers: just show everything
}

// ---------- 3. Typing helper ----------
// Types `text` into `element`, `step` characters at a time. Instant if the user prefers reduced motion.
async function typeInto(element, text, step = 1, delay = 18) {
  if (reduceMotion) { element.textContent = text; return; }
  element.textContent = "";
  for (let i = 0; i < text.length; i += step) {
    element.textContent = text.slice(0, i + step);
    await sleep(delay);
  }
}

// Hero preview: type the example prompt once.
const heroTyped = document.getElementById("hero-typed");
if (heroTyped) typeInto(heroTyped, heroTyped.textContent, 1, 35);

// ---------- 4. Simulated terminal ----------
// These are scripted demo replies chosen by keyword. No AI is involved.
const replies = [
  { keywords: ["login", "sign in", "form"],
    text: "Absolutely! Let's build a clean and responsive login interface.",
    code: '<form class="login">\n  <label for="email">Email</label>\n  <input id="email" type="email" required>\n  <button>Sign in</button>\n</form>\n\n.login { max-width: 360px; margin: auto; display: grid; gap: 1rem; }' },
  { keywords: ["explain", "understand", "codebase", "project"],
    text: "Here is how I would approach an unfamiliar project: start at the entry point, map the folders, then follow one feature end to end.",
    code: "1. Find the entry file (index.js, main.py)\n2. List the main folders and their jobs\n3. Trace one request from input to output" },
  { keywords: ["refactor", "improve", "clean"],
    text: "Good call. I would split long functions, name things clearly, and remove duplication.",
    code: "// before\nfunction p(a){return a.map(x=>x*2).filter(x=>x>10)}\n\n// after\nconst doubleAll = nums => nums.map(n => n * 2);\nconst keepLarge = nums => nums.filter(n => n > 10);" }
];
const fallbackReply = { text: "Interesting idea! In the full product I would break that into steps and write the code with you. This demo only knows a few topics: try login, explain, or refactor.", code: "" };

const output = document.getElementById("terminal-output");
const form = document.getElementById("terminal-form");
const input = document.getElementById("terminal-input");
const chips = document.getElementById("chips");
let busy = false;

function addLine(className, text = "") {
  const line = document.createElement("div");
  line.className = "line " + className;
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
  return line;
}

function findReply(prompt) {
  const lower = prompt.toLowerCase();
  return replies.find(r => r.keywords.some(k => lower.includes(k))) || fallbackReply;
}

async function ask(prompt) {
  if (busy || !prompt.trim()) return;
  busy = true;
  input.disabled = true;
  addLine("line-user", "› " + prompt.trim()); // textContent keeps user text safe

  const reply = findReply(prompt);
  await sleep(reduceMotion ? 0 : 400);
  const museLine = addLine("line-muse");
  await typeInto(museLine, "Muse: " + reply.text, 2);
  if (reply.code) {
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    pre.appendChild(code);
    museLine.appendChild(pre);
    const timer = setInterval(() => { output.scrollTop = output.scrollHeight; }, 60);
    await typeInto(code, reply.code, 4, 12);
    clearInterval(timer);
  }
  output.scrollTop = output.scrollHeight;
  input.disabled = false;
  busy = false;
  input.focus();
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const value = input.value;
  input.value = "";
  ask(value);
});
chips.addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (chip) ask(chip.dataset.prompt);
});

addLine("line-note", "Muse AI demo v0.1. Replies are simulated. Pick a suggestion or type your own prompt.");
