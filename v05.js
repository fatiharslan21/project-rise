/* PROJECT RISE v0.5 — NSS-style event-based highlight match presentation.
   Replaces the unwanted continuous live 6v6 gameplay without resetting careers. */
(function(){
'use strict';
const H=window.RiseHighlights;
if(!H)throw Error('Highlight engine missing');
const $=s=>document.querySelector(s);
const oldEnd=endGame;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const root=$('#match'),field=root.querySelector('.field-wrap');
let session=null,phase='idle',selected=null,aim=null,dragging=false,viewMoment=null,finished=false,ballFlight=0;
const stage=document.createElement('div');
stage.id='nssStage';stage.className='nss-shell';
stage.innerHTML='<div class="nss-scorebar"><div><div class="nss-mini-label">MAÇ DAKİKASI</div><strong id="nssMinute">00′</strong></div><div class="nss-score"><span>İSTANBUL ATHLETIC</span><strong id="nssScore">0 : 0</strong><span id="nssEnemy">RAKİP</span></div><div class="nss-count"><div class="nss-mini-label">POZİSYON</div><strong id="nssNumber">1 / 5</strong></div></div>'+
 '<div class="nss-commentary"><span id="nssStoryStamp">MAÇ ANLATIMI</span><p id="nssStory">Hakem maçı başlatıyor.</p></div>'+
 '<div class="nss-canvas-wrap"><canvas id="nssCanvas" width="380" height="470" aria-label="Futbol pozisyonu: futbolcudan hedefe doğru sürükleyerek aksiyon yap"></canvas>'+
 '<div class="nss-ball-flight" id="nssBallFlight" aria-hidden="true"></div></div>'+
 '<div class="nss-actionbox"><div class="nss-title-row"><strong id="nssTitle">Pozisyon</strong><span id="nssHint">Topa dokun ve sürükle</span></div>'+
 '<div class="nss-buttons" id="nssActions"></div><div class="nss-power"><span>VURUŞ GÜCÜ</span><div class="nss-meter"><div id="nssFill"></div></div><strong id="nssPowerVal">0%</strong></div>'+
 '<p class="nss-help" id="nssHelp">Önce aksiyon seç; sahada topa veya işaretli futbolcuya basıp hedefe sürükle.</p></div>'+
 '<div class="nss-result" id="nssResult" hidden><span class="nss-mini-label">POZİSYON SONUCU</span><strong id="nssResultTitle"></strong><p id="nssResultBody"></p><button type="button" id="nssContinue" class="cta">MAÇ DEVAM ETSİN →</button></div>'+
 '<div class="nss-log"><span>MAÇ GÜNLÜĞÜ</span><div id="nssFeed">1′ · İlk düdük çaldı.</div></div>';
field.parentNode.insertBefore(stage,field);
const canvas=$('#nssCanvas'),ctx=canvas.getContext('2d');
const focus={save:{x:190,y:447},defend:{x:190,y:348}};
function isKeeper(type){return type==='save';}
function origin(m){return m.type==='save'?focus.save:m.type==='defend'?{x:m.ball.x,y:m.ball.y+24}:m.ball;}
function point(evt){
 const b=canvas.getBoundingClientRect();return{x:clamp((evt.clientX-b.left)/b.width*H.W,0,H.W),y:clamp((evt.clientY-b.top)/b.height*H.H,0,H.H)};
}
function announce(text){$('#feedback').textContent=text;}
function roundedRect(x,y,w,h,r,color){
 ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();
}
function drawPitch(m){
 const w=H.W,h=H.H;
 ctx.clearRect(0,0,w,h);
 ctx.fillStyle='#15573e';ctx.fillRect(0,0,w,h);
 for(let i=0;i<9;i++){ctx.fillStyle=i%2?'#ffffff08':'#031b0b12';ctx.fillRect(0,i*h/9,w,h/9);}
 ctx.strokeStyle='#ffffffaa';ctx.lineWidth=2;ctx.strokeRect(16,18,w-32,h-36);
 ctx.beginPath();ctx.moveTo(16,h*.51);ctx.lineTo(w-16,h*.51);ctx.stroke();
 ctx.beginPath();ctx.arc(w/2,h*.51,44,0,Math.PI*2);ctx.stroke();
 if(m.type==='save'){
  ctx.strokeRect(105,h-106,170,88);ctx.strokeRect(144,h-53,92,35);
  ctx.fillStyle='#0b1c1e';ctx.fillRect(115,h-15,150,12);ctx.strokeStyle='#f7ffff';ctx.strokeRect(115,h-15,150,12);
 }else{
  ctx.strokeRect(105,18,170,89);ctx.strokeRect(145,18,90,36);
  ctx.fillStyle='#0b1c1e';ctx.fillRect(115,3,150,16);ctx.strokeStyle='#f7ffff';ctx.strokeRect(115,3,150,16);
 }
 ctx.fillStyle='#f7fbfa';ctx.beginPath();ctx.arc(w/2,h*.51,3,0,Math.PI*2);ctx.fill();
}
function kit(p,color,number,active=false){
 ctx.save();ctx.fillStyle='#031d18aa';ctx.beginPath();ctx.ellipse(p.x+3,p.y+7,15,7,0,0,Math.PI*2);ctx.fill();
 if(active){ctx.beginPath();ctx.arc(p.x,p.y,19,0,Math.PI*2);ctx.strokeStyle='#f0d287';ctx.lineWidth=3;ctx.stroke();}
 ctx.beginPath();ctx.arc(p.x,p.y,12.5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
 ctx.lineWidth=2;ctx.strokeStyle='#ffffffa8';ctx.stroke();
 ctx.fillStyle='#ffffff';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.fillText(number,p.x,p.y+4);ctx.restore();
}
function draw(){
 if(!viewMoment)return;
 const m=viewMoment,keeper=isKeeper(m.type);
 drawPitch(m);
 const originPoint=origin(m);
 if(keeper){
  const goalie={x:190,y:447};
  kit({x:m.ball.x,y:140},'#c55460',9,false);
  kit(goalie,'#6cb5da',1,true);
  ctx.fillStyle='#ffce74';ctx.beginPath();ctx.arc(m.marker.x,m.marker.y,13,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(m.marker.x,m.marker.y,18,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#fa9393';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(m.ball.x,140);ctx.lineTo(m.marker.x,m.marker.y);ctx.stroke();ctx.setLineDash([]);
 }else if(m.type==='defend'){
  kit(originPoint,'#d3b260',data.position==='CB'?4:6,true);
  kit(m.marker,'#c75a68',9);
  m.defenders.forEach((p,i)=>kit(p,'#c65464',i+5));
  m.teammates.forEach((p,i)=>kit(p,'#e0bd6d',i+7));
 }else{
  m.defenders.forEach((p,i)=>kit(p,'#c35565',i+4));
  m.teammates.forEach((p,i)=>kit(p,'#ddbc6f',i+8));
  kit(m.goalkeeper,'#4f90c7',1);
  kit(originPoint,'#d9b764',10,true);
 }
 const px=keeper?m.ball.x:originPoint.x,py=keeper?140:originPoint.y;
 ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(px,py,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#223b48';ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.fill();
 if(aim){
  ctx.lineWidth=3;ctx.setLineDash([9,7]);ctx.strokeStyle='#f6dd95';ctx.beginPath();ctx.moveTo(originPoint.x,originPoint.y);ctx.lineTo(aim.x,aim.y);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.arc(aim.x,aim.y,11,0,Math.PI*2);ctx.strokeStyle='#f7ebc7';ctx.lineWidth=2;ctx.stroke();
 }
 if(ballFlight){
  ctx.beginPath();ctx.arc(originPoint.x+(ballFlight.to.x-originPoint.x)*ballFlight.t,originPoint.y+(ballFlight.to.y-originPoint.y)*ballFlight.t,8,0,Math.PI*2);
  ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#122b36';ctx.stroke();
 }
}
function updateUI(){
 if(!session)return;
 $('#nssScore').textContent=session.home+' : '+session.away;
 $('#nssMinute').textContent=(phase==='finished'?90:viewMoment?viewMoment.minute:1)+'′';
 $('#nssNumber').textContent=Math.min(session.index+1,session.highlights.length)+' / '+session.highlights.length;
 $('#nssFeed').innerHTML=session.commentary.slice(0,5).map(t=>'<div>'+String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))+'</div>').join('');
 $('#score').innerHTML=session.home+' <span>:</span> '+session.away;
 $('#chances').textContent=(phase==='finished'?'Maç tamamlandı':(viewMoment?viewMoment.minute+'′':'0′')+' · '+session.index+' / '+session.highlights.length+' pozisyon')+' · '+rival()[0];
}
function showMoment(){
 if(!session||session.done)return;
 viewMoment=H.current(session);phase='play';aim=null;ballFlight=0;
 const m=viewMoment;
 selected=H.actions(m.type)[0].id;
 $('#nssResult').hidden=true;
 $('#nssActions').innerHTML=H.actions(m.type).map(a=>'<button type="button" data-nss-action="'+a.id+'">'+a.label+'</button>').join('');
 choose(selected);
 $('#nssTitle').textContent=m.label;
 $('#nssStoryStamp').textContent=m.minute+'′ · OYUNA MÜDAHALE';
 $('#nssStory').textContent=m.instructions;
 $('#nssHint').textContent='Yönünü ve gücünü belirle';
 $('#nssHelp').textContent=isKeeper(m.type)?'Kaleciden kurtarış yapmak istediğin köşeye doğru sürükle.':
  m.type==='defend'?'İşaretli futbolcundan rakibe doğru sürükle.':'Topu seç ve pas, şut veya çalım yönüne sürükle.';
 $('#nssFill').style.width='0%';$('#nssPowerVal').textContent='0%';
 updateUI();draw();
}
function choose(action){
 if(phase!=='play')return;
 selected=action;
 $('#nssActions').querySelectorAll('button').forEach(button=>button.classList.toggle('active',button.dataset.nssAction===selected));
}
$('#nssActions').addEventListener('click',event=>{
 const button=event.target.closest('button[data-nss-action]');
 if(button)choose(button.dataset.nssAction);
});
canvas.addEventListener('pointerdown',evt=>{
 if(phase!=='play'||!viewMoment)return;
 const p=point(evt),o=origin(viewMoment);
 if(H.dist(p,o)>92){$('#nssHelp').textContent='Topa veya sarı halkalı oyuncuna yakın bir noktadan sürükle.';return;}
 dragging=true;aim=p;
 try{canvas.setPointerCapture(evt.pointerId);}catch{}
 draw();
});
canvas.addEventListener('pointermove',evt=>{
 if(!dragging||phase!=='play')return;
 aim=point(evt);const strength=clamp(H.dist(origin(viewMoment),aim)/260,0,1);
 $('#nssFill').style.width=Math.round(strength*100)+'%';
 $('#nssPowerVal').textContent=Math.round(strength*100)+'%';
 draw();
});
canvas.addEventListener('pointerup',evt=>{
 if(!dragging||phase!=='play')return;
 dragging=false;
 const target=point(evt),distance=H.dist(origin(viewMoment),target);
 if(distance<15){aim=null;$('#nssHelp').textContent='Daha uzağa doğru sürükleyerek yön ve güç ver.';draw();return;}
 const power=clamp(distance/260,.1,1);
 aim=target;const result=H.resolve(session,selected,target,power);
 phase='result';$('#nssActions').querySelectorAll('button').forEach(b=>b.disabled=true);
 $('#nssFill').style.width=Math.round(power*100)+'%';$('#nssPowerVal').textContent=Math.round(power*100)+'%';
 $('#nssStory').textContent=result.message;
 $('#nssStoryStamp').textContent=viewMoment.minute+'′ · SONUÇ';
 updateUI();announce(result.message);
 ballFlight={to:target,t:0};
 const from=performance.now();
 function animate(time){
  if(!ballFlight)return;
  ballFlight.t=clamp((time-from)/300,0,1);draw();
  if(ballFlight.t<1)requestAnimationFrame(animate);
  else{ballFlight=0;draw();}
 }
 requestAnimationFrame(animate);
 $('#nssResult').hidden=false;
 $('#nssResultTitle').textContent=result.message;
 $('#nssResultBody').textContent=session.done?
   '90 dakika sona erdi. Maç sonuçlarını ve kariyer istatistiklerini kaydet.':
   'Pozisyon sonuçlandı. Maç ilerleyerek bir sonraki önemli ana geçecek.';
 $('#nssContinue').textContent=session.done?'MAÇI TAMAMLA →':'SONRAKİ POZİSYON →';
});
canvas.addEventListener('pointercancel',()=>{dragging=false;aim=null;draw();});
$('#nssContinue').addEventListener('click',()=>{
 if(phase!=='result'||!session)return;
 if(session.done){complete();return;}
 showMoment();
});
function complete(){
 if(!session||!session.done||finished||game.done)return;
 finished=true;phase='finished';
 const s=session;
 game.us=s.home;game.them=s.away;game.playerGoals=s.stats.goals;
 game.chance=s.results.length;game.maxChances=s.highlights.length;
 game.running=true;game.done=false;
 try{
  if(window.RiseClearRoleSession)window.RiseClearRoleSession();
  window.RiseHighlightFinalizing=true;
  oldEnd(); // v0.1 -> v0.2 league -> v0.3 (skip its legacy role reward)
  for(const k of Object.keys(s.stats)){
   if(Object.prototype.hasOwnProperty.call(data.roleStats,k))data.roleStats[k]+=s.stats[k];
  }
  const achievements=s.results.filter(r=>r.success).length;
  const role=RiseRoles.get(data.position);
  const primary={shoot:'shots',pass:'keyPasses',cross:'crosses',defend:'tackles',save:'saves'}[role.mission];
  const archive=data.history[0];
  if(archive){
   archive.position=data.position;archive.engine='highlights-v05';
   archive.actionCount=s.stats[primary]||0;archive.rating=H.rating(s);
   archive.highlightLog=s.results.map(r=>({minute:r.minute,action:r.action,success:r.success,forGoals:r.forGoals,againstGoals:r.againstGoals}));
   archive.assists=s.stats.assists;
  }
  data.lastMatchRating=H.rating(s);
  data.xp+=achievements*15;
  data.coins+=achievements*12;
  render();save();
  $('#matchState').textContent='MAÇ BİTTİ';
  $('#matchButton').disabled=false;$('#matchButton').textContent='← KARİYERE DÖN';
  $('#nssResultTitle').textContent=(s.home>s.away?'GALİBİYET!':s.home<s.away?'MAĞLUBİYET':'BERABERLİK')+' · '+s.home+'-'+s.away;
  $('#nssResultBody').textContent='Maç puanın '+H.rating(s)+'. '+s.stats.goals+' gol, '+s.stats.assists+' asist, '+s.stats.saves+' kurtarış. Kariyer kaydedildi.';
  $('#nssContinue').hidden=true;
  $('#nssStoryStamp').textContent='90′ · MAÇ SONU';
  $('#nssStory').textContent='Maç tamamlandı. İstatistikler kariyerine işlendi.';
  updateUI();
 }finally{window.RiseHighlightFinalizing=false;}
}
startGame=function(){
 $('#match').classList.add('highlight-mode');
 $('#match').classList.remove('role-mode','arena-mode');
 $('#nssContinue').hidden=false;
 session=H.newMatch(data.position,data.skills,data.energy,data.morale);
 viewMoment=null;phase='idle';finished=false;aim=null;dragging=false;ballFlight=0;
 game=initialGame();game.running=true;game.done=false;game.chance=0;game.maxChances=session.highlights.length;
 game.us=0;game.them=0;game.playerGoals=0;
 $('#matchButton').disabled=true;$('#matchButton').textContent='MAÇ DEVAM EDİYOR';
 $('#matchState').textContent='MAÇ GÜNÜ';
 $('#nssEnemy').textContent=rival()[0].toUpperCase();
 $('#feedback').textContent='Önemli pozisyonlar sana geldiğinde oyuna müdahale et.';
 showMoment();
};
rootUnused();
function rootUnused(){/* explicit no-op: all career and league screens are preserved */ }
})();
