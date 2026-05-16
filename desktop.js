// desktop.js - extra UI helpers
document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('[data-app]').forEach(function(el){el.addEventListener('keydown',function(e){if(e.key==='Enter')el.click()});});
});
