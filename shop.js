/* Storefront tabs, product filter and cart. Orders are still sent by the order form script in index.html. */
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const PRICES = { p1: 50000, p2: 30000, p3: 70000, p4: 40000, p5: 25000, p6: 16000, p7: 20000 };
  const KEYS = Object.keys(PRICES);
  const MAX_QTY = 999;
  const t = key => (window.__TRANSLATIONS?.[window.__currentLang || 'mn'] || window.__TRANSLATIONS?.mn || {})[key] ?? key;
  const plain = html => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent.trim(); };
  const money = n => n.toLocaleString('en-US') + ' ₮';

  /* ── Tabs (views) ── */
  // Section anchors that live inside a view, and the learn sub-tab they open.
  const ANCHORS = { what: ['learn', 'what'], benefits: ['learn', 'benefits'], how: ['learn', 'how'], science: ['learn', 'science'],
    products: ['shop'], testimonials: ['home'], contact: ['contact'], 'my-orders': ['orders'], checkout: ['contact'] };
  const VIEWS = $$('.view').map(v => v.dataset.view);

  function showView(name, sub, { scroll = true } = {}) {
    if (!VIEWS.includes(name)) name = 'home';
    $$('.view').forEach(v => v.classList.toggle('active', v.dataset.view === name));
    $$('[data-nav]').forEach(a => a.dataset.nav === name ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    if (name === 'learn') showSubtab(sub || currentSub || 'what');
    $('#mobileMenu')?.classList.remove('open');
    if (scroll) window.scrollTo(0, 0);
  }
  function route() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return showView('home');
    if (VIEWS.includes(id)) return showView(id);
    const [view, sub] = ANCHORS[id] || ['home'];
    showView(view, sub);
  }
  window.addEventListener('hashchange', route);
  window.__showView = name => { if (location.hash === '#' + name) route(); else location.hash = name; };

  /* ── Learn sub-tabs ── */
  let currentSub = 'what';
  function showSubtab(name) {
    currentSub = name;
    $$('.subtabs .chip').forEach(c => c.setAttribute('aria-selected', String(c.dataset.sub === name)));
    $$('.panel[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== name; });
  }
  $$('.subtabs .chip').forEach(c => c.addEventListener('click', () => { history.replaceState(null, '', '#' + c.dataset.sub); showSubtab(c.dataset.sub); }));

  /* ── Shop filter ── */
  $$('#shopFilters .chip').forEach(chip => chip.addEventListener('click', () => {
    $$('#shopFilters .chip').forEach(c => c.setAttribute('aria-selected', String(c === chip)));
    $$('#shopGrid .product-card').forEach(card => { card.hidden = chip.dataset.filter !== 'all' && card.dataset.cat !== chip.dataset.filter; });
  }));

  /* ── Cart ── */
  let cart = {};
  try { const saved = JSON.parse(localStorage.getItem('cart') || '{}'); for (const k of KEYS) if (Number.isInteger(saved[k]) && saved[k] > 0) cart[k] = Math.min(saved[k], MAX_QTY); } catch {}
  const save = () => { try { localStorage.setItem('cart', JSON.stringify(cart)); } catch {} };
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = () => Object.entries(cart).reduce((s, [k, q]) => s + PRICES[k] * q, 0);
  const nameOf = k => plain(t(`products.${k}_name`));
  const subOf = k => plain(t(`products.${k}_sub`));
  const sizeOf = k => subOf(k).split('·')[0].trim();

  function add(key, n = 1) {
    if (!PRICES[key]) return;
    cart[key] = Math.min((cart[key] || 0) + n, MAX_QTY);
    if (cart[key] <= 0) delete cart[key];
    save(); render();
  }
  function setQty(key, q) { if (q <= 0) delete cart[key]; else cart[key] = Math.min(q, MAX_QTY); save(); render(); }

  let toastTimer;
  function toast(text) {
    const el = $('#toast'); el.textContent = text; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function render() {
    const n = count();
    $$('.cart-count').forEach(el => { el.textContent = n ? String(n) : ''; el.dataset.n = n; });
    const body = $('#cartBody');
    const keys = KEYS.filter(k => cart[k]);
    if (!keys.length) {
      body.innerHTML = `<div class="cart-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 016 0"/></svg><p>${t('cart.empty')}</p><a href="#shop" class="btn btn-ghost" data-close-cart>${t('cart.browse')}</a></div>`;
    } else {
      body.innerHTML = keys.map(k => `<div class="cart-line">
        <img src="Products/product-${k.slice(1)}.jpg" alt="" width="64" height="80" />
        <div><div class="cart-line-name">${nameOf(k)}</div><div class="cart-line-sub">${subOf(k)}</div><div class="cart-line-price">${money(PRICES[k] * cart[k])}</div></div>
        <div class="cart-line-side"><div class="stepper"><button type="button" data-dec="${k}" aria-label="−">−</button><span>${cart[k]}</span><button type="button" data-inc="${k}" aria-label="+">+</button></div>
        <button type="button" class="cart-remove" data-remove="${k}">${t('cart.remove')}</button></div></div>`).join('');
    }
    $('#cartFoot').hidden = !keys.length;
    $('#cartTotal').textContent = money(subtotal());

    // Checkout summary in the order form
    const summary = $('#checkoutCart');
    const single = $('#singleProductFields');
    if (summary && single) {
      summary.hidden = !keys.length;
      single.hidden = !!keys.length;
      if (keys.length) {
        $('#checkoutLines').innerHTML = keys.map(k => `<div class="checkout-line"><span>${nameOf(k)} ${sizeOf(k)} × ${cart[k]}</span><span>${money(PRICES[k] * cart[k])}</span></div>`).join('');
        $('#checkoutTotal').textContent = money(subtotal());
      }
    }
  }

  function openCart() { $('#cartDrawer').classList.add('open'); $('#cartBackdrop').classList.add('open'); $('#cartDrawer').setAttribute('aria-hidden', 'false'); $('#cartClose').focus(); }
  function closeCart() { $('#cartDrawer').classList.remove('open'); $('#cartBackdrop').classList.remove('open'); $('#cartDrawer').setAttribute('aria-hidden', 'true'); }

  document.addEventListener('click', e => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      e.preventDefault(); add(addBtn.dataset.add);
      addBtn.classList.add('added'); setTimeout(() => addBtn.classList.remove('added'), 900);
      toast(t('cart.added'));
      return;
    }
    if (e.target.closest('[data-open-cart]')) { e.preventDefault(); openCart(); return; }
    if (e.target.closest('[data-close-cart]') || e.target.id === 'cartBackdrop') { closeCart(); return; }
    const inc = e.target.closest('[data-inc]'); if (inc) return add(inc.dataset.inc, 1);
    const dec = e.target.closest('[data-dec]'); if (dec) return add(dec.dataset.dec, -1);
    const rm = e.target.closest('[data-remove]'); if (rm) return setQty(rm.dataset.remove, 0);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  window.ShopCart = {
    PRICES,
    items: () => ({ ...cart }),
    subtotal,
    count,
    label: () => KEYS.filter(k => cart[k]).map(k => `${nameOf(k)} ${sizeOf(k)} × ${cart[k]}`).join(', '),
    clear: () => { cart = {}; save(); render(); },
  };
  window.ShopUI = { render };

  // The header scroll state and the mobile menu toggle are handled by the main script in index.html.
  route();
  render();
})();
