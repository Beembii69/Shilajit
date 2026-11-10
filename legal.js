// Language switch for the legal pages. Shares the 'lang' setting with index.html.
(function () {
  var langs = ['mn', 'en', 'zh'];
  function stored() {
    try { return localStorage.getItem('lang'); } catch (e) { return null; }
  }
  function apply(lang) {
    if (langs.indexOf(lang) === -1) lang = 'mn';
    document.querySelectorAll('article[data-lang]').forEach(function (a) {
      a.hidden = a.dataset.lang !== lang;
    });
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    document.documentElement.lang = lang;
    var labels = (window.LABELS || {})[lang];
    if (labels) {
      document.title = labels.title;
      document.querySelector('[data-back]').textContent = labels.back;
      document.querySelector('[data-other]').textContent = labels.other;
    }
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }
  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () { apply(b.dataset.lang); });
  });
  apply(stored() || 'mn');
})();
