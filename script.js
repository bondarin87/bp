console.log("BREAKPOINT listo.");

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
    const speed = 0.035 + depth * 0.09 + Math.random() * 0.035;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(direction) * speed + 0.035,
      vy: Math.sin(direction) * speed - 0.018,
      baseVx: Math.cos(direction) * speed + 0.035,
      baseVy: Math.sin(direction) * speed - 0.018,
      size: 0.45 + Math.random() * 1.25 + depth * 0.8,
      alpha: 0.13 + Math.random() * 0.22 + depth * 0.1,
      phase: Math.random() * Math.PI * 2,
      wobble: 0.0007 + Math.random() * 0.0018,
      depth
    };
  }

  function resetDust() {
    dust.length = 0;
    const count = Math.min(120, Math.max(65, Math.floor((width * height) / 15000)));

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
      const driftX = Math.sin(slowTime + particle.phase) * (0.12 + particle.depth * 0.22);
      const driftY = Math.cos(slowTime * 0.7 + particle.phase) * (0.08 + particle.depth * 0.16);

      particle.vx += (particle.baseVx - particle.vx) * 0.006;
      particle.vy += (particle.baseVy - particle.vy) * 0.006;
      particle.vx += (Math.random() - 0.5) * 0.0012;
      particle.vy += (Math.random() - 0.5) * 0.001;

      particle.x += particle.vx + driftX;
      particle.y += particle.vy + driftY - airLift * particle.depth;

      wrapParticle(particle);

      const shimmer = 0.72 + Math.sin(slowTime * 1.7 + particle.phase) * 0.28;
      const alpha = particle.alpha * shimmer;

      ctx.beginPath();
      ctx.fillStyle = `rgba(218, 190, 128, ${alpha})`;
      ctx.shadowColor = "rgba(218, 190, 128, 0.22)";
      ctx.shadowBlur = 5 + particle.depth * 7;
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
