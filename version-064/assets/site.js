(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mainNav = document.querySelector("[data-main-nav]");

  if (menuButton && mainNav) {
    menuButton.addEventListener("click", function () {
      mainNav.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var filterForm = document.querySelector("[data-filter-form]");

  if (filterForm) {
    var searchInput = filterForm.querySelector("[data-search-input]");
    var genreSelect = filterForm.querySelector("[data-genre-select]");
    var yearSelect = filterForm.querySelector("[data-year-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var emptyState = document.querySelector("[data-empty-state]");

    function applyFilters() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var genre = genreSelect ? genreSelect.value.trim() : "";
      var yearMin = yearSelect && yearSelect.value ? parseInt(yearSelect.value, 10) : 0;
      var visibleCount = 0;

      cards.forEach(function (card) {
        var searchText = card.getAttribute("data-search") || "";
        var cardGenre = card.getAttribute("data-genre") || "";
        var cardYear = parseInt(card.getAttribute("data-year") || "0", 10);
        var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
        var matchesGenre = !genre || cardGenre.indexOf(genre) !== -1;
        var matchesYear = !yearMin || cardYear >= yearMin;
        var visible = matchesKeyword && matchesGenre && matchesYear;

        card.style.display = visible ? "" : "none";

        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visibleCount ? "none" : "block";
      }
    }

    ["input", "change"].forEach(function (eventName) {
      if (searchInput) {
        searchInput.addEventListener(eventName, applyFilters);
      }

      if (genreSelect) {
        genreSelect.addEventListener(eventName, applyFilters);
      }

      if (yearSelect) {
        yearSelect.addEventListener(eventName, applyFilters);
      }
    });

    filterForm.addEventListener("reset", function () {
      window.setTimeout(applyFilters, 0);
    });
  }
})();
