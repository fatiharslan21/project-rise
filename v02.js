/* Career extension. Preserves project-rise-v01 localStorage records. */
(function(){
 'use strict';
 if(typeof RiseLeague==='undefined')return;
 const E=RiseLeague;
 const clubs=[
  ['İstanbul Athletic','IA',71],['Boğaziçi FK','BF',68],['Anadolu Gücü','AG',73],
  ['Ege Yıldızları','EY',69],['Kuzeyspor','KS',72],['Başkent 06','B6',75],
  ['Marmara City','MC',74],['Karadeniz United','KU',67]
 ];
 const rounds=E.roundRobin(clubs.length),seasonLength=rounds.length;
 const oldRender=render,oldEndGame=endGame,oldGo=go;
 const clamp2=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
 const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 if(rivals.length===6)rivals.push(['Karadeniz United','KU']);
 const newLeague=()=>E.empty(clubs.map(c=>c[0]));
 function ensure(){
  if(!Number.isInteger(data.season)||data.season<1)data.season=1;
  if(!Number.isInteger(data.seasonWeek)||data.seasonWeek<0||data.seasonWeek>=seasonLength)data.seasonWeek=0;
  if(!Array.isArray(data.league)||data.league.length!==8)data.league=newLeague();
  if(!Array.isArray(data.archive))data.archive=[];
  if(!Array.isArray(data.news))data.news=[];
  if(!Number.isFinite(data.energy))data.energy=100;
  if(!Number.isFinite(data.morale))data.morale=75;
  data.energy=clamp2(data.energy,0,100);data.morale=clamp2(data.morale,0,100);
  data.position=(typeof RiseRoles!=='undefined' ? RiseRoles.has(data.position) : ['ST','LW','RW','CAM','CM'].includes(data.position)) ? data.position : 'ST';
  data.age=Number.isInteger(data.age)?data.age:18;
  data.profileCreated=Boolean(data.profileCreated||data.matches>0);
  if(!Number.isInteger(data.lastRest))data.lastRest=-1;
 }
 function pair(){return rounds[data.seasonWeek].find(p=>p.includes(0));}
 function opponent(){const p=pair();return clubs[p[0]===0?p[1]:p[0]].slice(0,2);}
 rival=opponent;
 document.querySelector('main.app').insertAdjacentHTML('beforeend',
  '<section class="screen" id="world"><div class="sectionhead"><h2>Lig merkezi</h2><span class="small" id="seasonTitle"></span></div>'+
  '<div class="card"><div class="overline">PUAN DURUMU</div><div style="overflow-x:auto"><table class="ladder"><thead><tr><th>TAKIM</th><th>O</th><th>G</th><th>B</th><th>M</th><th>AV</th><th>P</th></tr></thead><tbody id="tableRows"></tbody></table></div></div>'+
  '<div class="sectionhead"><h2>Haftanın maçları</h2><span class="small" id="weekTitle"></span></div><div class="card" id="fixtureRows"></div>'+
  '<div class="sectionhead"><h2>Futbolcu hayatı</h2></div><div class="card"><strong>Toparlanma</strong><p class="small">Maçlar enerjini düşürür. Her maç haftasında bir kez dinlenip enerjini ve moralini yükseltebilirsin.</p>'+
  '<button class="secondary-btn" id="restBtn">☕ DİNLEN · +25 ENERJİ</button><div id="story" class="pressbox"></div></div>'+
  '<div class="sectionhead"><h2>Geçmiş sezonlar</h2></div><div class="card" id="seasonArchive"></div>'+
  '<div class="sectionhead"><h2>Kayıt ve yedekleme</h2></div><div class="card"><p class="small">Kayıtlar yalnızca bu tarayıcıda. JSON indirerek cihaz değiştirebilirsin.</p><div class="tool-buttons">'+
  '<button class="secondary-btn" id="saveExport">↓ YEDEĞİ İNDİR</button><button class="secondary-btn" id="saveImport">↑ YEDEK YÜKLE</button><input id="saveInput" type="file" accept=".json,application/json"></div></div></section>'
 );
 document.querySelector('.tabinner').insertAdjacentHTML('beforeend','<button class="tab" data-screen="world"><span class="ico">🏆</span>LİG</button>');
 document.querySelector('#career .hero').insertAdjacentHTML('afterend','<div class="overview"><div><strong id="ovSeason">1</strong><small>SEZON</small></div><div><strong id="ovEnergy">100%</strong><small>ENERJİ</small></div><div><strong id="ovMorale">75%</strong><small>MORAL</small></div></div>');
 document.body.insertAdjacentHTML('beforeend','<div id="profileOverlay" class="profile-overlay" hidden><div class="profile-card">'+
  '<span class="tag">YENİ KARİYER</span><h2>Hikâyen başlıyor.</h2><p>İlk profesyonel sözleşmeni imzaladın. Adını ve mevkini seç, futbol efsaneni yarat.</p>'+
  '<form id="profileForm"><label for="footballerName">FUTBOLCU ADI</label><input id="footballerName" required minlength="2" maxlength="24" autocomplete="off" value="Genç Yetenek">'+
  '<label for="footballerPosition">MEVKİ</label><select id="footballerPosition"><option value="ST">Santrfor</option><option value="LW">Sol kanat</option><option value="RW">Sağ kanat</option><option value="CAM">Ofansif orta saha</option><option value="CM">Merkez orta saha</option></select>'+
  '<button class="cta" type="submit">KARİYERİ BAŞLAT</button></form></div></div>');
 function drawWorld(){
  document.querySelector('#ovSeason').textContent=data.season;
  document.querySelector('#ovEnergy').textContent=Math.round(data.energy)+'%';
  document.querySelector('#ovMorale').textContent=Math.round(data.morale)+'%';
  document.querySelector('#seasonTitle').textContent='Sezon '+data.season;
  document.querySelector('#weekTitle').textContent='Hafta '+(data.seasonWeek+1)+' / '+seasonLength;
  document.querySelector('#tableRows').innerHTML=E.table(data.league).map((c,i)=>
   '<tr class="'+(c.id===0?'myclub':'')+'"><td><span class="rank">'+(i+1)+'</span>'+esc(c.name)+'</td><td>'+c.played+'</td><td>'+c.win+'</td><td>'+c.draw+'</td><td>'+c.loss+'</td><td>'+(c.gf-c.ga)+'</td><td><b>'+c.pts+'</b></td></tr>'
  ).join('');
  document.querySelector('#fixtureRows').innerHTML=rounds[data.seasonWeek].map(p=>'<div class="fixture-row"><span>'+esc(clubs[p[0]][0])+'</span><b>VS</b><span>'+esc(clubs[p[1]][0])+'</span></div>').join('');
  document.querySelector('#story').textContent=data.news[0]||'Kulübün seni izliyor. Bu sezon forma savaşında performansın belirleyici.';
  document.querySelector('#seasonArchive').innerHTML=data.archive.length?
    data.archive.slice(0,12).map(x=>'<div class="fixture-row"><strong>Sezon '+x.season+' · '+esc(x.achievement)+'</strong><span>'+x.rank+'. sıra · '+x.points+' P</span></div>').join(''):
    '<p class="small">İlk sezon tamamlanınca arşiv burada görünecek.</p>';
  document.querySelector('#restBtn').disabled=data.lastRest===data.matches||data.energy>=100;
 }
 function drawFixture(){
  const r=opponent();
  $('#rival').textContent=r[0];$('#rivalBadge').textContent=r[1];$('#matchRival').textContent=r[0];
  $('#week').textContent='Sezon '+data.season+' · Hafta '+(data.seasonWeek+1)+' / '+seasonLength;
  $('#pts').textContent=data.league[0].pts;
  document.querySelector('#career .hero .overline').textContent='OYUNCU KARTI / SEZON '+String(data.season).padStart(2,'0');
  document.querySelector('#career .playerline .overline').textContent=data.position+' / '+data.age+' YAŞ';
 }
 render=function(){ensure();oldRender();drawFixture();drawWorld();};
 go=function(screen){oldGo(screen);if(screen==='world')drawWorld();};
 function finishSeason(){
  const position=E.table(data.league).findIndex(x=>x.id===0)+1;
  const score=data.league[0].pts,season=data.season;
  const prize=Math.max(300,1350-position*130);
  const achievement=position===1?'ŞAMPİYON':position<=3?'İLK ÜÇ':'SEZON BİTTİ';
  data.archive.unshift({season,rank:position,points:score,achievement});
  data.coins+=prize;data.xp+=Math.max(120,600-position*50);
  data.fans+=position===1?2200:Math.max(60,950-position*100);
  data.energy=100;data.morale=clamp2(data.morale+12,0,100);
  data.season++;data.age++;data.seasonWeek=0;data.league=newLeague();data.points=0;
  data.news.unshift('Sezon '+season+' tamamlandı! '+position+'. sıradasın. '+prize+' kredi ödülü aldın.');
  notify('Sezon '+season+': '+position+'. sıra · +'+prize+' kredi');
 }
 endGame=function(){
  oldEndGame();
  const m=data.history[0],week=rounds[data.seasonWeek],p=pair(),oursHome=p[0]===0;
  E.record(data.league,p[0],p[1],oursHome?m.us:m.them,oursHome?m.them:m.us);
  for(const [h,a] of week){if(h===0||a===0)continue;const result=E.simulate(clubs[h][2],clubs[a][2]);E.record(data.league,h,a,result[0],result[1]);}
  data.seasonWeek++;
  data.points=data.league[0].pts;
  data.energy=clamp2(data.energy-17-Math.round(Math.random()*5),0,100);
  data.morale=clamp2(data.morale+(m.us>m.them?8:m.us===m.them?2:-9),0,100);
  data.news.unshift('Basın: '+data.name+' ve takımı '+m.name+' karşısında '+(m.us>m.them?'kazandı.':m.us===m.them?'berabere kaldı.':'mağlup oldu.'));
  data.news=data.news.slice(0,25);
  if(data.seasonWeek===seasonLength)finishSeason();
  render();save();
 };
 document.querySelector('.tabinner [data-screen="world"]').addEventListener('click',()=>go('world'));
 $('#restBtn').addEventListener('click',()=>{
  if(data.lastRest===data.matches)return notify('Bu hafta zaten dinlendin.');
  data.lastRest=data.matches;data.energy=clamp2(data.energy+25,0,100);data.morale=clamp2(data.morale+4,0,100);
  data.news.unshift('Dinlenme günü: enerjin ve moralin yükseldi.');render();notify('Dinlenme tamamlandı!');
 });
 $('#profileForm').addEventListener('submit',e=>{
  e.preventDefault();const name=$('#footballerName').value.trim().replace(/[<>"&]/g,'');
  if(name.length<2)return notify('En az iki karakter gir.');
  data.name=name.slice(0,24);data.position=$('#footballerPosition').value;data.profileCreated=true;
  $('#profileOverlay').hidden=true;render();notify('İlk kariyerin başladı!');
 });
 $('#saveExport').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify({format:'project-rise-v02',career:data},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='project-rise-career.json';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 $('#saveImport').addEventListener('click',()=>$('#saveInput').click());
 $('#saveInput').addEventListener('change',async e=>{
  const file=e.target.files&&e.target.files[0];if(!file)return;
  try{
   if(file.size>2000000)throw Error('Dosya çok büyük');
   const parsed=JSON.parse(await file.text());
   if(parsed.format!=='project-rise-v02'||!parsed.career||!Array.isArray(parsed.career.league)||parsed.career.league.length!==8)throw Error('Geçersiz yedek');
   if(!confirm('Mevcut kariyerin yedekteki kayıtla değiştirilsin mi?'))return;
   const saved=parsed.career;
   data={...defaultData(),...saved,skills:{
    shot:clamp2(saved.skills&&saved.skills.shot,1,99),
    tech:clamp2(saved.skills&&saved.skills.tech,1,99),
    mental:clamp2(saved.skills&&saved.skills.mental,1,99)}};
   data.name=String(data.name||'Genç Yetenek').replace(/[<>"&]/g,'').slice(0,24);
   data.history=Array.isArray(data.history)?data.history.slice(0,250).map(h=>({
    name:String(h.name||'Rakip').replace(/[<>"&]/g,'').slice(0,35),
    week:clamp2(h.week,0,99999),us:clamp2(h.us,0,30),them:clamp2(h.them,0,30),goals:clamp2(h.goals,0,30)})):[];
   data.league=newLeague().map((row,i)=>{const old=saved.league[i]||{};for(const key of ['played','win','draw','loss','gf','ga','pts'])row[key]=clamp2(old[key],0,999);return row;});
   data.matches=clamp2(data.matches,0,99999);data.coins=clamp2(data.coins,0,99999999);
   data.seasonWeek=clamp2(Math.floor(data.seasonWeek),0,13);data.profileCreated=true;
   ensure();game=initialGame();render();go('career');save();notify('Kariyer yüklendi.');
  }catch(err){notify('Yüklenemedi: '+err.message)}finally{e.target.value='';}
 });
 ensure();render();if(!data.profileCreated)$('#profileOverlay').hidden=false;
})();