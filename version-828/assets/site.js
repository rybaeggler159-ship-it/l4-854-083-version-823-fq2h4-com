(function () {
  function $(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = $('.hero-slide', hero);
    var dots = $('.hero-dot', hero);
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || 0));
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initSearch() {
    var input = document.querySelector('[data-movie-search]');
    var cards = $('.movie-card');
    if (!input || cards.length === 0) return;
    var activeFilter = 'all';
    var buttons = $('[data-filter]');

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
        card.classList.toggle('is-filtered-out', !(matchKeyword && matchFilter));
      });
    }

    input.addEventListener('input', apply);
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        activeFilter = button.getAttribute('data-filter') || 'all';
        apply();
      });
    });
  }

  function initPlayers() {
    $('.player').forEach(function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('.player-cover');
      var url = box.getAttribute('data-video');
      var ready = false;
      var hls = null;
      if (!video || !url) return;

      function load() {
        if (ready) return;
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        load();
        if (cover) cover.classList.add('is-hidden');
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (video.paused) play();
      });

      video.addEventListener('play', function () {
        if (cover) cover.classList.add('is-hidden');
      });

      window.addEventListener('beforeunload', function () {
        if (hls && hls.destroy) hls.destroy();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
})();
