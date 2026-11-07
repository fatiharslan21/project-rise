/* End-to-end browser smoke test. Requires playwright and localhost:4173. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:395,height:852},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('dialog',dialog=>dialog.accept());
 try{
  await page.goto('http://127.0.0.1:4173',{waitUntil:'load',timeout:50000});
  await page.waitForFunction(()=>document.querySelector('#careerPlay')!==null,{timeout:15000});
  assert.equal(await page.locator('#profileOverlay').isVisible(),true,'new career overlay visible');
  await page.locator('#footballerName').fill('Kaleci Test');
  await page.locator('#footballerPosition').selectOption('GK');
  await page.locator('#profileForm button[type=submit]').click();
  assert.equal(await page.locator('#profileOverlay').isVisible(),false);
  assert.ok(await page.locator('#roleTitle').innerText().then(s=>s.includes('Kaleci')));
  assert.ok(await page.locator('[data-match-mode=arena]').count());
  // The real-time arena must boot successfully in the browser, not just pass syntax tests.
  assert.equal(await page.evaluate(()=>Boolean(window.Phaser)),true,'Phaser booted from CDN');
  await page.locator('#careerPlay').click();
  await page.waitForTimeout(1400);
  assert.equal(await page.locator('#match').evaluate(el=>el.classList.contains('arena-mode')),true,'arena mode active');
  assert.equal(await page.locator('#arenaCanvas canvas').count(),1,'Phaser canvas initialized');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(120);
  await page.keyboard.up('ArrowUp');
  await page.locator('[data-arena-action=pass]').dispatchEvent('pointerdown',{bubbles:true});
  await page.waitForTimeout(150);
  await page.locator('#arenaFinish').click();
  await page.waitForTimeout(200);
  const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('project-rise-v01')));
  assert.equal(data.matches,1,'exactly one match was recorded');
  assert.equal(data.history[0].position,'GK');
  assert.equal(data.history[0].engine,'live-v04');
  assert.ok(Array.isArray(data.league)&&data.league[0].played===1,'league advanced');
  await page.locator('#matchButton').click();
  assert.equal(await page.locator('#career').isVisible(),true,'back to career');
  await page.locator('[data-match-mode=classic]').click();
  await page.locator('[data-screen=training]').click();
  await page.locator('#positionSwitch').selectOption('CB');
  await page.locator('[data-screen=career]').click();
  await page.locator('#careerPlay').click();
  await page.waitForTimeout(80);
  assert.equal(await page.locator('#match').evaluate(el=>el.classList.contains('role-mode')),true,'classic CB role mode active');
  assert.equal(errors.length,0,'no uncaught browser errors: '+errors.join(' ; '));
  console.log('PASS: mobile viewport arena, keeper, persistent career, classic defender fallback');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});