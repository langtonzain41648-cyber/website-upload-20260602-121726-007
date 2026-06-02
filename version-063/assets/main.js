document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-button");
  var mobileNav = document.querySelector(".mobile-nav");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;

  function setHero(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      setHero(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setHero(current + 1);
    }, 5600);
  }

  var searchInput = document.getElementById("movie-search");
  var categoryFilter = document.getElementById("category-filter");
  var yearFilter = document.getElementById("year-filter");
  var typeFilter = document.getElementById("type-filter");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var empty = document.getElementById("empty-state");
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";

  if (searchInput && query) {
    searchInput.value = query;
  }

  function matchYear(cardYear, value) {
    var y = parseInt(cardYear || "0", 10);
    if (!value) return true;
    if (value === "2020") return y >= 2020;
    if (value === "2010") return y >= 2010 && y <= 2019;
    if (value === "2000") return y >= 2000 && y <= 2009;
    if (value === "1990") return y >= 1990 && y <= 1999;
    if (value === "1980") return y > 0 && y < 1990;
    return true;
  }

  function filterCards() {
    if (!cards.length) return;
    var keyword = (searchInput && searchInput.value ? searchInput.value : "").trim().toLowerCase();
    var cat = categoryFilter ? categoryFilter.value : "";
    var year = yearFilter ? yearFilter.value : "";
    var type = typeFilter ? typeFilter.value : "";
    var shown = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-keywords") || "").toLowerCase();
      var cardCat = card.getAttribute("data-category") || "";
      var cardYear = card.getAttribute("data-year") || "";
      var cardType = card.getAttribute("data-type") || "";
      var ok = true;
      if (keyword && text.indexOf(keyword) === -1) ok = false;
      if (cat && cardCat !== cat) ok = false;
      if (!matchYear(cardYear, year)) ok = false;
      if (type && cardType.indexOf(type) === -1 && text.indexOf(type.toLowerCase()) === -1) ok = false;
      card.style.display = ok ? "" : "none";
      if (ok) shown += 1;
    });

    if (empty) {
      empty.classList.toggle("visible", shown === 0);
    }
  }

  [searchInput, categoryFilter, yearFilter, typeFilter].forEach(function (el) {
    if (el) {
      el.addEventListener("input", filterCards);
      el.addEventListener("change", filterCards);
    }
  });

  filterCards();
});
