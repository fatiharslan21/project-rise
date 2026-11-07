const test=require('node:test'),assert=require('node:assert/strict');
const e=require('../engine/league.js');
test('round robin covers all clubs home and away exactly once',()=>{
 const rounds=e.roundRobin(8);assert.equal(rounds.length,14);
 const encounters=new Set();
 for(const week of rounds){
  assert.equal(week.length,4);assert.deepEqual(week.flat().sort((a,b)=>a-b),[0,1,2,3,4,5,6,7]);
  for(const [a,b] of week){encounters.add(a+':'+b);}
 }
 assert.equal(encounters.size,56);
});
test('league points and sorted ranking',()=>{
 let t=e.empty(['A','B','C','D']);e.record(t,0,1,3,1);e.record(t,2,3,0,0);
 assert.equal(t[0].pts,3);assert.equal(t[1].pts,0);assert.equal(t[2].pts,1);
 assert.equal(e.table(t)[0].name,'A');
});
test('invalid outcomes are refused',()=>{
 assert.throws(()=>e.roundRobin(7));assert.throws(()=>e.record(e.empty(['A','B']),0,1,-1,1));
});
