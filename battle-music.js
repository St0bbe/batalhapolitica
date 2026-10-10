// Trilha procedural original: percussao cinematografica, pulso e arpejos.
let ctx,master,loopId,step=0,playing=false;
const Audio=window.AudioContext||window.webkitAudioContext;
function tone(freq,at,duration,kind='sawtooth',volume=.15){
  if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();
  o.type=kind;o.frequency.setValueAtTime(freq,at);
  g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),at+.015);
  g.gain.exponentialRampToValueAtTime(.0001,at+duration);
  o.connect(g);g.connect(master);o.start(at);o.stop(at+duration+.03);
}
function drum(at,strong=false){
  const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';
  o.frequency.setValueAtTime(strong?145:100,at);o.frequency.exponentialRampToValueAtTime(42,at+.18);
  g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(strong?.85:.55,at+.006);
  g.gain.exponentialRampToValueAtTime(.0001,at+.35);o.connect(g);g.connect(master);o.start(at);o.stop(at+.38);
}
function noise(at){
  const len=Math.floor(ctx.sampleRate*.14),buffer=ctx.createBuffer(1,len,ctx.sampleRate),a=buffer.getChannelData(0);
  for(let i=0;i<len;i++)a[i]=(Math.random()*2-1)*(1-i/len);
  const s=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();
  s.buffer=buffer;filter.type='highpass';filter.frequency.value=850;
  g.gain.setValueAtTime(.25,at);g.gain.exponentialRampToValueAtTime(.0001,at+.14);
  s.connect(filter);filter.connect(g);g.connect(master);s.start(at);
}
function beat(){
  if(!ctx||!playing)return;
  const at=ctx.currentTime+.035;
  const bass=[55,55,65.41,49,55,55,73.42,49][Math.floor(step/4)%8];
  if(step%4===0){drum(at,true);tone(bass,at,.36,'sawtooth',.22);}
  if(step%4===2){drum(at);noise(at);}
  if(step%2===1)noise(at);
  const notes=[220,261.63,329.63,392,440,392,329.63,261.63];
  tone(notes[step%8],at,.11,'triangle',.10);
  if(step%16===0){tone(110,at,1.7,'sawtooth',.11);tone(164.81,at,1.7,'triangle',.10);}
  step++;
}
export async function startMusic(){
  if(!Audio)throw Error('AudioContext indisponivel');
  if(!ctx){ctx=new Audio();master=ctx.createGain();master.gain.value=.46;master.connect(ctx.destination);}
  await ctx.resume();
  if(ctx.state!=='running')throw Error('Navegador bloqueou a reprodução; clique na arena.');
  if(!playing){playing=true;beat();loopId=setInterval(beat,180);}
}
export function stopMusic(){playing=false;clearInterval(loopId);if(ctx)ctx.suspend();}
export function setVolume(v){if(master)master.gain.value=Math.max(0,Math.min(1,Number(v)))*.65;}
export function isPlaying(){return playing;}
export function accent(){if(ctx&&playing){const t=ctx.currentTime+.02;drum(t,true);tone(440,t,.45,'sawtooth',.25);tone(659.25,t,.5,'triangle',.18);}}
