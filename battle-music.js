// Trilha eletrônica original, gerada com Web Audio API. Loop de 8 compassos a 140 BPM.
const AudioEngine=window.AudioContext||window.webkitAudioContext;
const BPM=140, BEAT=60/BPM, STEP=BEAT/4, STEPS=128;
let ctx,master,compressor,delay,feedback,loopId,nextTime=0,step=0,playing=false,volume=.65;
function init(){
 if(!AudioEngine)throw new Error('Web Audio indisponível');
 if(ctx)return;
 ctx=new AudioEngine();
 compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-18;compressor.knee.value=12;compressor.ratio.value=3;compressor.attack.value=.006;compressor.release.value=.18;
 master=ctx.createGain();master.gain.value=volume*.7;master.connect(compressor);compressor.connect(ctx.destination);
 delay=ctx.createDelay(.6);delay.delayTime.value=BEAT*.75;feedback=ctx.createGain();feedback.gain.value=.18;
 delay.connect(feedback);feedback.connect(delay);const wet=ctx.createGain();wet.gain.value=.18;delay.connect(wet);wet.connect(master);
}
function osc(hz,time,len,type='sawtooth',gain=.1,destination=master){
 const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(hz,time);
 g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(gain,time+.008);
 g.gain.exponentialRampToValueAtTime(.0001,time+len);
 o.connect(g);g.connect(destination);o.start(time);o.stop(time+len+.025);return o;
}
function kick(t,hard=false){
 const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(hard?190:150,t);o.frequency.exponentialRampToValueAtTime(46,t+.12);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(hard?.95:.76,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.31);
 o.connect(g);g.connect(master);o.start(t);o.stop(t+.34);
}
let noiseBuffer;
function noise(t,duration,amp,highpass){
 if(!noiseBuffer){noiseBuffer=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const arr=noiseBuffer.getChannelData(0);for(let i=0;i<arr.length;i++)arr[i]=Math.random()*2-1;}
 const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=noiseBuffer;f.type='highpass';f.frequency.value=highpass;
 g.gain.setValueAtTime(Math.max(.0001,amp),t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
 src.connect(f);f.connect(g);g.connect(master);src.start(t);src.stop(t+duration+.01);
}
const roots=[55,55,65.41,49,55,73.42,65.41,49];
const melody=[0,7,12,7,10,7,3,7,0,7,12,15,10,7,3,7];
function schedule(i,t){
 const bar=Math.floor(i/16)%8,pos=i%16,root=roots[bar],section=Math.floor(i/32)%4;
 if(pos%4===0)kick(t,pos===0);
 if(pos===4||pos===12){noise(t,.17,.25,1100);osc(190,t,.1,'triangle',.08);}
 if(pos%2===0)noise(t,.045,pos%4===2?.11:.07,5800);
 if(pos===14&&bar%2===1)noise(t,.12,.14,2200);
 if(pos%4===0){osc(root,t,.24,'sawtooth',.19);osc(root/2,t,.28,'sine',.16);}
 if(section!==0||bar>=2){
   const note=melody[(pos+bar*2)%melody.length];
   const hz=root*4*Math.pow(2,note/12);
   if(pos%2===0){osc(hz,t,.095,'square',.065);if(pos%4===0)osc(hz*1.005,t,.12,'sawtooth',.035,delay);}
 }
 if(pos===0&&bar%2===0){osc(root*4,t,BEAT*3.6,'sawtooth',.038);osc(root*6,t,BEAT*3.6,'triangle',.025);}
 if(bar===7&&pos>=12)noise(t,.065,.10+(pos-12)*.035,3000);
}
function tick(){if(!playing||ctx?.state!=='running')return;while(nextTime<ctx.currentTime+.18){schedule(step,nextTime);step=(step+1)%STEPS;nextTime+=STEP;}}
export async function startMusic(){
 init();await ctx.resume();
 if(ctx.state!=='running')throw new Error('Clique na arena para liberar o áudio.');
 if(!playing){playing=true;nextTime=ctx.currentTime+.06;tick();loopId=setInterval(tick,35);}
}
export function stopMusic(){playing=false;clearInterval(loopId);if(ctx&&ctx.state==='running')ctx.suspend();}
export function setVolume(v){volume=Math.max(0,Math.min(1,Number(v)||0));if(master)master.gain.setTargetAtTime(volume*.7,ctx.currentTime,.025);}
export function isPlaying(){return playing&&ctx?.state==='running';}
export function accent(){if(!isPlaying())return;const t=ctx.currentTime+.02;kick(t,true);noise(t,.28,.30,1400);osc(440,t,.32,'sawtooth',.20);osc(659.25,t,.38,'square',.11);}
