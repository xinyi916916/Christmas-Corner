import * as T from 'three';
import { playPixelClick } from './pixel-audio';
export const hotspots=[
 {id:'gingerbread',title:'GINGERBREAD BOY',label:'Gingerbread Boy',description:'A tiny Christmas visitor, keeping watch over the shop.',anchor:'gingerbread',position:[0,.65,.2],icon:'M8 1H14V3H16V8H14V10H20V14H14V17H17V23H12V18H10V23H5V17H8V14H2V10H8V8H6V3H8Z'},
 {id:'snowman',title:'SNOWMAN',label:'Snowman',description:'Always waiting outside, even on the coldest nights.',anchor:'snowman',position:[0,1.15,.37],icon:'M8 1H15V3H17V8H14V10H18V13H21V20H18V23H5V21H2V14H5V10H8V8H6V3H8Z'},
 {id:'postbox',title:'CHRISTMAS POST',label:'Christmas Post',description:'Letters, wishes, and a little Christmas magic.',anchor:'root',position:[-3.18,1.62,3.5],icon:'M2 5H22V19H2Z M3 6L12 13L21 6'},
 {id:'reindeer',title:'LITTLE REINDEER',label:'Little Reindeer',description:"The shop's quietest customer.",anchor:'reindeer',position:[0,.45,.49],icon:'M2 1H4V5H7V2H9V9H15V2H17V5H20V1H22V8H17V12H19V19H16V23H8V20H5V12H7V8H2Z'},
 {id:'shop',title:'LA MAISON DE NOËL',label:'La Maison de Noël',description:'A little shop full of winter warmth.',anchor:'root',position:[-.1,3.72,1.64],icon:'M1 11L12 1L23 11H20V23H4V11Z M10 23V15H15V23'}
] as const;
export function createExploration(host:HTMLElement,camera:T.Camera,root:T.Object3D,anchors:Record<string,T.Object3D>,onDiscovery?:(ids:string[])=>void){
 const layer=document.createElement('div');layer.className='exploration-layer';host.appendChild(layer);
 let discovered=new Set<string>();try{const saved=JSON.parse(localStorage.getItem('discoveredHotspots')||'[]');if(Array.isArray(saved))discovered=new Set(saved.filter(id=>hotspots.some(h=>h.id===id)));}catch{}
 if(discovered.size===hotspots.length){discovered.clear();try{localStorage.setItem('discoveredHotspots','[]');}catch{}}
 let resetTimer:ReturnType<typeof setTimeout>|undefined;
 const progress=document.createElement('div');progress.className='discovery-progress';progress.setAttribute('role','status');host.parentElement!.querySelector('footer>div')?.appendChild(progress);
 const counter=()=>{onDiscovery?.([...discovered]);progress.textContent=discovered.size===hotspots.length?'ALL SECRETS FOUND · 5 / 5':`DISCOVERED ${discovered.size} / ${hotspots.length}`;};counter();
 const card=document.createElement('section');card.className='pixel-info-card';card.hidden=true;card.setAttribute('role','region');card.setAttribute('aria-label','Object information');
 const close=document.createElement('button');close.type='button';close.className='inspect-close';close.textContent='×';close.setAttribute('aria-label','Close information card');
 const icon=document.createElement('div');icon.className='inspect-icon';icon.setAttribute('aria-hidden','true');const title=document.createElement('h2'),text=document.createElement('p');[icon,title,text,close].forEach(el=>card.appendChild(el));const trim=document.createElement('span');trim.className='inspect-lights';trim.setAttribute('aria-hidden','true');trim.innerHTML='<i></i>'.repeat(5);card.appendChild(trim);layer.appendChild(card);
 let selected=-1,closeTimer:ReturnType<typeof setTimeout>|undefined;
 const dismiss=()=>{const old=selected;selected=-1;card.classList.remove('is-open');markers.forEach(b=>b.setAttribute('aria-expanded','false'));closeTimer=setTimeout(()=>card.hidden=true,200);if(old>=0)markers[old].focus({preventScroll:true});};close.onclick=dismiss;
 const key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&selected>=0){e.preventDefault();dismiss();}};document.addEventListener('keydown',key);
 const openers:((event:{isTrusted:boolean})=>void)[]=[];
 const markers=hotspots.map((item,i)=>{const button=document.createElement('button');button.type='button';button.className='world-hotspot';button.setAttribute('aria-label','Inspect '+item.label);button.setAttribute('aria-expanded','false');layer.appendChild(button);
 const open=(e:{isTrusted:boolean})=>{if(!e.isTrusted)return;void playPixelClick('sunny');clearTimeout(closeTimer);selected=i;card.hidden=false;card.classList.remove('is-open','completion-bounce');title.textContent=item.title;text.textContent=item.description;icon.innerHTML=`<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><path d="${item.icon}" fill="#c89a61" stroke="#47594e" stroke-width="1.5"/></svg>`;void card.offsetWidth;card.classList.add('is-open');markers.forEach((b,k)=>b.setAttribute('aria-expanded',String(k===i)));button.classList.remove('found-pulse');void button.offsetWidth;button.classList.add('found-pulse');
 if(!discovered.has(item.id)){discovered.add(item.id);try{localStorage.setItem('discoveredHotspots',JSON.stringify([...discovered]));}catch{}counter();if(discovered.size===hotspots.length){progress.classList.add('discovery-complete');card.classList.add('completion-bounce');clearTimeout(resetTimer);resetTimer=setTimeout(()=>{discovered.clear();try{localStorage.setItem('discoveredHotspots','[]');}catch{}progress.classList.remove('discovery-complete');counter();},1800);const stars=document.createElement('span');stars.className='discovery-stars';stars.setAttribute('aria-hidden','true');stars.innerHTML='<i></i>'.repeat(6);progress.appendChild(stars);setTimeout(()=>stars.remove(),1100);}}};button.onclick=open;openers.push(open);return button;});
 const ray=new T.Raycaster(),world=new T.Vector3(),projected=new T.Vector3(),cameraPosition=new T.Vector3();
 const occluders:T.Object3D[]=[];root.traverse(o=>{if(o instanceof T.Mesh&&!(o instanceof T.InstancedMesh)){const m=o.material as T.Material;if(!Array.isArray(m)&&!m.transparent)occluders.push(o);}});

 const canvas=host.querySelector('canvas')!;
 const pickRay=new T.Raycaster();
 const activePointers=new Set<number>();let start:{x:number,y:number,id:number}|undefined,dragged=false;
 const pick=(e:PointerEvent)=>{const r=canvas.getBoundingClientRect();pickRay.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
 root.updateMatrixWorld(true);
 const hits=pickRay.intersectObjects(occluders,false);
 for(const hit of hits){let o:T.Object3D|null=hit.object,id:string|undefined,shown=true;while(o){if(!o.visible)shown=false;if(o.userData.inspectId)id=o.userData.inspectId;o=o.parent;}if(!shown)continue;return id?hotspots.findIndex(h=>h.id===id):-1;}return -1;};
 const down=(e:PointerEvent)=>{activePointers.add(e.pointerId);if(activePointers.size>1){dragged=true;return;}if(e.button!==0)return;start={x:e.clientX,y:e.clientY,id:e.pointerId};dragged=false;};
 const move=(e:PointerEvent)=>{if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>6)dragged=true;};
 const up=(e:PointerEvent)=>{const valid=start?.id===e.pointerId&&!dragged&&e.isTrusted;activePointers.delete(e.pointerId);start=undefined;if(valid){const i=pick(e);if(i>=0)openers[i](e);}};
 const cancel=()=>{start=undefined;dragged=true;activePointers.clear();};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('wheel',cancel,{passive:true});
 let lastOcclusion=-Infinity;const visible=hotspots.map(()=>true),positions=hotspots.map(()=>({x:0,y:0}));
 function update(now:number){const width=host.clientWidth,height=host.clientHeight;camera.getWorldPosition(cameraPosition);const check=now-lastOcclusion>140;if(check)lastOcclusion=now;
 hotspots.forEach((h,i)=>{const anchor=anchors[h.anchor]||root;world.set(h.position[0],h.position[1],h.position[2]);anchor.localToWorld(world);projected.copy(world).project(camera);const x=(projected.x*.5+.5)*width,y=(-projected.y*.5+.5)*height;positions[i]={x,y};
 if(check){const distance=cameraPosition.distanceTo(world);ray.set(cameraPosition,world.clone().sub(cameraPosition).normalize());ray.far=Math.max(0,distance-.12);visible[i]=!ray.intersectObjects(occluders,false).some(hit=>{let o:T.Object3D|null=hit.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});}
 const show=visible[i]&&projected.z>-1&&projected.z<1&&x>0&&x<width&&y>0&&y<height;markers[i].style.visibility=show?'visible':'hidden';markers[i].style.transform=`translate(${x-22}px,${y-22}px)`;});
 if(selected>=0){const p=positions[selected],cw=card.offsetWidth,ch=card.offsetHeight;const bounds=host.getBoundingClientRect();const obstacles=[...document.querySelectorAll('header,.time-controls,footer')].map(el=>el.getBoundingClientRect());let best={x:16,y:Math.max(16,height-ch-100)},score=Infinity;
 for(const [xx,yy] of [[p.x+25,p.y-ch/2],[p.x-cw-25,p.y-ch/2],[p.x-cw/2,p.y+28],[p.x-cw/2,p.y-ch-28]]){const x=Math.max(16,Math.min(width-cw-16,xx)),y=Math.max(16,Math.min(height-ch-16,yy));const overlap=obstacles.reduce((n,r)=>n+Math.max(0,Math.min(x+cw,r.right-bounds.left)-Math.max(x,r.left-bounds.left))*Math.max(0,Math.min(y+ch,r.bottom-bounds.top)-Math.max(y,r.top-bounds.top)),0);if(overlap<score){score=overlap;best={x,y};}}
 card.style.left=best.x+'px';card.style.top=best.y+'px';}
 }
 return{update,dispose(){canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',cancel);canvas.removeEventListener('wheel',cancel);clearTimeout(closeTimer);clearTimeout(resetTimer);document.removeEventListener('keydown',key);layer.remove();progress.remove();}};
}
