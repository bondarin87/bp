console.log("BREAKPOINT listo.");

const pageLoader = document.getElementById("pageLoader");

if (pageLoader) {
  const loaderStart = Date.now();
  const minLoaderTime = 1300;
  const maxLoaderTime = 3200;
  let loaderClosed = false;

  function closeLoader() {
    if (loaderClosed) return;
    loaderClosed = true;

    const elapsed = Date.now() - loaderStart;
    const delay = Math.max(0, minLoaderTime - elapsed);

    setTimeout(() => {
      pageLoader.classList.add("hidden");
      document.body.classList.add("loaded");
    }, delay);
  }

  window.addEventListener("load", closeLoader);
  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(closeLoader, maxLoaderTime);
  });
  setTimeout(closeLoader, maxLoaderTime);
} else {
  document.body.classList.add("loaded");
}

const inspectionLight = document.getElementById("inspectionLight");

if (inspectionLight && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("mousemove", (event) => {
    document.body.classList.add("has-pointer");
    inspectionLight.style.left = `${event.clientX}px`;
    inspectionLight.style.top = `${event.clientY}px`;
  });

  window.addEventListener("mouseleave", () => {
    document.body.classList.remove("has-pointer");
  });
}

const typedHeroText = document.getElementById("typedHeroText");

if (typedHeroText) {
  const text = "Quitamos lo viejo.\nDejamos todo listo para empezar de nuevo.";
  let index = 0;

  function typeNextLetter() {
    typedHeroText.innerHTML = text.slice(0, index).replace(/\n/g, "<br>");
    index += 1;

    if (index <= text.length) {
      setTimeout(typeNextLetter, 48);
    }
  }

  setTimeout(typeNextLetter, 1450);
}

const scrollProgress = document.getElementById("scrollProgress");
let scrollCutTimer;

function updateScrollProgress() {
  if (!scrollProgress) return;

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollProgress.style.width = `${Math.min(progress, 100)}%`;
  scrollProgress.classList.add("cutting");

  clearTimeout(scrollCutTimer);
  scrollCutTimer = setTimeout(() => {
    scrollProgress.classList.remove("cutting");
  }, 180);
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const revealSections = document.querySelectorAll("section");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealSections.forEach((section) => {
    section.classList.add("reveal");
    revealObserver.observe(section);
  });
} else {
  revealSections.forEach((section) => {
    section.classList.add("visible");
  });
}

const dustCanvas = document.getElementById("dustLayer");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (dustCanvas && !reduceMotion) {
  const ctx = dustCanvas.getContext("2d");
  const dust = [];
  let width = 0;
  let height = 0;
  let lastScrollY = window.scrollY;
  let airLift = 0;

  function resizeDust() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    dustCanvas.width = width * ratio;
    dustCanvas.height = height * ratio;
    dustCanvas.style.width = `${width}px`;
    dustCanvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function createParticle() {
    const depth = Math.random();
    const direction = Math.random() * Math.PI * 2;
    const speed = 0.014 + depth * 0.035 + Math.random() * 0.014;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(direction) * speed + 0.012,
      vy: Math.sin(direction) * speed - 0.006,
      baseVx: Math.cos(direction) * speed + 0.012,
      baseVy: Math.sin(direction) * speed - 0.006,
      size: 0.18 + Math.random() * 0.55 + depth * 0.28,
      alpha: 0.1 + Math.random() * 0.16 + depth * 0.08,
      phase: Math.random() * Math.PI * 2,
      wobble: 0.0007 + Math.random() * 0.0018,
      depth
    };
  }

  function resetDust() {
    dust.length = 0;
    const count = Math.min(60, Math.max(32, Math.floor((width * height) / 30000)));

    for (let i = 0; i < count; i++) {
      dust.push(createParticle());
    }
  }

  function wrapParticle(particle) {
    const margin = 80;

    if (particle.x < -margin) particle.x = width + margin;
    if (particle.x > width + margin) particle.x = -margin;
    if (particle.y < -margin) particle.y = height + margin;
    if (particle.y > height + margin) particle.y = -margin;
  }

  function drawDust(time) {
    ctx.clearRect(0, 0, width, height);

    const scrollDelta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    airLift += scrollDelta * 0.018;
    airLift *= 0.92;

    for (const particle of dust) {
      const slowTime = time * particle.wobble;
      const driftX = Math.sin(slowTime + particle.phase) * (0.04 + particle.depth * 0.08);
      const driftY = Math.cos(slowTime * 0.7 + particle.phase) * (0.03 + particle.depth * 0.06);

      particle.vx += (particle.baseVx - particle.vx) * 0.006;
      particle.vy += (particle.baseVy - particle.vy) * 0.006;
      particle.vx += (Math.random() - 0.5) * 0.00045;
      particle.vy += (Math.random() - 0.5) * 0.0004;

      particle.x += particle.vx + driftX;
      particle.y += particle.vy + driftY - airLift * particle.depth;

      wrapParticle(particle);

      const shimmer = 0.72 + Math.sin(slowTime * 1.7 + particle.phase) * 0.28;
      const alpha = particle.alpha * shimmer;

      ctx.beginPath();
      ctx.fillStyle = `rgba(218, 190, 128, ${alpha})`;
      ctx.shadowColor = "rgba(218, 190, 128, 0.22)";
      ctx.shadowBlur = 3 + particle.depth * 4;
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(drawDust);
  }

  resizeDust();
  resetDust();
  requestAnimationFrame(drawDust);

  window.addEventListener("resize", () => {
    resizeDust();
    resetDust();
  });
}
