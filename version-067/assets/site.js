(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var count = document.querySelector('[data-filter-count]');
    var empty = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery && input) {
      input.value = initialQuery;
    }

    function matchesType(card, value) {
      if (!value) {
        return true;
      }
      return (card.getAttribute('data-type') || '').indexOf(value) !== -1;
    }

    function matchesYear(card, value) {
      if (!value) {
        return true;
      }
      var cardYear = Number(card.getAttribute('data-year') || '0');
      return cardYear >= Number(value);
    }

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var show = (!query || text.indexOf(query) !== -1)
          && matchesType(card, typeValue)
          && matchesYear(card, yearValue);
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '显示 ' + visible + ' 部';
      }
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function attachHls(video, src, status) {
    if (!video || !src) {
      if (status) {
        status.textContent = '播放地址不可用';
      }
      return null;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (status) {
          status.textContent = '线路加载完成';
        }
      });
      hls.on(window.Hls.Events.ERROR, function () {
        if (status) {
          status.textContent = '线路正在重试';
        }
      });
      return hls;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      if (status) {
        status.textContent = '线路加载完成';
      }
      return null;
    }

    video.src = src;
    if (status) {
      status.textContent = '当前浏览器可能需要 HLS 支持';
    }
    return null;
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

    players.forEach(function (player) {
      var src = player.getAttribute('data-m3u8');
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      var playButton = player.querySelector('.js-play');
      var status = player.querySelector('.player-status');
      var prepared = false;

      function prepareAndPlay() {
        if (!prepared) {
          attachHls(video, src, status);
          prepared = true;
        }
        if (overlay) {
          overlay.classList.add('hide');
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (status) {
              status.textContent = '请再次点击播放按钮';
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', prepareAndPlay);
      }
      if (playButton) {
        playButton.addEventListener('click', prepareAndPlay);
      }
      if (video) {
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('hide');
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
