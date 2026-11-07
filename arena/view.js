/* PROJECT RISE v0.4 — Phaser 3 visualization + controls.
   Simulation remains in RiseArena to keep tests renderer-independent. */
(function(root){
'use strict';
function mount(opts){
 if(typeof Phaser==='undefined')throw Error('Phaser yüklenemedi');
 if(typeof RiseArena==='undefined')throw Error('Saha kuralları yüklenemedi');
 const rules=RiseArena,model=rules.newGame(opts.position,opts.skills),prefix='RiseArenaScene';
 let scene=null,game=null,hasFinished=false,drawCount=0;
 const config={
  type:Phaser.AUTO,parent:opts.parent,backgroundColor:'#12462f',
  antialias:true,render:{pixelArt:false,transparent:false},
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:380,height:520},
  scene:{
   key:prefix,
   create:function(){
    scene=this;
    this.pitch=this.add.graphics();
    this.playerText=[];
    for(let i=0;i<12;i++){
     this.playerText.push(this.add.text(0,0,String(i%6===0?1:i%6+5),{
      fontSize:'10px',fontFamily:'Arial,sans-serif',color:'#ffffff',
      fontStyle:'bold',stroke:'#0b2536',strokeThickness:1
     }).setOrigin(.5));
    }
    this.ballMark=this.add.graphics();
    this.keys=this.input.keyboard?this.input.keyboard.addKeys({
     up:Phaser.Input.Keyboard.KeyCodes.UP,down:Phaser.Input.Keyboard.KeyCodes.DOWN,
     left:Phaser.Input.Keyboard.KeyCodes.LEFT,right:Phaser.Input.Keyboard.KeyCodes.RIGHT,
     w:Phaser.Input.Keyboard.KeyCodes.W,a:Phaser.Input.Keyboard.KeyCodes.A,
     s:Phaser.Input.Keyboard.KeyCodes.S,d:Phaser.Input.Keyboard.KeyCodes.D,
     shoot:Phaser.Input.Keyboard.KeyCodes.SPACE,pass:Phaser.Input.Keyboard.KeyCodes.Q,
     tackle:Phaser.Input.Keyboard.KeyCodes.E
    }):{};
    this.keyLatch={};
    this.pointerTarget=null;
    this.input.on('pointerdown',p=>{this.pointerTarget={x:p.x,y:p.y};});
    this.input.on('pointermove',p=>{if(p.isDown)this.pointerTarget={x:p.x,y:p.y};});
    this.input.on('pointerup',()=>{this.pointerTarget=null;});
    this.input.on('gameout',()=>{this.pointerTarget=null;});
    this.input.on('pointerupoutside',()=>{this.pointerTarget=null;});
    render(this);
   },
   update:function(time,delta){
    if(model.ended){if(!hasFinished){hasFinished=true;opts.onFinish(model);}return;}
    const keys=this.keys;
    const down=name=>Boolean(keys[name]&&keys[name].isDown);
    const input={moveX:Number(down('right')||down('d'))-Number(down('left')||down('a')),
      moveY:Number(down('down')||down('s'))-Number(down('up')||down('w')),
      target:this.pointerTarget};
    for(const [key,action] of [['shoot','shoot'],['pass','pass'],['tackle','tackle']]){
     if(down(key)&&!this.keyLatch[key])rules.perform(model,action);
     this.keyLatch[key]=down(key);
    }
    rules.step(model,Math.min(50,delta)/1000,input);
    render(this);
    drawCount++;
    if(drawCount%8===0 || model.ended)opts.onTick(model);
   }
  }
 };
 function render(s){
  const g=s.pitch;g.clear();
  g.fillStyle(0x155039).fillRect(0,0,380,520);
  for(let k=0;k<9;k++){g.fillStyle(k%2?0x16593d:0x1c6545,.8);g.fillRect(0,35+k*50,380,50);}
  g.lineStyle(2,0xe7f0e8,.76);
  g.strokeRect(19,35,342,450);
  g.lineBetween(19,260,361,260);
  g.strokeCircle(190,260,55);
  g.strokeRect(111,35,158,72);
  g.strokeRect(143,35,94,31);
  g.strokeRect(111,413,158,72);
  g.strokeRect(143,454,94,31);
  g.fillStyle(0xeef7f2).fillCircle(190,260,3.6).fillCircle(190,94,2.5).fillCircle(190,426,2.5);
  g.fillStyle(0x132b31).fillRect(144,15,92,17).fillRect(144,488,92,17);
  g.lineStyle(3,0xe4e8e8,.9).strokeRect(144,15,92,17).strokeRect(144,488,92,17);
  g.lineStyle(1,0xcfe4dc,.35);
  for(let x=152;x<=230;x+=10){g.lineBetween(x,15,x,32);g.lineBetween(x,488,x,505);}
  const teams=[['away',0xc85b6d,0xfaa8ad],['home',0xdab763,0xffe5a2]];
  for(const [name,fill,outline] of teams){
   for(const p of model[name]){
    const playerControlled=name==='home'&&p.id===model.controlled;
    g.fillStyle(0x051d1a,.38).fillEllipse(p.x+2,p.y+6,25,11);
    if(playerControlled){
     g.lineStyle(3,0x64f8e9,1);g.strokeCircle(p.x,p.y,18);
     g.fillStyle(0x64f8e9,.75).fillTriangle(p.x-7,p.y-26,p.x+7,p.y-26,p.x,p.y-18);
    }
    const color=p.keeper?name==='home'?0x43add1:0x5d88ff:fill;
    g.fillStyle(color,1).fillCircle(p.x,p.y,11.5);
    g.lineStyle(2,outline,.95).strokeCircle(p.x,p.y,11.5);
    const number=s.playerText[(name==='away'?0:6)+p.id];
    number.x=p.x;number.y=p.y;
   }
  }
  const b=model.ball;
  s.ballMark.clear();
  s.ballMark.fillStyle(0x0b1d17,.45).fillEllipse(b.x+2,b.y+6,15,7);
  s.ballMark.fillStyle(0xf7faf5).fillCircle(b.x,b.y,6.6);
  s.ballMark.lineStyle(1.5,0x182a32,.9).strokeCircle(b.x,b.y,6.6);
  s.ballMark.fillStyle(0x243345).fillCircle(b.x,b.y,2.3);
  if(b.ownerTeam==='home'&&b.ownerId===model.controlled){
   g.lineStyle(2,0xffffff,.5);g.strokeCircle(b.x,b.y,10);
  }
  if(s.pointerTarget){
   g.lineStyle(1.5,0x69e6d5,.5);g.strokeCircle(s.pointerTarget.x,s.pointerTarget.y,9);
  }
 }
 game=new Phaser.Game(config);
 const controller={
  model,
  action(kind){return rules.perform(model,kind);},
  end(){model.ended=true;},
  destroy(){
   if(game){game.destroy(true);game=null;}
   scene=null;
  }
 };
 return controller;
}
root.RiseArenaView={mount};
})(typeof window!=='undefined'?window:globalThis);