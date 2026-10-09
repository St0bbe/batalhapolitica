import { Arena } from './arena.js';
const $=id=>document.getElementById(id);
const arena=new Arena($('game'),render);
const ranking=new Map();
function render(s){for(let i=0;i<2;i++){const hp=Math.ceil(s.fighters[i].hp);$('hp'+i).style.width=hp+'%';$('health'+i).textContent=hp+' HP'}$('timer').textContent=Math.ceil(s.time);$('round').textContent=s.round;$('banner').textContent=s.banner}
function event(type,gift=''){const target=Number($('target').value),name=$('viewer').value.trim()||'Espectador';const weight=type==='gift'?5:type==='comment'?2:1;ranking.set(name,(ranking.get(name)||0)+weight);$('ranking').replaceChildren(...[...ranking].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([n,p])=>{const li=document.createElement('li');li.textContent=n+' — '+p+' pontos';return li}));arena.event({type,gift,target,name});$('ticker').textContent=name+' enviou '+(type==='gift'?gift:type==='like'?'uma curtida':'um comentário')+' • evento de demonstração'}
$('start').onclick=()=>arena.start();$('pause').onclick=()=>arena.togglePause();$('reset').onclick=()=>arena.reset();document.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>event(b.dataset.type,b.dataset.gift||''));
arena.draw();
// Interface de integração futura: bridge local pode chamar window.batalhaEvent({type:'gift',gift:'rose',target:0,name:'usuario'})
window.batalhaEvent=payload=>{if(!payload||!['gift','like','comment'].includes(payload.type))return;const target=Number(payload.target);if(![0,1].includes(target))return;$('target').value=String(target);$('viewer').value=String(payload.name||'Espectador').slice(0,24);event(payload.type,payload.gift||'')};