/* Installation and presentation only; Firebase authorization remains in admin.html. */
(() => {
  const $ = id => document.getElementById(id);
  const navigate = view => window.dispatchEvent(new CustomEvent('appnavigate', { detail: view }));
  document.querySelectorAll('[data-app-view]').forEach(button => {
    button.addEventListener('click', () => { navigate(button.dataset.appView); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  });
  $('appMore').addEventListener('click', () => $('openSidebar').click());
  window.addEventListener('appviewchange', event => {
    document.querySelectorAll('.app-bottom-nav [data-app-view]').forEach(button => {
      if (button.dataset.appView === event.detail) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    if (['reports','settings','approvals'].includes(event.detail)) $('appMore').setAttribute('aria-current','page');
    else $('appMore').removeAttribute('aria-current');
  });
  // Three small steps replace the long order entry screen, preserving all field names.
  const form = $('staffOrderForm');
  const grid = form.querySelector('.entry-grid');
  const labels = [...grid.children];
  const fields = form.querySelector('fieldset');
  const discount = $('orderDiscount').closest('.entry-grid');
  const total = $('orderTotal');
  const submit = form.querySelector('button[type="submit"]');
  const progress = document.createElement('div');
  progress.className = 'wizard-progress'; progress.setAttribute('aria-label','Захиалга бүртгэх алхам');
  const names = ['Захиалагч', 'Бүтээгдэхүүн', 'Хүргэлт'];
  names.forEach((name, index) => { const item = document.createElement('span'); item.textContent = `${index + 1}. ${name}`; progress.append(item); });
  form.prepend(progress);
  const steps = names.map((name, index) => {
    const section = document.createElement('section');
    section.className = 'wizard-step'; section.dataset.step = index;
    const title = document.createElement('h2'); title.className = 'wizard-step-title'; title.textContent = name; title.tabIndex = -1;
    section.append(title); form.insertBefore(section, $('entryMessage')); return section;
  });
  const customer = document.createElement('div'); customer.className = 'entry-grid';
  [0,1,2,3,4].forEach(index => customer.append(labels[index])); steps[0].append(customer);
  steps[1].append(fields, discount, total);
  const delivery = document.createElement('div'); delivery.className = 'entry-grid';
  [5,6,7,8].forEach(index => delivery.append(labels[index])); steps[2].append(delivery);
  grid.remove();
  const actions = document.createElement('div'); actions.className = 'wizard-actions';
  const back = document.createElement('button'); back.type = 'button'; back.className = 'logout-btn'; back.textContent = '← Буцах';
  const next = document.createElement('button'); next.type = 'button'; next.className = 'login-btn'; next.textContent = 'Үргэлжлүүлэх →';
  actions.append(back,next,submit); form.append(actions);
  let step = 0;
  function showStep(index, focus = false) {
    step = index;
    steps.forEach((section, i) => { section.hidden = i !== index; });
    [...progress.children].forEach((item, i) => { item.classList.toggle('is-active', i <= index); if(i === index) item.setAttribute('aria-current','step'); else item.removeAttribute('aria-current'); });
    back.hidden = index === 0; next.hidden = index === 2; submit.hidden = index !== 2;
    if (focus) steps[index].querySelector('h2').focus();
  }
  function validate(section) {
    for (const input of section.querySelectorAll('input,select,textarea')) {
      if (!input.checkValidity()) { input.reportValidity(); return false; }
    }
    const source = form.elements.source.value;
    form.elements.sourceDetail.setCustomValidity(['market','other'].includes(source) && !form.elements.sourceDetail.value.trim() ? 'Дэлгүүрийн нэр эсвэл эх үүсвэрийг бичнэ үү.' : '');
    if (section.contains(form.elements.sourceDetail) && !form.elements.sourceDetail.checkValidity()) { form.elements.sourceDetail.reportValidity(); return false; }
    return true;
  }
  form.elements.sourceDetail.addEventListener('input', () => form.elements.sourceDetail.setCustomValidity(''));
  form.elements.source.addEventListener('change', () => form.elements.sourceDetail.setCustomValidity(''));
  back.addEventListener('click', () => showStep(Math.max(0,step-1),true));
  next.addEventListener('click', () => { if(validate(steps[step])) showStep(Math.min(2,step+1),true); });
  form.noValidate = true;
  form.addEventListener('submit', event => {
    for (let i = 0; i < steps.length; i++) {
      // Reveal invalid fields before reporting validity; hidden fields cannot be focused.
      const bad = [...steps[i].querySelectorAll('input,select,textarea')].find(input => !input.checkValidity());
      if (bad) { event.preventDefault(); event.stopImmediatePropagation(); showStep(i); bad.reportValidity(); return; }
    }
    if(step !== 2) { event.preventDefault(); event.stopImmediatePropagation(); if(validate(steps[step])) showStep(step+1,true); }
  },true);
  form.addEventListener('reset', () => { form.elements.sourceDetail.setCustomValidity(''); showStep(0); });
  // The detailed existing help remains available and can reveal its target's step.
  new MutationObserver(() => {
    const target = form.querySelector('.guide-target');
    if(target) { const section = target.closest('.wizard-step'); if(section && section.hidden) showStep(Number(section.dataset.step)); }
  }).observe(form, { subtree:true, attributes:true, attributeFilter:['class'] });
  showStep(0);
  $('appNewOrder').addEventListener('click', () => {
    navigate('orders'); $('orderEntry').open = true; showStep(0);
    $('orderEntry').scrollIntoView({ behavior:'smooth', block:'start' }); form.elements.name.focus({preventScroll:true});
  });
  // Do not queue new operational writes when the device is known to be offline.
  function onlineState() {
    $('appConnection').hidden = navigator.onLine;
    document.querySelector('.live-dot').textContent = navigator.onLine ? 'Шууд' : 'Офлайн';
  }
  window.addEventListener('online', onlineState); window.addEventListener('offline', onlineState); onlineState();
  document.addEventListener('submit', event => {
    if(!navigator.onLine && event.target.closest('#dashboard')) { event.preventDefault(); event.stopImmediatePropagation(); $('appConnection').hidden = false; }
  },true);
  document.addEventListener('click', event => {
    if(!navigator.onLine && event.target.closest('[data-status],[data-attempt]')) { event.preventDefault(); event.stopImmediatePropagation(); $('appConnection').hidden = false; }
  },true);
  // Native installation prompt where available; manual instructions on iOS.
  let installPrompt = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const strip = document.querySelector('.app-install-strip');
  strip.hidden = standalone();
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; });
  window.addEventListener('appinstalled', () => { strip.hidden = true; installPrompt = null; });
  $('appInstall').addEventListener('click', async () => {
    if(installPrompt) {
      const prompt = installPrompt; installPrompt = null;
      try { await prompt.prompt(); const choice = await prompt.userChoice; if(choice.outcome === 'accepted') strip.hidden = true; }
      catch { $('appInstallDialog').showModal(); }
    } else $('appInstallDialog').showModal();
  });
  if('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./admin-sw.js').catch(error => console.warn('App installation setup:', error));
  }
})();
