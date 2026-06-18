(function(){
function ready(fn){if(document.readyState!="loading")fn();else document.addEventListener("DOMContentLoaded",fn)}
ready(function(){
  document.querySelectorAll("[data-player]").forEach(function(box){
    var video=box.querySelector("video");
    var cover=box.querySelector(".play-cover");
    var url=box.getAttribute("data-stream");
    var started=false;
    function init(){
      if(!video||!url)return;
      if(!started){
        if(video.canPlayType("application/vnd.apple.mpegurl")){video.src=url}
        else if(window.Hls&&window.Hls.isSupported()){var hls=new window.Hls();hls.loadSource(url);hls.attachMedia(video);video._hls=hls}
        else{video.src=url}
        started=true;
      }
      if(cover)cover.classList.add("hidden");
      video.setAttribute("controls","controls");
      var p=video.play();
      if(p&&p.catch)p.catch(function(){})
    }
    if(cover)cover.addEventListener("click",init);
    if(video)video.addEventListener("click",function(){if(!started)init()});
  });
});
})();