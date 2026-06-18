(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = qs('[data-mobile-toggle]');
        var menu = qs('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === active);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
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
                var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
                if (!Number.isNaN(index)) {
                    show(index);
                    start();
                }
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function setupFilters() {
        qsa('[data-filter-panel]').forEach(function (panel) {
            var scope = panel.parentElement || document;
            var input = qs('[data-filter-input]', panel);
            var typeSelect = qs('[data-filter-type]', panel);
            var yearSelect = qs('[data-filter-year]', panel);
            var cards = qsa('.movie-card', scope);
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var typeValue = typeSelect ? typeSelect.value : '';
                var yearValue = yearSelect ? yearSelect.value : '';
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year')
                    ].join(' ').toLowerCase();
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
                    var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    card.classList.toggle('is-filter-hidden', !(matchQuery && matchType && matchYear));
                });
            }
            [input, typeSelect, yearSelect].forEach(function (node) {
                if (node) {
                    node.addEventListener('input', apply);
                    node.addEventListener('change', apply);
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
