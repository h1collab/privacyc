// main.ts - modern module source (TypeScript)
type AppName = 'about'|'settings'|'terminal';

function wait(ms:number){return new Promise(resolve=>setTimeout(resolve,ms));}

async function bootSequence(maxWait = 5000){
  const boot = document.getElementById('boot-screen');
  const desktop = document.getElementById('desktop');
  try{
    const text = document.querySelector('.boot-text') as HTMLElement | null;
    const frames = ['Initializing.', 'Initializing..', 'Initializing...'];
    for(let i = 0; i < 6; i++){
      if(text) text.textContent = frames[i % frames.length];
      await wait(250);
    }
  }catch(e){
    console.error('boot typing failed', e);
  }
  // ensure hide even if other parts failed
  if(boot) boot.classList.add('hidden');
  if(desktop) desktop.classList.remove('hidden');
  // fallback: force hide after maxWait
  setTimeout(()=>{ if(boot && !boot.classList.contains('hidden')) boot.classList.add('hidden'); if(desktop && desktop.classList.contains('hidden')) desktop.classList.remove('hidden'); }, maxWait);
}

function applyTheme(theme: 'dark'|'light'|'system'){
  try{
    if(theme === 'system'){
      const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', prefers);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('privacyc:theme', theme);
  }catch(e){console.error(e)}
}

function createWindow(app:AppName){
  const tpl = document.getElementById('window-template') as HTMLTemplateElement;
  const clone = tpl.content.cloneNode(true) as DocumentFragment;
  const win = clone.querySelector('.window') as HTMLElement;
  win.setAttribute('data-app', app);
  const title = win.querySelector('.window-title') as HTMLElement;
  title.textContent = app.toUpperCase();
  const body = win.querySelector('.window-body') as HTMLElement;

  if(app === 'terminal'){
    body.innerHTML = '<pre>$ echo "PrivacyC running"\nPrivacyC running</pre>';
  } else if(app === 'about'){
    body.innerHTML = `<h3>PrivacyC</h3><p>Optimized demo desktop — TypeScript + JS sources included.</p>`;
  } else if(app === 'settings'){
    body.innerHTML = `
      <h3>Settings</h3>
      <div class="settings-row">
        <label>Theme</label>
        <div class="switch">
          <label><input type="radio" name="theme" value="dark"> Dark</label>
          <label><input type="radio" name="theme" value="light"> Light (white background)</label>
          <label><input type="radio" name="theme" value="system"> System</label>
        </div>
      </div>
      <div class="settings-row">
        <label>Animations</label>
        <div class="switch">
          <label><input type="checkbox" id="toggle-animations" checked> Enable</label>
        </div>
      </div>
      <div class="settings-row">
        <button id="save-settings">Save</button>
      </div>
    `;
  }

  const btnClose = win.querySelector('.btn-close') as HTMLElement;
  btnClose.addEventListener('click', ()=> win.remove());
  document.body.appendChild(clone);

  // wire settings if opened
  if(app === 'settings'){
    const radios = document.querySelectorAll<HTMLInputElement>('input[name="theme"]');
    const saved = localStorage.getItem('privacyc:theme') || 'system';
    radios.forEach(r=>{ if(r.value === saved) r.checked = true; r.addEventListener('change', ()=> applyTheme(r.value as any)); });
    const animToggle = document.getElementById('toggle-animations') as HTMLInputElement | null;
    const savedAnim = localStorage.getItem('privacyc:animations');
    if(animToggle) animToggle.checked = savedAnim !== 'false';
    const saveBtn = document.getElementById('save-settings');
    if(saveBtn){ saveBtn.addEventListener('click', ()=>{ localStorage.setItem('privacyc:animations', String(animToggle?.checked)); alert('Settings saved'); }); }
  }
}

function attachHandlers(){
  document.querySelectorAll<HTMLElement>('[data-app]').forEach(el=>{
    el.tabIndex = 0;
    el.addEventListener('click', ()=>{ const a = (el as HTMLElement).dataset.app as AppName; createWindow(a); });
    el.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') { const a = (el as HTMLElement).dataset.app as AppName; createWindow(a); } });
  });
}

export async function start(){
  try{
    // restore theme
    const saved = localStorage.getItem('privacyc:theme') || 'system';
    applyTheme(saved as any);

    await bootSequence();
    attachHandlers();
  }catch(e){
    console.error('start failed', e);
    // ensure desktop becomes visible
    const boot = document.getElementById('boot-screen');
    const desktop = document.getElementById('desktop');
    if(boot) boot.classList.add('hidden');
    if(desktop) desktop.classList.remove('hidden');
  }
}

// auto-start when used as module
if(typeof window !== 'undefined'){
  start().catch(err=>{console.error(err); const boot = document.getElementById('boot-screen'); const desktop = document.getElementById('desktop'); if(boot) boot.classList.add('hidden'); if(desktop) desktop.classList.remove('hidden');});
}
