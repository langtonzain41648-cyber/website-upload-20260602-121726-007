(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const nextButton = hero.querySelector('[data-hero-next]');
    const prevButton = hero.querySelector('[data-hero-prev]');
    let active = 0;
    let timer = null;

    const render = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === active);
      });
    };

    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(() => render(active + 1), 5000);
    };

    if (slides.length > 1) {
      nextButton?.addEventListener('click', () => {
        render(active + 1);
        restart();
      });
      prevButton?.addEventListener('click', () => {
        render(active - 1);
        restart();
      });
      dots.forEach((dot) => {
        dot.addEventListener('click', () => {
          render(Number(dot.dataset.heroDot || 0));
          restart();
        });
      });
      restart();
    }
  }

  const scopes = document.querySelectorAll('[data-filter-scope]');

  scopes.forEach((scope) => {
    const searchInput = scope.querySelector('[data-movie-search]');
    const yearSelect = scope.querySelector('[data-filter-year]');
    const typeSelect = scope.querySelector('[data-filter-type]');
    const list = scope.querySelector('[data-movie-list]');
    const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));

    if (!list || cards.length === 0) {
      return;
    }

    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '没有匹配的影片，请尝试其他关键词。';

    const apply = () => {
      const keyword = (searchInput?.value || '').trim().toLowerCase();
      const year = yearSelect?.value || '';
      const type = typeSelect?.value || '';
      let shown = 0;

      cards.forEach((card) => {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const matchKeyword = !keyword || text.includes(keyword);
        const matchYear = !year || card.getAttribute('data-year') === year;
        const matchType = !type || (card.getAttribute('data-type') || '').includes(type);
        const visible = matchKeyword && matchYear && matchType;
        card.classList.toggle('is-hidden-card', !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (shown === 0) {
        if (!empty.parentNode) {
          list.appendChild(empty);
        }
      } else if (empty.parentNode) {
        empty.parentNode.removeChild(empty);
      }
    };

    searchInput?.addEventListener('input', apply);
    yearSelect?.addEventListener('change', apply);
    typeSelect?.addEventListener('change', apply);

    const query = new URLSearchParams(window.location.search).get('q');
    if (query && searchInput) {
      searchInput.value = query;
      apply();
    }
  });

  const players = document.querySelectorAll('[data-player]');

  players.forEach((shell) => {
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play-button]');
    const errorBox = shell.querySelector('[data-player-error]');
    const playUrl = shell.getAttribute('data-m3u8') || '';
    let loaded = false;
    let hls = null;

    if (!video || !button || !playUrl) {
      return;
    }

    const showError = (message) => {
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.classList.add('show');
      }
    };

    const attach = () => {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(playUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, (_event, data) => {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showError('播放失败，请刷新页面重试。');
          }
        });
      } else {
        showError('当前设备暂时无法播放该影片。');
        return;
      }

      loaded = true;
      video.controls = true;
    };

    const start = () => {
      attach();
      button.classList.add('is-hidden');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          button.classList.remove('is-hidden');
        });
      }
    };

    button.addEventListener('click', start);
    video.addEventListener('click', () => {
      if (!loaded || video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
