(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                start();
            });
        });

        start();
    }

    function initSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        inputs.forEach(function (input) {
            var targetId = input.getAttribute("data-search-input");
            var scope = document.getElementById(targetId);
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector(".empty-state");

            function filterCards() {
                var value = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-tags") || "",
                        card.getAttribute("data-year") || ""
                    ].join(" ").toLowerCase();
                    var matched = !value || haystack.indexOf(value) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            input.addEventListener("input", filterCards);
            var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-fill-search]"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    input.value = button.getAttribute("data-fill-search") || "";
                    filterCards();
                    input.focus();
                });
            });
        });
    }

    function initPlayer(videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !source) {
            return;
        }
        var bound = false;
        var hls = null;

        function bindSource() {
            if (bound) {
                return;
            }
            bound = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            bindSource();
            overlay.classList.add("hidden");
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    overlay.classList.remove("hidden");
                });
            }
        }

        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!bound) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.MovieSite = {
        initPlayer: initPlayer
    };

    ready(function () {
        initMenu();
        initHero();
        initSearch();
    });
})();
