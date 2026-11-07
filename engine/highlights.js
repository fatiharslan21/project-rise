/* PROJECT RISE: event-based, top-down highlight match rules. Browser + Node.
   Inspired by the interaction model of match highlights, no copied game assets. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.RiseHighlights=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const W=380,H=470,GOAL={left:126,right:254,y:42};
const clamp=(n,a,b)=>Math.min(b,Math.max(a,Number(n)||0));
const missionName={shoot:'Şut pozisyonu',pass:'Oyun kurma',cross:'Kanat akını',defend:'Savunma müdahalesi',save:'Kaleci kurtarışı'};
const ACTIONS={
 shoot:[['shoot','ŞUT'],['pass','PAS'],['dribble','ÇALIM']],
 pass:[['pass','PAS'],['shoot','ŞUT'],['dribble','ÇALIM']],
 cross:[['cross','ORTA'],['pass','PAS'],['shoot','ŞUT']],
 defend:[['tackle','MÜDAHALE'],['intercept','ARAYA GİR'],['clear','UZAKLAŞTIR']],
 save:[['save','UZAN'],['catch','TUT'],['parry','ÇEL']]
};
const roleTypes={GK:'save',LB:'defend',LWB:'cross',LCB:'defend',CB:'defend',RCB:'defend',RB:'defend',RWB:'cross',SW:'defend',CDM:'defend',CM:'pass',CAM:'pass',LM:'cross',RM:'cross',LW:'cross',RW:'cross',LF:'shoot',RF:'shoot',CF:'shoot',ST:'shoot'};
const feature={shoot:'shot',pass:'passing',cross:'passing',dribble:'tech',tackle:'defending',intercept:'positioning',clear:'defending',save:'reflexes',catch:'keeping',parry:'reflexes'};
function role(position){return roleTypes[position]||'shoot';}
function actions(type){return (ACTIONS[type]||ACTIONS.shoot).map(([id,label])=>({id,label}));}
function createMoment(position,index,rng=Math.random){
 const r=role(position),type=(r==='shoot'&&index%4===2)?'pass':(r==='pass'&&index%4===3)?'shoot':r;
 const random=()=>clamp(rng(),0,.9999);
 const minute=[11,26,43,59,78][index]||80;
 const x=Math.round(135+random()*110),y=type==='save'?421:type==='defend'?325:type==='shoot'?285:340;
 const ball={x,y};const targetX=Math.round(149+random()*82);
 const teammates=[{x:clamp(x+95,40,340),y:y-92},{x:clamp(x-95,40,340),y:y-77}];
 const defenders=[{x:clamp(x-60,36,344),y:y-55},{x:clamp(x+45,36,344),y:y-92}];
 let marker={x:targetX,y:GOAL.y};
 if(type==='pass'||type==='cross'){marker=teammates[index%2];}
 if(type==='defend'){marker={x:clamp(x+(random()-.5)*95,50,330),y:y-75};}
 if(type==='save'){marker={x:targetX,y:448};}
 const instructions={
 shoot:'Top sana geldi! Şut çek, pas ver veya rakibini geç.',
 pass:'Top sende. Boş arkadaşını bul ya da şut fırsatını değerlendir.',
 cross:'Kanatta boşluk yakaladın. Ceza sahasına top gönder!',
 defend:'Rakip tehlikeli geliyor. Müdahale edip atağı durdur!',
 save:'Rakip kaleye vuruyor! Kalecini topun gideceği köşeye yönlendir.'
 };
 return {index,minute,type,label:missionName[type],ball,teammates,defenders,marker,
  instructions:instructions[type],goalkeeper:{x:190,y:type==='save'?457:60}};
}
function newMatch(position='ST',skills={},energy=100,morale=75,rng=Math.random){
 const p=Object.prototype.hasOwnProperty.call(roleTypes,position)?position:'ST';
 const highlights=Array.from({length:5},(_,i)=>createMoment(p,i,rng));
 return {position:p,skills:{...skills},energy:clamp(energy,0,100),morale:clamp(morale,0,100),
  highlights,index:0,home:0,away:0,done:false,stats:{shots:0,goals:0,assists:0,keyPasses:0,crosses:0,tackles:0,saves:0},
  results:[],commentary:['1′ · Hakem ilk düdüğü çaldı.']};
}
function current(match){return match.done?null:match.highlights[match.index]||null;}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function requiredTarget(m,action){
 if(['shoot'].includes(action))return {x:clamp(m.marker.x,GOAL.left,GOAL.right),y:GOAL.y};
 if(['save','catch','parry'].includes(action))return m.marker;
 if(['defend','tackle','intercept','clear'].includes(action))return m.marker;
 if(action==='pass'||action==='cross')return m.teammates[0];
 return {x:clamp(m.ball.x+35,40,340),y:clamp(m.ball.y-65,50,445)};
}
function resolve(match,action,aim,power=.7,rng=Math.random){
 const m=current(match);if(!m)throw Error('Maç tamamlandı');
 if(!ACTIONS[m.type].some(([id])=>id===action))throw Error('Bu pozisyonda geçersiz aksiyon');
 if(!aim||!Number.isFinite(aim.x)||!Number.isFinite(aim.y))throw Error('Geçersiz hedef');
 const safeAim={x:clamp(aim.x,0,W),y:clamp(aim.y,0,H)},strength=clamp(power,0,1);
 const target=requiredTarget(m,action);
 let accuracy=dist(safeAim,target);
 // Passes can aim at either teammate; visualize both equally.
 if(action==='pass'||action==='cross')accuracy=Math.min(...m.teammates.map(t=>dist(t,safeAim)));
 const attr=clamp(match.skills[feature[action]]||64,1,99);
 const aimFactor=clamp(1-accuracy/140,0,1);
 const powerFactor=action==='shoot'?clamp(strength/.45,0,1):clamp(1-Math.abs(strength-.64),.3,1);
 const chance=clamp(.12+.48*aimFactor+.0028*(attr-60)+.12*powerFactor+
   .0006*(match.energy-75)+.0005*(match.morale-75),.03,.94);
 const success=clamp(rng(),0,1)<chance;
 let message='',forGoals=0,againstGoals=0,stat=null,assist=false;
 if(action==='shoot'){
  match.stats.shots++;
  if(success&&safeAim.x>=GOAL.left&&safeAim.x<=GOAL.right&&safeAim.y<=115){
   const saveChance=clamp(.20+Math.max(0,60-accuracy)*.0015-(attr-60)*.001,.06,.45);
   if(rng()>=saveChance){forGoals=1;match.stats.goals++;message='GOOOL! Harika bitiricilik!';}
   else message='Kaleci köşeden çıkardı!';
  }else message='Şut isabetsiz! Bir sonraki fırsatı değerlendir.';
 }else if(action==='pass'){
  if(success){match.stats.keyPasses++;stat='keyPasses';message='İsabetli pas! Takımın atağa devam ediyor.';
   if(rng()<.30){forGoals=1;assist=true;match.stats.assists++;message='Asist! Takım arkadaşın ağları buldu!';}
  }else message='Pas arası! Rakip topu kazandı.';
 }else if(action==='cross'){
  if(success){match.stats.crosses++;stat='crosses';message='Orta başarılı, ceza sahasında tehlike var!';
   if(rng()<.27){forGoals=1;assist=true;match.stats.assists++;message='Harika orta ve asist!';}
  }else message='Orta savunmada kaldı.';
 }else if(action==='dribble'){
  message=success?'Rakibini geçtin, takımın atak kazandı!':'Rakip müdahale etti ve top kaybedildi.';
  if(success&&rng()<.13)forGoals=1;
 }else if(['tackle','intercept','clear'].includes(action)){
  if(success){match.stats.tackles++;stat='tackles';message=action==='clear'?'Tehlikeyi uzaklaştırdın!':'Harika müdahale, topu kazandın!';}
  else{message='Rakip tehlikeli bölgeye girdi.';if(rng()<.45){againstGoals=1;message='Rakip gol attı!';}}
 }else{
  if(success){match.stats.saves++;stat='saves';message=action==='catch'?'Topu güvenle yakaladın!':'Müthiş kurtarış!';}
  else{againstGoals=1;message='Şut ağlarda. Bir sonraki pozisyona odaklan.';}
 }
 match.home+=forGoals;match.away+=againstGoals;
 const detail={minute:m.minute,type:m.type,action,success,forGoals,againstGoals,assist,stat,accuracy:Math.round(accuracy),strength:Number(strength.toFixed(2)),message,from:{...m.ball},to:{...safeAim}};
 match.results.push(detail);match.commentary.unshift(m.minute+'′ · '+message);
 match.index++;
 if(match.index>=match.highlights.length){
  match.done=true;match.commentary.unshift('90′ · Maç sona erdi.');
 }
 return detail;
}
function rating(match){
 const successes=match.results.filter(x=>x.success).length;
 const penalty=match.results.reduce((s,x)=>s+x.againstGoals,0);
 return Number(clamp(5.5+successes*.55+match.stats.goals*.55+match.stats.assists*.4+match.stats.saves*.2-penalty*.45,1,10).toFixed(1));
}
return Object.freeze({W,H,GOAL,missionName,actions,role,createMoment,newMatch,current,resolve,rating,requiredTarget,dist});
});