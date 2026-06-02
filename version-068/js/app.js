(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dotsWrap = document.querySelector("[data-hero-dots]");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === current);
    });

    if (dotsWrap) {
      Array.prototype.slice.call(dotsWrap.querySelectorAll("button")).forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
  }

  if (slides.length && dotsWrap) {
    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "切换焦点影片");
      dot.addEventListener("click", function () {
        showSlide(i);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      });
      dotsWrap.appendChild(dot);
    });

    showSlide(0);

    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterRoot = document.querySelector("[data-filter-root]");

  if (filterRoot) {
    var search = filterRoot.querySelector("[data-filter-search]");
    var type = filterRoot.querySelector("[data-filter-type]");
    var year = filterRoot.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
    var empty = filterRoot.querySelector("[data-empty]");

    function applyFilter() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var selectedType = type ? type.value : "";
      var selectedYear = year ? year.value : "";
      var shown = 0;

      cards.forEach(function (card) {
        var hay = (card.getAttribute("data-search") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var ok = true;

        if (q && hay.indexOf(q) === -1) {
          ok = false;
        }

        if (selectedType && cardType !== selectedType) {
          ok = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          ok = false;
        }

        card.style.display = ok ? "" : "none";

        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    [search, type, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", applyFilter);
        el.addEventListener("change", applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");

    if (search && initial) {
      search.value = initial;
    }

    applyFilter();
  }

  window.initPlayer = function (id, source) {
    var shell = document.getElementById(id);

    if (!shell) {
      return;
    }

    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var button = shell.querySelector("button");
    var hls = null;
    var loaded = false;

    function attach() {
      if (!video || loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        loaded = true;
        return;
      }

      video.src = source;
      loaded = true;
    }

    function start() {
      attach();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      if (video) {
        var playResult = video.play();

        if (playResult && playResult.catch) {
          playResult.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded) {
          start();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
