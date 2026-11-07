const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:395,height:852},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('dialog',d=>d.accept());
 try{
  await page.goto('http://127.0.0.1:4173',{waitUntil:'load',timeout:35000});
  await page.waitForFunction(()=>Boolean(window.RiseHighlights),{timeout:10000});
  assert.equal(await page.locator('#profileOverlay').isVisible(),true);
  await page.locator('#footballerName').fill('Kaleci Kariyer');
  await page.locator('#footballerPosition').selectOption('GK');
  await page.locator('#profileForm button[type=submit]').click();
  assert.equal(await page.locator('#profileOverlay').isVisible(),false);
  assert.equal(await page.locator('#roleTitle').innerText().then(t=>t.includes('Kaleci')),true);
  assert.equal(await page.locator('.mode-selector').count(),0,'continuous live match selector removed');
  await page.locator('#careerPlay').click();
  assert.equal(await page.locator('#match').evaluate(el=>el.classList.contains('highlight-mode')),true);
  assert.equal(await page.locator('#nssCanvas').isVisible(),true);
  for(let i=0;i<5;i++){
   const role=await page.locator('#nssTitle').innerText();
   assert.ok(role.includes('Kaleci'),role);
   const b=await page.locator('#nssCanvas').boundingBox();
   const at=(x,y)=>({x:b.x+x/380*b.width,y:b.y+y/470*b.height});
   const start=at(190,447),end=at(260,422);
   await page.mouse.move(start.x,start.y);
   await page.mouse.down();
   await page.mouse.move(end.x,end.y,{steps:5});
   await page.mouse.up();
   assert.equal(await page.locator('#nssResult').isVisible(),true,'result after highlight '+i);
   await page.locator('#nssContinue').click();
  }
  const career=await page.evaluate(()=>JSON.parse(localStorage.getItem('project-rise-v01')));
  assert.equal(career.matches,1,'exactly one match recorded');
  assert.equal(career.history[0].position,'GK');
  assert.equal(career.history[0].engine,'highlights-v05');
  assert.equal(career.history[0].highlightLog.length,5);
  assert.equal(career.league[0].played,1);
  await page.locator('#matchButton').click();
  assert.equal(await page.locator('#career').isVisible(),true);
  await page.locator('[data-screen=training]').click();
  await page.locator('#positionSwitch').selectOption('ST');
  await page.locator('[data-screen=career]').click();
  await page.locator('#careerPlay').click();
  assert.equal(await page.locator('#nssTitle').innerText().then(t=>t.includes('Şut')),true);
  assert.equal(await page.locator('#nssActions button[data-nss-action=shoot]').count(),1);
  assert.equal(errors.length,0,errors.join(' ; '));
  console.log('PASS: 5 highlight GK match, career save, league advancement, ST shooting and no live 6v6');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});