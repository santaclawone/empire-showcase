document.addEventListener('DOMContentLoaded',()=>{
'use strict';

const DESIGNS=['glassmorphism','bento','kinetic','mesh','scrollytelling','neobrutal','spatial','skeletal','organic','holographic'];
const THEMES=['minimalist','brutalist','glass','terminal','swiss','cyberpunk','editorial','mono','nature','bauhaus'];
const KEY_DESIGN='empire-design',KEY_THEME='empire-theme';
const body=document.body;
const designBtns=document.querySelectorAll('[data-type="design"]');
const themeBtns=document.querySelectorAll('[data-type="theme"]');
const currentDesignEl=document.querySelector('.switcher-current-design');
const currentThemeEl=document.querySelector('.switcher-current-theme');
const names={designs:{glassmorphism:'Glass 2.0',bento:'Bento',kinetic:'Kinetic',mesh:'Mesh',scrollytelling:'Scrolly',neobrutal:'Neo-Brutal',spatial:'Spatial',skeletal:'Skeletal',organic:'Organic',holographic:'Holographic'},themes:{minimalist:'Minimal',brutalist:'Brutal',glass:'Glass',terminal:'Terminal',swiss:'Swiss',cyberpunk:'Cyber',editorial:'Editorial',mono:'Mono',nature:'Nature',bauhaus:'Bauhaus'}};
let currentDesign=localStorage.getItem(KEY_DESIGN)||'glassmorphism';
let currentTheme=localStorage.getItem(KEY_THEME)||'minimalist';

const apply=(type,value,animate=true)=>{
  if(!animate)body.classList.add('switching');
  if(type==='design'){
    DESIGNS.forEach(d=>body.classList.remove('design-'+d));
    body.classList.add('design-'+value);currentDesign=value;
    localStorage.setItem(KEY_DESIGN,value);
    designBtns.forEach(b=>b.setAttribute('aria-selected',(b.dataset.value===value).toString()));
    if(currentDesignEl)currentDesignEl.textContent=names.designs[value]||value;
    document.dispatchEvent(new CustomEvent('designchange',{detail:{design:value}}));
  }else if(type==='theme'){
    THEMES.forEach(t=>body.classList.remove('theme-'+t));
    body.classList.add('theme-'+value);currentTheme=value;
    localStorage.setItem(KEY_THEME,value);
    themeBtns.forEach(b=>b.setAttribute('aria-selected',(b.dataset.value===value).toString()));
    if(currentThemeEl)currentThemeEl.textContent=names.themes[value]||value;
  }
  if(!animate)requestAnimationFrame(()=>body.classList.remove('switching'));
};

designBtns.forEach(b=>b.addEventListener('click',()=>apply('design',b.dataset.value)));
themeBtns.forEach(b=>b.addEventListener('click',()=>apply('theme',b.dataset.value)));
const switcher=document.querySelector('.switcher');
if(switcher){
  switcher.setAttribute('tabindex','0');
  switcher.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'){e.preventDefault();const idx=THEMES.indexOf(currentTheme);apply('theme',THEMES[(idx-1+THEMES.length)%THEMES.length])}
    if(e.key==='ArrowRight'){e.preventDefault();const idx=THEMES.indexOf(currentTheme);apply('theme',THEMES[(idx+1)%THEMES.length])}
    if(e.key==='ArrowUp'){e.preventDefault();const idx=DESIGNS.indexOf(currentDesign);apply('design',DESIGNS[(idx-1+DESIGNS.length)%DESIGNS.length])}
    if(e.key==='ArrowDown'){e.preventDefault();const idx=DESIGNS.indexOf(currentDesign);apply('design',DESIGNS[(idx+1)%DESIGNS.length])}
  });
}
apply('design',currentDesign,false);
apply('theme',currentTheme,false);

// ---- CURSOR ----
const cursor=document.querySelector('.cursor');
if(cursor){
  let cx=0,cy=0,mx=0,my=0,vis=!1;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;if(!vis){vis=!0;cursor.classList.add('visible')}});
  document.addEventListener('mouseleave',()=>{vis=!1;cursor.classList.remove('visible')});
  (function f(){cx+=(mx-cx)*.12;cy+=(my-cy)*.12;cursor.style.left=cx+'px';cursor.style.top=cy+'px';requestAnimationFrame(f)})();
  document.querySelectorAll('a,button,.agent-card,.map-card,.pipeline-step').forEach(el=>{
    el.addEventListener('mouseenter',()=>cursor.classList.add('active'));
    el.addEventListener('mouseleave',()=>cursor.classList.remove('active'));
  });
}

// ---- SCROLL REVEAL ----
const ro=new IntersectionObserver(e=>{e.forEach(e=>{if(e.isIntersecting){e.target.classList.add('reveal','revealed');ro.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -50px 0px'});
document.querySelectorAll('.hero-title,.pipeline-step,.agent-card,.map-card').forEach(e=>ro.observe(e));

// ---- COUNTER ----
const ce=document.getElementById('counter');
if(ce){let c=!1;new IntersectionObserver(e=>{e.forEach(e=>{if(e.isIntersecting&&!c){c=!0;let cur=0,st=Math.ceil(2026/60),i=setInterval(()=>{cur+=st;if(cur>=2026){cur=2026;clearInterval(i)}ce.textContent=String(cur).padStart(4,'0')},24)}})}).observe(ce)}

// ---- STATS ----
const stats=[{el:document.getElementById('stat-origins'),target:12},{el:document.getElementById('stat-roasts'),target:47},{el:document.getElementById('stat-countries'),target:3}].filter(s=>s.el);
const so=new IntersectionObserver(e=>{e.forEach(e=>{if(e.isIntersecting){const s=stats[parseInt(e.target.dataset.idx)];let cur=0,st=Math.max(1,Math.ceil(s.target/40)),i=setInterval(()=>{cur+=st;if(cur>=s.target){cur=s.target;clearInterval(i)}s.el.textContent=cur},20);so.unobserve(e.target)}})},{threshold:.5});
stats.forEach((s,i)=>{s.el.dataset.idx=i;so.observe(s.el)});

// ---- GYROSCOPE TILT (Glassmorphism) ----
if(window.DeviceOrientationEvent){
  window.addEventListener('deviceorientation',e=>{
    if(!body.classList.contains('design-glassmorphism'))return;
    const beta=e.beta||0,gamma=e.gamma||0;
    document.querySelectorAll('.map-card,.agent-card,.pipeline-step').forEach((c,i)=>{
      c.style.transform=`perspective(800px) rotateX(${beta*.015*(i%3+1)}deg) rotateY(${gamma*.02*(i%5+1)}deg)`;
    });
  },{passive:true});
}

// ---- SPRING PHYSICS (Glassmorphism card entry) ----
const springObserver=new IntersectionObserver(e=>{e.forEach(e=>{
  if(e.isIntersecting&&body.classList.contains('design-glassmorphism')){
    e.target.style.transition='transform .6s cubic-bezier(.34,1.56,.64,1),opacity .5s';
    e.target.style.transform='translateY(0)';e.target.style.opacity='1';
    springObserver.unobserve(e.target);
  }
})},{threshold:.05});
document.querySelectorAll('.design-glassmorphism .map-card,.design-glassmorphism .agent-card').forEach(c=>{
  c.style.transform='translateY(40px)';c.style.opacity='0';
  springObserver.observe(c);
});

// ---- KINETIC SCROLL-TIMELINE ----
let lastScrollY=0,scrollVelocity=0;
window.addEventListener('scroll',()=>{
  if(!body.classList.contains('design-kinetic'))return;
  scrollVelocity=Math.abs(window.scrollY-lastScrollY);
  lastScrollY=window.scrollY;
  const rot=Math.min(window.scrollY*.02,12);
  const weight=500+Math.min(scrollVelocity*2,400);
  document.querySelectorAll('.hero-title,.section-title').forEach(el=>{
    el.style.transform=`rotate(${rot}deg)`;
    el.style.fontVariationSettings=`'wght' ${weight}`;
  });
  document.querySelectorAll('.map-card-content h3').forEach(el=>{
    el.style.fontVariationSettings=`'wght' ${Math.min(400+scrollVelocity*3,800)}`;
  });
},{passive:true});

// ---- SCROLLYTELLING STAGES ----
document.addEventListener('designchange',()=>{
  if(body.classList.contains('design-scrollytelling')){
    const sections=[...document.querySelectorAll('.hero,.map,.agents,.pipeline,.contact')];
    sections.forEach((s,i)=>{
      s.style.setProperty('--stage-top',(i/sections.length*100)+'%');
      s.style.setProperty('--stage-bottom',((i+1)/sections.length*100)+'%');
    });
  }
});

// ---- NEO-BRUTAL HARD SHADOW ----
document.addEventListener('mousedown',e=>{
  const card=e.target.closest('.map-card,.agent-card,.pipeline-step');
  if(card&&body.classList.contains('design-neobrutal')){
    card.style.transition='box-shadow .05s step-end,transform .05s step-end';
    card.style.boxShadow='3px 3px 0 0 var(--accent)';
    card.style.transform='translate(3px,3px)';
    const up=()=>{
      card.style.boxShadow='8px 8px 0 0 var(--accent)';
      card.style.transform='translate(0,0)';
      document.removeEventListener('mouseup',up);
    };
    document.addEventListener('mouseup',up);
  }
});

// ---- ORGANIC LAZY-PARALLAX ----
let organicRAF=null;
window.addEventListener('scroll',()=>{
  if(!body.classList.contains('design-organic'))return;
  if(organicRAF)cancelAnimationFrame(organicRAF);
  organicRAF=requestAnimationFrame(()=>{
    const scrollY=window.scrollY*.15;
    document.querySelectorAll('.design-organic .map-card').forEach((c,i)=>{
      const lag=i*8;
      c.style.transform=`translateY(${scrollY+lag}px)`;
    });
  });
},{passive:true});

// ---- HOLOGRAPHIC MOUSE SHIMMER ----
document.addEventListener('mousemove',e=>{
  if(!body.classList.contains('design-holographic'))return;
  const x=e.clientX/window.innerWidth*100,y=e.clientY/window.innerHeight*100;
  document.querySelectorAll('.design-holographic .map-card::before,.design-holographic .agent-card::before').forEach(el=>{});
  document.querySelectorAll('.design-holographic .hero-title').forEach(el=>{
    el.style.backgroundPosition=`${x}% ${y}%`;
  });
});

// ---- HERO DOTS ----
if(!document.querySelector('.hero-dot')){
  const h=document.querySelector('.hero');
  if(h)for(let i=0;i<20;i++){const d=document.createElement('span');d.className='hero-dot';d.style.cssText=`top:${Math.random()*100}%;left:${Math.random()*100}%;opacity:${.2+Math.random()*.4};animation-delay:${Math.random()*4}s;animation-duration:${6+Math.random()*8}s;`;h.appendChild(d)}
}

// ---- REDUCED MOTION ----
if(window.matchMedia('(prefers-reduced-motion:reduce)').matches)document.querySelectorAll('.hero-dot').forEach(e=>e.remove());
});
