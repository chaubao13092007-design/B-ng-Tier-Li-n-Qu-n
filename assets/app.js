/* Giao diện và tương tác — thường không cần sửa khi cập nhật số liệu */

const $=id=>document.getElementById(id);
function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
const freshMine=()=>Object.fromEntries(HEROES.map(h=>[h.id,h.tier]));
const mq=window.matchMedia("(max-width:719px)");
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
  $("lanesM").onclick=e=>{const b=e.target.closest("button");if(!b)return;mLane=b.dataset.l;store("lq-mlane",mLane);
    $("lanesM").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.l===mLane));draw()};
}
function activeCount(){return F.cls.size+F.trend.size+(mq.matches?0:F.lane.size)+(q?1:0)}
function syncFilterUI(){const n=activeCount();$("fcount").hidden=!(F.cls.size+F.trend.size);$("fcount").textContent=F.cls.size+F.trend.size;$("freset").hidden=!n}
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
  syncFilterUI();
  if(!list.length){
    const elsewhere=mq.matches?Object.keys(LANES).filter(l=>l!==mLane).map(l=>[l,HEROES.filter(h=>h.lane===l&&match(h)).length]).filter(x=>x[1]):[];
    board.innerHTML=`<div class="empty"><b>${elsewhere.length?"Đường này không có tướng khớp":"Không có tướng nào khớp"}</b>
      <span>${elsewhere.length?"Có kết quả ở đường khác:":"Thử bỏ bớt bộ lọc hoặc đổi từ khoá tìm kiếm."}</span>
      ${elsewhere.length?`<div class="empty-go">${elsewhere.map(([l,n])=>`<button class="btn" data-lane="${l}"><span class="lanebar" style="background:var(--l-${l})"></span>${LANES[l]} · ${n}</button>`).join("")}</div>`:""}
      <button class="btn${elsewhere.length?" ghost":""}" id="emptyReset">Xoá lọc</button></div>`;
    $("emptyReset").onclick=resetFilters;
    board.querySelectorAll("[data-lane]").forEach(bt=>bt.onclick=()=>{mLane=bt.dataset.lane;store("lq-mlane",mLane);$("lanesM").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.l===mLane));draw()});
    return}
  let html=`<div class="hrow"><div></div>${lanes.map(l=>`<div style="--lc:var(--l-${l})"><span class="lanebar" style="background:var(--l-${l})"></span>${LANES[l]} <small>${list.filter(h=>h.lane===l).length}</small></div>`).join("")}</div>`;
  const rows=mode==="mine"?[...TIERS,"X"]:TIERS;
  rows.forEach(t=>{
    const inTier=list.filter(h=>tierOf(h)===t);
    if(mode==="meta"&&!inTier.length&&(q||F.cls.size||F.trend.size))return;
    html+=`<div class="trow${mode==="mine"&&selected?" target":""}" data-t="${t}"><div class="tl" aria-label="Tier ${t==="X"?"chưa xếp":t}, ${inTier.length} tướng"><span class="L">${t==="X"?"–":t}</span><small>${t==="X"?"Chưa xếp":TNAME[t]}</small><em>${TDESC[t]}</em><span class="cnt">${inTier.length} tướng</span></div>`;
    lanes.forEach(l=>{
      const items=inTier.filter(h=>h.lane===l);
      html+=`<div class="cell" data-t="${t}">${items.map(h=>`<button class="card${selected===h.id?" sel":""}${q?" hit":""}" data-id="${h.id}" data-t="${tierOf(h)}" style="${vtOn?`view-transition-name:c-${h.id.replace(/[^a-z0-9-]/g,"")};`:""}--d:${(h.score*7)%4}" aria-label="${h.name}, ${LANES[h.lane]}${h.sec?" (đường phụ)":""}, tier ${tierOf(h)}" ${mode==="mine"?'draggable="true"':""}>${portrait(h).replace('</div>',tierOf(h)==="S"?'<span class="sweep"></span></div>':'</div>')}<span class="nm">${h.name}</span></button>`).join("")||'<span class="none" aria-hidden="true">—</span>'}</div>`;
    });
    html+=`</div>`;
  });
  board.innerHTML=html;
  observeRows();
}
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
let lastFocus=null;
function visibleOrder(){return [...document.querySelectorAll("#board .card")].map(c=>c.dataset.id)}
function openModal(id){
  const h=HEROES.find(x=>x.id===id);if(!h)return;const b=TR[h.trend];
  if(!$("veil"))lastFocus=document.activeElement;
  const others=HEROES.filter(x=>x.key===h.key&&x.id!==h.id);
  const order=visibleOrder(),i=order.indexOf(id);
  $("modalRoot").innerHTML=`<div class="veil" id="veil"><div class="modal" role="dialog" aria-modal="true" aria-label="${h.name}">
    <div class="mtop"><button id="mprev" aria-label="Tướng trước" ${i<=0?"disabled":""}>‹</button><button id="mnext" aria-label="Tướng sau" ${i<0||i>=order.length-1?"disabled":""}>›</button><button id="mx" aria-label="Đóng">×</button></div>
    <div class="m-ban${splOf(h)?"":" noimg"}">${splOf(h)?`<img src="${splOf(h)}" alt="" decoding="async">`:""}</div>
    <div class="m-body"><div class="card" data-t="${h.tier}">${portrait(h)}</div>
    <div><h3>${h.name}</h3>
      <div class="tags"><span class="tag" style="color:var(--t-${h.tier.toLowerCase()})">Tier ${h.tier} · ${TNAME[h.tier]}</span><span class="tag">${LANES[h.lane]}${h.sec?" (đường phụ)":""}</span><span class="tag">${CLASSES[h.cls]}</span>${b?`<span class="tag mv ${b[1]}">${b[2]}</span>`:""}</div>
      ${breakdown(h)}
      <p>${h.note||"Không có thay đổi ở bản 29/09."}</p>
      ${others.length?`<div class="other"><span>Còn đi:</span>${others.map(x=>`<button data-go="${x.id}" style="--lc:var(--l-${x.lane})"><i></i>${LANES[x.lane]}${x.sec?" (phụ)":""} · ${x.tier}</button>`).join("")}</div>`:""}
    </div></div></div></div>`;
  document.documentElement.classList.add("lock");hideTip();
  const close=()=>{$("modalRoot").innerHTML="";document.documentElement.classList.remove("lock");document.removeEventListener("keydown",key);lastFocus&&lastFocus.focus&&lastFocus.focus()};
  const go=d=>{const n=order[i+d];if(n){document.removeEventListener("keydown",key);openModal(n)}};
  const key=e=>{if(e.key==="Escape")close();else if(e.key==="ArrowLeft")go(-1);else if(e.key==="ArrowRight")go(1);
    else if(e.key==="Tab"){const f=[...$("modalRoot").querySelectorAll("button:not(:disabled)")];if(!f.length)return;const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
  document.addEventListener("keydown",key);
  $("veil").onclick=e=>{if(e.target.id==="veil")close()};$("mx").onclick=close;
  $("mprev").onclick=()=>go(-1);$("mnext").onclick=()=>go(1);
  $("modalRoot").querySelectorAll("[data-go]").forEach(bt=>bt.onclick=()=>{document.removeEventListener("keydown",key);openModal(bt.dataset.go)});
  fitNames($("modalRoot"));$("mx").focus();
}

/* Chế độ, tìm kiếm, phím tắt */
function setMode(m){mode=m;selected=null;store("lq-mode",m);$("m-meta").setAttribute("aria-pressed",m==="meta");$("m-mine").setAttribute("aria-pressed",m==="mine");$("minebar").hidden=m!=="mine";hideTip();draw()}
$("m-meta").onclick=()=>setMode("meta");$("m-mine").onclick=()=>setMode("mine");
$("q").oninput=e=>{q=e.target.value.trim();draw()};
$("q").onkeydown=e=>{if(e.key==="Escape"){e.target.value="";q="";draw();e.target.blur()}
  else if(e.key==="Enter"){const first=document.querySelector("#board .card");if(first&&mode==="meta"){openModal(first.dataset.id)}}};
document.addEventListener("keydown",e=>{if(e.key==="/"&&!$("veil")&&document.activeElement.tagName!=="INPUT"){e.preventDefault();$("q").focus()}});
$("freset").onclick=resetFilters;
function setSheet(o){$("filters").classList.toggle("open",o);$("ftoggle").setAttribute("aria-expanded",o);if(o&&mq.matches)$("fdone").focus();else if(!o)$("ftoggle").focus()}
$("ftoggle").onclick=()=>setSheet(!$("filters").classList.contains("open"));
$("fdone").onclick=()=>setSheet(false);$("fclear").onclick=()=>{resetFilters()};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("filters").classList.contains("open")&&!$("veil")&&mq.matches)setSheet(false)});
$("aboutBtn").onclick=()=>{const a=$("about");a.hidden=!a.hidden;$("aboutBtn").setAttribute("aria-expanded",!a.hidden);$("aboutBtn").textContent=a.hidden?"Cách đọc bảng":"Ẩn hướng dẫn";if(!a.hidden)a.scrollIntoView({behavior:reduce.matches?"auto":"smooth",block:"start"})};
function toast(s){const t=$("toast");t.textContent=s;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,1800)}
$("rmeta").onclick=()=>{mine=freshMine();store("lq-mine2",mine);draw();toast("Đã lấy lại bảng Meta")};
$("rclear").onclick=()=>{HEROES.forEach(h=>mine[h.id]="X");store("lq-mine2",mine);draw();toast("Đã đưa hết về Chưa xếp")};
$("copy").onclick=()=>{
  const txt="Tier list Liên Quân của tôi\n"+Object.entries(LANES).map(([l,ln])=>`[${ln}]\n`+TIERS.map(t=>`${t}: ${HEROES.filter(h=>h.lane===l&&mine[h.id]===t).map(h=>h.name).join(", ")||"—"}`).join("\n")).join("\n\n");
  try{navigator.clipboard.writeText(txt).then(()=>toast("Đã sao chép"),()=>toast("Trình duyệt không cho sao chép"))}catch(e){toast("Trình duyệt không cho sao chép")}
};

/* Thanh dính: đo chiều cao để tiêu đề cột dính ngay bên dưới */
function measure(){document.documentElement.style.setProperty("--barh",$("bar").offsetHeight+"px")}
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
  let W=0,H=0,dpr=1;
  function size(){dpr=Math.min(devicePixelRatio||1,1.5);const r=cv.getBoundingClientRect();W=Math.max(1,r.width*dpr|0);H=Math.max(1,r.height*dpr|0);cv.width=W;cv.height=H;gl.viewport(0,0,W,H)}
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
    gl.uniform1f(uOff,small?-0.12:-0.36);gl.uniform2f(uMouse,mx,my);gl.uniform1f(uStir,stir);gl.uniform1f(uZoom,(small?0.56:0.95)*(1+sc*0.25));
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
  let ticking=false,maxS=1,vh=innerHeight;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const measureDoc=()=>{vh=innerHeight;maxS=Math.max(1,root.scrollHeight-vh)};
  function update(){ticking=false;
    const y=scrollY,pp=clamp(y/maxS);
    bar.style.transform=`scaleX(${pp.toFixed(4)})`;ring.style.strokeDashoffset=(125.7*(1-pp)).toFixed(1);
    const showTop=y>vh*0.9;if(totop.hidden===showTop)totop.hidden=!showTop;
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
buildFilters();buildStage();paintPP();setMode(mode);measure();
requestAnimationFrame(()=>fitNames());document.fonts&&document.fonts.ready.then(()=>fitNames());
