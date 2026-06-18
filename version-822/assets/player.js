(function () {
  function attach(video, source) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = source;
  }

  window.VideoPlayer = {
    create: function (videoId, overlayId, source) {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      if (!video || !overlay) return;
      var started = false;
      function start() {
        if (!started) {
          attach(video, source);
          started = true;
        }
        overlay.classList.add('hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
      overlay.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!started) start();
      });
      video.addEventListener('play', function () {
        overlay.classList.add('hidden');
      });
    }
  };
})();
