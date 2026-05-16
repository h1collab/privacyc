// app.js - legacy fallback (non-module)
(function(){
  function ready(fn){
    if(document.readyState!='loading')fn();else document.addEventListener('DOMContentLoaded',fn);
  }
  ready(function(){
    // simple boot sequence
    const boot=document.getElementById('boot-screen');
    const desktop=document.getElementById('desktop');
    setTimeout(()=>{
      boot.classList.add('hidden');
      desktop.classList.remove('hidden');
    }, 1200);

    // attach simple handlers
    const icons=document.querySelectorAll('[data-app]');
    icons.forEach(el=>el.addEventListener('click',openApp));
    function openApp(e){
      const name=e.currentTarget.dataset.app||'app';
      const tpl=document.getElementById('window-template');
      const clone=tpl.content.cloneNode(true);
      const win=clone.querySelector('.window');
      win.dataset.app=name;
      win.querySelector('.window-title').textContent=name.toUpperCase();
      win.querySelector('.window-body').textContent='This is a lightweight '+name+' mock window.';
      win.querySelector('.btn-close').addEventListener('click',function(){win.remove();});
      document.body.appendChild(clone);
    }
  });
})();
