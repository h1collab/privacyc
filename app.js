// app.js - legacy fallback (non-module)
(function(){
  function ready(fn){
    if(document.readyState!='loading')fn();else document.addEventListener('DOMContentLoaded',fn);
  }
  function safeHideBoot(){
    try{
      var boot=document.getElementById('boot-screen');
      var desktop=document.getElementById('desktop');
      if(boot)boot.classList.add('hidden');
      if(desktop)desktop.classList.remove('hidden');
    }catch(e){console.error(e)}
  }

  ready(function(){
    // ensure boot hides eventually even if other scripts error
    setTimeout(safeHideBoot,1200);

    // simple boot sequence
    setTimeout(function(){safeHideBoot();},1600);

    // attach simple handlers
    var icons=document.querySelectorAll('[data-app]');
    icons.forEach(function(el){el.addEventListener('click',openApp)});
    function openApp(e){
      var name=e.currentTarget.dataset.app||'app';
      var tpl=document.getElementById('window-template');
      var clone=tpl.content.cloneNode(true);
      var win=clone.querySelector('.window');
      win.dataset.app=name;
      win.querySelector('.window-title').textContent=name.toUpperCase();
      win.querySelector('.window-body').textContent='This is a lightweight '+name+' mock window.';
      win.querySelector('.btn-close').addEventListener('click',function(){win.remove();});
      document.body.appendChild(clone);
    }

    // theme restore
    try{
      var t=localStorage.getItem('privacyc:theme');
      if(t)document.documentElement.setAttribute('data-theme',t);
    }catch(e){/* ignore */}
  });
})();
