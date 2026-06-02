(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    const carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    let current = 0;
    let timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        activate(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        activate(current + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function setupFilters() {
    const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      const section = panel.closest("section") || document;
      const grid = section.querySelector("[data-filter-grid]");
      const input = panel.querySelector("[data-filter-input]");
      const region = panel.querySelector("[data-filter-region]");
      const type = panel.querySelector("[data-filter-type]");
      const year = panel.querySelector("[data-filter-year]");
      const empty = section.querySelector("[data-empty-state]");
      if (!grid) {
        return;
      }
      const cards = Array.from(grid.querySelectorAll("[data-movie-card]"));
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get("q");
      if (initialQuery && input) {
        input.value = initialQuery;
      }

      function apply() {
        const query = normalize(input ? input.value : "");
        const regionValue = normalize(region ? region.value : "");
        const typeValue = normalize(type ? type.value : "");
        const yearValue = normalize(year ? year.value : "");
        let visibleCount = 0;
        cards.forEach(function (card) {
          const text = normalize(card.getAttribute("data-search"));
          const cardRegion = normalize(card.getAttribute("data-region"));
          const cardType = normalize(card.getAttribute("data-type"));
          const cardYear = normalize(card.getAttribute("data-year"));
          const matchQuery = !query || text.indexOf(query) !== -1;
          const matchRegion = !regionValue || cardRegion === regionValue;
          const matchType = !typeValue || cardType === typeValue;
          const matchYear = !yearValue || cardYear === yearValue;
          const visible = matchQuery && matchRegion && matchType && matchYear;
          card.hidden = !visible;
          if (visible) {
            visibleCount += 1;
          }
        });
        if (empty) {
          empty.hidden = visibleCount !== 0;
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  window.MoviePlayer = {
    mount: function (options) {
      ready(function () {
        const video = document.getElementById(options.videoId);
        const button = document.getElementById(options.buttonId);
        const source = options.source;
        if (!video || !button || !source) {
          return;
        }
        let loaded = false;
        let hls = null;

        function loadStream() {
          return new Promise(function (resolve) {
            if (loaded) {
              resolve();
              return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
              video.src = source;
              loaded = true;
              resolve();
              return;
            }
            if (window.Hls && window.Hls.isSupported()) {
              hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
              hls.loadSource(source);
              hls.attachMedia(video);
              hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                loaded = true;
                resolve();
              });
              hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                  try {
                    hls.destroy();
                  } catch (error) {
                    hls = null;
                  }
                  video.src = source;
                  loaded = true;
                  resolve();
                }
              });
              return;
            }
            video.src = source;
            loaded = true;
            resolve();
          });
        }

        function play() {
          button.classList.add("is-hidden");
          video.setAttribute("controls", "controls");
          loadStream().then(function () {
            const promise = video.play();
            if (promise && typeof promise.catch === "function") {
              promise.catch(function () {
                button.classList.remove("is-hidden");
              });
            }
          });
        }

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        window.addEventListener("pagehide", function () {
          if (hls) {
            hls.destroy();
          }
        });
      });
    }
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
