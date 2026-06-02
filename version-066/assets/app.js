(function () {
  function getSearchPage() {
    return document.body.getAttribute("data-search-page") || "./videos.html";
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function filterCards(query, token) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var q = normalize(query);
    var t = normalize(token || "all");
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      var textMatch = !q || haystack.indexOf(q) !== -1;
      var tokenMatch = t === "all" || haystack.indexOf(t) !== -1;
      var show = textMatch && tokenMatch;
      card.classList.toggle("is-hidden", !show);
      if (show) {
        visible += 1;
      }
    });

    var empty = document.querySelector("[data-empty-state]");
    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var links = document.querySelector(".nav-links");
    if (!button || !links) {
      return;
    }

    button.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initRedirectSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-redirect]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || getSearchPage();
        if (query) {
          window.location.href = target + "?q=" + encodeURIComponent(query);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function initLocalSearch() {
    var form = document.querySelector("[data-local-search]");
    var input = form ? form.querySelector("input[name='q']") : null;
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    var activeToken = "all";

    if (!form || !input) {
      return;
    }

    if (initial) {
      input.value = initial;
      filterCards(initial, activeToken);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      filterCards(input.value, activeToken);
    });

    input.addEventListener("input", function () {
      filterCards(input.value, activeToken);
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-token]")).forEach(function (button) {
      button.addEventListener("click", function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-token]")).forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        activeToken = button.getAttribute("data-filter-token") || "all";
        filterCards(input.value, activeToken);
      });
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
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

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initRedirectSearch();
    initLocalSearch();
    initHero();
  });
})();
