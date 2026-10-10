const $=id=>document.getElementById(id);
const channel=new BroadcastChannel('batalha-politica-v1');
let scores=[500,500],running=true,paused=false;
const ranks=new Map();const fmt=n=>n.toLocaleString('pt-BR');
function update(){const total=scores[0]+scores[1];for(let i=0;i<2;i++){const p=scores[i]/total*100;$('power'+i).textContent=fmt(scores[i]);$('bar'+i).style.width=Math.min(100,scores[i]/1500*100)+'%';$('meter'+i).style.width=p+'%';$('pct'+i).textContent=Math.round(p)+'%';}}
function feed(s){const d=document.createElement('div');d.textContent=s;$('feed').append(d);while($('feed').children.length>4)$('feed').firstElementChild.remove();}
function broadcast(){channel.postMessage({kind:'state',scores,running,paused,ranks:[...ranks]});}
function receive(event){if(!running||paused)return;const side=Number(event.target);if(![0,1].includes(side))return;const n=Number(event.points)|| (event.type==='like'?2:event.type==='comment'?5:event.gift==='shield'?100:20);if(!Number.isFinite(n)||n<=0)return;const amount=Math.min(20000,Math.floor(n));const before=scores[0]-scores[1];scores[side]+=amount;const user=String(event.name||'Espectador').slice(0,24);ranks.set(user,(ranks.get(user)||0)+amount);feed((event.type==='like'?'❤️':event.type==='comment'?'💬':'🎁')+' '+user+' +'+amount+' para '+(side===0?'Azul':'Vermelho'));const burst=$('burst');burst.textContent=before*(scores[0]-scores[1])<0?'🔥 VIRADA!':'+'+amount+' ⚡';burst.classList.remove('show');void burst.offsetWidth;burst.classList.add('show');update();broadcast();}
channel.onmessage=({data})=>{if(data?.kind==='request'){broadcast();return;}if(data?.kind!=='command')return;if(data.action==='reset'){scores=[500,500];ranks.clear();running=false;paused=false;$('feed').replaceChildren();feed('🎮 Aguardando eventos da LIVE...');update();broadcast();return;}if(data.action==='start'){running=true;paused=false;feed('⚡ A batalha começou!');broadcast();return;}if(data.action==='pause'){paused=!paused;broadcast();return;}if(data.action==='event'){running=true;receive(data.event);}};
const bridge=new EventSource('http://127.0.0.1:3001/events');
bridge.onmessage=({data})=>{try{const msg=JSON.parse(data);if(msg.kind==='status'){channel.postMessage(msg);return;}if(msg.kind==='event'&&msg.source==='tiktok')receive(msg);}catch(e){console.warn(e)}};
bridge.onerror=()=>channel.postMessage({kind:'status',online:false,message:'Ponte TikTok offline'});
update();broadcast();
