(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobile = document.querySelector('.mobile-nav');
    if (toggle && mobile) {
      toggle.addEventListener('click', function () {
        mobile.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    function showSlide(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
    showSlide(0);

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    searchInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        var scope = document.querySelector(input.getAttribute('data-search-scope')) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        cards.forEach(function (card) {
          var text = card.getAttribute('data-title') || '';
          card.classList.toggle('hidden-by-search', value && text.indexOf(value) === -1);
        });
      });
    });

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter');
        var scope = document.querySelector(button.getAttribute('data-filter-scope')) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        filterButtons.forEach(function (b) {
          if (b.getAttribute('data-filter-scope') === button.getAttribute('data-filter-scope')) {
            b.classList.remove('active');
          }
        });
        button.classList.add('active');
        cards.forEach(function (card) {
          var type = card.getAttribute('data-type') || '';
          var region = card.getAttribute('data-region') || '';
          var show = value === 'all' || type.indexOf(value) !== -1 || region.indexOf(value) !== -1;
          card.classList.toggle('hidden-by-search', !show);
        });
      });
    });
  });
})();
