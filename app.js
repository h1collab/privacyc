// Basic behaviors: z-index, drag, resize, traffic buttons, dock, settings, time, persistent settings
(function(){
  const desktop = document.getElementById('desktop');
  const windows = () => Array.from(document.querySelectorAll('.window'));
  const dock = document.querySelector('.dock');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settings');
  const closeSettings = document.getElementById('closeSettings');
  const customCursorSel = document.getElementById('customCursor');
  const showDockCB = document.getElementById('showDock');
  const dockMagnify = document.getElementById('dockMagnify');
  const showIconsCB = document.getElementById('showIcons');
  const darkModeCB = document.getElementById('darkMode');
  const timeSpan = document.getElementById('time');
  const checkUpdatesBtn = document.getElementById('checkUpdates');
  const toast = document.getElementById('toast');

  let zTop = 10;
  const APP_VERSION = '1.0';

  /* Utilities */
  function showToast(msg, timeout=2500){
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(toast._t);
    toast._t = setTimeout(()=> toast.classList.add('hidden'), timeout);
  }

  function saveSettings(){
    const settings = {
      cursor: customCursorSel.value,
      showDock: showDockCB.checked,
      dockMagnify: dockMagnify.value,
      showIcons: showIconsCB.checked,
      darkMode: darkModeCB.checked
    };
    localStorage.setItem('zorix.settings', JSON.stringify(settings));
  }
  function loadSettings(){
    try{
      const s = JSON.parse(localStorage.getItem('zorix.settings')) || {};
      if(s.cursor) customCursorSel.value = s.cursor;
      if(typeof s.showDock === 'boolean') showDockCB.checked = s.showDock;
      if(s.dockMagnify) dockMagnify.value = s.dockMagnify;
      if(typeof s.showIcons === 'boolean') showIconsCB.checked = s.showIcons;
      if(typeof s.darkMode === 'boolean') darkModeCB.checked = s.darkMode;
    }catch(e){ console.warn(e); }
  }

  /* Time */
  function updateTime(){
    const d = new Date();
    timeSpan.textContent = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
  setInterval(updateTime, 30*1000);
  updateTime();

  /* Focus */
  function focusWindow(win){
    zTop += 1;
    win.style.zIndex = zTop;
    win.classList.add('active');
    windows().forEach(w=>{ if(w!==win) w.classList.remove('active'); });
    // persist focused window id
    try{ localStorage.setItem('zorix.focus', win.dataset.id||win.dataset.title); }catch(e){}
  }

  /* Restore windows state */
  function persistWindowState(w){
    try{
      const id = w.dataset.id || w.dataset.title;
      const state = {left: w.style.left, top: w.style.top, width: w.style.width, height: w.style.height, display: w.style.display};
      localStorage.setItem('zorix.win.'+id, JSON.stringify(state));
    }catch(e){}
  }
  function restoreWindows(){
    windows().forEach(w=>{
      const id = w.dataset.id || w.dataset.title;
      try{
        const s = JSON.parse(localStorage.getItem('zorix.win.'+id));
        if(s){ Object.assign(w.style, {left: s.left||w.style.left, top: s.top||w.style.top, width: s.width||w.style.width, height: s.height||w.style.height, display: s.display||''}); }
      }catch(e){}
    });
  }

  // Initialize windows
  function initWindows(){
    windows().forEach(w=>{
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
        if(e.target.closest('.traffic')) return;
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
      titlebar.addEventListener('pointerup', (e)=>{ dragging = null; persistWindowState(w); });

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
      resizer.addEventListener('pointerup', ()=>{ resizing = null; persistWindowState(w); });

      // Traffic buttons
      closeBtn.addEventListener('click', ()=> { w.remove(); showToast(w.dataset.title + ' 已关闭'); });
      minBtn.addEventListener('click', ()=> { w.style.display = 'none'; persistWindowState(w); });
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
        persistWindowState(w);
      });

      // Double-click titlebar to zoom
      titlebar.addEventListener('dblclick', ()=>{
        const zoom = w.querySelector('.zoom'); if(zoom) zoom.click();
      });
    });
  }

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

  // Desktop icons double click open
  document.getElementById('icons').addEventListener('dblclick', (e)=>{
    const btn = e.target.closest('.desktop-icon');
    if(!btn) return;
    const app = btn.dataset.app;
    const win = Array.from(document.querySelectorAll('.window')).find(w=>w.dataset.title===app);
    if(win){ if(win.style.display==='none') win.style.display=''; focusWindow(win); }
  });

  // Settings panel
  settingsBtn.addEventListener('click', ()=> settingsPanel.classList.toggle('hidden'));
  closeSettings.addEventListener('click', ()=> settingsPanel.classList.add('hidden'));

  // Apply UI settings
  function applySettings(){
    // cursor
    const cur = customCursorSel.value;
    document.documentElement.classList.remove('cursor-apple','cursor-large');
    if(cur==='apple') document.documentElement.classList.add('cursor-apple');
    if(cur==='large') document.documentElement.classList.add('cursor-large');

    // dock
    dock.style.display = showDockCB.checked ? '' : 'none';
    dock.style.setProperty('--dock-magnify', dockMagnify.value);

    // icons
    document.getElementById('icons').style.display = showIconsCB.checked ? 'block' : 'none';

    // dark
    if(darkModeCB.checked) document.body.classList.add('dark'); else document.body.classList.remove('dark');

    saveSettings();
  }

  // Listen controls
  [customCursorSel, showDockCB, dockMagnify, showIconsCB, darkModeCB].forEach(el=> el.addEventListener('change', applySettings));

  // Keyboard shortcuts
  window.addEventListener('keydown', (e)=>{
    // ESC to close settings or blur
    if(e.key==='Escape'){ settingsPanel.classList.add('hidden'); const active = document.activeElement; if(active && (active.tagName==='TEXTAREA' || active.tagName==='INPUT')) active.blur(); }
    // Cmd/Ctrl+H hide all windows
    if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='h'){ windows().forEach(w=> w.style.display='none'); }
    // Cmd+Space for spotlight (simulate)
    if(e.key===' ' && (e.metaKey||e.ctrlKey)){ e.preventDefault(); showToast('Spotlight: 搜索（模拟）'); }
  });

  // Check updates (simulated)
  checkUpdatesBtn.addEventListener('click', ()=>{
    showToast('���在检查更新...');
    setTimeout(()=>{
      // in real app we'd fetch releases; here we simulate
      const latest = APP_VERSION; // simulated
      if(latest === APP_VERSION) showToast('已是最新版本: ' + APP_VERSION);
      else showToast('发现新版本: ' + latest);
    }, 900);
  });

  // Clicking desktop unfocuses windows
  desktop.addEventListener('pointerdown', (e)=>{
    if(e.target === desktop) windows().forEach(w=>w.classList.remove('active'));
  });

  // Make sure pointer events don't cause selection
  document.addEventListener('dragstart', e=> e.preventDefault());

  // Prevent accidental text selection during drag
  document.addEventListener('selectstart', e=>{
    if(e.target.closest('.titlebar')) e.preventDefault();
  });

  // Restore
  loadSettings();
  initWindows();
  restoreWindows();
  applySettings();

  // Accessibility: focus last focused window on load
  try{
    const last = localStorage.getItem('zorix.focus');
    if(last){ const w = Array.from(document.querySelectorAll('.window')).find(x=> x.dataset.id===last || x.dataset.title===last); if(w) focusWindow(w); }
  }catch(e){}
})();
