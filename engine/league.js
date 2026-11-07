/* League algorithm, no dependencies: browser + Node. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.RiseLeague=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 function roundRobin(n){
  if(!Number.isInteger(n)||n<4||n%2)throw Error('Even club count >=4 required');
  let order=Array.from({length:n},(_,i)=>i);const first=[];
  for(let w=0;w<n-1;w++){const pairs=[];for(let i=0;i<n/2;i++){
   let a=order[i],b=order[n-1-i];if((w+i)%2)[a,b]=[b,a];pairs.push([a,b]);
  }first.push(pairs);order=[order[0],order[n-1],...order.slice(1,-1)];}
  return first.concat(first.map(w=>w.map(([a,b])=>[b,a])));
 }
 function empty(names){return names.map((name,id)=>({name,id,played:0,win:0,draw:0,loss:0,gf:0,ga:0,pts:0}));}
 function record(t,a,b,x,y){
  if(a===b||![a,b,x,y].every(Number.isInteger)||x<0||y<0||x>30||y>30||!t[a]||!t[b])throw Error('Invalid match');
  let h=t[a],v=t[b];h.played++;v.played++;h.gf+=x;h.ga+=y;v.gf+=y;v.ga+=x;
  if(x>y){h.win++;v.loss++;h.pts+=3}else if(x<y){v.win++;h.loss++;v.pts+=3}else{h.draw++;v.draw++;h.pts++;v.pts++;}
 }
 function table(rows){return rows.slice().sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||a.id-b.id);}
 function poisson(lambda){let v=1,k=-1,limit=Math.exp(-Math.max(.05,lambda));do{v*=Math.random();k++;}while(v>limit&&k<9);return k;}
 function simulate(h,a){let d=(h-a)/25;return [poisson(Math.max(.25,1.53+d*.4)),poisson(Math.max(.25,1.2-d*.4))];}
 return Object.freeze({roundRobin,empty,record,table,simulate});
});