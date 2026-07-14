/* ============================================================
   TheLearnAI Program — interactions
   ============================================================ */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav: scrolled state + mobile toggle ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    const toggle = nav.querySelector('.nav__toggle');
    const links = nav.querySelector('.nav__links');
    if (toggle && links) {
      toggle.addEventListener('click', () => links.classList.toggle('open'));
      links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
    }
  }

  /* ---------- Neural constellation (canvas) ---------- */
  document.querySelectorAll('canvas.constellation').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const palette = ['138,114,232', '40,203,166', '245,140,186', '127,178,240'];
    let w, h, nodes = [], mouse = { x: -999, y: -999 }, raf;
    const host = canvas.parentElement;

    function size() {
      const r = host.getBoundingClientRect();
      w = canvas.width = r.width * devicePixelRatio;
      h = canvas.height = r.height * devicePixelRatio;
      canvas.style.width = r.width + 'px';
      canvas.style.height = r.height + 'px';
      const count = Math.min(56, Math.round(r.width * r.height / 15000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .18 * devicePixelRatio,
        vy: (Math.random() - .5) * .18 * devicePixelRatio,
        r: (Math.random() * 2.4 + 1.4) * devicePixelRatio,
        c: palette[(Math.random() * palette.length) | 0]
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const maxD = 130 * devicePixelRatio;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        // gentle mouse drift
        const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 120 * devicePixelRatio) { n.x += dx / d * .6; n.y += dy / d * .6; }
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j], ddx = n.x - m.x, ddy = n.y - m.y, dd = Math.hypot(ddx, ddy);
          if (dd < maxD) {
            ctx.strokeStyle = `rgba(${n.c},${(1 - dd / maxD) * .32})`;
            ctx.lineWidth = 1 * devicePixelRatio;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${n.c},.85)`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 7); ctx.fill();
        ctx.fillStyle = `rgba(${n.c},.16)`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 3, 0, 7); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    size();
    if (!reduce) { draw(); }
    else { draw(); cancelAnimationFrame(raf); } // one static frame
    window.addEventListener('resize', size);
    host.addEventListener('mousemove', e => {
      const r = host.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * devicePixelRatio;
      mouse.y = (e.clientY - r.top) * devicePixelRatio;
    });
    host.addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });
  });

  /* ---------- Sparkles (echo the logo) ---------- */
  document.querySelectorAll('[data-sparkles]').forEach(host => {
    if (reduce) return;
    const n = parseInt(host.dataset.sparkles) || 8;
    const cols = ['var(--purple)', 'var(--teal)', 'var(--pink)', 'var(--blue)'];
    const svg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c.6 6 5.4 10.8 12 12-6.6 1.2-11.4 6-12 12-.6-6-5.4-10.8-12-12C6.6 10.8 11.4 6 12 0z"/></svg>';
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.innerHTML = svg;
      s.style.left = Math.random() * 96 + 2 + '%';
      s.style.top = Math.random() * 82 + 4 + '%';
      s.style.color = cols[i % cols.length];
      s.style.animationDelay = (Math.random() * 3.4).toFixed(2) + 's';
      s.style.transform = `scale(${(Math.random() * .6 + .5).toFixed(2)})`;
      host.appendChild(s);
    }
  });

  /* ---------- Reveal on scroll ---------- */
  const revs = document.querySelectorAll('.reveal');
  if (revs.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .14 });
    revs.forEach(r => io.observe(r));
  }

  /* ---------- Count-up stats ---------- */
  const nums = document.querySelectorAll('[data-count]');
  if (nums.length) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        if (reduce) { el.textContent = target + suffix; io2.unobserve(el); return; }
        let start = null, dur = 1500;
        const step = (t) => {
          if (!start) start = t;
          const p = Math.min((t - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io2.unobserve(el);
      });
    }, { threshold: .5 });
    nums.forEach(n => io2.observe(n));
  }

  /* ---------- Map (Leaflet) ---------- */
  const mapEl = document.getElementById('map');
  if (mapEl && window.L) {
    const cities = [
      { name: 'Wayne', county: 'Passaic County', lat: 40.9256, lng: -74.2764 },
      { name: 'Paterson', county: 'Passaic County', lat: 40.9168, lng: -74.1718 },
      { name: 'Little Falls', county: 'Passaic County', lat: 40.8687, lng: -74.2085 },
      { name: 'Pompton Lakes', county: 'Passaic County', lat: 41.0067, lng: -74.2907 },
      { name: 'Totowa', county: 'Passaic County', lat: 40.9056, lng: -74.2213 },
      { name: 'Clifton', county: 'Passaic County', lat: 40.8584, lng: -74.1638 },
      { name: 'Pequannock', county: 'Morris County', lat: 40.9762, lng: -74.3046 }
    ];
    const map = L.map('map', { scrollWheelZoom: false, zoomControl: true }).setView([40.93, -74.23], 11);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 19
    }).addTo(map);

    const icon = L.divIcon({
      className: 'pin-marker',
      html: '<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a72e8"/><stop offset="1" stop-color="#28cba6"/></linearGradient></defs><path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 27 17 27s17-15 17-27C34 7.6 26.4 0 17 0z" fill="url(#g)"/><circle cx="17" cy="17" r="7" fill="#fff"/></svg>',
      iconSize: [34, 44], iconAnchor: [17, 44], popupAnchor: [0, -40]
    });
    const group = [];
    cities.forEach(c => {
      const m = L.marker([c.lat, c.lng], { icon }).addTo(map)
        .bindPopup(`<strong>${c.name}, NJ</strong><br>${c.county}`);
      group.push(m.getLatLng());
    });
    map.fitBounds(L.latLngBounds(group).pad(0.18));
  }
})();
