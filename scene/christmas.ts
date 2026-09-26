import { createExploration } from './exploration';
import { streetHeight } from './ground';
import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type Weather = 'sunny' | 'cloudy' | 'snowy';
export function createChristmasShop(host: HTMLElement, onDiscovery?:(ids:string[])=>void) {
  const scene = new T.Scene();
  scene.background = new T.Color('#cbbeb0');
  const renderer = new T.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', 'Christmas shop 3D model. Drag to rotate; scroll or pinch to zoom.');
  renderer.domElement.tabIndex = 0;
  const camera = new T.PerspectiveCamera(36, 1, .1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 10;
  controls.maxDistance = 27;
  controls.minPolarAngle = .25;
  controls.maxPolarAngle = Math.PI / 2.08;
  controls.target.set(0, 2.2, 0);
  const reset = () => { camera.position.set(0, 7.2, 26); controls.target.set(0, 2.7, .8); controls.update(); };
  reset();
  const ambient=new T.HemisphereLight('#f3faff', '#8b8b94', 2.8); scene.add(ambient);
  const nightLights: T.PointLight[]=[];
  const luminousSigns: T.MeshStandardMaterial[]=[];
  const sun = new T.DirectionalLight('#ffe1b5', 4);
  sun.position.set(-5, 10, 7); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left:-9, right:9, top:10, bottom:-8, near:.5, far:30 });
  sun.shadow.normalBias = .035; sun.shadow.bias = -.0002;
  scene.add(sun);
  const fill = new T.DirectionalLight('#dbeaff', 1.2); fill.position.set(5, 6, -5); scene.add(fill);
  const materials: T.Material[] = [];
  const mat = (color: string, extra: T.MeshStandardMaterialParameters = {}) => {
    const m = new T.MeshStandardMaterial({ color, roughness:.82, ...extra }); materials.push(m); return m;
  };
  const snow=mat('#fff9e9'), wood=mat('#815036'), trim=mat('#a56b3b'), darkwood=mat('#523b2d');
  const wall=mat('#c99869'), stone=mat('#a7998c'), roof=mat('#304d4b'), roof2=mat('#3b5853');
  const green=mat('#255340'), red=mat('#b93535'), gold=mat('#e2b55e',{metalness:.4,roughness:.4});
  const cream=mat('#ffe8b9'), trunk=mat('#69432e'), ginger=mat('#c17c3f'), icing=mat('#fff0d2');
  const glow=mat('#ffd386',{emissive:'#ffad3e',emissiveIntensity:1.1});
  const glass=mat('#c7e8dd',{transparent:true,opacity:.24,roughness:.1,metalness:.35,depthWrite:false,emissive:'#ffba62',emissiveIntensity:0});
  const root = new T.Group(); scene.add(root);
  const windObjects:{object:T.Object3D,strength:number,phase:number}[]=[];
  function mesh(geo:T.BufferGeometry, material:T.Material, x:number,y:number,z:number,parent:T.Object3D=root) {
    const o=new T.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
  }
  const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material,parent:T.Object3D=root)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent);
  const ball=(r:number,x:number,y:number,z:number,m:T.Material,parent:T.Object3D=root)=>mesh(new T.IcosahedronGeometry(r,1),m,x,y,z,parent);
  function beam(a:T.Vector3,b:T.Vector3,width:number,m:T.Material,parent:T.Object3D=root) {
    const o=mesh(new T.CylinderGeometry(width,width,a.distanceTo(b),6),m,0,0,0,parent);
    o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());return o;
  }
  const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
  let seed=24;
  const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function textSign(text:string,w:number,h:number,x:number,y:number,z:number,bg='#21443c',size=58,lit=false) {
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.round(1024*h/w);
    const ctx=canvas.getContext('2d')!;
    ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='#dfb46d';ctx.lineWidth=6;ctx.strokeRect(14,14,canvas.width-28,canvas.height-28);
    ctx.fillStyle='#ffdfa2';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=lit?`${size}px "Shop Display", Georgia, serif`:`italic ${size}px Georgia, serif`;
    const lines=text.split('\n');
    lines.forEach((line,i)=>ctx.fillText(line,512,canvas.height/2+(i-(lines.length-1)/2)*size*1.3,950));
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    if(lit)document.fonts.load(size+'px "Shop Display"').then(()=>{
      if(stopped)return;
      ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle='#dfb46d';ctx.lineWidth=6;ctx.strokeRect(14,14,canvas.width-28,canvas.height-28);
      ctx.fillStyle='#ffdfa2';ctx.font=size+'px "Shop Display", Georgia, serif';
      lines.forEach((line,i)=>ctx.fillText(line,512,canvas.height/2+(i-(lines.length-1)/2)*size*1.3,950));texture.needsUpdate=true;
    }).catch(()=>{});
    const m=new T.MeshStandardMaterial({map:texture,roughness:.8});materials.push(m);
    if(lit){m.emissiveMap=texture;m.emissive.set('#fff0ca');m.emissiveIntensity=0;luminousSigns.push(m);}
    const o=mesh(new T.PlaneGeometry(w,h),m,x,y,z);return o;
  }
  // A square, hand-built miniature plinth with individual curb stones.
  box(10.4,.3,10.4,0,-.17,.8,stone);
  box(10.2,.14,10.2,0,.04,.8,snow);
  for(let i=0;i<22;i++){
    const x=-4.94+i*.47;
    for(const z of [-4.35,5.95])box(.44,.26,.27,x,-.04,z,stone);
  }
  for(let i=0;i<22;i++)for(const x of [-5.1,5.1])box(.27,.26,.43,x,-.04,-4.14+i*.47,stone);
  const floor=mat('#c8b8a5');box(200,.1,200,0,-.4,0,floor).castShadow=false;
  for(let i=0;i<55;i++){
    const x=-4.85+rnd()*9.7,z=-3.85+rnd()*9.3;
    if(z>2 || Math.abs(x)>3) box(.25+rnd()*.4,.035,.2+rnd()*.2,x,.13,z,rnd()>.55?snow:stone);
  }
  const shopPartsStart=root.children.length;
  // Ground floor: separate wall sections preserve real window openings.
  box(5.1,.32,3.65,0,.3,-.55,darkwood);
  box(5.1,2.8,.18,0,1.84,-2.35,wall);
  box(.18,2.8,3.55,-2.46,1.84,-.55,wall);
  box(.18,2.8,3.55,2.46,1.84,-.55,wall);
  box(3.2,.42,.18,-.95,.62,1.22,wall);
  box(5.1,.38,.22,0,3.08,1.22,wall);
  [-2.45,.75,2.45].forEach(x=>box(.24,2.8,.3,x,1.84,1.23,wood));
  for(let y=.85;y<3.1;y+=.38){box(5,.025,.025,0,y,-2.46,trim);box(.035,.025,3.55,-2.57,y,-.55,trim);box(.035,.025,3.55,2.57,y,-.55,trim);}
  for(const x of [-2.5,2.5])for(const z of [-2.35,1.25])box(.25,3,.26,x,1.8,z,wood);
  box(5.4,.25,3.95,0,3.2,-.55,wood);
  // Visible interior shelves and tiny merchandise behind clear glazing.
  box(4.7,.07,3.35,0,.48,-.5,trim);
  box(4.7,2.2,.04,0,1.65,-2.22,cream);
  for(const y of [.88,1.48,2.08,2.68]){
    box(4.35,.08,.45,0,y,-1.94,wood);
    for(let i=0;i<11;i++){
      const x=-1.95+i*.39;
      if((i+Math.round(y*10))%3===0){mesh(new T.ConeGeometry(.11,.27,7),green,x,y+.19,-1.93);}
      else{box(.15,.17+rnd()*.14,.16,x,y+.16,-1.92,[red,gold,green,ginger][i%4]);ball(.065,x,y+.32,-1.92,gold);}
    }
  }
  const inside = new T.PointLight('#ffb64f', 28, 6, 2); inside.position.set(-.5,2.5,.4);root.add(inside);
  const pane=box(2.97,1.99,.035,-.88,1.88,1.285,glass);pane.castShadow=false;pane.renderOrder=3;
  // Thin reflection streaks make the transparent pane readable from any angle.
  const reflection=mat('#e6f6ff',{transparent:true,opacity:.25,depthWrite:false,side:T.DoubleSide});
  for(const x of [-1.85,-.38]){
    const streak=mesh(new T.PlaneGeometry(.055,1.27),reflection,x,1.87,1.315);streak.rotation.z=-.27;streak.castShadow=false;streak.renderOrder=4;
    const short=mesh(new T.PlaneGeometry(.025,.65),reflection,x+.16,1.95,1.317);short.rotation.z=-.27;short.castShadow=false;short.renderOrder=4;
  }
  const windowSpill=new T.PointLight('#ffbb65',0,4,2);windowSpill.position.set(-.8,1.7,1.65);root.add(windowSpill);
  for(const x of [-2.4,-.91,.65])box(.075,2.07,.16,x,1.88,1.32,trim);
  for(const y of [.84,2.92])box(3.12,.09,.25,-.9,y,1.32,trim);
  box(3.13,.1,.15,-.9,2.52,1.34,trim);
  // Hinged door: all visible panels, glazing, handle and wreath move together.
  const doorStart=root.children.length;
  box(1.37,2.48,.13,1.6,1.65,1.23,green);
  box(1.04,1.21,.035,1.6,2.05,1.31,glow);
  box(1.04,1.21,.02,1.6,2.05,1.34,glass).castShadow=false;
  for(const x of [1.04,1.6,2.16])box(.055,1.3,.08,x,2.05,1.39,trim);
  box(1.18,.055,.08,1.6,2.12,1.39,trim);
  for(const x of [1.31,1.88]){box(.44,.64,.055,x,.9,1.32,trim);box(.35,.54,.07,x,.9,1.36,green);}
  ball(.065,2.13,1.35,1.43,gold);
  const doorParts=root.children.slice(doorStart);const doorHinge=new T.Group();doorHinge.position.set(.915,0,1.23);root.add(doorHinge);doorParts.forEach(o=>{o.position.sub(doorHinge.position);doorHinge.add(o);});
  for(let i=0;i<3;i++)box(2.45-i*.13,.15,.9-i*.19,1.52,.14+i*.15,2.0-i*.16,stone);
  for(let i=0;i<3;i++)box(2.44-i*.13,.035,.17,1.52,.23+i*.15,2.43-i*.255,snow);
  // Upper story, gable, dark green tiled roof and irregular snow caps.
  box(5,1.02,3.6,0,3.77,-.55,wall);
  const gable=new T.Shape();gable.moveTo(-2.5,0);gable.lineTo(2.5,0);gable.lineTo(0,1.9);gable.closePath();
  const gableGeo=new T.ExtrudeGeometry(gable,{depth:3.6,bevelEnabled:false});
  mesh(gableGeo,wall,0,4.27,-2.35);
  const pitch=Math.atan2(1.9,2.5), roofLength=Math.sqrt(2.5**2+1.9**2)+.4;
  // Thick curved tiles: a faceted arch profile with a closed underside.
  function curvedTile(width:number,length:number){
    const profile=new T.Shape();
    for(let i=0;i<=8;i++){const a=Math.PI-i*Math.PI/8,x=Math.cos(a)*width/2,y=.06+Math.sin(a)*.115;i?profile.lineTo(x,y):profile.moveTo(x,y);}
    for(let i=8;i>=0;i--){const a=Math.PI-i*Math.PI/8;profile.lineTo(Math.cos(a)*width/2,.015+Math.sin(a)*.115);}profile.closePath();
    const geo=new T.ExtrudeGeometry(profile,{depth:length,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:1,steps:1});geo.rotateY(Math.PI/2);geo.translate(-length/2,0,0);return geo;
  }
  const tileGeo=curvedTile(.445,.56),tileLipGeo=curvedTile(.456,.045);
  const tileLight=mat('#4d6e62'),tileLip=mat('#547366');
  const roofBlankets:T.Mesh[]=[];
  for(const side of [-1,1]){
    const slope=new T.Group();slope.position.set(side*1.31,5.2,-.55);slope.rotation.z=-side*pitch;root.add(slope);
    box(roofLength,.16,4.12,0,0,0,roof,slope);
    roofBlankets.push(box(roofLength+.06,.19,4.18,0,.4,0,snow,slope));
    for(let row=0;row<7;row++)for(let col=0;col<9;col++){
      const x=-roofLength/2+.27+row*.49,z=-1.82+col*.455;
      const tile=mesh(tileGeo,[roof,roof2,tileLight][(row+col*2)%3],x,.115,z,slope);
      tile.rotation.z=side*.075;
      mesh(tileLipGeo,tileLip,x+side*.245,.14,z,slope).rotation.z=side*.075;
      if(row===0||row===6||col===0||col===8||rnd()>.88){
        const cap=box(.38,.075+rnd()*.055,.34,x,.305,z,snow,slope);cap.rotation.z=side*.075;
      }
    }
    box(roofLength+.13,.19,.18,0,.04,2.07,trim,slope);
    box(roofLength+.13,.19,.18,0,.04,-2.07,trim,slope);
  }
  box(.22,.2,4.22,0,6.22,-.55,wood);
  const ridgeGeo=curvedTile(.43,.37);ridgeGeo.rotateY(Math.PI/2);
  for(let i=0;i<12;i++)mesh(ridgeGeo,i%3?roof2:tileLight,0,6.3,-2.49+i*.36);
  for(let i=0;i<12;i++)box(.3,.16,.33,0,6.39,-2.49+i*.36,snow);
  box(.16,1.84,.19,0,5.13,1.36,wood);
  box(4.95,.17,.22,0,4.29,1.35,wood);
  beam(v(-2.43,4.3,1.36),v(0,6.15,1.36),.095,trim);
  beam(v(2.43,4.3,1.36),v(0,6.15,1.36),.095,trim);
  // Sparse raised clay bricks keep the original plaster and timber visible.
  const clay=[mat('#b98775'),mat('#c59680'),mat('#af7c69')];
  function brick(w:number,h:number,d:number,x:number,y:number,z:number,index:number){
    const shape=new T.Shape();shape.moveTo(-w/2,-h/2);shape.lineTo(w/2,-h/2);shape.lineTo(w/2,h/2);shape.lineTo(-w/2,h/2);shape.closePath();
    const geo=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSize:.02,bevelThickness:.015,bevelSegments:1,steps:1});return mesh(geo,clay[index%3],x,y,z);
  }
  // Side wall clusters, offset to form short broken courses.
  for(const side of [-1,1]){
    const clusters=[[-1.8,1.05],[-.45,2.45],[.62,1.48],[-1.45,3.66],[.5,3.78]];
    clusters.forEach(([z,y],i)=>{
      for(let j=0;j<3;j++){
        const b=brick(.38+j%2*.12,.19,.065,side*2.58,y+Math.floor(j/2)*.24,z+(j%2)*.48-.2,i+j);b.rotation.y=side*Math.PI/2;
      }
    });
  }
  for(const [x,y] of [[-1.92,1.05],[-.45,1.72],[1.6,2.55],[-1.5,3.72],[.75,3.66],[0,4.65]]){
    for(let j=0;j<3;j++){const b=brick(.42,.2,.07,x+(j%2)*.47,y+Math.floor(j/2)*.24,-2.47,j);b.rotation.y=Math.PI;}
  }
  // Front accents stay clear of glazing, door and shop signs.
  for(const [x,y] of [[-1.52,4.52],[1.38,4.55],[-.46,5.35],[.38,5.32]])brick(.35,.17,.055,x,y,1.255,Math.round(y));
  // Chimney brickwork.
  box(.72,1.8,.7,-1.53,5.75,-1.55,wall);
  for(let r=0;r<6;r++)for(let c=0;c<2;c++){
    box(.33,.24,.025,-1.71+c*.36,5.04+r*.27,-1.18,r%2?trim:stone);
  }
  box(.9,.22,.87,-1.53,6.65,-1.55,wood);box(.97,.15,.93,-1.53,6.82,-1.55,snow);
  box(.45,.03,.4,-1.53,6.91,-1.55,darkwood);
  // Main sign and red/cream striped awning.
  box(4.48,.84,.16,-.1,3.72,1.47,trim);
  textSign('La Maison de Noël',4.24,.64,-.1,3.72,1.56,'#234a3d',82,true);
  for(let i=0;i<12;i++){
    const x=-2.47+(i+.5)*.411;
    const awning=box(.41,.065,1.17,x,2.98,1.89,i%2?cream:red);awning.rotation.x=.24;
    box(.409,.24,.065,x,2.72,2.45,i%2?cream:red);
    const scallop=mesh(new T.CylinderGeometry(.204,.204,.065,12,1,false,0,Math.PI),i%2?cream:red,x,2.6,2.45);
    scallop.rotation.x=Math.PI/2;scallop.rotation.z=Math.PI;
  }
  function bow(x:number,y:number,z:number,scale=1,parent:T.Object3D=root){
    const l=ball(.14*scale,x-.12*scale,y,z,red,parent);l.scale.set(1,.68,.4);l.rotation.z=-.3;
    const r=ball(.14*scale,x+.12*scale,y,z,red,parent);r.scale.set(1,.68,.4);r.rotation.z=.3;
    ball(.065*scale,x,y,z+.035,red,parent);
    for(const side of [-1,1]){const ribbon=box(.085*scale,.29*scale,.045,x+side*.07*scale,y-.18*scale,z,red,parent);ribbon.rotation.z=side*.22;}
  }
  function wreath(x:number,y:number,z:number,r=.35){
    const first=root.children.length;
    for(let i=0;i<18;i++){const a=i*Math.PI*2/18;ball(.11,x+Math.cos(a)*r,y+Math.sin(a)*r,z,green);if(i%3===0)ball(.042,x+Math.cos(a)*r,y+Math.sin(a)*r,z+.1,red);}
    bow(x,y+r,z+.11,.8);
    const parts=root.children.slice(first);const pivot=new T.Group();pivot.position.set(x,y+r,z);root.add(pivot);parts.forEach(o=>{o.position.sub(pivot.position);pivot.add(o);});windObjects.push({object:pivot,strength:.045,phase:x*2});
  }
  wreath(1.6,2.08,1.52,.36);
  const doorWreath=root.children[root.children.length-1];doorWreath.position.sub(doorHinge.position);doorHinge.add(doorWreath);
  for(let i=0;i<29;i++){
    const x=-2.38+i*.167,y=4.16+Math.sin(i*.45)*.045;
    ball(.14,x,y,1.56,green);
    if(i%3===0){ball(.045,x,y,1.71,glow);ball(.045,x+.065,y+.05,1.7,red);}
  }
  bow(-2.08,4.16,1.72,1);bow(1.92,4.16,1.72,1);
  root.children.slice(shopPartsStart).forEach(o=>o.userData.inspectId='shop');
  // Low-poly firs with snowy boughs, ornaments and a little star.
  function tree(x:number,z:number,s:number,y=.15){
    const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(s);root.add(g);if(y<.2)windObjects.push({object:g,strength:.02,phase:x});
    mesh(new T.CylinderGeometry(.12,.16,.62,8),trunk,0,.3,0,g);
    for(let j=0;j<4;j++){
      const r=.77-j*.16,cy=.77+j*.47;
      mesh(new T.ConeGeometry(r,1.15,9),green,0,cy,0,g);
      mesh(new T.ConeGeometry(r*.77,.61,9),snow,0,cy+.28,0,g);
      for(let k=0;k<6;k++){const a=k*Math.PI/3+j*.4;ball(.065,Math.cos(a)*r*.72,cy-.13,Math.sin(a)*r*.72,k%2?gold:red,g);}
    }
    const star=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,r=i%2?.1:.23;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)star.moveTo(x,y);else star.lineTo(x,y);}star.closePath();
    mesh(new T.ExtrudeGeometry(star,{depth:.065,bevelEnabled:false}),gold,0,2.69,0,g);
  }
  tree(-3.72,.15,1.68);tree(3.4,-.65,.9);tree(3.44,2.35,.48);
  tree(-1.68,.48,.55,.5);
  function gift(x:number,y:number,z:number,s:number,m:T.Material){
    box(s,s*.8,s,x,y+s*.4,z,m);box(s*.14,s*.82,s*1.02,x,y+s*.4,z,gold);box(s*1.02,.035,s*.13,x,y+s*.8,z,gold);bow(x,y+s*.9,z+s*.15,s*.6);
  }
  gift(-1.9,.5,.83,.42,red);gift(-1.34,.5,.84,.34,green);gift(-.78,.5,.77,.46,red);
  gift(1.05,.57,1.77,.42,red);gift(3.24,.15,2.94,.48,green);gift(-3.5,.15,2.49,.5,red);
  // Gingerbread cutout with icing outline and face, deliberately static.
  function gingerbread(x:number,y:number,z:number,s:number){
    const group=new T.Group();group.position.set(x,y,z);group.scale.setScalar(s);root.add(group);
    const shape=new T.Shape();
    shape.moveTo(-.2,.59);shape.bezierCurveTo(-.65,1.1,.65,1.1,.2,.59);
    shape.lineTo(.43,.54);shape.bezierCurveTo(.75,.61,.78,.3,.52,.25);shape.lineTo(.26,.29);
    shape.lineTo(.37,-.13);shape.bezierCurveTo(.55,-.5,.2,-.59,.06,-.26);shape.lineTo(0,-.13);
    shape.lineTo(-.06,-.26);shape.bezierCurveTo(-.2,-.59,-.55,-.5,-.37,-.13);shape.lineTo(-.26,.29);
    shape.lineTo(-.52,.25);shape.bezierCurveTo(-.78,.3,-.75,.61,-.43,.54);shape.closePath();
    mesh(new T.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.035,bevelThickness:.025}),ginger,0,0,0,group);
    const pts=shape.getPoints(80).map(p=>new T.Vector3(p.x*.91,p.y*.95,.17));
    const curve=new T.CatmullRomCurve3(pts,true);mesh(new T.TubeGeometry(curve,110,.016,5,true),icing,0,0,0,group);
    for(const dx of [-.11,.11])ball(.032,dx,.75,.185,icing,group);
    const smile=[];for(let i=0;i<=12;i++){const a=Math.PI+i*Math.PI/12;smile.push(v(Math.cos(a)*.11,.65+Math.sin(a)*.09,.185));}
    mesh(new T.TubeGeometry(new T.CatmullRomCurve3(smile),16,.016,5,false),icing,0,0,0,group);
    bow(0,.42,.19,.65,group);for(const yy of [.19,.03])ball(.034,0,yy,.19,red,group);return group;
  }
  const streetCookie=gingerbread(3.96,.6,2.78,.581);streetCookie.rotation.set(-.12,0,-.04);streetCookie.updateMatrixWorld(true);streetCookie.position.y+=.13-new T.Box3().setFromObject(streetCookie).min.y;gingerbread(0,4.58,1.47,.59);
  // Lanterns, hanging sign, mailbox, fence and a small pavement sign.
  function lantern(x:number,y:number,z:number,s=1){
    const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(s);root.add(g);
    box(.28,.4,.28,0,0,0,glow,g);
    for(const dx of [-.17,.17])for(const dz of [-.17,.17])box(.04,.49,.04,dx,0,dz,darkwood,g);
    box(.42,.07,.42,0,-.26,0,darkwood,g);
    mesh(new T.ConeGeometry(.33,.23,4),darkwood,0,.35,0,g).rotation.y=Math.PI/4;
    ball(.055,0,.51,0,gold,g);
    const light=new T.PointLight('#ffbd72',4,5.5,2);light.position.set(x,y,z+.2);root.add(light);nightLights.push(light);
  }
  lantern(-2.6,2.15,1.65,.8);lantern(2.61,2.15,1.65,.8);
  box(.18,3.25,.18,3.96,1.77,2.56,darkwood);box(.42,.18,.42,3.96,.21,2.56,darkwood);
  lantern(3.96,3.58,2.56,1.1);wreath(3.96,2.72,2.7,.22);
  // Low festive street lamps frame the pavement without blocking the shop.
  for(const x of [-4.25,4.25]){
    box(.32,.16,.32,x,.17,4.55,darkwood);
    box(.12,1.58,.12,x,.98,4.55,green);
    for(let i=0;i<5;i++)box(.135,.075,.135,x,.4+i*.27,4.55,red);
    lantern(x,1.98,4.55,.9);wreath(x,1.45,4.67,.17);
    const pavementLight=nightLights[nightLights.length-1];pavementLight.distance=7;pavementLight.userData.street=true;
  }
  beam(v(2.56,3.65,1),v(3.62,3.65,1),.055,darkwood);
  beam(v(2.57,3.15,1),v(3.4,3.65,1),.045,darkwood);
  for(const x of [3.02,3.52])beam(v(x,3.65,1),v(x,3.24,1),.018,darkwood);
  const signPivot=new T.Group();signPivot.position.set(3.27,3.65,1);root.add(signPivot);
  const signBoard=box(.9,.88,.12,3.27,2.99,1,trim),signFace=textSign('Merry\nChristmas',.79,.76,3.27,2.99,1.07,'#892e2c',150,true);
  [signBoard,signFace].forEach(o=>{o.position.sub(signPivot.position);signPivot.add(o);});windObjects.push({object:signPivot,strength:.06,phase:1.3});
  for(let i=0;i<8;i++)box(.1,.68,.12,-4.03+i*.37,.5,2.88,wood);
  box(2.83,.12,.15,-2.74,.83,2.88,trim);box(2.86,.065,.19,-2.74,.93,2.88,snow);
  for(let i=0;i<18;i++)ball(.095,-4.05+i*.15,.75,2.99,green);
  bow(-3.52,.77,3.08,.8);
  const postPartsStart=root.children.length;
  box(.12,.95,.12,-3.18,.57,3.25,wood);box(.64,.77,.45,-3.18,1.17,3.25,red);
  mesh(new T.CylinderGeometry(.32,.32,.46,12,1,false,0,Math.PI),red,-3.18,1.55,3.25).rotation.x=Math.PI/2;
  box(.39,.065,.025,-3.18,1.34,3.49,darkwood);textSign('POST',.43,.23,-3.18,1.08,3.485,'#ae3031',110);
  root.children.slice(postPartsStart).forEach(o=>o.userData.inspectId='postbox');
  // A friendly scarf-wearing snowman replaces the pavement sign.
  // Keep the center and right forecourt clear for future characters.
  const snowman=new T.Group();snowman.position.set(-.72,.13,3.13);root.add(snowman);
  ball(.47,0,.44,0,snow,snowman);
  ball(.35,0,1.04,0,snow,snowman);
  // Ribbed red wool hat with a folded brim and pom-pom.
  const wool=mat('#c53943');
  const cap=ball(.32,0,1.37,0,wool,snowman);cap.scale.set(1,1.05,1);
  const brim=mesh(new T.TorusGeometry(.29,.075,6,20),red,0,1.29,0,snowman);brim.rotation.x=Math.PI/2;
  for(let i=0;i<24;i++){
    const a=i*Math.PI*2/24;
    beam(v(Math.cos(a)*.338,1.255,Math.sin(a)*.338),v(Math.cos(a)*.338,1.335,Math.sin(a)*.338),.013,wool,snowman);
  }
  ball(.12,.035,1.72,0,red,snowman);
  const scarf=mesh(new T.TorusGeometry(.285,.085,5,14),red,0,.83,0,snowman);
  scarf.rotation.x=Math.PI/2;
  for(const x of [-.115,.115])ball(.034,x,1.12,.31,darkwood,snowman);
  const carrot=mesh(new T.ConeGeometry(.064,.25,7),mat('#e68c35'),0,1.02,.42,snowman);
  carrot.rotation.x=Math.PI/2;
  for(let i=0;i<5;i++){
    const a=Math.PI+i*Math.PI/4;
    ball(.018,Math.cos(a)*.12,.99+Math.sin(a)*.075,.327,darkwood,snowman);
  }
  for(const y of [.51,.32])ball(.037,0,y,.45,darkwood,snowman);
  ball(.037,0,.70,.385,darkwood,snowman);
  for(const side of [-1,1]){
    beam(v(side*.34,.65,0),v(side*.66,.91,.02),.028,wood,snowman);
    beam(v(side*.58,.84,.02),v(side*.61,1.03,.02),.02,wood,snowman);
  }
  // Warm bulbs follow both gables and wrap all four walls.
  const bulbMaterial=mat('#f7d796',{emissive:'#ffd58a',emissiveIntensity:0,roughness:.35});
  const decorativeLights:T.PointLight[]=[];
  function lightString(points:T.Vector3[],count:number){
    const curve=new T.CatmullRomCurve3(points);
    mesh(new T.TubeGeometry(curve,60,.014,5,false),darkwood,0,0,0);
    for(let i=0;i<=count;i++){
      const p=curve.getPoint(i/count);
      mesh(new T.CylinderGeometry(.033,.033,.065,6),darkwood,p.x,p.y-.04,p.z);
      const bulb=ball(.068,p.x,p.y-.115,p.z,bulbMaterial);bulb.scale.y=1.25;bulb.castShadow=false;
    }
  }
  for(const z of [1.61,-2.78]){
    lightString([v(-2.62,4.22,z),v(-1.3,5.18,z),v(0,6.15,z)],13);
    lightString([v(0,6.15,z),v(1.3,5.18,z),v(2.62,4.22,z)],13);
  }
  for(const x of [-2.72,2.72])lightString([v(x,4.18,-2.7),v(x,3.98,-.55),v(x,4.18,1.56)],18);
  // Two gentle swags around the back and sides replace the mural completely.
  for(const y of [3.08,2.25]){
    lightString([v(-2.63,y,-2.55),v(-1.3,y-.23,-2.55),v(0,y,-2.55),v(1.3,y-.23,-2.55),v(2.63,y,-2.55)],24);
    for(const x of [-2.63,2.63])lightString([v(x,y,-2.55),v(x,y-.25,-.6),v(x,y,1.25)],16);
  }
  for(const p of [v(-1.5,4.95,1.85),v(1.5,4.95,1.85),v(0,3,-2.95),v(-2.95,3,-.6),v(2.95,3,-.6)]){
    const light=new T.PointLight('#ffd08a',0,3.5,2);light.position.copy(p);root.add(light);decorativeLights.push(light);
  }
  // Soft scattered snow on the plinth, deterministic on every load.
  for(let i=0;i<65;i++){
    const x=-4.9+rnd()*9.8,z=-4+rnd()*9.7;
    if(x>-.15 && x<2.85 && z>2.65 && z<5.4)continue;
    if(Math.abs(x)<2.8 && z<2.8 && z> -2.7)continue;
    const flake=ball(.075+rnd()*.08,x,.16,z,snow);flake.scale.y=.45;
  }
  // Static reference-inspired reindeer. Local hoof bottoms are exactly y=0.
  const reindeer=new T.Group();reindeer.position.set(1.82,.041,5.12);reindeer.scale.setScalar(.78);reindeer.rotation.y=-.12;root.add(reindeer);
  const fur=mat('#aa7956'),furLight=mat('#bf906b'),creamFur=mat('#e4c59b');
  const hoof=mat('#543a2e'),antler=mat('#d7b38a'),scarfGreen=mat('#a84739'),scarfEdge=mat('#c0614c');
  const deerEye=mat('#30271f'),noseMat=mat('#593b2d',{roughness:.32});
  function deerOval(r:number,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:T.Material){const o=ball(r,x,y,z,m,reindeer);o.scale.set(sx,sy,sz);return o;}
  deerOval(.43,0,.77,0,.98,1.08,.84,fur);
  deerOval(.32,0,.74,.285,.91,.98,.34,creamFur);
  const deerArms:T.Group[]=[],deerLegs:T.Group[]=[];
  for(const side of [-1,1]){
    const legStart=reindeer.children.length;
    mesh(new T.CylinderGeometry(.12,.135,.36,8),fur,side*.165,.30,0,reindeer);
    mesh(new T.CylinderGeometry(.137,.145,.18,8),hoof,side*.165,.09,.018,reindeer);
    const legParts=reindeer.children.slice(legStart),leg=new T.Group();leg.position.set(side*.165,.48,0);reindeer.add(leg);legParts.forEach(o=>{o.position.sub(leg.position);leg.add(o);});deerLegs.push(leg);
    const armStart=reindeer.children.length;
    beam(v(side*.29,1.02,0),v(side*.48,.68,.04),.11,fur,reindeer);
    deerOval(.115,side*.48,.665,.04,1,.85,1,hoof);
    const armParts=reindeer.children.slice(armStart),arm=new T.Group();arm.position.set(side*.29,1.02,0);reindeer.add(arm);armParts.forEach(o=>{o.position.sub(arm.position);arm.add(o);});deerArms.push(arm);
  }
  const headStart=reindeer.children.length;
  deerOval(.54,0,1.58,0,1,1,.85,furLight);
  deerOval(.39,0,1.39,.32,1,.7,.48,creamFur);
  deerOval(.28,0,1.46,.51,1.12,.82,.67,noseMat);
  deerOval(.043,.105,1.54,.674,1.1,.35,.3,icing);
  for(const side of [-1,1]){
    deerOval(.046,side*.13,1.76,.423,.6,1.8,.5,deerEye);
    const ear=deerOval(.24,side*.58,1.68,-.005,1.58,.72,.7,fur);ear.rotation.z=side*.4;
    const inner=deerOval(.16,side*.62,1.675,.12,1.49,.61,.22,creamFur);inner.rotation.z=side*.4;
    // Chunky branched antlers, red ties, and dangling brass bells.
    beam(v(side*.31,1.98,-.03),v(side*.72,2.21,-.035),.095,antler,reindeer);
    beam(v(side*.63,2.17,-.035),v(side*.68,2.55,-.035),.09,antler,reindeer);
    beam(v(side*.7,2.21,-.035),v(side*.99,2.28,-.035),.085,antler,reindeer);
    ball(.09,side*.68,2.55,-.035,antler,reindeer);ball(.085,side*.99,2.28,-.035,antler,reindeer);
    const tie=mesh(new T.TorusGeometry(.098,.027,5,10),red,side*.82,2.24,-.035,reindeer);tie.rotation.y=Math.PI/2;
    for(const [x,y] of [[side*.85,2.2]]){
      beam(v(x,y,.02),v(x,y-.18,.02),.018,red,reindeer);
      ball(.105,x,y-.25,.02,gold,reindeer);
      box(.014,.075,.012,x,y-.29,.123,deerEye,reindeer);
      ball(.021,x,y-.25,.123,deerEye,reindeer);
    }
  }
  const headParts=reindeer.children.slice(headStart);
  // Small cream tail tip.
  const tail=deerOval(.20,0,.67,-.34,.65,1.1,.65,fur);tail.rotation.x=-.45;
  deerOval(.115,0,.71,-.46,.7,.9,.35,creamFur);
  const deerHead=new T.Group();deerHead.position.set(0,1.35,0);reindeer.add(deerHead);headParts.forEach(o=>{o.position.sub(deerHead.position);deerHead.add(o);});
  // One broad fabric loop: raised at the back, softly sagging over the chest.
  const plaidCanvas=document.createElement('canvas');plaidCanvas.width=plaidCanvas.height=128;
  const plaid=plaidCanvas.getContext('2d')!;plaid.fillStyle='#a6332c';plaid.fillRect(0,0,128,128);
  plaid.fillStyle='#315c4d';plaid.fillRect(35,0,32,128);plaid.fillRect(0,35,128,32);
  plaid.fillStyle='#243e35';plaid.fillRect(35,35,32,32);
  plaid.fillStyle='#c59f69';for(const k of [14,19,91,96]){plaid.fillRect(k,0,2,128);plaid.fillRect(0,k,128,2);}
  plaid.strokeStyle='#f5d5a51c';plaid.lineWidth=1;for(let k=-128;k<256;k+=5){plaid.beginPath();plaid.moveTo(k,0);plaid.lineTo(k+128,128);plaid.stroke();}
  const plaidMap=new T.CanvasTexture(plaidCanvas);plaidMap.colorSpace=T.SRGBColorSpace;plaidMap.wrapS=plaidMap.wrapT=T.RepeatWrapping;
  const scarfVertices:number[]=[],scarfIndices:number[]=[],scarfUV:number[]=[];
  for(let i=0;i<=28;i++){
    const a=i/28*Math.PI*2,front=Math.max(0,Math.sin(a)),fold=Math.sin(a*3+.4)*.012;
    const top=1.255-.07*front,bottom=1.04-.115*front+fold;
    for(const [rx,rz,y] of [[.43,.36,top],[.55,.47,bottom],[.52,.44,bottom+.012],[.40,.33,top-.012]]){scarfVertices.push(Math.cos(a)*rx,y,Math.sin(a)*rz+.015);scarfUV.push(i/28*3,(y-bottom)/.28);}
    if(i<28)for(let j=0;j<4;j++){if(j===1&&(i===4||i===5))continue;const u=i*4+j,w=i*4+(j+1)%4;scarfIndices.push(u,u+4,w,w,u+4,w+4);}
  }
  // Extend the collar's actual hem vertices into one sealed continuous scarf.
  // No overlapping collar/tail meshes, hidden caps, or intersecting seam.
  const drapeRows:number[][]=[];
  const torsoDepth=(x:number,y:number)=>{
    const surface=(cy:number,cz:number,rx:number,ry:number,rz:number)=>{const q=1-(x/rx)**2-((y-cy)/ry)**2;return q>0?cz+rz*Math.sqrt(q):-1;};
    return Math.max(surface(.77,0,.4214,.4644,.3612),surface(.74,.285,.2912,.3136,.1088));
  };
  for(let row=0;row<=20;row++){
    const t=row/20,ids:number[]=[];
    for(let col=0;col<3;col++)for(let face=0;face<2;face++){
      const base=(4+col)*4+1+face;
      if(row===0){ids.push(base);continue;}
      const x0=scarfVertices[base*3],y0=scarfVertices[base*3+1],z0=scarfVertices[base*3+2];
      const x=x0-.022*Math.sin(t*Math.PI),y=y0+(.53-y0)*t;
      const clear=torsoDepth(x,y)+.04;
      const z=Math.max(z0*(1-t)+.29*t,clear)+(face===0?.025:0);
      ids.push(scarfVertices.length/3);scarfVertices.push(x,y,z);scarfUV.push(col/2,1-t*1.7);
    }
    drapeRows.push(ids);
    if(row>0){const prev=drapeRows[row-1];
      for(let col=0;col<2;col++)for(let face=0;face<2;face++){const k=col*2+face;scarfIndices.push(prev[k],ids[k],prev[k+2],prev[k+2],ids[k],ids[k+2]);}
      for(const k of [0,4])scarfIndices.push(prev[k],prev[k+1],ids[k],prev[k+1],ids[k+1],ids[k]);
    }
  }
  const last=drapeRows[20];for(let col=0;col<2;col++){const k=col*2;scarfIndices.push(last[k],last[k+1],last[k+2],last[k+1],last[k+3],last[k+2]);}
  const scarfGeometry=new T.BufferGeometry();scarfGeometry.setAttribute('position',new T.Float32BufferAttribute(scarfVertices,3));scarfGeometry.setAttribute('uv',new T.Float32BufferAttribute(scarfUV,2));scarfGeometry.setIndex(scarfIndices);scarfGeometry.computeVertexNormals();
  const scarfFabric=mat('#ffffff',{map:plaidMap,roughness:1,side:T.DoubleSide});mesh(scarfGeometry,scarfFabric,0,0,0,reindeer);
  for(let i=0;i<5;i++){const x=.125+i*.05,z=Math.max(.29,torsoDepth(x,.53)+.04)+.012;beam(v(x,.53,z),v(x+.005,.46,z-.006),.009,scarfEdge,reindeer);}
  // Fixed shoulder sockets overlap the torso and the rotating upper arms.
  for(const side of [-1,1])deerOval(.14,side*.29,1.02,0,1,1,1,fur);
  const speech=document.createElement('div');speech.className='deer-dialogue';speech.setAttribute('role','status');speech.setAttribute('aria-live','polite');speech.setAttribute('aria-hidden','true');
  const speechText=document.createElement('p');speechText.lang='en';speechText.textContent='If you catch a falling maple leaf, your first love will come true.';speech.appendChild(speechText); const ornaments=document.createElement('div');ornaments.className='dialogue-ornaments';ornaments.setAttribute('aria-hidden','true');ornaments.innerHTML='<span class=dialogue-lights><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span class=candy-cane></span><svg class=dialogue-cookie viewBox="0 0 64 80"><path d="M23 25 C8 20 3 26 7 33 L20 40 L13 63 Q10 75 20 73 L32 56 L44 73 Q54 75 51 63 L44 40 L57 33 Q64 22 42 25 A15 15 0 1 0 23 25Z" fill="#bd824b" stroke="#fff0cc" stroke-width="3"/><g fill="#fff0cc"><circle cx="27" cy="13" r="2"/><circle cx="37" cy="13" r="2"/></g><path d="M27 20 Q32 24 37 20" fill="none" stroke="#fff0cc" stroke-width="2"/><path d="M32 31 L23 27 L23 36Z M32 31 L41 27 L41 36Z" fill="#b9463d"/><g fill="#537856"><circle cx="32" cy="40" r="2.5"/><circle cx="32" cy="48" r="2.5"/></g></svg>';speech.appendChild(ornaments);host.parentElement!.appendChild(speech);
  // New cycle: begin inside, walk out, greet, speak, then return to the window.
  const home=v(1.82,.041,5.12),threshold=v(1.78,.515,1.7),insideDoor=v(1.78,.515,.42),windowSpot=v(-.45,.515,.48);
  const pointer=new T.Vector2(0,0);
  function trackPointer(e:PointerEvent){const rect=renderer.domElement.getBoundingClientRect();pointer.set(T.MathUtils.clamp((e.clientX-rect.left)/rect.width*2-1,-1,1),T.MathUtils.clamp((e.clientY-rect.top)/rect.height*2-1,-1,1));}
  renderer.domElement.addEventListener('pointermove',trackPointer);renderer.domElement.addEventListener('pointerdown',trackPointer);
  reindeer.position.copy(windowSpot);reindeer.rotation.y=0;
  const stages=[['door',1.8],['openInside',1],['exit',2],['closeOutside',.8],['return',3],['face',.7],['speak',10],['fade',.8],['turn',.8],['approach',3],['open',1],['enter',2],['closeInside',.8],['window',1.8],['look',5]] as const;
  let stageIndex=0,stageTime=0,wasActive=true;
  const angleTo=(a:number,b:number,t:number)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
  function plantHooves(walking:boolean,time:number){
    const scale=.78,sin=Math.sin(reindeer.rotation.y),cos=Math.cos(reindeer.rotation.y);
    const heights=deerLegs.map((leg,i)=>{
      leg.rotation.set(0,0,0);leg.position.z=walking?Math.sin(time*8+i*Math.PI)*.055:0;
      const lx=leg.position.x*scale,lz=(leg.position.z+.018)*scale;
      const x=reindeer.position.x+cos*lx+sin*lz,z=reindeer.position.z-sin*lx+cos*lz;
      // A sole may straddle a tread edge; support it on the highest contact.
      return Math.max(...[[0,0],[.075,0],[-.075,0],[0,.075],[0,-.075]].map(([dx,dz])=>streetHeight(x+dx,z+dz,snowAmount)));
    });
    reindeer.position.y=Math.min(...heights);
    deerLegs.forEach((leg,i)=>{leg.position.y=.48+(heights[i]-reindeer.position.y)/scale;});
  }
  const standingParts=reindeer.children.filter(o=>!deerLegs.includes(o as T.Group)).map(object=>({object,y:object.position.y}));
  let lastWeather:Weather='sunny',weatherClock=0,skyPause=0;
  const rainSpot=v(-1.95,0,1.7),pointA=v(.7,0,4.7),pointB=v(-2.4,0,4.7);
  const miniSnowmen:T.Group[]=[];
  for(const [x,z] of [[.05,4.6],[1.25,5.35],[-3,4.6],[-2.85,5.3]]){
    const g=new T.Group();g.position.set(x,.34,z);root.add(g);g.visible=false;
    ball(.2,0,.2,0,snow,g);ball(.14,0,.46,0,snow,g);
    for(const dx of [-.045,.045])ball(.017,dx,.49,.12,darkwood,g);
    ball(.028,0,.44,.145,ginger,g);ball(.025,0,.25,.18,red,g);miniSnowmen.push(g);
  }
  let approachRoute:T.Vector3[]=[];
  function animateReindeer(dt:number){
    standingParts.forEach(({object,y})=>object.position.y=y);deerLegs.forEach(leg=>leg.scale.y=1);
    if(lastWeather!==weather){lastWeather=weather;weatherClock=0;skyPause=weather==='cloudy'?2:0;stageIndex=0;stageTime=0;
      approachRoute=reindeer.position.z<1.4?[insideDoor.clone(),threshold.clone(),home.clone()]:[home.clone()];
      if(weather==='sunny')approachRoute.push(threshold.clone(),insideDoor.clone(),windowSpot.clone());
      miniSnowmen.forEach(g=>{g.visible=false;g.scale.setScalar(.01);});
    }
    speechText.textContent=weather==='cloudy'?'Someone will be there, rain or shine.':weather==='snowy'?'Like the first snow, someone will find their way to you.':'If you catch a falling maple leaf, your first love will come true.';
    if(skyPause>0){skyPause=Math.max(0,skyPause-dt);deerHead.rotation.x=T.MathUtils.damp(deerHead.rotation.x,-.55,8,dt);speech.style.opacity='0';speech.setAttribute('aria-hidden','true');plantHooves(false,0);return;}
    if(approachRoute.length){
      const dest=approachRoute[0],dx=dest.x-reindeer.position.x,dz=dest.z-reindeer.position.z,d=Math.hypot(dx,dz),step=Math.min(d,dt*1.4);
      if(d>.02){reindeer.position.x+=dx/d*step;reindeer.position.z+=dz/d*step;reindeer.rotation.y=angleTo(reindeer.rotation.y,Math.atan2(dx,dz),1-Math.exp(-8*dt));}else approachRoute.shift();
      doorHinge.rotation.y=T.MathUtils.damp(doorHinge.rotation.y,reindeer.position.z<2.2?-Math.PI*.56:0,8,dt);
      deerHead.rotation.set(weather==='cloudy'?-.45:0,0,0);deerArms.forEach((o,i)=>o.rotation.set(Math.sin(performance.now()*.008+i*Math.PI)*.3,0,0));
      speech.style.opacity=weather==='sunny'?'0':'1';speech.setAttribute('aria-hidden',String(weather==='sunny'));plantHooves(true,performance.now()/1000);return;
    }
    if(weather!=='sunny'){
      weatherClock+=dt;doorHinge.rotation.y=T.MathUtils.damp(doorHinge.rotation.y,0,8,dt);
      let walking=false,building=false,yaw=0,crouch=0;
      const move=(a:T.Vector3,b:T.Vector3,u:number)=>{reindeer.position.lerpVectors(a,b,u*u*(3-2*u));yaw=Math.atan2(b.x-a.x,b.z-a.z);walking=true;};
      if(weather==='cloudy'){
        const t=weatherClock%22,corner=v(.35,0,2.8);
        if(t<2){reindeer.position.copy(home);deerHead.rotation.x=-.55;}
        else if(t<3){yaw=Math.PI;deerHead.rotation.x=0;}
        else if(t<5)move(home,corner,(t-3)/2);
        else if(t<7)move(corner,rainSpot,(t-5)/2);
        else if(t<17)reindeer.position.copy(rainSpot);
        else if(t<19)move(rainSpot,corner,(t-17)/2);
        else move(corner,home,(t-19)/3);
        speech.style.opacity=String(t<2?0:Math.min(1,(t-2)/.4,Math.max(0,(17-t)/.8)));
      }else{
        const t=weatherClock;
        if(t<2)move(home,pointA,t/2);
        else{const phase=(t-2)%22;
          if(phase<8){reindeer.position.copy(pointA);building=true;crouch=Math.min(1,phase/.6,(8-phase)/.6);}
          else if(phase<11)move(pointA,pointB,(phase-8)/3);
          else if(phase<19){reindeer.position.copy(pointB);building=true;crouch=Math.min(1,(phase-11)/.6,(19-phase)/.6);}
          else move(pointB,pointA,(phase-19)/3);
          miniSnowmen.forEach((g,i)=>{const progress=T.MathUtils.clamp((t-2-(i<2?0:11))/8,0,1);g.visible=progress>0;g.scale.setScalar(Math.max(.01,progress));g.position.y=streetHeight(g.position.x,g.position.z,snowAmount);});
        }
        deerHead.rotation.x=building?.25+Math.sin(t*4)*.08:0;speech.style.opacity=String(Math.min(1,t/.4,Math.max(0,(11-t)/.8)));
      }
      speech.setAttribute('aria-hidden',String(Number(speech.style.opacity)===0));
      reindeer.rotation.y=angleTo(reindeer.rotation.y,yaw,1-Math.exp(-7*dt));deerHead.rotation.y=0;
      deerArms.forEach((o,i)=>o.rotation.set(building?-.9+Math.sin(weatherClock*5+i*.8)*.35:walking?Math.sin(weatherClock*8+i*Math.PI)*.3:0,0,0));plantHooves(walking,weatherClock);
      if(crouch>0){
        const bend=crouch*crouch*(3-2*crouch),drop=.23*bend;
        standingParts.forEach(({object,y})=>object.position.y=y-drop);
        deerLegs.forEach(leg=>{leg.scale.y=1-drop/.48;leg.position.y-=drop;});
      }
      return;
    }
    stageTime+=dt;
    while(stageTime>=stages[stageIndex][1]){stageTime-=stages[stageIndex][1];stageIndex=(stageIndex+1)%stages.length;}
    const [stage,duration]=stages[stageIndex],u=stageTime/duration,t=u*u*(3-2*u);
    const talking=stage==='speak'||stage==='fade';speech.style.opacity=stage==='speak'?String(Math.min(1,stageTime/.4)):stage==='fade'?String(1-t):'0';speech.setAttribute('aria-hidden',String(!talking));
    const walking=['approach','enter','window','door','exit','return'].includes(stage);
    let desiredYaw=reindeer.rotation.y;
    const travel=(from:T.Vector3,to:T.Vector3,yaw?:number)=>{reindeer.position.lerpVectors(from,to,t);desiredYaw=yaw??Math.atan2(to.x-from.x,to.z-from.z);};
    const outside=v(home.x,streetHeight(home.x,home.z,snowAmount),home.z);
    switch(stage){
      case 'speak':case 'fade':reindeer.position.x=home.x;reindeer.position.z=home.z;desiredYaw=Math.atan2(camera.position.x-home.x,camera.position.z-home.z)+pointer.x*.25;break;
      case 'turn':desiredYaw=Math.PI;break;
      case 'approach':travel(outside,threshold);break;
      case 'open':reindeer.position.copy(threshold);desiredYaw=Math.PI;break;
      case 'enter':travel(threshold,insideDoor,Math.PI*.72);break;
      case 'closeInside':reindeer.position.copy(insideDoor);break;
      case 'window':travel(insideDoor,windowSpot);break;
      case 'look':reindeer.position.copy(windowSpot);desiredYaw=pointer.x*.2;break;
      case 'door':travel(windowSpot,insideDoor);break;
      case 'openInside':reindeer.position.copy(insideDoor);desiredYaw=0;break;
      case 'exit':travel(insideDoor,threshold,Math.PI*.28);break;
      case 'closeOutside':reindeer.position.copy(threshold);desiredYaw=0;break;
      case 'return':travel(threshold,outside);break;
      case 'face':desiredYaw=Math.atan2(camera.position.x-home.x,camera.position.z-home.z);break;
    }
    reindeer.rotation.y=angleTo(reindeer.rotation.y,desiredYaw,1-Math.exp(-7*dt));
    const doorOpen=['open','enter','openInside','exit'].includes(stage);
    doorHinge.rotation.y=T.MathUtils.damp(doorHinge.rotation.y,doorOpen?-Math.PI*.56:0,6,dt);
    deerHead.rotation.y=T.MathUtils.damp(deerHead.rotation.y,(talking||stage==='look')?pointer.x*.3:0,6,dt);
    deerHead.rotation.x=T.MathUtils.damp(deerHead.rotation.x,(talking||stage==='look')?pointer.y*.15:0,6,dt);
    deerArms.forEach((o,i)=>{o.rotation.x=walking?Math.sin(stageTime*8+i*Math.PI)*.35:((stage==='open'||stage==='openInside')&&i===0?-1.15:0);o.rotation.z=talking&&i===0?-1.65+Math.sin((stageTime+(stage==='fade'?10:0))*8)*.22:0;if(i===0)o.position.set(-.29,1.02,0);});
    plantHooves(walking,stageTime);
  }
  // Weather has its own smoothly blended state, independent of time of day.
  let weather:Weather='sunny',snowAmount=0,cloudAmount=0,leafAmount=.25;
  const setWeather=(next:Weather)=>{weather=next;};
  const groundBlanket=box(10.18,.22,10.18,0,.21,.8,snow);
  const snowDetails:{mesh:T.Mesh,y:number}[]=[];
  root.traverse(o=>{
    if(o instanceof T.Mesh && o.material===snow && o.parent!==snowman && o!==groundBlanket && !roofBlankets.includes(o))snowDetails.push({mesh:o,y:o.scale.y});
  });
  // Instanced leaves cover the exposed ground without covering the entrance steps.
  const leafShape=new T.Shape();
  const outline=[[0,.23],[.045,.11],[.13,.17],[.11,.065],[.23,.08],[.15,-.015],[.18,-.07],[.045,-.08],[.012,-.18],[-.012,-.18],[-.04,-.08],[-.18,-.07],[-.15,-.015],[-.23,.08],[-.11,.065],[-.13,.17],[-.045,.11]];
  outline.forEach(([x,y],i)=>i?leafShape.lineTo(x,y):leafShape.moveTo(x,y));leafShape.closePath();
  const leafGeo=new T.ShapeGeometry(leafShape);
  const leafMat=mat('#a64b2e',{side:T.DoubleSide});
  const fallen=new T.InstancedMesh(leafGeo,leafMat,1000);fallen.receiveShadow=true;root.add(fallen);
  const dummy=new T.Object3D();const leafColors=['#913c2e','#b75932','#ce753c','#74392d'];
  for(let i=0;i<1000;i++){
    let x=0,z=0;do{x=-4.95+rnd()*9.9;z=-4.05+rnd()*9.9;}while(Math.abs(x)<2.8&&z<2.55&&z>-2.65);
    dummy.position.set(x,.14+rnd()*.025,z);dummy.rotation.set(-Math.PI/2,0,rnd()*Math.PI*2);dummy.scale.setScalar(.55+rnd()*.55);dummy.updateMatrix();fallen.setMatrixAt(i,dummy.matrix);fallen.setColorAt(i,new T.Color(leafColors[i%4]));
  }
  const flying=new T.InstancedMesh(leafGeo,leafMat,70);root.add(flying);
  const drifting=Array.from({length:70},()=>({x:-6+rnd()*12,y:.3+rnd()*9,z:-4+rnd()*10,phase:rnd()*6.28,speed:.35+rnd()*.45}));
  for(let i=0;i<70;i++)flying.setColorAt(i,new T.Color(leafColors[i%4]));
  const snowGeo=new T.BufferGeometry(),snowPositions=new Float32Array(1100*3);
  for(let i=0;i<1100;i++){snowPositions[i*3]=-6+rnd()*12;snowPositions[i*3+1]=rnd()*11;snowPositions[i*3+2]=-4+rnd()*10;}
  snowGeo.setAttribute('position',new T.BufferAttribute(snowPositions,3));
  const snowParticleMat=new T.PointsMaterial({color:'#fffaf2',size:.045,transparent:true,opacity:0,depthWrite:false});materials.push(snowParticleMat);
  const snowfall=new T.Points(snowGeo,snowParticleMat);root.add(snowfall);
  // Larger six-armed flakes supplement the fine snowfall.
  const flakeShape=new T.Shape();
  for(let i=0;i<24;i++){
    const angle=i*Math.PI/12,r=i%4===0?.15:i%2===0?.08:.035;
    const x=Math.cos(angle)*r,y=Math.sin(angle)*r;i?flakeShape.lineTo(x,y):flakeShape.moveTo(x,y);
  }flakeShape.closePath();
  const flakeMaterial=mat('#ffffff',{side:T.DoubleSide,transparent:true,opacity:0,depthWrite:false,emissive:'#dceeff',emissiveIntensity:.3});
  const bigFlakes=new T.InstancedMesh(new T.ShapeGeometry(flakeShape),flakeMaterial,160);bigFlakes.frustumCulled=false;root.add(bigFlakes);
  const flakeDrift=Array.from({length:160},()=>({x:-5.5+rnd()*11,y:rnd()*10,z:-4+rnd()*10,phase:rnd()*6.28,size:.45+rnd()*.65}));
  const cloudMat=mat('#dde3e6',{transparent:true,opacity:0,depthWrite:false});
  const clouds=new T.Group();root.add(clouds);
  const cloudLayout=[[-3.9,8.1,-2.9,1.1],[-.9,8.65,-3.5,.9],[2.65,7.9,-2.65,1.05],[4.1,8.8,-.1,.7],[-3.3,7.65,.25,.8],[.3,8.6,-.2,1.1],[2.1,8.05,2.1,.85],[-4.05,8.45,3.2,.75],[-1.05,7.8,3.95,1.05],[3.8,8.55,4.2,.8]];
  const cloudHomes:T.Vector3[]=[];
  cloudLayout.forEach(([x,y,z,scale],i)=>{
    const cloud=new T.Group();cloud.position.set(x,y,z);cloud.scale.setScalar(scale);cloud.rotation.y=i*1.13;clouds.add(cloud);cloudHomes.push(cloud.position.clone());
    for(let j=0;j<5;j++){
      const angle=j*2.4;const puff=ball(.68+rnd()*.35,Math.cos(angle)*(.3+rnd()*.6),rnd()*.25,Math.sin(angle)*(.3+rnd()*.6),cloudMat,cloud);
      puff.scale.set(1.1,.52,.85);puff.castShadow=false;
    }
  });
  // Light rain is confined to the miniature. Impacts land on exposed paving.
  const rainGeo=new T.BufferGeometry(),rainPositions=new Float32Array(260*6);
  const drops=Array.from({length:260},()=>({x:-4.9+rnd()*9.8,y:.3+rnd()*7.5,z:-4+rnd()*9.7,speed:3+rnd()*2}));
  rainGeo.setAttribute('position',new T.BufferAttribute(rainPositions,3));
  const rainMat=new T.LineBasicMaterial({color:'#aac7dc',transparent:true,opacity:0,depthWrite:false});materials.push(rainMat);
  const rain=new T.LineSegments(rainGeo,rainMat);root.add(rain);
  const ripples:T.Mesh[]=[];
  const rippleGeo=new T.RingGeometry(.85,1,24);
  for(let i=0;i<36;i++){
    let x=0,z=0;do{x=-4.8+rnd()*9.6;z=-3.9+rnd()*9.5;}while(Math.abs(x)<2.9&&z<2.8&&z>-2.8);
    const m=mat('#8cb3c8',{transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});
    const ring=mesh(rippleGeo,m,x,.151,z);ring.rotation.x=-Math.PI/2;ring.castShadow=false;ring.receiveShadow=false;ripples.push(ring);
  }
  const wetMat=mat('#7a929d',{transparent:true,opacity:0,roughness:.15,metalness:.35,depthWrite:false});
  for(let i=0;i<14;i++){
    const p=ripples[i].position;const puddle=mesh(new T.CircleGeometry(.18+rnd()*.22,20),wetMat,p.x,.143,p.z);puddle.rotation.x=-Math.PI/2;puddle.scale.y=.6+rnd()*.5;puddle.castShadow=false;
  }
  const sunnySky=new T.Color('#d6e4e8'),overcastSky=new T.Color('#929faa'),snowSky=new T.Color('#b9c9d6');
  let elapsed=0;
  function updateWeather(dt:number){
    elapsed+=dt;
    const blend=(a:number,b:number,speed=1.4)=>T.MathUtils.damp(a,b,speed,dt);
    snowAmount=blend(snowAmount,weather==='snowy'?1:0,.55);
    cloudAmount=blend(cloudAmount,weather==='cloudy'?1:0,.8);
    leafAmount=blend(leafAmount,weather==='sunny'?1:0,.4);
    groundBlanket.scale.y=Math.max(.001,snowAmount);groundBlanket.visible=snowAmount>.01;
    groundBlanket.position.y=.12+.11*snowAmount;
    // Track actual base / snow surfaces; never bob or animate the character.
    const baseTop=.04+.07*Math.max(.01,snowAmount);
    reindeer.position.y=Math.max(baseTop,groundBlanket.visible?groundBlanket.position.y+.11*groundBlanket.scale.y:baseTop);
    roofBlankets.forEach(o=>{o.scale.y=Math.max(.001,snowAmount);o.visible=snowAmount>.01;});
    snowDetails.forEach(({mesh,y})=>{mesh.scale.y=y*Math.max(.01,snowAmount);});
    fallen.count=Math.floor(1000*leafAmount*(1-snowAmount));
    flying.count=Math.floor(70*leafAmount);
    drifting.forEach((p,i)=>{
      if(!reducedMotion.matches){p.y-=dt*p.speed;p.x+=dt*.25;if(p.y<.15){p.y=8+rnd()*2;p.x=-5+rnd()*10;}if(p.x>5.5)p.x=-5.5;}
      dummy.position.set(p.x+Math.sin(elapsed+p.phase)*.28,p.y,p.z);dummy.rotation.set(elapsed*.5+p.phase,elapsed*.3,p.phase);dummy.scale.setScalar(.55);dummy.updateMatrix();flying.setMatrixAt(i,dummy.matrix);
    });flying.instanceMatrix.needsUpdate=true;
    flakeMaterial.opacity=snowAmount*.95;bigFlakes.visible=snowAmount>.01;
    flakeDrift.forEach((p,i)=>{
      if(!reducedMotion.matches){p.y-=dt*(.35+p.size*.4);if(p.y<.3)p.y=10;}
      dummy.position.set(p.x+Math.sin(elapsed*.65+p.phase)*.45,p.y,p.z);
      dummy.quaternion.copy(camera.quaternion);dummy.rotateZ(elapsed*.35+p.phase);dummy.scale.setScalar(p.size);dummy.updateMatrix();bigFlakes.setMatrixAt(i,dummy.matrix);
    });bigFlakes.instanceMatrix.needsUpdate=true;
    snowParticleMat.opacity=snowAmount*.9;snowfall.visible=snowAmount>.01;
    if(!reducedMotion.matches)for(let i=0;i<1100;i++){snowPositions[i*3]+=(.16+Math.sin(elapsed+i)*.06)*dt;snowPositions[i*3+1]-=(.6+(i%7)*.09)*dt;if(snowPositions[i*3+1]<.2)snowPositions[i*3+1]=10;if(snowPositions[i*3]>6)snowPositions[i*3]=-6;}
    snowGeo.attributes.position.needsUpdate=true;
    clouds.position.x=(1-cloudAmount)*14+(reducedMotion.matches?0:Math.sin(elapsed*.12)*.4);
    clouds.children.forEach((cloud,i)=>{const home=cloudHomes[i];cloud.position.copy(home);if(!reducedMotion.matches){cloud.position.x+=Math.sin(elapsed*.17+i*1.7)*.22;cloud.position.z+=Math.cos(elapsed*.12+i)*.17;}});
    const wind=reducedMotion.matches?0:cloudAmount;
    windObjects.forEach(({object,strength,phase})=>{object.rotation.z=Math.sin(elapsed*1.55+phase)*strength*wind;object.rotation.x=Math.sin(elapsed*1.1+phase)*strength*.35*wind;});
    rain.visible=cloudAmount>.01;rainMat.opacity=cloudAmount*.45;
    drops.forEach((p,i)=>{
      const roofHit=Math.abs(p.x)<2.85&&p.z>-2.7&&p.z<1.65?6.3-Math.abs(p.x)*.76:.15;
      if(!reducedMotion.matches){p.y-=p.speed*dt;p.x+=dt*.12;if(p.y<roofHit){p.y=8+rnd();p.x=-4.9+rnd()*9.8;}}
      const k=i*6;rainPositions[k]=p.x;rainPositions[k+1]=p.y;rainPositions[k+2]=p.z;rainPositions[k+3]=p.x+.025;rainPositions[k+4]=p.y-.14;rainPositions[k+5]=p.z;
    });rainGeo.attributes.position.needsUpdate=true;
    wetMat.opacity=cloudAmount*.22*(1-snowAmount);
    ripples.forEach((ring,i)=>{const age=reducedMotion.matches?.45:(elapsed*.72+i*.317)%1;ring.scale.setScalar(.035+age*.23);(ring.material as T.MeshStandardMaterial).opacity=cloudAmount*(1-age)*.45*(1-snowAmount);});
    clouds.visible=cloudAmount>.005;cloudMat.opacity=cloudAmount*.9;
    dayBackground.copy(sunnySky).lerp(overcastSky,cloudAmount).lerp(snowSky,snowAmount);
    sun.intensity*=1-cloudAmount*.72-snowAmount*.48;
    ambient.intensity*=1-cloudAmount*.16;
    cloudMat.color.set('#dde3e6').lerp(new T.Color('#627087'),night);
  }
  function onKey(e:KeyboardEvent){
    if(e.key==='Home'){e.preventDefault();reset();}
    if(e.key==='+'||e.key==='='||e.key==='-'){
      e.preventDefault();const offset=camera.position.clone().sub(controls.target);offset.multiplyScalar(e.key==='-'?1.1:.9);offset.setLength(T.MathUtils.clamp(offset.length(),10,27));camera.position.copy(controls.target).add(offset);
    }
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
      e.preventDefault();const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(v(0,1,0),e.key==='ArrowLeft'?-.12:.12);camera.position.copy(controls.target).add(offset);
    }
  }
  renderer.domElement.addEventListener('keydown',onKey);
  const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});resize.observe(host);
  renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();
  let frame=0;let stopped=false;
  let night=0,targetNight=0,lastTime=performance.now();
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const dayBackground=new T.Color('#d6e4e8'),nightBackground=new T.Color('#101c32');
  const dayFloor=new T.Color('#cad6d7'),nightFloor=new T.Color('#29364e');
  const daySun=new T.Color('#fff4df'),nightSun=new T.Color('#9bbfff');
  const setNight=(enabled:boolean)=>{targetNight=enabled?1:0;};
  streetCookie.userData.inspectId='gingerbread';snowman.userData.inspectId='snowman';reindeer.userData.inspectId='reindeer';
  const exploration=createExploration(host,camera,root,{root,gingerbread:streetCookie,snowman,reindeer:deerHead},onDiscovery);
  const render=()=>{
    if(stopped)return;frame=requestAnimationFrame(render);
    const now=performance.now(),dt=Math.min((now-lastTime)/1000,.1);lastTime=now;
    night=reducedMotion.matches?targetNight:T.MathUtils.damp(night,targetNight,6,dt);
    if(Math.abs(night-targetNight)<.001)night=targetNight;
    (scene.background as T.Color).lerpColors(dayBackground,nightBackground,night);
    floor.color.lerpColors(dayFloor,nightFloor,night);
    sun.color.lerpColors(daySun,nightSun,night);sun.intensity=T.MathUtils.lerp(3.8,.48,night);
    ambient.intensity=T.MathUtils.lerp(2.8,.5,night);fill.intensity=T.MathUtils.lerp(1.2,.55,night);
    inside.intensity=T.MathUtils.lerp(10,38,night);
    glass.emissiveIntensity=night*.9;windowSpill.intensity=night*5;reflection.opacity=T.MathUtils.lerp(.25,.12,night);
    nightLights.forEach(light=>{light.intensity=T.MathUtils.lerp(.8,light.userData.street?24:11,night);});
    glow.emissiveIntensity=T.MathUtils.lerp(.35,2.8,night);
    luminousSigns.forEach(m=>{m.emissiveIntensity=T.MathUtils.lerp(0,1.8,night);});
    bulbMaterial.emissiveIntensity=night*4;
    decorativeLights.forEach(light=>{light.intensity=night*5.5;});
    updateWeather(dt);
    animateReindeer(dt);
    controls.update();root.updateMatrixWorld(true);exploration.update(now);renderer.render(scene,camera);
  };render();
  return { reset, setNight, setWeather, dispose(){exploration.dispose();stopped=true;cancelAnimationFrame(frame);resize.disconnect();controls.dispose();renderer.domElement.removeEventListener('keydown',onKey);renderer.domElement.removeEventListener('pointermove',trackPointer);renderer.domElement.removeEventListener('pointerdown',trackPointer);scene.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});materials.forEach(m=>{if(m instanceof T.MeshStandardMaterial)m.map?.dispose();m.dispose();});snowGeo.dispose();rainGeo.dispose();renderer.dispose();speech.remove();renderer.domElement.remove();} };
}



















