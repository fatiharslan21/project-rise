const test=require('node:test'),assert=require('node:assert/strict');
const H=require('../engine/highlights.js'),roles=require('../engine/roles.js');
test('all 20 football positions receive a five-highlight match',()=>{
 for(const r of roles.positions){
  const m=H.newMatch(r.id,{shot:75,passing:70});
  assert.equal(m.position,r.id);assert.equal(m.highlights.length,5);
  assert.ok(H.actions(H.current(m).type).length>=3);
 }
});
test('all five moments advance match and career-safe stats',()=>{
 const m=H.newMatch('CM',{passing:99,shot:90,tech:90},100,100,()=>.5);
 for(let i=0;i<5;i++){
  const moment=H.current(m),action=H.actions(moment.type)[0].id;
  const target=H.requiredTarget(moment,action);
  const result=H.resolve(m,action,target,.8,()=>.6);
  assert.ok(result.minute>=1&&result.minute<=90);
 }
 assert.equal(m.done,true);
 assert.equal(m.index,5);
 assert.equal(m.results.length,5);
 assert.equal(H.current(m),null);
 assert.throws(()=>H.resolve(m,'pass',{x:170,y:190},.7));
 assert.ok(H.rating(m)>=1&&H.rating(m)<=10);
});
test('goalkeeper direction and skill affect a save',()=>{
 const m=H.newMatch('GK',{reflexes:95},100,100,()=>.4);
 const moment=H.current(m);
 const good=H.resolve(m,'save',moment.marker,.65,()=>.01);
 assert.equal(good.success,true);assert.equal(m.stats.saves,1);assert.equal(m.away,0);
});
test('a properly aimed powerful shot can score',()=>{
 const m=H.newMatch('ST',{shot:95},100,100,()=>.5);
 const moment=H.current(m);
 let trial=0;const score=H.resolve(m,'shoot',{x:moment.marker.x,y:42},.95,()=>trial++===0?0:1);
 assert.equal(score.forGoals,1);assert.equal(m.home,1);assert.equal(m.stats.goals,1);
});
test('defender can intercept and record a tackle',()=>{
 const m=H.newMatch('CB',{defending:90},100,90,()=>.4);
 const moment=H.current(m);
 const result=H.resolve(m,'tackle',moment.marker,.7,()=>.01);
 assert.equal(result.success,true);assert.equal(m.stats.tackles,1);
});
test('invalid action or missing target does not advance match',()=>{
 const m=H.newMatch('GK');
 assert.throws(()=>H.resolve(m,'shoot',{x:100,y:42}));
 assert.throws(()=>H.resolve(m,'save',null));
 assert.equal(m.index,0);
});
