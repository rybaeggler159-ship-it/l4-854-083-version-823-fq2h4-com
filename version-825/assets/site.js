(function(){
function ready(fn){if(document.readyState!="loading")fn();else document.addEventListener("DOMContentLoaded",fn)}
ready(function(){
  var toggle=document.querySelector("[data-menu-toggle]");
  var panel=document.querySelector("[data-menu-panel]");
  if(toggle&&panel){toggle.addEventListener("click",function(){panel.classList.toggle("open")})}
  var hero=document.querySelector("[data-hero]");
  if(hero){
    var slides=[].slice.call(hero.querySelectorAll(".hero-slide"));
    var dots=[].slice.call(hero.querySelectorAll(".hero-dot"));
    var i=0;
    function show(n){if(!slides.length)return;i=(n+slides.length)%slides.length;slides.forEach(function(s,k){s.classList.toggle("active",k===i)});dots.forEach(function(d,k){d.classList.toggle("active",k===i)})}
    var next=hero.querySelector("[data-hero-next]");
    var prev=hero.querySelector("[data-hero-prev]");
    if(next)next.addEventListener("click",function(){show(i+1)});
    if(prev)prev.addEventListener("click",function(){show(i-1)});
    dots.forEach(function(d,k){d.addEventListener("click",function(){show(k)})});
    setInterval(function(){show(i+1)},5200);
  }
  document.querySelectorAll("[data-search-area]").forEach(function(area){
    var input=area.querySelector("[data-search-box]");
    var cards=[].slice.call(area.querySelectorAll(".movie-card,.ranking-item"));
    var chips=[].slice.call(area.querySelectorAll("[data-filter-value]"));
    var empty=area.querySelector(".empty-state");
    var active="all";
    function apply(){
      var q=(input&&input.value||"").trim().toLowerCase();
      var shown=0;
      cards.forEach(function(card){
        var text=(card.getAttribute("data-search")||card.textContent||"").toLowerCase();
        var ok=(!q||text.indexOf(q)>-1)&&(active==="all"||text.indexOf(active.toLowerCase())>-1);
        card.classList.toggle("is-hidden",!ok);
        if(ok)shown++;
      });
      if(empty)empty.classList.toggle("show",shown===0);
    }
    if(input)input.addEventListener("input",apply);
    chips.forEach(function(chip){chip.addEventListener("click",function(){active=chip.getAttribute("data-filter-value")||"all";chips.forEach(function(c){c.classList.toggle("active",c===chip)});apply()})});
    apply();
  });
});
})();