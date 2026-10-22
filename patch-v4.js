/* ===== Lilin Joglo v4: Bab + misi berbeda tiap bab, Ratu Joglo, audio, performa (GANTI patch lama) =====
   Tempel di akhir script game. */
(()=>{
const CH=[['Bab 1: Pintu Terkunci','Kamu terkunci di joglo tua. Kumpulkan lilin dan kunci untuk keluar.'],['Bab 2: Amarah Arwah','Lantai dua. Genderuwo dan Tuyul ikut berburu, hantu makin marah.'],['Bab 3: Yang Tak Terlihat','Lantai tiga. Sundel Bolong hanya tampak di bawah sorot senter.'],['Bab 4: Ratu Joglo','Penguasa joglo bangkit. Nyalakan 8 lilin untuk melemahkannya, lalu kabur.']];
const TINT=['232,163,61','60,140,80','150,20,20','110,40,160'];
let ch4=false,chF=0,bs=null,wn=0,bg=null,fpsE=60,lowT=0,gam=8;
const chMax=()=>{try{return +localStorage.getItem('lj_chap')||1}catch(e){return 1}};
const chSet=n=>{try{localStorage.setItem('lj_chap',Math.max(chMax(),n))}catch(e){}};

/* ---- UI bab ---- */
const sty=document.createElement('style');
sty.textContent='#chs{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}#chs button{font-size:14px;padding:8px 12px}#chs button:disabled{opacity:.35}#s.ps #chs{display:none}body{-webkit-touch-callout:none}';
document.head.appendChild(sty);
const chs=document.createElement('div');chs.id='chs';$('df').after(chs);
function refreshCh(){
  chs.innerHTML='';const m=chMax();
  CH.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c[0].split(':')[0]+(i+1>m?' (terkunci)':'');b.disabled=i+1>m;
    b.onclick=()=>{ch4=i===3;chF=1;start(i===3?3:i+1)};chs.appendChild(b)});
}
refreshCh();
$('ql').insertAdjacentHTML('beforeend','<option value="4">Sangat rendah</option>');
['gesturestart','contextmenu'].forEach(n=>document.addEventListener(n,e=>e.preventDefault()));

/* ---- sprite boss ---- */
const bsp=mk(72,120,c=>{
  c.fillStyle='#1a0a14';c.beginPath();c.ellipse(36,70,30,48,0,0,7);c.fill();c.fillRect(2,40,9,70);c.fillRect(61,40,9,70);
  c.fillStyle='#8a1414';c.fillRect(22,48,28,70);c.fillStyle='#e8a33d';c.fillRect(22,48,3,70);c.fillRect(47,48,3,70);
  c.fillStyle='#d8d0c0';c.beginPath();c.ellipse(36,28,13,17,0,0,7);c.fill();
  c.fillStyle='#050202';[30,42].forEach(x=>{c.beginPath();c.ellipse(x,28,3,5,0,0,7);c.fill()});c.beginPath();c.ellipse(36,40,3,5,0,0,7);c.fill();
  c.fillStyle='#f22';[30,42].forEach(x=>{c.beginPath();c.arc(x,29,1.5,0,7);c.fill()});
  c.fillStyle='#e8a33d';[18,27,36,45,54].forEach((x,i)=>c.fillRect(x-2,4+Math.abs(i-2)*3,4,10));
});

/* ---- audio ---- */
const chime=()=>[392,494,587,784].forEach((f,i)=>setTimeout(()=>tone(f,1.4,'sine',.12,f),i*220));
function amb(){
  if(!ac)return;
  if(!wn){
    const l=ac.sampleRate*2|0,b=ac.createBuffer(1,l,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<l;i++)d[i]=Math.random()*2-1;
    const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain(),o=ac.createOscillator(),og=ac.createGain();
    s.buffer=b;s.loop=true;f.type='lowpass';f.frequency.value=380;g.gain.value=.045;o.frequency.value=.13;og.gain.value=.025;
    o.connect(og).connect(g.gain);s.connect(f).connect(g).connect(mg);s.start();o.start();wn=1;
  }
  if(!bg){
    const o=ac.createOscillator(),f=ac.createBiquadFilter();o.type='sawtooth';o.frequency.value=41;f.type='lowpass';f.frequency.value=140;
    bg=ac.createGain();bg.gain.value=0;o.connect(f).connect(bg).connect(mg);o.start();
  }
}

/* ---- alur bab ---- */
const B0=begin;
begin=function(){
  if(state==='play'){ /* pindah lantai: tampilkan layar bab */
    chSet(lvl);refreshCh();
    state='chap';document.exitPointerLock?.();runB=false;joy=null;jo=null;lk=null;cv.style.filter='none';
    BT.forEach(i=>$(i).classList.add('hide'));
    $('t').textContent=CH[lvl-1][0];$('d').textContent=CH[lvl-1][1];$('k').textContent='';$('b').textContent='Mulai Bab '+lvl;
    $('s').classList.add('ps');$('s').classList.remove('hide');chime();return;
  }
  bs=null;B0();
  if(ch4)setupBoss();else if(lvl>1)say(CH[lvl-1][0],3500);
};
const bc=$('b').onclick;
$('b').onclick=()=>{
  if(state==='chap'){$('s').classList.remove('ps');B0();last=performance.now();return}
  bc();
};
const S0=start;
start=function(f){if(!chF)ch4=false;chF=0;S0(f)};

function setupBoss(){
  NEED=8;$('nn').textContent=8;
  const d=bfs(1,1),c=[];
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(g[y][x]===0&&d[y][x]>6&&!items.some(i=>(i.x|0)===x&&(i.y|0)===y))c.push([x,y,d[y][x]]);
  c.sort(()=>Math.random()-.5);
  items.push({x:c[0][0]+.5,y:c[0][1]+.5,k:'c'});
  const b=c.filter(a=>a[2]>14)[1]||c[1];
  bs={x:b[0]+.5,y:b[1]+.5,st:10,tp:18,rg:4,f:0,lit:false};
  say('Bab 4: Ratu Joglo mengintai. Nyalakan 8 lilin untuk melemahkannya',5000);chime();
}

const F0=finish;
finish=function(win,why){
  F0(win,why);
  if(bg)bg.gain.value=0;
  if(win){
    if(ch4){$('t').textContent='Ending: Ratu Joglo Tumbang';$('d').textContent='Ratu Joglo lenyap bersama cahaya lilin terakhir. '+$('d').textContent}
    else{chSet(4);$('k').textContent+=' Bab 4: Ratu Joglo terbuka!'}
  }
  refreshCh();
};

const J0=useJimat;
useJimat=function(){const j=jim;J0();if(ch4&&bs&&jim<j)bs.st=Math.max(bs.st,15)};
$('jb').onclick=useJimat;

/* ---- update: ambient, performa, boss ---- */
const U0=update;
update=function(dt){
  U0(dt);
  if(state!=='play'){if(bg)bg.gain.value=0;return}
  amb();
  fpsE=fpsE*.98+Math.min(60,1/Math.max(dt,.001))*.02;
  if(fpsE<26&&CW<4){lowT+=dt;if(lowT>4){lowT=0;fpsE=60;$('ql').value=String(Math.min(4,CW+1));applySet();say('Kualitas diturunkan agar lancar',2500)}}else lowT=0;
  if(lvl>=2){gam-=dt;if(gam<=0){gam=9+Math.random()*12;const f=[293,330,392,440,523][Math.random()*5|0];tone(f,3,'sine',.05,f*.99,Math.random()*1.6-.8);tone(f*2.4,1.6,'triangle',.015,f*2.4)}}
  if(!ch4||!bs){if(bg)bg.gain.value=0;return}
  const dx=pl.x-bs.x,dy=pl.y-bs.y,d=Math.hypot(dx,dy);
  bs.lit=fon&&bat>0&&blkOn<=0&&d<9&&angd(Math.atan2(-dy,-dx),pl.a)<.45&&los(pl.x,pl.y,bs.x,bs.y);
  bs.st-=dt;
  if(bs.st<=0)step(bs,(2.1+.1*lvl)*DM()*Math.max(.45,1-.07*got)*(bs.lit?.3:1)*dt);
  bs.tp-=dt;
  if(bs.tp<=0&&!bs.lit){
    bs.tp=16+Math.random()*8;
    const q=bfs(pl.x|0,pl.y|0),c=[];
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(g[y][x]===0&&q[y][x]>=7&&q[y][x]<=11)c.push([x,y]);
    const p=c[Math.random()*c.length|0];
    if(p){bs.x=p[0]+.5;bs.y=p[1]+.5;tone(70,.9,'sawtooth',.25,35);say('Ratu Joglo muncul dari kegelapan...',2500)}
  }
  bs.rg-=dt;if(bs.rg<=0){bs.rg=6+Math.random()*5;tone(120,1.2,'sawtooth',Math.min(.2,.8/(1+d*.5)),55,panOf(bs))}
  if(bg)bg.gain.value=Math.min(.16,.9/(1+d*d*.2));
  fear=Math.min(100,fear+Math.max(0,8-d)*.6*dt);
  const hit=f=>{scare(bs,f);if(state==='play'&&f)say('Ratu Joglo menerkammu! (sisa '+lives+' nyawa)',3000)};
  if(!hid&&jsT<=0&&d<.9)hit(scCd<=0);
  else if(hid&&d<1.2){bs.f+=dt*(peek?1.6:1);if(bs.f>3.5){bs.f=0;hit(scCd<=0)}}
  else bs.f=0;
};

/* ---- draw: warna bab + render boss ---- */
const D0=draw;
draw=function(){
  D0();
  if(state!=='play'||hid||jsT>0)return;
  ctx.globalAlpha=.06;ctx.fillStyle='rgb('+TINT[ch4?3:lvl-1]+')';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
  if(!ch4||!bs)return;
  const dX=Math.cos(pl.a),dY=Math.sin(pl.a),pk=Math.tan(FOV/2),pX=-dY*pk,pY=dX*pk,foc=W/(2*pk),inv=1/(pX*dY-dX*pY);
  const rx=bs.x-pl.x,ry=bs.y-pl.y,tx=inv*(dY*rx-dX*ry),ty=inv*(-pY*rx+pX*ry);
  if(ty<=.15)return;
  const hz=H/2+Math.sin(bob)*H*.012+pit*H,wh=foc/ty,sh=wh*1.05,sw=sh*bsp.width/bsp.height,sX=W/2*(1+tx/ty),top=hz+wh/2-sh,x0=sX-sw/2;
  ctx.globalAlpha=Math.min(1,lt(tx/ty,ty)*1.3+.2)*(bs.st>0?.6:1);
  const fl=(p,q)=>ctx.drawImage(bsp,(p-x0)/sw*bsp.width,0,(q-p)/sw*bsp.width,bsp.height,p,top,q-p,sh);
  const xs=Math.max(0,x0),xe=Math.min(W,x0+sw);let a=-1;
  for(let p=xs;p<xe;p+=CW){const v=zb[p/CW|0]>=ty;if(v&&a<0)a=p;if(!v&&a>=0){fl(a,p);a=-1}}
  if(a>=0)fl(a,xe);
  ctx.globalAlpha=1;
};

/* ---- v3: misi berbeda tiap bab ---- */
let mis=1,dawn=0,ar=[],sealed=0,cen=null,pg=4;
const mhE=document.createElement('div');
mhE.style.cssText='position:fixed;top:calc(env(safe-area-inset-top,0px) + 46px);left:50%;transform:translateX(-50%);font-size:15px;color:#e8a33d;text-shadow:0 0 6px #000;pointer-events:none;text-align:center;white-space:nowrap;display:none';
document.body.appendChild(mhE);
const aG=mk(32,56,c=>{c.fillStyle='#6a6a62';c.fillRect(6,24,20,32);c.beginPath();c.arc(16,14,10,0,7);c.fill();c.fillStyle='#050202';c.fillRect(11,12,3,4);c.fillRect(18,12,3,4);c.fillStyle='#4a4a44';c.fillRect(2,50,28,6)});
const aS=mk(32,56,c=>{c.drawImage(aG,0,0);c.globalCompositeOperation='source-atop';c.fillStyle='rgba(232,163,61,.7)';c.fillRect(0,0,32,56)});
const prog=()=>Math.max(0,...ar.filter(a=>!a.s).map(a=>a.p));
function mh(){
  if(mis===2){const s=Math.ceil(dawn);return dawn>0?'Bertahan hingga fajar '+(s/60|0)+':'+String(s%60).padStart(2,'0'):'Fajar tiba! Menuju pintu keluar'}
  if(mis===3)return sealed>=3?'Arca tersegel! Menuju pintu keluar':'Segel arca '+sealed+'/3'+(prog()>0?' ('+Math.round(prog()/3*100)+'%)':'');
  if(mis===4)return got<8?'Nyalakan lilin '+got+'/8':'Sorot Ratu Joglo '+Math.round(Math.min(1,((bs&&bs.ban)||0)/6)*100)+'%';
  return 'Lilin '+got+'/'+NEED+(key?' · Kunci ✓':' · Cari kunci');
}
const Sy=say;
say=function(s,ms){
  if(typeof s==='string'&&mis>1){
    if(s.startsWith('Pintu terkunci'))s='Misi belum selesai: '+mh();
    else if(mis===4&&s.startsWith('Semua lilin'))s='Ratu Joglo melemah! Sorot dia 6 detik dengan senter untuk mengusirnya';
  }
  Sy(s,ms);
};
function initMission(){
  mis=ch4?4:lvl;ar=[];sealed=0;dawn=0;pg=4;
  if(mis===2||mis===3)items=items.filter(i=>i.k!=='c'&&i.k!=='y');
  if(mis===4)items=items.filter(i=>i.k!=='y');
  if(mis===2){NEED=0;key=false;dawn=[100,120,150][dif];$('nn').textContent=0;Sy('Bab 2: Bertahan hingga fajar. Pintu terbuka saat subuh tiba',5000)}
  if(mis===3){
    NEED=0;key=false;$('nn').textContent=0;
    const d=bfs(1,1),c=[];
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(g[y][x]===0&&d[y][x]>8)c.push([x,y]);
    c.sort(()=>Math.random()-.5);ar=c.slice(0,3).map(([x,y])=>({x:x+.5,y:y+.5,s:0,p:0}));
    Sy('Bab 3: Sorot 3 arca dengan senter selama 3 detik untuk menyegelnya',5000);
  }
  if(mis===4)Sy('Bab 4: Nyalakan 8 lilin, lalu sorot Ratu Joglo 6 detik untuk mengusirnya',5000);
}
const U2=update;
update=function(dt){
  if(en!==cen){cen=en;initMission()}
  U2(dt);
  if(state!=='play')return;
  if(mis===2&&dawn>0){dawn-=dt;if(dawn<=0){key=true;say('Fajar menyingsing! Pintu keluar terbuka',4000);chime()}}
  if(mis===3&&sealed<3){
    const on=fon&&bat>0&&blkOn<=0&&!hid;
    ar.forEach(a=>{
      if(a.s)return;
      if(on&&Math.hypot(a.x-pl.x,a.y-pl.y)<.9){
        a.p+=dt;bat=Math.max(0,bat-4*dt);
        if(a.p>=3){a.s=1;sealed++;tone(660,1,'triangle',.25,990);say(sealed>=3?'Semua arca tersegel! Pintu keluar terbuka':'Arca disegel '+sealed+'/3',3500);if(sealed>=3){key=true;chime()}}
      }else a.p=Math.max(0,a.p-dt);
    });
    pg-=dt;
    if(pg<=0){pg=5;const u=ar.filter(a=>!a.s).sort((a,b)=>Math.hypot(a.x-pl.x,a.y-pl.y)-Math.hypot(b.x-pl.x,b.y-pl.y))[0];
      if(u)tone(660,.8,'sine',Math.min(.12,.5/(1+Math.hypot(u.x-pl.x,u.y-pl.y)*.4)),520,panOf(u))}
  }
  if(mis===4&&bs&&got>=8){
    bs.ban=bs.lit?(bs.ban||0)+dt:Math.max(0,(bs.ban||0)-dt*.5);
    if(bs.ban>=6){finish(true);return}
  }
  mhE.textContent=mh();
};
function bb(x,y,sp,hs){
  const dX=Math.cos(pl.a),dY=Math.sin(pl.a),pk=Math.tan(FOV/2),pX=-dY*pk,pY=dX*pk,foc=W/(2*pk),inv=1/(pX*dY-dX*pY),rx=x-pl.x,ry=y-pl.y,tx=inv*(dY*rx-dX*ry),ty=inv*(-pY*rx+pX*ry);
  if(ty<=.15)return;
  const hz=H/2+Math.sin(bob)*H*.012+pit*H,wh=foc/ty,sh=wh*hs,sw=sh*sp.width/sp.height,sX=W/2*(1+tx/ty),top=hz+wh/2-sh,x0=sX-sw/2;
  ctx.globalAlpha=Math.min(1,lt(tx/ty,ty)*1.3+.15);
  const fl=(p,q)=>ctx.drawImage(sp,(p-x0)/sw*sp.width,0,(q-p)/sw*sp.width,sp.height,p,top,q-p,sh);
  const xs=Math.max(0,x0),xe=Math.min(W,x0+sw);let a=-1;
  for(let p=xs;p<xe;p+=CW){const v=zb[p/CW|0]>=ty;if(v&&a<0)a=p;if(!v&&a>=0){fl(a,p);a=-1}}
  if(a>=0)fl(a,xe);ctx.globalAlpha=1;
}
const D2=draw;
draw=function(){
  D2();
  mhE.style.display=state==='play'?'':'none';
  if(state==='play'&&!hid&&jsT<=0)ar.forEach(a=>bb(a.x,a.y,a.s?aS:aG,.7));
};

/* ---- v4: menu utama + menu jeda (Lanjutkan, Pengaturan, Keluar) ---- */
const O={t:$('t').textContent,d:$('d').textContent,k:$('k').textContent};
const sty2=document.createElement('style');
sty2.textContent='#set{display:none}#set.on{display:flex}#xb{display:none}#s.ps #xb{display:inline-block}#pb{font-size:14px;padding:8px 14px}@media (max-height:480px){#s button{font-size:15px;padding:8px 18px}#s{gap:8px}}';
document.head.appendChild(sty2);
$('pb').textContent='☰ Menu';
const stb=document.createElement('button');stb.id='stb';stb.textContent='Pengaturan';
stb.onclick=()=>$('set').classList.toggle('on');
$('nb').before(stb);
const xb=document.createElement('button');xb.id='xb';xb.textContent='Keluar ke Menu Utama';
$('b').after(xb);
xb.onclick=()=>{
  state='menu';document.exitPointerLock?.();ac?.suspend?.();
  if(hg)hg.gain.value=0;if(bg)bg.gain.value=0;wlk?.release?.();wlk=null;
  runB=false;joy=null;jo=null;lk=null;cv.style.filter='none';ctx.clearRect(0,0,W,H);
  BT.forEach(i=>$(i).classList.add('hide'));mhE.style.display='none';
  $('t').textContent=O.t;$('d').textContent=O.d;$('k').textContent=O.k;$('b').textContent='Masuk rumah';
  $('s').classList.remove('ps','hide');$('set').classList.remove('on');cpBtn();refreshCh();
};
})();
