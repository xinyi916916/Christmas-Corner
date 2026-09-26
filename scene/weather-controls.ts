import { playPixelClick, isUISoundEnabled, setUISoundEnabled, type PixelClickMode } from './pixel-audio';
export function enhanceWeatherControls(container:HTMLElement){
const paths:Record<string,string>={night:'M13 2H7V4H5V7H3V14H5V17H8V19H15V17H18V14H13V12H10V9H11V5H13Z',sunny:'M8 5H14V7H17V14H14V17H7V14H5V8H8Z M10 0H12V3H10Z M10 19H12V22H10Z M0 10H3V12H0Z M19 10H22V12H19Z M3 3H5V5H3Z M17 17H19V19H17Z',cloudy:'M6 7H8V4H14V6H17V9H20V12H22V17H19V19H4V17H1V12H3V9H6Z',snowy:'M10 1H12V6L16 2L18 4L13 9H20V11H14L19 16L17 18L12 13V21H10V13L5 18L3 16L8 11H1V9H8L3 4L5 2L10 7Z'};
const cleanup:(()=>void)[]=[];
container.querySelectorAll<HTMLButtonElement>('.time-button,.weather-button').forEach(button=>{const kind=button.dataset.weather||'night';button.dataset.icon=kind;
const icon=document.createElement('span');icon.className='weather-pixel-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><path d="'+paths[kind]+'" fill="currentColor" stroke="#344441" stroke-width="1"/></svg>';button.insertBefore(icon,button.firstChild);
const particles=document.createElement('span');particles.className='pixel-particles';particles.setAttribute('aria-hidden','true');particles.innerHTML='<i></i><i></i><i></i><i></i>';button.appendChild(particles);
let pointerActivation=false,keyboardActivation=false;
const down=(e:PointerEvent)=>{if(!e.isTrusted||!e.isPrimary||e.button!==0)return;pointerActivation=true;void playPixelClick(kind as PixelClickMode);};
const keydown=(e:KeyboardEvent)=>{if(e.key!=='Enter'&&e.key!==' ')return;if(e.repeat)return;keyboardActivation=true;if(e.isTrusted)void playPixelClick(kind as PixelClickMode);};
const cancel=()=>{pointerActivation=false;};
const keyup=()=>{setTimeout(()=>{keyboardActivation=false;},0);};
button.addEventListener('pointerdown',down);button.addEventListener('pointercancel',cancel);button.addEventListener('keydown',keydown);button.addEventListener('keyup',keyup);
cleanup.push(()=>{button.removeEventListener('pointerdown',down);button.removeEventListener('pointercancel',cancel);button.removeEventListener('keydown',keydown);button.removeEventListener('keyup',keyup);});
const release=(e:MouseEvent)=>{if(e.isTrusted&&!pointerActivation&&!keyboardActivation)void playPixelClick(kind as PixelClickMode);pointerActivation=false;keyboardActivation=false;button.classList.remove('pixel-release');void button.offsetWidth;button.classList.add('pixel-release');};const end=(e:AnimationEvent)=>{if(e.target===button)button.classList.remove('pixel-release');};button.addEventListener('click',release);button.addEventListener('animationend',end);
cleanup.push(()=>{button.removeEventListener('click',release);button.removeEventListener('animationend',end);icon.remove();particles.remove();});});
const sound=document.createElement('button');sound.type='button';sound.className='ui-sound-toggle';
sound.innerHTML='<svg class="sound-speaker" viewBox="0 0 24 24" aria-hidden="true" shape-rendering="crispEdges" fill="currentColor"><path d="M3 9h4V7h2V5h3v14H9v-2H7v-2H3z"/><g class="sound-waves"><path d="M14 8h2v2h2v4h-2v2h-2v-2h2v-4h-2z M19 5h2v3h2v8h-2v3h-2v-3h2V8h-2z"/></g><path class="sound-muted" d="M15 9h2v2h2V9h2v2h-2v2h2v2h-2v-2h-2v2h-2v-2h2v-2h-2z"/></svg><span class="sound-label">SOUND</span>';
const update=()=>{const on=isUISoundEnabled();sound.setAttribute('aria-pressed',String(on));sound.setAttribute('aria-label',on?'Mute interface sounds':'Enable interface sounds');sound.title=on?'Sound ON':'Sound OFF';};
const toggle=(event:MouseEvent)=>{setUISoundEnabled(!isUISoundEnabled());update();sound.classList.remove('sound-release');void sound.offsetWidth;sound.classList.add('sound-release');if(event.isTrusted&&isUISoundEnabled())void playPixelClick('cloudy');};
const soundEnd=(event:AnimationEvent)=>{if(event.target===sound)sound.classList.remove('sound-release');};
update();sound.addEventListener('click',toggle);sound.addEventListener('animationend',soundEnd);const soundHome=document.createElement('div');soundHome.className='time-controls sound-controls';soundHome.appendChild(sound);(document.querySelector('header')||container).appendChild(soundHome);
cleanup.push(()=>{sound.removeEventListener('click',toggle);sound.removeEventListener('animationend',soundEnd);soundHome.remove();});return()=>cleanup.forEach(fn=>fn());}
