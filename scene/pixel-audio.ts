export type PixelClickMode='sunny'|'cloudy'|'snowy'|'night';
let context:AudioContext|undefined,lastClick=-Infinity,generation=0;
let enabled=true;
try{enabled=localStorage.getItem('uiSoundEnabled')!=='false';}catch{/* Storage can be unavailable for local files. */}
const voices=new Set<OscillatorNode>();
export const isUISoundEnabled=()=>enabled;
export function setUISoundEnabled(value:boolean){
  enabled=value;generation++;
  try{localStorage.setItem('uiSoundEnabled',String(value));}catch{}
  if(!value){for(const voice of voices){try{voice.stop();}catch{}}voices.clear();}
}
/** Call only from a trusted user activation; never from scene animation. */
export async function playPixelClick(mode:PixelClickMode){
  const now=performance.now();if(!enabled||now-lastClick<55)return;lastClick=now;
  const ticket=++generation;
  try{
    context??=new AudioContext();
    if(context.state==='suspended')await context.resume();
    if(!enabled||ticket!==generation||context.state!=='running')return;
    for(const voice of voices){try{voice.stop();}catch{}}voices.clear();
    const pitches={sunny:[440,570,690,800],cloudy:[390,490,630,710],snowy:[470,600,730,850],night:[490,370,700,590]}[mode];
    const start=context.currentTime;
    for(let layer=0;layer<2;layer++){
      const osc=context.createOscillator(),gain=context.createGain(),duration=layer?.055:.085;
      osc.type=layer?'sine':'triangle';osc.frequency.setValueAtTime(pitches[layer*2],start);osc.frequency.exponentialRampToValueAtTime(pitches[layer*2+1],start+duration*.7);
      gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(layer?.025:.065,start+.004);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
      osc.connect(gain);gain.connect(context.destination);voices.add(osc);
      osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();};osc.start(start);osc.stop(start+.10);
    }
  }catch{/* Unsupported/blocked audio must never prevent a weather change. */}
}
