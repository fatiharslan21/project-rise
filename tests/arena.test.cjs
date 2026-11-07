const test=require('node:test'),assert=require('node:assert/strict'),a=require('../arena/engine.js');
test('all 20 positions map to a controlled on-field footballer',()=>{
 const roles=require('../engine/roles.js');
 for(const r of roles.positions){
  const g=a.newGame(r.id);assert.ok(g.controlled>=0&&g.controlled<6);
  assert.equal(g.home.length,6);assert.equal(g.away.length,6);
  assert.equal(g.ball.ownerTeam,'home');
 }
});
test('controls move only controlled player, and bounds are enforced',()=>{
 const g=a.newGame('CM'),p=a.control(g),before=p.x;
 a.step(g,.04,{moveX:1});assert.ok(p.x>before);
 for(let i=0;i<700;i++)a.step(g,.05,{moveX:1});
 assert.ok(p.x<=a.RIGHT-9);
});
test('player can shoot and ball travels toward upper opponent goal',()=>{
 const g=a.newGame('ST',{shot:85}),initial=g.ball.y;
 assert.equal(a.perform(g,'shoot',()=>.5),true);
 assert.equal(g.stats.shots,1);
 assert.equal(g.ball.ownerTeam,null);
 a.step(g,.04,{});
 assert.ok(g.ball.y<initial);
});
test('a correct pass releases the ball; action without ball fails',()=>{
 const g=a.newGame('CM',{passing:80});
 assert.equal(a.perform(g,'pass'),true);
 assert.equal(g.ball.ownerTeam,null);
 assert.equal(a.perform(g,'shoot'),false);
});
test('goals affect correct side and player stat',()=>{
 const g=a.newGame('ST');
 g.ball.ownerTeam=null;g.ball.kind='shot';g.ball.byUser=true;g.ball.x=190;g.ball.y=36;g.ball.vy=-80;g.ball.vx=0;g.ball.lock=.5;
 a.step(g,.04,{});
 assert.equal(g.scoreHome,1);assert.equal(g.stats.goals,1);
});
test('match terminates and rejects further actions',()=>{
 const g=a.newGame('GK');g.elapsed=74.98;
 a.step(g,.04);assert.equal(g.ended,true);
 assert.equal(a.perform(g,'pass'),false);
});
test('goalkeeper movement constrained near its goal',()=>{
 const g=a.newGame('GK');
 for(let i=0;i<100;i++)a.step(g,.04,{moveY:-1});
 assert.ok(a.control(g).y>=390);assert.ok(a.control(g).y<=a.BOTTOM);
});
