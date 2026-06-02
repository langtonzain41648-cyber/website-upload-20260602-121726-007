document.addEventListener("DOMContentLoaded", function () {
  var configEl = document.getElementById("player-config");
  var video = document.getElementById("movie-player");
  var playButton = document.getElementById("play-cover");
  if (!configEl || !video) return;

  var config = {};
  try {
    config = JSON.parse(configEl.textContent || "{}");
  } catch (error) {
    config = {};
  }

  var mediaUrl = config.url || "";
  var attached = false;
  var hlsInstance = null;

  function attachMedia() {
    if (attached || !mediaUrl) return;
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = mediaUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(mediaUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = mediaUrl;
    }
  }

  function startPlay() {
    attachMedia();
    if (playButton) {
      playButton.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        if (playButton) {
          playButton.classList.remove("is-hidden");
        }
      });
    }
  }

  if (playButton) {
    playButton.addEventListener("click", startPlay);
  }

  video.addEventListener("play", function () {
    if (playButton) {
      playButton.classList.add("is-hidden");
    }
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlay();
    }
  });

  video.addEventListener("loadedmetadata", function () {
    if (playButton && !video.paused) {
      playButton.classList.add("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
});
