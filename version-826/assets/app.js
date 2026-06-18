(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-target]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-target')) || 0;
        show(index);
        start();
      });
    });

    var stage = document.querySelector('.hero-stage');
    if (stage) {
      stage.addEventListener('mouseenter', stop);
      stage.addEventListener('mouseleave', start);
    }
    show(0);
    start();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initFilters() {
    var grid = document.querySelector('[data-filter-grid]');
    var form = document.querySelector('.filter-form');
    if (!grid || !form) {
      return;
    }
    var keyword = form.querySelector('input[name="q"]');
    var region = form.querySelector('[data-filter="region"]');
    var genre = form.querySelector('[data-filter="genre"]');
    var year = form.querySelector('[data-filter="year"]');
    var empty = document.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    if (keyword && params.get('q')) {
      keyword.value = params.get('q');
    }

    function apply() {
      var q = normalize(keyword && keyword.value);
      var r = normalize(region && region.value);
      var g = normalize(genre && genre.value);
      var y = normalize(year && year.value);
      var visible = 0;
      Array.prototype.slice.call(grid.querySelectorAll('.filter-card')).forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' '));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (r && normalize(card.getAttribute('data-region')).indexOf(r) === -1) {
          ok = false;
        }
        if (g && normalize(card.getAttribute('data-genre')).indexOf(g) === -1) {
          ok = false;
        }
        if (y && normalize(card.getAttribute('data-year')) !== y) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    ['input', 'change', 'keyup'].forEach(function (eventName) {
      form.addEventListener(eventName, apply);
    });
    form.addEventListener('submit', function (event) {
      if (grid) {
        event.preventDefault();
        apply();
      }
    });
    apply();
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      if (!video) {
        return;
      }
      var trigger = function () {
        startPlayer(shell);
      };
      if (overlay) {
        overlay.addEventListener('click', trigger);
      }
      video.addEventListener('click', function () {
        if (!video.getAttribute('src')) {
          startPlayer(shell);
        }
      });
    });
  }

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-source');
    if (!source) {
      return;
    }
    shell.classList.add('is-playing');
    if (!video.getAttribute('src')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        if (video._hlsInstance) {
          video._hlsInstance.destroy();
        }
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = source;
      }
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
