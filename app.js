// Basic behaviors: z-index, drag, resize, traffic buttons, dock, settings, time
(function(){
  const desktop = document.getElementById('desktop');
  const windows = Array.from(document.querySelectorAll('.window'));
  const dock = document.querySelector('.dock');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settings');
  const closeSettings = document.getElementById('closeSettings');
  const customCursorCB = document.getElementById('customCursor');
  const showDockCB = document.getElementById('showDock');
  const darkModeCB = document.getElementById('darkMode');
  const timeSpan = document.getElementById('time');

  let zTop = 10;

  function updateTime(){
    const d = new Date();
    timeSpan.textContent = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
  setInterval(updateTime, 30*1000);
  updateTime();

  // Bring window to front
  function focusWindow(win){
    zTop += 1;
    win.style.zIndex = zTop;
    win.classList.add('active');
    windows.forEach(w=>{ if(w!==win) w.classList.remove('active'); });
  }

  // Initialize windows
  windows.forEach(w=>{
    w.style.zIndex = ++zTop;
    const titlebar = w.querySelector('.titlebar');
    const resizer = w.querySelector('.resizer');
    const closeBtn = w.querySelector('.close');
    const minBtn = w.querySelector('.minimize');
    const zoomBtn = w.querySelector('.zoom');

    // Click to focus
    w.addEventListener('pointerdown', ()=> focusWindow(w));

    // Dragging
    let dragging = null;
    titlebar.addEventListener('pointerdown', (e)=>{
      if(e.target.closest('.traffic')) return; // don't drag when hitting traffic buttons
      dragging = {
        startX: e.clientX,
        startY: e.clientY,
        origLeft: parseInt(w.style.left || w.getBoundingClientRect().left,10),
        origTop: parseInt(w.style.top || w.getBoundingClientRect().top,10)
      };
      w.setPointerCapture(e.pointerId);
    });
    titlebar.addEventListener('pointermove', (e)=>{
      if(!dragging) return;
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;
      w.style.left = (dragging.origLeft + dx) + 'px';
      w.style.top = (dragging.origTop + dy) + 'px';
    });
    titlebar.addEventListener('pointerup', (e)=>{ dragging = null; });

    // Resize
    let resizing = null;
    resizer.addEventListener('pointerdown', (e)=>{
      resizing = {
        startX: e.clientX,
        startY: e.clientY,
        startW: w.offsetWidth,
        startH: w.offsetHeight
      };
      w.setPointerCapture(e.pointerId);
    });
    resizer.addEventListener('pointermove', (e)=>{
      if(!resizing) return;
      const dx = e.clientX - resizing.startX;
      const dy = e.clientY - resizing.startY;
      w.style.width = Math.max(200, resizing.startW + dx) + 'px';
      w.style.height = Math.max(120, resizing.startH + dy) + 'px';
    });
    resizer.addEventListener('pointerup', ()=>{ resizing = null; });

    // Traffic buttons
    closeBtn.addEventListener('click', ()=> w.remove());
    minBtn.addEventListener('click', ()=> w.style.display = 'none');
    zoomBtn.addEventListener('click', ()=>{
      if(w.classList.contains('max')){
        // restore
        w.style.left = w.dataset._left || w.style.left;
        w.style.top = w.dataset._top || w.style.top;
        w.style.width = w.dataset._width || w.style.width;
        w.style.height = w.dataset._height || w.style.height;
        w.classList.remove('max');
      } else {
        // save and maximize
        w.dataset._left = w.style.left;
        w.dataset._top = w.style.top;
        w.dataset._width = w.style.width;
        w.dataset._height = w.style.height;
        w.style.left = '12px';
        w.style.top = '40px';
        w.style.width = (window.innerWidth - 24) + 'px';
        w.style.height = (window.innerHeight - 120) + 'px';
        w.classList.add('max');
      }
    });
  });

  // Dock launch: show/hide windows by data-title
  dock.addEventListener('click', (e)=>{
    const btn = e.target.closest('.dock-item');
    if(!btn) return;
    const name = btn.dataset.app;
    const win = Array.from(document.querySelectorAll('.window')).find(w=>w.dataset.title===name);
    if(win){
      if(win.style.display === 'none') win.style.display = '';
      focusWindow(win);
    }
  });

  // Settings panel
  settingsBtn.addEventListener('click', ()=> settingsPanel.classList.toggle('hidden'));
  closeSettings.addEventListener('click', ()=> settingsPanel.classList.add('hidden'));

  // Toggle custom cursor
  customCursorCB.addEventListener('change', (e)=>{
    if(e.target.checked){
      document.documentElement.classList.add('custom-cursor-root');
      document.body.classList.add('custom-cursor');
    } else {
      document.body.classList.remove('custom-cursor');
    }
  });

  // Toggle dock visibility
  showDockCB.addEventListener('change', (e)=>{
    if(e.target.checked) dock.style.display = '';
    else dock.style.display = 'none';
  });

  // Dark mode
  darkModeCB.addEventListener('change', (e)=>{
    if(e.target.checked) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  });

  // Global keyboard: press Esc to close settings or blur
  window.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){
      settingsPanel.classList.add('hidden');
      const active = document.activeElement;
      if(active && active.tagName==='TEXTAREA') active.blur();
    }
  });

  // Double-click titlebar to zoom (maximize)
  document.querySelectorAll('.titlebar').forEach(tb=>{
    tb.addEventListener('dblclick', (e)=>{
      const w = tb.closest('.window');
      const zoom = w.querySelector('.zoom');
      if(zoom) zoom.click();
    });
  });

  // Clicking desktop unfocuses windows
  desktop.addEventListener('pointerdown', (e)=>{
    if(e.target === desktop) windows.forEach(w=>w.classList.remove('active'));
  });

  // Basic accessible focus: show minimized windows from dock
  // (already handled by dock click)

  // Make sure pointer events don't cause selection
  document.addEventListener('dragstart', e=> e.preventDefault());
})();
