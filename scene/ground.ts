/** Highest walkable surface under a hoof, matching the modeled slabs. */
export function streetHeight(x:number,z:number,snowAmount:number){
  let y=.04+.07*Math.max(.01,snowAmount);
  if(snowAmount>.01)y=Math.max(y,.12+.22*snowAmount);
  if(Math.abs(x)<=2.35&&z>=-2.175&&z<=1.175)y=Math.max(y,.515);
  // Door threshold bridges the interior floor to the top tread.
  if(x>=.915&&x<=2.285&&z>=1.15&&z<=1.75)y=Math.max(y,.515);
  for(let i=0;i<3;i++){
    if(Math.abs(x-1.52)<=(2.45-i*.13)/2&&Math.abs(z-(2-i*.16))<=(.9-i*.19)/2)y=Math.max(y,.215+i*.15);
    if(Math.abs(x-1.52)<=(2.44-i*.13)/2&&Math.abs(z-(2.43-i*.255))<=.085)y=Math.max(y,.23+i*.15+.0175*Math.max(.01,snowAmount));
  }
  return y;
}
