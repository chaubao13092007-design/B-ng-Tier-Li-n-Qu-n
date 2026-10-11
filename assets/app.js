/* Giao diện và tương tác — thường không cần sửa khi cập nhật số liệu */

const $=id=>document.getElementById(id);
function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
const freshMine=()=>Object.fromEntries(HEROES.map(h=>[h.id,h.tier]));
const mq=window.matchMedia("(max-width:719px)");

/* Trình duyệt trong Messenger/Facebook trên Android phóng to chữ theo cỡ chữ của điện thoại nhưng không giãn khung
   → chữ cụm lại, chồng lên nhau. Đo tỉ lệ phóng thật (so chữ trên trang với chữ vẽ trên canvas, canvas không bị phóng)
   rồi chia lại cỡ chữ trong CSS cho đúng thiết kế. Người xem vẫn chụm hai ngón để phóng to được.
   Thêm ?tz vào link để xem tỉ lệ đo được, ?tz=1.3 để thử bù với tỉ lệ cho trước. */
const TZ=(function fixTextZoom(){
  const qs=new URLSearchParams(location.search).get("tz"),TXT="Bảng Tier Liên Quân 2026";
  const res={r14:1,r32:1,applied:0};
  try{
    const ctx=document.createElement("canvas").getContext("2d");if(!ctx)return res;
    const box=document.createElement("div");box.setAttribute("aria-hidden","true");
    box.style.cssText="height:0;overflow:hidden;visibility:hidden;pointer-events:none";
    box.innerHTML=[14,32].map(s=>`<span style="display:inline;font:400 ${s}px/1 sans-serif;letter-spacing:0;text-transform:none;white-space:nowrap">${TXT}</span>`).join("<br>");
    (document.querySelector(".hero-l")||document.body).appendChild(box);
    const [p14,p32]=box.querySelectorAll("span");
    const ratio=(el,s)=>{ctx.font=`400 ${s}px sans-serif`;const w=ctx.measureText(TXT).width;return w?el.getBoundingClientRect().width/w:1};
    res.r14=ratio(p14,14);res.r32=ratio(p32,32);
    const forced=qs&&+qs>0?+qs:0,r=forced||res.r14;
    if(r>1.06&&r<3){
      // Chữ to cũng bị phóng gần như chữ nhỏ → bù mọi cỡ; nếu chữ to gần như không bị phóng → chỉ bù chữ ≤ 16px
      const linear=forced||res.r32>1+(r-1)*0.6;
      const saved=[],SZ=/(^|\s)(clamp\([^)]*\)|\d*\.?\d+(?:px|rem))(?=[\s\/]|$)/;
      const small=v=>{const m=/^(\d*\.?\d+)(px|rem)$/.exec(v.trim());return m&&(m[2]==="px"?+m[1]:+m[1]*16)<=16.5};
      const ok=v=>{const t=v.replace(/rem/g,"R");return /\d(?:px|R|vw|vh)/.test(t)&&!/\d(?:%|em)/.test(t)&&(linear||small(v))};
      const set=(st,p,v)=>{const pr=st.getPropertyPriority(p);saved.push([st,p,v,pr]);st.setProperty(p,p==="font"?v.replace(SZ,(m,a,b)=>`${a}calc(${b} / ${r})`):`calc(${v} / ${r})`,pr)};
      const walk=list=>{for(const rule of list){
        if(rule.style&&rule.selectorText){const st=rule.style,fs=st.getPropertyValue("font-size"),f=st.getPropertyValue("font");
          if(fs){if(ok(fs))set(st,"font-size",fs)}else if(f){const m=SZ.exec(f);if(m&&ok(m[2]))set(st,"font",f)}}
        if(rule.cssRules&&rule.cssRules.length)walk(rule.cssRules)}};
      for(const sh of document.styleSheets){let rl;try{rl=sh.cssRules}catch(e){continue}if(rl)walk(rl)}
      // Kiểm tra lại: chữ 14px phải hiện đúng 14px, nếu không thì trả nguyên như cũ
      p14.style.fontSize=`calc(14px / ${r})`;const after=ratio(p14,14);
      if(!forced&&Math.abs(after-1)>0.08)saved.forEach(([st,p,v,pr])=>st.setProperty(p,v,pr));
      else{res.applied=r;res.after=after;document.documentElement.classList.add("tz")}
    }
    box.remove();
  }catch(e){}
  if(qs!==null)setTimeout(()=>toast(`Chữ ${res.r14.toFixed(2)}× / ${res.r32.toFixed(2)}× · ${res.applied?"đã bù "+res.applied.toFixed(2):"không cần bù"}`),900);
  return res;
})();
let mode=store("lq-mode")==="mine"?"mine":"meta",q="",selected=null,mine=store("lq-mine2")||freshMine();
let mLane=LANES[store("lq-mlane")]?store("lq-mlane"):"top";
const F={lane:new Set(),cls:new Set(),trend:new Set()};
HEROES.forEach(h=>{if(!(h.id in mine))mine[h.id]=h.tier});

function initials(n){const w=n.replace(/[^\p{L}\s]/gu,"").trim().split(/\s+/);return (w.length>1?w[0][0]+w[1][0]:w[0].slice(0,2)).toUpperCase()}
const P_KEYS=new Set(["ishar", "tamyn", "ybneth", "taara", "ata", "omega", "max", "toro", "mina", "roxie", "baldum", "chaugnar", "thane", "ormarr", "arduin", "xeniel", "wiro", "arthur", "zuka", "florentino", "volkath", "ryoma", "maloch", "trieuvan", "airi", "yena", "veres", "qi", "bijan", "lubo", "omen", "richter", "errol", "allain", "edras", "biron", "boltbaron", "skud", "kilgroth", "superman", "amily", "charlotte", "astrid", "wonderwoman", "rourke", "dextra", "tachi", "yan", "zephys", "sinestrea", "billow", "butterfly", "murad", "ngokhong", "nakroth", "paine", "zill", "quillen", "kaine", "enzo", "keera", "kriknak", "aoi", "bright", "theflash", "gildur", "yue", "zata", "raz", "lorion", "azzenka", "iggy", "krixi", "veera", "natalya", "marja", "lauriel", "aleister", "tulen", "liliana", "heino", "flowborn-mid", "goverra", "kahlii", "mganga", "ilumia", "dieuthuyen", "bonnie", "ignis", "preyta", "jinna", "darcy", "sephera", "dirak", "violet", "hayate", "flowborn-ad", "moren", "elsu", "valhein", "slimz", "fennik", "stuart", "telannas", "capheny", "laville", "celica", "elandorr", "yorn", "lindis", "wisp", "thorne", "teeri", "erin", "alice", "dolia", "aya", "annette", "dyadia", "cresht", "grakk", "rouie", "krizzix", "arum", "lumburr", "helen", "teemee", "zip", "ming"]),S_KEYS=new Set(["ishar", "tamyn", "ybneth", "taara", "ata", "omega", "max", "toro", "mina", "roxie", "baldum", "chaugnar", "thane", "ormarr", "arduin", "xeniel", "wiro", "arthur", "zuka", "florentino", "volkath", "ryoma", "maloch", "trieuvan", "airi", "yena", "veres", "qi", "bijan", "lubo", "omen", "richter", "errol", "allain", "edras", "biron", "boltbaron", "skud", "kilgroth", "superman", "amily", "charlotte", "astrid", "wonderwoman", "rourke", "dextra", "tachi", "yan", "zephys", "sinestrea", "billow", "butterfly", "murad", "ngokhong", "nakroth", "paine", "zill", "quillen", "kaine", "enzo", "keera", "kriknak", "aoi", "bright", "theflash", "gildur", "yue", "zata", "raz", "lorion", "azzenka", "iggy", "krixi", "veera", "natalya", "marja", "lauriel", "aleister", "tulen", "liliana", "heino", "flowborn-mid", "goverra", "kahlii", "mganga", "ilumia", "dieuthuyen", "bonnie", "ignis", "preyta", "jinna", "darcy", "sephera", "dirak", "violet", "hayate", "flowborn-ad", "moren", "elsu", "valhein", "slimz", "fennik", "stuart", "telannas", "capheny", "laville", "celica", "elandorr", "yorn", "lindis", "wisp", "thorne", "teeri", "erin", "alice", "dolia", "aya", "annette", "dyadia", "cresht", "grakk", "rouie", "krizzix", "arum", "lumburr", "helen", "teemee", "zip", "ming"]);
const pKey=h=>{const k=h.key==="flowborn"?"flowborn-"+h.lane:h.key;return P_KEYS.has(k)?k:""};
function portrait(h){
  const b=TR[h.trend];
  const src=imgOf(h);
  return `<div class="por${src?" has":""}" style="--lc:var(--l-${h.lane})">${src?`<img src="${src}" alt="" loading="lazy" decoding="async" width="88" height="88">`:`<span class="ini">${initials(h.name)}</span>`}<span class="cls" title="${CLASSES[h.cls]}">${ICON[h.cls]}</span>${b?`<span class="bdg ${b[1]}">${h.trend==="new"?"MỚI":b[0].split(" ")[0]}</span>`:""}${h.sec?`<span class="secl">Phụ</span>`:""}</div>`;
}
const tierOf=h=>mode==="mine"?mine[h.id]:h.tier;
const uniq=new Set(HEROES.map(h=>h.key)).size;
$("heroCount").textContent=uniq;
const fmt=n=>n.toLocaleString("vi-VN");
const TOTAL_PICK=SRC.aogGames*10,TOTAL_BAN=Object.values(SRC.aog).reduce((s,v)=>s+v[4],0);
$("stPick").textContent=fmt(TOTAL_PICK);$("stBan").textContent=fmt(TOTAL_BAN);$("stGames").textContent=SRC.aogGames;

/* Bộ lọc */
function buildFilters(){
  const mk=(box,key,items,render)=>{const el=$(box);Object.entries(items).forEach(([k,v])=>{const b=document.createElement("button");b.className="ic";b.setAttribute("aria-pressed","false");b.dataset.key=key;b.dataset.val=k;render(b,k,v);
    b.onclick=()=>{F[key].has(k)?F[key].delete(k):F[key].add(k);b.setAttribute("aria-pressed",F[key].has(k));draw()};el.appendChild(b)})};
  mk("f-lane","lane",LANES,(b,k,v)=>{b.innerHTML=`<span class="d" style="background:var(--l-${k})"></span>${v}`});
  mk("f-class","cls",CLASSES,(b,k,v)=>{b.innerHTML=ICON[k]+v});
  mk("f-trend","trend",{up:"↑ Tăng",down:"↓ Giảm",mix:"⇄ Điều chỉnh",new:"Làm lại"},(b,k,v)=>{b.textContent=v});
  $("lanesM").innerHTML=Object.entries(LANES).map(([k,v])=>`<button data-l="${k}" style="--lc:var(--l-${k})" aria-pressed="${k===mLane}"><i></i>${v}</button>`).join("");
  $("lanesM").onclick=e=>{const b=e.target.closest("button");if(b)setLane(b.dataset.l)};
}
function setLane(l){if(!LANES[l]||l===mLane)return;mLane=l;store("lq-mlane",mLane);
  $("lanesM").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.l===mLane));
  const top=$("board").getBoundingClientRect().top,lim=$("bar").offsetHeight;
  if(top<lim-2)scrollTo({top:scrollY+top-lim-4,behavior:"auto"});
  draw()}
function activeCount(){return F.cls.size+F.trend.size+(mq.matches?0:F.lane.size)+(q?1:0)}
function syncFilterUI(shown){const n=activeCount();$("fcount").hidden=!(F.cls.size+F.trend.size);$("fcount").textContent=F.cls.size+F.trend.size;$("freset").hidden=!n;
  // Nút đóng bảng lọc trên điện thoại báo luôn số tướng sẽ hiện
  if(shown!=null)$("fdone").textContent=shown?`Xem ${shown} tướng`:"Đóng"}
function match(h){return (!F.cls.size||F.cls.has(h.cls))&&(!F.trend.size||F.trend.has(h.trend))&&(!q||slug(h.name).includes(slug(q)))}

/* Vẽ bảng */
const reduce=matchMedia("(prefers-reduced-motion: reduce)");
let firstDraw=true,vtOn=false;
const TDESC={S:"Nên cấm hoặc chọn sớm",A:"Chọn an toàn khi leo rank",B:"Dùng tốt",C:"Cần đội hình phù hợp",D:"Đang yếu",X:"Chưa đặt vào tier"};
function draw(){
  const n=(mq.matches?HEROES.filter(h=>h.lane===mLane&&match(h)):HEROES.filter(h=>(!F.lane.size||F.lane.has(h.lane))&&match(h))).length;
  vtOn=n<=60;
  if(!firstDraw&&vtOn&&document.startViewTransition&&!reduce.matches){document.startViewTransition(()=>render());}else render();
  firstDraw=false;
}
function render(){
  const lanes=mq.matches?[mLane]:Object.keys(LANES).filter(l=>!F.lane.size||F.lane.has(l));
  const board=$("board");board.style.setProperty("--cols",lanes.length);board.style.setProperty("--minw",(lanes.length*172+84)+"px");
  const list=HEROES.filter(h=>lanes.includes(h.lane)&&match(h));
  syncFilterUI(list.length);
  if(!list.length){
    const elsewhere=mq.matches?Object.keys(LANES).filter(l=>l!==mLane).map(l=>[l,HEROES.filter(h=>h.lane===l&&match(h)).length]).filter(x=>x[1]):[];
    board.innerHTML=`<div class="empty"><b>${elsewhere.length?"Đường này không có tướng khớp":"Không có tướng nào khớp"}</b>
      <span>${elsewhere.length?"Có kết quả ở đường khác:":"Thử bỏ bớt bộ lọc hoặc đổi từ khoá tìm kiếm."}</span>
      ${elsewhere.length?`<div class="empty-go">${elsewhere.map(([l,n])=>`<button class="btn" data-lane="${l}"><span class="lanebar" style="background:var(--l-${l})"></span>${LANES[l]} · ${n}</button>`).join("")}</div>`:""}
      <button class="btn${elsewhere.length?" ghost":""}" id="emptyReset">Xoá lọc</button></div>`;
    $("emptyReset").onclick=resetFilters;syncPick();
    board.querySelectorAll("[data-lane]").forEach(bt=>bt.onclick=()=>setLane(bt.dataset.lane));
    return}
  let html=`<div class="hrow"><div></div>${lanes.map(l=>`<div style="--lc:var(--l-${l})"><span class="lanebar" style="background:var(--l-${l})"></span>${LANES[l]} <small>${list.filter(h=>h.lane===l).length}</small></div>`).join("")}</div>`;
  const rows=mode==="mine"?[...TIERS,"X"]:TIERS;
  rows.forEach(t=>{
    const inTier=list.filter(h=>tierOf(h)===t);
    if(mode==="meta"&&!inTier.length&&(q||F.cls.size||F.trend.size))return;
    html+=`<div class="trow${mode==="mine"&&selected?" target":""}" data-t="${t}"><div class="tl" aria-label="Tier ${t==="X"?"chưa xếp":t}, ${inTier.length} tướng"><span class="L">${t==="X"?"–":t}</span><small>${t==="X"?"Chưa xếp":TNAME[t]}</small><em>${TDESC[t]}</em><span class="cnt">${inTier.length} tướng</span></div>`;
    lanes.forEach(l=>{
      const items=inTier.filter(h=>h.lane===l);
      html+=`<div class="cell" data-t="${t}">${items.map(h=>`<button class="card${selected===h.id?" sel":""}${q?" hit":""}${h.name.length>10?" ln":""}" data-id="${h.id}" data-t="${tierOf(h)}" style="${vtOn?`view-transition-name:c-${h.id.replace(/[^a-z0-9-]/g,"")};`:""}--d:${(h.score*7)%4}" aria-label="${h.name}, ${LANES[h.lane]}${h.sec?" (đường phụ)":""}, tier ${tierOf(h)}" ${mode==="mine"?'draggable="true"':""}>${portrait(h).replace('</div>',tierOf(h)==="S"?'<span class="sweep"></span></div>':'</div>')}<span class="nm">${h.name}</span></button>`).join("")||'<span class="none" aria-hidden="true">—</span>'}</div>`;
    });
    html+=`</div>`;
  });
  board.innerHTML=html;
  observeRows();syncPick();
}
function syncPick(){const on=mode==="mine"&&!!selected,h=on&&HEROES.find(x=>x.id===selected);
  $("pickbar").hidden=!on;document.body.classList.toggle("picking",on&&mq.matches);
  if(h)$("pickTxt").innerHTML=`Đã chọn <b>${h.name}</b> · chạm hàng tier để đặt`}
function resetFilters(){Object.values(F).forEach(s=>s.clear());q="";$("q").value="";document.querySelectorAll(".filters [aria-pressed]").forEach(b=>b.setAttribute("aria-pressed","false"));draw()}

/* Tương tác bảng */
$("board").addEventListener("click",e=>{
  const c=e.target.closest(".card");
  if(c){e.stopPropagation();hideTip();
    if(mode==="meta")return openModal(c.dataset.id);
    const row=c.closest(".trow");
    if(selected&&selected!==c.dataset.id&&row&&mine[selected]!==row.dataset.t){place(selected,row.dataset.t);return}
    selected=selected===c.dataset.id?null:c.dataset.id;draw();
    $("minehint").textContent=selected?`Đã chọn ${HEROES.find(h=>h.id===selected).name}. Bấm vào hàng tier muốn đặt.`:"Bấm chọn một tướng, rồi bấm vào hàng tier muốn đặt. Trên máy tính có thể kéo thả. Bảng tự lưu trên trình duyệt này.";return}
  const row=e.target.closest(".trow");
  if(row&&mode==="mine"&&selected){place(selected,row.dataset.t)}
});
$("board").addEventListener("dragstart",e=>{const c=e.target.closest(".card");if(c){e.dataTransfer.setData("text/plain",c.dataset.id);hideTip()}});
$("board").addEventListener("dragover",e=>{if(mode==="mine"&&e.target.closest(".trow"))e.preventDefault()});
$("board").addEventListener("drop",e=>{const row=e.target.closest(".trow");if(row){e.preventDefault();place(e.dataTransfer.getData("text/plain"),row.dataset.t)}});
(function swipeLanes(){let x0=null,y0=0,t0=0;const b=$("board");
  b.addEventListener("touchstart",e=>{x0=null;if(!mq.matches||e.touches.length>1)return;const t=e.touches[0];if(t.clientX<24||t.clientX>innerWidth-24)return;x0=t.clientX;y0=t.clientY;t0=Date.now()},{passive:true});
  b.addEventListener("touchend",e=>{if(x0==null)return;const t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;x0=null;
    if(Date.now()-t0>700||Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*2)return;
    const ks=Object.keys(LANES),n=ks[(ks.indexOf(mLane)+(dx<0?1:ks.length-1))%ks.length];setLane(n);toast("Đường "+LANES[n])},{passive:true});
})();
function place(id,t){if(!id)return;const h=HEROES.find(x=>x.id===id);mine[id]=t;store("lq-mine2",mine);selected=null;draw();
  $("minehint").textContent="Bấm chọn một tướng, rồi bấm vào hàng tier muốn đặt. Trên máy tính có thể kéo thả. Bảng tự lưu trên trình duyệt này.";
  if(h)toast(`${h.name} → ${t==="X"?"Chưa xếp":"tier "+t}`)}

/* Tooltip khi rê chuột */
let tipEl=null;
function hideTip(){if(tipEl){tipEl.remove();tipEl=null}}
if(window.matchMedia("(hover:hover) and (pointer:fine)").matches){
  $("board").addEventListener("mouseover",e=>{const c=e.target.closest(".card");if(!c){hideTip();return}
    const h=HEROES.find(x=>x.id===c.dataset.id);if(!h)return;const a=aogOf(h.key,h.lane);hideTip();
    tipEl=document.createElement("div");tipEl.className="tip";
    tipEl.innerHTML=`<h4>${h.name}</h4><div class="r"><span>${LANES[h.lane]}${h.sec?" (phụ)":""} · ${CLASSES[h.cls]}</span><b style="color:var(--t-${tierOf(h).toLowerCase()})">${tierOf(h)==="X"?"Chưa xếp":"Tier "+tierOf(h)}</b></div>
      <div class="r"><span>Điểm tổng · hạng trong đường</span><b>${h.score.toFixed(2)} · ${h.rank}/${h.laneN}</b></div>
      <div class="r"><span>ĐTDV pick · cấm</span><b>${a?a[3]+" · "+a[4]:"0 · 0"}</b></div>
      <div class="hint">${mode==="meta"?"Bấm để xem chi tiết":"Bấm để chọn, rồi bấm vào hàng tier"}</div>`;
    document.body.appendChild(tipEl);const r=c.getBoundingClientRect(),tw=tipEl.offsetWidth,th=tipEl.offsetHeight;
    let x=r.right+10,y=r.top;if(x+tw>innerWidth-8)x=r.left-tw-10;if(y+th>innerHeight-8)y=innerHeight-th-8;tipEl.style.left=Math.max(8,x)+"px";tipEl.style.top=Math.max(8,y)+"px"});
  $("board").addEventListener("mouseleave",hideTip);addEventListener("scroll",hideTip,{passive:true});
}

/* Hộp chi tiết */
function breakdown(h){
  const r=SRC.rpl[h.key],m=SRC.rm[h.key],ps=proScore(r),a=aogOf(h.key,h.lane);
  const bar=(label,val,txt)=>`<div class="bd"><span>${label}</span><div class="bdbar"><i style="width:${val==null?0:val/5*100}%"></i></div><b>${txt}</b></div>`;
  let pro="Chưa có dữ liệu";
  if(r)pro=r[1]+r[2]<5?`Ít xuất hiện (${(r[1]+r[2]).toFixed(1)}% pick+cấm)`:`Pick ${r[1]}% · Cấm ${r[2]}% · Thắng ${r[0]==null?"–":r[0]+"%"}`;
  const aTxt=a?`${a[3]} pick · ${a[4]} cấm / ${SRC.aogGames} trận${a[3]?" · Thắng "+a[0]+"%":""}`:`Không được chọn trong ${SRC.aogGames} trận`;
  return `<div class="bds">
    ${bar("ĐTDV mùa Đông",aogScore(a),aTxt)}
    ${(()=>{const pv=prevOf(h.key,h.lane);return bar("Mùa trước",aogScore(pv),pv?`${pv[3]} pick · ${pv[4]} cấm / ${SRC.prevGames} trận${pv[3]?" · Thắng "+pv[0]+"%":""}`:`Không được chọn trong ${SRC.prevGames} trận`)})()}
    ${bar("RoV Pro League",ps,pro)}
    ${bar("Rank cộng đồng",m?RMS[m]:null,m?"Tier "+m:"Chưa có dữ liệu")}
    ${bar("Báo game VN",VNS[h.vn]??null,VNS[h.vn]?"Tier "+h.vn+(h.trend&&h.trend!=="mix"?" (đã chỉnh bản 29/09)":""):"Chưa có trong bài")}
    <div class="bd total"><span>Điểm tổng</span><div class="bdbar"><i style="width:${h.score/5*100}%"></i></div><b>${h.score.toFixed(2)} / 5 · hạng ${h.rank}/${h.laneN} ở ${LANES[h.lane]}${h.sec?" (đường phụ: trừ 0,4, tối đa tier A)":""}</b></div>
    ${h.floor==="manual"?`<p class="floor">Tier ${h.tier} do người biên tập điều chỉnh thủ công, không theo điểm tổng.</p>`:h.floor==="pickS"||h.floor==="pickA"?`<p class="floor">Được nâng lên tier ${h.tier} vì được chọn ở ${aogOf(h.key,h.lane)[1]}% số trận ĐTDV mùa Đông.</p>`:h.floor?`<p class="floor">Được nâng lên tier ${h.floor} vì xuất hiện (pick hoặc cấm) ở ${h.pres.toFixed(0)}% số trận ĐTDV mùa Đông.</p>`:""}
  </div>`;
}
/* Build tham khảo: đồ, bảng ngọc, phép bổ trợ (dữ liệu ở assets/builds.js) */
const COLVI={red:"đỏ",purple:"tím",teal:"xanh"};
function buildHTML(h){
  if(typeof BUILDS==="undefined")return"";
  // Build riêng cho đường đang xem, nguồn tiếng Việt (server Việt Nam)
  const b=BUILDS[h.key+"@"+h.lane];
  const title=h.lane==="sp"?"Build Trợ thủ":`Build đi ${LANES[h.lane]}`;
  const host=b?new URL(b.l).hostname:"";
  const head=`<div class="bld-h"><h4>${title}</h4>${b?`<a href="${b.l}" target="_blank" rel="noopener">${BSRC[host]||host} · server Việt</a>`:""}</div>`;
  if(!b)return `<section class="bld">${head}<p class="bld-note">Chưa có build cho ${h.name} đi ${LANES[h.lane]}.</p></section>`;
  const notes=b.n?[b.n]:[];
  const items=`<ol class="bld-items">${b.i.map((id,k)=>{const [vi,cat,ic,en]=BITEM[id],jg=cat==="jg";
      const tip=jg?`${vi} (${en}) · đồ rừng, cần Trừng Trị`:cat==="sup"?`${vi} (${en}) · đồ trợ thủ`:`${vi} (${en})`;
      return `<li class="bi${jg?" jg":""}" title="${tip}"><span class="bi-ic"><img src="b/i-${ic}.webp" alt="" loading="lazy" decoding="async" width="56" height="56"><b>${k+1}</b></span><span class="bi-n">${vi}</span>${jg?"<em>Đồ rừng</em>":cat==="sup"?"<em>Đồ trợ thủ</em>":""}</li>`}).join("")}</ol>`;
  const ar=b.r.map(([a,n])=>{const [c,t]=BARC[a];return `<li><img src="b/a-${a}.webp" alt="" loading="lazy" width="30" height="30"><span><b>Ngọc ${COLVI[c]} ×${n}</b>${t}</span></li>`}).join("");
  const sp=b.s.map(s=>`<li title="${BSPELL[s][1]}"><img src="b/t-${s}.webp" alt="" loading="lazy" width="36" height="36"><span><b>${BSPELL[s][0]}</b>${(b.o||[]).includes(s)?"<em>Phương án thêm</em>":""}</span></li>`).join("");
  return `<section class="bld" aria-label="${title}">${head}${notes.map(n=>`<p class="bld-note">${n}</p>`).join("")}${items}
    <div class="bld-row"><div><h5>Bảng ngọc</h5><ul class="bld-ar">${ar}</ul></div><div><h5>Phép bổ trợ${b.s.length>1?" (chọn một)":""}</h5><ul class="bld-sp">${sp}</ul></div></div></section>`;
}
let lastFocus=null;
function visibleOrder(){return [...document.querySelectorAll("#board .card")].map(c=>c.dataset.id)}
function openModal(id,dir){
  const h=HEROES.find(x=>x.id===id);if(!h)return;const b=TR[h.trend];
  const nav=!!$("veil");if(!nav)lastFocus=document.activeElement;
  const others=HEROES.filter(x=>x.key===h.key&&x.id!==h.id);
  const order=visibleOrder(),i=order.indexOf(id);
  $("modalRoot").innerHTML=`<div class="veil${nav?" nav":""}" id="veil"><div class="modal${dir>0?" from-r":dir<0?" from-l":""}" role="dialog" aria-modal="true" aria-label="${h.name}">
    <div class="mtop"><button id="mshare" aria-label="Chia sẻ tướng này" title="Chia sẻ"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/></svg></button><button id="mprev" aria-label="Tướng trước" ${i<=0?"disabled":""}>‹</button><button id="mnext" aria-label="Tướng sau" ${i<0||i>=order.length-1?"disabled":""}>›</button><button id="mx" aria-label="Đóng">×</button></div>
    <div class="m-ban${splOf(h)?"":" noimg"}">${splOf(h)?`<img src="${splOf(h)}" alt="" decoding="async">`:""}</div>
    <div class="m-body"><div class="card" data-t="${h.tier}">${portrait(h)}</div>
    <div><h3>${h.name}</h3>
      <div class="tags"><span class="tag" style="color:var(--t-${h.tier.toLowerCase()})">Tier ${h.tier} · ${TNAME[h.tier]}</span><span class="tag">${LANES[h.lane]}${h.sec?" (đường phụ)":""}</span><span class="tag">${CLASSES[h.cls]}</span>${b?`<span class="tag mv ${b[1]}">${b[2]}</span>`:""}</div>
      ${others.length?`<div class="other"><span>Còn đi:</span>${others.map(x=>`<button data-go="${x.id}" style="--lc:var(--l-${x.lane})"><i></i>${LANES[x.lane]}${x.sec?" (phụ)":""} · ${x.tier}</button>`).join("")}</div>`:""}
      ${buildHTML(h)}
      <h4 class="bds-h">Vì sao tier ${h.tier}</h4>
      ${breakdown(h)}
      <p>${h.note||"Không có thay đổi ở bản 29/09."}</p>
    </div></div></div></div>`;
  document.documentElement.classList.add("lock");hideTip();setHash("tuong-"+id);track("xem_tuong",{tuong:h.name,duong:LANES[h.lane],tier:h.tier});
  $("mshare").onclick=()=>shareLink(`${h.name} · Tier ${h.tier} ${LANES[h.lane]}`,`${h.name} đang ở tier ${h.tier} đường ${LANES[h.lane]} trên Bảng Tier Liên Quân`,pageUrl()+"#tuong-"+id);
  const close=()=>{setHash("");$("modalRoot").innerHTML="";document.documentElement.classList.remove("lock");document.removeEventListener("keydown",key);
    const back=document.querySelector(`#board .card[data-id="${id}"]`)||lastFocus;back&&back.focus&&back.focus(mq.matches?{preventScroll:true}:undefined)};
  const go=d=>{const n=order[i+d];if(n){document.removeEventListener("keydown",key);openModal(n,d)}};
  const key=e=>{if(e.key==="Escape")close();else if(e.key==="ArrowLeft")go(-1);else if(e.key==="ArrowRight")go(1);
    else if(e.key==="Tab"){const f=[...$("modalRoot").querySelectorAll("button:not(:disabled),a[href]")];if(!f.length)return;const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
  document.addEventListener("keydown",key);
  $("veil").onclick=e=>{if(e.target.id==="veil")close()};$("mx").onclick=close;
  $("mprev").onclick=()=>go(-1);$("mnext").onclick=()=>go(1);
  $("modalRoot").querySelectorAll("[data-go]").forEach(bt=>bt.onclick=()=>{document.removeEventListener("keydown",key);openModal(bt.dataset.go)});
  fitNames($("modalRoot"));$("mx").focus({preventScroll:true});
  /* Điện thoại: vuốt xuống để đóng, vuốt ngang để sang tướng trước/sau */
  const md=$("modalRoot").querySelector(".modal");let x0=null,y0=0,dy=0,drag=false,horiz=false;
  md.addEventListener("touchstart",e=>{if(!mq.matches||e.touches.length>1){x0=null;return}const t=e.touches[0];x0=t.clientX;y0=t.clientY;dy=0;drag=false;horiz=false},{passive:true});
  md.addEventListener("touchmove",e=>{if(x0==null)return;const t=e.touches[0],ddx=t.clientX-x0,ddy=t.clientY-y0;
    if(!drag&&!horiz){if(Math.abs(ddx)>14&&Math.abs(ddx)>Math.abs(ddy)*1.5)horiz=true;else if(ddy>10&&md.scrollTop<=0)drag=true;else if(Math.abs(ddy)>10){x0=null;return}}
    if(drag){dy=Math.max(0,ddy);md.style.transition="none";md.style.transform=`translate3d(0,${dy}px,0)`;if(e.cancelable)e.preventDefault()}},{passive:false});
  md.addEventListener("touchend",e=>{if(x0==null)return;const ddx=e.changedTouches[0].clientX-x0;x0=null;
    if(drag){md.style.transition="transform .3s cubic-bezier(.22,.8,.18,1)";if(dy>110){md.style.transform="translate3d(0,100%,0)";$("veil").style.transition="opacity .3s";$("veil").style.opacity="0";setTimeout(close,260)}else md.style.transform=""}
    else if(horiz&&Math.abs(ddx)>60)go(ddx<0?1:-1)},{passive:true});
}

/* Chế độ, tìm kiếm, phím tắt */
function setMode(m){if(m!==mode)track("doi_che_do",{che_do:m==="mine"?"tu_xep":"meta"});mode=m;selected=null;store("lq-mode",m);$("m-meta").setAttribute("aria-pressed",m==="meta");$("m-mine").setAttribute("aria-pressed",m==="mine");$("minebar").hidden=m!=="mine";hideTip();draw()}
$("m-meta").onclick=()=>setMode("meta");$("m-mine").onclick=()=>setMode("mine");
$("q").oninput=e=>{q=e.target.value.trim();draw()};
$("q").onkeydown=e=>{if(e.key==="Escape"){e.target.value="";q="";draw();e.target.blur()}
  else if(e.key==="Enter"){const first=document.querySelector("#board .card");if(first&&mode==="meta"){openModal(first.dataset.id)}}
  // Mũi tên xuống: nhảy thẳng tới thẻ tướng đầu tiên, khỏi phải Tab qua cả dãy nút lọc
  else if(e.key==="ArrowDown"){const first=document.querySelector("#board .card");if(first){e.preventDefault();first.focus()}}};
document.addEventListener("keydown",e=>{if(e.key==="/"&&!$("veil")&&document.activeElement.tagName!=="INPUT"){e.preventDefault();$("q").focus()}});
$("freset").onclick=resetFilters;
function setSheet(o){$("filters").classList.toggle("open",o);$("ftoggle").setAttribute("aria-expanded",o);$("fveil").hidden=!(o&&mq.matches);if(o&&mq.matches)$("fdone").focus();else if(!o)$("ftoggle").focus()}
$("ftoggle").onclick=()=>setSheet(!$("filters").classList.contains("open"));
$("fdone").onclick=()=>setSheet(false);$("fveil").onclick=()=>setSheet(false);$("fclear").onclick=()=>{resetFilters()};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("filters").classList.contains("open")&&!$("veil")&&mq.matches)setSheet(false)});
$("aboutBtn").onclick=()=>{const a=$("about");a.hidden=!a.hidden;$("aboutBtn").setAttribute("aria-expanded",!a.hidden);$("aboutBtn").textContent=a.hidden?"Cách đọc bảng":"Ẩn hướng dẫn";if(!a.hidden)a.scrollIntoView({behavior:reduce.matches?"auto":"smooth",block:"start"})};
function toast(s){const t=$("toast");t.textContent=s;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,1800)}
$("rmeta").onclick=()=>{mine=freshMine();store("lq-mine2",mine);draw();toast("Đã lấy lại bảng Meta")};
$("pickX").onclick=()=>{selected=null;draw();$("minehint").textContent="Bấm chọn một tướng, rồi bấm vào hàng tier muốn đặt. Trên máy tính có thể kéo thả. Bảng tự lưu trên trình duyệt này."};
$("rclear").onclick=()=>{HEROES.forEach(h=>mine[h.id]="X");store("lq-mine2",mine);draw();toast("Đã đưa hết về Chưa xếp")};
$("copy").onclick=()=>{
  const txt="Tier list Liên Quân của tôi\n"+Object.entries(LANES).map(([l,ln])=>`[${ln}]\n`+TIERS.map(t=>`${t}: ${HEROES.filter(h=>h.lane===l&&mine[h.id]===t).map(h=>h.name).join(", ")||"—"}`).join("\n")).join("\n\n");
  try{navigator.clipboard.writeText(txt).then(()=>toast("Đã sao chép"),()=>toast("Trình duyệt không cho sao chép"))}catch(e){toast("Trình duyệt không cho sao chép")}
};

/* Thanh dính: đo chiều cao để tiêu đề cột dính ngay bên dưới */
function measure(){document.documentElement.style.setProperty("--barh",$("bar").offsetHeight+"px");$("bar").style.setProperty("--r1h",$("bar").querySelector(".row1").offsetHeight+"px")}
try{new ResizeObserver(measure).observe($("bar"))}catch(e){addEventListener("resize",measure)}
const sentinel=document.createElement("div");$("bar").before(sentinel);
try{new IntersectionObserver(([en])=>$("bar").classList.toggle("stuck",!en.isIntersecting)).observe(sentinel)}catch(e){}
mq.addEventListener?mq.addEventListener("change",()=>{draw();measure()}):mq.addListener(()=>{draw();measure()});

/* Danh sách thay đổi bản 29/09 (mỗi tướng một dòng) */
const seen=new Set();
$("log").innerHTML=HEROES.filter(h=>h.trend&&!h.sec&&!seen.has(h.key)&&seen.add(h.key)).sort((a,b)=>"down up new mix".indexOf(a.trend)-"down up new mix".indexOf(b.trend)).map(h=>`<li><span class="mv ${TR[h.trend][1]}">${TR[h.trend][0]}</span><span><button data-open="${h.id}">${h.name}</button> · ${h.note.replace(/^[^:]+: /,"")}</span></li>`).join("");
$("log").onclick=e=>{const b=e.target.closest("[data-open]");if(b)openModal(b.dataset.open)};

/* Nổi bật mỗi đường */
const TORD={S:0,A:1,B:2,C:3,D:4};
function imgOf(h){return pKey(h)?`p/${pKey(h)}.webp`:""}
function splOf(h){const k=h.key==="flowborn"?"flowborn-"+h.lane:h.key;return S_KEYS.has(k)?`s/${k}.webp`:""}
const laneTop=l=>HEROES.filter(h=>h.lane===l&&!h.sec).sort((a,b)=>TORD[a.tier]-TORD[b.tier]||b.adj-a.adj).slice(0,3);
const DUR=7000;let sIdx=0,sTimer=null,sStart=0,sLeft=DUR,sPaused=false,sVisible=true;
function buildStage(){
  const lanes=Object.keys(LANES);
  const slides=lanes.map((l,i)=>{const top=laneTop(l),h=top[0];if(!h)return"";const a=aogOf(h.key,h.lane),sp=splOf(h);
    return `<div class="slide${i===0?" on":""}" role="group" aria-roledescription="trang" aria-label="${LANES[l]}: ${h.name}" style="--lc:var(--l-${l})"${i?' aria-hidden="true"':""}>
      <img class="bg" ${i===0?"src":"data-src"}="${sp||imgOf(h)}" alt="" decoding="async"${sp?"":' style="filter:blur(22px) brightness(.55)"'}>
      <div class="slide-c"><div class="over"><i></i>${LANES[l]} · Hạng 1</div>
        <h3>${h.name}</h3>
        <div class="slide-meta"><span class="tier"><b>${h.tier}</b>Tier</span><span><b>${a?a[3]:0}</b>Pick ĐTDV</span><span><b>${a?a[4]:0}</b>Lượt cấm</span><span><b>${h.score.toFixed(2)}</b>Điểm / 5</span></div>
        <div class="slide-acts"><button class="cta" data-open="${h.id}">Xem chi tiết<i></i></button>
          <div class="runners">${top.slice(1).map((x,j)=>`<button data-open="${x.id}" aria-label="Hạng ${j+2}: ${x.name}, tier ${x.tier}"><img src="${imgOf(x)}" alt=""><small>0${j+2}</small>${x.name}</button>`).join("")}</div></div>
      </div></div>`}).join("");
  const tabs=`<div class="tabs" role="tablist" aria-label="Chọn đường">${lanes.map((l,i)=>`<button role="tab" aria-selected="${i===0}" data-i="${i}">${LANES[l]}<b>${(laneTop(l)[0]||{}).name||""}</b><span class="pg"></span></button>`).join("")}</div>`;
  const pp=reduce.matches?"":`<button class="stage-pp" id="stagePP" aria-label="Tạm dừng trình chiếu"></button>`;
  const st=$("stage");st.innerHTML=slides+tabs+pp;st.style.setProperty("--dur",DUR+"ms");
  try{new IntersectionObserver(([en],o)=>{if(en.isIntersecting){loadSlide(1);o.disconnect()}},{rootMargin:"300px"}).observe(st)}catch(e){loadSlide(1)}
  st.onclick=e=>{if(e.target.closest("#stagePP")){userPaused=!userPaused;paintPP();userPaused?pauseStage(true):(sPaused=false,$("stage").classList.remove("paused"),sLeft=DUR,schedule());return}const o=e.target.closest("[data-open]");if(o)return openModal(o.dataset.open);const t=e.target.closest("[data-i]");if(t)goSlide(+t.dataset.i,true)};
  let sx=null,sy=0;
  st.addEventListener("touchstart",e=>{const t=e.touches[0];sx=(e.touches.length>1||t.clientX<24||t.clientX>innerWidth-24)?null:t.clientX;sy=t.clientY},{passive:true});
  st.addEventListener("touchend",e=>{if(sx==null)return;const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;sx=null;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)goSlide((sIdx+(dx<0?1:4))%5,true)},{passive:true});
  st.onkeydown=e=>{if(e.target.closest(".tabs")&&(e.key==="ArrowRight"||e.key==="ArrowLeft")){e.preventDefault();goSlide((sIdx+(e.key==="ArrowRight"?1:4))%5,true);st.querySelectorAll(".tabs button")[sIdx].focus()}};
  if(!reduce.matches){st.addEventListener("pointerenter",()=>pauseStage(true));st.addEventListener("pointerleave",()=>pauseStage(false));
    st.addEventListener("focusin",()=>pauseStage(true));st.addEventListener("focusout",()=>pauseStage(false));
    try{new IntersectionObserver(([en])=>{sVisible=en.isIntersecting;sVisible?schedule():clearTimeout(sTimer)}).observe(st)}catch(e){}
    schedule()}
}
function loadSlide(i){const im=$("stage").querySelectorAll(".slide img.bg")[i];if(im&&im.dataset.src){im.src=im.dataset.src;im.removeAttribute("data-src")}}
function goSlide(i,user){const st=$("stage");sIdx=i;loadSlide(i);loadSlide((i+1)%5);
  st.querySelectorAll(".slide").forEach((s,k)=>{s.classList.toggle("on",k===i);k===i?s.removeAttribute("aria-hidden"):s.setAttribute("aria-hidden","true")});
  st.querySelectorAll(".tabs button").forEach((b,k)=>b.setAttribute("aria-selected",k===i));
  sLeft=DUR;if(!reduce.matches)schedule()}
function schedule(){clearTimeout(sTimer);if(sPaused||!sVisible||reduce.matches)return;sStart=performance.now();sTimer=setTimeout(()=>goSlide((sIdx+1)%5),sLeft)}
let userPaused=false;
const PAUSE='<svg viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="3.5" height="12"/><rect x="8.5" y="1" width="3.5" height="12"/></svg>',PLAY='<svg viewBox="0 0 14 14" fill="currentColor"><path d="M3 1l10 6-10 6z"/></svg>';
function paintPP(){const b=$("stagePP");if(!b)return;b.innerHTML=userPaused?PLAY:PAUSE;b.setAttribute("aria-label",userPaused?"Tiếp tục trình chiếu":"Tạm dừng trình chiếu")}
function pauseStage(p){if(!p&&userPaused)return;sPaused=p;$("stage").classList.toggle("paused",p);if(p){clearTimeout(sTimer);sLeft=Math.max(400,sLeft-(performance.now()-sStart))}else schedule()}

/* Sáng / tối */
const SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
function curTheme(){return document.documentElement.dataset.theme||(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark")}
function paintTheme(){const t=curTheme();$("themeBtn").innerHTML=t==="dark"?SUN:MOON;$("themeBtn").setAttribute("aria-label",t==="dark"?"Chuyển sang giao diện sáng":"Chuyển sang giao diện tối")}
const savedTheme=store("lq-theme");if(savedTheme==="light"||savedTheme==="dark")document.documentElement.dataset.theme=savedTheme;
$("themeBtn").onclick=()=>{const n=curTheme()==="dark"?"light":"dark";document.documentElement.dataset.theme=n;store("lq-theme",n);paintTheme()};
paintTheme();


/* ===== Thiên hà hạt (WebGL) ===== */
(function galaxy(){
  const cv=$("galaxy"),hero=$("hero");
  const gl=cv.getContext("webgl",{antialias:false,alpha:true,premultipliedAlpha:false});
  if(!gl){hero.classList.add("nogl");return}
  const small=matchMedia("(max-width:719px)").matches;
  const lowEnd=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4;
  const N=Math.round((TOTAL_PICK+TOTAL_BAN)*(small?2.6:6)*(lowEnd?0.6:1));   // mỗi lượt chọn/cấm → vài hạt
  const ARMS=5;                                               // 5 nhánh = 5 đường
  const laneCol=[[0.89,0.42,0.28],[0.25,0.70,0.47],[0.56,0.50,0.95],[0.91,0.65,0.28],[0.31,0.64,0.90]];
  const data=new Float32Array(N*8);let o=0;
  const gauss=()=>{let a=0;for(let k=0;k<3;k++)a+=Math.random();return a/3-.5};
  const RINGS=[0.34,0.6,0.88];
  for(let i=0;i<N;i++){
    const arm=i%ARMS,kind=Math.random();let r,theta;
    if(kind<0.07){r=Math.abs(gauss())*0.26;theta=Math.random()*Math.PI*2}                       // lõi sáng
    else if(kind<0.70){const R=RINGS[(Math.random()*3)|0];r=R+gauss()*0.09;theta=Math.random()*Math.PI*2} // các vòng
    else{const t=Math.pow(Math.random(),.7);r=0.12+t*0.95;theta=arm*(Math.PI*2/ARMS)+r*3.4+gauss()*0.5}  // 5 nhánh xoắn = 5 đường
    const y=gauss()*0.05*(1.1-Math.min(1,r));
    const t=Math.min(1,r/0.95),lc=laneCol[arm];
    const core=Math.max(0,1-r*3);
    // tâm trắng tím → giữa tím xanh → rìa xanh ngọc pha màu đường
    let cr=0.62-0.45*t+lc[0]*0.25*t, cg=0.55+0.30*t+lc[1]*0.15*t, cb=1.0-0.35*t+lc[2]*0.10*t;
    cr+=core*0.25;cg+=core*0.2;cb+=core*0.1;
    const sparkle=Math.random()<0.015?1:0;
    data[o++]=Math.max(0.02,r);data[o++]=theta;data[o++]=y;data[o++]=(1.0+Math.random()*2.2+core*1.2+sparkle*3.5);
    data[o++]=sparkle?1.0:cr;data[o++]=sparkle?0.9:cg;data[o++]=sparkle?0.6:cb;data[o++]=0.45+Math.random()*0.55;
  }
  const vs=`attribute float aR,aT,aY,aS;attribute vec3 aC;attribute float aA;
    uniform float uTime,uTilt,uAsp,uDpr,uZoom,uOff;uniform vec2 uMouse;uniform float uStir;varying vec3 vC;varying float vA;
    void main(){float w=0.55/pow(aR+0.12,1.25);float th=aT+uTime*w*0.22;
      vec3 p=vec3(cos(th)*aR,aY,sin(th)*aR);
      float c=cos(uTilt),s=sin(uTilt);p=vec3(p.x,p.y*c-p.z*s,p.y*s+p.z*c);
      float z=p.z+2.6;vec2 q=p.xy*uZoom/z*2.7;q.x/=uAsp;q.y+=uOff;
      vec2 d=q-uMouse;d.x*=uAsp;float dist=length(d);float f=exp(-dist*dist*28.0)*uStir;
      q+=normalize(d+1e-4)*f*vec2(1.0/uAsp,1.0)*0.12;
      gl_Position=vec4(q,0.0,1.0);gl_PointSize=aS*uDpr*1.7*(2.6/z)*(1.0+f*0.7);
      vC=aC*(1.0+f*0.6);vA=aA*(0.7+0.3*smoothstep(1.1,0.0,aR));}`;
  const fs=`precision mediump float;varying vec3 vC;varying float vA;
    void main(){vec2 c=gl_PointCoord-0.5;float d=length(c);float a=smoothstep(0.5,0.0,d);a=a*a*1.1;gl_FragColor=vec4(vC*a*vA,a*vA);}`;
  function sh(t,src){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s);return s}
  let pr;try{pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw 0}catch(e){hero.classList.add("nogl");return}
  gl.useProgram(pr);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  const at=(n,size,off)=>{const l=gl.getAttribLocation(pr,n);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,size,gl.FLOAT,false,32,off*4)};
  at("aR",1,0);at("aT",1,1);at("aY",1,2);at("aS",1,3);at("aC",3,4);at("aA",1,7);
  const U=n=>gl.getUniformLocation(pr,n);const uOff=U("uOff"),uTime=U("uTime"),uTilt=U("uTilt"),uAsp=U("uAsp"),uDpr=U("uDpr"),uMouse=U("uMouse"),uStir=U("uStir"),uZoom=U("uZoom");
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.clearColor(0,0,0,0);
  let W=0,H=0,dpr=1,gOff=small?-0.12:-0.36;
  const hc=hero.querySelector(".hero-c"),hf=hero.querySelector(".hero-foot");
  function center(){if(!small)return;const h=hero.offsetHeight||1,a=hc.offsetTop+hc.offsetHeight,b=hf.offsetTop;gOff=b-a>60?1-2*((a+b)/2/h):-0.12}
  try{const ro=new ResizeObserver(center);ro.observe(hc);ro.observe(hf)}catch(e){}
  function size(){center();dpr=Math.min(devicePixelRatio||1,1.5);const r=cv.getBoundingClientRect();W=Math.max(1,r.width*dpr|0);H=Math.max(1,r.height*dpr|0);cv.width=W;cv.height=H;gl.viewport(0,0,W,H)}
  size();try{new ResizeObserver(size).observe(cv)}catch(e){addEventListener("resize",size)}
  let mx=9,my=9,tmx=9,tmy=9,stir=0,tstir=0,t=0,last=performance.now(),visible=true,spin=1;
  function setPt(cx,cy){const r=cv.getBoundingClientRect();tmx=((cx-r.left)/r.width)*2-1;tmy=-(((cy-r.top)/r.height)*2-1);tstir=1;spin=Math.min(spin+0.08,3)}
  hero.addEventListener("pointermove",e=>setPt(e.clientX,e.clientY),{passive:true});
  hero.addEventListener("pointerdown",e=>{setPt(e.clientX,e.clientY);spin=3},{passive:true});
  hero.addEventListener("pointerleave",()=>{tstir=0});
  function frame(now){
    const dt=Math.min(0.05,(now-last)/1000);last=now;
    spin+= (1-spin)*Math.min(1,dt*1.5);t+=dt*spin;
    mx+=(tmx-mx)*Math.min(1,dt*8);my+=(tmy-my)*Math.min(1,dt*8);stir+=(tstir-stir)*Math.min(1,dt*4);
    const sc=Math.min(1,Math.max(0,scrollY/ (hero.offsetHeight||1)));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime,t);gl.uniform1f(uTilt,0.36+sc*0.55+Math.max(-1,Math.min(1,my))*0.05*stir);gl.uniform1f(uAsp,W/H);gl.uniform1f(uDpr,dpr);
    gl.uniform1f(uOff,gOff);gl.uniform2f(uMouse,mx,my);gl.uniform1f(uStir,stir);gl.uniform1f(uZoom,(small?0.56:0.95)*(1+sc*0.25));
    gl.drawArrays(gl.POINTS,0,N);
  }
  if(reduce.matches){frame(performance.now());addEventListener("resize",()=>frame(performance.now()));return}
  function loop(now){if(visible&&!document.hidden)frame(now);else last=now;requestAnimationFrame(loop)}
  try{new IntersectionObserver(([e])=>visible=e.isIntersecting).observe(hero)}catch(e){}
  requestAnimationFrame(loop);
})();

const setPh=()=>{$("q").placeholder=mq.matches?"Tìm…":"Tìm tướng"};setPh();mq.addEventListener&&mq.addEventListener("change",setPh);

/* Tên tướng không xuống dòng: thu nhỏ chữ tiêu đề lớn nếu vượt khung */
function fitOne(el){el.style.fontSize="";const max=el.parentElement.clientWidth;let fs=parseFloat(getComputedStyle(el).fontSize),n=0;
  while(el.scrollWidth>max&&fs>14&&n++<40){fs-=1;el.style.fontSize=fs+"px"}}
function fitNames(root){(root||document).querySelectorAll(".slide-c h3,.modal h3").forEach(fitOne)}
addEventListener("resize",()=>fitNames());

/* Cách xếp: danh sách chỉnh tay và đường phụ lấy thẳng từ dữ liệu */
(function notes(){const ord=Object.keys(LANES),by=(a,b)=>ord.indexOf(a.lane)-ord.indexOf(b.lane)||a.name.localeCompare(b.name,"vi");
  const man=ord.map(l=>[l,HEROES.filter(h=>h.floor==="manual"&&h.lane===l).sort(by).map(h=>`${h.name} ${h.tier}${h.sec?" (phụ)":""}`)]).filter(x=>x[1].length).map(([l,n])=>`${LANES[l]}: ${n.join(", ")}`);
  const ml=$("manualList");if(ml)ml.textContent=man.join("; ")||"chưa có";
  const sec=ord.map(l=>[l,HEROES.filter(h=>h.sec&&h.lane===l).sort(by).map(h=>h.name)]).filter(x=>x[1].length).map(([l,n])=>`${LANES[l]}: ${n.join(", ")}`);
  const sl=$("secList");if(sl)sl.textContent=sec.join("; ")})();
/* Chú giải luôn hiện */
$("legendStrip").innerHTML=`<div class="ls-t">${TIERS.map(t=>`<span class="ls-tier" style="--tc:var(--t-${t.toLowerCase()})"><b>${t}</b>${TNAME[t]}</span>`).join("")}</div>
  <div class="ls-b"><span><i class="lg up">↑</i>Tăng sức mạnh</span><span><i class="lg down">↓</i>Giảm sức mạnh</span><span><i class="lg new">MỚI</i>Làm lại</span><span><i class="lg sec">PHỤ</i>Đường phụ</span></div>`;

/* ===== Hiệu ứng cuộn ===== */
const seenRows=new Set();
const revIO=("IntersectionObserver" in window)&&!reduce.matches?new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;const el=en.target;
  el.classList.add("in");if(el.classList.contains("trow"))seenRows.add(mode+el.dataset.t);revIO.unobserve(el)}),{threshold:0,rootMargin:"0px 0px -8% 0px"}):null;
function observeRows(){if(!revIO)return;document.querySelectorAll("#board .trow").forEach(r=>{
  r.querySelectorAll(".card").forEach((c,k)=>c.style.setProperty("--k",Math.min(k,14)));
  if(seenRows.has(mode+r.dataset.t))return;revIO.observe(r)})}
if(revIO)document.querySelectorAll(".sec-h,.legend-strip,.filters,.box").forEach(el=>revIO.observe(el));
(function scrollFx(){
  const root=document.documentElement,hero=$("hero"),stage=$("stage"),band=$("band"),totop=$("totop"),bar=$("sprog"),ring=$("topRing");
  const heroC=hero.querySelector(".hero-c"),heroF=hero.querySelector(".hero-foot"),heroS=hero.querySelector(".hero-stats"),r1=band.querySelector(".r1"),r2=band.querySelector(".r2");
  const vis={hero:true,stage:false,band:false};
  try{const io=new IntersectionObserver(es=>es.forEach(en=>{vis[en.target.dataset.fx]=en.isIntersecting}),{rootMargin:"100px"});
    hero.dataset.fx="hero";stage.dataset.fx="stage";band.dataset.fx="band";[hero,stage,band].forEach(el=>io.observe(el))}catch(e){vis.stage=vis.band=true}
  let ticking=false,maxS=1,vh=innerHeight,lastY=scrollY,acc=0,dirUp=false,stickY=0;
  const barEl=$("bar"),qEl=$("q"),filt=$("filters");
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const measureDoc=()=>{vh=innerHeight;maxS=Math.max(1,root.scrollHeight-vh);stickY=sentinel.getBoundingClientRect().top+scrollY};
  function update(){ticking=false;
    const y=scrollY,pp=clamp(y/maxS);
    bar.style.transform=`scaleX(${pp.toFixed(4)})`;ring.style.strokeDashoffset=(125.7*(1-pp)).toFixed(1);
    const dy=y-lastY;lastY=y;if(dy&&Math.sign(dy)!==Math.sign(acc))acc=0;acc+=dy;if(acc<-12)dirUp=true;else if(acc>12)dirUp=false;
    const m=mq.matches;
    // Điện thoại: chỉ hiện nút lên đầu trang khi đang cuộn ngược lên và không che sân khấu
    const showTop=m?dirUp&&y>vh*1.5&&!vis.stage&&!document.body.classList.contains("picking"):y>vh*0.9;if(totop.hidden===showTop)totop.hidden=!showTop;
    // Điện thoại: cuộn xuống trong bảng thì ẩn hàng chế độ/tìm/lọc, cuộn lên thì hiện lại
    const cp=m&&!dirUp&&y>stickY+160&&document.activeElement!==qEl&&!filt.classList.contains("open");
    if(barEl.classList.contains("compact")!==cp)barEl.classList.toggle("compact",cp);
    if(reduce.matches)return;
    if(vis.hero){const hp=clamp(y/((hero.offsetHeight||1)*0.75));
      heroC.style.transform=`translate3d(0,${(-140*hp).toFixed(1)}px,0)`;heroC.style.opacity=(1-hp*1.5).toFixed(3);
      heroF.style.opacity=(1-hp*2.2).toFixed(3);heroS.style.transform=`translate3d(0,${(-18*hp).toFixed(1)}px,0)`}
    if(vis.stage){const sr=stage.getBoundingClientRect(),sp=clamp((vh-sr.top)/(vh+sr.height)),sw=clamp(1-(vh-sr.top)/(vh*0.75));
      stage.style.transform=`scale(${(1-sw*0.06).toFixed(4)})`;
      const on=stage.querySelector(".slide.on");if(on){on.querySelector("img.bg").style.transform=`translate3d(0,${((sp-.5)*-80).toFixed(1)}px,0) scale(1.12)`;on.querySelector(".slide-c").style.transform=`translate3d(0,${((sp-.5)*40).toFixed(1)}px,0)`}}
    if(vis.band){const br=band.getBoundingClientRect(),bp=clamp((vh-br.top)/(vh+br.height));
      r1.style.transform=`translate3d(${(-38*bp).toFixed(2)}%,0,0)`;r2.style.transform=`translate3d(${(-40+38*bp).toFixed(2)}%,0,0)`}
  }
  const req=()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}};
  addEventListener("scroll",req,{passive:true});addEventListener("resize",()=>{measureDoc();req()});
  try{new ResizeObserver(()=>{measureDoc();req()}).observe(document.body)}catch(e){}
  measureDoc();update();
  totop.onclick=()=>scrollTo({top:0,behavior:reduce.matches?"auto":"smooth"});
})();

/* ===== Đo lường (Google Analytics) ===== */
function track(name,params){try{window.gtag&&gtag("event",name,params||{})}catch(e){}}

/* ===== Chia sẻ, link riêng từng tướng ===== */
function pageUrl(){return location.origin+location.pathname}
function setHash(hh){try{history.replaceState(null,"",hh?"#"+hh:pageUrl())}catch(e){}}
async function shareLink(title,text,url){track("chia_se",{link:url.includes("#tuong-")?"tuong":"trang"});
  if(navigator.share){try{await navigator.share({title,text,url});return}catch(e){if(e&&e.name==="AbortError")return}}
  try{await navigator.clipboard.writeText(url);toast("Đã sao chép link")}catch(e){toast(url)}
}
$("sharePage").onclick=()=>shareLink("Bảng Tier Liên Quân","Tier list tướng Liên Quân theo từng đường, chấm điểm từ số liệu ĐTDV và giải đấu",pageUrl());
function openFromHash(){const m=location.hash.match(/^#tuong-(.+)$/);if(m&&HEROES.some(h=>h.id===m[1]))openModal(m[1])}
addEventListener("hashchange",()=>{if(!$("veil"))openFromHash()});

/* ===== Xuất ảnh tier list ===== */
const TCOL={S:"#d9b56c",A:"#b9a9ff",B:"#86d0c3",C:"#8ea3cc",D:"#7a797f"};
const LCOL={top:"#e8805f",jg:"#5cc496",mid:"#a597ff",ad:"#e9b766",sp:"#6fb6ee"};
const loadImg=src=>new Promise(r=>{const im=new Image();im.onload=()=>r(im);im.onerror=()=>r(null);im.src=src});
async function exportImage(which){track("tai_anh",{bang:which==="mine"?"tu_xep":"meta"});
  const btn=which==="mine"?$("dlMine"):$("dlImg");btn.setAttribute("aria-busy","true");toast("Đang tạo ảnh…");
  try{
    try{await Promise.all([document.fonts.load('200 48px "Lexend Exa"'),document.fonts.load('500 14px "Be Vietnam Pro"')])}catch(e){}
    const tierOfX=h=>which==="mine"?mine[h.id]:h.tier;
    const lanes=Object.keys(LANES),W=1680,PAD=56,LBL=130,CW=Math.floor((W-PAD*2-LBL)/5),CARD=80,GAP=10,NAMEH=22,PER=Math.max(1,Math.floor((CW-20+GAP)/(CARD+GAP)));
    const rowsH={};TIERS.forEach(t=>{const mx=Math.max(1,...lanes.map(l=>Math.ceil(HEROES.filter(h=>h.lane===l&&tierOfX(h)===t).length/PER)));rowsH[t]=mx*(CARD+NAMEH+GAP)+28});
    const HEAD=210,LANEH=56,FOOT=86,H=HEAD+LANEH+TIERS.reduce((s,t)=>s+rowsH[t]+12,0)+FOOT;
    const cv=document.createElement("canvas"),sc=2;cv.width=W*sc;cv.height=H*sc;const c=cv.getContext("2d");c.scale(sc,sc);
    const disp='"Lexend Exa","Be Vietnam Pro",sans-serif',body='"Be Vietnam Pro",system-ui,sans-serif';
    c.fillStyle="#000";c.fillRect(0,0,W,H);
    const g=c.createRadialGradient(W*.15,0,10,W*.15,0,W*.6);g.addColorStop(0,"rgba(165,151,255,.16)");g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;c.fillRect(0,0,W,H*.5);
    const spaced=(t,x,y,sp)=>{for(const ch of t){c.fillText(ch,x,y);x+=c.measureText(ch).width+sp}return x};
    c.fillStyle="rgba(243,242,239,.6)";c.font=`400 15px ${disp}`;spaced(which==="mine"?"TIER LIST CỦA TÔI":"MÙA S4 2026 · BẢN VẾT NỨT THỜI KHÔNG",PAD,78,4.5);
    c.fillStyle="#f3f2ef";c.font=`200 58px ${disp}`;const x2=spaced("BẢNG TIER ",PAD,150,6);c.fillStyle="#e7cf9a";spaced("LIÊN QUÂN",x2,150,6);
    c.fillStyle="rgba(243,242,239,.55)";c.font=`400 15px ${body}`;c.textAlign="right";c.fillText(which==="mine"?"Tự xếp trên Bảng Tier Liên Quân":"Gộp số liệu ĐTDV mùa Đông, giải RoV, rank cộng đồng",W-PAD,150);c.textAlign="left";
    let y=HEAD;c.strokeStyle="rgba(255,255,255,.14)";c.lineWidth=1;
    lanes.forEach((l,i)=>{const x=PAD+LBL+i*CW+16;c.fillStyle=LCOL[l];c.beginPath();c.arc(x+5,y+26,5,0,7);c.fill();c.fillStyle="#f3f2ef";c.font=`400 14px ${disp}`;spaced(LANES[l].toUpperCase(),x+20,y+31,3);c.fillStyle=LCOL[l];c.fillRect(PAD+LBL+i*CW,y+LANEH-2,CW,2)});
    y+=LANEH+8;
    const needed=[...new Set(HEROES.filter(h=>TIERS.includes(tierOfX(h))).map(imgOf))];const imgs={};await Promise.all(needed.map(async s=>imgs[s]=await loadImg(s)));
    for(const t of TIERS){const rh=rowsH[t];
      c.fillStyle="rgba(255,255,255,.035)";c.fillRect(PAD,y,W-PAD*2,rh);c.strokeRect(PAD+.5,y+.5,W-PAD*2-1,rh-1);
      c.fillStyle=TCOL[t]+"2a";c.fillRect(PAD,y,LBL,rh);c.fillStyle=TCOL[t];c.fillRect(PAD,y,4,rh);
      c.font=`200 64px ${disp}`;c.fillText(t,PAD+24,y+76);c.fillStyle="#f3f2ef";c.font=`500 15px ${body}`;c.fillText(TNAME[t],PAD+24,y+104);
      lanes.forEach((l,i)=>{const x0=PAD+LBL+i*CW;if(i)c.fillStyle="rgba(255,255,255,.1)",c.fillRect(x0,y,1,rh);
        HEROES.filter(h=>h.lane===l&&tierOfX(h)===t).forEach((h,k)=>{const cx=x0+14+(k%PER)*(CARD+GAP),cy=y+14+Math.floor(k/PER)*(CARD+NAMEH+GAP);
          const im=imgs[imgOf(h)];if(im)c.drawImage(im,cx,cy,CARD,CARD);else{c.fillStyle=LCOL[l];c.fillRect(cx,cy,CARD,CARD)}
          c.strokeStyle=TCOL[t];c.lineWidth=t==="S"?2:1.5;c.strokeRect(cx+.75,cy+.75,CARD-1.5,CARD-1.5);c.lineWidth=1;c.strokeStyle="rgba(255,255,255,.14)";
          if(h.sec){c.fillStyle="rgba(0,0,0,.72)";c.fillRect(cx,cy+CARD-16,CARD,16);c.fillStyle="#fff";c.font=`500 9px ${disp}`;c.textAlign="center";c.fillText("PHỤ",cx+CARD/2,cy+CARD-5);c.textAlign="left"}
          c.fillStyle="#f3f2ef";c.font=`500 12.5px ${body}`;let nm=h.name;while(c.measureText(nm).width>CARD+GAP-2&&nm.length>3)nm=nm.slice(0,-2)+"…";c.fillText(nm,cx,cy+CARD+16)})});
      y+=rh+12}
    c.fillStyle="rgba(243,242,239,.55)";c.font=`400 14px ${disp}`;spaced("TIERLQ.GITHUB.IO",PAD,H-38,2.5);
    c.textAlign="right";c.font=`400 14px ${body}`;const upd=(document.querySelector(".foot")?.textContent.match(/\d{1,2}\/\d{1,2}\/\d{4}/)||[""])[0];c.fillText(upd?"Cập nhật "+upd:"",W-PAD,H-38);c.textAlign="left";
    const blob=await new Promise(r=>cv.toBlob(r,"image/jpeg",0.9));const name=which==="mine"?"tier-list-cua-toi.jpg":"bang-tier-lien-quan.jpg";
    const file=new File([blob],name,{type:"image/jpeg"});
    if(mq.matches&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:"Bảng Tier Liên Quân"});toast("Đã tạo ảnh");return}catch(e){if(e&&e.name==="AbortError")return}}
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);toast("Đã tải ảnh "+name);
  }catch(e){toast("Không tạo được ảnh, thử lại sau")}finally{btn.removeAttribute("aria-busy")}
}
$("dlImg").onclick=()=>exportImage(mode);
$("dlMine").onclick=()=>exportImage("mine");

/* ===== Cài như ứng dụng + dùng khi mạng yếu ===== */
if("serviceWorker" in navigator&&location.protocol==="https:")addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
buildFilters();buildStage();paintPP();setMode(mode);measure();
openFromHash();
requestAnimationFrame(()=>fitNames());document.fonts&&document.fonts.ready.then(()=>fitNames());
