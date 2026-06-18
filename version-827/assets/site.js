(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll(".poster-shell img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("is-missing");
      image.removeAttribute("src");
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dotWrap = document.querySelector("[data-hero-dots]");
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle("is-active", current === activeSlide);
    });
    if (dotWrap) {
      Array.prototype.slice.call(dotWrap.children).forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === activeSlide);
      });
    }
  }

  if (slides.length && dotWrap) {
    slides.forEach(function (_, index) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "切换焦点内容");
      dot.addEventListener("click", function () {
        showSlide(index);
      });
      dotWrap.appendChild(dot);
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var yearSelect = document.querySelector("[data-year-select]");
  var genreSelect = document.querySelector("[data-genre-select]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var emptyState = document.querySelector("[data-empty-state]");

  function applyFilter() {
    if (!cards.length) {
      return;
    }
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var year = yearSelect ? yearSelect.value : "";
    var genre = genreSelect ? genreSelect.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var text = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-genre") || "",
        card.getAttribute("data-tags") || ""
      ].join(" ").toLowerCase();
      var cardYear = card.getAttribute("data-year") || "";
      var cardGenre = card.getAttribute("data-genre") || "";
      var ok = true;

      if (keyword && text.indexOf(keyword) === -1) {
        ok = false;
      }
      if (year && cardYear !== year) {
        ok = false;
      }
      if (genre && cardGenre.indexOf(genre) === -1) {
        ok = false;
      }

      card.style.display = ok ? "" : "none";
      if (ok) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  [filterInput, yearSelect, genreSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilter);
      control.addEventListener("change", applyFilter);
    }
  });

  var searchInput = document.querySelector("[data-global-search]");
  var searchResults = document.querySelector("[data-search-results]");

  function renderSearch() {
    if (!searchInput || !searchResults || !window.SITE_MOVIES) {
      return;
    }
    var keyword = searchInput.value.trim().toLowerCase();
    var pool = window.SITE_MOVIES;
    var matches = pool.filter(function (movie) {
      var text = [movie.title, movie.genre, movie.tags, movie.year, movie.region].join(" ").toLowerCase();
      return !keyword || text.indexOf(keyword) !== -1;
    }).slice(0, 80);

    searchResults.innerHTML = matches.map(function (movie) {
      return [
        '<article class="search-result">',
        '<div class="rank-number">' + movie.id + '</div>',
        '<div>',
        '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
        '<p>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</p>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '</div>',
        '</article>'
      ].join("");
    }).join("");
  }

  if (searchInput && searchResults) {
    searchInput.addEventListener("input", renderSearch);
    renderSearch();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  var player = document.querySelector("[data-video-src]");
  var playButton = document.querySelector("[data-play-button]");
  var hlsInstance = null;

  function preparePlayer() {
    if (!player || player.getAttribute("data-ready") === "1") {
      return;
    }

    var source = player.getAttribute("data-video-src");
    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(player);
      hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal || !hlsInstance) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        }
      });
    } else if (player.canPlayType("application/vnd.apple.mpegurl")) {
      player.src = source;
    } else {
      player.src = source;
    }

    player.setAttribute("data-ready", "1");
  }

  function startPlayer() {
    if (!player) {
      return;
    }
    preparePlayer();
    if (playButton) {
      playButton.classList.add("is-hidden");
    }
    var promise = player.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (playButton) {
          playButton.classList.remove("is-hidden");
        }
      });
    }
  }

  if (player) {
    player.addEventListener("click", startPlayer);
    player.addEventListener("play", function () {
      if (playButton) {
        playButton.classList.add("is-hidden");
      }
    });
  }

  if (playButton) {
    playButton.addEventListener("click", startPlayer);
  }

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
