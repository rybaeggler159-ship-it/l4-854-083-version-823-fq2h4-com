(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  var panel = qs('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = qsa('[data-hero-slide]');
  if (slides.length > 1) {
    var current = 0;
    var prev = qs('[data-hero-prev]');
    var next = qs('[data-hero-next]');
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
    };
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }
    window.setInterval(function () {
      show(current + 1);
    }, 6200);
  }

  var params = new URLSearchParams(window.location.search);
  var incomingQuery = params.get('q') || '';
  var filterInput = qs('[data-filter-input]');
  if (filterInput && incomingQuery) {
    filterInput.value = incomingQuery;
  }

  var selectedTag = '';
  var filterButtons = qsa('[data-filter-value]');
  var cards = qsa('[data-movie-card]');
  var empty = qs('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var query = normalize(filterInput ? filterInput.value : '');
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var tags = normalize(card.getAttribute('data-tags'));
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesTag = !selectedTag || tags.indexOf(normalize(selectedTag)) !== -1 || haystack.indexOf(normalize(selectedTag)) !== -1;
      var ok = matchesQuery && matchesTag;
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      selectedTag = button.getAttribute('data-filter-value') || '';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilters();
    });
  });

  if (cards.length) {
    applyFilters();
  }
})();

function initMoviePlayer(source) {
  var video = document.getElementById('moviePlayer');
  var overlay = document.querySelector('[data-player-overlay]');
  if (!video || !source) {
    return;
  }

  var loaded = false;

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  function startPlayer() {
    hideOverlay();
    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayer);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayer();
    }
  });
}
