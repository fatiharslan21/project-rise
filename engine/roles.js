/* PROJECT RISE — position and role action rules (Node/browser compatible) */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.RiseRoles=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const positions=[
  ['GK','Kaleci','save','Kaleci'],
  ['LB','Sol bek','defend','Savunma'],['LWB','Sol kanat bek','cross','Savunma'],
  ['LCB','Sol stoper','defend','Savunma'],['CB','Stoper','defend','Savunma'],
  ['RCB','Sağ stoper','defend','Savunma'],['RB','Sağ bek','defend','Savunma'],
  ['RWB','Sağ kanat bek','cross','Savunma'],['SW','Libero','defend','Savunma'],
  ['CDM','Ön libero','defend','Orta saha'],['CM','Merkez orta saha','pass','Orta saha'],
  ['CAM','Ofansif orta saha','pass','Orta saha'],
  ['LM','Sol orta saha','cross','Orta saha'],['RM','Sağ orta saha','cross','Orta saha'],
  ['LW','Sol kanat','cross','Hücum'],['RW','Sağ kanat','cross','Hücum'],
  ['LF','Sol forvet','shoot','Hücum'],['RF','Sağ forvet','shoot','Hücum'],
  ['CF','İkinci forvet','shoot','Hücum'],['ST','Santrfor','shoot','Hücum']
 ].map(([id,name,mission,group])=>Object.freeze({id,name,mission,group}));
 const dictionary=Object.freeze(Object.fromEntries(positions.map(p=>[p.id,p])));
 const skillNames=Object.freeze({shot:'Şut',tech:'Teknik',mental:'Soğukkanlılık',passing:'Pas',defending:'Savunma',keeping:'Kalecilik',reflexes:'Refleks',positioning:'Pozisyon',pace:'Hız',stamina:'Dayanıklılık',aerial:'Hava topları'});
 const initialSkills=Object.freeze({shot:66,tech:64,mental:60,passing:64,defending:62,keeping:63,reflexes:65,positioning:63,pace:67,stamina:65,aerial:63});
 const weights={
  GK:{keeping:35,reflexes:30,positioning:20,mental:10,passing:5},
  LB:{defending:30,pace:25,positioning:20,passing:15,stamina:10},
  RB:{defending:30,pace:25,positioning:20,passing:15,stamina:10},
  LWB:{pace:27,passing:25,stamina:20,defending:18,tech:10},
  RWB:{pace:27,passing:25,stamina:20,defending:18,tech:10},
  CB:{defending:35,positioning:25,aerial:20,mental:10,pace:10},
  LCB:{defending:35,positioning:25,aerial:20,mental:10,pace:10},
  RCB:{defending:35,positioning:25,aerial:20,mental:10,pace:10},
  SW:{positioning:30,defending:30,passing:20,mental:20},
  CDM:{defending:29,positioning:25,passing:25,stamina:12,mental:9},
  CM:{passing:30,tech:20,positioning:20,stamina:17,mental:13},
  CAM:{passing:29,tech:26,mental:20,shot:15,pace:10},
  LM:{pace:28,passing:25,tech:20,stamina:17,defending:10},
  RM:{pace:28,passing:25,tech:20,stamina:17,defending:10},
  LW:{pace:28,tech:27,passing:20,shot:15,mental:10},
  RW:{pace:28,tech:27,passing:20,shot:15,mental:10},
  LF:{shot:30,tech:25,pace:22,passing:13,mental:10},
  RF:{shot:30,tech:25,pace:22,passing:13,mental:10},
  CF:{shot:30,tech:25,passing:20,mental:15,pace:10},
  ST:{shot:38,mental:22,tech:18,aerial:12,pace:10}
 };
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
 function has(id){return Boolean(dictionary[id]);}
 function get(id){return dictionary[id]||dictionary.ST;}
 function ensureSkills(skills){
  const out=skills&&typeof skills==='object'?skills:{};
  for(const [name,defaultValue] of Object.entries(initialSkills)){
   if(!Number.isFinite(out[name]))out[name]=defaultValue;
   else out[name]=clamp(Math.round(out[name]),1,99);
  }
  return out;
 }
 function rated(id,skills){
  const map=weights[get(id).id],stats=ensureSkills({...skills});
  const avg=Object.entries(map).reduce((sum,[key,weight])=>sum+weight*stats[key],0)/100;
  return Math.round(clamp(avg+5,1,99));
 }
 function topSkills(id,count=4){
  return Object.entries(weights[get(id).id]).sort((a,b)=>b[1]-a[1]).slice(0,count).map(([id])=>({id,name:skillNames[id]}));
 }
 const directions=['Sol','Orta','Sağ'];
 function newScenario(id,random=Math.random){
  const mission=get(id).mission;
  const target=Math.floor(clamp(random(),0,.999999)*3);
  const word=directions[target].toLowerCase();
  const lines={
   save:'Rakip şut için hazırlandı. Vuruşun geliş yönü: '+word+'. Hangi köşeye uzanacaksın?',
   defend:'Rakip hücumunu '+word+' koridordan geliştiriyor. Hangi alanı kapatacaksın?',
   pass:'Takım arkadaşın '+word+' koridorda savunma arkasına koştu. Pası nereye göndereceksin?',
   cross:'Ceza sahasında arkadaşın '+word+' bölgede boşta. Ortayı nereye açacaksın?',
   shoot:'Şut için boşluk buldun.'
  };
  return {mission,target,text:lines[mission]};
 }
 function resolve(id,chosen,target,skills,energy=100,morale=75,random=Math.random){
  const mission=get(id).mission;
  if(!Number.isInteger(chosen)||chosen<0||chosen>2||!Number.isInteger(target)||target<0||target>2)throw Error('Unknown action lane');
  const stats=ensureSkills({...skills});
  const key=({save:'reflexes',defend:'defending',pass:'passing',cross:'passing',shoot:'shot'})[mission];
  const attribute=stats[key];
  const correct=chosen===target;
  const base=correct?.65:.07;
  const probability=clamp(base+(attribute-60)*.004+(clamp(energy,0,100)-75)*.001+(clamp(morale,0,100)-75)*.0008,.04,.93);
  const success=random()<probability;
  const next=random();
  const event={mission,success,correct,forGoals:0,againstGoals:0,stat:null};
  if(mission==='save'){if(success)event.stat='saves';else event.againstGoals=1;}
  if(mission==='defend'){if(success){event.stat='tackles';if(next<.19)event.forGoals=1;}else if(next<.42)event.againstGoals=1;}
  if(mission==='pass'){if(success){event.stat='keyPasses';if(next<.35){event.forGoals=1;event.assist=true;}}else if(next<.22)event.againstGoals=1;}
  if(mission==='cross'){if(success){event.stat='crosses';if(next<.30){event.forGoals=1;event.assist=true;}}else if(next<.18)event.againstGoals=1;}
  return event;
 }
 return Object.freeze({positions,skillNames,initialSkills,has,get,ensureSkills,rated,topSkills,newScenario,resolve,directions});
});