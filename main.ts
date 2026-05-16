// main.ts - modern module source (TypeScript)
type AppName = 'about'|'settings'|'terminal';

function wait(ms:number){return new Promise(resolve=>setTimeout(resolve,ms));}

async function bootSequence(){
  const boot=document.getElementById('boot-screen');
  const desktop=document.getElementById('desktop');
  await wait(800);
  // small typing effect
  const text=document.querySelector('.boot-text')! as HTMLElement;
  const frames = ['Initializing.','Initializing..','Initializing...'];
  for(let i=0;i<3;i++){text.textContent=frames[i%frames.length];await wait(300)}
  boot?.classList.add('hidden');
  desktop?.classList.remove('hidden');
}

function createWindow(app:AppName){
  const tpl=document.getElementById('window-template') as HTMLTemplateElement;
  const clone=tpl.content.cloneNode(true) as DocumentFragment;
  const win=clone.querySelector('.window') as HTMLElement;
  win.setAttribute('data-app',app);
  win.querySelector('.window-title')!.textContent = app.toUpperCase();
  const body=win.querySelector('.window-body') as HTMLElement;
  if(app==='terminal'){
    body.innerHTML = '<pre>$ echo "PrivacyC running"\nPrivacyC running</pre>';
  } else if(app==='about'){
    body.innerHTML = `<h3>PrivacyC</h3><p>Optimized demo desktop — TypeScript + JS sources included.</p>`;
  } else {
    body.innerHTML = `<p>Settings placeholder</p>`;
  }
  win.querySelector('.btn-close')!.addEventListener('click',()=>win.remove());
  document.body.appendChild(clone);
}

function attachHandlers(){
  document.querySelectorAll('[data-app]').forEach(el=>{
    el.addEventListener('click',()=>{const a=(el as HTMLElement).dataset.app as AppName;createWindow(a)});
  });
}

export async function start(){
  await bootSequence();
  attachHandlers();
}

// auto-start when used as module
if(typeof window !== 'undefined'){
  start().catch(console.error);
}
