import { playPixelClick } from './pixel-audio';
import { enhanceWeatherControls } from './weather-controls';
import { createChristmasShop } from './christmas';
try {
  const app=createChristmasShop(document.getElementById('scene')!);
  document.querySelectorAll<HTMLButtonElement>('[data-weather]').forEach(button=>button.addEventListener('click',()=>{
    app.setWeather(button.dataset.weather as 'sunny'|'cloudy'|'snowy');
    document.querySelectorAll('[data-weather]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  }));
  enhanceWeatherControls(document.querySelector('.time-controls')!);
  let night=false;
  document.getElementById('time-toggle')!.addEventListener('click',()=>{
    night=!night;app.setNight(night);document.querySelector('main')!.dataset.night=String(night);
    const button=document.getElementById('time-toggle')!;button.setAttribute('aria-pressed',String(night));button.querySelector('.control-label')!.textContent=night?'Day mode':'Night mode';button.setAttribute('aria-label',night?'Switch to day mode':'Switch to night mode');
  });
  document.getElementById('reset')!.addEventListener('click',event=>{if(event.isTrusted)void playPixelClick('cloudy');app.reset();});
} catch(e) {
  console.error(e);
  const alert=document.createElement('div');alert.className='error';alert.setAttribute('role','alert');alert.textContent='Unable to start 3D. Enable browser hardware acceleration and reload.';document.querySelector('main')!.appendChild(alert);
}
