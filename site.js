const itemsData = [
  { title: 'Sawtlook', color: '#ff6a00', url: 'sawtlook_page.html', bgUrl: 'images/projects_covers/SAWTLOOK PROJECT.png' },
  { title: 'Elite Force', color: '#ff6a00', url: 'elite_force_page.html', bgUrl: 'images/projects_covers/elm lcover.png' },
  { title: 'Arrivals Esports', color: '#ff6a00', url: 'arrivals_page.html', bgUrl: 'images/projects_covers/arrivals cover.png' },
  { title: 'EFA Español', color: '#ff6a00', url: 'efa_page.html', bgUrl: 'images/projects_covers/EFA PROJECT.png' },
  { title: 'Elm Jersey', color: '#ff6a00', url: 'elm_jersey_page.html', bgUrl: 'images/projects_covers/jersey cover.png' },
  { title: 'Lalla Zaho', color: '#ff6a00', url: 'lalla_zaho_page.html', bgUrl: 'images/projects_covers/LALLA ZAHO PROJECT.png' },
  { title: 'Nord Phone', color: '#ff6a00', url: 'nord_phone_page.html', bgUrl: 'images/projects_covers/NORD PHONE PROJECT.png' },
  { title: 'Mille Events', color: '#ff6a00', url: 'mille_events_page.html', bgUrl: 'images/projects_covers/MILLE EVENT PROJECT.png' }
];

let currentIndex = 0;
let isDragging = false;
let startX = 0;
let currentX = 0;
const dragThreshold = 40;
const N = itemsData.length;
let carouselWheelAccumulation = 0;
const carouselWheelThreshold = 90;

const tickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
tickSound.volume = 0.2;
let audioEnabled = false;
document.body.addEventListener('click', () => audioEnabled = true, { once: true });
document.body.addEventListener('touchstart', () => audioEnabled = true, { once: true });
function playTick() { if (audioEnabled) { tickSound.currentTime = 0; tickSound.play().catch(() => {}); } }

let carouselTrack, paginationCont, prevBtn, nextBtn;
function initCarousel() {
  carouselTrack = document.getElementById('carousel-track');
  paginationCont = document.getElementById('carousel-pagination');
  prevBtn = document.getElementById('prev-btn');
  nextBtn = document.getElementById('next-btn');
  if (!carouselTrack || !paginationCont || !prevBtn || !nextBtn) return;
  renderCarousel();
  document.documentElement.style.setProperty('--accent-color', itemsData[currentIndex].color);
  prevBtn.addEventListener('click', () => navigate('prev'));
  nextBtn.addEventListener('click', () => navigate('next'));
  carouselTrack.addEventListener('mousedown', handleDragStart);
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);
  carouselTrack.addEventListener('touchstart', handleDragStart, { passive: true });
  document.addEventListener('touchmove', handleDragMove, { passive: false });
  document.addEventListener('touchend', handleDragEnd);
  const carouselViewport = carouselTrack.closest('.carousel-container') || carouselTrack;
  carouselViewport.addEventListener('wheel', (e) => {
    // 1. Prevent the page from scrolling
    e.preventDefault();

    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);
    
    // 2. Capture the scroll direction, whether horizontal or vertical
    const delta = absX > absY ? e.deltaX : e.deltaY;
    
    if (delta === 0) return;

    carouselWheelAccumulation += Math.abs(delta);
    if (carouselWheelAccumulation < carouselWheelThreshold) {
      return;
    }

    carouselWheelAccumulation = 0;
    
    // 3. Navigate the carousel
    if (delta < 0) navigate('prev');
    else navigate('next');
  }, { passive: false });
  window.addEventListener('resize', () => updateCarousel(true));
}

function renderPagination() {
  paginationCont.innerHTML = '';
  itemsData.forEach((_, index) => {
    const tab = document.createElement('div');
    tab.classList.add('pagination-tab');
    tab.addEventListener('click', () => { if (currentIndex !== index) { currentIndex = index; playTick(); updateCarousel(); } });
    paginationCont.appendChild(tab);
  });
}

function renderCarousel() {
  carouselTrack.innerHTML = '';
  itemsData.forEach((item, index) => {
    const wrapperEl = document.createElement('div');
    wrapperEl.classList.add('card-wrapper');
    wrapperEl.style.position = 'absolute';
    wrapperEl.style.left = '50%';
    wrapperEl.style.top = '50%';
    const titleEl = document.createElement('h3');
    titleEl.classList.add('carousel-title');
    titleEl.textContent = item.title;
    const cardEl = document.createElement('div');
    cardEl.classList.add('card');
    cardEl.style.backgroundImage = `url("${encodeURI(item.bgUrl)}")`;
    cardEl.style.backgroundColor = '#111';
    const overlayEl = document.createElement('div');
    overlayEl.className = 'discover-overlay';
    overlayEl.innerHTML = `<span class="discover-button" role="button" tabindex="0" aria-label="Open project"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="white" stroke-opacity="0.18" stroke-width="1.6" /><circle cx="12" cy="12" r="5" stroke="white" stroke-opacity="0.22" stroke-width="1.6" /><circle cx="12" cy="12" r="2" fill="white" /></svg><span class="discover-label">Click to discover</span></span>`;
    cardEl.appendChild(overlayEl);
    const discoverBtn = overlayEl.querySelector('.discover-button');
    if (discoverBtn) {
      discoverBtn.style.pointerEvents = 'auto';
      discoverBtn.addEventListener('click', (evt) => { evt.stopPropagation(); if (item.url && item.url !== '#') window.open(item.url, '_blank'); else { currentIndex = index; playTick(); updateCarousel(); } });
      discoverBtn.addEventListener('keydown', (evt) => { if (evt.key === 'Enter' || evt.key === ' ') { evt.preventDefault(); discoverBtn.click(); } });
    }
    wrapperEl.appendChild(titleEl);
    wrapperEl.appendChild(cardEl);
    wrapperEl.addEventListener('click', (e) => { if (startX !== currentX && Math.abs(currentX - startX) > 10) return; if (index === currentIndex) { if (item.url !== '#') window.open(item.url, '_blank'); } else { currentIndex = index; playTick(); updateCarousel(); } });
    carouselTrack.appendChild(wrapperEl);
  });
  renderPagination();
  updateCarousel(true);
}

function updateCarousel(instant = false) {
  document.documentElement.style.setProperty('--accent-color', itemsData[currentIndex].color);
  const wrappers = document.querySelectorAll('.card-wrapper');
  const vw = window.innerWidth;
  const isMobile = vw <= 768;
  const currentCardWidth = isMobile ? 140 : 230;
  let xOffsetMultiplier = (vw / 2) / 3;
  xOffsetMultiplier = Math.max(xOffsetMultiplier, currentCardWidth + 15);
  wrappers.forEach((wrapper, index) => {
    let position = (index - currentIndex) % N; if (position < 0) position += N;
    let dist = position; if (position > Math.floor(N / 2)) dist = position - N;
    const absDist = Math.abs(dist);
    wrapper.classList.toggle('center', dist === 0);
    if (absDist > 3) { wrapper.style.opacity = '0'; wrapper.style.pointerEvents = 'none'; wrapper.style.transform = `translateX(${dist * xOffsetMultiplier}px) translateY(-50%) translateZ(0) rotateY(0deg) scale(1)`; return; } else { wrapper.style.pointerEvents = 'auto'; }
    const titleEl = wrapper.querySelector('.carousel-title');
    if (dist < 0) titleEl.style.webkitMaskImage = 'linear-gradient(to right, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 95%)'; else if (dist > 0) titleEl.style.webkitMaskImage = 'linear-gradient(to right, rgba(0,0,0,0) 5%, rgba(0,0,0,1) 80%)'; else titleEl.style.webkitMaskImage = 'none';
    let scale = 1; let translateZ = 0; let translateX = dist * xOffsetMultiplier; let rotateY = dist * -15; let opacity = absDist === 0 ? 1 : 0.5; let zIndex = 10 - absDist;
    wrapper.style.transition = instant ? 'none' : 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)'; wrapper.style.transform = `translateX(calc(${translateX}px - 50%)) translateY(-50%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`; wrapper.style.zIndex = zIndex; wrapper.style.opacity = opacity;
  });
  const tabs = document.querySelectorAll('.pagination-tab'); tabs.forEach((tab, index) => tab.classList.toggle('active', index === currentIndex));
}

function handleDragStart(e) { isDragging = true; startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX; currentX = startX; }
function handleDragMove(e) { if (!isDragging) return; currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX; if (e.type === 'touchmove' && Math.abs(currentX - startX) > 10) { if (e.cancelable) e.preventDefault(); } }
function handleDragEnd() { if (!isDragging) return; isDragging = false; const deltaX = currentX - startX; if (Math.abs(deltaX) > dragThreshold) { if (deltaX > 0) navigate('prev'); else navigate('next'); } }
function navigate(direction) { if (direction === 'next') currentIndex = (currentIndex + 1) % N; else if (direction === 'prev') currentIndex = (currentIndex - 1 + N) % N; playTick(); updateCarousel(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCarousel); else initCarousel();
// Mobile blocker is permanent on small screens: no JS needed here.
// 1. TESTIMONIAL CAROUSEL
(function initTestimonials() {
  const section = document.querySelector('.testimonial-section');
  if (!section) return;

  const container = section.querySelector('.testimonial-container');
  const track = section.querySelector('#testimonialTrack');
  let cards = Array.from(section.querySelectorAll('.testimonial-card'));
  let origCount = cards.length;

  // Clone cards for infinite scroll
  if (origCount > 0) {
    const originals = cards.slice();
    // Prepend
    for (let i = originals.length - 1; i >= 0; i--) {
      track.insertBefore(originals[i].cloneNode(true), track.firstChild);
    }
    // Append
    for (let i = 0; i < originals.length; i++) {
      track.appendChild(originals[i].cloneNode(true));
    }
    cards = Array.from(track.querySelectorAll('.testimonial-card'));
  }

  if (!container || !track || cards.length === 0) return;

  // State Variables
  let currentTranslate = 0, maxTranslate = 0, dragging = false;
  let sX = 0, startTranslate = 0;
  let wheelTimeout = null, rafId = null;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function measure() {
    maxTranslate = Math.max(0, track.scrollWidth - container.clientWidth);
    currentTranslate = clamp(currentTranslate, -maxTranslate, 0);
  }

  function setTranslate(v, instant = false) {
    measure();
    currentTranslate = clamp(v, -maxTranslate, 0);
    if (rafId) cancelAnimationFrame(rafId);
    
    rafId = requestAnimationFrame(() => {
      track.style.transition = instant ? 'none' : 'transform 0.22s ease';
      track.style.transform = `translateX(${currentTranslate}px)`;
      updateActiveCard();
    });
  }

  function updateActiveCard() {
    const rectC = container.getBoundingClientRect();
    const centerX = rectC.left + rectC.width / 2;
    let closest = 0, best = Infinity;

    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(centerX - c);
      if (d < best) {
        best = d;
        closest = i;
      }
    });

    cards.forEach((card, i) => card.classList.toggle('testimonial-card-active', i === closest));
  }

  function snapToClosest() {
    const rectC = container.getBoundingClientRect();
    const centerX = rectC.left + rectC.width / 2;
    let bestIndex = 0, bestDistance = Infinity;

    cards.forEach((card, idx) => {
      const r = card.getBoundingClientRect();
      const cardCenter = r.left + r.width / 2;
      const distance = cardCenter - centerX;
      if (Math.abs(distance) < Math.abs(bestDistance)) {
        bestDistance = distance;
        bestIndex = idx;
      }
    });

    const bestCard = cards[bestIndex];
    if (!bestCard) return;

    const bestRect = bestCard.getBoundingClientRect();
    const bestCenter = bestRect.left + bestRect.width / 2;
    const delta = bestCenter - centerX;
    
    setTranslate(currentTranslate - delta);

    // Infinite wrap check
    if (origCount > 0) {
      const middleStart = origCount;
      const middleEnd = origCount * 2 - 1;
      if (bestIndex < middleStart || bestIndex > middleEnd) {
        const logical = ((bestIndex - middleStart) % origCount + origCount) % origCount;
        const middleIndex = middleStart + logical;
        setTimeout(() => {
          const rectMid = cards[middleIndex].getBoundingClientRect();
          const center = rectMid.left + rectMid.width / 2;
          const deltaMid = center - centerX;
          setTranslate(currentTranslate - deltaMid, true);
        }, 260);
      }
    }
  }

  // Autoplay functionality
  const CONTINUOUS_SPEED = 28;
  let autoplayId = null, continuousRAF = null, lastRAFTime = 0, continuousBase = 0;

  function continuousStep(ts) {
    if (!lastRAFTime) lastRAFTime = ts;
    const dt = (ts - lastRAFTime) / 1000;
    lastRAFTime = ts;

    if (!dragging) {
      currentTranslate -= CONTINUOUS_SPEED * dt;
      track.style.transition = 'none';
      track.style.transform = `translateX(${currentTranslate}px)`;
      
      const totalWidth = track.scrollWidth;
      const originalsWidth = totalWidth / 3;
      
      if (currentTranslate <= continuousBase - originalsWidth) {
        currentTranslate += originalsWidth;
        track.style.transition = 'none';
        track.style.transform = `translateX(${currentTranslate}px)`;
      }
    }
    continuousRAF = requestAnimationFrame(continuousStep);
  }

  function startAutoplay() {
    if (autoplayId) { clearInterval(autoplayId); autoplayId = null; }
    if (continuousRAF) return;
    lastRAFTime = 0;
    continuousRAF = requestAnimationFrame(continuousStep);
  }

  function stopAutoplay() {
    if (autoplayId) { clearInterval(autoplayId); autoplayId = null; }
    if (continuousRAF) {
      cancelAnimationFrame(continuousRAF);
      continuousRAF = null;
      lastRAFTime = 0;
    }
  }

  // Event Listeners
  container.addEventListener('mouseenter', stopAutoplay);
  container.addEventListener('mouseleave', () => { if (!dragging) startAutoplay(); });
  container.addEventListener('pointerdown', () => stopAutoplay());
  window.addEventListener('pointerup', () => { if (!dragging) startAutoplay(); });

  container.addEventListener('pointerdown', (e) => {
    // Prevent dragging if clicking a button/link
    if (e.target.closest && e.target.closest('.testimonial-toggle, button, a, .discover-button')) return;
    
    dragging = true;
    sX = e.clientX;
    startTranslate = currentTranslate;
    container.setPointerCapture?.(e.pointerId);
  });

  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const delta = e.clientX - sX;
    setTranslate(startTranslate + delta, true);
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    snapToClosest();
  }

  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  // Wheel event - Beware of trapping user scroll!
  container.addEventListener('wheel', (e) => {
    e.preventDefault(); 
    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);
    const delta = absX > absY ? e.deltaX : e.deltaY; 
    
    setTranslate(currentTranslate - delta, true); 
    clearTimeout(wheelTimeout); 
    wheelTimeout = setTimeout(() => snapToClosest(), 120); 
  }, { passive: false });

  window.addEventListener('resize', () => {
    measure();
    setTranslate(currentTranslate, true);
  });

  // Initialization
  measure();
  setTranslate(0, true);

  if (origCount > 0) {
    const middleStart = origCount;
    const firstOriginal = cards[middleStart];
    if (firstOriginal) {
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      const rect = firstOriginal.getBoundingClientRect();
      const delta = rect.left + rect.width / 2 - centerX;
      setTranslate(currentTranslate - delta, true);
      continuousBase = currentTranslate;
    }
  }

  try { startAutoplay(); } catch (e) {}
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });
})();

// 2. EXPAND TOGGLES
(function expandToggles() {
  const toggles = Array.from(document.querySelectorAll('.testimonial-toggle'));
  if (!toggles.length) return;

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.testimonial-card'); 
      if (!card) return; 
      
      const expanded = card.classList.toggle('expanded'); 
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false'); 
      btn.textContent = expanded ? 'See less' : 'See more'; 
      
      if (expanded) {
        const rect = card.getBoundingClientRect();
        if (rect.top < 80 || rect.bottom > (window.innerHeight || document.documentElement.clientHeight) - 80) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  });
})();

// 3. SMOOTH ANCHORS
(function smoothAnchors() {
  const header = document.querySelector('header'); 
  const headerOffset = () => (header ? header.offsetHeight + 24 : 24);

  function smoothScrollToId(id) {
    if (!id) return;
    const el = document.getElementById(id); 
    if (!el) return;
    
    const rect = el.getBoundingClientRect(); 
    const targetY = window.scrollY + rect.top - headerOffset(); 
    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]'); 
    if (!a) return; 
    
    const href = a.getAttribute('href'); 
    if (!href || href === '#') return; 
    
    if (href.startsWith('#')) {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        setTimeout(() => smoothScrollToId(id), 0);
      }
    }
  });
})();