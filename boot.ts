// boot.ts - source for boot animation behavior (kept if needed)
export async function minimalBoot(){
  await new Promise(r=>setTimeout(r,900));
  const boot=document.getElementById('boot-screen');
  const desktop=document.getElementById('desktop');
  if(boot) boot.classList.add('hidden');
  if(desktop) desktop.classList.remove('hidden');
}
