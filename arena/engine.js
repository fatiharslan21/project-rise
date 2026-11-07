/* PROJECT RISE v0.4: simulation rules for a compact 6v6 arcade pitch.
   Browser globals + CommonJS for tests. Independent of rendering engine. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.RiseArena=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const W=380,H=520,LEFT=19,RIGHT=361,TOP=35,BOTTOM=485,GOAL_L=145,GOAL_R=235;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const formations=[[190,457],[100,392],[260,395],[184,315],[288,284],[190,222]];
const roleSlot={GK:0,LB:1,LWB:1,LCB:2,CB:2,RCB:2,RB:2,RWB:4,SW:2,CDM:2,CM:3,CAM:3,LM:1,RM:4,LW:4,RW:4,LF:5,RF:5,CF:5,ST:5};
function player(team,id){
 const home=team==='home',f=formations[id];
 return {team,id,x:f[0],y:home?f[1]:H-f[1],baseX:f[0],baseY:home?f[1]:H-f[1],
  targetX:f[0],targetY:home?f[1]:H-f[1],speed:id===0?78:home?93:88,number:id===0?1:id+5,keeper:id===0};
}
function newGame(position='ST',skills={},rng=Math.random){
 const controlled=Object.prototype.hasOwnProperty.call(roleSlot,position)?roleSlot[position]:5;
 const home=formations.map((_,i)=>player('home',i)),away=formations.map((_,i)=>player('away',i));
 const p=home[controlled];
 return {
  position,skills:{...skills},controlled,home,away,
  ball:{x:p.x,y:p.y-11,vx:0,vy:0,ownerTeam:'home',ownerId:controlled,lock:0,kind:'dribble',byUser:false,assistUser:false},
  scoreHome:0,scoreAway:0,elapsed:0,duration:75,ended:false,hold:0,stealCooldown:0,aiCooldown:0,
  stats:{goals:0,shots:0,passes:0,keyPasses:0,crosses:0,tackles:0,saves:0,assists:0},
  event:'İlk düdük! Top senin takımında.',events:[],lastTouch:'home'
 };
}
function announce(g,message){
 g.event=message;g.events.unshift(message);if(g.events.length>8)g.events.pop();
}
function owner(g){
 return g.ball.ownerTeam?g[g.ball.ownerTeam][g.ball.ownerId]:null;
}
function control(g){return g.home[g.controlled];}
function setOwner(g,team,id){
 const p=g[team][id],b=g.ball;
 b.ownerTeam=team;b.ownerId=id;b.vx=0;b.vy=0;b.x=p.x;b.y=p.y+(team==='home'?-10:10);
 b.lock=.18;b.kind='dribble';
 g.lastTouch=team;
}
function release(g,dx,dy,speed,kind,byUser=false,assistUser=false){
 const b=g.ball,p=owner(g);if(!p)return false;
 const len=Math.max(1,Math.hypot(dx,dy));
 b.x=p.x;b.y=p.y;b.vx=dx/len*speed;b.vy=dy/len*speed;
 b.ownerTeam=null;b.ownerId=-1;b.lock=.22;b.kind=kind;b.byUser=byUser;b.assistUser=assistUser;
 return true;
}
function nearest(g,team,point,excludeId=-1,fieldOnly=false){
 let id=-1,d=Infinity;
 g[team].forEach((p,i)=>{if(i===excludeId || (fieldOnly&&p.keeper))return;
  const x=distance(p,point);if(x<d){d=x;id=i;}});
 return {id,dist:d};
}
function passTarget(g,fromTeam,fromId){
 const team=g[fromTeam],p=team[fromId],forward=fromTeam==='home'?-1:1;
 let candidates=team.filter(x=>x.id!==fromId&&(!x.keeper||fromId===0));
 if(!candidates.length)return null;
 return candidates.map(t=>{
  const dist=distance(t,p),progress=(t.y-p.y)*forward;
  const pressure=nearest(g,fromTeam==='home'?'away':'home',t).dist;
  const score=progress*.37-dist*.13+pressure*.22+(fromTeam==='home'&&t.id===g.controlled?21:0);
  return {t,score};
 }).sort((a,b)=>b.score-a.score)[0].t;
}
function pass(g,team='home',id=g.controlled){
 if(g.ended||g.hold>0||g.ball.ownerTeam!==team||g.ball.ownerId!==id)return false;
 const p=g[team][id],target=passTarget(g,team,id);if(!target)return false;
 const dx=target.x-p.x,dy=target.y-p.y;
 const isUser=team==='home'&&id===g.controlled;
 const kickSpeed=340;
 release(g,dx,dy,kickSpeed,'pass',false,isUser);
 if(isUser){announce(g,'Pas verdin! Takım arkadaşın topa hareketleniyor.');}
 return true;
}
function shoot(g,team='home',id=g.controlled,rng=Math.random){
 if(g.ended||g.hold>0||g.ball.ownerTeam!==team||g.ball.ownerId!==id)return false;
 const p=g[team][id],user=team==='home'&&id===g.controlled;
 const shot=Number(g.skills.shot)||65;
 const error=(rng()-.5)*(105-(shot-55)*.55);
 const targetX=clamp(190+error,105,275),targetY=team==='home'?18:502;
 release(g,targetX-p.x,targetY-p.y,405,'shot',user,false);
 if(user){g.stats.shots++;announce(g,'Şut! Top kaleye yöneldi.');}
 else announce(g,team==='away'?'Rakip kaleye vurdu!':'Takım arkadaşın vurdu!');
 return true;
}
function tackle(g,rng=Math.random){
 if(g.ended||g.hold>0)return false;
 const p=control(g),b=owner(g);
 if(!b||b.team==='home'||distance(p,b)>32){announce(g,'Top kapmak için rakibe yaklaş.');return false;}
 const skill=Number(g.skills.defending)||62;
 const chance=clamp(.5+(skill-65)*.006,.25,.84);
 if(rng()<chance){setOwner(g,'home',p.id);g.stats.tackles++;announce(g,'Müthiş müdahale! Top sende.');return true;}
 announce(g,'Rakip topu korudu.');return false;
}
function perform(g,kind,rng=Math.random){
 if(kind==='shoot')return shoot(g,'home',g.controlled,rng);
 if(kind==='pass')return pass(g);
 if(kind==='tackle')return tackle(g,rng);
 return false;
}
function goal(g,team){
 if(team==='home'){
  g.scoreHome++;
  if(g.ball.byUser){g.stats.goals++;announce(g,'GOOOL! Harika bitiricilik!');}
  else if(g.ball.assistUser){g.stats.assists++;announce(g,'GOOOL! Asisti sen yaptın!');}
  else announce(g,'GOL! Takım arkadaşların ağları buldu.');
 }else{g.scoreAway++;announce(g,'Rakip gol attı. Hemen karşılık ver!');}
 g.hold=1.25;
 g.ball.ownerTeam=null;g.ball.vx=0;g.ball.vy=0;g.ball.lock=1.25;
}
function kickoff(g,team='home'){
 const p=g[team][3];
 p.x=190;p.y=team==='home'?307:213;
 setOwner(g,team,3);
 g.ball.byUser=false;g.ball.assistUser=false;
}
function moveToward(p,point,speed,dt){
 const dx=point.x-p.x,dy=point.y-p.y,len=Math.hypot(dx,dy);
 if(len<2)return;
 const amount=Math.min(len,Math.max(0,speed*dt));
 p.x+=dx/len*amount;p.y+=dy/len*amount;
 p.x=clamp(p.x,LEFT+7,RIGHT-7);p.y=clamp(p.y,TOP+7,BOTTOM-7);
}
function decideTargets(g){
 const b=owner(g)||g.ball;
 for(const team of ['home','away']){
  const theirs=team==='home'?'away':'home', list=g[team];
  const closest=nearest(g,team,b,-1,true).id;
  for(const p of list){
   if(p.id===g.controlled&&team==='home')continue;
   if(p.keeper){
    p.targetX=clamp(b.x,GOAL_L+5,GOAL_R-5);
    p.targetY=team==='home'?B-45:TOP+39;
    continue;
   }
   if(g.ball.ownerTeam===team&&g.ball.ownerId===p.id){
    p.targetX=clamp(p.x+(190-p.x)*.16,LEFT+8,RIGHT-8);
    p.targetY=team==='home'?Math.max(TOP+15,p.y-120):Math.min(BOTTOM-15,p.y+120);
   }else if(closest===p.id&&g.ball.ownerTeam!==team){
    p.targetX=b.x;p.targetY=b.y;
   }else{
    let shift=(g.ball.ownerTeam===team?(team==='home'?-65:65):0);
    p.targetX=clamp(p.baseX+(b.x-190)*.13,LEFT+12,RIGHT-12);
    p.targetY=clamp(p.baseY+shift,TOP+18,BOTTOM-18);
   }
  }
 }
}
const B=BOTTOM;
function followControlled(g,dt,input){
 const p=control(g),x=Number(input.moveX)||0,y=Number(input.moveY)||0;
 let dx=x,dy=y;
 if(input.target&&Number.isFinite(input.target.x)&&Number.isFinite(input.target.y)){
  dx=input.target.x-p.x;dy=input.target.y-p.y;
  if(Math.hypot(dx,dy)<9){dx=0;dy=0;}
 }
 const m=Math.hypot(dx,dy);
 if(m>0){const pace=Number(g.skills.pace)||66;const s=(95+(pace-60)*.8)*dt;
  p.x+=dx/m*s;p.y+=dy/m*s;
 }
 if(g.controlled===0){p.x=clamp(p.x,GOAL_L-33,GOAL_R+33);p.y=clamp(p.y,390,BOTTOM-16);}
 else {p.x=clamp(p.x,LEFT+9,RIGHT-9);p.y=clamp(p.y,TOP+9,BOTTOM-9);}
}
function tryPickups(g,rng){
 const b=g.ball;if(b.lock>0)return;
 if(b.ownerTeam){
  const carrier=owner(g),rivals=g[carrier.team==='home'?'away':'home'];
  const opponents=rivals.filter(x=>distance(x,carrier)<14);
  if(opponents.length&&g.stealCooldown<=0&&rng()<.055){
   setOwner(g,carrier.team==='home'?'away':'home',opponents[0].id);
   g.stealCooldown=.65;announce(g,'Rakip baskısı sonucu top el değiştirdi.');
  }
  return;
 }
 const nearHome=nearest(g,'home',b),nearAway=nearest(g,'away',b);
 const pTeam=nearHome.dist<=nearAway.dist?'home':'away',candidate=pTeam==='home'?nearHome:nearAway;
 if(candidate.dist>15)return;
 const kind=b.kind,userAssist=b.assistUser,wasShot=b.kind==='shot';
 // Goalkeeper saves a shot when intercepting in the defensive goal area.
 if(wasShot&&candidate.id===0&&pTeam==='home'){
  if(g.controlled===0){g.stats.saves++;announce(g,'🧤 Kurtarış yaptın!');}
  else announce(g,'Kalecin topu kontrol etti.');
 }
 if(kind==='pass'&&pTeam==='home'&&userAssist){
  g.stats.passes++;g.stats.keyPasses+=Number(b.y<225);
  announce(g,'Pas isabetli!');
 }
 if(kind==='pass'&&pTeam==='away'&&userAssist)announce(g,'Rakip pas arası yaptı.');
 setOwner(g,pTeam,candidate.id);
}
function updateBall(g,dt,rng){
 const b=g.ball;
 b.lock=Math.max(0,b.lock-dt);
 if(b.ownerTeam){
  const p=owner(g);if(!p){b.ownerTeam=null;return;}
  b.x=p.x;b.y=p.y+(p.team==='home'?-10:10);
  return;
 }
 const oldY=b.y,oldX=b.x;
 b.x+=b.vx*dt;b.y+=b.vy*dt;
 const friction=Math.pow(.994,dt*60);b.vx*=friction;b.vy*=friction;
 if(Math.abs(b.vx)<3&&Math.abs(b.vy)<3){b.vx=0;b.vy=0;}
 // Crossing the goal line is evaluated before ordinary out-of-play.
 if(b.y<=TOP){
  if(b.x>=GOAL_L&&b.x<=GOAL_R){goal(g,'home');return;}
  b.y=TOP+9;b.vy=Math.abs(b.vy)*.3;b.lock=.25;announce(g,'Top üst çizgiden çıktı.');
  setOwner(g,'away',0);return;
 }
 if(b.y>=BOTTOM){
  if(b.x>=GOAL_L&&b.x<=GOAL_R){goal(g,'away');return;}
  b.y=BOTTOM-9;b.vy=-Math.abs(b.vy)*.3;b.lock=.25;setOwner(g,'home',0);return;
 }
 if(b.x<LEFT){b.x=LEFT+2;b.vx=Math.abs(b.vx)*.58;}
 else if(b.x>RIGHT){b.x=RIGHT-2;b.vx=-Math.abs(b.vx)*.58;}
 tryPickups(g,rng);
}
function updateAI(g,dt,rng){
 decideTargets(g);
 for(const team of ['home','away']){
  for(const p of g[team]){
   if(team==='home'&&p.id===g.controlled)continue;
   moveToward(p,{x:p.targetX,y:p.targetY},p.speed*(g.ball.ownerTeam===team&&g.ball.ownerId===p.id?.74:1),dt);
  }
 }
 g.aiCooldown=Math.max(0,g.aiCooldown-dt);
 if(g.aiCooldown>0||!g.ball.ownerTeam)return;
 const carrier=owner(g);
 if(!carrier||carrier.team==='home'&&carrier.id===g.controlled)return;
 const nearGoal=carrier.team==='home'?carrier.y<TOP+210:carrier.y>BOTTOM-210;
 if(nearGoal&&rng()<.55){shoot(g,carrier.team,carrier.id,rng);g.aiCooldown=2.3;return;}
 if(rng()<.37){pass(g,carrier.team,carrier.id);g.aiCooldown=2.5;}
}
function step(g,dt,input={},rng=Math.random){
 if(g.ended)return g;
 dt=clamp(Number(dt)||0,0,.06);
 if(dt===0)return g;
 g.elapsed+=dt;
 if(g.elapsed>=g.duration){g.elapsed=g.duration;g.ended=true;announce(g,'Maç sona erdi.');return g;}
 g.stealCooldown=Math.max(0,g.stealCooldown-dt);
 if(g.hold>0){
  g.hold-=dt;
  if(g.hold<=0)kickoff(g,g.scoreHome<=g.scoreAway?'home':'away');
  return g;
 }
 followControlled(g,dt,input);
 updateAI(g,dt,rng);
 updateBall(g,dt,rng);
 return g;
}
return Object.freeze({W,H,LEFT,RIGHT,TOP,BOTTOM,GOAL_L,GOAL_R,roleSlot,newGame,step,perform,pass,shoot,tackle,goal,kickoff,control,owner});
});