// Kiểm tra build của mọi ô tướng: node tools/builds/check.js (chạy ở gốc repo). Lỗi → thoát mã 1.
const fs=require('fs'),vm=require('vm'),path=require('path');const R=path.join(__dirname,'..','..');const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(R,'assets/data.js'),'utf8')+';this.HEROES=HEROES',ctx);
vm.runInContext(fs.readFileSync(path.join(R,'assets/builds.js'),'utf8')+';this.BUILDS=BUILDS;this.BITEM=BITEM;this.BARC=BARC;this.BSPELL=BSPELL',ctx);
const {HEROES,BUILDS,BITEM,BARC,BSPELL}=ctx;let bad=0;
for(const h of HEROES){const b=BUILDS[h.key+'@'+h.lane]||BUILDS[h.key];const f=[];
  if(!b||(b.only&&b.only!==h.lane))f.push('không có build');
  else{const cats=b.i.map(i=>BITEM[i]?BITEM[i][1]:'??'),jg=cats.includes('jg'),pun=b.s.includes('punish');
    if(cats.includes('??'))f.push('đồ lạ');if(b.r.some(([a])=>!BARC[a]))f.push('ngọc lạ');if(b.s.some(s=>!BSPELL[s]))f.push('phép lạ');
    if(h.lane==='jg'&&!(jg&&pun))f.push('đi rừng thiếu đồ rừng hoặc Trừng Trị');
    if(h.lane!=='jg'&&(jg||pun))f.push('đi đường mà có đồ rừng/Trừng Trị');
    if(h.lane==='sp'&&b.i.length&&!cats.includes('sup'))f.push('trợ thủ thiếu đồ trợ thủ');
    if(h.lane!=='sp'&&cats.includes('sup'))f.push('đi đường mà có đồ trợ thủ')}
  if(f.length){bad++;console.log(h.id,'→',f.join('; '))}}
console.log(`${HEROES.length} ô tướng, ${bad} lỗi`);process.exit(bad?1:0);
