// Подключаем общую шапку/подвал (partials/) и подсвечиваем активный пункт меню
(function () {
  function include(placeholderId, url) {
    var el = document.getElementById(placeholderId);
    if (!el) return Promise.resolve();
    return fetch(url)
      .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error(url + ' -> ' + r.status)); })
      .then(function (html) { el.outerHTML = html; })
      .catch(function (err) { console.error('[partial include]', err); });
  }

  function highlightActiveNav() {
    var path = window.location.pathname;
    document.querySelectorAll('.navbar-nav [data-section]').forEach(function (link) {
      var section = link.getAttribute('data-section');
      link.classList.toggle('active', path.indexOf(section) === 0);
    });
  }

  Promise.all([
    include('site-header', '/partials/header.html'),
    include('site-footer', '/partials/footer.html')
  ]).then(highlightActiveNav);
})();
