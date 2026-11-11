(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const media = (typeof KINOSJEFEN_MEDIA !== 'undefined') ? KINOSJEFEN_MEDIA : {};

  document.querySelectorAll('[data-media]').forEach((slot) => {
    const item = media[slot.dataset.media];
    if (!item || !item.src) return;
    slot.textContent = '';
    const node = document.createElement(item.type === 'video' ? 'video' : 'img');
    node.src = item.src;
    node.style.width = '100%';
    node.style.height = '100%';
    node.style.objectFit = 'cover';
    if (item.type === 'video') {
      node.controls = true;
      node.playsInline = true;
      if (item.alt) node.setAttribute('aria-label', item.alt);
    } else {
      node.alt = item.alt || '';
    }
    slot.appendChild(node);
  });

  /* film grain that fades as the story goes digital */
  const cv = document.getElementById('grain');
  const ctx = cv.getContext('2d');
  cv.width = 160; cv.height = 100;
  const img = ctx.createImageData(cv.width, cv.height);
  function noise() {
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  noise();
  if (!reduce) setInterval(noise, 90);

  const progress = document.getElementById('progress');
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const t = max > 0 ? Math.min(1, scrollY / max) : 0;
    progress.style.width = (t * 100) + '%';
    cv.style.opacity = (0.16 * (1 - Math.min(1, t * 1.6))).toFixed(3);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* toast for audio placeholders */
  const toast = document.getElementById('toast');
  let toastTimer;
  let currentSound = null;
  let currentKey = null;
  function say(msg) {
    toast.textContent = msg; toast.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.hidden = true, 2600);
  }
  document.querySelectorAll('[data-audio]').forEach(b =>
    b.addEventListener('click', () => {
      const key = b.dataset.audio;
      const clip = media.audio && media.audio[key];
      if (clip && clip.src) {
        if (currentSound && currentKey === key && !currentSound.paused) {
          currentSound.pause();
          currentSound.currentTime = 0;
          return;
        }
        if (currentSound) {
          currentSound.pause();
        }
        currentKey = key;
        currentSound = new Audio(clip.src);
        currentSound.play().catch(() => say('Her legges lydklippet fra intervjuet inn.'));
        return;
      }
      say('Her legges lydklippet fra intervjuet inn.');
    }));

  /* clippings */
  const clips = {
    teip: ['Bilde tatt fra bladet Hele byens kino, lagd av Geir Løvli og Jørgen Søderberg Jansen. Dato 05.11.83', 'Kinosjefen teipet igjen munnen', 'Kjeldsen fikk taleforbud i et politisk møte og møtte opp med gaffateip over munnen.'],
    che: ['Fredriksstad Blad · 02.11.05', 'Kinosjef i Che Guevara-skjorte i Havana', 'Bildet førte til at en lokalpolitiker ville ha Kjeldsen sparket. Forslaget fikk to stemmer.']
  };
  const lb = document.getElementById('lightbox');
  let lastFocus;
  document.querySelectorAll('[data-clip]').forEach(b => b.addEventListener('click', () => {
    const c = clips[b.dataset.clip];
    document.getElementById('lb-paper').textContent = c[0];
    document.getElementById('lb-title').textContent = c[1];
    document.getElementById('lb-text').textContent = c[2];
    const old = document.getElementById('lb-shot');
    if (old) old.remove();
    const shot = media.clips && media.clips[b.dataset.clip];
    if (shot && shot.src) {
      const photo = document.createElement('img');
      photo.id = 'lb-shot';
      photo.src = shot.src;
      photo.alt = shot.alt || '';
      document.getElementById('lb-paper').before(photo);
    }
    lastFocus = b; lb.hidden = false; document.getElementById('lb-close').focus();
  }));
  function closeLb() { lb.hidden = true; lastFocus && lastFocus.focus(); }
  document.getElementById('lb-close').addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  /* visitor chart — tallene kommer fra data/besokstall.js */
  const svg = document.getElementById('chart');
  const NS = 'http://www.w3.org/2000/svg';
  const W = 640, H = 300, L = 56, R = 24, T = 20, B = 40;
  const x = i => L + i * (W - L - R) / (pts.length - 1);
  const y = v => T + (H - T - B) * (1 - v / 320);
  const el = (n, a, txt) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; svg.appendChild(e); return e; };
  [0, 100, 200, 300].forEach(g => {
    el('line', { x1: L, x2: W - R, y1: y(g), y2: y(g), stroke: 'var(--line)', 'stroke-width': 1 });
    el('text', { x: L - 8, y: y(g) + 4, 'text-anchor': 'end', fill: 'var(--muted)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': 11 }, g === 0 ? '0' : g + ' 000');
  });
  el('path', { d: 'M' + pts.map((p, i) => x(i) + ' ' + y(p.v)).join(' L'), fill: 'none', stroke: 'var(--lamp)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
  const chartPoints = pts.map((p, i) => {
    el('text', { x: x(i), y: H - 14, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': 11 }, p.k);
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'chart-point');
    g.setAttribute('transform', `translate(${x(i)} ${y(p.v)})`);
    [
      ['chart-glow', { r: '11', fill: 'var(--lamp)' }],
      ['chart-ring', { r: '12', fill: 'none', stroke: 'var(--lamp)', 'stroke-width': '1' }],
      ['chart-dot', { r: '5', fill: '#161922', stroke: 'var(--lamp)', 'stroke-width': '2' }]
    ].forEach(([cls, attrs]) => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('class', cls);
      c.setAttribute('cx', '0');
      c.setAttribute('cy', '0');
      Object.entries(attrs).forEach(([k, v]) => c.setAttribute(k, v));
      g.appendChild(c);
    });
    svg.appendChild(g);
    return g;
  });
  const steps = document.getElementById('steps');
  const annot = document.getElementById('annot');
  const stepBtns = pts.map((p, i) => {
    const b = document.createElement('button');
    b.className = 'btn chart-step';
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', p.b);
    const year = document.createElement('span');
    year.className = 'chart-step-year';
    year.textContent = p.k;
    b.appendChild(year);
    const tag = document.createElement('span');
    tag.className = 'chart-step-tag';
    tag.textContent = p.b.includes(' · ') ? p.b.split(' · ').slice(1).join(' · ') : '\u00a0';
    if (!p.b.includes(' · ')) tag.setAttribute('aria-hidden', 'true');
    b.appendChild(tag);
    b.addEventListener('click', () => pick(i));
    steps.appendChild(b);
    return b;
  });
  function pick(i) {
    chartPoints.forEach((g, j) => g.classList.toggle('is-active', j === i));
    stepBtns.forEach((b, j) => b.setAttribute('aria-pressed', j === i ? 'true' : 'false'));
    annot.innerHTML = pts[i].t;
  }
  pick(0);

  /* revejakt */
  const reveal = document.getElementById('reveal');
  const replies = {
    1: 'Det var nettopp det Kjeldsen ville unngå. Klubben endte ikke her.',
    2: 'Akkurat som klubben. Den blånektet det strengeste forslaget og gikk for mellomforslaget.',
    3: 'Klubben blånektet dette forslaget. Det var aldri ment å bli valgt.'
  };
  document.querySelectorAll('.option').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.option').forEach(o => o.setAttribute('aria-pressed', o === b));
    const picked = b.dataset.opt === '2';
    reveal.innerHTML = '<div class="prose"><p>' + replies[b.dataset.opt] + '</p>' + (picked
      ? '<p class="quote">– Det var akkurat det jeg ville ha. Jeg er gammel, men jeg er ikke dum.</p><p>Som reven som flykter fra bålet og ut den eneste ledige utgangen, valgte klubben det forslaget kinosjefen hadde siktet mot hele tiden.</p>'
      : '<p>Prøv et annet forslag for å se hvilket Kjeldsen egentlig ville ha.</p>') + '</div>';
  }));

  /* screen masking: stage is 1.85:1; scope-height screen = width/2.39 */
  const pic = document.getElementById('picture');
  const maskText = document.getElementById('mask-text');
  function mask(mode) {
    document.querySelectorAll('[data-mask]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mask === mode));
    if (mode === 'side') {
      const h = 1.85 / 2.39 * 100;      // scope height as share of stage height
      pic.style.height = h + '%';
      pic.style.width = h + '%';        // 1.85 × scope height = same share of stage width
      maskText.textContent = 'Lerretet er bygd for de bredeste filmene. Widescreen-filmen får samme høyde og blir smalere, med svarte tepper på sidene.';
    } else {
      pic.style.height = '100%'; pic.style.width = '100%';
      maskText.textContent = 'Teppet flyttes opp og ned i stedet. Widescreen-filmen fyller hele bredden og blir rundt 67 prosent større.';
    }
  }
  document.querySelectorAll('[data-mask]').forEach(b => b.addEventListener('click', () => mask(b.dataset.mask)));
  mask('side');

  /* price */
  const price = document.getElementById('price');
  function priceUpdate() {
    const p = +price.value;
    document.getElementById('p-one').textContent = p + ' kr';
    document.getElementById('p-four').textContent = (p * 4) + ' kr';
    document.getElementById('p-text').textContent = p <= 85
      ? '«Da går folk på kino igjen, og de forteller andre om filmen.» Her ligger Kjeldsens forslag på rundt 80 kroner.'
      : p >= 145 ? 'Omtrent dagens pris, ifølge Kjeldsen. «Folk sitter og teller.»'
      : 'Dra mot venstre for å se Kjeldsens forslag.';
  }
  price.addEventListener('input', priceUpdate);
  priceUpdate();

  /* cuba map */
  const map = document.getElementById('map');
  const m = (n, a, txt) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; map.appendChild(e); return e; };
  const route = m('path', { d: 'M 560 70 C 440 20, 220 60, 110 250', fill: 'none', stroke: 'var(--coral)', 'stroke-width': 2, 'stroke-dasharray': '6 6' });
  m('circle', { cx: 560, cy: 70, r: 6, fill: 'var(--fg)' });
  m('text', { x: 560, y: 100, 'text-anchor': 'middle', fill: 'var(--fg)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13 }, 'Fredrikstad');
  m('circle', { cx: 110, cy: 250, r: 6, fill: 'var(--coral)' });
  m('text', { x: 110, y: 282, 'text-anchor': 'middle', fill: 'var(--coral)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13 }, 'Havana');
  m('text', { x: 330, y: 200, 'text-anchor': 'middle', fill: '#a9c9c5', 'font-family': 'Newsreader, Georgia, serif', 'font-style': 'italic', 'font-size': 16 }, 'Atlanterhavet');
  const arrived = m('text', { x: 110, y: 302, 'text-anchor': 'middle', fill: 'var(--fg)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': 11, opacity: 0 }, 'Chaplin-kinoen · 2000 publikum');
  const len = route.getTotalLength();
  const boxes = [0, 1, 2, 3, 4].map(() => m('rect', { width: 18, height: 10, fill: 'var(--coral)', stroke: 'var(--havana)', 'stroke-width': 1, rx: 1 }));
  function place(t) {
    boxes.forEach((b, i) => {
      const s = Math.max(0, Math.min(1, t - i * 0.06));
      const pt = route.getPointAtLength(s * len);
      b.setAttribute('x', pt.x - 9 + (s === 0 ? (i - 2) * 20 : 0));
      b.setAttribute('y', pt.y - 5 - (s === 0 ? 22 : 0));
    });
  }
  place(0);
  let shipping = false;
  document.getElementById('ship').addEventListener('click', e => {
    if (shipping) return;
    const btn = e.currentTarget;
    shipping = true; arrived.setAttribute('opacity', 0);
    if (reduce) { place(1.3); arrived.setAttribute('opacity', 1); shipping = false; btn.textContent = 'Send på nytt'; return; }
    const start = performance.now(), dur = 3200;
    (function frame(now) {
      const t = Math.min(1.3, (now - start) / dur * 1.3);
      place(t);
      if (t < 1.3) requestAnimationFrame(frame);
      else { arrived.setAttribute('opacity', 1); shipping = false; btn.textContent = 'Send på nytt'; }
    })(start);
  });

  /* lights out */
  const lights = document.getElementById('lights');
  lights.addEventListener('click', () => {
    const on = document.body.classList.toggle('lights-out');
    lights.setAttribute('aria-pressed', on);
    lights.textContent = on ? 'Skru på lyset igjen' : 'Slukk lyset i salen';
  });
})();
