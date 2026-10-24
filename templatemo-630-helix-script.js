(() => {
  const stage = document.querySelector('#stage');
  const plates = [...document.querySelectorAll('.plate')];
  if (!stage || !plates.length) return;

  const caption = document.querySelector('#caption');
  const capNo = document.querySelector('#capNo');
  const capTitle = document.querySelector('#capTitle');
  const capDesc = document.querySelector('#capDesc');
  const capMeta = document.querySelector('#capMeta');
  const scrub = document.querySelector('#scrub');
  const scrubFill = document.querySelector('#scrubFill');
  const scrubLabel = document.querySelector('#scrubLabel');
  const ticks = document.querySelector('#ticks');
  const tpBtn = document.querySelector('#tpBtn');
  const tpVal = document.querySelector('#tpVal');
  const tpFill = document.querySelector('#tpFill');
  const tpMinus = document.querySelector('#tpMinus');
  const tpPlus = document.querySelector('#tpPlus');

  let current = 0;
  let interval = 2;
  let playing = true;
  let timer;
  let progressTimer;
  let startedAt = Date.now();

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function renderTicks() {
    if (!ticks) return;
    ticks.innerHTML = '';
    plates.forEach((_, i) => {
      const tick = document.createElement('span');
      tick.className = 'tick';
      tick.style.left = `${(i / Math.max(1, plates.length - 1)) * 100}%`;
      ticks.appendChild(tick);
    });
  }

  function updateCaption(plate, index) {
    const infoTitle = plate.querySelector('.plate-info h2');
    const infoDesc = plate.querySelector('.plate-info p');
    if (capNo) capNo.textContent = String(index + 1).padStart(2, '0');
    if (capTitle) capTitle.textContent = infoTitle?.textContent || plate.dataset.alt || '';
    if (capDesc) capDesc.textContent = infoDesc?.textContent || '';
    if (capMeta) capMeta.innerHTML = `<span>${plate.dataset.alt || ''}</span><span>${plate.dataset.month || ''}</span><span>${plate.dataset.stock || ''}</span>`;
    if (scrubLabel) scrubLabel.textContent = `${String(index + 1).padStart(2, '0')} / ${plates.length}`;
    if (scrub) scrub.setAttribute('aria-valuenow', String(index + 1));
    if (scrubFill) scrubFill.style.width = `${(index / Math.max(1, plates.length - 1)) * 100}%`;
  }

  function layout() {
    const total = plates.length;
    const width = Math.min(stage.clientWidth * 0.42, 420);
    const spread = Math.min(stage.clientWidth * 0.24, 260);
    plates.forEach((plate, i) => {
      let offset = i - current;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
      const abs = Math.abs(offset);
      const x = offset * spread;
      const y = Math.min(abs * 18, 100);
      const z = 20 - abs;
      const scale = abs === 0 ? 1 : Math.max(0.68, 1 - abs * 0.12);
      const opacity = abs > 4 ? 0 : Math.max(0.18, 1 - abs * 0.16);
      const rotate = offset * -4;
      plate.style.width = `${width}px`;
      plate.style.opacity = opacity;
      plate.style.zIndex = String(z);
      plate.style.pointerEvents = abs <= 2 ? 'auto' : 'none';
      plate.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale}) rotateY(${rotate}deg)`;
      plate.classList.toggle('is-centre', offset === 0);
    });
    updateCaption(plates[current], current);
    document.querySelectorAll('.tick').forEach((tick, i) => tick.classList.toggle('on', i === current));
  }

  function restartTimer() {
    clearTimeout(timer);
    clearInterval(progressTimer);
    startedAt = Date.now();
    if (!playing) return;
    timer = setTimeout(() => { current = (current + 1) % plates.length; layout(); restartTimer(); }, interval * 1000);
    progressTimer = setInterval(() => {
      if (tpFill) tpFill.style.width = `${Math.min(100, ((Date.now() - startedAt) / (interval * 1000)) * 100)}%`;
    }, 50);
  }

  function goTo(index) {
    current = (index + plates.length) % plates.length;
    layout();
    restartTimer();
  }

  function togglePlay() {
    playing = !playing;
    tpBtn?.classList.toggle('playing', playing);
    tpBtn?.setAttribute('aria-pressed', String(playing));
    tpBtn?.setAttribute('aria-label', playing ? 'Pausar apresentação automática' : 'Reproduzir apresentação automática');
    restartTimer();
  }

  plates.forEach((plate, i) => {
    plate.addEventListener('click', () => goTo(i));
    plate.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(i); } });
  });
  tpBtn?.addEventListener('click', togglePlay);
  tpMinus?.addEventListener('click', () => { interval = clamp(interval - 1, 1, 8); if (tpVal) tpVal.textContent = `${interval}s`; restartTimer(); });
  tpPlus?.addEventListener('click', () => { interval = clamp(interval + 1, 1, 8); if (tpVal) tpVal.textContent = `${interval}s`; restartTimer(); });
  scrub?.addEventListener('click', e => {
    const rect = scrub.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    goTo(Math.round(ratio * (plates.length - 1)));
  });
  window.addEventListener('resize', layout);

  renderTicks();
  layout();
  restartTimer();
})();

// Regras de preenchimento do formulário
(() => {
  const form = document.querySelector('.booking-form');
  if (!form) return;
  const nome = form.querySelector('[name="nome"]');
  const whatsapp = form.querySelector('[name="whatsapp"]');
  const email = form.querySelector('[name="email"]');

  nome?.addEventListener('input', () => {
    nome.value = nome.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '').replace(/\s{2,}/g, ' ').replace(/^\s+/, '');
  });

  whatsapp?.addEventListener('input', () => {
    const numeros = whatsapp.value.replace(/\D/g, '').slice(0, 13);
    whatsapp.value = numeros.length > 8 ? `${numeros.slice(0, 5)}-${numeros.slice(5)}` : numeros;
  });

  email?.addEventListener('input', () => {
    email.value = email.value.replace(/\s/g, '');
  });

  form.addEventListener('submit', event => {
    const nomeValido = /^[A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)+$/.test(nome.value.trim());
    const telefoneValido = /^\d{4,5}-?\d{4}$/.test(whatsapp.value.trim());
    if (!nomeValido) {
      event.preventDefault();
      nome.setCustomValidity('Digite nome e sobrenome usando somente letras.');
      nome.reportValidity();
      nome.setCustomValidity('');
      return;
    }
    if (!telefoneValido) {
      event.preventDefault();
      whatsapp.setCustomValidity('Digite um WhatsApp válido, por exemplo 99999-9999.');
      whatsapp.reportValidity();
      whatsapp.setCustomValidity('');
    }
  });
})();