/* PROJECT RISE v0.4 — non-destructive optional realtime match mode. */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const oldStart=startGame,oldEnd=endGame,oldGo=go,oldRender=render;
let arena=null,liveMode=false,finalizing=false;
const PREF_KEY='project-rise-v04-mode';
let mode;
try{mode=localStorage.getItem(PREF_KEY)==='classic'?'classic':'arena';}catch{mode='arena';}
const stage=$('#match');
stage.insertAdjacentHTML('afterbegin','<div class="arena-intro" id="arenaIntro"><span class="tag">v0.4 · GERÇEK SAHA BETA</span><span class="small">6v6 · 75 saniye</span></div>');
stage.querySelector('.field-wrap').insertAdjacentHTML('beforebegin',
 '<div id="arenaShell" class="arena-shell">'+
 '<div class="arena-hud"><span id="arenaClock">01:15</span><strong id="arenaScore">0 : 0</strong><span id="arenaPosition">ST</span></div>'+
 '<div id="arenaCanvas" class="arena-viewport"></div>'+
 '<div class="arena-controls"><button type="button" data-arena-action="pass">↗ PAS <small>Q</small></button>'+
 '<button type="button" data-arena-action="shoot">⚽ ŞUT <small>SPACE</small></button>'+
 '<button type="button" data-arena-action="tackle">🛡 TOP KAP <small>E</small></button></div>'+
 '<div class="arena-help">PC: WASD / ok tuşlarıyla hareket et; Q pas, SPACE şut, E müdahale. Telefonda sahaya basılı tutup sürükle.</div>'+
 '<p id="arenaFeed" class="arena-feed">Maç başlamadı.</p>'+
 '<button class="arena-fast" type="button" id="arenaFinish">⏩ BETA: MAÇI ERKEN BİTİR</button></div>'
);
document.querySelector('#career .card .fixture').parentElement.insertAdjacentHTML('afterend',
 '<div class="card game-mode-card"><div class="overline">MAÇ MOTORU</div>'+
 '<div class="mode-selector"><button type="button" data-match-mode="arena">⚽ GERÇEK SAHA <small>Beta v0.4</small></button>'+
 '<button type="button" data-match-mode="classic">🎯 KLASİK <small>Şut / rol görevleri</small></button></div>'+
 '<div id="modeDescription" class="small" style="margin-top:10px;line-height:1.5"></div></div>');
function ensureFallback(){
 if(mode==='arena'&&(!window.Phaser||!window.RiseArena||!window.RiseArenaView)){
  mode='classic';$('#modeDescription').textContent='Saha motoru yüklenemedi. Klasik maç moduna geçildi; internet bağlantını kontrol et.';
 }
}
function drawMode(){
 document.querySelectorAll('[data-match-mode]').forEach(button=>button.classList.toggle('chosen',button.dataset.matchMode===mode));
 $('#modeDescription').textContent=mode==='arena'?
  'Yeni canlı maç motorunda seçtiğin mevkideki futbolcuyu kontrol et. Pas, şut, müdahale ve gol sonuçları kariyerine işlenir.':
  'Önceki şut / taktik mini görevleriyle maça çık.';
}
function updateHud(model){
 if(!model)return;
 $('#arenaClock').textContent=String(Math.floor(Math.max(0,model.duration-model.elapsed)/60)).padStart(2,'0')+':'+String(Math.floor(Math.max(0,model.duration-model.elapsed)%60)).padStart(2,'0');
 $('#arenaScore').textContent=model.scoreHome+' : '+model.scoreAway;
 $('#arenaPosition').textContent=model.position;
 $('#arenaFeed').textContent=model.event;
 $('#score').innerHTML=model.scoreHome+' <span>:</span> '+model.scoreAway;
 $('#chances').textContent='Canlı saha · '+model.stats.shots+' şut · '+model.stats.passes+' isabetli pas · '+model.stats.tackles+' müdahale';
}
function clean(){
 if(arena){arena.destroy();arena=null;}
 stage.classList.remove('arena-mode');
 liveMode=false;
}
function finish(model){
 if(finalizing||!liveMode||game.done)return;
 finalizing=true;
 updateHud(model);
 // Give legacy career processing a completed match with unchanged v0.1/v0.2 save contract.
 game.us=model.scoreHome;game.them=model.scoreAway;game.playerGoals=model.stats.goals;
 game.chance=0;game.running=true;game.done=false;
 try {
  if(typeof window.RiseClearRoleSession==='function')window.RiseClearRoleSession();
  oldEnd();
  for(const k of ['saves','tackles','keyPasses','crosses','assists','shots']){
   if(!Number.isFinite(data.roleStats[k]))data.roleStats[k]=0;
   data.roleStats[k]+=model.stats[k]||0;
  }
  const role=window.RiseRoles?RiseRoles.get(data.position):{mission:'shoot'};
  const primary={save:'saves',defend:'tackles',pass:'passes',cross:'crosses',shoot:'goals'}[role.mission]||'goals';
  const actions=model.stats[primary]||0;
  const rating=Math.max(3,Math.min(10,6.1+actions*.35+model.stats.assists*.5+(game.us>game.them?.5:game.us<game.them?-.4:0)));
  data.lastMatchRating=Number(rating.toFixed(1));
  if(data.history[0]){
   data.history[0].position=data.position;
   data.history[0].actionCount=actions;
   data.history[0].rating=data.lastMatchRating;
   data.history[0].engine='live-v04';
   data.history[0].arenaStats={...model.stats};
  }
  data.xp+=Math.min(160,actions*10);
  $('#feedback').textContent='Gerçek saha maçı tamamlandı · '+model.stats.shots+' şut · '+model.stats.passes+' pas · '+model.stats.saves+' kurtarış · '+model.stats.tackles+' müdahale. Kariyerine kaydedildi.';
  $('#matchState').textContent='MAÇ SONU';
  $('#matchButton').disabled=false;$('#matchButton').textContent='← KARİYERE DÖN';
  render();save();
 } finally {
  // Keep final score visible until user returns to career.
  if(arena){arena.destroy();arena=null;}
  finalizing=false;
 }
}
function beginArena(){
 if(!window.Phaser||!window.RiseArenaView||!window.RiseArena){notify('Canlı saha yüklenemedi, klasik moda geçiliyor.');mode='classic';drawMode();oldStart();return;}
 clean();
 stage.classList.add('arena-mode');
 liveMode=true;
 game=initialGame();game.running=true;game.done=false;game.chance=0;
 $('#matchState').textContent='CANLI SAHA';
 $('#matchButton').disabled=true;$('#matchButton').textContent='MAÇ DEVAM EDİYOR';
 $('#feedback').textContent='Seçtiğin futbolcuyu hareket ettirerek oyuna katıl. Bu oyun motoru beta aşamasındadır.';
 $('#arenaFeed').textContent='İlk düdük çalıyor...';
 $('#arenaPosition').textContent=data.position;
 try{
  arena=RiseArenaView.mount({
   parent:'arenaCanvas',position:data.position,skills:data.skills,
   onTick:updateHud,onFinish:finish
  });
  updateHud(arena.model);
 }catch(err){
  console.error('Arena engine failed',err);
  clean();mode='classic';drawMode();notify('Saha açılamadı. Klasik moda geçiliyor.');oldStart();
 }
}
startGame=function(){
 if(mode==='arena')beginArena();
 else{clean();oldStart();}
};
go=function(screen){
 if(screen!=='match'&&arena&&!game.running)clean();
 oldGo(screen);
};
document.querySelectorAll('[data-match-mode]').forEach(button=>button.addEventListener('click',()=>{
 if(game.running){notify('Maç sürerken mod değiştirilemez.');return;}
 mode=button.dataset.matchMode;
 ensureFallback();drawMode();
 try{localStorage.setItem(PREF_KEY,mode)}catch{}
}));
stage.querySelectorAll('[data-arena-action]').forEach(button=>button.addEventListener('pointerdown',event=>{
 event.stopPropagation();
 if(liveMode&&arena&&game.running)arena.action(button.dataset.arenaAction);
}));
$('#arenaFinish').addEventListener('click',()=>{
 if(!liveMode||!arena||!game.running)return;
 if(!confirm('Beta maçını şu anki skorla bitirmek istiyor musun?'))return;
 const model=arena.model;model.ended=true;finish(model);
});
document.querySelector('#matchButton').addEventListener('click',()=>{
 // The v0.1 button handler ran first and reset the match on return.
 if(!game.running&&game.done===false&&liveMode){clean();}
});
window.addEventListener('beforeunload',()=>{
 if(liveMode&&game.running){/* match is deliberately not persisted until full time */}
});
ensureFallback();drawMode();
})();