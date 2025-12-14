// Simple screen router
const screens = {
  start:  document.getElementById('screen-start'),
  choose: document.getElementById('screen-choose'),
  law1:   document.getElementById('screen-law1'),
  law2:   document.getElementById('screen-law2'),
  level1: document.getElementById('screen-level1'),
  level2: document.getElementById('screen-level2'),
};
function show(id){
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[id].classList.add('active');
}

/* =========================
   START → CHOOSE CHARACTER
========================= */
document.getElementById('btnGetStarted').addEventListener('click', () => {
  show('choose');
});
document.getElementById('btnBackFromChoose').addEventListener('click', () => {
  show('start');
});

// Pick Newton
document.getElementById('pickNewton').addEventListener('click', () => {
  show('law1');
});

/* =========================
   LAW 1 — INERTIA DEMO
========================= */
const ball = document.getElementById('ball');
const btnForce = document.getElementById('btnForce');
const btnReset = document.getElementById('btnReset');
const demoMsg = document.getElementById('demoMsg');

let vx = 0;         // velocity (px per frame-ish)
let raf = 0;        // animation id
let running = false;

function stepLaw1(){
  const rail = ball.parentElement;
  const maxX = rail.clientWidth - ball.offsetWidth - 10;

  const x = ball.offsetLeft + vx;
  ball.style.left = Math.min(x, maxX) + 'px';

  // tiny friction
  vx *= 0.99;

  if (x >= maxX){
    running = false;
    cancelAnimationFrame(raf);
    demoMsg.textContent = 'Nice! Motion began only after a force.';
    return;
  }
  raf = requestAnimationFrame(stepLaw1);
}

btnForce?.addEventListener('click', () => {
  if (!running){
    running = true;
    demoMsg.textContent = 'Force applied!';
    vx = 5;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(stepLaw1);
  }
});

btnReset?.addEventListener('click', () => {
  running = false; vx = 0;
  cancelAnimationFrame(raf);
  ball.style.left = '10px';
  demoMsg.textContent = '';
});

document.getElementById('btnBackHome')?.addEventListener('click', () => show('choose'));
document.getElementById('btnGoLaw2')?.addEventListener('click', () => show('law2'));

/* =========================
   LAW 2 — F = m·a DEMO
========================= */
const boxLight = document.getElementById('boxLight');
const boxHeavy = document.getElementById('boxHeavy');
const forceRange = document.getElementById('forceRange');
const forceVal = document.getElementById('forceVal');
const btnForceL2 = document.getElementById('btnForceL2');
const btnResetL2 = document.getElementById('btnResetL2');
const demoMsgL2 = document.getElementById('demoMsgL2');

let raf2 = 0;
let run2 = false;
let vxA = 0, vxB = 0; // velocities
let axA = 0, axB = 0; // accelerations

forceRange?.addEventListener('input', () => {
  forceVal.textContent = forceRange.value;
});

function resetL2(){
  cancelAnimationFrame(raf2);
  run2 = false;
  vxA = vxB = 0;
  axA = axB = 0;
  if (boxLight) boxLight.style.left = '14px';
  if (boxHeavy) boxHeavy.style.left = '14px';
  if (demoMsgL2) demoMsgL2.textContent = '';
}
btnResetL2?.addEventListener('click', resetL2);

function startForceL2(){
  const F = +forceRange.value;         // N (arbitrary)
  const mA = +boxLight.dataset.mass;   // 1
  const mB = +boxHeavy.dataset.mass;   // 3

  // a = F / m (scaled for visuals)
  axA = F / mA * 0.0009;
  axB = F / mB * 0.0009;

  if (!run2){
    run2 = true;
    demoMsgL2.textContent = 'Constant force applied… watch accelerations!';
    raf2 = requestAnimationFrame(stepLaw2);
  }
}
btnForceL2?.addEventListener('click', startForceL2);

function stepLaw2(){
  const track = boxLight.parentElement;
  const maxX = track.clientWidth - 40 - boxLight.offsetWidth;

  // integrate a -> v -> x
  vxA += axA; vxB += axB;
  const nextA = Math.min(boxLight.offsetLeft + vxA, maxX);
  const nextB = Math.min(boxHeavy.offsetLeft + vxB, maxX);
  boxLight.style.left = nextA + 'px';
  boxHeavy.style.left = nextB + 'px';

  if (nextA >= maxX && nextB >= maxX){
    demoMsgL2.textContent = 'Both reached! Heavier mass accelerated less for the same force.';
    run2 = false;
    cancelAnimationFrame(raf2);
    return;
  }
  raf2 = requestAnimationFrame(stepLaw2);
}

document.getElementById('btnBackLaw1')?.addEventListener('click', () => {
  resetL2(); show('law1');
});
document.getElementById('btnPlayLevel2')?.addEventListener('click', () => show('level2'));

/* =========================
   LEVEL placeholders
========================= */
document.getElementById('btnLevelBack1')?.addEventListener('click', () => show('law1'));
document.getElementById('btnLevelDone1')?.addEventListener('click', () => {
  alert('Level 1 complete! Continue to Law 2.');
  show('law2');
});

document.getElementById('btnLevelBack2')?.addEventListener('click', () => show('law2'));
document.getElementById('btnLevelDone2')?.addEventListener('click', () => {
  alert('Level 2 complete! Next we will add Law 3 (Action–Reaction).');
});
