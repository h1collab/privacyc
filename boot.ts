// boot.ts - source for boot animation behavior
export async function minimalBoot(){
  await new Promise(r=>setTimeout(r,900));
  const boot=document.getElementById('boot-screen');
  const desktop=document.getElementById('desktop');
  boot?.classList.add('hidden');
  desktop?.classList.remove('hidden');
}
