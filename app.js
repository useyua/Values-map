/* 価値観マップ診断:画面の進行、保存、価値観診断 */
(function(){
"use strict";
const {VALS,QN,CARDS,TRIAGE,MODS,PROGRAMS,HOKUTO,EVIDENCE,BOOK,EPIS,DEF_EX,SELF_Q,LIKERT,SELF_T,WHY_WHAT,ASK5,ACT_EX,MINES,MINE_OPT,OT,REDFLAGS,CONDS,COND_OPT,HEX,RIASEC_Q,RI_OPT,DIRS,SOURCES,AX,B0,B0G,VERDICT}=window.Content;
const CH=window.Chara;
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const reduce=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
const KEY="vmap-shindan-v2",OLD="vmap-visual-v1";

/* ---------- カードの辞書 ---------- */
const CAT={},EX={};
Object.keys(CARDS).forEach(k=>CARDS[k].forEach(([n,ex])=>{CAT[n]=k;EX[n]=ex;}));
const VI={};VALS.forEach((v,i)=>VI[v.n]=i);
const DECK_N=VALS.length*6;

/* ---------- 状態と保存 ---------- */
function fresh(){return{v:2,tri:[],prog:null,done:{},stampNew:null,cards:{},custom:[],rank:[],ev:{},def:{},gap:{},f:{},flags:[],
 mines:[null,null,null,null,null,null,null],ax:Array(12).fill(3),b0:[],b3:{},b4:{},
 sc:{w:{},co:[{n:"",ng:false,must:false,s:{}},{n:"",ng:false,must:false,s:{}},{n:"",ng:false,must:false,s:{}}]},
 m1:{phase:null,order:null,pos:0,short:false,duel:null,dh:[]},m3:[],m5:{mines:[],ot:null},m6:{order:null,c:{},ri:[]},cos:[],m8cur:null,missions:[],migrated:false,migSeen:false};}
const isObj=o=>o&&typeof o==="object"&&!Array.isArray(o);
const badName=v=>typeof v!=="string"||!v.trim()||/[|]/.test(v)||v in Object.prototype||v.length>30;
let S=fresh();
function load(){let raw=null;try{raw=localStorage.getItem(KEY);}catch(e){}
 if(raw){try{const o=JSON.parse(raw);if(isObj(o)){S=Object.assign(fresh(),o);S.m1=Object.assign(fresh().m1,isObj(o.m1)?o.m1:{});}}catch(e){}}
 else{let old=null;try{old=JSON.parse(localStorage.getItem(OLD)||"null");}catch(e){}if(isObj(old))migrate(old);}
 S.custom=(Array.isArray(S.custom)?S.custom:[]).filter(c=>!badName(c));
 ["cards","ev","def","gap","f","b3","b4","done"].forEach(k=>{if(!isObj(S[k]))S[k]={};});
 ["tri","rank","flags","b0","m3","missions","cos"].forEach(k=>{if(!Array.isArray(S[k]))S[k]=[];});
 const F=fresh();["m5","m6"].forEach(k=>{S[k]=Object.assign(F[k],isObj(S[k])?S[k]:{});});
 if(!Array.isArray(S.m5.mines))S.m5.mines=[];if(!isObj(S.m6.c))S.m6.c={};if(!Array.isArray(S.m6.ri))S.m6.ri=[];
 S.rank=S.rank.filter(c=>typeof c==="string"&&S.cards[c]===3);}
// 前のページ(vmap-visual-v1)の入力を引き継ぐ。形式が同じ項目はそのまま使う
function migrate(o){const pick=(k,t)=>{if(t==="arr"?Array.isArray(o[k]):isObj(o[k]))S[k]=o[k];};
 ["cards","ev","def","gap","f","b3","b4","sc"].forEach(k=>pick(k,"obj"));["custom","rank","flags","mines","ax","b0"].forEach(k=>pick(k,"arr"));
 const starred=Array.isArray(S.rank)?S.rank.filter(c=>isObj(S.cards)&&S.cards[c]===3):[];
 if(starred.length>=2){S.m1.phase="done";S.done.m1=true;}
 const cos=[],nid=j=>"old"+j;
 if(isObj(o.sc)&&Array.isArray(o.sc.co))o.sc.co.forEach((c,j)=>{if(!isObj(c))return;const used=c.n||c.ng||c.must||(isObj(c.s)&&Object.keys(c.s).length);if(!used)return;
  cos.push({id:nid(j),n:String(c.n||`会社${j+1}`).slice(0,30),m7:{s:isObj(c.s)?c.s:{},note:{},ng:!!c.ng,must:!!c.must},m8:null});});
 const f=isObj(o.f)?o.f:{};const vUsed=f.v_name||(Array.isArray(o.b0)&&o.b0.length)||(isObj(o.b3)&&Object.keys(o.b3).length)||f.v_premortem||f.v_friend;
 if(vUsed){const n=String(f.v_name||"検証した会社").slice(0,30);let c=cos.find(x=>x.n===n);if(!c){c={id:"oldv",n,m7:{s:{},note:{},ng:false,must:false},m8:null};cos.push(c);}
  c.m8={b0:Array.isArray(o.b0)?o.b0.filter(x=>typeof x==="string"):[],mines:Array.isArray(o.mines)?o.mines.slice(0,7):[null,null,null,null,null,null,null],ax:Array.isArray(o.ax)&&o.ax.length===12?o.ax.map(x=>+x||3):Array(12).fill(3),b3:isObj(o.b3)?o.b3:{},b4:isObj(o.b4)?o.b4:{},pre:String(f.v_premortem||""),friend:String(f.v_friend||""),step:"b0"};}
 S.cos=cos;
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
// 保留にした価値(エピソードが見つからない価値)は、保留でない価値の後ろに回す
const held=c=>!!(S.ev[c]&&S.ev[c].hold);
const effRank=()=>{const r=S.rank.filter(c=>S.cards[c]===3);return r.filter(c=>!held(c)).concat(r.filter(held));};
const top5=()=>effRank().slice(0,5);
const allCards=()=>Object.keys(CAT).concat(S.custom);
function charPick(){const cats=effRank().map(c=>CAT[c]).filter(Boolean);if(!cats.length)return null;
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
 return{t,hl,center,zero,conf,qs:mx.filter(k=>cnt[k]>0),ch:charPick()};}
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
 h+=`<a class="b sec wide" href="guide.html">図解ガイドを読む</a></div>`;
 h+=`<div class="parade" aria-hidden="true">${parade.map(c=>cv(c,64,"alive")).join("")}</div><p class="hand small" style="text-align:center;margin:4px 0 0">90体のキャラのうち、あなたの1体が見つかるよ</p>`;
 h+=`<div class="foot"><p>入力した内容は、この端末のブラウザにだけ保存されます。外部には送信しません。</p>
 <p><a href="${encodeURI(BOOK)}" target="_blank" rel="noopener">詳細資料:価値観マップと科学的職場選び 解説実践ブック(PDF・66ページ)</a></p>
 ${rs?`<button type="button" class="linkb" id="redoTri">入口の質問からやり直す</button>`:""}
 ${S.done.m1?`<p><a href="#/zukan">価値キャラ図鑑</a></p>`:""}${S.cos.length?`<p><a href="#/file">候補ファイル</a></p>`:""}<button type="button" class="linkb" id="resetAll">入力をすべて消す</button></div>`;
 return{html:h,after(){
  const mo=$("#migOk");if(mo)mo.onclick=()=>{S.migSeen=true;save();mo.closest(".card").remove();};
  const re=$("#resume");if(re)re.onclick=()=>{const m=nextMod();go(m?m:S.done.m1?"report":"program");};
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
 P.mods.forEach(m=>{const d=S.done[m];
  if(d){const ch=m==="m1"?charPick():null;g+=slot(MODS[m].n,"クリア","done",ch?`${cv(ch.i+"-"+ch.j,52)}`+`<span class="ministamp">${stampSVG("済",isNew===m)}</span>`:stampSVG("クリア",isNew===m),m);}
  else g+=slot(MODS[m].n,MODS[m].t,m===nx?"now":"",m===nx?"次":"",m);});
 {const all=P.mods.every(m=>S.done[m]);g+=S.done.m1?slot("最終レポート",all?"できた!":"途中でも見られる",all?(S.done.report?"done":"now"):"",S.done.report?stampSVG("完成",isNew==="report"):"★","report"):slot("最終レポート","すべて終えたら","soon","★",null);}
  const h=`<p class="small" style="margin:6px 0 0">あなたのプログラム</p><h1 class="prog-title">${esc(P.title)}</h1>
 <p class="prog-meta">${doneN}/${P.mods.length}クリア${mins?` ・ 残り約${mins}分`:""}</p>
 <div class="stampcard"><div class="stampgrid">${g}</div></div>
 <p class="today">今日は${P.today}つ押せたら十分!</p>
 <div class="btns">${!nx&&S.done.m1?`<a class="b wide" href="#/report">最終レポートを見る</a>`:""}${nx?`<a class="b wide" href="#/${nx}">${esc(MODS[nx].n)}を${nx==="m1"&&S.m1.phase?"つづける":"はじめる"}</a>`:""}
 ${S.done.m1?`<a class="b sec wide" href="#/m1/result">価値観診断の結果を見る</a>`:""}</div>
 ${misBox()}
 ${S.done.m1?`<a class="b sec wide" href="#/zukan" style="margin-top:4px">価値キャラ図鑑</a>`:""}${S.cos.length?`<a class="b sec wide" href="#/file" style="margin-top:14px">候補ファイル(${S.cos.length}社)</a>`:""}
 <h2 style="font-size:18px;margin:28px 0 6px">このプログラムの診断</h2>
 <div class="modlist">${P.mods.map(m=>`<a class="moditem" href="#/${m}"><b>${esc(MODS[m].n)}</b><span class="tag ${S.done[m]?"ok":"go"}">${S.done[m]?"クリア":MODS[m].t}</span><span class="small">${esc(MODS[m].d)}</span></a>`).join("")}</div>
 ${P.later.length?`<details class="acc"><summary>ほかの診断(あとでできる)</summary><div class="in"><div class="modlist">${P.later.map(m=>`<a class="moditem" href="#/${m}"><b>${esc(MODS[m].n)}</b><span class="tag ${S.done[m]?"ok":"soon"}">${S.done[m]?"クリア":MODS[m].t}</span><span class="small">${esc(MODS[m].d)}</span></a>`).join("")}</div></div></details>`:""}
 <button type="button" class="linkb" id="redoTri">入口の質問をやり直す</button>`;
 S.stampNew=null;save();
 return{html:h,title:"あなたのプログラム",bar:`<a class="iconb" href="#/">トップ</a>`,after(){
  $$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
  bindMisBox();$("#redoTri").onclick=()=>go("q/1");}};};
function misBox(){const L=S.missions;if(!L.length)return "";const d=L.filter(x=>x.done).length;
 return `<div class="card mis" id="misBox"><h3>今週のミッション <span class="small">${d}/${L.length} 完了</span></h3><div class="misl">${L.map((x,i)=>`<button type="button" class="misi" data-mi="${i}" aria-pressed="${!!x.done}"><i aria-hidden="true"></i><span>${esc(x.t)}</span></button>`).join("")}</div>${d?`<button type="button" class="linkb" id="misClr">終わったミッションを片づける</button>`:""}</div>`;}
function bindMisBox(){$$("[data-mi]").forEach(b=>b.onclick=()=>{const x=S.missions[+b.dataset.mi];if(!x)return;x.done=!x.done;save();if(x.done)peek("ミッション達成!えらい!","cheer");keepScroll();});
 const c=$("#misClr");if(c)c.onclick=()=>{S.missions=S.missions.filter(x=>!x.done);save();keepScroll();};}

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
 const chip=c=>{const k=CAT[c],q=k?VALS[VI[k]].q:"";return `<button type="button" class="chip ${q?"q-"+q:""}" data-c="${esc(c)}" aria-pressed="${S.cards[c]===3}"><b>${esc(c)}</b><small>${esc(EX[c]||"あなたが足したカード")}</small></button>`;};
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
  const finish=()=>{if(!S.done.m1){S.done.m1=true;S.stampNew="m1";}if(!isObj(S.doneAt))S.doneAt={};S.doneAt.m1=today();S.m1.phase="done";save();};
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
 const rest=effRank().slice(5);
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
 ${missionHTML(m1Missions(t))}
 <div class="gorow">${nextBtn("m1")}<button type="button" class="b sec wide" id="share">キャラを画像で保存・シェア</button>
 <a class="b sec wide" href="#/zukan">価値キャラ図鑑を見る</a>
 <button type="button" class="b sec wide" id="saveM1">結果を保存(テキスト/PDF)</button>
 <button type="button" class="linkb" id="redo">価値観診断をやり直す</button></div>`;
 return{html:h,title:"価値観診断の結果",bar:progBtn,after(){
  bindMissions();$("#share").onclick=()=>shareImage(A,I);
  $("#saveM1").onclick=()=>openSave("m1");
  $("#redo").onclick=()=>{if(!confirm("価値観診断をやり直します。仕分けと順位は消えます(書いた文章は残ります)。よろしいですか?"))return;
   Object.keys(CAT).concat(S.custom).forEach(c=>delete S.cards[c]);S.rank=[];S.m1=Object.assign(fresh().m1,{short:S.tri[1]===0});S.done.m1=false;save();go("m1");};}};}

/* ---------- 共通:つぎへ・ミッション・入力欄 ---------- */
// 診断の結果から、図解ガイドの該当する章へ
const GUIDE_CH={m1:1,m2:4,m3:3,m4:4,m5:5,m6:6,m7:8,m8:9};
const whyLink=m=>GUIDE_CH[m]!=null?`<a class="linkb why2" href="guide.html#/c/${GUIDE_CH[m]}">なぜそう言える?図解ガイドで読む →</a>`:"";
function nextBtn(cur){const P=S.prog;const nx=P?P.mods.find(m=>!S.done[m]&&m!==cur):null;
 if(nx)return `<a class="b wide" href="#/${nx}">つぎは ${esc(MODS[nx].n)}(${esc(MODS[nx].t)})</a><a class="b sec wide" href="#/program">プログラムにもどる</a>`+whyLink(cur);
 return `<a class="b wide" href="#/program">プログラムにもどる</a>`+whyLink(cur);}
function finishMod(m){if(!S.done[m]){S.done[m]=true;S.stampNew=m;}if(!isObj(S.doneAt))S.doneAt={};S.doneAt[m]=today();save();}
function missionHTML(list){if(!list.length)return "";const all=list.every(x=>S.missions.some(y=>y.t===x.t));
 return `<div class="card mis"><h3>今週のミッション(${list.length}つ)</h3><ul class="mislist">${list.map(x=>`<li>${esc(x.t)}</li>`).join("")}</ul>${all?`<p class="small">受け取り済み。プログラム画面でチェックできます。</p>`:`<button type="button" class="b small" id="takeMis" data-mis="${esc(JSON.stringify(list))}">ミッションを受け取る</button>`}</div>`;}
function addMissions(list){let n=0;list.forEach(x=>{if(x.t&&!S.missions.some(y=>y.t===x.t)){S.missions.push({t:x.t,from:x.from,done:false});n++;}});save();return n;}
function bindMissions(){const b=$("#takeMis");if(!b)return;b.onclick=()=>{let list=[];try{list=JSON.parse(b.dataset.mis);}catch(e){}addMissions(list);
 const p=document.createElement("p");p.className="small";p.textContent="受け取りました。プログラム画面でチェックできます。";b.replaceWith(p);peek("ミッション、いってらっしゃい!","cheer");};}
function m1Missions(t){return t.length?[{t:`1位「${t[0]}」が満たされた瞬間を、今週1回メモする`,from:"m1"},{t:"友だちや家族に「私が大事にしていそうなこと3つは?」と聞いてみる",from:"m1"}]:[];}
// 入力欄:書くたびに保存。テキストエリアは内容に合わせて高さを伸ばす
const grow=t=>{t.style.height="auto";t.style.height=Math.max(t.scrollHeight+4,t.dataset.ev!=null?64:90)+"px";};
function bindText(root){
 $$("[data-f]",root).forEach(el=>{el.value=S.f[el.dataset.f]||"";el.addEventListener("input",()=>{S.f[el.dataset.f]=el.value;save();if(el.tagName==="TEXTAREA")grow(el);});if(el.tagName==="TEXTAREA")grow(el);});
 const obj=(store,k,field)=>{store[k]=Object.assign({},store[k]||{},field);};
 $$("[data-ev]",root).forEach(el=>{const c=el.dataset.ev;el.value=(S.ev[c]&&S.ev[c].t)||"";el.addEventListener("input",()=>{obj(S.ev,c,{t:el.value});save();grow(el);el.dispatchEvent(new CustomEvent("changed",{bubbles:true}));});grow(el);});
 $$("[data-dm]",root).forEach(el=>{const c=el.dataset.dm;el.value=(S.def[c]&&S.def[c].m)||"";el.addEventListener("input",()=>{obj(S.def,c,{m:el.value});save();});});
 $$("[data-ds]",root).forEach(el=>{const c=el.dataset.ds;el.value=(S.def[c]&&S.def[c].s)||"";el.addEventListener("input",()=>{obj(S.def,c,{s:el.value});save();});});}
const keepScroll=()=>{const y=window.scrollY;render();window.scrollTo(0,y);};
function needM1(title){return{html:`${guideHTML("この診断は、価値観診断で決めたトップ5を使うよ。先に価値観診断をやってみよう","think")}<div class="btns"><a class="b wide" href="#/m1">価値観診断へ</a><a class="b sec wide" href="#/program">プログラムにもどる</a></div>`,title,bar:progBtn};}
const myChar=(e,w,cls)=>{const ch=S.done.m1?charPick():null;return ch?`<span class="cv ${cls||""}" data-c="${ch.i}-${ch.j}" data-e="${e||"normal"}" data-w="${w}"></span>`:mascot(e==="worry"||e==="curious"?"think":e==="sparkle"?"wow":"cheer",w,cls);};
const modHead=(name,step,total)=>`<div class="qhead">${esc(name)}${total?` ${step}/${total}<span class="dots">${[...Array(total)].map((_,k)=>`<i class="${k<step?"on":""}"></i>`).join("")}</span>`:""}</div>`;
async function copyText(txt,msgEl){let ok=false;try{await navigator.clipboard.writeText(txt);ok=true;}catch(e){const ta=document.createElement("textarea");ta.value=txt;document.body.appendChild(ta);ta.select();try{ok=document.execCommand("copy");}catch(e2){}ta.remove();}
 if(msgEl)msgEl.textContent=ok?"コピーしました。LINEやメールに貼り付けて送れます。":"自動でコピーできませんでした。文章を長押しして選択してください。";return ok;}

/* ---------- M2 エピソード検証 ---------- */
const epText=k=>String(S.f[k]||"").trim();
const snip=(s,n)=>s.length>n?s.slice(0,n)+"…":s;
function evVerdict(c){const e=S.ev[c]||{},src=(e.src||[]).filter(k=>epText(k)),txt=String(e.t||"").trim();
 if(e.hold)return{k:"hold",l:"保留"};if(!src.length&&!txt)return{k:"none",l:"未確認"};
 if(src.length&&!txt&&src.every(k=>k==="ep_anger"||k==="ep_envy"))return{k:"want",l:"採用・まだ満たされていない"};
 return{k:"ok",l:"採用"};}
const m2List=()=>effRank().filter(c=>!held(c)).slice(0,5);
SCREENS.m2=(a)=>{if(!S.done.m1||!top5().length)return needM1("エピソード検証");
 const sub=a[0];if(!sub){go(S.done.m2?"m2/result":(S.m2step||"m2/ep/1"),true);return false;}
 S.m2step="m2/"+a.join("/");save();
 if(sub==="ep")return m2Ep(Math.min(4,Math.max(1,+a[1]||1)));
 if(sub==="check")return m2Check();if(sub==="words")return m2Words();if(sub==="result")return m2Result();
 go("m2",true);return false;};
function m2Ep(n){const E=EPIS[n-1];
 const h=`${modHead("エピソード検証 ・ 出来事",n,4)}
 ${n===1?guideHTML("大事な価値は、気持ちが強く動いた出来事に表れるよ。4つの出来事を短く書いてみよう。「なぜ?」より「何をしていた?」を書くのがコツ","normal"):""}
 <p class="eptag">${esc(E.n)}<span>${esc(E.clue)}</span></p>
 <h1 class="q">${esc(E.q)}</h1><p class="qhint">${esc(E.sub)}</p>
 <textarea class="field" data-f="${E.k}" rows="4" placeholder="思いつくまま短くでOK" aria-label="${esc(E.q)}"></textarea>
 <details class="acc"><summary>記入例を見る</summary><div class="in"><p class="hand" style="margin:0">${esc(E.ex)}</p></div></details>
 <p class="small">大きな出来事でなくて大丈夫。この1週間で少しうれしかったこと、モヤッとしたことでもOK。</p>
 <div class="btns"><button type="button" class="b wide" id="epNext"></button>${n>1?`<button type="button" class="linkb" id="epBack">← ひとつ前へ</button>`:""}</div>`;
 return{html:h,title:"エピソード検証",bar:progBtn,after(m){bindText(m);const ta=$("textarea",m),nb=$("#epNext");
  const lab=()=>{nb.textContent=ta.value.trim()?(n<4?"次の出来事へ":"トップ5と照らし合わせる"):"今は思いつかない(とばす)";};lab();ta.addEventListener("input",lab);
  nb.onclick=()=>go(n<4?"m2/ep/"+(n+1):"m2/check");const bk=$("#epBack");if(bk)bk.onclick=()=>go("m2/ep/"+(n-1));}};}
function m2Check(){const list=m2List(),hl=effRank().filter(held),eps=EPIS.filter(e=>epText(e.k));
 const card=(c,i)=>{const e=S.ev[c]||{},src=e.src||[],v=evVerdict(c);
  return `<div class="evcard" data-c="${esc(c)}"><div class="evh"><span class="no">${i+1}</span><b>${esc(c)}</b><span class="vtag ${v.k}">${esc(v.l)}</span></div>
  <p class="small" style="margin:0 0 6px">${esc(EX[c]||"あなたが足したカード")}</p>
  ${eps.length?`<p class="lbl">裏づける出来事をタップ</p><div class="srcs">${eps.map(E=>`<button type="button" class="src" data-src="${E.k}" aria-pressed="${src.includes(E.k)}"><b>${esc(E.n)}</b>${esc(snip(epText(E.k),26))}</button>`).join("")}</div>`:""}
  <textarea class="field" data-ev="${esc(c)}" rows="2" placeholder="${eps.length?"ほかの体験があれば、ここに具体的に":"この価値を裏づける体験を具体的に(例:塾で生徒に合わせた教材を自作した)"}" aria-label="${esc(c)}を裏づける体験"></textarea>
  ${i===0?`<p class="small">1位は体験を1つ結びつけてね(ここだけ必須)。どうしても見つからないときは、価値観診断の順位を見直してみよう。</p>`:`<button type="button" class="linkb" data-hold="1">思い当たる体験がない → 保留にする</button>`}</div>`;};
 const h=`${modHead("エピソード検証 ・ 照らし合わせ",0,0)}
 <h1 class="q">トップ5を、あなたの体験で確かめよう</h1>
 ${guideHTML("体験で裏づけられない価値は、借りてきた言葉かもしれないよ。そういう価値は「保留」にして、6位の価値と入れ替えよう","think")}
 ${list.map(card).join("")}
 ${hl.length?`<div class="card"><h3>保留中の価値</h3><p class="small">捨てずにメモしておき、インターンやアルバイトで確かめよう。</p>${hl.map(c=>`<div class="heldrow"><b>${esc(c)}</b><button type="button" class="b sec small" data-unhold="${esc(c)}">保留を解除</button></div>`).join("")}</div>`:""}
 <div class="btns"><button type="button" class="b wide" id="toWords">自分の言葉にする</button><button type="button" class="linkb" id="ckBack">← 出来事を書き直す</button></div>`;
 return{html:h,title:"エピソード検証",bar:progBtn,after(m){bindText(m);
  const upd=box=>{const c=box.dataset.c,v=evVerdict(c),tg=$(".vtag",box);tg.className="vtag "+v.k;tg.textContent=v.l;};
  $$(".evcard",m).forEach(box=>{const c=box.dataset.c;
   $$(".src",box).forEach(b=>b.onclick=()=>{const e=S.ev[c]=Object.assign({},S.ev[c]||{});const src=(e.src||[]).slice(),k=b.dataset.src,on=src.includes(k);
    e.src=on?src.filter(x=>x!==k):src.concat(k);b.setAttribute("aria-pressed",String(!on));save();upd(box);});
   box.addEventListener("changed",()=>upd(box));
   const hb=$("[data-hold]",box);if(hb)hb.onclick=()=>{S.ev[c]=Object.assign({},S.ev[c]||{},{hold:true});save();toast(`「${c}」を保留にしました`);keepScroll();};});
  $$("[data-unhold]",m).forEach(b=>b.onclick=()=>{const c=b.dataset.unhold;S.ev[c]=Object.assign({},S.ev[c]||{},{hold:false});save();keepScroll();});
  $("#toWords").onclick=()=>{const c=list[0];if(evVerdict(c).k==="none"){toast(`1位の「${c}」に、体験を1つ結びつけてね`);$(".evcard textarea",m).focus();return;}go("m2/words");};
  $("#ckBack").onclick=()=>go("m2/ep/1");}};}
function affDraft(){const c=m2List()[0];if(!c)return "";const e=S.ev[c]||{};const ep=String(e.t||"").trim()||((e.src||[]).map(epText).find(Boolean))||"〇〇";
 const d=(S.def[c]&&S.def[c].m)||EX[c]||"〇〇";
 return `私は「${c}」を大切にしている。それは私にとって、${d.replace(/[。.]$/,"")}だ。「${snip(ep.replace(/\s+/g," "),60)}」という経験で、そのことを強く感じた。この価値は、進路や毎日の選択で迷ったとき、私の判断を支えている。結果がどうであれ、この価値に沿って行動した自分を誇りに思う。`;}
function m2Words(){const list=m2List();
 const h=`${modHead("エピソード検証 ・ 自分の言葉",0,0)}
 <h1 class="q">あなたにとっての意味を、1文で</h1>
 ${guideHTML("同じ「成長」でも、人によって意味が違うよ。自分の言葉にしておくと、会社の「成長できます」に流されにくくなる","normal")}
 ${list.map((c,i)=>`<div class="evcard"><div class="evh"><span class="no">${i+1}</span><b>${esc(c)}</b></div>
  <label class="lbl" for="dm${i}">私にとっての意味</label><input class="field" id="dm${i}" type="text" data-dm="${esc(c)}" maxlength="80" placeholder="${i===0?esc(DEF_EX.m):"1文で"}">
  <label class="lbl" for="ds${i}">満たされているときの具体的な状態</label><input class="field" id="ds${i}" type="text" data-ds="${esc(c)}" maxlength="80" placeholder="${i===0?esc(DEF_EX.s):"どんな状態なら満たされている?"}"></div>`).join("")}
 <p class="small">書けるところだけでOK。「満たされているときの具体的な状態」は、あとで職場の条件づくりに使います。</p>
 <h2 class="h2s">お守りの文章(アファメーション)</h2>
 <p class="small">1位の価値について、面接の前や落ち込んだときに読み返す文章です。大切な価値を書き出すと、プレッシャーの中で気持ちを支える効果が研究で確かめられています。</p>
 <textarea class="field" data-f="affirm" rows="5" aria-label="アファメーション文"></textarea>
 <button type="button" class="b sec small" id="draft">下書きを作る</button>
 <div class="btns"><button type="button" class="b wide" id="toRes">結果を見る</button><button type="button" class="linkb" id="wBack">← 照らし合わせにもどる</button></div>`;
 return{html:h,title:"エピソード検証",bar:progBtn,after(m){bindText(m);
  $("#draft").onclick=()=>{const ta=$('[data-f="affirm"]',m);if(ta.value.trim()&&!confirm("今の文章を下書きで置き換えます。よろしいですか?"))return;ta.value=affDraft();S.f.affirm=ta.value;save();grow(ta);};
  $("#toRes").onclick=()=>{finishMod("m2");go("m2/result");};$("#wBack").onclick=()=>go("m2/check");}};}
function m2Mis(list,hl){const vs=list.map(c=>({c,v:evVerdict(c)})),mis=[];
 hl.slice(0,1).forEach(c=>mis.push({t:`保留にした「${c}」を、インターンやバイトで確かめる`,from:"m2"}));
 vs.filter(x=>x.v.k==="want").slice(0,1).forEach(x=>mis.push({t:`まだ満たされていない「${x.c}」を、少しだけ満たす行動を1つやってみる`,from:"m2"}));
 mis.push({t:"お守りの文章を、面接や大事な場面の前に1回読み返す",from:"m2"});return mis;}
function m2Result(){const list=m2List(),hl=effRank().filter(held);finishMod("m2");
 const vs=list.map(c=>({c,v:evVerdict(c)})),ok=vs.filter(x=>x.v.k==="ok"||x.v.k==="want").length;
 const h=`<div class="reshead"><p class="kick">エピソード検証の結果</p>${myChar(ok>=4?"happy":"gentle",170,"alive")}
 <h1 style="font-size:28px">体験で確かめた価値 ${ok}/${list.length}</h1></div>
 <ol class="ranks">${vs.map(({c,v},i)=>{const d=S.def[c]||{};return `<li><span class="no">${i+1}</span><span><b>${esc(c)}</b><br><span class="small">${esc(d.m||EX[c]||"")}</span></span><span class="vtag ${v.k}">${esc(v.l)}</span></li>`;}).join("")}</ol>
 ${hl.length?`<p class="small">保留:${hl.map(esc).join("、")}(インターンやアルバイトで確かめよう)</p>`:""}
 ${vs.some(x=>x.v.k==="want")?`<p class="small">「まだ満たされていない」は、怒りや羨望の体験だけで裏づけられた価値です。今の環境で満たされていない可能性が高く、職場選びで特に重視したい候補です。</p>`:""}
 ${String(S.f.affirm||"").trim()?`<div class="memo"><h3>お守りの文章</h3><p style="margin:0">${esc(S.f.affirm).replace(/\n/g,"<br>")}</p></div>`:""}
 ${missionHTML(m2Mis(list,hl))}
 <div class="gorow">${nextBtn("m2")}<button type="button" class="b sec wide" id="save2">結果を保存(テキスト/PDF)</button><a class="linkb" href="#/m2/ep/1">書いた内容を直す</a></div>`;
 return{html:h,title:"エピソード検証の結果",bar:progBtn,after(){bindMissions();$("#save2").onclick=()=>openSave("m2");}};}

/* ---------- M3 自己認識チェック ---------- */
function selfScore(){const a=S.m3;if(!Array.isArray(a)||SELF_Q.some((q,i)=>!a[i]))return null;
 const avg=t=>{const v=SELF_Q.map((q,i)=>q.t===t?+a[i]:null).filter(x=>x!=null);return v.reduce((s,x)=>s+x,0)/v.length;};
 const inn=avg("in"),ex=avg("ex"),hi=x=>x>=3.5;
 return{inn,ex,type:hi(inn)?(hi(ex)?"aware":"intro"):(hi(ex)?"please":"seek")};}
SCREENS.m3=(a)=>{const sub=a[0];
 if(sub==="result"){if(!selfScore()){go("m3",true);return false;}return m3Result();}
 if(sub==="q")return m3Q(Math.min(8,Math.max(1,+a[1]||1)));
 const first=SELF_Q.findIndex((q,i)=>!S.m3[i]);go(first<0?"m3/result":"m3/q/"+(first+1),true);return false;};
function m3Q(n){const Q=SELF_Q[n-1],cur=S.m3[n-1];
 const h=`${modHead("自己認識チェック",n,8)}
 ${n===1?guideHTML("自分のことを、どれくらい分かっているかのチェックだよ。直感で答えてね","normal"):""}
 <h1 class="q">${esc(Q.q)}</h1><p class="qhint">いちばん近いものを1つ</p>
 <div class="opts" role="group">${LIKERT.map((o,i)=>`<button type="button" class="opt" data-v="${5-i}" aria-pressed="${cur===5-i}">${esc(o)}${CIRC}</button>`).join("")}</div>
 ${n>1?`<button type="button" class="linkb" id="qBack" style="margin-top:16px">← ひとつ前へ</button>`:""}`;
 return{html:h,title:"自己認識チェック",bar:progBtn,after(){let busy=false;
  $$(".opt").forEach(b=>b.onclick=()=>{if(busy)return;busy=true;$$(".opt").forEach(x=>{x.classList.remove("on");x.setAttribute("aria-pressed","false");});void b.offsetWidth;b.classList.add("on");b.setAttribute("aria-pressed","true");spark(b);
   S.m3[n-1]=+b.dataset.v;save();later(()=>{if(n<8)go("m3/q/"+(n+1));else{finishMod("m3");go("m3/result");}},420);});
  const bk=$("#qBack");if(bk)bk.onclick=()=>go("m3/q/"+(n-1));}};}
function askMessage(){return "就活の自己分析で、身近な人に聞いてみるワークをしています。思ったままで大丈夫なので、答えてもらえるとうれしいです。\n\n"+ASK5.map((q,i)=>`${i+1}. ${q}`).join("\n");}
function m3Result(){const R=selfScore(),T=SELF_T[R.type];finishMod("m3");
 const cell=(k,label,sub)=>`<div class="tcell ${R.type===k?"on":""}">${R.type===k?myChar(T.e,54,"alive"):""}<b>${label}</b><span>${sub}</span></div>`;
 const h=`<div class="reshead"><p class="kick">自己認識チェックの結果</p>${myChar(T.e,170,"alive")}<h1 style="font-size:32px">${esc(T.n)}</h1><p class="lead2">${esc(T.d)}</p></div>
 <p class="small tlegend">たて:自分の内面の理解(上ほど高い) / よこ:周りからの見え方の理解(右ほど高い)</p><div class="tgrid" role="img" aria-label="4つのタイプのうち、あなたは${esc(T.n)}">
 ${cell("intro","内省家","自分は分かる")}${cell("aware","自己認識者","両方分かる")}${cell("seek","探索者","探している途中")}${cell("please","迎合者","周りに合わせがち")}</div>
 <div class="sbars"><div><span>自分の内面の理解</span><i><u style="width:${(R.inn-1)/4*100}%"></u></i><em>${R.inn.toFixed(1)}</em></div><div><span>周りからの見え方の理解</span><i><u style="width:${(R.ex-1)/4*100}%"></u></i><em>${R.ex.toFixed(1)}</em></div></div>
 <div class="memo"><h3>ほくとからのアドバイス</h3><p style="margin:0">${esc(T.tip)}</p></div>
 <details class="acc" open><summary>「なぜ?」を「何を?」に言い換える</summary><div class="in"><p class="small">「なぜ?」を繰り返すと、堂々めぐりや、もっともらしい作り話になりやすいことが分かっています。具体的な出来事を聞く問いに変えよう。</p>
  <div class="ww">${WHY_WHAT.map(([a,b])=>`<div><s>${esc(a)}</s><b>→ ${esc(b)}</b></div>`).join("")}</div></div></details>
 <details class="acc"><summary>身近な人に聞く5つの質問</summary><div class="in"><p class="small">自分をよく知る2〜3人(友だち、家族、ゼミの先生、バイト先の人など)に送ってみよう。答えには反論せず「ありがとう、もう少し教えて」とだけ返すのがコツ。</p>
  <pre class="askmsg">${esc(askMessage())}</pre><div class="row" style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="b small" id="cpAsk">文章をコピー</button>${navigator.share?`<button type="button" class="b sec small" id="shAsk">送る</button>`:""}</div><p class="small" id="askMsg" role="status"></p>
  <label class="lbl" for="fb">もらった答えのメモ</label><textarea class="field" id="fb" data-f="feedback" rows="3" placeholder="例:ゼミの友だち「納得いかないと引かない」"></textarea></div></details>
 <p class="small">この診断は、自己認識の研究(Eurich)の考え方をもとにした簡易チェックで、研究用の尺度ではありません。目安として使ってください。</p>
 ${missionHTML([{t:"2〜3人に「5つの質問」を送って、答えをメモする",from:"m3"},{t:"迷ったら「なぜ?」を「何を?」に言い換えて考える",from:"m3"}])}
 <div class="gorow">${nextBtn("m3")}<button type="button" class="b sec wide" id="save3">結果を保存(テキスト/PDF)</button><a class="linkb" href="#/m3/q/1">答え直す</a></div>`;
 return{html:h,title:"自己認識チェックの結果",bar:progBtn,after(m){bindText(m);bindMissions();$("#save3").onclick=()=>openSave("m3");
  $("#cpAsk").onclick=()=>copyText(askMessage(),$("#askMsg"));const sh=$("#shAsk");if(sh)sh.onclick=async()=>{try{await navigator.share({text:askMessage()});}catch(e){}};}};}

/* ---------- M4 ギャップ診断 ---------- */
const gapOf=(c,i)=>{const g=S.gap[c];return Array.isArray(g)?[+g[0],+g[1],g[2]||""]:[Math.max(5,10-(i||0)),5,""];};
SCREENS.m4=(a)=>{if(!S.done.m1||!top5().length)return needM1("ギャップ診断");if(a[0]==="result"){if(!S.done.m4){go("m4",true);return false;}return m4Result();}return m4Slide();};
function m4Slide(){const t=top5();
 const h=`${modHead("ギャップ診断",0,0)}<h1 class="q">大切さと、今の満たされ方</h1>
 ${guideHTML("トップ5それぞれ、どれくらい大切か、今の生活でどれくらい満たされているかを0〜10で動かしてみて","normal")}
 ${t.map((c,i)=>{const g=gapOf(c,i);return `<div class="evcard sl" data-c="${esc(c)}" data-i="${i}"><div class="evh"><span class="no">${i+1}</span><b>${esc(c)}</b><span class="gapv">差 <b>${g[0]-g[1]}</b></span></div>
  <label class="rng"><span>大切さ</span><input type="range" min="0" max="10" step="1" value="${g[0]}" data-k="0" aria-label="${esc(c)}の大切さ"><em>${g[0]}</em></label>
  <label class="rng"><span>今の満たされ方</span><input type="range" min="0" max="10" step="1" value="${g[1]}" data-k="1" aria-label="${esc(c)}の今の満たされ方"><em>${g[1]}</em></label></div>`;}).join("")}
 <div class="btns"><button type="button" class="b wide" id="toRes">結果を見る</button></div>`;
 return{html:h,title:"ギャップ診断",bar:progBtn,after(m){
  $$(".sl",m).forEach(box=>{const c=box.dataset.c,i=+box.dataset.i;$$("input",box).forEach(r=>r.addEventListener("input",()=>{const g=gapOf(c,i);g[+r.dataset.k]=+r.value;S.gap[c]=g;r.nextElementSibling.textContent=r.value;$(".gapv b",box).textContent=g[0]-g[1];save();}));});
  $("#toRes").onclick=()=>{t.forEach((c,i)=>{if(!Array.isArray(S.gap[c]))S.gap[c]=gapOf(c,i);});finishMod("m4");go("m4/result");};}};}
function m4Rows(){const t=top5();return t.map((c,i)=>({c,i,g:gapOf(c,i)})).sort((a,b)=>(b.g[0]-b.g[1])-(a.g[0]-a.g[1]));}
function m4Result(){const t=top5(),rows=m4Rows();
 const col=d=>d>=4?"var(--tomato)":d>=2?"#D08F0A":"var(--mint)";
 const big=rows.filter(r=>r.g[0]-r.g[1]>=2).slice(0,2),focus=big.length?big:rows.slice(0,1);
 const h=`<div class="reshead"><p class="kick">ギャップ診断の結果</p>${myChar(rows[0].g[0]-rows[0].g[1]>=4?"fired":"calm",150,"alive")}<h1 style="font-size:26px">いちばん差が大きいのは<br>「${esc(rows[0].c)}」</h1></div>
 <div class="gapbars">${rows.map(r=>{const d=r.g[0]-r.g[1];return `<div class="gb"><b>${esc(r.c)}</b><span class="tr"><u class="imp" style="width:${r.g[0]*10}%"></u><u class="real" style="width:${r.g[1]*10}%"></u></span><em style="color:${col(d)}">差 ${d}</em></div>`;}).join("")}</div>
 <p class="small"><span class="key imp"></span>大切さ <span class="key real"></span>今の満たされ方(どちらも0〜10)。差が大きい価値は、今の環境で満たされにくい価値。職場選びで特に重視しよう。</p>
 <h2 class="h2s">今週できる小さな行動</h2>
 <p class="small">差の大きい価値を、少しだけ満たす行動を決めよう。やってみると「思ったより満たされない」「想像以上に満たされた」といった発見があり、マップの精度が上がります。</p>
 ${focus.map(r=>{const k=CAT[r.c];return `<div class="evcard"><div class="evh"><b>${esc(r.c)}</b></div><input class="field" type="text" data-act="${esc(r.c)}" maxlength="80" placeholder="${esc(k?"例:"+ACT_EX[k]:"例:今週やってみること")}" aria-label="${esc(r.c)}のための行動">${k?`<button type="button" class="linkb" data-useex="${esc(r.c)}">例をそのまま使う</button>`:""}</div>`;}).join("")}
 <button type="button" class="b sec wide" id="takeAct">行動をミッションにする</button>
 <div class="gorow">${nextBtn("m4")}<button type="button" class="b sec wide" id="save4">結果を保存(テキスト/PDF)</button><a class="linkb" href="#/m4">スライダーを動かし直す</a></div>`;
 return{html:h,title:"ギャップ診断の結果",bar:progBtn,after(m){
  $$("[data-act]",m).forEach(el=>{const c=el.dataset.act;el.value=gapOf(c)[2]||"";el.addEventListener("input",()=>{const g=gapOf(c,t.indexOf(c));g[2]=el.value;S.gap[c]=g;save();});});
  $$("[data-useex]",m).forEach(b=>b.onclick=()=>{const c=b.dataset.useex,el=$$("[data-act]",m).find(x=>x.dataset.act===c);el.value=ACT_EX[CAT[c]];el.dispatchEvent(new Event("input"));});
  $("#takeAct").onclick=()=>{const list=focus.map(r=>{const v=String(gapOf(r.c)[2]||"").trim();return v?{t:`「${r.c}」のために:${v}`,from:"m4"}:null;}).filter(Boolean);
   if(!list.length){toast("行動を1つ書いてね");return;}const n=addMissions(list);toast(n?`ミッションを${n}つ追加しました`:"もう受け取っています");if(n)peek("ミッション、いってらっしゃい!","cheer");};
  $("#save4").onclick=()=>openSave("m4");}};}

/* ---------- 価値キャラ図鑑 ---------- */
SCREENS.zukan=(a)=>{const t=top5(),ch=S.done.m1?charPick():null;
 const rk={};t.forEach((c,i)=>{const k=CAT[c];if(k&&rk[k]==null)rk[k]=i+1;});
 const sel=a[0]!=null&&/^\d$/.test(a[0])?+a[0]:(ch?ch.i:0);
 const v=CH.V[sel],V2=VALS[sel];
 const h=`<h1 class="q" style="margin-top:6px">価値キャラ図鑑</h1>
 <p class="small">10の価値には、それぞれキャラがいるよ。${ch?"あなたのトップ5に入っている価値だけ、色がついています。":"価値観診断を終えると、あなたのトップ5の価値に色がつきます。"}タップすると説明が見られます。</p>
 ${ch?`<div class="card tilt mychar">${cv(ch.i+"-"+ch.j,90,"alive")}<div><span class="small">あなたのキャラ</span><br><b>${esc(charInfo(ch).name)}</b><br><span class="small">${esc(charInfo(ch).pair)}</span></div></div>`:""}
 <div class="zgrid">${CH.V.map((w,i)=>`<button type="button" class="zc ${!ch||rk[w.k]?"":"gray"} ${i===sel?"sel":""}" data-z="${i}" aria-pressed="${i===sel}">${rk[w.k]?`<span class="rk">${rk[w.k]}位</span>`:""}${cv(i+"-"+i+"x",62)}<b>${esc(w.a)}</b><span>${esc(w.k)}</span></button>`).join("")}</div>
 <div class="card" id="zinfo"><div class="zhead">${cv(sel+"-"+sel+"x",86,"alive")}<div><b>${esc(v.k)}の${esc(v.a)}</b><br><span class="qchip ${V2.q}">${esc(V2.q==="hed"?"開放性と自己高揚の境目":QN[V2.q])}</span>${rk[v.k]?` <span class="tag go">あなたの${rk[v.k]}位</span>`:""}</div></div>
  <p class="hand" style="margin:10px 0 4px">${esc(v.g)}</p><p style="margin:4px 0"><b>どんな価値?</b> ${esc(V2.d)}</p><p style="margin:4px 0"><b>仕事では:</b>${esc(V2.w)}</p>
  <p class="small" style="margin:6px 0 0">なかまのカード:${CARDS[V2.n].map(c=>esc(c[0])).join("、")}</p>
  <p class="small" style="margin:6px 0 0">トップ1なら「${esc(v.role)}」、トップ2なら持ち物が「${esc(v.it)}」になるよ。</p></div>
 <div class="btns">${S.done.m1?`<a class="b sec wide" href="#/m1/result">価値観診断の結果にもどる</a>`:`<a class="b wide" href="#/m1">価値観診断をする</a>`}</div>`;
 return{html:h,title:"価値キャラ図鑑",bar:S.prog?progBtn:`<a class="iconb" href="#/">トップ</a>`,after(){$$("[data-z]").forEach(b=>b.onclick=()=>{go("zukan/"+b.dataset.z,true);const z=$("#zinfo");if(z&&z.scrollIntoView)z.scrollIntoView({behavior:reduce?"auto":"smooth",block:"nearest"});});}};};

/* ---------- M5 地雷センサー ---------- */
const m5Next=()=>{const i=MINES.findIndex((x,k)=>S.m5.mines[k]==null);return i>=0?"m5/card/"+(i+1):S.m5.ot==null?"m5/ruler":"m5/result";};
SCREENS.m5=(a)=>{const sub=a[0];
 if(sub==="card")return m5Card(Math.min(7,Math.max(1,+a[1]||1)));
 if(sub==="ruler")return m5Ruler();
 if(sub==="result"){if(!S.done.m5){go(m5Next(),true);return false;}return m5Result();}
 go(S.done.m5?"m5/result":m5Next(),true);return false;};
function m5Card(n){const M=MINES[n-1],cur=S.m5.mines[n-1];
 const h=`${modHead("地雷センサー",n,7)}
 ${n===1?guideHTML("合う職場を探す前に、誰にとっても健康を損なう条件を知っておこう。カードをタップすると、根拠と見分け方が見られるよ","normal"):""}
 <button type="button" class="flip" id="flip" aria-pressed="false" aria-label="${esc(M.n)}のカード。タップで裏返す"><span class="inner">
  <span class="face front"><span class="mtag">地雷 ${n}</span><b>${esc(M.n)}</b><span class="md">${esc(M.d)}</span><span class="turn">タップで裏返す ↻</span></span>
  <span class="face back"><span class="mtag">根拠</span><b class="risk">${esc(M.risk)}</b><span class="small">${esc(M.src)}</span><span class="lk">見分け方</span><span class="lks">${M.look.map(x=>`<span>・${esc(x)}</span>`).join("")}</span></span></span></button>
 <h2 class="q" style="font-size:20px">あなたにとって、この条件は?</h2>
 <div class="opts" role="group">${MINE_OPT.map((o,i)=>`<button type="button" class="opt" data-v="${2-i}" aria-pressed="${cur===2-i}">${esc(o)}${CIRC}</button>`).join("")}</div>
 ${n>1?`<button type="button" class="linkb" id="qBack" style="margin-top:16px">← ひとつ前へ</button>`:""}`;
 return{html:h,title:"地雷センサー",bar:progBtn,after(){const f=$("#flip");f.onclick=()=>{const on=f.getAttribute("aria-pressed")!=="true";f.setAttribute("aria-pressed",String(on));};
  let busy=false;$$(".opt").forEach(b=>b.onclick=()=>{if(busy)return;busy=true;$$(".opt").forEach(x=>{x.classList.remove("on");x.setAttribute("aria-pressed","false");});void b.offsetWidth;b.classList.add("on");b.setAttribute("aria-pressed","true");spark(b);
   const v=+b.dataset.v;S.m5.mines[n-1]=v;save();if(v===0)peek("これは誰の健康にも関わる条件だよ。気にならなくても、確かめてはおこう","think");
   later(()=>go(n<7?"m5/card/"+(n+1):"m5/ruler"),v===0?1300:420);});
  const bk=$("#qBack");if(bk)bk.onclick=()=>go("m5/card/"+(n-1));}};}
const otRuler=sel=>`<div class="ruler" aria-hidden="true"><div class="zones"><i style="flex:20" class="z1"></i><i style="flex:25" class="z2"></i><i style="flex:35" class="z3"></i><i style="flex:20" class="z4"></i></div>
 <div class="ticks"><span style="left:0">0</span><span style="left:20%">20</span><span style="left:45%">45</span><span style="left:80%">80</span><span style="left:100%">100h</span></div>
 <div class="zl"><span style="flex:20">健全</span><span style="flex:25">原則の上限</span><span style="flex:35">要警戒</span><span style="flex:20">過労死ライン</span></div>${sel?`<b class="pin" style="left:${sel}%">▼ あなた</b>`:""}</div>`;
function m5Ruler(){const cur=S.m5.ot;
 const h=`${modHead("地雷センサー ・ 残業のものさし",0,0)}<h1 class="q">残業は、月何時間までならOK?</h1>
 ${guideHTML("日本の法律では、残業は原則月45時間まで。月80時間を超えると「過労死ライン」と呼ばれる水準だよ","think")}
 ${otRuler(cur)}
 <div class="opts" role="group" style="margin-top:18px">${OT.map(o=>`<button type="button" class="opt" data-h="${o.h}" aria-pressed="${cur===o.h}"><b style="font-family:var(--round)">${esc(o.n)}</b><br><span class="small">${esc(o.d)}</span>${CIRC}</button>`).join("")}</div>
 <p class="small">月80時間を超える働き方は、健康への影響がはっきりしているため選択肢に入れていません。</p>
 <button type="button" class="linkb" id="qBack">← ひとつ前へ</button>`;
 return{html:h,title:"地雷センサー",bar:progBtn,after(){let busy=false;$$(".opt").forEach(b=>b.onclick=()=>{if(busy)return;busy=true;$$(".opt").forEach(x=>{x.classList.remove("on");x.setAttribute("aria-pressed","false");});void b.offsetWidth;b.classList.add("on");b.setAttribute("aria-pressed","true");spark(b);
  S.m5.ot=+b.dataset.h;finishMod("m5");later(()=>go("m5/result"),420);});$("#qBack").onclick=()=>go("m5/card/7");}};}
function m5NG(){const L=[];MINES.forEach((M,i)=>{if(S.m5.mines[i]===2)L.push(M.n);});if(S.m5.ot!=null)L.push(`残業が月${S.m5.ot}時間を超える`);return L;}
const riskBars=()=>`<div class="rbars">${[["長時間労働 → 脳卒中",1.33],["高ストレイン → うつ病",1.27],["努力が報われない → うつ病",1.49],["高ストレイン → 心臓の病気",1.23],["長時間労働 → 心臓の病気",1.13]].map(([l,x])=>`<div><span>${l}</span><i><u style="width:${((x-1)/.6*100).toFixed(0)}%"></u></i><em>${x}倍</em></div>`).join("")}</div><p class="small">バーは、その条件がない人と比べたリスクの高さ。1つ1つは「3割増し」ほどでも、何十年も働く中で積み重なります。</p>`;
function m5Result(){const ng=m5NG(),chk=MINES.filter((M,i)=>S.m5.mines[i]===1).map(M=>M.n),ok=MINES.filter((M,i)=>S.m5.mines[i]===0).map(M=>M.n);
 const h=`<div class="reshead"><p class="kick">地雷センサーの結果</p>${myChar("fired",150,"alive")}<h1 style="font-size:28px">あなたのNG条件リスト</h1><p class="small" style="margin:4px 0 0">1つでも当てはまったら、候補から外す条件です</p></div>
 <div class="nglist">${ng.map(x=>`<span>× ${esc(x)}</span>`).join("")||`<p class="small">「絶対に避けたい」がありません。残業のものさしだけでも、NG条件に入れておこう。</p>`}</div>
 ${chk.length?`<div class="card"><h3>確かめたいリスト</h3><p class="small">「程度による」と答えた条件。面接やOB・OG訪問で、見分け方の質問をしよう。</p><ul class="mislist">${chk.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:""}
 ${ok.length?`<p class="small">「あまり気にならない」と答えた条件(${esc(ok.join("、"))})も、健康に関わるため、見分け方だけは確かめておくのがおすすめです。</p>`:""}
 <h2 class="h2s">残業のものさし</h2>${otRuler(S.m5.ot)}
 <h2 class="h2s">地雷が健康に与える影響</h2>${riskBars()}
 <details class="acc"><summary>応募前・面接中に使うチェックリスト</summary><div class="in"><p class="small">1つでも強く当てはまったら、その会社は詳しく確かめよう。</p><ul class="rf">${REDFLAGS.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></details>
 <details class="acc"><summary>7つの地雷の見分け方</summary><div class="in">${MINES.map(M=>`<p style="margin:8px 0 2px"><b>${esc(M.n)}</b></p><ul class="rf">${M.look.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`).join("")}
  <p class="small"><a href="${encodeURI(BOOK)}#page=27" target="_blank" rel="noopener">詳細資料へのリンク(第5章 p.27)↗</a></p></div></details>
 ${missionHTML([{t:"気になる会社1社の青少年雇用情報(残業・離職率・有給)を調べる",from:"m5"}])}
 <div class="gorow">${nextBtn("m5")}<button type="button" class="b sec wide" id="save5">結果を保存(テキスト/PDF)</button><a class="linkb" href="#/m5/card/1">答え直す</a></div>`;
 return{html:h,title:"地雷センサーの結果",bar:progBtn,after(){bindMissions();$("#save5").onclick=()=>openSave("m5");}};}

/* ---------- M6 理想の職場 ---------- */
const condById={};CONDS.forEach(c=>condById[c.id]=c);
function condRel(C){const t=top5();for(let i=0;i<t.length;i++){const k=CAT[t[i]];if(k&&C.v.includes(k))return{r:i+1,c:t[i],k};}return null;}
function condOrder(){const w=C=>{const r=condRel(C);return r?r.r:C.c?6:7;};return CONDS.map((C,i)=>({C,i})).sort((a,b)=>w(a.C)-w(b.C)||a.i-b.i).map(x=>x.C.id);}
const mustN=()=>Object.values(S.m6.c).filter(v=>v===3).length;
function m6Next(){const M=S.m6;if(!Array.isArray(M.order)||M.order.length!==CONDS.length)M.order=condOrder();
 const i=M.order.findIndex(id=>M.c[id]==null);if(i>=0)return "m6/cond/"+(i+1);const j=RIASEC_Q.findIndex((q,k)=>M.ri[k]==null);return j>=0?"m6/ri/"+(j+1):"m6/result";}
SCREENS.m6=(a)=>{const sub=a[0];
 if(sub==="cond"){if(!Array.isArray(S.m6.order)||S.m6.order.length!==CONDS.length){S.m6.order=condOrder();save();}return m6Cond(Math.min(CONDS.length,Math.max(1,+a[1]||1)));}
 if(sub==="ri")return m6Ri(Math.min(12,Math.max(1,+a[1]||1)));
 if(sub==="result"){if(!S.done.m6){go(m6Next(),true);return false;}return m6Result();}
 go(S.done.m6?"m6/result":m6Next(),true);return false;};
function m6Cond(n){const N=CONDS.length,C=condById[S.m6.order[n-1]],cur=S.m6.c[C.id],rel=condRel(C),mn=mustN();
 const why=rel?`あなたの${rel.r}位「${esc(rel.c)}」(${esc(rel.k)})と相性がいい条件だよ`:C.c?"誰にとっても大切な条件だよ。研究で満足や意欲との関係が確かめられている":"";
 const h=`<div class="qhead">理想の職場 ・ 条件カード ${n}/${N}</div><div class="pbar"><i style="width:${(n-1)/N*100}%"></i></div>
 ${n===1?guideHTML("条件カードを1枚ずつ、直感で仕分けよう。必須は3つまで。多すぎると、当てはまる会社がほとんどなくなっちゃうんだ","normal"):""}
 <div class="prof ccard2" id="cc"><div class="ph">${esc(C.n)}</div><div class="pb"><p style="margin:0">${esc(C.d)}</p>${why?`<p class="why">${why}</p>`:""}</div></div>
 <div class="tri">${COND_OPT.slice().reverse().map(o=>`<button type="button" class="${o.v===3?"mu":o.v===0?"ng":""}" data-v="${o.v}" aria-pressed="${cur===o.v}"><span>${o.s}</span>${esc(o.n)}</button>`).join("")}</div>
 <p class="pickcount">必須は3つまで。${mn>=3?"もう3つ選んだよ":`あと${3-mn}つ選べるよ`}</p>
 ${n>1?`<button type="button" class="linkb" id="qBack">← ひとつ前へ</button>`:""}`;
 return{html:h,title:"理想の職場",bar:progBtn,after(){let busy=false;
  $$(".tri button").forEach(b=>b.onclick=()=>{if(busy)return;const v=+b.dataset.v;
   if(v===3&&cur!==3&&mustN()>=3){peek("必須は3つまでにしよう。迷ったら「あると嬉しい」に","think");return;}
   busy=true;S.m6.c[C.id]=v;save();b.setAttribute("aria-pressed","true");const cc=$("#cc");if(!reduce)cc.classList.add(v===0?"gol":v===3?"gou":"gor");
   later(()=>go(n<N?"m6/cond/"+(n+1):"m6/ri/1"),260);});
  const bk=$("#qBack");if(bk)bk.onclick=()=>go("m6/cond/"+(n-1));
  const key=e=>{const m={"1":0,"2":1,"3":2,"4":3}[e.key];if(m!=null){const b=$(`.tri button[data-v="${m}"]`);if(b)b.click();}};document.addEventListener("keydown",key);cleanup=()=>document.removeEventListener("keydown",key);}};}
function m6Ri(n){const Q=RIASEC_Q[n-1],cur=S.m6.ri[n-1];
 const h=`${modHead("理想の職場 ・ 興味",n,12)}
 ${n===1?guideHTML("次は、どんな作業にわくわくするか。職種の方向を考える手がかりにするよ","normal"):""}
 <h1 class="q">${esc(Q[1])}</h1><p class="qhint">仕事として、やってみたい?</p>
 <div class="opts" role="group">${RI_OPT.map((o,i)=>`<button type="button" class="opt" data-v="${2-i}" aria-pressed="${cur===2-i}">${esc(o)}${CIRC}</button>`).join("")}</div>
 <button type="button" class="linkb" id="qBack" style="margin-top:16px">← ひとつ前へ</button>`;
 return{html:h,title:"理想の職場",bar:progBtn,after(){let busy=false;
  $$(".opt").forEach(b=>b.onclick=()=>{if(busy)return;busy=true;$$(".opt").forEach(x=>{x.classList.remove("on");x.setAttribute("aria-pressed","false");});void b.offsetWidth;b.classList.add("on");b.setAttribute("aria-pressed","true");spark(b);
   S.m6.ri[n-1]=+b.dataset.v;save();later(()=>{if(n<12)go("m6/ri/"+(n+1));else{finishMod("m6");go("m6/result");}},420);});
  $("#qBack").onclick=()=>go(n>1?"m6/ri/"+(n-1):"m6/cond/"+CONDS.length);}};}
function riScores(){const s={R:0,I:0,A:0,S:0,E:0,C:0};RIASEC_Q.forEach((q,i)=>{s[q[0]]+=+(S.m6.ri[i]||0);});return s;}
function riCode(){const s=riScores();return Object.keys(HEX).map((k,i)=>({k,v:s[k],i})).sort((a,b)=>b.v-a.v||a.i-b.i).filter(x=>x.v>0).slice(0,3).map(x=>x.k).join("");}
function hexSVG(){const s=riScores(),K=Object.keys(HEX),cx=150,cy=132,R=92;const pt=(i,r)=>{const a=(i*60-90)*Math.PI/180;return[cx+r*Math.cos(a),cy+r*Math.sin(a)];};
 let g="";[1,.5].forEach(f=>{g+=`<polygon points="${K.map((k,i)=>pt(i,R*f).map(v=>v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="var(--hair)" stroke-width="1.5"/>`;});
 g+=`<polygon points="${K.map((k,i)=>pt(i,R*Math.max(.06,s[k]/4)).map(v=>v.toFixed(1)).join(",")).join(" ")}" fill="var(--lemon)" fill-opacity=".75" stroke="var(--outline)" stroke-width="2.4" stroke-linejoin="round"/>`;
 K.forEach((k,i)=>{const[x,y]=pt(i,R+22);g+=`<text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="700" fill="currentColor" font-family="Zen Maru Gothic, sans-serif">${k} ${HEX[k][0]}</text>`;});
 return `<svg class="wheel" viewBox="0 0 300 264" role="img" aria-label="興味の六角形">${g}</svg>`;}
function m6Lists(){const by=v=>CONDS.filter(C=>S.m6.c[C.id]===v);return{must:by(3),want:by(2),ng:by(0)};}
function m6Result(){const L=m6Lists(),code=riCode(),ch=S.done.m1?charPick():null,A=analysis(),qs=A.qs||[];
 const dirs=DIRS.filter(d=>code.slice(0,2).includes(d.i)&&qs.includes(d.q));
 const ngAll=L.ng.map(C=>C.n).concat(S.done.m5?m5NG():[]);
 const h=`<div class="reshead"><p class="kick">理想の職場の結果</p></div>
 <div class="prof big"><div class="ph">${ch?cv(ch.i+"-"+ch.j,84,"alive"):mascot("cheer",70)}<div><span class="small">${ch?esc(charInfo(ch).name)+"の":"あなたの"}</span><b>理想の職場プロフィール</b></div></div>
 <div class="pb"><div class="prow"><span class="pk mu">◎ 必須</span><div>${L.must.map(C=>`<span class="pc">${esc(C.n)}</span>`).join("")||`<span class="small">まだありません</span>`}</div></div>
 <div class="prow"><span class="pk">○ 歓迎</span><div>${L.want.map(C=>`<span class="pc">${esc(C.n)}</span>`).join("")||`<span class="small">なし</span>`}</div></div>
 <div class="prow"><span class="pk ng">× NG</span><div>${ngAll.map(x=>`<span class="pc">${esc(x)}</span>`).join("")||`<span class="small">なし</span>`}</div></div>
 ${code?`<div class="prow"><span class="pk">興味</span><div><b class="code">${code}</b> <span class="small">${code.split("").map(k=>HEX[k][0]).join("・")}</span></div></div>`:""}</div></div>
 ${!L.must.length?`<p class="small">必須がまだありません。トップ1〜3の価値に関わる条件を、1〜3つ必須にしておくと会社を選びやすくなります。</p>`:""}
 <div class="memo"><h3>十分に良い会社の条件</h3><p style="margin:0">NGがなく、必須をすべて満たし、歓迎が多い会社。「最高の1社」を探し続けるより、満足しやすいことが研究で分かっています。</p></div>
 <details class="acc"><summary>条件の確かめ方</summary><div class="in">${L.must.concat(L.want).map(C=>`<div class="cond"><b>${S.m6.c[C.id]===3?"◎":"○"}</b><span><b>${esc(C.n)}</b> → ${esc(C.chk)}</span></div>`).join("")||`<p class="small">必須・歓迎の条件がありません。</p>`}</div></details>
 <details class="acc"><summary>興味と職種の方向</summary><div class="in">${hexSVG()}
  ${code?code.split("").map(k=>`<p style="margin:6px 0"><b>${k} ${HEX[k][0]}</b>:${esc(HEX[k][1])}<br><span class="small">文系の例:${esc(HEX[k][2])} / 理系の例:${esc(HEX[k][3])}</span></p>`).join(""):`<p class="small">「やってみたい」がなかったため、興味のタイプは出ませんでした。</p>`}
  ${dirs.length?`<h4 style="margin:12px 0 4px">価値観の重心とあわせると</h4>${dirs.map(d=>`<p style="margin:4px 0">${d.i} × ${esc(QN[d.q])}:${esc(d.b)}<span class="small">(理系:${esc(d.r)})</span></p>`).join("")}`:""}
  <p class="small">これは「職種の決定」ではなく「調べる方向の仮説」です。厚生労働省の job tag の職業興味検査で、より詳しく確かめられます。</p></div></details>
 <details class="acc"><summary>候補の集め方と、公的なデータの調べ方</summary><div class="in">
  <div class="funnel"><span style="width:100%">30〜50社 公開データを確認(1社10分)</span><span style="width:78%">10〜20社 点数をつけて比べる</span><span style="width:56%">3〜5社 1社検証</span></div>
  ${SOURCES.map(([a,b])=>`<p style="margin:6px 0"><b>${esc(a)}</b><br><span class="small">${esc(b)}</span></p>`).join("")}
  <p class="small"><a href="${encodeURI(BOOK)}#page=42" target="_blank" rel="noopener">詳細資料へのリンク(第8章 p.42・第10章 p.56)↗</a></p></div></details>
 ${missionHTML([{t:"必須条件を満たしそうな会社を、しょくばらぼや認定企業の一覧から3社探す",from:"m6"},{t:"job tagの職業興味検査を受けて、興味のタイプを確かめる",from:"m6"}])}
 <div class="gorow">${nextBtn("m6")}<button type="button" class="b sec wide" id="save6">結果を保存(テキスト/PDF)</button><a class="linkb" href="#/m6/cond/1">条件カードを選び直す</a></div>`;
 return{html:h,title:"理想の職場の結果",bar:progBtn,after(){bindMissions();$("#save6").onclick=()=>openSave("m6");}};}

/* ---------- 候補の会社(M7・M8・候補ファイルで共通) ---------- */
const coById=id=>S.cos.find(c=>c.id===id);
function newCo(name){const n=String(name||"").trim();if(!n)return{err:"会社名を入れてね"};if(n.length>30)return{err:"会社名は30文字までにしてね"};
 if(S.cos.length>=20)return{err:"候補は20社までです。いらない会社を消してから追加してね"};if(S.cos.some(c=>c.n===n))return{err:"同じ名前の会社がもうあります"};
 const c={id:Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36),n,m7:{s:{},note:{},ng:false,must:false},m8:null};S.cos.push(c);save();return{c};}
const addCoHTML=(ph)=>`<div class="addrow"><input class="field" type="text" id="coName" maxlength="30" placeholder="${esc(ph||"会社名(例:〇〇株式会社)")}" aria-label="追加する会社名"><button type="button" class="b sec small" id="coAdd">追加</button></div><p class="small" id="coMsg" role="status"></p>`;
function bindAddCo(after){const b=$("#coAdd");if(!b)return;const inp=$("#coName");
 b.onclick=()=>{const r=newCo(inp.value);if(r.err){$("#coMsg").textContent=r.err;return;}inp.value="";after(r.c);};inp.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();b.click();}};}
const seg=(attr,val,opts,label)=>`<div class="seg" role="group" aria-label="${esc(label)}">${opts.map(([v,t])=>`<button type="button" ${attr}="${v}" aria-pressed="${val===v}">${t}</button>`).join("")}</div>`;
function bindSeg(root,attr,onPick){$$(`[${attr}]`,root).forEach(b=>b.onclick=()=>{const g=b.parentElement;$$("button",g).forEach(x=>x.setAttribute("aria-pressed","false"));b.setAttribute("aria-pressed","true");onPick(b.getAttribute(attr),b);});}

/* ---------- M7 企業マッチ度 ---------- */
// 評価軸:トップ5の価値(重み 5,4,4,3,3)と、誰にとっても大切な3つの軸(重み3)
function scoreAxes(){const t=top5(),dw=[5,4,4,3,3];
 return t.map((c,i)=>({k:"v:"+c,l:c,w:dw[i],h:CAT[c]?VALS[VI[CAT[c]]].w:""})).concat([{k:"c:rel",l:"人間関係・心理的安全性",w:3,h:"困ったときに相談できるか、意見を言えるか"},{k:"c:fair",l:"公正な評価と報酬",w:3,h:"評価基準の公開、努力が報われるか"},{k:"c:time",l:"労働時間・働き方",w:3,h:"残業時間、休日、転勤"}]);}
function coScore(c){const ax=scoreAxes();let s=0,m=0;ax.forEach(a=>{const v=+c.m7.s[a.k]||3;s+=a.w*v;m+=a.w*5;});return{s,m,rated:Object.keys(c.m7.s).length>0};}
function m7Results(){const res=S.cos.map(c=>Object.assign({c},coScore(c),{ng:!!c.m7.ng,must:!!c.m7.must})).filter(r=>r.rated||r.ng||r.must);
 const ok=res.filter(r=>!r.ng&&r.must).sort((a,b)=>b.s-a.s),out=res.filter(r=>r.ng);let msg,cls;
 if(!res.length){msg="まだ採点した会社がありません。";cls="mid";}
 else if(ok.length){msg=`有力候補:${ok[0].c.n}(${ok[0].s}点)`+(ok[1]&&ok[0].s-ok[1].s<=5?`。${ok[1].c.n}と僅差です。トップ1・2の価値の点数が高いほうを優先し、1社検証で両方を確かめよう。`:"。次は1社検証で本当に合うか確かめよう。");cls="ok";}
 else if(out.length===res.length){msg="すべてNGに当てはまりました。候補を広く集め直そう。";cls="ng";}
 else{msg="「必須条件をすべて満たす」会社がまだありません。情報が足りなければOB・OG訪問などで確かめ、足りていれば必須条件を見直そう(3つ以内)。";cls="mid";}
 if(out.length&&cls!=="ng")msg+=` NGに当てはまり除外:${out.map(r=>r.c.n).join("、")}。`;
 return{res:res.sort((a,b)=>(a.ng-b.ng)||(b.s-a.s)),msg,cls};}
SCREENS.m7=(a)=>{if(!S.done.m1||!top5().length)return needM1("企業マッチ度");
 if(a[0]==="co"){const c=coById(a[1]);if(!c){go("m7",true);return false;}return m7Co(c);}
 if(a[0]==="result")return m7Result();return m7Home();};
function m7Home(){const ax=scoreAxes();
 const h=`${modHead("企業マッチ度",0,0)}<h1 class="q">候補の会社を、同じ物差しで比べよう</h1>
 ${guideHTML("あなたのトップ5を重みにして点数をつけるよ。根拠(事実)がない軸は3点のままにしておくのがルール","normal")}
 <details class="acc"><summary>評価の軸と重み(${ax.length}軸)</summary><div class="in">${ax.map(x=>`<div class="cond"><b>×${x.w}</b><span><b>${esc(x.l)}</b>${x.h?`<br><span class="small">${esc(x.h)}</span>`:""}</span></div>`).join("")}<p class="small">1位の価値は重み5、誰にとっても大切な軸は3。合計=重み×点数(1〜5)。</p></div></details>
 <h2 class="h2s">候補の会社</h2>
 <div class="colist">${S.cos.map(c=>{const r=coScore(c);return `<a class="coitem" href="#/m7/co/${c.id}"><b>${esc(c.n)}</b><span class="small">${c.m7.ng?"NGに当てはまる":r.rated?`${r.s} / ${r.m}点`:"まだ採点していない"}</span><span class="go">採点する →</span></a>`;}).join("")||`<p class="small">まだ会社がありません。気になる会社を追加しよう。</p>`}</div>
 ${addCoHTML()}
 <div class="btns"><a class="b wide" href="#/m7/result" ${S.cos.some(c=>coScore(c).rated)?"":`aria-disabled="true" id="noRes"`}>比べた結果を見る</a><a class="b sec wide" href="#/file">候補ファイルを見る</a></div>`;
 return{html:h,title:"企業マッチ度",bar:progBtn,after(){bindAddCo(c=>go("m7/co/"+c.id));const n=$("#noRes");if(n)n.onclick=e=>{e.preventDefault();toast("まず1社、採点してみよう");};}};}
function m7Co(c){const ax=scoreAxes(),L=S.done.m6?m6Lists():{must:[],ng:[]},ngs=L.ng.map(C=>C.n).concat(S.done.m5?m5NG():[]);
 const h=`${modHead("企業マッチ度 ・ 採点",0,0)}<h1 class="q">${esc(c.n)}</h1>
 <p class="small">分かる軸だけでOK。根拠がない軸は「3(分からない)」のままにしよう。</p>
 ${ax.map(x=>{const v=+c.m7.s[x.k]||3;return `<div class="evcard axrow" data-k="${esc(x.k)}"><div class="evh"><b>${esc(x.l)}</b><span class="wt">重み×${x.w}</span></div>${x.h?`<p class="small" style="margin:0 0 6px">${esc(x.h)}</p>`:""}
  ${seg("data-sv",String(v),[["1","1"],["2","2"],["3","3<small>?</small>"],["4","4"],["5","5"]],x.l)}
  <input class="field sm" type="text" data-note="${esc(x.k)}" maxlength="80" placeholder="根拠となる事実(例:2年目から案件の一部を担当)" aria-label="${esc(x.l)}の根拠"></div>`;}).join("")}
 <div class="evcard"><button type="button" class="chk" id="ckNg" aria-pressed="${!!c.m7.ng}"><i></i>NG条件に当てはまる</button>${ngs.length?`<p class="small">あなたのNG:${esc(ngs.join("、"))}</p>`:""}
  <button type="button" class="chk" id="ckMust" aria-pressed="${!!c.m7.must}"><i></i>必須条件をすべて満たす</button>${L.must.length?`<p class="small">あなたの必須:${esc(L.must.map(C=>C.n).join("、"))}</p>`:""}</div>
 <div class="scorebox"><span>合計</span><b id="tot"></b></div>
 <div class="btns"><a class="b wide" href="#/m7/result">結果を見る</a><a class="b sec wide" href="#/m7">ほかの会社を採点する</a><button type="button" class="linkb" id="delCo">この会社を候補から消す</button></div>`;
 return{html:h,title:"企業マッチ度",bar:progBtn,after(m){const tot=()=>{const r=coScore(c);$("#tot").textContent=`${r.s} / ${r.m}`;};tot();
  $$(".axrow",m).forEach(row=>{const k=row.dataset.k;bindSeg(row,"data-sv",v=>{c.m7.s[k]=+v;save();tot();});});
  $$("[data-note]",m).forEach(el=>{const k=el.dataset.note;el.value=c.m7.note[k]||"";el.addEventListener("input",()=>{c.m7.note[k]=el.value;save();});});
  const tg=(id,key)=>{const b=$("#"+id);b.onclick=()=>{c.m7[key]=!c.m7[key];b.setAttribute("aria-pressed",String(c.m7[key]));save();};};tg("ckNg","ng");tg("ckMust","must");
  $("#delCo").onclick=()=>{if(!confirm(`「${c.n}」を候補から消します。採点や検証の内容も消えます。よろしいですか?`))return;S.cos=S.cos.filter(x=>x!==c);save();go("m7");};}};}
function m7Result(){const R=m7Results();if(R.res.length)finishMod("m7");
 const top=R.res[0];
 const h=`<div class="reshead"><p class="kick">企業マッチ度の結果</p>${myChar(R.cls==="ok"?"happy":"think",140,"alive")}</div>
 <div class="mbars">${R.res.map(r=>`<div class="${r.ng?"out":""}"><b>${esc(r.c.n)}</b><i><u style="width:${r.ng?0:(r.s/r.m*100).toFixed(0)}%"></u></i><em>${r.ng?"除外":r.s+"点"}</em>${r.must&&!r.ng?`<span class="tag ok">必須OK</span>`:""}</div>`).join("")||`<p class="small">まだ採点した会社がありません。</p>`}</div>
 <div class="verdict ${R.cls}">${esc(R.msg)}</div>
 <div class="memo"><h3>点数は結論ではなく、話し合いの材料</h3><p style="margin:0">合計点が高くても、NG条件に当たるなら除外。点数が近いときは、トップ1・2の価値の点数が高いほうを優先しよう。</p></div>
 ${missionHTML([{t:"3点(分からない)の軸を1つ、OB・OG訪問や説明会で確かめる",from:"m7"}])}
 <div class="gorow">${top&&!top.ng?`<a class="b wide" href="#/m8/${top.c.id}">${esc(top.c.n)}を1社検証する</a>`:""}${nextBtn("m7").replace('class="b wide"',top&&!top.ng?'class="b sec wide"':'class="b wide"')}<a class="b sec wide" href="#/m7">採点を続ける</a><button type="button" class="b sec wide" id="save7">結果を保存(テキスト/PDF)</button></div>`;
 return{html:h,title:"企業マッチ度の結果",bar:progBtn,after(){bindMissions();$("#save7").onclick=()=>openSave("m7");}};}

/* ---------- M8 1社検証 ---------- */
const M8STEPS=["b0","b1","b2","b3","b4","b5","b6"];
const M8T={b0:"惹かれている理由",b1:"地雷チェック",b2:"12の軸で採点",b3:"トップ5の根拠",b4:"価値のずれ",b5:"3年後の後悔",b6:"親友なら何と言う?"};
const m8Of=c=>{if(!c.m8)c.m8={b0:[],mines:[null,null,null,null,null,null,null],ax:Array(12).fill(3),b3:{},b4:{},pre:"",friend:"",step:"b0"};return c.m8;};
// 自分の重要度(1〜5):カードの仕分けとトップ5から計算する
function selfImp(){const t=top5(),imp={};VALS.forEach(v=>{let m=1;CARDS[v.n].forEach(([c])=>{const s=S.cards[c]||0;if(s===2)m=Math.max(m,2);if(s===3)m=Math.max(m,3);});imp[v.n]=m;});t.forEach((c,i)=>{const k=CAT[c];if(k)imp[k]=Math.max(imp[k],i<2?5:4);});return imp;}
function m8Verdict(c){const B=m8Of(c),t=top5(),imp=selfImp();
 const mineYes=B.mines.filter(x=>x===2).length,mineUnk=B.mines.filter(x=>x!==0&&x!==2).length;
 const yes=t.filter(v=>B.b3[v]&&B.b3[v].ok).length,top1=!!(t[0]&&B.b3[t[0]]&&B.b3[t[0]].ok);
 const cats=[...new Set(t.map(v=>CAT[v]).filter(Boolean))].slice(0,3);const worst=cats.length?Math.min(...cats.map(k=>(B.b4[k]||3)-imp[k])):0;
 const surf=B.b0.filter(k=>k[0]==="0"||k[0]==="1").length,daily=B.b0.filter(k=>k[0]==="2").length,unk=B.ax.filter(x=>x===3).length;
 let k,why;
 if(mineYes){k="ng";why=`地雷「あり」が${mineYes}つ。配属先で当てはまらないと確かめられない限り、見送ろう。`;}
 else if(mineUnk>=3){k="hold";why=`地雷の「不明」が${mineUnk}つ。OB・OG訪問や青少年雇用情報で先に確かめよう。`;}
 else if(yes>=4&&top1&&worst>=-1){k="ok";why="地雷がなく、トップ5のうち4つ以上に事実の根拠がある。見つけた後悔のリスクに備えて進もう。";}
 else if(yes>=3&&worst>=-2){k="mid";why=`根拠のある価値が${yes}つ。${top1?"":"1位の価値の根拠がまだ書けていないよ。"}ずれ(最大 ${worst})について追加で情報を取ろう。`;}
 else{k="gap";why=`根拠を書けた価値は${yes}/5、トップの価値のずれは最大 ${worst}。「良い」と感じる理由を見直して、ほかの候補とも比べよう。`;}
 const notes=[];if(surf>daily)notes.push("惹かれる理由が、表面的な理由や選考体験にかたよっています(ハロー効果に注意)。");if(unk>=6)notes.push(`12の軸のうち${unk}軸が3点(分からない)。質問集で情報を取りに行こう。`);
 return{k,why,notes,yes,worst,top1};}
SCREENS.m8=(a)=>{if(!S.done.m1||!top5().length)return needM1("1社検証");
 if(!a[0])return m8Home();const c=coById(a[0]);if(!c){go("m8",true);return false;}
 const B=m8Of(c),st=a[1];if(!st){go(`m8/${c.id}/${c.verdict?"result":B.step||"b0"}`,true);return false;}
 if(st==="result"){if(!c.verdict){go(`m8/${c.id}/${B.step||"b0"}`,true);return false;}return m8Result(c);}
 if(!M8STEPS.includes(st)){go("m8/"+c.id,true);return false;}B.step=st;S.m8cur=c.id;save();return m8Step(c,st);};
function m8Home(){const h=`${modHead("1社検証",0,0)}<h1 class="q">「いいな」と感じる会社は、本当に合う?</h1>
 ${guideHTML("直感を否定するんじゃなくて、事実で確かめる手順だよ。7つのステップで、1社15分くらい","normal")}
 <h2 class="h2s">どの会社を検証する?</h2>
 <div class="colist">${S.cos.map(c=>`<a class="coitem" href="#/m8/${c.id}"><b>${esc(c.n)}</b><span class="small">${c.verdict?"判定:"+esc(VERDICT[c.verdict].n):c.m8?`途中(${esc(M8T[c.m8.step]||"")})`:"まだ検証していない"}</span><span class="go">検証する →</span></a>`).join("")||`<p class="small">まだ会社がありません。</p>`}</div>
 ${addCoHTML(S.prog&&S.prog.q1===4?"今の会社の名前":"")}`;
 return{html:h,title:"1社検証",bar:progBtn,after(){bindAddCo(c=>go("m8/"+c.id));}};}
function m8Step(c,st){const B=m8Of(c),i=M8STEPS.indexOf(st),t=top5(),imp=selfImp();let body="";
 if(st==="b0")body=`<h1 class="q">この会社のどこに惹かれている?</h1><p class="qhint">あてはまるものを全部タップ</p>
  ${B0.map((g,gi)=>`<div class="picksec"><h3>${esc(B0G[gi][0])}</h3><p class="small" style="margin:-6px 0 6px">${esc(B0G[gi][1])}</p><div class="srcs">${g.map((x,ti)=>`<button type="button" class="src" data-b0="${gi}-${ti}" aria-pressed="${B.b0.includes(gi+"-"+ti)}"><b>${esc(x)}</b></button>`).join("")}</div></div>`).join("")}
  <p class="small">1つ目立つ良い特徴があると、ほかの特徴まで良く見える「ハロー効果」が起きやすいことが知られています。</p>`;
 if(st==="b1")body=`<h1 class="q">7つの地雷はある?</h1><p class="qhint">「たぶん大丈夫」ではなく、事実で答えよう。分からなければ「不明」</p>
  ${MINES.map((M,k)=>`<div class="evcard mrow" data-i="${k}"><div class="evh"><b>${esc(M.n)}</b></div><p class="small" style="margin:0 0 6px">見分け方:${esc(M.look[0])}</p>${seg("data-mv",B.mines[k]==null?"":String(B.mines[k]),[["0","なし"],["1","不明"],["2","あり"]],M.n)}</div>`).join("")}`;
 if(st==="b2")body=`<h1 class="q">12の軸で、点数をつけよう</h1><p class="qhint">根拠(事実)がない軸は3のまま</p>
  ${AX.map((x,k)=>`<div class="evcard arow" data-i="${k}"><div class="evh"><b>${k+1} ${esc(x.n)}</b></div>${seg("data-av",String(B.ax[k]),[["1","1"],["2","2"],["3","3<small>?</small>"],["4","4"],["5","5"]],x.n)}<details class="qd"><summary>確かめる質問</summary><p class="small">${esc(x.q)}</p></details></div>`).join("")}`;
 if(st==="b3")body=`<h1 class="q">トップ5は、この会社で満たされる?</h1><p class="qhint">「満たされる」と言える具体的な事実を書こう</p>
  ${t.map((v,k)=>{const o=B.b3[v]||{};return `<div class="evcard b3row" data-v="${esc(v)}"><div class="evh"><span class="no">${k+1}</span><b>${esc(v)}</b></div><input class="field" type="text" data-b3t maxlength="100" value="${esc(o.t||"")}" placeholder="${k===0?"例:2年目から案件の一部を任されると社員の方から聞いた":"この会社で満たされると言える事実"}" aria-label="${esc(v)}が満たされる事実"><button type="button" class="chk" data-b3ok aria-pressed="${!!o.ok}"><i></i>具体的な事実で書けた</button></div>`;}).join("")}`;
 if(st==="b4")body=`<h1 class="q">あなたと会社の「大事」は、ずれてない?</h1><p class="qhint">会社がそれぞれの価値をどれくらい大事にしているか、制度や社員の行動から1〜5で</p>
  ${VALS.map(v=>{const me=imp[v.n],co=B.b4[v.n]||3;return `<div class="evcard b4row" data-v="${esc(v.n)}"><div class="evh"><b>${esc(v.n)}</b><span class="small">あなた ${"●".repeat(me)}${"○".repeat(5-me)}</span><span class="dif" style="color:${diffCol(co-me)}">${co-me>0?"+":""}${co-me}</span></div>${seg("data-cv",String(co),[["1","1"],["2","2"],["3","3"],["4","4"],["5","5"]],v.n+"の会社での実態")}</div>`;}).join("")}
  <p class="small">差(会社−あなた)が−2以下の価値は、大切なのに満たされにくい価値。+2以上は、窮屈さの原因になりうる価値です。</p>`;
 if(st==="b5")body=`<h1 class="q">3年後、この会社を辞めて後悔している。なぜ?</h1><p class="qhint">あえて失敗した未来を想像すると、見落としていたリスクが見つかりやすい(事前検死)</p>
  <textarea class="field" id="pre" rows="6" placeholder="例:配属先で裁量がなく、指示待ちの仕事しかなかった → 配属の決まり方をOB訪問で聞く → 社内公募制度があるか確かめる"></textarea>
  <p class="small">理由ごとに「確かめる方法」と「起きたときの対処」も書いておこう。</p>`;
 if(st==="b6")body=`<h1 class="q">親友がこの結果を持って相談してきたら、何と言う?</h1><p class="qhint">自分のことより、人のことのほうが賢く判断できる(ソロモンのパラドックス)</p>
  <textarea class="field" id="fr" rows="5" placeholder="例:安定と家族の面は良い。でも一番大事な自律が満たされにくいなら、配属と社内公募を確かめてから決めたほうがいい"></textarea>`;
 const h=`${modHead(`1社検証 ・ ${M8T[st]}`,i+1,7)}<p class="coname">${esc(c.n)}</p>${body}
 <div class="btns"><button type="button" class="b wide" id="nx">${i<6?"次へ":"判定を見る"}</button>${i>0?`<button type="button" class="linkb" id="bk">← ひとつ前へ</button>`:`<a class="linkb" href="#/m8">← 会社を選び直す</a>`}</div>`;
 return{html:h,title:"1社検証",bar:progBtn,after(m){
  $$("[data-b0]",m).forEach(b=>b.onclick=()=>{const k=b.dataset.b0,on=B.b0.includes(k);B.b0=on?B.b0.filter(x=>x!==k):B.b0.concat(k);b.setAttribute("aria-pressed",String(!on));save();});
  $$(".mrow",m).forEach(r=>bindSeg(r,"data-mv",v=>{B.mines[+r.dataset.i]=+v;save();}));
  $$(".arow",m).forEach(r=>bindSeg(r,"data-av",v=>{B.ax[+r.dataset.i]=+v;save();}));
  $$(".b3row",m).forEach(r=>{const v=r.dataset.v;const o=()=>B.b3[v]=Object.assign({},B.b3[v]||{});$("[data-b3t]",r).addEventListener("input",e=>{o().t=e.target.value;save();});
   const ok=$("[data-b3ok]",r);ok.onclick=()=>{const x=o();x.ok=!x.ok;ok.setAttribute("aria-pressed",String(x.ok));save();};});
  $$(".b4row",m).forEach(r=>{const v=r.dataset.v;bindSeg(r,"data-cv",x=>{B.b4[v]=+x;save();const d=+x-imp[v],el=$(".dif",r);el.textContent=(d>0?"+":"")+d;el.style.color=diffCol(d);});});
  const pre=$("#pre");if(pre){pre.value=B.pre||"";grow(pre);pre.addEventListener("input",()=>{B.pre=pre.value;save();grow(pre);});}
  const fr=$("#fr");if(fr){fr.value=B.friend||"";grow(fr);fr.addEventListener("input",()=>{B.friend=fr.value;save();grow(fr);});}
  $("#nx").onclick=()=>{if(i<6)go(`m8/${c.id}/${M8STEPS[i+1]}`);else{c.verdict=m8Verdict(c).k;finishMod("m8");go(`m8/${c.id}/result`);}};
  const bk=$("#bk");if(bk)bk.onclick=()=>go(`m8/${c.id}/${M8STEPS[i-1]}`);}};}
const diffCol=d=>d<=-2?"var(--tomato)":d>=2?"#C77F00":"var(--mint)";
function m8Asks(c){const B=m8Of(c),L=[];B.mines.forEach((x,k)=>{if(x!==0&&x!==2)L.push(`【${MINES[k].n}】${MINES[k].look[0]}を確かめる`);});B.ax.forEach((x,k)=>{if(x===3)L.push(`【${AX[k].n}】${AX[k].q}`);});return L;}
function m8Result(c){const V=m8Verdict(c);c.verdict=V.k;save();const T=VERDICT[V.k],B=m8Of(c),asks=m8Asks(c);S.m8cur=c.id;
 const askTxt=`${c.n}のOB・OG訪問で聞きたいこと\n\n`+asks.map((q,i)=>`${i+1}. ${q.replace(/^【[^】]+】/,"")}`).join("\n");
 const h=`<div class="reshead"><p class="kick">1社検証の結果</p></div>
 <div class="verd"><span class="stampv ${V.k}">${esc(T.n)}</span>${myChar(T.e,90,"alive")}<div><b class="vco">${esc(c.n)}</b><p style="margin:2px 0 0;font-weight:700">${esc(T.l)}</p></div></div>
 <p>${esc(V.why)}</p>${V.notes.map(n=>`<p class="small">・${esc(n)}</p>`).join("")}
 <div class="minechips">${MINES.map((M,k)=>{const x=B.mines[k];return `<span class="${x===2?"bad":x===0?"ok":"unk"}">${esc(M.n)} ${x===2?"あり":x===0?"なし ✓":"不明 ?"}</span>`;}).join("")}</div>
 <details class="acc" ${asks.length?"open":""}><summary>次に聞くこと(${asks.length})</summary><div class="in">${asks.length?`<ol class="rf">${asks.map(q=>`<li>${esc(q)}</li>`).join("")}</ol><button type="button" class="b small" id="cpAsk">OB・OG訪問の質問をコピー</button><p class="small" id="askMsg" role="status"></p>`:`<p class="small">不明な地雷や、3点のままの軸はありません。</p>`}</div></details>
 <details class="acc"><summary>3年後に後悔するとしたら</summary><div class="in">${rpText(B.pre)}</div></details>
 <details class="acc"><summary>親友へのアドバイス</summary><div class="in">${rpText(B.friend)}</div></details>
 ${missionHTML([{t:`${c.n}について「次に聞くこと」を1つ、OB・OG訪問や説明会で聞く`,from:"m8"}])}
 <div class="gorow">${nextBtn("m8")}<a class="b sec wide" href="#/file">候補ファイルを見る</a><button type="button" class="b sec wide" id="save8">結果を保存(テキスト/PDF)</button><a class="linkb" href="#/m8/${c.id}/b0">答え直す</a><a class="linkb" href="#/m8">ほかの会社を検証する</a></div>`;
 return{html:h,title:"1社検証の結果",bar:progBtn,after(){bindMissions();$("#save8").onclick=()=>openSave("m8");const cp=$("#cpAsk");if(cp)cp.onclick=()=>copyText(askTxt,$("#askMsg"));}};}

/* ---------- 候補ファイル ---------- */
SCREENS.file=()=>{const h=`<h1 class="q" style="margin-top:6px">候補ファイル</h1><p class="small">調べた会社がカードになってたまっていくよ。判定のスタンプは1社検証で押されます。</p>
 <div class="cofile">${S.cos.map((c,i)=>{const r=coScore(c),v=c.verdict;return `<div class="cocard" style="--r:${[-1.2,.8,-.4,1.1][i%4]}deg">${v?`<span class="stampv ${v}">${esc(VERDICT[v].n)}</span>`:""}<b>${esc(c.n)}</b>
  <p class="small" style="margin:2px 0 8px">${c.m7.ng?"NGに当てはまる":r.rated?`マッチ度 ${r.s} / ${r.m}点`:"マッチ度:まだ"}${v?` ・ ${esc(VERDICT[v].l)}`:""}</p>
  <div class="row2"><a class="b sec small" href="#/m7/co/${c.id}">マッチ度</a><a class="b sec small" href="#/m8/${c.id}">1社検証</a></div></div>`;}).join("")||`<p class="small">まだ会社がありません。</p>`}</div>
 ${addCoHTML()}`;
 return{html:h,title:"候補ファイル",bar:S.prog?progBtn:`<a class="iconb" href="#/">トップ</a>`,after(){bindAddCo(()=>keepScroll());}};};

/* ---------- 最終レポート ---------- */
const SCHEDULE=[["1〜2年生","価値観マップの初版を作る。バイト・サークル・ゼミを小さな行動実験の場にする"],["3年生 4〜6月","身近な人に聞いてマップを完成。興味検査。職場の条件と職種の方向を決める"],["3年生 夏","候補を広く集める。夏のインターンで生の情報を集める"],["3年生 秋冬","マップを更新。地雷で候補を絞る。秋冬インターン、OB・OG訪問"],["3年生 2〜3月","候補の点数をつけて比べる。エントリーシート"],["4年生 春夏","面接。気になる会社ごとに1社検証"],["内定後","複数の内定を比べ、承諾を判断する"],["入社後","年1回の見直し。仕事の工夫(ジョブ・クラフティング)"]];
const QUIT=[["地雷(長時間労働やハラスメントなど)があり、心身の不調がある","健康を最優先に、早めに対処する。まず医療機関や社内外の相談窓口に相談する(「こころの耳」や総合労働相談コーナーも使える)"],["地雷はないが、価値観との大きなずれがある","仕事の工夫(ジョブ・クラフティング)や異動で埋められるかを先に試す。1〜2年試しても埋まらなければ、転職を検討する"],["なんとなく不満だが、理由がはっきりしない","エピソード検証と1社検証で原因を特定する。「隣の芝生」の可能性もある"]];
const addYear=d=>{const m=String(d||"").match(/^(\d{4})-(\d{2})/);return m?`${+m[1]+1}年${+m[2]}月`:"";};
function nextSteps(){const L=[],P=S.prog,nx=P?P.mods.find(m=>!S.done[m]):null;
 if(nx)L.push({t:`${MODS[nx].n}をやる(${MODS[nx].t})`,h:"#/"+nx});
 const open=S.missions.filter(x=>!x.done);if(open.length)L.push({t:`今週のミッション:${open[0].t}`,h:"#/program"});
 if(S.done.m5&&!S.cos.length)L.push({t:"候補の会社を集める(しょくばらぼ、認定企業の一覧、業界地図)",h:"#/m7"});
 const unk=S.cos.filter(c=>c.verdict==="hold"||c.verdict==="mid");if(unk.length)L.push({t:`${unk[0].n}について「次に聞くこと」をOB・OG訪問で確かめる`,h:`#/m8/${unk[0].id}/result`});
 if(S.done.m3)L.push({t:"身近な人2〜3人に「5つの質問」を送る",h:"#/m3/result"});
 L.push({t:"年に1回、価値観診断をやり直してマップを更新する",h:"#/m1/result"});
 return L.slice(0,4);}
SCREENS.report=()=>{if(!S.done.m1){return{html:`${guideHTML("最終レポートは、価値観診断を終えると作れるよ","think")}<div class="btns"><a class="b wide" href="#/m1">価値観診断へ</a></div>`,title:"最終レポート",bar:progBtn};}
 const A=analysis(),I=charInfo(A.ch),P=S.prog,all=P&&P.mods.every(m=>S.done[m]);
 if(all&&!S.done.report){S.done.report=true;S.stampNew="report";save();}
 const box=(m,body,link)=>`<div class="rbox"><div class="rh"><b>${esc(MODS[m].n)}</b>${S.done[m]?`<a href="#/${link||m+"/result"}">くわしく →</a>`:`<a href="#/${m}" class="todo">まだ(${esc(MODS[m].t)})→</a>`}</div>${S.done[m]?body():""}</div>`;
 const R3=S.done.m3?selfScore():null,rows4=S.done.m4?m4Rows():[],L6=S.done.m6?m6Lists():null,R7=S.done.m7?m7Results():null;
 const h=`<div class="reshead"><p class="kick">最終レポート</p>${cv(A.ch.i+"-"+A.ch.j,170,"alive sway")}<h1 style="font-size:28px">あなたの職場選びの物差し</h1><p class="ttl">${esc(I.name)} ・ ${esc(I.title)}</p></div>
 ${all?`<div class="card tilt" style="text-align:center">${stampSVG("完成",S.stampNew==="report")}<p style="margin:4px 0 0;font-weight:700">プログラムを全部クリア!おつかれさま</p></div>`:""}
 <div class="rgrid">
 ${box("m1",()=>`<ol class="rtop">${A.t.map(c=>`<li>${esc(c)}</li>`).join("")}</ol>`)}
 ${box("m2",()=>{const l=m2List(),ok=l.filter(c=>["ok","want"].includes(evVerdict(c).k)).length;return `<p>体験で確かめた価値 <b>${ok}/${l.length}</b></p>${String(S.f.affirm||"").trim()?`<p class="hand small">${esc(snip(String(S.f.affirm),70))}</p>`:""}`;})}
 ${box("m3",()=>R3?`<p><b>${esc(SELF_T[R3.type].n)}</b></p><p class="small">${esc(SELF_T[R3.type].tip)}</p>`:"")}
 ${box("m4",()=>rows4[0]?`<p>差がいちばん大きい:<b>${esc(rows4[0].c)}</b>(${rows4[0].g[0]-rows4[0].g[1]})</p>${rows4[0].g[2]?`<p class="small">今週の行動:${esc(rows4[0].g[2])}</p>`:""}`:"")}
 ${box("m5",()=>`<div class="rchips">${m5NG().map(x=>`<span class="ng">× ${esc(x)}</span>`).join("")}</div>`)}
 ${box("m6",()=>`<div class="rchips">${L6.must.map(C=>`<span class="mu">◎ ${esc(C.n)}</span>`).join("")}${L6.want.slice(0,4).map(C=>`<span>○ ${esc(C.n)}</span>`).join("")}${L6.want.length>4?`<span>ほか${L6.want.length-4}つ</span>`:""}</div>${riCode()?`<p class="small">興味:<b>${riCode()}</b></p>`:""}`)}
 ${box("m7",()=>R7&&R7.res.length?`<p>${esc(R7.msg)}</p>`:"",`m7/result`)}
 ${box("m8",()=>`<div class="rchips">${S.cos.filter(c=>c.verdict).map(c=>`<span class="st ${c.verdict}">${esc(c.n)}:${esc(VERDICT[c.verdict].n)}</span>`).join("")||`<span>まだ判定した会社がありません</span>`}</div>`,"file")}
 </div>
 <h2 class="h2s">次の一手</h2><ol class="nexts">${nextSteps().map(x=>`<li><a href="${x.h}">${esc(x.t)}</a></li>`).join("")}</ol>
 <h2 class="h2s">マップの更新</h2><p class="small" style="margin-top:0">価値観は、就職・引っ越し・大きな出来事で順位が入れ替わることがあります。${S.doneAt&&S.doneAt.m1?`価値観診断は${esc(S.doneAt.m1)}に作成。次の見直しの目安は<b>${addYear(S.doneAt.m1)}</b>ごろです。`:"年に1回は見直そう。"}</p>
 <details class="acc"><summary>いつ何をする?(時期ごとの予定)</summary><div class="in">${SCHEDULE.map(([a,b])=>`<div class="cond"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join("")}<p class="small">スケジュールは年度や業界で変わります。大学のキャリアセンターで最新情報を確かめてください。</p></div></details>
 ${P&&P.q1===4?`<details class="acc" open><summary>辞めるべきか迷ったとき</summary><div class="in">${QUIT.map(([a,b])=>`<p style="margin:8px 0 2px"><b>${esc(a)}</b></p><p class="small" style="margin:0">${esc(b)}</p>`).join("")}</div></details>`:""}
 <div class="gorow"><button type="button" class="b wide" id="saveAll">レポートを保存(テキスト/PDF)</button><button type="button" class="b sec wide" id="share">キャラを画像で保存・シェア</button><a class="b sec wide" href="#/program">プログラムにもどる</a><a class="linkb why2" href="guide.html#/c/10">日本の就活での使い方を図解ガイドで読む →</a></div>`;
 return{html:h,title:"最終レポート",bar:progBtn,after(){$("#saveAll").onclick=()=>openSave("all");$("#share").onclick=()=>shareImage(A,I);}};};

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
const quoteMd=s=>{s=String(s||"").trim();return s?s.split(/\r?\n/).map(l=>"> "+l).join("\n"):"> (未記入)";};
const rpText=s=>{s=String(s||"").trim();return s?`<p class="rp-txt">${esc(s).replace(/\n/g,"<br>")}</p>`:`<p class="rp-txt small">(未記入)</p>`;};
const SEC={
 m1:{title:"価値観診断の結果",file:"価値観診断",
  md(){const A=analysis(),L=[];if(!A.ch)return["(まだ結果がありません)"];const I=charInfo(A.ch);
   L.push(`## 価値観キャラ:${I.name}`,[`- 肩書き:${I.title}`,`- トップ1 × トップ2:${I.pair}${I.yure?"(ゆれ:円環の向かい側どうし)":""}`,`- こんな子:${I.text}`].join("\n"));
   L.push("## 3行まとめ",summary3(A).map((l,i)=>`${i+1}. ${l}`).join("\n"));
   L.push("## トップ5",mdTable(["順位","価値","満たされている状態","Schwartzの分類"],A.t.map((c,i)=>[i+1,c,EX[c]||"(自分で足したカード)",CAT[c]||"円環外"])));
   const rest=effRank().slice(5);if(rest.length)L.push(`6位以下:${rest.join("、")}`);
   L.push("## 円環での読み取り",[`- 重心:${A.center}`,`- 空いているグループ:${A.zero.length?A.zero.join("、"):"なし(バランス型)"}`,`- 葛藤軸:${A.conf.length?A.conf.map(c=>`${c[0]} ⇄ ${c[1]}(${c[2]})`).join("/"):"大きな対立なし"}`].join("\n"));
   L.push("## カードの仕分け",[3,2,1].map(s=>{const cs=allCards().filter(c=>S.cards[c]===s);return `- ${LV[s]}(${cs.length}枚):${cs.length?cs.join("、"):"なし"}`;}).join("\n"));
   return L;},
  html(){const A=analysis();if(!A.ch)return `<p>(まだ結果がありません)</p>`;const I=charInfo(A.ch);
   return `<div class="rp-char">${cv(A.ch.i+"-"+A.ch.j,150)}<div><p class="small" style="margin:0">今のあなたの優先順位は</p><h2>${esc(I.name)}</h2><p style="margin:0"><b>${esc(I.title)}</b> ・ ${esc(I.pair)}${I.yure?" ・ ゆれ":""}</p><p style="margin:6px 0 0">${esc(I.text)}</p></div></div>
   <div class="rp-box" style="background:#FFF2C2"><b>3行まとめ</b><ol style="margin:4px 0 0">${summary3(A).map(l=>`<li>${esc(l)}</li>`).join("")}</ol></div>
   <h3>トップ5</h3><table><tr><th>順位</th><th>価値</th><th>満たされている状態</th><th>分類</th></tr>${A.t.map((c,i)=>`<tr><td>${i+1}</td><td><b>${esc(c)}</b></td><td>${esc(EX[c]||"(自分で足したカード)")}</td><td>${esc(CAT[c]||"円環外")}</td></tr>`).join("")}</table>
   <h3>円環での読み取り</h3><div style="display:grid;grid-template-columns:260px 1fr;gap:14px;align-items:center;break-inside:avoid"><div>${wheelSVG(A.hl)}</div><div><p><b>重心:</b>${esc(A.center)}</p><p><b>空いているグループ:</b>${A.zero.length?esc(A.zero.join("、")):"なし(バランス型)"}</p><p><b>葛藤軸:</b>${A.conf.length?A.conf.map(c=>esc(`${c[0]} ⇄ ${c[1]}(${c[2]})`)).join("<br>"):"大きな対立なし"}</p></div></div>
   <h3>カードの仕分け</h3>${[3,2,1].map(s=>{const cs=allCards().filter(c=>S.cards[c]===s);return `<p><b>${LV[s]}(${cs.length}枚)</b> ${cs.length?esc(cs.join("、")):"なし"}</p>`;}).join("")}`;}},
 m2:{title:"エピソード検証の結果",file:"エピソード検証",
  md(){const list=m2List(),hl=effRank().filter(held),L=[];
   L.push("## 感情が動いた出来事",EPIS.map(E=>`### ${E.n}(${E.clue})\n${quoteMd(S.f[E.k])}`).join("\n\n"));
   L.push("## トップ5の検証",mdTable(["順位","価値","判定","裏づける出来事","私にとっての意味","満たされているときの状態"],list.map((c,i)=>{const e=S.ev[c]||{},d=S.def[c]||{};return[i+1,c,evVerdict(c).l,[...(e.src||[]).filter(epText).map(k=>EPIS.find(E=>E.k===k).n),e.t].filter(Boolean).join(" / "),d.m,d.s];})));
   if(hl.length)L.push(`保留:${hl.join("、")}`);
   L.push("## お守りの文章(アファメーション)",quoteMd(S.f.affirm));return L;},
  html(){const list=m2List(),hl=effRank().filter(held);
   return `<h3>感情が動いた出来事</h3>${EPIS.map(E=>`<div class="rp-box"><b>${esc(E.n)}</b> <span class="small">${esc(E.clue)}</span>${rpText(S.f[E.k])}</div>`).join("")}
   <h3>トップ5の検証</h3><table><tr><th>価値</th><th>判定</th><th>裏づける出来事</th><th>私にとっての意味 / 満たされている状態</th></tr>${list.map((c,i)=>{const e=S.ev[c]||{},d=S.def[c]||{};return `<tr><td><b>${i+1}. ${esc(c)}</b></td><td>${esc(evVerdict(c).l)}</td><td>${esc([...(e.src||[]).filter(epText).map(k=>EPIS.find(E=>E.k===k).n),e.t].filter(Boolean).join(" / ")||"—")}</td><td>${esc(d.m||"—")}<br><span class="small">${esc(d.s||"")}</span></td></tr>`;}).join("")}</table>
   ${hl.length?`<p>保留:${esc(hl.join("、"))}</p>`:""}<h3>お守りの文章(アファメーション)</h3>${rpText(S.f.affirm)}`;}},
 m3:{title:"自己認識チェックの結果",file:"自己認識チェック",
  md(){const R=selfScore();if(!R)return["(まだ結果がありません)"];const T=SELF_T[R.type];
   return[`## タイプ:${T.n}`,[`- 自分の内面の理解:${R.inn.toFixed(1)} / 5`,`- 周りからの見え方の理解:${R.ex.toFixed(1)} / 5`,`- ${T.d}`,`- アドバイス:${T.tip}`].join("\n"),
    "## 回答",mdTable(["質問","種類","回答"],SELF_Q.map((q,i)=>[q.q,q.t==="in"?"内面":"見え方",LIKERT[5-S.m3[i]]])),
    "## 身近な人に聞く5つの質問",ASK5.map((q,i)=>`${i+1}. ${q}`).join("\n"),"## もらった答えのメモ",quoteMd(S.f.feedback)];},
  html(){const R=selfScore();if(!R)return `<p>(まだ結果がありません)</p>`;const T=SELF_T[R.type];
   return `<div class="rp-char">${myChar(T.e,150)}<div><h2>${esc(T.n)}</h2><p style="margin:4px 0">${esc(T.d)}</p><p class="small" style="margin:0">自分の内面の理解 ${R.inn.toFixed(1)} / 周りからの見え方の理解 ${R.ex.toFixed(1)}(5点満点)</p></div></div>
   <div class="rp-box" style="background:#FFF2C2"><b>アドバイス</b><p style="margin:2px 0 0">${esc(T.tip)}</p></div>
   <h3>「なぜ?」を「何を?」に言い換える</h3><table>${WHY_WHAT.map(([a,b])=>`<tr><td>${esc(a)}</td><td><b>${esc(b)}</b></td></tr>`).join("")}</table>
   <h3>身近な人に聞く5つの質問</h3><ol>${ASK5.map(q=>`<li>${esc(q)}</li>`).join("")}</ol><h3>もらった答えのメモ</h3>${rpText(S.f.feedback)}`;}},
 m4:{title:"ギャップ診断の結果",file:"ギャップ診断",
  md(){if(!S.done.m4)return["(まだ結果がありません)"];return["## 大切さと今の満たされ方(0〜10)",mdTable(["価値","大切さ","今の満たされ方","差","今週できる小さな行動"],m4Rows().map(r=>[r.c,r.g[0],r.g[1],r.g[0]-r.g[1],r.g[2]]))];},
  html(){if(!S.done.m4)return `<p>(まだ結果がありません)</p>`;return `<table><tr><th>価値</th><th>大切さ</th><th>今の満たされ方</th><th>差</th><th>今週できる小さな行動</th></tr>${m4Rows().map(r=>`<tr><td><b>${esc(r.c)}</b></td><td>${r.g[0]}</td><td>${r.g[1]}</td><td><b>${r.g[0]-r.g[1]}</b></td><td>${esc(r.g[2]||"—")}</td></tr>`).join("")}</table><p class="small">差が大きい価値は、今の環境で満たされにくい価値。職場選びで特に重視する。</p>`;}},
 m5:{title:"地雷センサーの結果",file:"地雷センサー",
  md(){return["## NG条件リスト",m5NG().map(x=>`- ${x}`).join("\n")||"(なし)","## 7つの地雷への答え",mdTable(["地雷","内容","あなたの答え"],MINES.map((M,i)=>[M.n,M.d,S.m5.mines[i]==null?"未回答":MINE_OPT[2-S.m5.mines[i]]])),
   `## 残業のものさし\n- 許容できる上限:${S.m5.ot!=null?`月${S.m5.ot}時間`:"未回答"}`,"## 応募前・面接中に使うチェックリスト",REDFLAGS.map(x=>`- [ ] ${x}`).join("\n")];},
  html(){return `<h3>NG条件リスト</h3><p>${m5NG().map(x=>`<b>× ${esc(x)}</b>`).join("  ")||"(なし)"}</p><h3>7つの地雷への答え</h3><table><tr><th>地雷</th><th>根拠</th><th>あなたの答え</th></tr>${MINES.map((M,i)=>`<tr><td><b>${esc(M.n)}</b><br><span class="small">${esc(M.d)}</span></td><td>${esc(M.risk)}</td><td>${S.m5.mines[i]==null?"未回答":esc(MINE_OPT[2-S.m5.mines[i]])}</td></tr>`).join("")}</table>
   <h3>残業のものさし</h3><p>許容できる上限:<b>${S.m5.ot!=null?`月${S.m5.ot}時間`:"未回答"}</b>(原則の上限は月45時間、過労死ラインは月80時間)</p><h3>応募前・面接中に使うチェックリスト</h3><ul>${REDFLAGS.map(x=>`<li>☐ ${esc(x)}</li>`).join("")}</ul>`;}},
 m6:{title:"理想の職場プロフィール",file:"理想の職場",
  md(){const L=m6Lists(),code=riCode();return["## 条件",[`- 必須:${L.must.map(C=>C.n).join("、")||"なし"}`,`- 歓迎:${L.want.map(C=>C.n).join("、")||"なし"}`,`- NG:${L.ng.map(C=>C.n).concat(S.done.m5?m5NG():[]).join("、")||"なし"}`].join("\n"),
   "## 条件の確かめ方",mdTable(["区分","条件","確かめる事実"],L.must.concat(L.want).map(C=>[S.m6.c[C.id]===3?"必須":"歓迎",C.n,C.chk])),
   `## 興味のタイプ\n- コード:${code||"(なし)"}${code?"\n"+code.split("").map(k=>`- ${k} ${HEX[k][0]}:${HEX[k][1]}(文系の例:${HEX[k][2]} / 理系の例:${HEX[k][3]})`).join("\n"):""}`];},
  html(){const L=m6Lists(),code=riCode();return `<div class="rp-box"><p style="margin:0"><b>◎ 必須:</b>${esc(L.must.map(C=>C.n).join("、")||"なし")}</p><p style="margin:4px 0 0"><b>○ 歓迎:</b>${esc(L.want.map(C=>C.n).join("、")||"なし")}</p><p style="margin:4px 0 0"><b>× NG:</b>${esc(L.ng.map(C=>C.n).concat(S.done.m5?m5NG():[]).join("、")||"なし")}</p></div>
   <h3>条件の確かめ方</h3><table><tr><th>区分</th><th>条件</th><th>確かめる事実</th></tr>${L.must.concat(L.want).map(C=>`<tr><td>${S.m6.c[C.id]===3?"必須":"歓迎"}</td><td><b>${esc(C.n)}</b></td><td>${esc(C.chk)}</td></tr>`).join("")}</table>
   <h3>興味のタイプ ${esc(code)}</h3><div style="display:grid;grid-template-columns:240px 1fr;gap:12px;align-items:center;break-inside:avoid"><div>${hexSVG()}</div><div>${code.split("").map(k=>`<p style="margin:4px 0"><b>${k} ${HEX[k][0]}</b>:${esc(HEX[k][1])}<br><span class="small">文系:${esc(HEX[k][2])} / 理系:${esc(HEX[k][3])}</span></p>`).join("")}</div></div>`;}},
 m7:{title:"企業マッチ度の結果",file:"企業マッチ度",
  md(){const R=m7Results(),ax=scoreAxes();if(!R.res.length)return["(まだ採点した会社がありません)"];
   return[mdTable(["評価軸","重み",...R.res.map(r=>r.c.n)],ax.map(a=>[a.l,a.w,...R.res.map(r=>(r.c.m7.s[a.k]||3)+(r.c.m7.note[a.k]?`(${r.c.m7.note[a.k]})`:""))]).concat([["NG条件に当てはまる","—",...R.res.map(r=>r.ng?"当てはまる(除外)":"—")],["必須条件をすべて満たす","—",...R.res.map(r=>r.must?"満たす":"未確認")],["合計(重み×点数)","—",...R.res.map(r=>`${r.s}/${r.m}`)]])),`**判定:**${R.msg}`];},
  html(){const R=m7Results(),ax=scoreAxes();if(!R.res.length)return `<p>(まだ採点した会社がありません)</p>`;
   return `<table><tr><th>評価軸</th><th>重み</th>${R.res.map(r=>`<th>${esc(r.c.n)}</th>`).join("")}</tr>${ax.map(a=>`<tr><td>${esc(a.l)}</td><td>${a.w}</td>${R.res.map(r=>`<td><b>${r.c.m7.s[a.k]||3}</b>${r.c.m7.note[a.k]?`<br><span class="small">${esc(r.c.m7.note[a.k])}</span>`:""}</td>`).join("")}</tr>`).join("")}
   <tr><td>NG条件</td><td></td>${R.res.map(r=>`<td>${r.ng?"当てはまる(除外)":"—"}</td>`).join("")}</tr><tr><td>必須条件</td><td></td>${R.res.map(r=>`<td>${r.must?"満たす":"未確認"}</td>`).join("")}</tr><tr><td><b>合計</b></td><td></td>${R.res.map(r=>`<td><b>${r.s}</b> / ${r.m}</td>`).join("")}</tr></table>
   <div class="rp-box"><b>判定:</b>${esc(R.msg)}</div>`;}},
 m8:{title:"1社検証の結果",file:"1社検証",
  md(){const c=coById(S.m8cur);if(!c||!c.verdict)return["(まだ結果がありません)"];const B=m8Of(c),V=m8Verdict(c),t=top5(),imp=selfImp();
   return[`## ${c.n}:${VERDICT[V.k].l}`,V.why+(V.notes.length?"\n\n"+V.notes.map(n=>`- ${n}`).join("\n"):""),
    "## B0 惹かれている理由",B0.map((g,gi)=>`- ${B0G[gi][0]}:${g.filter((x,ti)=>B.b0.includes(gi+"-"+ti)).join("、")||"なし"}`).join("\n"),
    "## B1 7つの地雷",mdTable(["地雷","判定"],MINES.map((M,k)=>[M.n,B.mines[k]===2?"あり":B.mines[k]===0?"なし":"不明"])),
    "## B2 12の軸(1〜5、根拠がなければ3)",mdTable(["軸","点数"],AX.map((x,k)=>[`${k+1} ${x.n}`,B.ax[k]])),
    "## B3 トップ5が満たされる事実",t.map((v,k)=>{const o=B.b3[v]||{};return `${k+1}. ${v}(${o.ok?"事実で書けた":"未確認"}):${o.t||"(未記入)"}`;}).join("\n"),
    "## B4 あなたと会社の価値のずれ",mdTable(["価値","あなた","会社","差"],VALS.map(v=>{const co=B.b4[v.n]||3;return[v.n,imp[v.n],co,(co-imp[v.n]>0?"+":"")+(co-imp[v.n])];})),
    "## B5 3年後に後悔するとしたら",quoteMd(B.pre),"## B6 親友へのアドバイス",quoteMd(B.friend),"## 次に聞くこと",m8Asks(c).map(q=>`- ${q}`).join("\n")||"(なし)"];},
  html(){const c=coById(S.m8cur);if(!c||!c.verdict)return `<p>(まだ結果がありません)</p>`;const B=m8Of(c),V=m8Verdict(c),t=top5(),imp=selfImp();
   return `<div class="rp-char">${myChar(VERDICT[V.k].e,120)}<div><h2>${esc(c.n)}</h2><p style="margin:2px 0"><b>${esc(VERDICT[V.k].l)}</b></p><p class="small" style="margin:0">${esc(V.why)}</p></div></div>
   <h3>B1 7つの地雷</h3><p>${MINES.map((M,k)=>`${esc(M.n)}:<b>${B.mines[k]===2?"あり":B.mines[k]===0?"なし":"不明"}</b>`).join(" / ")}</p>
   <h3>B2 12の軸</h3><table>${AX.map((x,k)=>`<tr><td>${k+1} ${esc(x.n)}</td><td><b>${B.ax[k]}</b></td></tr>`).join("")}</table>
   <h3>B3 トップ5が満たされる事実</h3><table>${t.map((v,k)=>{const o=B.b3[v]||{};return `<tr><td><b>${k+1}. ${esc(v)}</b></td><td>${esc(o.t||"(未記入)")}</td><td>${o.ok?"○":"×"}</td></tr>`;}).join("")}</table>
   <h3>B4 価値のずれ(会社−あなた)</h3><p>${VALS.map(v=>{const d=(B.b4[v.n]||3)-imp[v.n];return `${esc(v.n)} <b>${d>0?"+":""}${d}</b>`;}).join(" / ")}</p>
   <h3>B5 3年後に後悔するとしたら</h3>${rpText(B.pre)}<h3>B6 親友へのアドバイス</h3>${rpText(B.friend)}
   <h3>次に聞くこと</h3><ol>${m8Asks(c).map(q=>`<li>${esc(q)}</li>`).join("")}</ol>`;}}};
const fileBase=k=>k==="all"?("価値観マップ_最終レポート_"+today()).replace(/[\\/:*?"<>|\s]+/g,"_"):(SEC[k].file+(k==="m8"&&coById(S.m8cur)?"_"+coById(S.m8cur).n:"")+"_"+today()).replace(/[\\/:*?"<>|\s]+/g,"_").slice(0,80);
const doneSecs=()=>Object.keys(SEC).filter(k=>S.done[k]&&(k!=="m8"||S.cos.some(c=>c.verdict)));
function buildMD(k){if(k==="all"){const L=[`# 価値観マップ 最終レポート`,`> 出力日:${today()} / 価値観マップ診断`];
  doneSecs().forEach(s=>{if(s==="m8")S.cos.filter(c=>c.verdict).forEach(c=>{S.m8cur=c.id;L.push(`# ${SEC.m8.title}:${c.n}`,...SEC.m8.md().map(x=>x.replace(/^## /gm,"### ")));});
   else L.push(`# ${SEC[s].title}`,...SEC[s].md().map(x=>x.replace(/^## /gm,"### ")));});
  L.push("# 次の一手",nextSteps().map((x,i)=>`${i+1}. ${x.t}`).join("\n"));return L.join("\n\n")+"\n";}
 return[`# ${SEC[k].title}`,`> 出力日:${today()} / 価値観マップ診断`,...SEC[k].md()].join("\n\n")+"\n";}
function buildReport(k){if(k==="all"){let h=`<header class="rp-head"><h1>価値観マップ 最終レポート</h1><p class="small" style="margin:0">出力日 ${today()} ・ 価値観マップ診断</p></header>`;
  doneSecs().forEach(s=>{if(s==="m8")S.cos.filter(c=>c.verdict).forEach(c=>{S.m8cur=c.id;h+=`<section class="rp-sec rp-page"><h2>${esc(SEC.m8.title)}:${esc(c.n)}</h2>${SEC.m8.html()}</section>`;});
   else h+=`<section class="rp-sec rp-page"><h2>${esc(SEC[s].title)}</h2>${SEC[s].html()}</section>`;});
  return h+`<section class="rp-sec"><h2>次の一手</h2><ol>${nextSteps().map(x=>`<li>${esc(x.t)}</li>`).join("")}</ol></section>`;}
 return `<header class="rp-head"><h1>${esc(SEC[k].title)}</h1><p class="small" style="margin:0">出力日 ${today()} ・ 価値観マップ診断</p></header><section class="rp-sec">${SEC[k].html()}</section>`;}
let saveKey="m1",reportMode=false,titleBak=null,scrollBak=0;
const dlg=$("#saveDlg");
const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const RP_HINT=!isIOS?"「印刷・PDFに保存」を押し、送信先(プリンター)で「PDFに保存」を選んでください。"
 :/CriOS|FxiOS|EdgiOS|GSA\//.test(navigator.userAgent)?"印刷画面が開かないときは、ブラウザの共有ボタン(□に↑)から「プリント」を選んでください。プリントオプション上部の共有ボタンから「\"ファイル\"に保存」でPDFになります。"
 :"「印刷・PDFに保存」→ プリントオプション上部の共有ボタン(□に↑)→「\"ファイル\"に保存」でPDFになります。";
function openSave(k){saveKey=k;$("#saveTitle").textContent=`「${k==="all"?"最終レポート(すべての結果)":SEC[k].title}」を保存`;$("#saveChoose").hidden=false;$("#saveText").hidden=true;$("#mdMsg").textContent="";
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
