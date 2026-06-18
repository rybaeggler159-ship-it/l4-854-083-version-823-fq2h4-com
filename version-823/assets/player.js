(function () {
    function initMoviePlayer(options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var src = options.src;
        var hls = null;
        var attached = false;
        var requested = false;

        if (!video || !overlay || !src) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            }
        }

        function play() {
            requested = true;
            attach();
            overlay.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!attached || video.paused) {
                play();
            }
        });
        video.addEventListener('canplay', function () {
            if (requested && video.paused) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        });
        document.addEventListener('visibilitychange', function () {
            if (document.hidden && !video.paused) {
                video.pause();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
