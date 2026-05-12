/* ═══════════════════════════════════════
   Portfolio – main.js
   Three.js particle network + GSAP scroll
   + typewriter + tilt cards + counters
   ═══════════════════════════════════════ */

/* ── 1. Three.js Hero Canvas ── */
(function initThree() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.z = 80;

  /* Particles */
  const PARTICLE_COUNT = 180;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const particles  = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 120;
    const z = (Math.random() - 0.5) * 60;
    positions[i * 3]     = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    particles.push({
      x, y, z,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      vz: (Math.random() - 0.5) * 0.04,
    });
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x00d4ff,
    size: 0.9,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });
  const pointMesh = new THREE.Points(pGeo, pMat);
  scene.add(pointMesh);

  /* Connection lines */
  const LINE_DIST = 28;
  const linePositions = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    for (let j = i + 1; j < PARTICLE_COUNT; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dz = particles[i].z - particles[j].z;
      if (Math.sqrt(dx*dx + dy*dy + dz*dz) < LINE_DIST) {
        linePositions.push(particles[i].x, particles[i].y, particles[i].z);
        linePositions.push(particles[j].x, particles[j].y, particles[j].z);
      }
    }
  }
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.08 });
  scene.add(new THREE.LineSegments(lGeo, lMat));

  /* Floating glowing spheres (IoT nodes) */
  const sphereGeom = new THREE.SphereGeometry(1, 12, 12);
  const spheres = [];
  for (let i = 0; i < 6; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x00d4ff : 0x7b2fff,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(sphereGeom, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 140,
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 40
    );
    const s = 1.5 + Math.random() * 2.5;
    mesh.scale.setScalar(s);
    mesh.userData.speed = 0.003 + Math.random() * 0.004;
    mesh.userData.offset = Math.random() * Math.PI * 2;
    scene.add(mesh);
    spheres.push(mesh);
  }

  /* Mouse parallax */
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.6;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  });

  /* Animate */
  let frame = 0;
  (function animate() {
    requestAnimationFrame(animate);
    frame++;

    /* Update particle positions */
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles[i].x += particles[i].vx;
      particles[i].y += particles[i].vy;
      particles[i].z += particles[i].vz;
      if (Math.abs(particles[i].x) > 100) particles[i].vx *= -1;
      if (Math.abs(particles[i].y) >  60) particles[i].vy *= -1;
      if (Math.abs(particles[i].z) >  30) particles[i].vz *= -1;
      positions[i * 3]     = particles[i].x;
      positions[i * 3 + 1] = particles[i].y;
      positions[i * 3 + 2] = particles[i].z;
    }
    pGeo.attributes.position.needsUpdate = true;

    /* Float spheres */
    spheres.forEach(s => {
      s.rotation.x += s.userData.speed;
      s.rotation.y += s.userData.speed * 0.7;
      s.position.y += Math.sin(frame * 0.012 + s.userData.offset) * 0.04;
    });

    /* Camera parallax */
    camera.position.x += (mouseX * 20 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 12 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  })();

  /* Resize */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ── 2. Navbar scroll effect ── */
(function initNavbar() {
  const nav    = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  toggle?.addEventListener('click', () => nav.classList.toggle('nav-open'));

  /* Active link highlight on scroll */
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });

  /* Close mobile nav on link click */
  links.forEach(a => a.addEventListener('click', () => nav.classList.remove('nav-open')));
})();

/* ── 3. Typewriter ── */
(function initTypewriter() {
  const el    = document.getElementById('typewriter');
  if (!el) return;
  const roles = [
    'AI Engineer',
    'IoT Systems Developer',
    'Mechatronics Specialist',
    'Edge AI Researcher',
    'ML Engineer',
  ];
  let ri = 0, ci = 0, deleting = false;
  const SPEED_TYPE = 90, SPEED_DELETE = 45, PAUSE = 1800;

  function tick() {
    const word = roles[ri];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
    if (!deleting && ci > word.length)  { deleting = true; setTimeout(tick, PAUSE); return; }
    if (deleting  && ci < 0)             { deleting = false; ri = (ri + 1) % roles.length; ci = 0; }
    setTimeout(tick, deleting ? SPEED_DELETE : SPEED_TYPE);
  }
  setTimeout(tick, 2000);
})();

/* ── 4. Reveal on scroll (IntersectionObserver) ── */
(function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ── 5. Animated counters ── */
(function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseInt(el.dataset.target, 10);
      let cur   = 0;
      const inc = Math.max(1, Math.ceil(end / 60));
      const t   = setInterval(() => {
        cur = Math.min(cur + inc, end);
        el.textContent = cur;
        if (cur >= end) clearInterval(t);
      }, 20);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num[data-target]').forEach(el => obs.observe(el));
})();

/* ── 6. Skill bar animation ── */
(function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill = entry.target;
      const pct  = fill.dataset.width + '%';
      setTimeout(() => { fill.style.width = pct; }, 200);
      obs.unobserve(fill);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.skill-bar-fill').forEach(el => obs.observe(el));
})();

/* ── 7. 3D Tilt Cards ── */
(function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const tiltX  = dy * -10;
      const tiltY  = dx *  10;
      card.style.transform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) scale(1)';
      card.style.transition = 'transform 0.5s ease';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
})();

/* ── 8. GSAP ScrollTrigger (if loaded) ── */
(function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* Section headers stagger */
  gsap.utils.toArray('.section-header').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      });
  });

  /* Timeline cards stagger */
  gsap.utils.toArray('.timeline-item').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8, delay: i * 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      });
  });

  /* Project cards stagger */
  gsap.utils.toArray('.project-card').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, delay: (i % 3) * 0.12, ease: 'back.out(1.2)',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
      });
  });

  /* Skill tags float in */
  gsap.utils.toArray('.skill-tag').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, scale: 0.8, y: 15 },
      { opacity: 1, scale: 1, y: 0, duration: 0.45, delay: i * 0.04, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: el, start: 'top 95%', toggleActions: 'play none none none' }
      });
  });

  /* Cert items slide in from left */
  gsap.utils.toArray('.cert-item').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.5, delay: (i % 4) * 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' }
      });
  });

  /* Education cards scale in */
  gsap.utils.toArray('.edu-card').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1, duration: 0.7, delay: i * 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      });
  });
})();

/* ── 9. Contact form (UI only) ── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Message Sent!';
    btn.style.background = '#22c55e';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
})();

/* ── 10. Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── 11. Page scroll progress bar ── */
(function initProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'progress-bar';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = pct + '%';
  });
})();

/* ── 12. Custom cursor glow ── */
(function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const glow = document.createElement('div'); glow.id = 'cursor-glow';
  const dot  = document.createElement('div'); dot.id  = 'cursor-dot';
  document.body.append(glow, dot);

  let gx = 0, gy = 0, dx = 0, dy = 0;
  window.addEventListener('mousemove', e => { gx = e.clientX; gy = e.clientY; });

  (function moveCursor() {
    dx += (gx - dx) * 0.1;
    dy += (gy - dy) * 0.1;
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    dot.style.left  = dx + 'px';
    dot.style.top   = dy + 'px';
    requestAnimationFrame(moveCursor);
  })();

  /* Hide when leaving window */
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; dot.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; dot.style.opacity = '1'; });
})();

/* ── 13. Magnetic buttons ── */
(function initMagnetic() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      btn.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.1s ease';
    });
  });
})();

/* ── 14. Button ripple on click ── */
(function initRipple() {
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', e => {
      const r  = btn.getBoundingClientRect();
      btn.style.setProperty('--x', ((e.clientX - r.left) / r.width  * 100) + '%');
      btn.style.setProperty('--y', ((e.clientY - r.top)  / r.height * 100) + '%');
    });
  });
})();

/* ── 15. Timeline line draw on scroll ── */
(function initTimelineDraw() {
  const tl = document.querySelector('.timeline');
  if (!tl) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { tl.classList.add('line-drawn'); obs.disconnect(); }
  }, { threshold: 0.1 });
  obs.observe(tl);
})();

/* ── 16. Text scramble on section titles ── */
(function initScramble() {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
  function scramble(el) {
    const original = el.textContent;
    let iter = 0;
    const total = original.length * 3;
    const t = setInterval(() => {
      el.textContent = original.split('').map((ch, i) => {
        if (i < Math.floor(iter / 3)) return original[i];
        if (ch === ' ') return ' ';
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      if (iter >= total) { el.textContent = original; clearInterval(t); }
      iter++;
    }, 30);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { scramble(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.8 });

  document.querySelectorAll('.section-title').forEach(el => obs.observe(el));
})();

/* ── 17. Shimmer class on all cards ── */
(function addShimmer() {
  document.querySelectorAll('.project-card, .thesis-card, .edu-card, .timeline-card').forEach(el => {
    el.classList.add('shimmer-card');
  });
})();

/* ── 18. Thesis cards — 3D tilt ── */
(function initThesisTilt() {
  document.querySelectorAll('.thesis-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width  - 0.5;
      const dy = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${dy * -8}deg) rotateY(${dx * 8}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease, border-color var(--transition), box-shadow var(--transition)';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
})();

/* ── 19. Section background orbs ── */
(function initSectionOrbs() {
  const configs = [
    { selector: '#about',          colors: ['rgba(0,212,255,0.06)', 'rgba(123,47,255,0.05)'],  positions: [['10%','80%'],['85%','20%']], sizes: ['300px','200px'] },
    { selector: '#projects',       colors: ['rgba(123,47,255,0.06)','rgba(0,212,255,0.04)'],  positions: [['5%','60%'], ['90%','30%']], sizes: ['250px','180px'] },
    { selector: '#skills',         colors: ['rgba(0,212,255,0.05)', 'rgba(255,107,53,0.04)'], positions: [['80%','70%'],['15%','30%']], sizes: ['280px','200px'] },
    { selector: '#certifications', colors: ['rgba(123,47,255,0.05)','rgba(0,212,255,0.04)'],  positions: [['90%','50%'],['5%','80%']],  sizes: ['220px','180px'] },
    { selector: '#contact',        colors: ['rgba(0,212,255,0.06)', 'rgba(123,47,255,0.06)'], positions: [['15%','30%'],['85%','70%']], sizes: ['260px','240px'] },
  ];

  configs.forEach(({ selector, colors, positions, sizes }) => {
    const section = document.querySelector(selector);
    if (!section) return;
    colors.forEach((color, i) => {
      const orb = document.createElement('div');
      orb.className = 'section-orb';
      orb.style.cssText = `
        background: ${color};
        width: ${sizes[i]}; height: ${sizes[i]};
        left: ${positions[i][0]}; top: ${positions[i][1]};
        animation-delay: ${i * 2.5}s;
      `;
      section.prepend(orb);
    });
  });
})();

/* ── 20. Contact form input animated underline ── */
(function initInputLines() {
  document.querySelectorAll('.form-group').forEach(group => {
    const line = document.createElement('div');
    line.className = 'input-line';
    group.appendChild(line);
  });
})();

/* ── 21. Skill category entrance stagger ── */
(function initSkillStagger() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => {
        entry.target.style.opacity    = '1';
        entry.target.style.transform  = 'translateX(0)';
      }, i * 100);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.skill-category').forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateX(-30px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
    obs.observe(el);
  });
})();
