// app.js — boot animation, window manager, simple encryption using Web Crypto API
(() => {
  const boot = document.getElementById('boot-overlay');
  const progressBar = document.querySelector('.boot-progress::after');
  // Simulate boot progress
  function setProgress(p){
    const el = document.querySelector('.boot-progress');
    el.style.setProperty('--progress', p);
    el.querySelector('::after');
  }

  // Use realtime updates by manipulating style rule (simpler approach)
  const progressFill = document.querySelector('.boot-progress');
  function animateBoot(){
    let p = 0;
    const after = progressFill;
    const id = setInterval(()=>{
      p += Math.random()*12;
      if(p>=100) p = 100;
      after.style.setProperty('--w', p+"%");
      // set visual width via transform
      after.querySelector('::after');
      // The simple workable approach: change background-size via inline background image gradient stop
      after.style.background = `linear-gradient(90deg,var(--accent) ${p}%, rgba(255,255,255,0.06) ${p}% )`;
      if(p>=100){
        clearInterval(id);
        // fade out
        boot.style.transition='opacity 0.9s ease';
        boot.style.opacity='0';
        setTimeout(()=>boot.remove(),1100);
      }
    },300);
  }

  // Hide cursor during boot
  boot.classList.add('hide-cursor');
  animateBoot();

  // Minimal window system
  const windows = document.getElementById('windows');
  function createWindow(title, html){
    const w = document.createElement('div');
    w.className='window';
    w.style.left='calc(50% - 260px)';
    w.style.top='80px';
    w.innerHTML=`<div class="titlebar"><div class="title">${title}</div><div class="controls"><button class="close">✕</button></div></div><div class="content">${html}</div>`;
    windows.appendChild(w);
    w.querySelector('.close').addEventListener('click',()=>w.remove());
    // simple drag
    const titlebar = w.querySelector('.titlebar');
    let dragging=false,ox=0,oy=0;
    titlebar.addEventListener('mousedown',e=>{dragging=true;ox=e.clientX-w.offsetLeft;oy=e.clientY-w.offsetTop});
    document.addEventListener('mousemove',e=>{if(!dragging) return;w.style.left=(e.clientX-ox)+'px';w.style.top=(e.clientY-oy)+'px'});
    document.addEventListener('mouseup',()=>dragging=false);
    return w;
  }

  // Dock / icons
  document.querySelectorAll('[data-app]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const app = btn.dataset.app;
      if(app==='finder') createWindow('Finder','<p>Welcome to Zorixos Finder — this is a demo folder UI.</p>');
      if(app==='notes') createWindow('Notes','<textarea style="width:100%;height:220px">Take notes...</textarea>');
      if(app==='encrypt') createWindow('Encrypt','<div><h3>Local Encryption</h3><p>Type text to encrypt locally with a passphrase.</p><textarea id="enc-input" style="width:100%;height:100px"></textarea><input id="enc-pass" type="password" placeholder="passphrase" style="width:100%;margin-top:6px"/><br/><button id="enc-btn">Encrypt</button><button id="dec-btn">Decrypt</button><pre id="enc-out"></pre></div>');
      setTimeout(bindCryptoButtons,50);
    });
  });

  // Web Crypto helpers (AES-GCM with PBKDF2)
  async function deriveKey(pass, salt){
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'}, keyMaterial, {name:'AES-GCM',length:256}, false, ['encrypt','decrypt']);
  }
  async function encryptText(plain, pass){
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pass, Array.from(salt).join(','));
    const enc = new TextEncoder();
    const ct = await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, enc.encode(plain));
    // Pack salt+iv+ciphertext as base64 JSON
    return btoa(JSON.stringify({salt:Array.from(salt),iv:Array.from(iv),ct:Array.from(new Uint8Array(ct))}));
  }
  async function decryptText(blobB64, pass){
    const raw = JSON.parse(atob(blobB64));
    const salt = new Uint8Array(raw.salt);
    const iv = new Uint8Array(raw.iv);
    const ct = new Uint8Array(raw.ct).buffer;
    const key = await deriveKey(pass, Array.from(salt).join(','));
    const pt = await crypto.subtle.decrypt({name:'AES-GCM',iv}, key, ct);
    return new TextDecoder().decode(pt);
  }

  function bindCryptoButtons(){
    const encBtn = document.getElementById('enc-btn');
    const decBtn = document.getElementById('dec-btn');
    if(!encBtn) return;
    encBtn.onclick = async ()=>{
      const text = document.getElementById('enc-input').value;
      const pass = document.getElementById('enc-pass').value || 'pass';
      try{const out = await encryptText(text, pass);document.getElementById('enc-out').textContent = out}catch(e){document.getElementById('enc-out').textContent = 'Encrypt error:'+e}
    };
    decBtn.onclick = async ()=>{
      const raw = document.getElementById('enc-out').textContent.trim();
      const pass = document.getElementById('enc-pass').value || 'pass';
      try{const out = await decryptText(raw, pass);document.getElementById('enc-out').textContent = out}catch(e){document.getElementById('enc-out').textContent = 'Decrypt error:'+e}
    };
  }

  // After boot, reveal menu and dock
  setTimeout(()=>{
    document.getElementById('menubar').style.opacity=1;
    document.getElementById('dock').style.opacity=1;
  },1200);

})();
