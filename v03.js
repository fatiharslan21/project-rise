/* PROJECT RISE 0.3 — position-aware career UI and tactical role challenges. */
(function(){
 'use strict';
 const R=window.RiseRoles;
 if(!R)throw Error('Position engine not loaded');
 const $=s=>document.querySelector(s);
 const oldRender=render, oldStart=startGame, oldEnd=endGame;
 const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clamp3=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
 const statKeys=['saves','tackles','keyPasses','crosses','assists','shots'];
 const statNames={saves:'Kurtarış',tackles:'Müdahale',keyPasses:'Kilit pas',crosses:'Başarılı orta',assists:'Asist',shots:'Şut'};
 const missionTitles={save:'KALECİ MÜCADELESİ',defend:'SAVUNMA MÜCADELESİ',pass:'PAS VE OYUN KURMA',cross:'KANAT / ORTA MÜCADELESİ',shoot:'ŞUT MÜCADELESİ'};
 let session=null, scenario=null;
 const select=$('#footballerPosition');
 select.innerHTML=R.positions.map(p=>'<option value="'+p.id+'">'+p.id+' — '+p.name+'</option>').join('');
 select.value=R.has(data.position)?data.position:'ST';
 document.querySelector('#training .note').insertAdjacentHTML('beforebegin',
  '<div class="card" id="roleCareerPanel"><div class="overline">TEST MODU · MEVKİ DENE</div>'+
  '<p class="small" style="line-height:1.6">Bu beta sürümünde tüm mevkileri deneyebilirsin. Tam oyunda mevki değiştirmek teknik direktör ve antrenman kararlarına bağlı olacak.</p>'+
  '<label for="positionSwitch" class="small">Futbolcu mevkiin</label><select id="positionSwitch" class="position-select"></select></div>');
 $('#positionSwitch').innerHTML=select.innerHTML;
 document.querySelector('#training .note').insertAdjacentHTML('beforebegin','<div id="roleTrainingCards"></div>');
 document.querySelectorAll('#training .card.training').forEach(el=>el.classList.add('legacy-training'));
 document.querySelector('#career .overview').insertAdjacentHTML('afterend',
  '<div class="card role-panel" id="rolePanel"><div class="overline">MEVKİ GELİŞİMİ</div><div class="role-panel-body">'+
  '<div><strong id="roleTitle">Santrfor</strong><div class="small" id="roleDescription"></div></div>'+
  '<div class="role-rating"><strong id="lastMatchRating">—</strong><small>SON MAÇ PUANI</small></div></div>'+
  '<div id="roleRecords" class="role-records"></div></div>');
 document.querySelector('#match .field-wrap').insertAdjacentHTML('afterend','<div class="role-stage" id="roleStage" aria-live="polite"></div>');

 function ensure(){
  data.skills=R.ensureSkills(data.skills);
  if(!R.has(data.position))data.position='ST';
  if(!data.roleStats || typeof data.roleStats!=='object')data.roleStats={};
  for(const k of statKeys){
   if(!Number.isFinite(data.roleStats[k]))data.roleStats[k]=0;
   else data.roleStats[k]=clamp3(data.roleStats[k],0,1000000);
  }
  if(!Number.isFinite(data.lastMatchRating))data.lastMatchRating=0;
 }
 playerRating=function(){ensure();return R.rated(data.position,data.skills);};
 function drawTraining(){
  const role=R.get(data.position);
  const top=R.topSkills(role.id,4);
  const metrics=R.topSkills(role.id,3);
  ['#skillShot','#skillTech','#skillMental'].forEach((id,i)=>{
   const item=metrics[i],span=$(id);
   span.textContent=data.skills[item.id];
   span.nextElementSibling.textContent=item.name.toUpperCase();
  });
  $('#positionSwitch').value=role.id;
  $('#roleTrainingCards').innerHTML=top.map(item=>{
   const maxed=data.skills[item.id]>=99,canPay=data.coins>=100;
   return '<div class="card training position-training"><div class="train-icon">↗</div><div class="details">'+
    '<strong>'+esc(item.name)+' · '+data.skills[item.id]+'/99</strong>'+
    '<small>'+esc(role.name)+' kariyerinin öncelikli becerisi</small></div>'+
    '<button class="trainbtn" data-upgrade="'+item.id+'" '+(maxed||!canPay?'disabled':'')+'>'+
    (maxed?'MAKS': '✦ 100')+'</button></div>';
  }).join('');
 }
 function drawCareer(){
  const role=R.get(data.position);
  $('#roleTitle').textContent=role.id+' · '+role.name;
  $('#roleDescription').textContent=missionTitles[role.mission]+' · '+role.group;
  $('#lastMatchRating').textContent=data.lastMatchRating?Number(data.lastMatchRating).toFixed(1):'—';
  const activeKeys=role.mission==='save'?['saves']:role.mission==='defend'?['tackles']:
    role.mission==='pass'?['keyPasses','assists']:role.mission==='cross'?['crosses','assists']:['shots'];
  $('#roleRecords').innerHTML=activeKeys.map(k=>'<div><strong>'+data.roleStats[k]+'</strong><span>'+statNames[k]+'</span></div>').join('');
  document.querySelector('#career .role').textContent=role.name+' · İstanbul Athletic FC · Türkiye';
  // v0.1 history assumes every position is a striker. Render role-aware match histories instead.
  $('#history').innerHTML=data.history.length?data.history.slice(0,5).map(h=>{
   const p=R.get(h.position||'ST');
   const performance=h.rating?Number(h.rating).toFixed(1)+' puan · ':'';
   const detail=p.mission==='shoot'?(h.goals||0)+' gol':(h.actionCount||0)+' başarılı aksiyon';
   return '<div class="listrow"><div><strong>İstanbul Athletic – '+esc(h.name)+'</strong><br>'+
    '<small>'+esc(p.id)+' · '+performance+detail+' · Maç '+h.week+'</small></div>'+
    '<div class="statvalue">'+h.us+' - '+h.them+'</div></div>';
  }).join(''):'<div class="empty">Henüz maç oynanmadı.</div>';
 }
 render=function(){
  ensure();oldRender();drawTraining();drawCareer();save();
 };
 $('#roleTrainingCards').addEventListener('click',event=>{
  const button=event.target.closest('button[data-upgrade]');if(!button)return;
  const key=button.dataset.upgrade;
  if(!Object.prototype.hasOwnProperty.call(R.initialSkills,key))return;
  if(data.skills[key]>=99){notify('Bu beceri en yüksek seviyede.');return;}
  if(data.coins<100){notify('Yeterli kredi yok.');return;}
  data.coins-=100;data.skills[key]=Math.min(99,data.skills[key]+2);
  render();notify(R.skillNames[key]+' +2 gelişti.');
 });
 $('#positionSwitch').addEventListener('change',event=>{
  const code=event.target.value;
  if(!R.has(code)||game.running){notify('Maç sırasında mevki değiştirilemez.');event.target.value=data.position;return;}
  data.position=code;render();notify(R.get(code).name+' mevkiine geçtin.');
 });
 $('#reset').addEventListener('click',()=>{
  if(!data.profileCreated){$('#profileOverlay').hidden=false;select.value='ST';}
 });

 function stageScenario(){
  if(!session||!game.running)return;
  scenario=R.newScenario(session.position);
  const role=R.get(session.position);
  $('#roleStage').innerHTML='<div class="role-stage-head"><div class="overline">'+missionTitles[role.mission]+'</div>'+
   '<strong>POZİSYON '+(game.chance+1)+' / '+game.maxChances+'</strong></div>'+
   '<div class="tactical-pitch"><div class="tactical-half-circle"></div>'+
   '<div class="tactical-lanes"><div>SOL</div><div>ORTA</div><div>SAĞ</div></div>'+
   '<div class="tactical-ball">⚽</div></div>'+
   '<p class="role-instruction">'+esc(scenario.text)+'</p>'+
   '<div class="role-choice"><button data-lane="0" aria-label="Sol koridor">← SOL</button>'+
   '<button data-lane="1" aria-label="Orta koridor">↑ ORTA</button>'+
   '<button data-lane="2" aria-label="Sağ koridor">SAĞ →</button></div>'+
   '<p class="role-tip">Taktik seçimin, oyuncu özelliklerin, enerjin ve moralin sonuca etki eder.</p>';
  $('#feedback').textContent='Sahadaki ipucunu oku ve doğru bölgeyi seç.';
 }
 const labels={
  save:['🧤 Harika kurtarış!','⚽ Şut ağlarda.'],
  defend:['🛡️ Topu kazandın!','⚠️ Rakip savunmayı geçti.'],
  pass:['🎯 Başarılı kilit pas!','⛔ Pas arası yapıldı.'],
  cross:['🚀 İsabetli orta!','⛔ Ortan etkisiz kaldı.']
 };
 function roleChoose(lane){
  if(!session||!scenario||!game.running||session.waiting||game.chance>=game.maxChances)return;
  const result=R.resolve(session.position,lane,scenario.target,data.skills,data.energy,data.morale);
  session.success+=Number(result.success);
  if(result.stat)session.stats[result.stat]=(session.stats[result.stat]||0)+1;
  if(result.assist)session.stats.assists=(session.stats.assists||0)+1;
  game.us+=result.forGoals;game.them+=result.againstGoals;
  game.chance++;session.waiting=true;
  updateScore();
  const message=labels[session.mission][result.success?0:1]+
    (result.forGoals?' · ⚽ Takımın gol buldu!':'')+
    (result.againstGoals?' · Rakip gol attı.':'');
  $('#feedback').textContent=message;
  if(game.chance===game.maxChances){
   const rate=clamp3(6.2+session.success*.95-(game.maxChances-session.success)*.42,1,10);
   $('#roleStage').innerHTML='<div class="role-final"><div class="overline">MAÇ TAMAMLANDI</div>'+
    '<div class="role-final-score">'+session.success+' / '+game.maxChances+'</div>'+
    '<h2>'+esc(message)+'</h2><p>Başarılı aksiyon · Tahmini maç notu '+rate.toFixed(1)+'</p></div>';
   scenario=null;endGame();
  }else{
   $('#roleStage').innerHTML='<div class="role-final"><div class="overline">POZİSYON SONUCU</div>'+
    '<h2>'+esc(message)+'</h2><p>'+(game.maxChances-game.chance)+' pozisyon kaldı.</p>'+
    '<button class="cta" data-next="1">SONRAKİ POZİSYON →</button></div>';
  }
 }
 $('#roleStage').addEventListener('click',event=>{
  const lane=event.target.closest('[data-lane]');
  const next=event.target.closest('[data-next]');
  if(lane)roleChoose(Number(lane.dataset.lane));
  if(next&&session&&game.running){session.waiting=false;stageScenario();}
 });
 document.addEventListener('keydown',event=>{
  if(!game.running||!session||scenario===null||session.waiting)return;
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
  if(['1','2','3'].includes(event.key))roleChoose(Number(event.key)-1);
 });
 startGame=function(){
  const role=R.get(data.position);
  session=null;scenario=null;$('#match').classList.toggle('role-mode',role.mission!=='shoot');
  if(role.mission==='shoot'){oldStart();return;}
  game=initialGame();game.running=true;game.them=Math.random()<.3?1:0;
  game.us=Math.random()<.5?1:0;
  session={position:data.position,mission:role.mission,success:0,stats:{},waiting:false};
  $('#matchButton').disabled=true;$('#matchButton').textContent='⚽ MAÇ OYNANIYOR';
  $('#matchState').textContent='CANLI';
  $('#fieldTip').textContent='';updateScore();stageScenario();
 };
 endGame=function(){
  if(game.done)return;
  const position=data.position,role=R.get(position);
  const record=session?{...session,stats:{...session.stats}}:null;
  const chanceCount=game.chance,goals=game.playerGoals;
  oldEnd();
  ensure();
  if(record&&record.mission!=='shoot'){
   for(const [key,count] of Object.entries(record.stats)){
    if(Object.prototype.hasOwnProperty.call(data.roleStats,key))data.roleStats[key]+=count;
   }
   const bonus=record.success*18;
   data.xp+=bonus;data.coins+=record.success*15;
   data.lastMatchRating=clamp3(6.2+record.success*.95-(chanceCount-record.success)*.42,1,10);
   const h=data.history[0];h.position=position;h.actionCount=record.success;h.rating=data.lastMatchRating;
   $('#feedback').textContent+=' · '+record.success+' başarılı görev, +'+bonus+' XP.';
  }else{
   data.roleStats.shots+=chanceCount;
   data.lastMatchRating=clamp3(6.2+goals*1.2-(chanceCount-goals)*.18,1,10);
   const h=data.history[0];h.position=position;h.actionCount=goals;h.rating=data.lastMatchRating;
  }
  render();save();
 };
 ensure();render();
})();