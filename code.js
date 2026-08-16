(function () {
  'use strict';

  const scene       = document.getElementById('scene');
  const envelope    = document.getElementById('envelope');
  const envFlap     = document.getElementById('envFlap');
  const letterModal = document.getElementById('letterModal');
  const canvas      = document.getElementById('confetti');
  const ctx         = canvas.getContext('2d');

  let state = 'idle';

  function open() {
    if (state !== 'idle') return;
    state = 'opening';

    envelope.style.cursor = 'default';

    setTimeout(() => {}, 200);

    setTimeout(() => envFlap.classList.add('open'), 500);

    setTimeout(() => {
      scene.classList.add('fade-out');
      letterModal.classList.add('visible');
      if (window.bg3dAPI) window.bg3dAPI.triggerOpen();
    }, 1300);

    setTimeout(() => {
      state = 'open';
      launchConfetti();
    }, 1900);
  }

  function close() {
    if (state !== 'open') return;
    state = 'closing';

    letterModal.classList.remove('visible');
    if (window.bg3dAPI) window.bg3dAPI.triggerClose();

    setTimeout(() => {
      scene.classList.remove('fade-out');
    }, 400);

    setTimeout(() => {
      envFlap.classList.remove('open');
    }, 600);

    setTimeout(() => {
      envelope.style.cursor = 'pointer';
      state = 'idle';
    }, 1500);
  }

  envelope.addEventListener('click', open);
  const letterPaper = document.getElementById('letterPaper');
  if (letterPaper) {
    letterPaper.addEventListener('click', e => e.stopPropagation());
  }
  letterModal.addEventListener('click', e => { if (e.target === letterModal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && state === 'open') close(); });

  const timelineToggle = document.getElementById('timelineToggle');
  const timelineContent = document.getElementById('timelineContent');
  if (timelineToggle && timelineContent) {
    timelineToggle.addEventListener('click', () => {
      timelineContent.classList.toggle('hidden');
      timelineToggle.classList.toggle('active');
    });
  }

  setTimeout(open, 2800);

  const pieces = [];
  let running = false;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function launchConfetti() {
    const colors = ['#C9A84C','#E8D08C','#F5ECC8','#1B3A6B','#2A4F8C','#ffffff','#A0B8D8'];
    for (let i = 0; i < 140; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 200,
        w: Math.random() * 10 + 4, h: Math.random() * 5 + 3,
        rot: Math.random() * 360,
        vx: (Math.random() - 0.5) * 3.5,
        vy: Math.random() * 3 + 1.5,
        vr: (Math.random() - 0.5) * 8,
        sw: Math.random() * Math.PI * 2, ss: Math.random() * 0.07 + 0.03,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1, circle: Math.random() < 0.25,
      });
    }
    if (!running) { running = true; tick(); }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      p.sw += p.ss; p.x += p.vx + Math.sin(p.sw) * 0.7;
      p.y += p.vy; p.rot += p.vr; p.vy += 0.04;
      if (p.y > canvas.height + 10) p.alpha -= 0.05;
      if (p.alpha <= 0) { pieces.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
      p.circle
        ? (ctx.beginPath(), ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2), ctx.fill())
        : ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    pieces.length > 0
      ? requestAnimationFrame(tick)
      : (ctx.clearRect(0, 0, canvas.width, canvas.height), running = false);
  }

})();
