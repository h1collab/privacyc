// boot.js - compiled simple boot (non-module)
(function(){
  function later(ms){return new Promise(function(r){setTimeout(r,ms)})}
  later(900).then(function(){var b=document.getElementById('boot-screen'),d=document.getElementById('desktop');b&&b.classList.add('hidden');d&&d.classList.remove('hidden')});
})();
