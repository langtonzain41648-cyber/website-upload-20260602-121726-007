(function () {
  var playerBox = document.querySelector("[data-player-box]");

  if (!playerBox) {
    return;
  }

  var video = playerBox.querySelector("video");
  var playButton = playerBox.querySelector("[data-play-button]");
  var status = document.querySelector("[data-player-status]");
  var source = playerBox.getAttribute("data-m3u8");

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function startPlayback() {
    if (!video || !source) {
      setStatus("当前播放源暂不可用。");
      return;
    }

    if (playButton) {
      playButton.classList.add("is-hidden");
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setStatus("已加载播放源，请再次点击播放器开始播放。");
          });
        });

        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus("播放源加载失败，请稍后重试。");
          }
        });
      } else {
        video.play().catch(function () {
          setStatus("请点击播放器开始播放。");
        });
      }
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", function () {
        video.play().catch(function () {
          setStatus("已加载播放源，请再次点击播放器开始播放。");
        });
      }, { once: true });
    } else {
      setStatus("当前浏览器需要支持 HLS 播放。");
    }
  }

  if (playButton) {
    playButton.addEventListener("click", startPlayback);
  }

  video.addEventListener("play", function () {
    if (playButton) {
      playButton.classList.add("is-hidden");
    }

    setStatus("正在播放");
  });

  video.addEventListener("pause", function () {
    setStatus("已暂停");
  });
})();
