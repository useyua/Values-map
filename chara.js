/* 価値観キャラ(90体)と案内役「ほくと」をSVGで描く */
(function(){
"use strict";
// ===== キャラクター:動物10種(トップ1)×持ち物10種(トップ2)を組み合わせて描く =====
const INK="#26324B",BLUSH="#FF9EAA",WHITE="#FFFFFF";
const V=[
 {k:"自己志向",a:"ねこ",role:"開拓者",adj:"自分で決める",it:"たんけん",c:"#BFE0F5",d:"#8EC4EA",q:"open",g:"マイペースで好奇心旺盛。自分のやり方で道を切りひらく"},
 {k:"刺激",a:"うさぎ",role:"冒険家",adj:"新しもの好きの",it:"ひこうき",c:"#E4F0FB",d:"#B5D3EE",q:"open",g:"新しいことを見つけると、ぴょんと飛びこむ"},
 {k:"快楽",a:"くま",role:"楽しみ名人",adj:"毎日を楽しむ",it:"ドーナツ",c:"#FFD7B0",d:"#EFB27E",q:"hed",g:"おいしいものとお昼寝が好き。毎日をちゃんと味わう"},
 {k:"達成",a:"しば",role:"がんばり屋",adj:"結果にこだわる",it:"はちまき",c:"#FFC98A",d:"#E9A45A",q:"enh",g:"目標を決めたら一直線。ほめられるとしっぽが止まらない"},
 {k:"権力",a:"ライオン",role:"リーダー",adj:"みんなを引っぱる",it:"おうかん",c:"#FFE28C",d:"#F2B45E",q:"enh",g:"ふわふわのたてがみの、群れのまとめ役"},
 {k:"安全",a:"かめ",role:"守り手",adj:"安心を大事にする",it:"かさ",c:"#C3EAD2",d:"#84CBA2",q:"cons",g:"甲羅でみんなを守る。ゆっくりでも着実"},
 {k:"同調",a:"ペンギン",role:"気配り屋",adj:"和を大切にする",it:"リボン",c:"#AFC4DC",d:"#7E9ABB",q:"cons",g:"みんなと並んで歩くのが好き。礼儀正しい"},
 {k:"伝統",a:"ふくろう",role:"語り部",adj:"昔ながらを愛する",it:"おちゃ",c:"#D5E6B4",d:"#A9C782",q:"cons",g:"森に伝わる知恵を受け継ぎ、次へ手渡す"},
 {k:"慈善",a:"ひつじ",role:"世話焼き",adj:"身近な人を支える",it:"おはな",c:"#FFE2D8",d:"#F3B7A2",q:"trans",g:"ふわふわの毛で、身近な人を包みこむ"},
 {k:"普遍主義",a:"くじら",role:"理想家",adj:"社会を良くしたい",it:"ふたば",c:"#F7CAD3",d:"#E8A0B0",q:"trans",g:"広い海を泳ぎ、地球全体のことを考える"}];
// 性格:T[トップ1][トップ2]=長所と小さな弱点
const T=[
 ["","気になったら即出発。地図は持たない主義で、よく道草する","好きなことを好きなペースで。夢中になるとおやつを食べ忘れる","自分で決めた目標なら一直線。人に決められると急にやる気が消える","自分のやり方で場を動かしたい。任されると輝くけど、指図されるのは苦手","自由にやりたいけど傘は忘れない慎重派。冒険は晴れの日だけ","マイペースなのに空気も読める。気をつかいすぎて疲れる日もある","新しいやり方を考えつつ、お茶の時間だけは昔から変えない","ひとりの時間が好き。でも友だちが困っていたら真っ先に駆けつける","自分の頭で考えて、世の中を少し良くしたい。考えごとが長い"],
 ["気になるものを見つけたら、ぴょんと調べに行く。飽きるのも早い","","楽しいことならなんでも一番乗り。予定を詰めこみすぎがち","新しい挑戦で結果を出したい。ゴール直前で次の挑戦を見つけがち","新しい企画の先頭に立ちたい。走り出すのが速すぎて、みんなが追いつかない","ドキドキは好き、でも着地点は確保したい。ジャンプ前の準備が長い","みんなで行く冒険が好き。ひとりだけ先に跳ねないよう我慢している","古いものに新しい遊び方を見つける名人。どっちつかずと言われることも","仲間を新しい場所に連れ出すのが好き。はしゃぎすぎて置いていくことも","世界の知らない場所に行ってみたい。気になる社会問題が多すぎる"],
 ["好きなことをとことん味わう研究家。興味がないことには動かない","おいしい店と新しい体験を探す旅人。お財布がすぐ軽くなる","","ごほうびがあれば全力。ごほうびの計画を立てる時間が一番長い","みんなで楽しめる場を仕切るのが得意。自分の分のケーキは大きめ","のんびり安心できる毎日が一番。変化の多い日はお昼寝で回復","みんなが楽しいと自分もうれしい。食べたいものを言い出せない","季節の行事とおいしいものが大好き。いつものお店から浮気しない","おいしいものは分け合う派。人のおやつまで気にかける","自分も地球も心地よく。エコなおやつ探しに余念がない"],
 ["自分で立てた目標に一直線。やり方に口を出されるとしっぽが下がる","新しい挑戦で記録を更新したい。休むのを忘れがち","がんばったらちゃんとごほうび。ごほうびのためにがんばる日も","","勝ちにこだわるチームのエース。負けると3日くらい引きずる","確実に成果を積み上げるコツコツ派。大ばくちには乗らない","期待に応えるのが得意な優等生。期待されすぎると息切れする","決まった型を極める職人肌。新しいやり方に慣れるまで時間がかかる","仲間のためならいつも以上の力が出る。頼まれると断れない","社会の役に立つ成果を出したい。理想が高くて自分に厳しい"],
 ["自分の判断でみんなを動かしたい。人に任せるのが少し苦手","新しい群れを率いて知らない土地へ。準備より先に吠えてしまう","成功したらみんなでお祝い。パーティーの主役はだいたい自分","目標を掲げて先頭を走る。弱音を見せるのが苦手","","群れの安全を守る頼れるボス。心配性で見回りが多い","ルールを守って組織をまとめる。はみ出す仲間に少し厳しい","代々の群れを受け継ぐ若きリーダー。先代のやり方をなかなか変えない","仲間を守るために強くなりたい。照れて優しさを隠しがち","影響力を社会のために使いたい。背負いすぎて眠れない夜も"],
 ["自分のペースを守れる場所が安心。急かされると甲羅にこもる","たまには遠くへ行きたい慎重派。旅行の準備は1か月前から","穏やかな毎日と小さなおやつが幸せ。予定外のお出かけは少し苦手","ゆっくりでも確実にゴールへ。うさぎに勝った話を今でもする","みんなの暮らしを守る長老候補。決めるまでに時間がかかる","","約束と決まりを守る安心感のかたまり。急な予定変更にびっくりする","いつもの道、いつもの味。長く続くものを信じている","身近な人が安心して暮らせるよう見守る。心配しすぎて首が伸びる","海と地球の未来を守りたい。ニュースを見て甲羅にこもる日も"],
 ["列に並びつつ、自分なりの工夫を考えている。目立つのは苦手","飛べないけど空にあこがれる。みんなで行けるなら冒険も平気","みんなとおやつを囲む時間が好き。最後の1個は必ず譲る","期待に応えて着実に結果を出す。失敗すると誰よりも落ち込む","ルールを整えて群れをまとめる委員長タイプ。遅刻に厳しい","決まりと備えがあれば安心。折りたたみ傘を2本持っている","","礼儀と習わしを大切にする。敬語が完ぺき","みんなが気持ちよく過ごせるよう気を配る。自分のことは後回し","決まりを守ることで世界を良くしたい。ポイ捨てを見るとしょんぼり"],
 ["古い知恵を自分なりに調べ直す研究者。つい夜ふかしする","伝統を背負って世界へ飛ぶ。旅先でもいつものお茶を探す","老舗の和菓子めぐりが生きがい。新作より定番派","受け継いだ技を磨いて一人前になりたい。修業中はストイック","森の知恵袋として頼られたい。昔話が少し長い","昔からのやり方が一番安心。新しい道具の説明書は3回読む","礼儀正しく、場のしきたりを大切にする。くだけた場は少し緊張","","家族や地域を大事にする世話役。季節の贈りものを欠かさない","昔の人の知恵で未来を守りたい。森の木を一本ずつ数えている"],
 ["人の役に立つ方法を自分で考える。ひとりで抱えこみがち","仲間と新しいことに挑戦するのが好き。はしゃいだあとは毛がぼさぼさ","みんなでおいしいものを食べる会の主催者。自分が一番楽しんでいる","仲間のために結果を出したい。がんばりすぎてもこもこが縮む","優しさでチームを引っぱる。叱るのが本当に苦手","大事な人に傘を差し出すタイプ。自分が濡れていても気づかない","場の空気をあたためる名人。人に合わせすぎて迷子になる","家族の行事と手作りを大切にする。おすそ分けが多すぎる","","身近な人も、遠くの誰かも大切にしたい。優しさの予定がいっぱい"],
 ["広い海を自分の目で確かめたい。考えが深すぎて浮かんでくるのに時間がかかる","世界中の海を旅して、知らない誰かとつながりたい。帰る日を決めていない","みんなで楽しめる世界がいい。大きな口で幸せをほおばる","世の中を変える成果を出したい。理想と現実の差にしょんぼりする","大きな力でみんなを守りたい。責任を背負いこんで沈みがち","みんなが安心して泳げる海を守る。心配ごとが海より深い","公平なルールでみんなが暮らせるように。ずるを見ると潮をふく","昔からの海の知恵を未来へ手渡したい。長い歌を歌いがち","遠くの誰かも身近な仲間も包みこむ。やさしさの容量が大きい",""]];
const OPP={open:["cons"],cons:["open","hed"],enh:["trans"],trans:["enh","hed"],hed:["cons","trans"]};
const yure=(i,j)=>OPP[V[i].q].includes(V[j].q);
const S=(d,f,w)=>`<path d="${d}" fill="${f||"none"}" stroke="${INK}" stroke-width="${w||3}" stroke-linejoin="round" stroke-linecap="round"/>`;
const F=(d,f)=>`<path d="${d}" fill="${f}"/>`;
const n=x=>Math.round(x*10)/10;
const E=(x,y,rx,ry,f,rot,w)=>`<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rx)}" ry="${n(ry)}" fill="${f}"${w===0?"":` stroke="${INK}" stroke-width="${w||2.6}"`}${rot?` transform="rotate(${rot} ${n(x)} ${n(y)})"`:""}/>`;
const THICK=(d,c,w)=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w+5}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const tone=(svg,c)=>svg.replace(`stroke="${INK}"`,`stroke="${c}"`);
// 顔:表情ごとに目・口・まゆ・ほっぺを変える
function face(e,o){o=Object.assign({cx:60,ey:76,dx:14,my:86,es:1,beak:false},o||{});const L=o.cx-o.dx,R=o.cx+o.dx,es=o.es;let s="";
 const shy=e==="shy",bo=shy?.9:.65;
 s+=E(L-8*es,o.ey+9*es,shy?8:6.5,shy?4.6:3.6,BLUSH,0,0).replace("/>",` opacity="${bo}"/>`)+E(R+8*es,o.ey+9*es,shy?8:6.5,shy?4.6:3.6,BLUSH,0,0).replace("/>",` opacity="${bo}"/>`);
 const dot=(x,y,r)=>`<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(3.4*r)}" ry="${n(4.2*r)}" fill="${INK}"/><circle cx="${n(x+1.3*r)}" cy="${n(y-1.7*r)}" r="${n(1.25*r)}" fill="${WHITE}"/>`;
 const arc=(x,y)=>S(`M${n(x-4*es)} ${n(y+1)} q${n(4*es)} ${n(-6*es)} ${n(8*es)} 0`,null,2.8);
 const e0=s.length;
 if(e==="happy"||e==="gentle"||e==="cheer")s+=arc(L,o.ey)+arc(R,o.ey);
 else if(e==="relax")s+=S(`M${n(L-4)} ${o.ey} h8 M${n(R-4)} ${o.ey} h8`,null,2.8);
 else if(e==="proud")s+=S(`M${n(L-4)} ${o.ey} q4 3.5 8 0 M${n(R-4)} ${o.ey} q4 3.5 8 0`,null,2.8);
 else if(e==="think")s+=dot(L+2,o.ey-1,es)+dot(R+2,o.ey-1,es);
 else if(e==="wow")s+=dot(L,o.ey,es*1.2)+dot(R,o.ey,es*1.2);
 else if(e==="curious")s+=dot(L,o.ey,es*.95)+dot(R,o.ey,es*1.25);
 else if(e==="sparkle")s+=dot(L,o.ey,es*1.1)+dot(R,o.ey,es*1.1)+`<circle cx="${n(L-1.4)}" cy="${n(o.ey+1.8)}" r=".9" fill="#fff"/><circle cx="${n(R-1.4)}" cy="${n(o.ey+1.8)}" r=".9" fill="#fff"/>`;
 else s+=dot(L,o.ey,es)+dot(R,o.ey,es);
 s=s.slice(0,e0)+`<g class="eyes">`+s.slice(e0)+`</g>`;
 if(e==="fired")s+=S(`M${n(L-5)} ${o.ey-9} l8 3 M${n(R+5)} ${o.ey-9} l-8 3`,null,2.6);
 if(e==="worry")s+=S(`M${n(L-5)} ${o.ey-9} l8 -2.5 M${n(R+5)} ${o.ey-9} l-8 -2.5`,null,2.4);
 const m=o.my,c=o.cx;
 if(o.beak){s+=S(`M${c-5} ${m-3} L${c+5} ${m-3} L${c} ${m+3}Z`,"#FFB547",2.2);}
 else if(e==="happy"||e==="excited"||e==="cheer")s+=S(`M${c-6} ${m-1} Q${c} ${m+8} ${c+6} ${m-1}Z`,"#F28B8B",2.4);
 else if(e==="wow"||e==="fired")s+=E(c,m+1,3.2,e==="fired"?3.4:4,"#F28B8B",0,2.2);
 else if(e==="curious")s+=E(c,m,2.2,2.6,"#F28B8B",0,2);
 else if(e==="worry")s+=S(`M${c-7} ${m+1} q3.5 -3 7 0 q3.5 3 7 0`,null,2.4);
 else if(e==="think")s+=S(`M${c-3} ${m} h7`,null,2.4);
 else if(e==="proud")s+=S(`M${c-7} ${m-1} q7 6 14 0`,null,2.4);
 else if(e==="shy"||e==="relax")s+=S(`M${c-3.5} ${m} q3.5 2.6 7 0`,null,2.4);
 else s+=S(`M${c-6} ${m-1} q3 3.4 6 0 q3 3.4 6 0`,null,2.4);
 return s;}
const K=0.5523;
function blob(cx,cy,W,h,Wt,Wb){const t=cy-h,b=cy+h;
 return `M${cx} ${n(t)} C${n(cx+K*Wt)} ${n(t)} ${n(cx+W)} ${n(cy-K*h)} ${n(cx+W)} ${n(cy)} C${n(cx+W)} ${n(cy+K*h)} ${n(cx+K*Wb*1.25)} ${n(b)} ${cx} ${n(b)} C${n(cx-K*Wb*1.25)} ${n(b)} ${n(cx-W)} ${n(cy+K*h)} ${n(cx-W)} ${n(cy)} C${n(cx-W)} ${n(cy-K*h)} ${n(cx-K*Wt)} ${n(t)} ${cx} ${n(t)}Z`;}
// 動物ごとの体の形(トップ1):幅・高さ・上下の丸み・目の位置と大きさ・足・腕
const BODY=[
 {W:37,h:36,cy:72,Wt:30,Wb:40,ey:77,dx:13,es:1,my:87,feet:"round",arm:"nub",head:28},
 {W:32,h:29,cy:79,Wt:33,Wb:35,ey:84,dx:12,es:.95,my:93,feet:"long",arm:"nub",head:6},
 {W:45,h:35,cy:73,Wt:42,Wb:47,ey:74,dx:10,es:.9,my:86,feet:"stubby",arm:"nub",head:30},
 {W:38,h:34,cy:74,Wt:33,Wb:38,ey:77,dx:13,es:1,my:87,feet:"paw",arm:"nub",head:30},
 {W:33,h:31,cy:77,Wt:33,Wb:34,ey:79,dx:12,es:.95,my:89,feet:"lion",arm:"nub",head:24},
 {W:30,h:26,cy:84,Wt:30,Wb:32,ey:85,dx:11,es:.95,my:94,feet:"turtle",arm:"flip",head:46},
 {W:32,h:42,cy:66,Wt:21,Wb:38,ey:67,dx:11,es:.95,my:76,feet:"flat",arm:"wing",head:24,beak:true,armDy:15},
 {W:37,h:37,cy:71,Wt:35,Wb:38,ey:70,dx:12,es:1.15,my:80,feet:"tiny",arm:"wing",head:24,beak:true,armDy:10},
 {W:42,h:31,cy:64,Wt:42,Wb:42,ey:68,dx:10,es:.9,my:78,feet:"stick",arm:"wool",head:24,wool:true,armDy:13},
 {W:48,h:29,cy:73,Wt:44,Wb:48,ey:77,dx:15,es:1,my:87,feet:"none",arm:"fin",head:40}];
// 持ち物ごとのポーズ(トップ2):表情、体の傾き、腕の位置[横位置(体の幅に対する割合), 縦位置, 角度]
const POSE=[
 {e:"curious",tilt:-6,aL:[-.98,14,35],aR:[.9,-6,30]},
 {e:"excited",tilt:7,lift:-8,aL:[-.98,4,55],aR:[.82,-26,15]},
 {e:"happy",tilt:0,aL:[-.52,20,-45],aR:[.52,20,45],hug:true},
 {e:"fired",tilt:0,aL:[-.95,-12,-32],aR:[.95,-12,32]},
 {e:"proud",tilt:0,aL:[-1.02,12,58],aR:[1.02,12,-58],scale:1.04},
 {e:"calm",tilt:-4,aL:[-.98,14,22],aR:[.72,-16,10]},
 {e:"gentle",tilt:-8,aL:[-.22,22,-65],aR:[.22,22,65]},
 {e:"relax",tilt:0,sit:true,aL:[-.36,16,-55],aR:[.36,16,55],hug:true},
 {e:"shy",tilt:6,aL:[-.95,14,28],aR:[.8,8,-72]},
 {e:"sparkle",tilt:0,aL:[-1.02,-2,-55],aR:[1.02,-2,55]}];
const REST={e:"normal",tilt:0,aL:[-.98,14,20],aR:[.98,14,-20]};
function feet(i,B,v,sit){const cx=60,b=B.cy+B.h,d=v.d;
 if(B.feet==="none")return "";
 if(sit&&B.feet!=="turtle")return E(cx-14,b-2,8,6.5,B.feet==="flat"||B.feet==="tiny"?"#FFB547":d,-10)+E(cx+14,b-2,8,6.5,B.feet==="flat"||B.feet==="tiny"?"#FFB547":d,10);
 switch(B.feet){
 case "round":return E(cx-12,b,7,4.5,d)+E(cx+12,b,7,4.5,d);
 case "long":return E(cx-14,b+1,10,4.6,d)+E(cx+14,b+1,10,4.6,d);
 case "stubby":return E(cx-16,b-1,9.5,6.5,d)+E(cx+16,b-1,9.5,6.5,d)+E(cx-16,b,4,2.6,"#FFF1E2",0,0)+E(cx+16,b,4,2.6,"#FFF1E2",0,0);
 case "paw":return E(cx-13,b,8,5,d)+E(cx+13,b,8,5,d)+S(`M${cx-15} ${b+1} v3 M${cx-11} ${b+1} v3 M${cx+11} ${b+1} v3 M${cx+15} ${b+1} v3`,null,1.6);
 case "lion":return E(cx-14,b,9,6,d)+E(cx+14,b,9,6,d);
 case "turtle":return E(cx-23,b+1,8,5.5,v.c)+E(cx+23,b+1,8,5.5,v.c);
 case "flat":return E(cx-12,b+1,10,4,"#FFB547",-12)+E(cx+12,b+1,10,4,"#FFB547",12);
 case "tiny":return E(cx-9,b+1,5.5,3.5,"#FFB547")+E(cx+9,b+1,5.5,3.5,"#FFB547");
 case "stick":return E(cx-14,b+14,7,8,d)+E(cx+14,b+14,7,8,d);}
 return "";}
function arm(B,v,p,yo){const x=60+p[0]*B.W,rot=p[2];let y=yo!=null?yo:B.cy+p[1]+(B.armDy||0);if(Math.abs(p[0])<.6)y=Math.max(y,B.my+12);
 if(B.wool&&B.armDy)y=Math.max(y,B.ey+10);
 if(B.arm==="wing")return E(x,y,6,14,v.d,rot);
 if(B.arm==="fin")return E(x,y+4,5,10,v.d,rot);
 if(B.arm==="flip")return E(x,y+6,7,9.5,v.c,rot);
 if(B.arm==="wool")return E(x,y,6.5,Math.abs(p[0])<.6?9.5:12,v.d,rot);
 return E(x,y,6,8.8,v.c,rot);}
function parts(i,B,v,headItem){const cx=60,cy=B.cy,W=B.W,h=B.h,t=cy-h,b=cy+h;let back="",deco="",after="";
 switch(i){
 case 0:back=S(`M${n(cx-W*.86)} ${t+18} L${n(cx-W*.78)} ${t-12} L${n(cx-W*.22)} ${t+3}Z`,v.c)+S(`M${n(cx+W*.86)} ${t+18} L${n(cx+W*.78)} ${t-12} L${n(cx+W*.22)} ${t+3}Z`,v.c)
   +F(`M${n(cx-W*.72)} ${t+11} L${n(cx-W*.68)} ${t-3} L${n(cx-W*.4)} ${t+5}Z`,"#FFC7CF")+F(`M${n(cx+W*.72)} ${t+11} L${n(cx+W*.68)} ${t-3} L${n(cx+W*.4)} ${t+5}Z`,"#FFC7CF")
   +THICK(`M${cx+W-6} ${b-10} C${cx+W+16} ${b-10} ${cx+W+18} ${b-34} ${cx+W+8} ${b-42}`,v.c,6);
   deco=tone(S(`M${cx-7} ${t+6} l2 6 M${cx} ${t+4} v7 M${cx+7} ${t+6} l-2 6`,null,2.6),v.d);break;
 case 1:back=S(`M${cx-15} ${t+8} C${cx-26} ${t-14} ${cx-22} ${t-40} ${cx-11} ${t-40} C${cx-1} ${t-40} ${cx-2} ${t-14} ${cx-5} ${t+6}Z`,v.c)+S(`M${cx+15} ${t+8} C${cx+30} ${t-8} ${cx+34} ${t-30} ${cx+25} ${t-34} C${cx+16} ${t-37} ${cx+10} ${t-12} ${cx+5} ${t+6}Z`,v.c)
   +F(`M${cx-13} ${t+2} C${cx-20} ${t-14} ${cx-18} ${t-32} ${cx-11} ${t-32} C${cx-5} ${t-32} ${cx-5} ${t-14} ${cx-7} ${t+2}Z`,"#FFD0D8")+F(`M${cx+13} ${t+2} C${cx+23} ${t-8} ${cx+27} ${t-24} ${cx+23} ${t-27} C${cx+18} ${t-29} ${cx+13} ${t-12} ${cx+8} ${t+2}Z`,"#FFD0D8");break;
 case 2:back=E(cx-W*.72,t+9,11.5,11.5,v.c,0,3)+E(cx+W*.72,t+9,11.5,11.5,v.c,0,3)+E(cx-W*.72,t+9,5.5,5.5,v.d,0,0)+E(cx+W*.72,t+9,5.5,5.5,v.d,0,0);
   deco=E(cx,b-11,18,10,"#FFE9D2",0,0)+E(cx,B.my-2,12.5,8.5,"#FFF1E2",0,0);break;
 case 3:back=S(`M${n(cx-W*.9)} ${t+20} L${n(cx-W*.72)} ${t-9} L${n(cx-W*.2)} ${t+5}Z`,v.d)+S(`M${n(cx+W*.9)} ${t+20} L${n(cx+W*.72)} ${t-9} L${n(cx+W*.2)} ${t+5}Z`,v.d)
   +THICK(`M${cx-W+6} ${b-12} c-16 -2 -20 -22 -8 -27 c9 -3 13 7 5 10`,v.c,6);
   deco=F(`M${cx-W} ${cy+6} C${cx-W+4} ${b-4} ${cx-18} ${b} ${cx} ${b} C${cx+18} ${b} ${cx+W-4} ${b-4} ${cx+W} ${cy+6} C${cx+W-12} ${cy+18} ${cx+12} ${cy+18} ${cx} ${cy+10} C${cx-12} ${cy+18} ${cx-W+12} ${cy+18} ${cx-W} ${cy+6}Z`,"#FFF6EA")+E(cx-13,B.ey-11,4.5,2.8,"#FFF6EA",0,0)+E(cx+13,B.ey-11,4.5,2.8,"#FFF6EA",0,0);break;
 case 4:{let m="";const R=W*1.3,my0=cy-7;for(let k=0;k<12;k++){const a=k*Math.PI/6;if(Math.sin(a)>.4)continue;m+=E(cx+R*Math.cos(a),my0+R*.8*Math.sin(a),12.5,12.5,v.d,0,3);}back=m+E(cx,my0,R,R*.8,v.d,0,0);break;}
 case 5:back=S(`M${cx-W-18} ${b-2} C${cx-W-18} ${cy-14} ${cx-26} ${t-8} ${cx} ${t-8} C${cx+26} ${t-8} ${cx+W+18} ${cy-14} ${cx+W+18} ${b-2}Z`,v.d)
   +S(`M${cx-W-8} ${cy} l9 -8 M${cx+W+8} ${cy} l-9 -8 M${cx-20} ${t-3} l4 7 M${cx+20} ${t-3} l-4 7`,null,2).replace('stroke-width="2"','stroke-width="2" opacity=".45"');break;
 case 6:deco=F(blob(cx,cy+9,W*.74,h*.76,W*.55,W*.72),WHITE);break;
 case 7:back=S(`M${n(cx-W*.8)} ${t+12} L${n(cx-W*.92)} ${t-10} L${n(cx-W*.3)} ${t+4}Z`,v.d)+S(`M${n(cx+W*.8)} ${t+12} L${n(cx+W*.92)} ${t-10} L${n(cx+W*.3)} ${t+4}Z`,v.d);
   deco=E(cx,B.ey+3,W*.74,h*.5,"#F6FAEC",0,0);after=tone(S(`M${cx-8} ${b-9} l3 3 l3 -3 M${cx+2} ${b-9} l3 3 l3 -3`,null,2),v.d);break;
 case 8:{let w="";for(let k=0;k<14;k++){const a=k*2*Math.PI/14;w+=E(cx+(W+2)*Math.cos(a),cy+(h+2)*Math.sin(a),11,11,"#FFF8F3",0,3);}back=w+E(cx,cy,W+2,h+2,"#FFF8F3",0,0);
   after=E(cx-W*.52,B.ey-5,9,4.5,v.d,-15)+E(cx+W*.52,B.ey-5,9,4.5,v.d,15)+`<ellipse cx="${cx}" cy="${B.ey+3}" rx="${n(W*.5)}" ry="${n(h*.62)}" fill="${v.c}" stroke="${INK}" stroke-width="3"/>`;
   if(!headItem)after+=E(cx-8,B.ey-17,7,7,"#FFF8F3",0,2.4)+E(cx+8,B.ey-17,7,7,"#FFF8F3",0,2.4)+E(cx,B.ey-21,8,8,"#FFF8F3",0,2.4);break;}
 case 9:back=S(`M${cx-W+4} ${b-8} C${cx-W-12} ${b-8} ${cx-W-20} ${b-20} ${cx-W-18} ${b-30} C${cx-W-10} ${b-24} ${cx-W-6} ${b-22} ${cx-W-2} ${b-22} C${cx-W-6} ${b-30} ${cx-W-4} ${b-40} ${cx-W+2} ${b-42} C${cx-W+6} ${b-30} ${cx-W+8} ${b-18} ${cx-W+4} ${b-8}Z`,v.d);
   deco=tone(S(`M${cx-22} ${b-8} q22 7 44 0 M${cx-14} ${b-3} q14 4 28 0`,null,2),v.d);
   if(!headItem)after=tone(S(`M${cx} ${t-2} V${t-15} M${cx} ${t-6} C${cx-2} ${t-12} ${cx-6} ${t-16} ${cx-11} ${t-18} M${cx} ${t-6} C${cx+2} ${t-12} ${cx+6} ${t-16} ${cx+11} ${t-18}`,null,3),"#6CB8EA")+E(cx-13,t-21,2.6,2.6,"#6CB8EA",0,0)+E(cx+13,t-21,2.6,2.6,"#6CB8EA",0,0);break;}
 return{back,deco,after};}
function hugY(j,B){return j===2?B.my+(B.beak?15:17):B.my+(B.beak?12:14);}
function itemSVG(j,B,hand,i){const cx=60,t=B.cy-B.h,top=i===8?B.cy-B.h-6:t;
 switch(j){
 case 0:{const x=hand.x+8,y=hand.y-13;return S(`M${n(hand.x)} ${n(hand.y)} L${n(x+4)} ${n(y+7)}`,null,5)+E(x,y,12.5,12.5,"#E8F6FF",0,3)+tone(S(`M${n(x-5)} ${n(y-3)} q3 -4 7 -3`,null,2),WHITE);}
 case 1:{const x=hand.x+6,y=hand.y-18;return S(`M${n(x-6)} ${n(y+6)} L${n(x+24)} ${n(y-8)} L${n(x+8)} ${n(y+18)} L${n(x+3)} ${n(y+8)}Z`,WHITE,2.6)+S(`M${n(x+3)} ${n(y+8)} L${n(x+24)} ${n(y-8)}`,null,2)+S(`M${n(x-22)} ${n(y+22)} q6 -6 12 -8 M${n(x-28)} ${n(y+12)} q6 -4 10 -6`,null,2.2).replace('stroke-width="2.2"','stroke-width="2.2" opacity=".4"');}
 case 2:{const y=hugY(2,B);return E(cx,y,13,13,"#F2B97E",0,2.8)+E(cx,y,9.8,9.8,"#FF9EB5",0,0)+E(cx,y,4.2,4.2,WHITE,0,2.2)+tone(S(`M${cx-8} ${n(y-7)} l2 1 M${cx+6} ${n(y-8)} l1 2 M${cx-9} ${n(y+5)} l2 -1 M${cx+7} ${n(y+6)} l2 1`,null,1.8),WHITE);}
 case 3:{const y=B.ey-18,w=(i===8?B.W*.52:B.W*.94);return S(`M${n(cx-w)} ${y+2} C${n(cx-w*.5)} ${y-6} ${n(cx+w*.5)} ${y-6} ${n(cx+w)} ${y+2} L${n(cx+w-1)} ${y+9} C${n(cx+w*.5)} ${y+1} ${n(cx-w*.5)} ${y+1} ${n(cx-w+1)} ${y+9}Z`,WHITE,2.6)+E(cx,y+1,4.3,4.3,"#FF6F5E",0,0)+S(`M${n(cx+w-1)} ${y+4} l13 -8 l-3 11Z M${n(cx+w-1)} ${y+6} l11 9 l-9 1Z`,WHITE,2.2);}
 case 4:{const y=top+4;return S(`M${cx-16} ${y} L${cx-14} ${y-18} L${cx-6} ${y-8} L${cx} ${y-23} L${cx+6} ${y-8} L${cx+14} ${y-18} L${cx+16} ${y}Z`,"#FFD34D",2.6)+E(cx,y-6,2.6,2.6,"#FF6F5E",0,0);}
 case 5:{const x=cx+8,y=Math.max(B.head-4,hand.y-34);return S(`M${n(hand.x)} ${n(hand.y)} L${x} ${y}`,null,3)+S(`M${x-32} ${y+4} Q${x} ${y-30} ${x+32} ${y+4} Q${x+26} ${y-1} ${x+21} ${y+4} Q${x+15} ${y-1} ${x+10} ${y+4} Q${x+5} ${y-1} ${x} ${y+4} Q${x-5} ${y-1} ${x-10} ${y+4} Q${x-15} ${y-1} ${x-21} ${y+4} Q${x-26} ${y-1} ${x-32} ${y+4}Z`,"#FFD65C",2.6)+E(x,y-22,2.4,2.4,INK,0,0);}
 case 6:{const x=cx+B.W*(i===8?.45:.58),y=top+(i===8?12:9);return S(`M${n(x)} ${y} L${n(x-12)} ${y-7} Q${n(x-16)} ${y} ${n(x-12)} ${y+7}Z`,"#FF8A7A",2.3)+S(`M${n(x)} ${y} L${n(x+12)} ${y-7} Q${n(x+16)} ${y} ${n(x+12)} ${y+7}Z`,"#FF8A7A",2.3)+E(x,y,3.8,3.8,"#FF6F5E",0,2.2);}
 case 7:{const y=hugY(7,B);return S(`M${cx-10} ${n(y-8)} h20 v10 q0 10 -10 10 q-10 0 -10 -10Z`,"#9ED9B6",2.6)+tone(S(`M${cx-10} ${n(y-2)} h20`,null,2),WHITE)+S(`M${cx+15} ${n(y-4)} q-3 -4 0 -8 M${cx+21} ${n(y-1)} q-3 -4 0 -8`,null,1.9).replace('stroke-width="1.9"','stroke-width="1.9" opacity=".45"');}
 case 8:{const x=hand.x+9,y=hand.y-6;let p="";for(let k=0;k<5;k++){const a=-Math.PI/2+k*2*Math.PI/5;p+=E(x+5.8*Math.cos(a),y+5.8*Math.sin(a),4.8,4.8,"#FF9EB5",0,1.7);}
   return tone(S(`M${n(hand.x)} ${n(hand.y+2)} L${n(x)} ${n(y)}`,null,3),"#3E9F6B")+p+E(x,y,3.3,3.3,"#FFD65C",0,1.6);}
 case 9:{const y=top;return tone(S(`M${cx} ${y+2} V${y-14}`,null,3),"#3E9F6B")+S(`M${cx} ${y-11} C${cx-8} ${y-22} ${cx-19} ${y-18} ${cx-17} ${y-11} C${cx-13} ${y-6} ${cx-5} ${y-6} ${cx} ${y-11}Z`,"#7AD39A",2.2)+S(`M${cx} ${y-11} C${cx+8} ${y-22} ${cx+19} ${y-18} ${cx+17} ${y-11} C${cx+13} ${y-6} ${cx+5} ${y-6} ${cx} ${y-11}Z`,"#7AD39A",2.2);}}
 return "";}
function charSVG(i,j,e,noItem){const v=V[i];let B=BODY[i];
 // ひこうき・はちまき・かさ(腕を上げるポーズ)は腕の付け根を下げない
 if(B.wool&&!noItem&&(j===1||j===3||j===5))B=Object.assign({},B,{armDy:0});const P=noItem?REST:POSE[j];const headItem=!noItem&&(j===4||j===9||j===6);
 const ex=e&&e!=="normal"?e:P.e;const A=parts(i,B,v,headItem);
 const cx=60,hand={x:cx+P.aR[0]*B.W,y:B.cy+P.aR[1]+(B.armDy||0)};if(B.wool&&B.armDy)hand.y=Math.max(hand.y,B.ey+10);
 let s=(B.wool&&!P.sit)?feet(i,B,v,P.sit)+A.back:A.back+feet(i,B,v,P.sit);
 if(!B.wool)s+=`<path d="${blob(cx,B.cy,B.W,B.h,B.Wt,B.Wb)}" fill="${v.c}"/>`+A.deco+`<path d="${blob(cx,B.cy,B.W,B.h,B.Wt,B.Wb)}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>`;
 s+=A.after+face(ex,{ey:B.ey,dx:B.dx,my:B.my,es:B.es,beak:B.beak});
 const it=noItem?"":itemSVG(j,B,hand,i);
 s+=P.hug?it+arm(B,v,P.aL,hugY(j,B)+2)+arm(B,v,P.aR,hugY(j,B)+2):arm(B,v,P.aL)+arm(B,v,P.aR)+it;
 if(ex==="sparkle"||ex==="excited")s+=S("M8 30 l3 -7 M14 36 l7 -2 M112 26 l-3 -7",null,2.4);
 if(ex==="fired")s+=S("M104 30 l5 -9 M110 38 l8 -4",null,2.6);
 if(ex==="worry")s+=S("M100 50 q5 7 0 10 q-5 -3 0 -10Z","#9FD3F2",2);
 const g=`translate(0 ${P.lift||0}) rotate(${P.tilt||0} 60 110)${P.scale?` translate(60 110) scale(${P.scale}) translate(-60 -110)`:""}`;
 const shadow=(P.lift||B.feet==="none")?`<ellipse cx="60" cy="118" rx="26" ry="4" fill="#26324B" opacity=".13"/>`:"";
 return `<svg viewBox="-18 -26 156 158" role="img" aria-label="${noItem?v.a:V[j].it+v.a}">${shadow}<g transform="${g}">${s}</g></svg>`;}

function mascotSVG(e){let s="";
 s+=S("M60 36 L67 21 L60 5 L53 21Z",WHITE,2.6)+S("M60 5 L67 21 L53 21Z","#FF6F5E",2.6);
 s+=`<ellipse cx="46" cy="110" rx="9" ry="5" fill="#E9B93C" stroke="${INK}" stroke-width="2.6"/><ellipse cx="74" cy="110" rx="9" ry="5" fill="#E9B93C" stroke="${INK}" stroke-width="2.6"/>`;
 const armL=e==="cheer"?`<ellipse cx="16" cy="56" rx="6.5" ry="9" fill="#FFD65C" stroke="${INK}" stroke-width="2.6" transform="rotate(-30 16 56)"/>`:`<ellipse cx="18" cy="86" rx="6.5" ry="9" fill="#FFD65C" stroke="${INK}" stroke-width="2.6" transform="rotate(20 18 86)"/>`;
 s+=armL;
 s+=`<circle cx="60" cy="72" r="41" fill="#FFD65C" stroke="${INK}" stroke-width="3.4"/><circle cx="60" cy="74" r="30" fill="${WHITE}" stroke="${INK}" stroke-width="2.6"/>`;
 s+=S("M60 47 v4 M60 97 v4 M33 74 h4 M83 74 h4",null,2.2).replace('stroke-width="2.2"','stroke-width="2.2" opacity=".35"');
 s+=face(e,{ey:73,dx:12,my:83});
 s+=S("M88 94 l19 -5 l3 15 l-19 5Z","#BFE0F5",2.4)+S("M97 91 l3 15",null,1.8)+`<ellipse cx="100" cy="90" rx="6.5" ry="9" fill="#FFD65C" stroke="${INK}" stroke-width="2.6" transform="rotate(-20 100 90)"/>`;
 if(e==="cheer")s+=S("M4 34 l4 -8 M10 40 l8 -3 M-2 44 l7 1",null,2.6);
 if(e==="think")s+=`<circle cx="100" cy="36" r="3" fill="${INK}"/><circle cx="109" cy="28" r="3.8" fill="${INK}"/><circle cx="118" cy="18" r="4.6" fill="${INK}"/>`;
 if(e==="wow")s+=S("M102 30 l4 -12 M112 38 l10 -6",null,3);
 return `<svg viewBox="-8 -2 136 124" role="img" aria-label="案内役のほくと">${s}</svg>`;}
function paint(root){(root||document).querySelectorAll(".cv").forEach(el=>{const w=el.dataset.w||80;el.style.width=w+"px";
 if(el.dataset.m)el.innerHTML=mascotSVG(el.dataset.m);
 else if(el.dataset.c){const m=el.dataset.c.match(/^(\d)-(\d)(x?)$/);if(m)el.innerHTML=charSVG(+m[1],+m[2],el.dataset.e||"normal",!!m[3]);}});}
window.Chara={V:V,T:T,OPP:OPP,yure:yure,charSVG:charSVG,mascotSVG:mascotSVG,paint:paint};
})();
