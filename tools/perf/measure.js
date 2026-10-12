// Đo hiệu năng theo cách chuẩn ghi trong tools/perf-log.md.
// Chạy: python3 tools/perf/serve.py 8770 &  rồi  NODE_PATH=$(npm root -g) node tools/perf/measure.js [url] [số lần]
const {chromium}=require('playwright');
const URL=process.argv[2]||'http://localhost:8770/',RUNS=+(process.argv[3]||3);
const med=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
(async()=>{const br=await chromium.launch();
for(const [name,w,h,m,slow] of [['Điện thoại (giả lập chậm)',390,844,true,true],['Máy tính',1440,900,false,false]]){
  const rows=[];
  for(let i=0;i<RUNS;i++){
    const ctx=await br.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m,deviceScaleFactor:m?3:1});const pg=await ctx.newPage();
    const cdp=await ctx.newCDPSession(pg);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
    if(slow){await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8})}
    let bytes=0,reqs=0;cdp.on('Network.loadingFinished',e=>{bytes+=e.encodedDataLength;reqs++});
    await pg.addInitScript(()=>{window.__lcp=0;window.__cls=0;window.__lt=0;
      new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lcp=e.startTime)).observe({type:'largest-contentful-paint',buffered:true});
      new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.__cls+=e.value})).observe({type:'layout-shift',buffered:true});
      new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt+=Math.max(0,e.duration-50))).observe({type:'longtask',buffered:true})});
    const t0=Date.now();await pg.goto(URL,{waitUntil:'load',timeout:120000});
    await pg.waitForFunction(()=>document.querySelectorAll('#board .card').length>0,null,{timeout:60000});const board=Date.now()-t0;const kB0=bytes/1024,rq0=reqs;
    await pg.waitForTimeout(3000);const kB1=bytes/1024,rq1=reqs;
    const r=await pg.evaluate(()=>({lcp:__lcp,cls:__cls,tbt:__lt}));
    const t1=Date.now();await pg.evaluate(()=>openModal(HEROES[0].id));await pg.waitForSelector('.modal .bld .bi',{timeout:30000});const modal=Date.now()-t1;
    rows.push({...r,board,modal,kB0,rq0,kB:kB1,reqs:rq1});await ctx.close()}
  const k=f=>med(rows.map(x=>x[f]));
  console.log(`${name}: LCP ${Math.round(k('lcp'))} ms · CLS ${k('cls').toFixed(3)} · TBT ${Math.round(k('tbt'))} ms · bảng có thẻ ${k('board')} ms · mở bảng chi tiết ${k('modal')} ms · tải tới lúc bảng hiện ${Math.round(k('kB0'))} kB / ${k('rq0')} yêu cầu · tổng sau 3 giây ${Math.round(k('kB'))} kB / ${k('reqs')} yêu cầu (trung vị ${RUNS} lần)`)}
await br.close()})();
