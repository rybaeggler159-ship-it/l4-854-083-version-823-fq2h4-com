(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    if (!slides.length) return;
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(next, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        restart();
      });
    });

    var prev = document.querySelector('[data-hero-prev]');
    var nextButton = document.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var input = document.querySelector('.search-input');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    if (!cards.length) return;
    var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
    var empty = document.querySelector('.empty-state');

    function apply() {
      var query = normalize(input ? input.value : '');
      var activeFilters = {};
      selects.forEach(function (select) {
        activeFilters[select.getAttribute('data-filter')] = normalize(select.value);
      });
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' '));
        var passQuery = !query || text.indexOf(query) !== -1;
        var passGenre = !activeFilters.genre || normalize(card.getAttribute('data-genre')).indexOf(activeFilters.genre) !== -1;
        var passRegion = !activeFilters.region || normalize(card.getAttribute('data-region')).indexOf(activeFilters.region) !== -1;
        var pass = passQuery && passGenre && passRegion;
        card.classList.toggle('hidden-card', !pass);
        if (pass) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) input.value = q;
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  }

  function startPlayer(container) {
    var video = container.querySelector('video');
    var overlay = container.querySelector('.play-overlay');
    var src = container.getAttribute('data-stream');
    if (!video || !src) return;

    if (!container.dataset.ready) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        container._hls = hls;
      } else {
        video.src = src;
      }
      container.dataset.ready = '1';
    }

    if (overlay) overlay.classList.add('hidden');
    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
    players.forEach(function (container) {
      var overlay = container.querySelector('.play-overlay');
      var video = container.querySelector('video');
      if (overlay) {
        overlay.addEventListener('click', function () {
          startPlayer(container);
        });
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) startPlayer(container);
        });
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
