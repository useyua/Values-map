/* 価値観マップ診断:画面の進行、保存、価値観診断 */
(function(){
"use strict";
const {VALS,QN,CARDS,TRIAGE,MODS,PROGRAMS,HOKUTO,EVIDENCE,BOOK}=window.Content;
const CH=window.Chara;
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const reduce=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
const KEY="vmap-shindan-v2",OLD="vmap-visual-v1";
const IMPL={m1:true};// 実装済みの診断

/* ---------- カードの辞書 ---------- */
const CAT={},EX={};
Object.keys(CARDS).forEach(k=>CARDS[k].forEach(([n,ex])=>{CAT[n]=k;EX[n]=ex;}));
const VI={};VALS.forEach((v,i)=>VI[v.n]=i);
const DECK_N=VALS.length*6;

/* ---------- 状態と保存 ---------- */
function fresh(){return{v:2,tri:[],prog:null,done:{},stampNew:null,cards:{},custom:[],rank:[],ev:{},def:{},gap:{},f:{},flags:[],
 mines:[null,null,null,null,null,null,null],ax:Array(12).fill(3),b0:[],b3:{},b4:{},
 sc:{w:{},co:[{n:"",ng:false,must:false,s:{}},{n:"",ng:false,must:false,s:{}},{n:"",ng:false,must:false,s:{}}]},
 m1:{phase:null,order:null,pos:0,short:false,duel:null,dh:[]},migrated:false,migSeen:false};}
const isObj=o=>o&&typeof o==="object"&&!Array.isArray(o);
const badName=v=>typeof v!=="string"||!v.trim()||/[|]/.test(v)||v in Object.prototype||v.length>30;
let S=fresh();
function load(){let raw=null;try{raw=localStorage.getItem(KEY);}catch(e){}
 if(raw){try{const o=JSON.parse(raw);if(isObj(o)){S=Object.assign(fresh(),o);S.m1=Object.assign(fresh().m1,isObj(o.m1)?o.m1:{});}}catch(e){}}
 else{let old=null;try{old=JSON.parse(localStorage.getItem(OLD)||"null");}catch(e){}if(isObj(old))migrate(old);}
 S.custom=(Array.isArray(S.custom)?S.custom:[]).filter(c=>!badName(c));
 ["cards","ev","def","gap","f","b3","b4","done"].forEach(k=>{if(!isObj(S[k]))S[k]={};});
 ["tri","rank","flags","b0"].forEach(k=>{if(!Array.isArray(S[k]))S[k]=[];});
 S.rank=S.rank.filter(c=>typeof c==="string"&&S.cards[c]===3);}
// 前のページ(vmap-visual-v1)の入力を引き継ぐ。形式が同じ項目はそのまま使う
function migrate(o){const pick=(k,t)=>{if(t==="arr"?Array.isArray(o[k]):isObj(o[k]))S[k]=o[k];};
 ["cards","ev","def","gap","f","b3","b4","sc"].forEach(k=>pick(k,"obj"));["custom","rank","flags","mines","ax","b0"].forEach(k=>pick(k,"arr"));
 const starred=Array.isArray(S.rank)?S.rank.filter(c=>isObj(S.cards)&&S.cards[c]===3):[];
 if(starred.length>=2){S.m1.phase="done";S.done.m1=true;}
 S.migrated=true;saveNow();}
let tmr=null,warned=false;
function saveNow(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){if(!warned){warned=true;toast("この端末に保存できませんでした(プライベートブラウズなど)。画面を閉じると入力が消えます");}}}
function save(){clearTimeout(tmr);tmr=setTimeout(saveNow,250);}
window.addEventListener("pagehide",()=>{if(tmr){clearTimeout(tmr);saveNow();}});

/* ---------- 小物 ---------- */
let toastT=null;
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("show"),2400);}
let timers=[];const later=(f,ms)=>{const id=setTimeout(f,reduce?0:ms);timers.push(id);return id;};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const cv=(c,w,cls)=>`<span class="cv ${cls||""}" data-c="${c}" data-w="${w}"></span>`;
const mascot=(e,w,cls)=>`<span class="cv ${cls||""}" data-m="${e}" data-w="${w}"></span>`;
const guideHTML=(txt,e)=>`<div class="guide">${mascot(e||"normal",58,"alive")}<p class="bubble">${txt}</p></div>`;
const CIRC='<svg class="circ" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M34 5 C84 1 160 2 188 10 C200 18 199 44 182 53 C142 60 60 60 18 53 C2 47 1 18 12 10 C24 4 52 3 76 4"/></svg>';
const STAR=on=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1L3.2 9.2l6.1-.8z" fill="${on?"var(--lemon)":"none"}" stroke="var(--outline)" stroke-width="2" stroke-linejoin="round"/></svg>`;
const stampSVG=(label,isNew)=>`<svg class="stampmark${isNew?" new":""}" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="33" fill="none" stroke="var(--tomato)" stroke-width="3.5" stroke-dasharray="150 5 40 4 8 3"/><circle cx="40" cy="40" r="26" fill="none" stroke="var(--tomato)" stroke-width="1.6"/><text x="40" y="47" text-anchor="middle" font-family="Zen Maru Gothic, sans-serif" font-weight="900" font-size="17" fill="var(--tomato)">${label}</text><path d="M40 12.5l2 4 4.4.6-3.2 3 .8 4.4-4-2.1-4 2.1.8-4.4-3.2-3 4.4-.6z" fill="var(--tomato)"/></svg>`;
function spark(el){if(reduce)return;const r=el.getBoundingClientRect(),s=document.createElement("span");s.className="spark";
 s.style.cssText=`left:${r.width-18}px;top:8px`;s.innerHTML=[-40,10,60].map(a=>`<i style="--a:${a}deg"></i>`).join("");el.appendChild(s);setTimeout(()=>s.remove(),500);}
// 区切りで、ほくとが画面の端から顔を出してひと言
function peek(text,e){const old=$(".peek");if(old)old.remove();const d=document.createElement("div");d.className="peek";d.setAttribute("role","status");
 d.innerHTML=`${mascot(e||"cheer",54)}<span class="bubble">${esc(text)}</span>`;document.body.appendChild(d);CH.paint(d);setTimeout(()=>d.classList.add("out"),reduce?1600:1500);setTimeout(()=>d.remove(),2000);}

/* ---------- 価値観の分析 ---------- */
const top5=()=>S.rank.filter(c=>S.cards[c]===3).slice(0,5);
const allCards=()=>Object.keys(CAT).concat(S.custom);
function charPick(){const cats=S.rank.map(c=>CAT[c]).filter(Boolean);if(!cats.length)return null;
 const i=VI[cats[0]];let j=null;for(const c of cats)if(VI[c]!==i){j=VI[c];break;}
 if(j==null){// トップ5がすべて同じ価値のときは、「とても大事」「重要」の枚数が多い価値を2番目にする
  const sc=VALS.map(()=>0);allCards().forEach(c=>{const k=CAT[c];if(!k||VI[k]===i)return;const r=S.cards[c];if(r===3)sc[VI[k]]+=3;else if(r===2)sc[VI[k]]+=1;});
  let best=-1;sc.forEach((v,k)=>{if(k!==i&&v>best){best=v;j=k;}});if(best<=0)j=(i+1)%10;}
 return{i,j};}
function analysis(){const t=top5();
 const hl={};t.forEach((c,i)=>{const k=CAT[c];if(!k)return;hl[k]=hl[k]?hl[k]+","+(i+1):String(i+1);});
 const cnt={open:0,enh:0,cons:0,trans:0};t.forEach((c,i)=>{const k=CAT[c];if(!k)return;const q=VALS[VI[k]].q,w=5-i;if(q==="hed"){cnt.open+=w/2;cnt.enh+=w/2;}else cnt[q]+=w;});
 const mx=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a]);
 const center=!cnt[mx[0]]?"判定なし":QN[mx[0]]+(cnt[mx[1]]>0&&cnt[mx[1]]>=cnt[mx[0]]*.6?" と "+QN[mx[1]]:"");
 const zero=Object.keys(cnt).filter(k=>cnt[k]===0).map(k=>QN[k]);
 const conf=[];if(cnt.open&&cnt.cons)conf.push(["開放性","保守","挑戦と安定"]);if(cnt.enh&&cnt.trans)conf.push(["自己高揚","自己超越","成果・報酬と貢献"]);
 return{t,hl,center,zero,conf,ch:charPick()};}
const exOf=c=>EX[c]?EX[c]:`「${c}」`;
function summary3(A){const t=A.t,L=[];
 if(t[0])L.push(`${exOf(t[0])}が、一番の条件`);
 if(t[1])L.push(`次に大事なのは、${exOf(t[1])}`);
 if(A.conf.length)L.push(`${A.conf.map(c=>c[2]).join("、")}の間で揺れやすい。両方を満たす職場が合う`);
 else if(A.center!=="判定なし")L.push(`重心は「${A.center}」。職場選びの軸がはっきりしている`);
 return L;}
function charInfo(ch){const v=CH.V[ch.i],w=CH.V[ch.j];return{name:w.it+v.a,title:w.adj+v.role,pair:`${v.k} × ${w.k}`,text:CH.T[ch.i][ch.j],yure:CH.yure(ch.i,ch.j)};}
function wheelSVG(hl){const R=112,cx=160,cy=158;let g=`<circle cx="${cx}" cy="${cy}" r="${R+24}" fill="none" stroke="var(--hair)" stroke-width="2"/>`;
 VALS.forEach((v,i)=>{const a=(i*36-90)*Math.PI/180,x=cx+R*Math.cos(a),y=cy+R*Math.sin(a),h=hl&&hl[v.n],r=h?20:13;
  g+=`<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--hair)" stroke-width="1.5"/>`;
  g+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${h?`var(--q-${v.q})`:"var(--card)"}" stroke="var(--outline)" stroke-width="2"/>`;
  g+=`<text x="${x.toFixed(1)}" y="${(y+(y<cy-5?-r-7:r+16)).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor" font-family="Zen Maru Gothic, sans-serif">${v.n}</text>`;
  if(h)g+=`<text x="${x.toFixed(1)}" y="${(y+5).toFixed(1)}" text-anchor="middle" font-size="${h.length>2?11:15}" font-weight="900" fill="#26324B" font-family="Zen Maru Gothic, sans-serif">${h}</text>`;});
 [["開放性",20],["自己高揚",125],["保守",215],["自己超越",305]].forEach(([t,d])=>{const a=(d-90)*Math.PI/180;g+=`<text x="${(cx+R*.42*Math.cos(a)).toFixed(1)}" y="${(cy+R*.42*Math.sin(a)+4).toFixed(1)}" text-anchor="middle" font-size="11.5" fill="currentColor" opacity=".6" font-family="Zen Maru Gothic, sans-serif">${t}</text>`;});
 return `<svg class="wheel" viewBox="0 0 320 320" role="img" aria-label="10の価値の円環。あなたのトップ5の位置">${g}</svg>`;}

/* ---------- ルーター ---------- */
const SCREENS={};
function route(){const h=(location.hash||"").replace(/^#\/?/,"");return h.split("/").filter(Boolean);}
function go(path,replace){const h="#/"+path;if(replace){history.replaceState(history.state,"",h);render();}else if(location.hash===h)render();else location.hash=h;}
let cleanup=null;
function render(){timers.forEach(clearTimeout);timers=[];if(cleanup){cleanup();cleanup=null;}
 const r=route(),name=r[0]||"top";const fn=SCREENS[name]||SCREENS.top;
 const main=$("#app");const out=fn(r.slice(1));if(out===false)return;// 別の画面へ転送済み
 main.innerHTML=`<div class="screen">${out.html}</div>`;
 $("#barRight").innerHTML=out.bar||"";
 document.title=(out.title?out.title+" | ":"")+"価値観マップ診断";
 CH.paint(document);
 window.scrollTo(0,0);try{main.focus({preventScroll:true});}catch(e){}
 if(out.after)out.after(main);}
window.addEventListener("hashchange",render);
const progBtn=`<a class="iconb" href="#/program">プログラム</a>`;

/* ---------- トップ ---------- */
function nextMod(){if(!S.prog)return null;return S.prog.mods.find(m=>!S.done[m])||null;}
function resumeText(){const m=nextMod();if(!m)return S.prog?{t:"最終レポート",s:"すべての診断が終わりました"}:null;
 const s=m==="m1"?(S.m1.phase==="sort"?`あと${DECK_N-S.m1.pos}枚`:S.m1.phase==="duel"?"勝ち抜き対決の途中":S.m1.phase?"もう少しで結果":MODS.m1.t):MODS[m].t;return{t:MODS[m].n,s};}
SCREENS.top=()=>{const rs=resumeText();
 const parade=shuffle([...Array(90)].map((_,k)=>{const i=Math.floor(k/9),j=k%9;return `${i}-${j>=i?j+1:j}`;})).slice(0,5);
 let h=`<section class="hero">${guideHTML(esc(HOKUTO.top),"cheer")}
 <h1>自分に合う職場を、<br><span class="mk">自分の物差し</span>で選ぼう</h1>
 <p class="lead">登録なし ・ 入力はこの端末にだけ保存</p></section>`;
 if(S.migrated&&!S.migSeen)h+=`<div class="card"><h3>前のページの入力を引き継ぎました</h3><p class="small">カードの仕分けや順位、書いたエピソードなどは、そのまま使えます。${S.done.m1?"価値観診断の結果もすぐ見られます。":""}</p><div class="row" style="display:flex;gap:10px;flex-wrap:wrap">${S.done.m1?`<a class="b small" href="#/m1/result">結果を見る</a>`:""}<button type="button" class="b sec small" id="migOk">わかった</button></div></div>`;
 h+=`<div class="btns">`;
 if(rs)h+=`<a class="b wide" href="#/program">プログラムのつづきへ</a><button type="button" class="resume" id="resume">${mascot("normal",40)}<span><b>続きから:${esc(rs.t)}</b>${esc(rs.s)}</span></button>`;
 else h+=`<a class="b wide" href="#/q/1">診断をはじめる</a>`;
 h+=`<button type="button" class="b sec wide" aria-disabled="true" id="guideSoon">図解ガイドを読む</button><p class="soon-note" style="margin:-6px 0 0">図解ガイドは次の段階で公開します</p></div>`;
 h+=`<div class="parade" aria-hidden="true">${parade.map(c=>cv(c,64,"alive")).join("")}</div><p class="hand small" style="text-align:center;margin:4px 0 0">90体のキャラのうち、あなたの1体が見つかるよ</p>`;
 h+=`<div class="foot"><p>入力した内容は、この端末のブラウザにだけ保存されます。外部には送信しません。</p>
 <p><a href="${encodeURI(BOOK)}" target="_blank" rel="noopener">詳細資料:価値観マップと科学的職場選び 解説実践ブック(PDF・66ページ)</a></p>
 ${rs?`<button type="button" class="linkb" id="redoTri">入口の質問からやり直す</button>`:""}
 <button type="button" class="linkb" id="resetAll">入力をすべて消す</button></div>`;
 return{html:h,after(){
  const mo=$("#migOk");if(mo)mo.onclick=()=>{S.migSeen=true;save();mo.closest(".card").remove();};
  const re=$("#resume");if(re)re.onclick=()=>{const m=nextMod();go(m&&IMPL[m]?m:"program");};
  $("#guideSoon").onclick=()=>toast("図解ガイドは次の段階で公開します");
  const rt=$("#redoTri");if(rt)rt.onclick=()=>go("q/1");
  $("#resetAll").onclick=()=>{if(!confirm("入力した内容をすべて消します。よろしいですか?"))return;S=fresh();S.migSeen=true;saveNow();go("",true);toast("入力を消しました");};}};};

/* ---------- 入口の4問 ---------- */
SCREENS.q=(a)=>{const n=Math.min(4,Math.max(1,+a[0]||1)),Q=TRIAGE[n-1],cur=S.tri[n-1];
 const h=`<div class="qhead">はじめに ${n}/4 <span class="stars">${[1,2,3,4].map(k=>STAR(k<n||(k===n&&cur!=null))).join("")}</span></div>
 <h1 class="q">${esc(Q.q)}</h1><p class="qhint">${esc(Q.hint)}</p>
 <div class="opts" role="group" aria-label="${esc(Q.q)}">${Q.o.map((o,i)=>`<button type="button" class="opt" data-i="${i}" aria-pressed="${cur===i}">${esc(o)}${CIRC}</button>`).join("")}</div>
 ${n>1?`<button type="button" class="linkb" id="qBack" style="margin-top:16px">← ひとつ前へ</button>`:""}`;
 return{html:h,title:"はじめに",bar:`<a class="iconb" href="#/" aria-label="トップへもどる">×</a>`,after(){
  let busy=false;
  $$(".opt").forEach(b=>b.onclick=()=>{if(busy)return;busy=true;const i=+b.dataset.i;
   $$(".opt").forEach(x=>{x.classList.remove("on");x.setAttribute("aria-pressed","false");});void b.offsetWidth;b.classList.add("on");b.setAttribute("aria-pressed","true");spark(b);
   S.tri[n-1]=i;save();
   later(()=>{if(n<4)go("q/"+(n+1));else{buildProgram();go("program");}},450);});
  const bk=$("#qBack");if(bk)bk.onclick=()=>go("q/"+(n-1));}};};
function buildProgram(){const q1=S.tri[0]!=null?S.tri[0]:1,q3=S.tri[2],base=PROGRAMS[q1];
 let mods=base.mods.slice();
 // 気になる会社がまだない人は、会社を比べる・確かめる診断を「あとで」に回す(悩みが会社のことなら残す)
 if(q3===0&&(q1===0||q1===1))mods=mods.filter(m=>m!=="m7"&&m!=="m8");
 const today=[1,2,4][S.tri[3]!=null?S.tri[3]:1];
 S.prog={q1,title:base.title,mods,later:Object.keys(MODS).filter(m=>!mods.includes(m)),today};
 if(!S.m1.phase)S.m1.short=S.tri[1]===0;
 if(!S.done.tri){S.done.tri=true;S.stampNew="tri";}
 save();}

/* ---------- プログラム(スタンプラリー) ---------- */
SCREENS.program=()=>{if(!S.prog){go("q/1",true);return false;}
 const P=S.prog,nx=nextMod(),isNew=S.stampNew;
 const mins=P.mods.reduce((s,m)=>s+(S.done[m]?0:MODS[m].min),0);
 const doneN=P.mods.filter(m=>S.done[m]).length;
 const slot=(label,sub,state,inner,href)=>`<button type="button" class="slot ${state}" ${href?`data-go="${href}"`:"disabled"}><span class="ring">${inner}</span>${esc(label)}<small>${esc(sub)}</small></button>`;
 let g=slot("入口の質問","クリア","done",stampSVG("クリア",isNew==="tri"),"q/1");
 P.mods.forEach(m=>{const d=S.done[m],impl=IMPL[m];
  if(d){const ch=m==="m1"?charPick():null;g+=slot(MODS[m].n,"クリア","done",ch?`${cv(ch.i+"-"+ch.j,52)}`+`<span style="position:absolute;right:-18px;bottom:-16px;width:40px">${stampSVG("済",isNew===m)}</span>`:stampSVG("クリア",isNew===m),m);}
  else if(!impl)g+=slot(MODS[m].n,MODS[m].t,"soon","準備中",null);
  else g+=slot(MODS[m].n,MODS[m].t,m===nx?"now":"",m===nx?"次":"",m);});
 g+=slot("最終レポート","すべて終えたら","soon","★",null);
 const nxImpl=nx&&IMPL[nx];
 const h=`<p class="small" style="margin:6px 0 0">あなたのプログラム</p><h1 class="prog-title">${esc(P.title)}</h1>
 <p class="prog-meta">${doneN}/${P.mods.length}クリア${mins?` ・ 残り約${mins}分`:""}</p>
 <div class="stampcard"><div class="stampgrid">${g}</div></div>
 <p class="today">今日は${P.today}つ押せたら十分!</p>
 <div class="btns">${nx?(nxImpl?`<a class="b wide" href="#/${nx}">${esc(MODS[nx].n)}を${nx==="m1"&&S.m1.phase?"つづける":"はじめる"}</a>`:`<button type="button" class="b wide" aria-disabled="true" id="nxSoon">${esc(MODS[nx].n)}は準備中</button>`):""}
 ${S.done.m1?`<a class="b sec wide" href="#/m1/result">価値観診断の結果を見る</a>`:""}</div>
 ${nx&&!nxImpl?`<p class="soon-note">この診断は次の段階で作ります。いまは価値観診断まで遊べます</p>`:""}
 <h2 style="font-size:18px;margin:28px 0 6px">このプログラムの診断</h2>
 <div class="modlist">${P.mods.map(m=>`<div class="moditem"><b>${esc(MODS[m].n)}</b><span class="tag ${S.done[m]?"ok":IMPL[m]?"go":"soon"}">${S.done[m]?"クリア":IMPL[m]?MODS[m].t:"準備中"}</span><span class="small">${esc(MODS[m].d)}</span></div>`).join("")}</div>
 ${P.later.length?`<details class="acc"><summary>ほかの診断(あとでできる)</summary><div class="in"><div class="modlist">${P.later.map(m=>`<div class="moditem"><b>${esc(MODS[m].n)}</b><span class="tag soon">${IMPL[m]?MODS[m].t:"準備中"}</span><span class="small">${esc(MODS[m].d)}</span></div>`).join("")}</div></div></details>`:""}
 <button type="button" class="linkb" id="redoTri">入口の質問をやり直す</button>`;
 S.stampNew=null;save();
 return{html:h,title:"あなたのプログラム",bar:`<a class="iconb" href="#/">トップ</a>`,after(){
  $$("[data-go]").forEach(b=>b.onclick=()=>{const m=b.dataset.go;if(m.startsWith("m")&&!IMPL[m])return toast("次の段階で作ります");go(m);});
  const ns=$("#nxSoon");if(ns)ns.onclick=()=>toast("次の段階で作ります");
  $("#redoTri").onclick=()=>go("q/1");}};};

/* ---------- 価値観診断(M1) ---------- */
SCREENS.m1=(a)=>{const sub=a[0],M=S.m1;
 if(!sub){const p=M.phase;go(p==="done"?"m1/result":p==="duel"?"m1/duel":p==="pick"?"m1/pick":p==="analyze"||p==="reveal"?"m1/reveal":p==="sort"?"m1/sort":M.short?"m1/pick":"m1/sort",true);return false;}
 if(sub==="sort")return m1Sort();
 if(sub==="pick")return m1Pick();
 if(sub==="duel")return m1Duel();
 if(sub==="analyze")return m1Analyze();
 if(sub==="reveal")return m1Reveal();
 if(sub==="result")return m1Result();
 go("m1",true);return false;};
function startSort(){const groups=shuffle(VALS.map((v,i)=>i));S.m1.order=groups.flatMap(g=>shuffle(CARDS[VALS[g].n].map(c=>c[0])));S.m1.pos=0;S.m1.phase="sort";S.m1.short=false;save();}
const silSVG=f=>`<svg viewBox="0 0 60 56" aria-hidden="true"><defs><clipPath id="silclip"><rect x="0" y="${(56-56*f).toFixed(1)}" width="60" height="56"/></clipPath></defs>
 <path id="silp" d="M14 16 L12 3 L24 11 Q30 9 36 11 L48 3 L46 16 Q56 26 52 40 Q48 53 30 53 Q12 53 8 40 Q4 26 14 16Z" fill="var(--card)" stroke="var(--outline)" stroke-width="2.4" stroke-linejoin="round"/>
 <path d="M14 16 L12 3 L24 11 Q30 9 36 11 L48 3 L46 16 Q56 26 52 40 Q48 53 30 53 Q12 53 8 40 Q4 26 14 16Z" fill="var(--lemon)" clip-path="url(#silclip)"/>
 <path d="M14 16 L12 3 L24 11 Q30 9 36 11 L48 3 L46 16 Q56 26 52 40 Q48 53 30 53 Q12 53 8 40 Q4 26 14 16Z" fill="none" stroke="var(--outline)" stroke-width="2.4" stroke-linejoin="round"/>
 <text x="30" y="40" text-anchor="middle" font-family="Zen Maru Gothic, sans-serif" font-weight="900" font-size="20" fill="var(--outline)">?</text></svg>`;
function m1Sort(){const M=S.m1;if(M.phase!=="sort"||!Array.isArray(M.order)||M.order.length!==DECK_N)startSort();
 const h=`<div class="m1bar"><span class="sil" id="sil"></span><div class="info">価値観診断 ・ 仕分け <b id="sPos"></b>/${DECK_N}<div class="stickers" id="stk"></div><span class="hand" id="silTxt"></span></div></div>
 <div class="stack" id="stack" aria-live="polite"></div>
 <div class="swb"><button type="button" id="bL"><span>←</span>重要でない</button><button type="button" id="bU" class="up"><span>↑</span>とても大事</button><button type="button" id="bR"><span>→</span>重要</button></div>
 <div class="sorttools"><button type="button" class="linkb" id="undo">↶ ひとつ戻す</button><span class="counts" id="cnts"></span></div>
 ${guideHTML(esc(HOKUTO.sortHint),"think")}
 <p class="small">カードは指で左右・上にはじいても仕分けられます。キーボードなら ← ↑ → キー。</p>`;
 return{html:h,title:"価値観診断",bar:progBtn,after(){const stack=$("#stack");let busy=false;
  const grpOf=p=>Math.floor(p/6);
  function bar(){const M=S.m1,p=M.pos;$("#sPos").textContent=Math.min(p+1,DECK_N);$("#sil").innerHTML=silSVG(p/DECK_N);
   $("#silTxt").textContent=p<6?"":p<DECK_N/2?"キャラが見えてきた…":"もうすぐ会えるよ";
   const gs=[...Array(10)].map((_,g)=>{const done=p>=(g+1)*6;const vi=VI[CAT[M.order[g*6]]];return `<span class="${done?"got":""}" title="${done?esc(VALS[vi].n):""}">${done?cv(vi+"-"+vi+"x",26):""}</span>`;});
   $("#stk").innerHTML=gs.join("");CH.paint($("#stk"));
   const c={3:0,2:0,1:0};M.order.slice(0,p).forEach(n=>{const r=S.cards[n];if(c[r]!=null)c[r]++;});
   $("#cnts").innerHTML=`とても大事 <b>${c[3]}</b> ・ 重要 <b>${c[2]}</b> ・ 重要でない <b>${c[1]}</b>`;
   $("#undo").disabled=p===0;$("#undo").style.visibility=p===0?"hidden":"visible";}
  function cardEl(name,back){const d=document.createElement("div");d.className="vcard"+(back?" back":"");
   const k=CAT[name];d.innerHTML=`<span class="stamp l">重要でない</span><span class="stamp r">重要</span><span class="stamp u">とても大事</span><span class="cat">${esc(k)}のなかま</span><span class="name">${esc(name)}</span><span class="ex">${esc(EX[name])}</span>`;
   if(!back){d.setAttribute("role","group");d.setAttribute("aria-label",`${name}。${EX[name]}`);}return d;}
  function draw(){const M=S.m1;stack.innerHTML="";bar();if(M.pos>=DECK_N)return;
   if(M.pos+1<DECK_N)stack.appendChild(cardEl(M.order[M.pos+1],true));const top=cardEl(M.order[M.pos],false);stack.appendChild(top);drag(top);}
  function decide(dir,el){const M=S.m1;if(busy||M.pos>=DECK_N)return;busy=true;el=el||stack.lastElementChild;
   const r=dir==="L"?1:dir==="R"?2:3,k=dir==="L"?"l":dir==="R"?"r":"u";S.cards[M.order[M.pos]]=r;
   const st=el&&el.querySelector(".stamp."+k);if(st)st.style.opacity="1";
   const to=dir==="L"?"translate(-140%,30px) rotate(-22deg)":dir==="R"?"translate(140%,30px) rotate(22deg)":"translate(0,-130%) rotate(-4deg)";
   const fin=()=>{M.pos++;save();busy=false;
    if(M.pos%6===0&&M.pos<DECK_N){const g=M.pos/6;peek(g===5?HOKUTO.group[2]:g===9?HOKUTO.group[4]:HOKUTO.group[[0,1,3][g%3]],"cheer");}
    if(M.pos>=DECK_N){M.phase="pick";save();go("m1/pick");return;}draw();};
   if(reduce||!el){fin();return;}
   el.style.transition="transform .25s ease-in, opacity .25s";el.style.transform=to;el.style.opacity="0";setTimeout(fin,230);}
  function drag(el){let sx=0,sy=0,dx=0,dy=0,on=false;const st=(k,v)=>{el.querySelector(".stamp."+k).style.opacity=v;};
   el.addEventListener("pointerdown",e=>{if(busy)return;on=true;sx=e.clientX;sy=e.clientY;dx=dy=0;try{el.setPointerCapture(e.pointerId);}catch(_){}el.style.transition="none";});
   el.addEventListener("pointermove",e=>{if(!on)return;dx=e.clientX-sx;dy=e.clientY-sy;el.style.transform=`translate(${dx}px,${dy}px) rotate(${dx/14}deg)`;
    st("r",Math.max(0,Math.min(1,dx/80)));st("l",Math.max(0,Math.min(1,-dx/80)));st("u",Math.max(0,Math.min(1,-dy/80)));});
   const end=()=>{if(!on)return;on=false;
    if(-dy>80&&Math.abs(dx)<90)decide("U",el);else if(dx>80)decide("R",el);else if(dx<-80)decide("L",el);
    else{el.style.transition="transform .2s";el.style.transform="";["r","l","u"].forEach(k=>st(k,0));}};
   el.addEventListener("pointerup",end);el.addEventListener("pointercancel",end);}
  $("#bL").onclick=()=>decide("L");$("#bR").onclick=()=>decide("R");$("#bU").onclick=()=>decide("U");
  $("#undo").onclick=()=>{const M=S.m1;if(busy||M.pos<=0)return;M.pos--;delete S.cards[M.order[M.pos]];save();draw();};
  const key=e=>{if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==="ArrowLeft"){e.preventDefault();decide("L");}else if(e.key==="ArrowRight"){e.preventDefault();decide("R");}else if(e.key==="ArrowUp"){e.preventDefault();decide("U");}};
  document.addEventListener("keydown",key);cleanup=()=>document.removeEventListener("keydown",key);
  draw();}};}

// 「とても大事」を5〜10枚にそろえる(短縮版はここで直接選ぶ)
function m1Pick(){const M=S.m1;if(!M.phase){M.phase="pick";M.short=true;save();}
 const short=M.short;
 const star=()=>allCards().filter(c=>S.cards[c]===3);
 const chip=c=>{const k=CAT[c],q=k?VALS[VI[k]].q:"";return `<button type="button" class="chip ${q?"q-"+q:""}" data-c="${esc(c)}" aria-pressed="${S.cards[c]===3}">${esc(c)}</button>`;};
 function body(){const n=star().length;
  let h="";
  if(short){h+=guideHTML(esc(HOKUTO.short),"normal");
   h+=VALS.map(v=>`<div class="picksec"><h3>${cv(VI[v.n]+"-"+VI[v.n]+"x",30)}${esc(v.n)}のなかま</h3><div class="chipset">${CARDS[v.n].map(c=>chip(c[0])).join("")}</div></div>`).join("");}
  else{h+=guideHTML(esc(n<5?HOKUTO.pickFew:n>10?HOKUTO.pickMany:HOKUTO.pickOk),n<5||n>10?"think":"cheer");
   const imp=allCards().filter(c=>S.cards[c]===2),low=allCards().filter(c=>S.cards[c]===1);
   h+=`<div class="picksec"><h3>とても大事</h3><div class="chipset">${allCards().filter(c=>S.cards[c]===3||M.was3&&M.was3.includes(c)).map(chip).join("")||`<span class="small">まだありません</span>`}</div></div>`;
   h+=`<div class="picksec"><h3>重要</h3><div class="chipset">${imp.filter(c=>!(M.was3||[]).includes(c)).map(chip).join("")||`<span class="small">なし</span>`}</div></div>`;
   if(low.length)h+=`<details class="acc"><summary>重要でない(${low.length}枚)</summary><div class="in"><div class="chipset">${low.map(chip).join("")}</div></div></details>`;}
  const cus=S.custom.filter(c=>short||S.cards[c]!==3&&!(M.was3||[]).includes(c));
  h+=`<div class="picksec"><h3>自分の言葉で足す</h3>${cus.length?`<div class="chipset" style="margin-bottom:8px">${cus.map(chip).join("")}</div>`:""}<div class="addrow"><input type="text" id="newCard" maxlength="30" placeholder="例:ものづくり" aria-label="追加するカードの名前"><button type="button" class="b sec small" id="addCard">足す</button></div><p class="small" id="addMsg"></p></div>`;
  h+=`<div class="stickybar"><p class="pickcount" id="pcnt"></p><button type="button" class="b wide" id="toDuel">勝ち抜き対決へ</button>${short?"":`<button type="button" class="linkb" id="reSort">カードを最初から仕分け直す</button>`}</div>`;
  return h;}
 return{html:`<div class="m1bar"><span class="sil">${silSVG(short?.5:1)}</span><div class="info">価値観診断 ・ <b>とても大事を選ぶ</b><br><span class="small">5〜10枚にすると、順位を決めやすくなります</span></div></div><div id="pickBody">${body()}</div>`,title:"価値観診断",bar:progBtn,after(){
  if(!M.was3)M.was3=star();// 最初に「とても大事」だったカードは、外しても同じ場所に残す
  const box=$("#pickBody");
  function count(){const n=star().length,el=$("#pcnt"),ok=n>=5&&n<=10;el.innerHTML=`★ とても大事 <b>${n}</b>枚 ${ok?"":n<5?`(あと${5-n}枚)`:`(${n-10}枚はずしてね)`}`;$("#toDuel").setAttribute("aria-disabled",String(!ok));}
  function bind(){$$(".chip",box).forEach(b=>b.onclick=()=>{const c=b.dataset.c,on=S.cards[c]===3;
    S.cards[c]=on?(short?0:2):3;if(!S.cards[c])delete S.cards[c];b.setAttribute("aria-pressed",String(!on));count();save();});
   $("#addCard").onclick=()=>{const inp=$("#newCard"),v=inp.value.trim();const msg=$("#addMsg");
    if(!v)return;if(badName(v)){msg.textContent="「|」を含む名前や30文字を超える名前は使えません。";return;}
    if(allCards().includes(v)){msg.textContent="同じ名前のカードがすでにあります。";return;}
    S.custom.push(v);S.cards[v]=3;save();box.innerHTML=body();bind();count();CH.paint(box);};
   $("#newCard").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();$("#addCard").click();}};
   $("#toDuel").onclick=()=>{const n=star().length;if(n<5||n>10){toast(n<5?`「とても大事」をあと${5-n}枚選んでね`:`「とても大事」を10枚まで絞ってね`);return;}
    startDuel(star());go("m1/duel");};
   const rs=$("#reSort");if(rs)rs.onclick=()=>{if(!confirm("仕分けを最初からやり直します。よろしいですか?"))return;Object.keys(CAT).forEach(c=>delete S.cards[c]);delete S.m1.was3;startSort();go("m1/sort");};}
  bind();count();}};}

// 勝ち抜き対決:マージソートの比較だけを出題し、比較の回数を少なくする
function worstCount(n){let q=Array(n).fill(1),c=0;while(q.length>1){const a=q.shift(),b=q.shift();c+=a+b-1;q.push(a+b);}return c;}
function startDuel(list){S.m1.duel={q:shuffle(list).map(x=>[x]),L:null,R:null,out:[],n:0,est:worstCount(list.length)};S.m1.dh=[];S.m1.phase="duel";delete S.m1.was3;advance();save();}
function advance(){const D=S.m1.duel;if(D.L&&D.L.length&&D.R&&D.R.length)return;
 if(D.L){D.q.push(D.out.concat(D.L,D.R));D.L=D.R=null;D.out=[];}
 if(D.q.length>1){D.L=D.q.shift();D.R=D.q.shift();D.out=[];}}
const duelDone=()=>{const D=S.m1.duel;return D&&!D.L&&D.q.length===1;};
function m1Duel(){const D=S.m1.duel;if(!D||S.m1.phase!=="duel"){go("m1",true);return false;}
 if(duelDone()){finishDuel();return false;}
 const a=D.L[0],b=D.R[0];
 const dot=[...Array(D.est)].map((_,k)=>`${k?`<u class="${k<=D.n?"on":""}"></u>`:""}<i class="${k<D.n?"on":k===D.n?"now":""}"></i>`).join("");
 const h=`<div class="m1bar"><span class="sil">${silSVG(1)}</span><div class="info">価値観診断 ・ 勝ち抜き対決 <b>${D.n+1}</b>回目<br><span class="small">最大あと${D.est-D.n}回。早く終わることもあるよ</span></div></div>
 <div class="track" aria-hidden="true">${dot}</div>
 <h1 class="duelq">人生でどちらか一方しか<br>守れないとしたら?</h1>
 <div class="duel"><button type="button" class="dc" data-s="L"><b>${esc(a)}</b><small>${esc(EX[a]||"あなたが足したカード")}</small></button><span class="vs">どっち?</span><button type="button" class="dc" data-s="R"><b>${esc(b)}</b><small>${esc(EX[b]||"あなたが足したカード")}</small></button></div>
 ${guideHTML(esc(HOKUTO.duelHint),"think")}
 ${S.m1.dh.length?`<button type="button" class="linkb" id="dUndo">↶ ひとつ戻す</button>`:""}
 <p class="small">キーボードなら ← → キーでも選べます。</p>`;
 return{html:h,title:"勝ち抜き対決",bar:progBtn,after(){let busy=false;
  const pick=s=>{if(busy)return;busy=true;const btn=$(`.dc[data-s="${s}"]`);btn.classList.add("win");
   const M=S.m1;M.dh.push(JSON.stringify(M.duel));if(M.dh.length>40)M.dh.shift();
   const d=M.duel;d.out.push(s==="L"?d.L.shift():d.R.shift());d.n++;advance();save();
   later(()=>{if(duelDone())finishDuel();else render();},260);};
  $$(".dc").forEach(b=>b.onclick=()=>pick(b.dataset.s));
  const u=$("#dUndo");if(u)u.onclick=()=>{const M=S.m1;const s=M.dh.pop();if(s){M.duel=JSON.parse(s);save();render();}};
  const key=e=>{if(e.key==="ArrowLeft"||e.key==="1"){e.preventDefault();pick("L");}else if(e.key==="ArrowRight"||e.key==="2"){e.preventDefault();pick("R");}};
  document.addEventListener("keydown",key);cleanup=()=>document.removeEventListener("keydown",key);}};}
function finishDuel(){const D=S.m1.duel,order=D.q[0];
 const rest=S.rank.filter(c=>S.cards[c]===3&&!order.includes(c));S.rank=order.concat(rest);
 S.m1.phase="analyze";S.m1.dh=[];save();go("m1/analyze",true);}

// 分析中:実際に行っている計算を1行ずつ見せる
function m1Analyze(){if(!top5().length){go("m1",true);return false;}
 const A=analysis(),t=A.t;
 const lines=[`トップ5を決めました(1位:${t[0]})`,"10の価値の円環に置きました",A.conf.length?`向かい合う価値(${A.conf.map(c=>c[2]).join("、")})を見つけました`:"向かい合う価値(葛藤軸)を調べました","90体の中から、あなたのキャラを決めています"];
 const h=`<div class="analyze">${mascot("think",130,"spin")}<h1 class="q" style="text-align:center">あなたの地図を描いています</h1><ul class="alines" id="al"></ul><button type="button" class="linkb" id="skip">タップでスキップ</button></div>`;
 return{html:h,title:"分析中",after(){const ul=$("#al");const done=()=>{S.m1.phase="reveal";save();go("m1/reveal",true);};
  if(reduce){ul.innerHTML=lines.map(l=>`<li>${esc(l)}</li>`).join("");later(done,900);}
  else{lines.forEach((l,k)=>later(()=>{ul.insertAdjacentHTML("beforeend",`<li>${esc(l)}</li>`);},300+k*330));later(done,1800);}
  $("#skip").onclick=done;$(".analyze").onclick=e=>{if(e.target.id!=="skip")done();};}};}

// 結果の開封:シールをはがすとキャラが出てくる
function m1Reveal(){const ch=charPick();if(!ch){go("m1",true);return false;}
 if(S.m1.phase==="analyze")S.m1.phase="reveal";
 const I=charInfo(ch);
 const h=`<p class="hand" style="text-align:center;margin:18px 0 0;font-size:17px">準備できたよ。シールをはがしてみて!</p>
 <div class="peelwrap" id="pw"><span class="under">${cv(ch.i+"-"+ch.j,230,"alive")}</span><div class="confetti" id="conf"></div>
 <button type="button" class="sticker" id="stk">あなたの<br>価値観キャラ<small>タップしてはがす</small></button></div>
 <div id="after" hidden style="text-align:center"><p class="small" style="margin:0">${esc(I.title)}</p><h1 style="font-size:32px;margin:0">${esc(I.name)}</h1></div>
 <div class="btns"><button type="button" class="b wide" id="toRes" hidden>結果を見る</button><button type="button" class="linkb" id="quick">すぐ見る</button></div>`;
 return{html:h,title:"結果の開封",after(){const st=$("#stk");let opened=false;
  const finish=()=>{if(!S.done.m1){S.done.m1=true;S.stampNew="m1";}S.m1.phase="done";save();};
  const open=()=>{if(opened)return;opened=true;finish();st.classList.add("gone");$("#pw").classList.add("open");confetti($("#conf"));
   later(()=>{$("#after").hidden=false;$("#toRes").hidden=false;$("#quick").hidden=true;$("#toRes").focus();},reduce?0:900);};
  st.onclick=open;let sy=null;st.addEventListener("pointerdown",e=>{sy=e.clientY;});st.addEventListener("pointermove",e=>{if(sy!=null&&sy-e.clientY>30)open();});
  $("#toRes").onclick=()=>go("m1/result",true);$("#quick").onclick=()=>{finish();go("m1/result",true);};}};}
function confetti(box){if(reduce||!box)return;const cols=["var(--tomato)","var(--lemon)","var(--mint)","var(--soda)","var(--peach)"];
 box.innerHTML=[...Array(18)].map((_,k)=>{const a=Math.random()*Math.PI*2,d=90+Math.random()*80;return `<i style="background:${cols[k%5]};--x:${(Math.cos(a)*d).toFixed(0)}px;--y:${(Math.sin(a)*d-40).toFixed(0)}px;--r:${(Math.random()*540-270).toFixed(0)}deg;animation-delay:${(Math.random()*.12).toFixed(2)}s"></i>`;}).join("");}

// 結果
function m1Result(){const A=analysis();if(!A.t.length||!A.ch){go("m1",true);return false;}
 const I=charInfo(A.ch),t=A.t,sum=summary3(A);
 const vq=c=>CAT[c]?VALS[VI[CAT[c]]].q:"none";
 const rest=S.rank.filter(c=>S.cards[c]===3).slice(5);
 const h=`<div class="reshead"><p class="kick">今のあなたの優先順位は</p>${cv(A.ch.i+"-"+A.ch.j,250,"alive")}
 <h1>${esc(I.name)}</h1><p class="ttl">${esc(I.title)}</p><p class="pair">${esc(I.pair)}${I.yure?`<span class="yure">ゆれ</span>`:""}</p></div>
 <div class="persona"><span class="lbl">こんな子</span><p>${esc(I.text)}</p></div>
 <div class="memo"><h3>3行まとめ</h3><ol>${sum.map(l=>`<li>${esc(l)}</li>`).join("")}</ol></div>
 <h2 style="font-size:18px;margin:22px 0 0">あなたのトップ5</h2>
 <ol class="ranks">${t.map((c,i)=>`<li><span class="no">${i+1}</span><span><b>${esc(c)}</b><br><span class="small">${esc(EX[c]||"あなたが足したカード")}</span></span><span class="qchip ${vq(c)}">${esc(CAT[c]||"円環外")}</span></li>`).join("")}</ol>
 ${rest.length?`<p class="small">6位以下:${rest.map(esc).join("、")}</p>`:""}
 <details class="acc"><summary>円環で見る重心</summary><div class="in">${wheelSVG(A.hl)}
  <p><b>重心:</b>${esc(A.center)}</p><p><b>空いているグループ:</b>${A.zero.length?esc(A.zero.join("、")):"なし(バランス型)"}</p>
  <p><b>葛藤軸:</b>${A.conf.length?A.conf.map(c=>esc(`${c[0]} ⇄ ${c[1]}(${c[2]})`)).join("<br>"):"大きな対立なし"}</p>
  ${I.yure?`<p class="small">トップ1とトップ2が円環の向かい側にある「ゆれ」タイプです。向かい側の価値は同時に満たしにくいので、両方をかなえる工夫(例:挑戦できるが雇用は安定)が職場選びの鍵になります。</p>`:""}
  <p class="small">円環で隣り合う価値は両立しやすく、向かい合う価値はぶつかりやすいとされています(Schwartz)。葛藤軸は欠点ではなく、職場を探すときの設計図です。</p></div></details>
 <details class="acc"><summary>職場の条件にすると</summary><div class="in">${t.map((c,i)=>{const k=CAT[c];return `<div class="cond"><b>${i+1}</b><span><b>${esc(c)}</b> → ${k?esc(VALS[VI[k]].w):"自分の言葉で条件にしてみよう"}</span></div>`;}).join("")}
  <p class="small">このあとの「理想の職場」で、必須・歓迎・NGの条件に仕上げます。</p></div></details>
 <details class="acc"><summary>この結果の根拠と限界</summary><div class="in"><div class="twocol"><div class="g"><h4>わかっていること</h4><ul>${EVIDENCE.good.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div><div class="l"><h4>気をつけること</h4><ul>${EVIDENCE.limit.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></div>
  <p class="small"><a href="${encodeURI(BOOK)}#page=6" target="_blank" rel="noopener">詳細資料へのリンク(第1章 p.6・第2章 p.10)↗</a></p></div></details>
 <div class="gorow"><button type="button" class="b wide" id="share">キャラを画像で保存・シェア</button>
 <a class="b sec wide" href="#/program">プログラムにもどる</a>
 <button type="button" class="b sec wide" id="saveM1">結果を保存(テキスト/PDF)</button>
 <button type="button" class="linkb" id="redo">価値観診断をやり直す</button></div>`;
 return{html:h,title:"価値観診断の結果",bar:progBtn,after(){
  $("#share").onclick=()=>shareImage(A,I);
  $("#saveM1").onclick=()=>openSave("m1");
  $("#redo").onclick=()=>{if(!confirm("価値観診断をやり直します。仕分けと順位は消えます(書いた文章は残ります)。よろしいですか?"))return;
   Object.keys(CAT).concat(S.custom).forEach(c=>delete S.cards[c]);S.rank=[];S.m1=Object.assign(fresh().m1,{short:S.tri[1]===0});S.done.m1=false;save();go("m1");};}};}

/* ---------- キャラを画像にする(友達と共有する用) ---------- */
function loadImg(src){return new Promise((ok,ng)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=ng;im.src=src;});}
async function shareImage(A,I){const W=900,H=1200,cv2=document.createElement("canvas");cv2.width=W;cv2.height=H;const g=cv2.getContext("2d");
 try{if(document.fonts&&document.fonts.load)await Promise.all(["900 60px 'Zen Maru Gothic'","700 30px 'Zen Maru Gothic'","600 30px 'Klee One'"].map(f=>document.fonts.load(f)));}catch(e){}
 const INK="#26324B";g.fillStyle="#D3EEF3";g.fillRect(0,0,W,H);
 const rr=(x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();};
 g.fillStyle=INK;rr(60,72,780,1040,44);g.fill();g.fillStyle="#fff";rr(60,60,780,1040,44);g.fill();g.lineWidth=5;g.strokeStyle=INK;g.stroke();
 g.save();g.translate(380,34);g.rotate(-.06);g.fillStyle="rgba(255,194,174,.9)";g.fillRect(0,0,140,40);g.restore();
 const svg=CH.charSVG(A.ch.i,A.ch.j).replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" width="520" height="530" ');
 try{const im=await loadImg("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg));g.drawImage(im,190,120,520,530);}catch(e){}
 g.textAlign="center";g.fillStyle="#56677F";g.font="600 32px 'Klee One', sans-serif";g.fillText("今のわたしの価値観キャラ",450,128);
 g.fillStyle=INK;g.font="900 76px 'Zen Maru Gothic', sans-serif";g.fillText(I.name,450,745);
 g.font="700 36px 'Zen Maru Gothic', sans-serif";g.fillText(I.title,450,805);
 g.fillStyle="#56677F";g.font="700 26px 'Zen Maru Gothic', sans-serif";g.fillText(I.pair,450,852);
 g.fillStyle="#FFF2C2";rr(130,890,640,150,18);g.fill();
 g.fillStyle=INK;g.font="600 30px 'Klee One', sans-serif";
 const wrap=(s,max)=>{const out=[];let cur="";for(const ch of s){if(g.measureText(cur+ch).width>max){out.push(cur);cur=ch;}else cur+=ch;}if(cur)out.push(cur);return out;};
 wrap(I.text,580).slice(0,3).forEach((l,k)=>g.fillText(l,450,944+k*42));
 g.fillStyle="#56677F";g.font="700 24px 'Zen Maru Gothic', sans-serif";g.fillText("価値観マップ診断 ・ "+location.host+location.pathname.replace(/index\.html$/,""),450,1160);
 const blob=await new Promise(r=>cv2.toBlob(r,"image/png"));if(!blob){toast("画像を作れませんでした");return;}
 const name=`価値観キャラ_${I.name}.png`,file=typeof File==="function"?new File([blob],name,{type:"image/png"}):null;
 showImgDlg(URL.createObjectURL(blob),name,file,I);}
function showImgDlg(url,name,file,I){let d=$("#imgDlg");if(!d){d=document.createElement("dialog");d.id="imgDlg";d.className="dlg";document.body.appendChild(d);}
 const canShare=!!(file&&navigator.canShare&&navigator.canShare({files:[file]}));
 d.innerHTML=`<button type="button" class="iconb x" data-x aria-label="閉じる">×</button><h2>キャラの画像</h2><img src="${url}" alt="${esc(I.name)}の画像" style="width:100%;border-radius:12px;margin:10px 0;border:2px solid var(--hair)"><p class="small">画像を長押しして保存することもできます。</p>
 <div class="row">${canShare?`<button type="button" class="b small" data-sh>シェアする</button>`:""}<button type="button" class="b ${canShare?"sec ":""}small" data-dl>画像を保存</button></div>`;
 const close=()=>{if(d.close)d.close();else d.removeAttribute("open");setTimeout(()=>URL.revokeObjectURL(url),500);};
 d.querySelector("[data-x]").onclick=close;
 const sh=d.querySelector("[data-sh]");if(sh)sh.onclick=async()=>{try{await navigator.share({files:[file],title:I.name,text:`わたしの価値観キャラは「${I.name}」(${I.title})`});}catch(e){}};
 d.querySelector("[data-dl]").onclick=()=>{const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();};
 if(d.showModal)d.showModal();else d.setAttribute("open","");}

/* ---------- 保存(テキスト=Markdown / PDF=画面プレビューから印刷) ---------- */
const today=()=>{const d=new Date(),p=n=>String(n).padStart(2,"0");return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;};
const cell=s=>String(s==null?"":s).replace(/\r?\n+/g," / ").replace(/\|/g,"｜").trim()||"(未記入)";
const mdTable=(head,rows)=>[`| ${head.map(cell).join(" | ")} |`,`|${head.map(()=>"---").join("|")}|`,...rows.map(r=>`| ${r.map(cell).join(" | ")} |`)].join("\n");
const LV={3:"とても大事",2:"重要",1:"重要でない"};
const SEC={
 m1:{title:"価値観診断の結果",file:"価値観診断",
  md(){const A=analysis(),L=[];if(!A.ch)return["(まだ結果がありません)"];const I=charInfo(A.ch);
   L.push(`## 価値観キャラ:${I.name}`,[`- 肩書き:${I.title}`,`- トップ1 × トップ2:${I.pair}${I.yure?"(ゆれ:円環の向かい側どうし)":""}`,`- こんな子:${I.text}`].join("\n"));
   L.push("## 3行まとめ",summary3(A).map((l,i)=>`${i+1}. ${l}`).join("\n"));
   L.push("## トップ5",mdTable(["順位","価値","満たされている状態","Schwartzの分類"],A.t.map((c,i)=>[i+1,c,EX[c]||"(自分で足したカード)",CAT[c]||"円環外"])));
   const rest=S.rank.filter(c=>S.cards[c]===3).slice(5);if(rest.length)L.push(`6位以下:${rest.join("、")}`);
   L.push("## 円環での読み取り",[`- 重心:${A.center}`,`- 空いているグループ:${A.zero.length?A.zero.join("、"):"なし(バランス型)"}`,`- 葛藤軸:${A.conf.length?A.conf.map(c=>`${c[0]} ⇄ ${c[1]}(${c[2]})`).join("/"):"大きな対立なし"}`].join("\n"));
   L.push("## カードの仕分け",[3,2,1].map(s=>{const cs=allCards().filter(c=>S.cards[c]===s);return `- ${LV[s]}(${cs.length}枚):${cs.length?cs.join("、"):"なし"}`;}).join("\n"));
   return L;},
  html(){const A=analysis();if(!A.ch)return `<p>(まだ結果がありません)</p>`;const I=charInfo(A.ch);
   return `<div class="rp-char">${cv(A.ch.i+"-"+A.ch.j,150)}<div><p class="small" style="margin:0">今のあなたの優先順位は</p><h2>${esc(I.name)}</h2><p style="margin:0"><b>${esc(I.title)}</b> ・ ${esc(I.pair)}${I.yure?" ・ ゆれ":""}</p><p style="margin:6px 0 0">${esc(I.text)}</p></div></div>
   <div class="rp-box" style="background:#FFF2C2"><b>3行まとめ</b><ol style="margin:4px 0 0">${summary3(A).map(l=>`<li>${esc(l)}</li>`).join("")}</ol></div>
   <h3>トップ5</h3><table><tr><th>順位</th><th>価値</th><th>満たされている状態</th><th>分類</th></tr>${A.t.map((c,i)=>`<tr><td>${i+1}</td><td><b>${esc(c)}</b></td><td>${esc(EX[c]||"(自分で足したカード)")}</td><td>${esc(CAT[c]||"円環外")}</td></tr>`).join("")}</table>
   <h3>円環での読み取り</h3><div style="display:grid;grid-template-columns:260px 1fr;gap:14px;align-items:center;break-inside:avoid"><div>${wheelSVG(A.hl)}</div><div><p><b>重心:</b>${esc(A.center)}</p><p><b>空いているグループ:</b>${A.zero.length?esc(A.zero.join("、")):"なし(バランス型)"}</p><p><b>葛藤軸:</b>${A.conf.length?A.conf.map(c=>esc(`${c[0]} ⇄ ${c[1]}(${c[2]})`)).join("<br>"):"大きな対立なし"}</p></div></div>
   <h3>カードの仕分け</h3>${[3,2,1].map(s=>{const cs=allCards().filter(c=>S.cards[c]===s);return `<p><b>${LV[s]}(${cs.length}枚)</b> ${cs.length?esc(cs.join("、")):"なし"}</p>`;}).join("")}`;}}};
const fileBase=k=>(SEC[k].file+"_"+today()).replace(/[\\/:*?"<>|\s]+/g,"_").slice(0,80);
function buildMD(k){return[`# ${SEC[k].title}`,`> 出力日:${today()} / 価値観マップ診断`,...SEC[k].md()].join("\n\n")+"\n";}
function buildReport(k){return `<header class="rp-head"><h1>${esc(SEC[k].title)}</h1><p class="small" style="margin:0">出力日 ${today()} ・ 価値観マップ診断</p></header><section class="rp-sec">${SEC[k].html()}</section>`;}
let saveKey="m1",reportMode=false,titleBak=null,scrollBak=0;
const dlg=$("#saveDlg");
const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const RP_HINT=!isIOS?"「印刷・PDFに保存」を押し、送信先(プリンター)で「PDFに保存」を選んでください。"
 :/CriOS|FxiOS|EdgiOS|GSA\//.test(navigator.userAgent)?"印刷画面が開かないときは、ブラウザの共有ボタン(□に↑)から「プリント」を選んでください。プリントオプション上部の共有ボタンから「\"ファイル\"に保存」でPDFになります。"
 :"「印刷・PDFに保存」→ プリントオプション上部の共有ボタン(□に↑)→「\"ファイル\"に保存」でPDFになります。";
function openSave(k){saveKey=k;$("#saveTitle").textContent=`「${SEC[k].title}」を保存`;$("#saveChoose").hidden=false;$("#saveText").hidden=true;$("#mdMsg").textContent="";
 if(dlg.showModal)dlg.showModal();else dlg.setAttribute("open","");}
function closeSave(){if(dlg.close)dlg.close();else dlg.removeAttribute("open");}
$("#dlgClose").onclick=closeSave;
$("#mdBack").onclick=()=>{$("#saveChoose").hidden=false;$("#saveText").hidden=true;$("#mdMsg").textContent="";};
$("#optText").onclick=()=>{const ta=$("#mdOut");ta.value=buildMD(saveKey);$("#saveChoose").hidden=true;$("#saveText").hidden=false;ta.scrollTop=0;};
$("#optPdf").onclick=()=>{closeSave();showReport(saveKey);};
$("#mdCopy").onclick=async()=>{const ta=$("#mdOut");let ok=false;
 try{await navigator.clipboard.writeText(ta.value);ok=true;}catch(e){try{ta.focus();ta.select();ok=document.execCommand("copy");}catch(e2){}}
 $("#mdMsg").textContent=ok?"コピーしました。AIやメモアプリに貼り付けられます。":"自動でコピーできませんでした。テキストを長押し(または Ctrl+A)で選択してコピーしてください。";};
$("#mdDl").onclick=()=>{const name=fileBase(saveKey)+".md";try{const url=URL.createObjectURL(new Blob([$("#mdOut").value],{type:"text/markdown;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$("#mdMsg").textContent=`${name} を保存しました。`;}
 catch(e){$("#mdMsg").textContent="ファイルを保存できませんでした。「コピー」を使ってください。";}};
// PDFは、レポートを画面にプレビュー表示してから印刷する(iPhoneで印刷画面が開かない問題への対策)
function showReport(k){$("#report").innerHTML=buildReport(k);CH.paint($("#report"));$("#rpHint").textContent=RP_HINT;
 if(!reportMode){scrollBak=window.scrollY;titleBak=document.title;try{history.pushState({report:1},"");}catch(e){}}
 reportMode=true;document.body.classList.add("reporting");document.title=fileBase(k);window.scrollTo(0,0);$("#rpPrint").focus();}
function endReport(){if(!reportMode)return;reportMode=false;document.body.classList.remove("reporting");$("#report").innerHTML="";
 if(titleBak!=null){document.title=titleBak;titleBak=null;}window.scrollTo(0,scrollBak);}
$("#rpPrint").onclick=()=>window.print();
$("#rpBack").onclick=()=>{if(history.state&&history.state.report)history.back();else endReport();};
window.addEventListener("popstate",()=>{if(reportMode)endReport();});

/* ---------- 起動 ---------- */
load();
render();
window.__vmap={get S(){return S;},analysis,charPick,worstCount};// 動作確認用
})();
