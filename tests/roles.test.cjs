const test=require('node:test');
const assert=require('node:assert/strict');
const roles=require('../engine/roles.js');
test('all 20 distinct positions are selectable and categorized',()=>{
 assert.equal(roles.positions.length,20);
 assert.equal(new Set(roles.positions.map(p=>p.id)).size,20);
 for(const required of ['GK','LB','LWB','LCB','CB','RCB','RB','RWB','SW','CDM','CM','CAM','LM','RM','LW','RW','LF','RF','CF','ST']){
  assert.ok(roles.has(required),required);
 }
});
test('every role has valid attributes and non-shooter mission types',()=>{
 const skills=roles.ensureSkills({shot:66,tech:64,mental:60});
 for(const position of roles.positions){
  assert.ok(roles.rated(position.id,skills)>=1);
  assert.equal(roles.topSkills(position.id).length,4);
  assert.ok(['save','defend','pass','cross','shoot'].includes(position.mission));
 }
 assert.equal(roles.get('GK').mission,'save');
 assert.equal(roles.get('CB').mission,'defend');
 assert.equal(roles.get('CM').mission,'pass');
 assert.equal(roles.get('RW').mission,'cross');
 assert.equal(roles.get('ST').mission,'shoot');
});
test('goalkeeper save and conceded goal depend on action outcome',()=>{
 const s=roles.ensureSkills({});
 const success=roles.resolve('GK',1,1,s,100,100,()=>0);
 assert.equal(success.stat,'saves');assert.equal(success.againstGoals,0);
 const missed=roles.resolve('GK',0,2,s,100,100,()=>.99);
 assert.equal(missed.againstGoals,1);
});
test('position actions never produce invalid goals',()=>{
 const s=roles.ensureSkills({});
 for(const p of roles.positions){
  if(p.mission==='shoot')continue;
  for(let c=0;c<3;c++)for(let target=0;target<3;target++){
   const r=roles.resolve(p.id,c,target,s,75,75,Math.random);
   assert.ok([0,1].includes(r.forGoals));assert.ok([0,1].includes(r.againstGoals));
  }
 }
});
test('invalid lanes are rejected',()=>assert.throws(()=>roles.resolve('CM',-1,2,{},100,100)));
