(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = 'search.html';
        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function textOfCard(card) {
    return [
      card.dataset.title || '',
      card.dataset.tags || '',
      card.dataset.region || '',
      card.dataset.year || '',
      card.dataset.category || ''
    ].join(' ').toLowerCase();
  }

  function initCatalogTools() {
    var tools = document.querySelector('[data-catalog-tools]');
    var container = document.querySelector('[data-card-container]');
    if (!tools || !container) {
      return;
    }
    var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
    var input = tools.querySelector('[data-filter-text]');
    var sort = tools.querySelector('[data-sort-select]');
    var category = tools.querySelector('[data-filter-category]');
    var noResults = document.querySelector('[data-no-results]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query && input) {
      input.value = query;
    }

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var cat = category ? category.value.trim() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = textOfCard(card);
        var matchText = !q || haystack.indexOf(q) !== -1;
        var matchCategory = !cat || (card.dataset.category || '') === cat;
        var shouldShow = matchText && matchCategory;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.classList.toggle('show', visible === 0);
      }
    }

    function applySort() {
      var value = sort ? sort.value : 'default';
      var sorted = cards.slice();
      if (value === 'rating') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        });
      } else if (value === 'views') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        });
      } else if (value === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      } else {
        sorted.sort(function (a, b) {
          return cards.indexOf(a) - cards.indexOf(b);
        });
      }
      sorted.forEach(function (card) {
        container.appendChild(card);
      });
      apply();
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (category) {
      category.addEventListener('change', apply);
    }
    if (sort) {
      sort.addEventListener('change', applySort);
    }
    applySort();
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var playButton = shell.querySelector('[data-play-button]');
      var message = shell.querySelector('[data-player-message]');
      if (!video || !playButton) {
        return;
      }
      var source = video.dataset.src;
      var initialized = false;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function initialize() {
        if (initialized) {
          return;
        }
        initialized = true;
        setMessage('正在加载视频...');
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('');
          });
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setMessage('视频加载失败，请稍后重试');
            }
          });
          video._hlsInstance = hls;
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setMessage('');
          }, { once: true });
          return;
        }
        setMessage('当前浏览器不支持 HLS 播放');
      }

      function play() {
        initialize();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setMessage('点击播放器后再次尝试播放');
          });
        }
      }

      playButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        setMessage('');
      });

      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });

      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
    });
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initCatalogTools();
    initPlayers();
  });
})();
