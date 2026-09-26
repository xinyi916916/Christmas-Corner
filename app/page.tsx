"use client";
import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { createChristmasShop, type Weather } from '../scene/christmas';
import { playPixelClick } from '../scene/pixel-audio';
import { enhanceWeatherControls } from '../scene/weather-controls';
export default function Home(){
  const host=useRef<HTMLDivElement>(null);
  const api=useRef<ReturnType<typeof createChristmasShop> | null>(null);
  const [weather,setWeather]=useState<Weather>('sunny');
  const [night,setNight]=useState(false);
  const [error,setError]=useState('');
  const [discovered,setDiscovered]=useState<Set<string>>(()=>new Set());
  useEffect(()=>{try{api.current=createChristmasShop(host.current!,ids=>setDiscovered(new Set(ids)));}catch(e){console.error(e);setError('Unable to start 3D. Enable browser hardware acceleration and reload.');}return()=>api.current?.dispose();},[]);
  useEffect(()=>enhanceWeatherControls(document.querySelector('.time-controls')!),[]);
  return <main data-night={night} data-discovered={discovered.size}><div className="scene" ref={host}/><header className="chapter-intro"><span className="edition">NO. 01 / WINTER MINIATURE</span><h1>Christmas Corner</h1><p>A little shop full of winter warmth</p></header><div className="time-controls"><Button className="time-button" aria-label={night?"Switch to day mode":"Switch to night mode"} aria-pressed={night} onClick={()=>{const next=!night;setNight(next);api.current?.setNight(next);}}><span className="control-label">{night?'Day mode':'Night mode'}</span></Button><div className="weather-controls" role="group" aria-label="Weather">{([['sunny','Windy'],['cloudy','Cloudy'],['snowy','Snowy']] as const).map(([value,label])=><Button key={value} className="weather-button" data-weather={value} aria-pressed={weather===value} onClick={()=>{setWeather(value);api.current?.setWeather(value);}}><span className="control-label">{label}</span></Button>)}</div></div>{error&&<div role="alert" className="error">{error}</div>}<footer><div><span className="tag">LA MAISON DE NOËL</span><p>Drag to rotate · Scroll to zoom · Try switching the weather!</p></div><button className="reset-button" onClick={(event)=>{if(event.isTrusted)void playPixelClick('cloudy');api.current?.reset();}} aria-label="Reset camera view"><svg className="reset-icon" viewBox="0 0 20 20" aria-hidden="true" fill="currentColor"><path d="M3 2h2v3h2V3h7v2h3v3h2v7h-2v3h-3v2H7v-2H4v-3H2v-4h2v4h3v3h7v-3h3V8h-3V5H7v2h2v2H3z"/></svg>Reset</button></footer></main>;
}

