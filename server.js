/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║           TEEMIE THE VISA GIRLIE — Complete Website              ║
 * ║  All pages · Admin Dashboard · CMS · Zero npm dependencies       ║
 * ╠═══════════════════════════════════════════════════════════════════╣
 * ║  Run:   node server.js                                           ║
 * ║  Site:  http://localhost:3000                                     ║
 * ║  Admin: http://localhost:3000/admin  →  teemie / teemie2026      ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */
'use strict';
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const url    = require('url');

/* ─────────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────────── */
const PORT       = process.env.PORT       || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'teemie-visa-girlie-secret-2026';
const DATA_FILE  = process.env.DATA_FILE  || path.join(__dirname, 'site-data.json');

/* ─────────────────────────────────────────────────────────────────
   MINI AUTH  (pure crypto — no bcrypt needed)
───────────────────────────────────────────────────────────────── */
const hash  = pw  => crypto.createHmac('sha256', JWT_SECRET).update(pw).digest('hex');
const b64u  = buf => (Buffer.isBuffer(buf) ? buf : Buffer.from(buf)).toString('base64url');

function sign(payload) {
  const h = b64u(JSON.stringify({ alg:'HS256', typ:'JWT' }));
  const b = b64u(JSON.stringify({ ...payload, exp: Date.now() + 86_400_000 }));
  const s = b64u(crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${b}`).digest());
  return `${h}.${b}.${s}`;
}
function verify(token) {
  try {
    const [h,b,s] = (token||'').split('.');
    const ok = b64u(crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${b}`).digest());
    if (s !== ok) return null;
    const p = JSON.parse(Buffer.from(b,'base64url').toString());
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
}

/* ─────────────────────────────────────────────────────────────────
   DEFAULT CONTENT
───────────────────────────────────────────────────────────────── */
const DEFAULTS = {
  admin: { username:'teemie', password: hash('teemie2026') },
  global: {
    siteName:'Teemie The Visa Girlie', tagline:'Senior Travel Consultant',
    phone:'+2348101149438', whatsapp:'https://wa.me/2348101149438',
    email:'teemie@visagirlie.com', tiktok:'https://tiktok.com/@Teemiethevisagirlie',
    instagram:'https://instagram.com/teemiethevisagirlie', location:'Lagos, Nigeria'
  },
  home: {
    heroName:'Teemie', heroSubtitle:'The Visa Girlie',
    heroTagline:'Senior Travel Consultant · Lagos, Nigeria',
    heroBadge:'Available for Bookings',
    heroDescription:"I handle everything — visas, flights, hotels, admissions & more. So you can focus on the excitement of what's ahead.",
    quote:"Travel is not just moving from one place to another — it's about opening doors to new possibilities. I'm here to make sure yours open smoothly.",
    stats:[{num:'3+',label:'Years Experience'},{num:'100+',label:'Clients Helped'},{num:'6+',label:'Services Offered'}]
  },
  services: {
    heading:'Services built for every kind of traveller',
    subheading:"Whether you're moving abroad, studying internationally, or just need a stress-free travel experience — I handle every detail.",
    items:[
      {id:1,emoji:'🛂',name:'Visa Assistance',         desc:"Expert, end-to-end visa application support — from documentation prep to submission. I've guided hundreds through the process with a near-perfect success rate.",   accent:'#b478ff',price:'From ₦50,000'},
      {id:2,emoji:'✈️',name:'Flight Reservation',      desc:'Smart, budget-conscious flight bookings tailored to your schedule. One-way, return, or complex multi-city itineraries — handled seamlessly.',                          accent:'#7de8d0',price:'From ₦15,000'},
      {id:3,emoji:'🏨',name:'Hotel Reservation',       desc:'Carefully selected accommodations that match your comfort level and budget. From boutique stays to business hotels — I find the best options for you.',                  accent:'#ffb347',price:'From ₦20,000'},
      {id:4,emoji:'🚗',name:'Airport Transfers',       desc:'Reliable, punctual airport pick-up and drop-off arrangements. Land stress-free and depart on time — every single time.',                                                 accent:'#ff6b9d',price:'From ₦25,000'},
      {id:5,emoji:'🎓',name:'International Admissions',desc:'Comprehensive support for studying abroad — from university applications to student visa processing. Your dream of international education, simplified.',              accent:'#7de8d0',price:'From ₦80,000'},
      {id:6,emoji:'💬',name:'General Consultation',    desc:"Not sure where to start? Book a one-on-one session and let's map out your entire travel journey together. No question is too big or too small.",                        accent:'#b478ff',price:'From ₦10,000'},
      {id:7,emoji:'💍',name:'Event & Proposal Planning',desc:"Unforgettable proposals and intimate travel events curated with love. Let me plan the destination moment that takes her breath away.",                                accent:'#ff6b9d',price:'Custom Pricing'},
      {id:8,emoji:'🌍',name:'Group Travel',            desc:'Corporate retreats, family vacations, or group tours — I coordinate every detail so your group travels together, comfortably and on schedule.',                         accent:'#ffb347',price:'Custom Pricing'}
    ]
  },
  about: {
    heading:'The story behind the visa girlie',
    bio:[
      "Hi, I'm <strong>Teemie</strong> — a Travel Consultant and Project Manager with <em>3+ years</em> in the travel industry, having helped hundreds of people plan their travels from itinerary all the way to their destination.",
      "I've helped people <strong>relocate through study abroad</strong>, reunited families through <strong>family relocation</strong>, and taken clients on unforgettable <strong>vacations</strong> exploring different journeys — all at once.",
      "I studied <strong>Accounting</strong> but chose to pivot when my own study abroad experience didn't go as planned. That personal challenge sparked a mission — to make sure no one else goes through the same. In <em>3 years</em>, I've turned that mission into a thriving consultancy, and I haven't looked back since."
    ],
    chips:['Visa Expert','Project Manager','TikTok Creator','3+ Years Experience','Lagos, Nigeria']
  },
  testimonials: {
    heading:'What my clients say',
    subheading:"Real stories from real travellers I've helped get moving.",
    items:[
      {name:'Adaeze O.',      location:'Lagos → Canada',      text:"Teemie handled my Canadian study visa end-to-end. She was available every step of the way. I'm now at my dream university thanks to her!", rating:5, service:'Visa + Admissions'},
      {name:'Chukwuemeka B.', location:'Abuja → UK',          text:'Got my UK visa approved on the first try. The documentation guidance was incredibly detailed and accurate. Highly recommend!',             rating:5, service:'Visa Assistance'},
      {name:'Fatima A.',      location:'Lagos → Dubai',       text:'From hotel booking to airport pickup — everything was seamless. Felt like a VIP from the moment I landed. Teemie is the real deal!',    rating:5, service:'Full Travel Package'},
      {name:'Kelechi M.',     location:'Port Harcourt → USA', text:'My F1 visa approval was a dream come true. Teemie guided me through every form, interview prep, and document checklist. 10/10!',        rating:5, service:'Visa + Admissions'},
      {name:'Ngozi E.',       location:'Lagos → Germany',     text:"Booked flights, hotels, and got my Schengen visa all in one go. The process was smooth and stress-free. I'll always come back to Teemie!", rating:5, service:'Full Travel Package'},
      {name:'Ibrahim D.',     location:'Kano → Malaysia',     text:'Professional, fast, and reliable. My student visa and university admission were processed without any issues. Truly exceptional service!', rating:5, service:'International Admissions'}
    ]
  },
  blog: {
    heading:'Travel Tips & Insights',
    subheading:"Straight from the visa girlie's desk — tips, guides, and everything you need to travel smarter.",
    posts:[
      {id:1,emoji:'🇪🇺',title:'How to Get a Schengen Visa from Nigeria in 2026',       excerpt:"A step-by-step breakdown of everything you need — documents, appointment booking, bank statements and more.",              category:'Visa Guide',  date:'2026-04-15',readTime:'7 min read'},
      {id:2,emoji:'✈️',title:'5 Tricks to Find the Cheapest Flights from Lagos',        excerpt:"Stop overpaying for flights. Here's exactly how I find the best deals for my clients — and how you can too.",            category:'Flight Tips', date:'2026-03-28',readTime:'5 min read'},
      {id:3,emoji:'🎓',title:'The Ultimate Study Abroad Checklist for Nigerians',       excerpt:"From GRE prep to accommodation hunting — the complete checklist before you board that plane to your dream university.",   category:'Study Abroad',date:'2026-03-10',readTime:'10 min read'},
      {id:4,emoji:'🍁',title:'Canada Visitor Visa: What Changed in 2026',              excerpt:"New IRCC updates are here. Here's what Nigerian applicants need to know about the latest changes to visitor visa processing.", category:'Visa Guide',date:'2026-02-20',readTime:'6 min read'}
    ]
  },
  faq: {
    heading:'Frequently Asked Questions',
    subheading:'Quick answers to the questions I get the most.',
    items:[
      {q:'How long does a visa application take?',         a:"Processing times vary by country and visa type. Most tourist visas take 5–15 business days. Study and work visas can take 4–12 weeks. I'll give you a realistic timeline during our consultation."},
      {q:'What documents do I need for a Schengen visa?',  a:'Typically: valid international passport, bank statements (3–6 months), employment or school letter, travel insurance, flight reservation, hotel booking, and completed application form. Requirements vary by embassy.'},
      {q:'Do you guarantee visa approval?',               a:"No consultant can guarantee visa approval — that decision rests solely with the embassy. However, I ensure your application is as strong and complete as possible, maximising your chances."},
      {q:'Can you help if my visa was previously refused?', a:"Yes! I specialise in handling refusal cases. A previous refusal doesn't mean the end — with the right strategy and documentation, many clients have been approved on their next attempt."},
      {q:'How do I pay for your services?',               a:"Payment is via bank transfer or mobile money (Opay, Palmpay). I'll send an invoice after we agree on services. A deposit is required to commence work."},
      {q:'Do you work with clients outside Lagos?',        a:'Absolutely! I work with clients across Nigeria and from the diaspora. All consultations can be done remotely via WhatsApp, Zoom, or Google Meet.'}
    ]
  },
  contact: {
    heading:'Ready to start your journey?',
    subheading:"Whether you need visa assistance, a hotel, a flight, or just don't know where to start — reach out. I'm here to help.",
    channels:[
      {icon:'💬',label:'WhatsApp', url:'https://wa.me/2348101149438'},
      {icon:'🎵',label:'TikTok',   url:'https://tiktok.com/@Teemiethevisagirlie'},
      {icon:'✉️',label:'Email',    url:'mailto:teemie@visagirlie.com'},
      {icon:'📸',label:'Instagram',url:'https://instagram.com/teemiethevisagirlie'}
    ]
  }
};

/* ─────────────────────────────────────────────────────────────────
   DATA LAYER
───────────────────────────────────────────────────────────────── */
function readData()  { try { return JSON.parse(fs.readFileSync(DATA_FILE,'utf8')); } catch { return JSON.parse(JSON.stringify(DEFAULTS)); } }
function writeData(d){ fs.writeFileSync(DATA_FILE, JSON.stringify(d,null,2)); }
function initData()  { if (!fs.existsSync(DATA_FILE)) writeData(DEFAULTS); }

/* ─────────────────────────────────────────────────────────────────
   SHARED HTML PIECES
───────────────────────────────────────────────────────────────── */
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">`;

const BASE_CSS = `<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --p:#b478ff;--t:#7de8d0;--pk:#ff6b9d;--a:#ffb347;
  --bg:#0a0a0f;--bg2:#0f0f18;--bg3:#141420;
  --tx:#f0ede8;--mu:rgba(240,237,232,.56);--fa:rgba(240,237,232,.24);
  --br:rgba(255,255,255,.08);--bh:rgba(180,120,255,.35);
  --r:16px;--rl:24px
}
html{scroll-behavior:smooth}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--tx);overflow-x:hidden;cursor:none;line-height:1.6}
/* cursor */
.cr{width:12px;height:12px;background:var(--p);border-radius:50%;position:fixed;top:0;left:0;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .3s,height .3s;mix-blend-mode:screen}
.crr{width:36px;height:36px;border:1px solid rgba(180,120,255,.4);border-radius:50%;position:fixed;top:0;left:0;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:width .3s,height .3s}
/* nav */
nav{position:fixed;top:0;left:0;right:0;z-index:1000;display:flex;justify-content:space-between;align-items:center;padding:1.2rem 3rem;background:rgba(10,10,15,.82);backdrop-filter:blur(22px);border-bottom:1px solid var(--br)}
.nlogo{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--tx);text-decoration:none;letter-spacing:.3px}
.nlinks{display:flex;gap:2rem;list-style:none;align-items:center}
.nlinks a{font-size:13px;color:var(--mu);text-decoration:none;letter-spacing:.5px;transition:color .2s;position:relative}
.nlinks a::after{content:'';position:absolute;bottom:-3px;left:0;right:0;height:1px;background:var(--p);transform:scaleX(0);transition:transform .3s}
.nlinks a:hover,.nlinks a.act{color:var(--tx)}
.nlinks a:hover::after,.nlinks a.act::after{transform:scaleX(1)}
.ncta{background:linear-gradient(135deg,var(--p),var(--t));color:#0a0a0f!important;font-weight:600!important;padding:8px 20px;border-radius:100px;font-size:13px!important}
.ncta::after{display:none!important}
.hbg{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:none;padding:4px}
.hbg span{width:24px;height:2px;background:var(--tx);border-radius:2px;transition:all .3s}
/* layout */
.sec{padding:6rem 2rem;max-width:1100px;margin:0 auto}
.ph{padding:11rem 2rem 5rem;text-align:center;position:relative;overflow:hidden}
.ph::before{content:'';position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(180,120,255,.09) 0%,transparent 65%);top:-100px;left:50%;transform:translateX(-50%);pointer-events:none}
/* type */
.lbl{display:flex;align-items:center;gap:10px;font-size:11px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:var(--p);margin-bottom:1rem}
.lbl::before{content:'✦';font-size:10px}
.ttl{font-family:'Playfair Display',serif;font-size:clamp(2rem,5vw,3.2rem);font-weight:700;line-height:1.15;margin-bottom:1rem}
.sub{font-size:1rem;color:var(--mu);line-height:1.75;max-width:600px;margin-bottom:2.5rem}
/* buttons */
.btn{display:inline-flex;align-items:center;gap:8px;padding:13px 30px;border-radius:100px;font-size:14px;font-weight:600;text-decoration:none;transition:opacity .2s,transform .2s;cursor:none;border:none;font-family:'DM Sans',sans-serif}
.btnp{background:linear-gradient(135deg,var(--p),var(--t));color:#0a0a0f}
.btno{background:transparent;color:var(--tx);border:1px solid var(--bh)}
.btn:hover{opacity:.85;transform:translateY(-2px)}
/* cards */
.card{background:var(--bg2);border:1px solid var(--br);border-radius:var(--rl);padding:2rem;transition:border-color .3s,transform .3s}
.card:hover{border-color:var(--bh);transform:translateY(-4px)}
/* reveal */
.rv{opacity:0;transform:translateY(28px);transition:opacity .7s,transform .7s}
.rv.on{opacity:1;transform:none}
.d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}
.d4{transition-delay:.4s}.d5{transition-delay:.5s}.d6{transition-delay:.6s}
/* badge */
.badge{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:var(--p);border:1px solid rgba(180,120,255,.35);padding:7px 18px;border-radius:100px;margin-bottom:2rem}
.bdot{width:6px;height:6px;background:var(--t);border-radius:50%;animation:pulse 2s infinite}
/* chips */
.chip{display:inline-flex;padding:5px 12px;border-radius:100px;font-size:12px;font-weight:500}
.cp{background:rgba(180,120,255,.15);color:var(--p);border:1px solid rgba(180,120,255,.3)}
/* stars */
.stars{color:var(--a);font-size:13px;letter-spacing:2px}
/* marquee */
.mqw{overflow:hidden;border-top:1px solid var(--br);border-bottom:1px solid var(--br);padding:1.2rem 0;background:var(--bg2)}
.mqt{display:flex;animation:mq 35s linear infinite;white-space:nowrap}
.mqi{display:inline-flex;align-items:center;gap:10px;padding:0 2.5rem;font-size:12px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--mu)}
.mqd{width:5px;height:5px;background:var(--p);border-radius:50%;flex-shrink:0}
/* footer */
footer{border-top:1px solid var(--br);padding:3rem 2rem;text-align:center;background:var(--bg2)}
.flogo{font-family:'Playfair Display',serif;font-size:1.1rem;margin-bottom:.75rem}
.fcopy{font-size:12px;color:var(--fa);margin-bottom:1.5rem}
.flinks{display:flex;justify-content:center;gap:2rem;flex-wrap:wrap}
.flinks a{font-size:13px;color:var(--mu);text-decoration:none;transition:color .2s}
.flinks a:hover{color:var(--p)}
/* wa float */
.waf{position:fixed;bottom:2rem;right:2rem;width:52px;height:52px;background:linear-gradient(135deg,var(--p),var(--t));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.4rem;text-decoration:none;z-index:500;box-shadow:0 8px 32px rgba(180,120,255,.35);transition:transform .3s}
.waf:hover{transform:scale(1.1) rotate(-5deg)}
/* particles */
.pts{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.pt{position:absolute;border-radius:50%;opacity:0;animation:fp linear infinite}
/* form inputs */
.fi,.fta,.fsl{width:100%;padding:11px 15px;background:var(--bg);border:1px solid var(--br);border-radius:9px;color:var(--tx);font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
.fi::placeholder,.fta::placeholder{color:var(--fa)}
.fi:focus,.fta:focus,.fsl:focus{border-color:var(--p)}
.fsl option{background:var(--bg2);color:var(--tx)}
.fta{resize:vertical;min-height:100px}
/* anims */
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.6)}}
@keyframes fp{0%{opacity:0;transform:translateY(0) scale(0)}10%{opacity:.6;transform:translateY(-20px) scale(1)}90%{opacity:.2}100%{opacity:0;transform:translateY(-120px) scale(.5)}}
@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes fu{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes shimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
/* responsive */
@media(max-width:768px){
  nav{padding:1rem 1.5rem}
  .nlinks{display:none}
  .nlinks.open{display:flex;flex-direction:column;position:fixed;top:64px;left:0;right:0;background:rgba(10,10,15,.97);padding:2rem;gap:1.5rem;border-bottom:1px solid var(--br);z-index:999}
  .hbg{display:flex}
  .sec{padding:4rem 1.5rem}
  .ph{padding:8rem 1.5rem 4rem}
}
</style>`;

/* shared nav + footer injected into every public page */
const NAV = (active) => `
<div class="cr" id="cr"></div><div class="crr" id="crr"></div>
<nav>
  <a href="/" class="nlogo" id="snav">Teemie ✦ The Visa Girlie</a>
  <ul class="nlinks" id="nl">
    <li><a href="/"            ${active==='home'         ?'class="act"':''}>Home</a></li>
    <li><a href="/services"    ${active==='services'     ?'class="act"':''}>Services</a></li>
    <li><a href="/about"       ${active==='about'        ?'class="act"':''}>About</a></li>
    <li><a href="/testimonials"${active==='testimonials' ?'class="act"':''}>Testimonials</a></li>
    <li><a href="/blog"        ${active==='blog'         ?'class="act"':''}>Blog</a></li>
    <li><a href="/faq"         ${active==='faq'          ?'class="act"':''}>FAQ</a></li>
    <li><a href="/contact" class="ncta">Book Now</a></li>
  </ul>
  <button class="hbg" id="hbg"><span></span><span></span><span></span></button>
</nav>`;

const MQ_FOOTER = `
<div class="mqw"><div class="mqt" id="mqt"></div></div>
<footer>
  <div class="flogo" id="flogo">Teemie ✦ The Visa Girlie</div>
  <div class="fcopy" id="fcopy">© 2026 · Lagos, Nigeria · All rights reserved</div>
  <div class="flinks">
    <a href="/services">Services</a><a href="/about">About</a>
    <a href="/testimonials">Reviews</a><a href="/blog">Blog</a>
    <a href="/faq">FAQ</a><a href="/contact">Contact</a>
  </div>
</footer>
<a href="#" id="waf" class="waf">💬</a>`;

/* shared JS included on every public page */
const SHARED_JS = `<script>
(function(){
  /* cursor */
  const cr=document.getElementById('cr'),crr=document.getElementById('crr');
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cr.style.left=mx+'px';cr.style.top=my+'px'});
  (function loop(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;crr.style.left=rx+'px';crr.style.top=ry+'px';requestAnimationFrame(loop)})();
  function hov(el){el.addEventListener('mouseenter',()=>{cr.style.width='20px';cr.style.height='20px';crr.style.width='52px';crr.style.height='52px'});el.addEventListener('mouseleave',()=>{cr.style.width='12px';cr.style.height='12px';crr.style.width='36px';crr.style.height='36px'})}
  document.querySelectorAll('a,button,.card,.sc,.fc,.tc').forEach(hov);
  /* hamburger */
  const hbg=document.getElementById('hbg'),nl=document.getElementById('nl');
  if(hbg&&nl)hbg.addEventListener('click',()=>nl.classList.toggle('open'));
  /* marquee */
  const mqt=document.getElementById('mqt');
  if(mqt){const items=['Visa Assistance','Flight Reservations','Hotel Bookings','Airport Transfers','International Admissions','General Consultation','Based in Lagos','@Teemiethevisagirlie'];const all=[...items,...items,...items,...items];all.forEach(t=>{const d=document.createElement('div');d.className='mqi';d.innerHTML='<span class="mqd"></span>'+t;mqt.appendChild(d)})}
  /* reveal */
  const obs=new IntersectionObserver(ee=>ee.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on')}),{threshold:.08});
  function obsAll(){document.querySelectorAll('.rv').forEach(el=>obs.observe(el))}
  obsAll();
  /* particles */
  window.mkPts=function(id){
    const p=document.getElementById(id);if(!p)return;
    const cols=['#b478ff','#7de8d0','#ff6b9d','#ffb347'];
    for(let i=0;i<25;i++){const d=document.createElement('div');d.className='pt';d.style.cssText='left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;background:'+cols[~~(Math.random()*4)]+';animation-duration:'+(8+Math.random()*12)+'s;animation-delay:'+(Math.random()*10)+'s;width:'+(1+Math.random()*2.5)+'px;height:'+(1+Math.random()*2.5)+'px';p.appendChild(d)}
  };
  /* load content & patch globals, then call pageInit */
  fetch('/api/content').then(r=>r.json()).then(d=>{
    const g=d.global||{};
    const snav=document.getElementById('snav');if(snav)snav.textContent=(g.siteName||'Teemie')+' ✦';
    const flogo=document.getElementById('flogo');if(flogo)flogo.textContent=(g.siteName||'Teemie')+' ✦';
    const fcopy=document.getElementById('fcopy');if(fcopy)fcopy.textContent='© 2026 · '+(g.location||'Lagos, Nigeria')+' · All rights reserved';
    const waf=document.getElementById('waf');if(waf)waf.href=g.whatsapp||'#';
    document.querySelectorAll('[data-wa]').forEach(el=>el.href=g.whatsapp||'#');
    document.querySelectorAll('[data-tk]').forEach(el=>el.href=g.tiktok||'#');
    document.querySelectorAll('[data-ig]').forEach(el=>el.href=g.instagram||'#');
    document.querySelectorAll('[data-em]').forEach(el=>el.href='mailto:'+(g.email||''));
    if(typeof pageInit==='function')pageInit(d);
    obsAll();
  });
})();
<\/script>`;

/* wrap every public page in the shell */
function shell(title, active, pageCss, body) {
  return `<!DOCTYPE html><html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
${FONTS}${BASE_CSS}${pageCss||''}
</head>
<body>
${NAV(active)}
${body}
${MQ_FOOTER}
${SHARED_JS}
</body></html>`;
}

/* ─────────────────────────────────────────────────────────────────
   PAGE: HOME
───────────────────────────────────────────────────────────────── */
function pgHome() {
  const css = `<style>
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8rem 2rem 5rem;text-align:center;position:relative;overflow:hidden}
.orb{position:absolute;border-radius:50%;pointer-events:none}
.ob1{width:700px;height:700px;background:radial-gradient(circle,rgba(180,120,255,.12) 0%,transparent 65%);top:-200px;right:-150px}
.ob2{width:500px;height:500px;background:radial-gradient(circle,rgba(125,232,208,.09) 0%,transparent 65%);bottom:-100px;left:-100px}
.hn{font-family:'Playfair Display',serif;font-size:clamp(3.5rem,9vw,6.5rem);font-weight:700;line-height:1;background:linear-gradient(135deg,#fff 0%,#dcc8ff 40%,#9fe8d8 80%,#fff 100%);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:fu .8s .15s both,shimmer 6s 1s ease-in-out infinite;margin-bottom:.3rem}
.hs{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,3rem);font-style:italic;color:var(--t);animation:fu .8s .25s both;margin-bottom:1.5rem}
.htag{font-size:clamp(.85rem,2vw,.95rem);color:var(--mu);letter-spacing:4px;text-transform:uppercase;animation:fu .8s .35s both;margin-bottom:2.5rem}
.hdesc{font-size:clamp(1rem,2vw,1.1rem);color:var(--mu);max-width:560px;line-height:1.8;animation:fu .8s .45s both;margin-bottom:3rem}
.hcta{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;animation:fu .8s .55s both}
.scroll-h{position:absolute;bottom:2.5rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;animation:fu .8s .9s both}
.scroll-h span{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--fa)}
.scroll-l{width:1px;height:40px;background:linear-gradient(to bottom,var(--p),transparent);animation:sl 2s ease-in-out infinite}
@keyframes sl{0%,100%{opacity:.3}50%{opacity:1}}
/* service cards */
.sgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-top:3rem}
.sc{background:var(--bg2);border:1px solid var(--br);border-radius:var(--rl);padding:2rem;transition:border-color .3s,transform .3s;position:relative;overflow:hidden}
.sc::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at top right,color-mix(in srgb,var(--ac) 8%,transparent) 0%,transparent 70%);pointer-events:none}
.sc:hover{border-color:var(--bh);transform:translateY(-5px)}
.snum{font-size:11px;letter-spacing:2px;color:var(--fa);display:block;margin-bottom:.8rem}
.sem{font-size:2rem;display:block;margin-bottom:.8rem}
.sname{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:600;margin-bottom:.65rem}
.sdesc{font-size:.9rem;color:var(--mu);line-height:1.72}
.sprice{margin-top:1.1rem;font-size:12px;font-weight:600;color:var(--ac,var(--p));letter-spacing:.4px}
/* quote */
.qt{padding:5rem 2rem;text-align:center;background:linear-gradient(to right,transparent,rgba(180,120,255,.04),transparent);border-top:1px solid var(--br);border-bottom:1px solid var(--br)}
.qmark{font-family:'Playfair Display',serif;font-size:5rem;color:rgba(180,120,255,.2);line-height:0;position:relative;top:2rem}
.qtxt{font-family:'Playfair Display',serif;font-size:clamp(1.15rem,3vw,1.65rem);font-style:italic;max-width:700px;margin:1.5rem auto;line-height:1.65}
.qauth{font-size:13px;color:var(--p);letter-spacing:2px}
/* about preview */
.abl{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.abc{background:var(--bg2);border:1px solid var(--br);border-radius:var(--rl);padding:2.5rem;text-align:center}
.abav{width:80px;height:80px;background:linear-gradient(135deg,var(--p),var(--t));border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:#0a0a0f;margin:0 auto 1rem}
.abn{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;margin-bottom:.4rem}
.abr{font-size:12px;color:var(--t);letter-spacing:1.5px;margin-bottom:1.5rem}
.abch{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:1.5rem}
.absc{display:flex;align-items:center;gap:12px;background:var(--bg3);border:1px solid var(--br);border-radius:12px;padding:12px 16px;text-align:left}
.abtx p{color:var(--mu);line-height:1.82;font-size:1rem;margin-bottom:1.2rem}
.srow{display:flex;gap:2rem;margin-top:2rem}
.stnum{font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:700;background:linear-gradient(135deg,var(--p),var(--t));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.stlbl{font-size:12px;color:var(--fa);letter-spacing:1px;margin-top:4px}
/* testimonials preview */
.tgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;margin-top:3rem}
.tc{background:var(--bg2);border:1px solid var(--br);border-radius:var(--rl);padding:2rem;transition:border-color .3s,transform .3s}
.tc:hover{border-color:var(--bh);transform:translateY(-4px)}
.thd{display:flex;align-items:center;gap:12px;margin-bottom:1rem}
.tav{width:42px;height:42px;background:linear-gradient(135deg,var(--p),var(--t));border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#0a0a0f;flex-shrink:0}
.ttx{font-size:14px;color:var(--mu);line-height:1.75;font-style:italic;margin:.75rem 0 1rem}
.tsvc{font-size:11px;color:var(--p);letter-spacing:1px}
/* cta */
.ctasec{text-align:center;padding:6rem 2rem;position:relative;overflow:hidden}
.ctasec::before{content:'';position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(180,120,255,.07) 0%,transparent 65%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
@media(max-width:768px){.abl{grid-template-columns:1fr;gap:2rem}.srow{gap:1.2rem}}
</style>`;
  const body = `
<section class="hero">
  <div class="orb ob1"></div><div class="orb ob2"></div>
  <div class="pts" id="pts"></div>
  <div class="badge"><span class="bdot"></span><span id="hbadge">Available for Bookings</span></div>
  <h1 class="hn" id="hname">Teemie</h1>
  <p  class="hs" id="hsub">The Visa Girlie</p>
  <p  class="htag" id="htag">Senior Travel Consultant · Lagos, Nigeria</p>
  <p  class="hdesc" id="hdesc">I handle everything — visas, flights, hotels, admissions &amp; more.</p>
  <div class="hcta">
    <a href="/contact" class="btn btnp">Book a Consultation</a>
    <a href="/services" class="btn btno">Explore Services</a>
  </div>
  <div class="scroll-h"><span>Scroll</span><div class="scroll-l"></div></div>
</section>

<div class="sec">
  <p class="lbl rv">What I offer</p>
  <h2 class="ttl rv" id="svch">Services built for every kind of traveller</h2>
  <p  class="sub rv" id="svcs">Whether you're moving abroad or need a stress-free experience — I handle every detail.</p>
  <div class="sgrid" id="sgrid"></div>
  <div style="text-align:center;margin-top:3rem"><a href="/services" class="btn btno rv">View All Services →</a></div>
</div>

<div class="qt rv">
  <span class="qmark">"</span>
  <p class="qtxt" id="qtxt">Travel is not just moving from one place to another — it's about opening doors to new possibilities.</p>
  <p class="qauth">— Teemie, The Visa Girlie</p>
</div>

<div class="sec">
  <div class="abl">
    <div class="rv">
      <div class="abc">
        <div class="abav">T</div>
        <div class="abn">Teemie</div>
        <div class="abr">✦ Travel Consultant &amp; Visa Specialist</div>
        <div class="abch" id="abch"></div>
        <div class="absc">
          <span style="font-size:1.4rem">✈️</span>
          <div><div style="font-size:13px;font-weight:600">@Teemiethevisagirlie</div><div style="font-size:11px;color:var(--fa)">TikTok · Travel Consultant</div></div>
        </div>
      </div>
    </div>
    <div class="abtx rv d2">
      <p class="lbl">Who I am</p>
      <h2 class="ttl" id="abh">The story behind the visa girlie</h2>
      <div id="abbio"></div>
      <div class="srow" id="srow"></div>
      <div style="margin-top:2rem"><a href="/about" class="btn btno">Read Full Story →</a></div>
    </div>
  </div>
</div>

<div class="sec">
  <p class="lbl rv">Client Love</p>
  <h2 class="ttl rv">What my clients say</h2>
  <div class="tgrid" id="tgrid"></div>
  <div style="text-align:center;margin-top:2.5rem"><a href="/testimonials" class="btn btno rv">See All Reviews →</a></div>
</div>

<div class="ctasec">
  <p class="lbl rv" style="justify-content:center">Let's travel</p>
  <h2 class="ttl rv">Ready to start your journey?</h2>
  <p class="sub rv" style="margin:0 auto;text-align:center;margin-bottom:0">No matter where you're headed, I've got you covered.</p>
  <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem" class="rv">
    <a href="/contact" class="btn btnp">Book Now</a>
    <a href="/faq" class="btn btno">Read FAQs</a>
  </div>
</div>

<script>
function pageInit(d){
  mkPts('pts');
  const h=d.home||{};
  const $=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v||''};
  $('hname',h.heroName);$('hsub',h.heroSubtitle);$('htag',h.heroTagline);
  $('hbadge',h.heroBadge);$('hdesc',h.heroDescription);$('qtxt',h.quote);
  /* stats */
  const sr=document.getElementById('srow');
  if(sr&&h.stats)sr.innerHTML=h.stats.map(s=>'<div><div class="stnum">'+s.num+'</div><div class="stlbl">'+s.label+'</div></div>').join('');
  /* services */
  const s=d.services||{};
  const sh=document.getElementById('svch'),ss=document.getElementById('svcs');
  if(sh)sh.textContent=s.heading||'';if(ss)ss.textContent=s.subheading||'';
  const sg=document.getElementById('sgrid');
  if(sg)sg.innerHTML=(s.items||[]).slice(0,6).map((it,i)=>'<div class="sc rv d'+(i%3+1)+'" style="--ac:'+it.accent+'"><span class="snum">0'+(i+1)+'</span><span class="sem">'+it.emoji+'</span><div class="sname">'+it.name+'</div><div class="sdesc">'+it.desc+'</div><div class="sprice">'+it.price+'</div></div>').join('');
  /* about */
  const a=d.about||{};
  const ac=document.getElementById('abch');if(ac)ac.innerHTML=(a.chips||[]).map(c=>'<span class="chip cp">'+c+'</span>').join('');
  const ab=document.getElementById('abbio');if(ab)ab.innerHTML=(a.bio||[]).map(p=>'<p>'+p+'</p>').join('');
  const ah=document.getElementById('abh');if(ah)ah.textContent=a.heading||'';
  /* testimonials */
  const t=d.testimonials||{};
  const tg=document.getElementById('tgrid');
  if(tg)tg.innerHTML=(t.items||[]).slice(0,3).map((it,i)=>'<div class="tc rv d'+(i+1)+'"><div class="thd"><div class="tav">'+it.name[0]+'</div><div><div style="font-weight:600;font-size:14px">'+it.name+'</div><div style="font-size:12px;color:var(--t)">'+it.location+'</div></div></div><div class="stars">'+'★'.repeat(it.rating||5)+'</div><p class="ttx">"'+it.text+'"</p><div class="tsvc">'+it.service+'</div></div>').join('');
}
<\/script>`;
  return shell('Teemie The Visa Girlie — Travel Consultant','home',css,body);
}

/* ─────────────────────────────────────────────────────────────────
   PAGE: SERVICES
───────────────────────────────────────────────────────────────── */
function pgServices() {
  const css = `<style>
.sgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:1.5rem;margin-top:3rem}
.sc{background:var(--bg2);border:1px solid var(--br);border-radius:var(--rl);padding:2.5rem;transition:border-color .3s,transform .3s;position:relative;overflow:hidden}
.sc::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at top right,color-mix(in srgb,var(--ac) 9%,transparent) 0%,transparent 70%);pointer-events:none}
.sc:hover{border-color:var(--bh);transform:translateY(-6px)}
.snum{font-size:11px;letter-spacing:2px;color:var(--fa);display:block;margin-bottom:.8rem}
.sem{font-size:2.5rem;display:block;margin-bottom:.8rem}
.sname{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:600;margin-bottom:.65rem}
.sdesc{font-size:.92rem;color:var(--mu);line-height:1.75}
.sft{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem;margin-top:1.5rem}
.sprice{font-size:13px;font-weight:600;color:var(--ac,var(--p));border:1px solid color-mix(in srgb,var(--ac,var(--p)) 30%,transparent);padding:5px 13px;border-radius:100px}
.proc{background:var(--bg2);border-top:1px solid var(--br);border-bottom:1px solid var(--br);padding:5rem 2rem}
.pgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;max-width:1100px;margin:3rem auto 0;text-align:center}
.pnum{width:52px;height:52px;background:linear-gradient(135deg,var(--p),var(--t));border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:#0a0a0f;margin:0 auto 1rem}
</style>`;
  const body = `
<div class="ph">
  <p class="lbl rv" style="justify-content:center">What I offer</p>
  <h1 class="ttl rv" id="svch">Services built for every kind of traveller</h1>
  <p  class="sub rv" id="svcs" style="margin:0 auto">I handle every detail, so you can focus on the excitement of what's ahead.</p>
</div>
<div class="sec"><div class="sgrid" id="sgrid"></div></div>
<div class="proc">
  <div style="max-width:1100px;margin:0 auto">
    <p class="lbl rv" style="justify-content:center">How it works</p>
    <h2 class="ttl rv" style="text-align:center">My simple 4-step process</h2>
    <div class="pgrid">
      <div class="rv"><div class="pnum">1</div><div style="font-weight:600;margin-bottom:.5rem">Consultation</div><div style="font-size:13px;color:var(--mu)">We chat via WhatsApp or call to map out your travel goals.</div></div>
      <div class="rv d1"><div class="pnum">2</div><div style="font-weight:600;margin-bottom:.5rem">Custom Plan</div><div style="font-size:13px;color:var(--mu)">I create a tailored plan with services, timelines, and pricing.</div></div>
      <div class="rv d2"><div class="pnum">3</div><div style="font-weight:600;margin-bottom:.5rem">We Execute</div><div style="font-size:13px;color:var(--mu)">I handle everything — docs, bookings, applications — with updates throughout.</div></div>
      <div class="rv d3"><div class="pnum">4</div><div style="font-weight:600;margin-bottom:.5rem">You Travel ✈️</div><div style="font-size:13px;color:var(--mu)">Board your flight stress-free, knowing every detail is handled.</div></div>
    </div>
  </div>
</div>
<div style="text-align:center;padding:5rem 2rem">
  <h2 class="ttl rv">Ready to book?</h2>
  <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem" class="rv">
    <a href="/contact" class="btn btnp">Contact Me Now</a>
    <a href="/faq" class="btn btno">Read FAQs</a>
  </div>
</div>
<script>
function pageInit(d){
  const s=d.services||{};
  const sh=document.getElementById('svch');if(sh)sh.textContent=s.heading||'';
  const ss=document.getElementById('svcs');if(ss)ss.textContent=s.subheading||'';
  const sg=document.getElementById('sgrid');
  if(sg)sg.innerHTML=(s.items||[]).map((it,i)=>'<div class="sc rv d'+(i%4+1)+'" style="--ac:'+it.accent+'"><span class="snum">0'+(i+1<10?i+1:i+1)+'</span><span class="sem">'+it.emoji+'</span><div class="sname">'+it.name+'</div><div class="sdesc">'+it.desc+'</div><div class="sft"><span class="sprice">'+it.price+'</span><a href="/contact" class="btn btnp" style="padding:8px 16px;font-size:12px">Book →</a></div></div>').join('');
}
<\/script>`;
  return shell('Services — Teemie The Visa Girlie','services',css,body);
}

/* ─────────────────────────────────────────────────────────────────
   PAGE: ABOUT
───────────────────────────────────────────────────────────────── */
function pgAbout() {
  const css = `<style>
.abwrap{display:grid;grid-template-columns:1fr 1.5fr;gap:5rem;align-items:start;padding:7rem 2rem 5rem;max-width:1100px;margin:0 auto}
.abcard{background:var(--bg2);border:1px solid var(--br);border-radius:var(--rl);padding:2.5rem;text-align:center;position:sticky;top:100px}
.abav{width:100px;height:100px;background:linear-gradient(135deg,var(--p),var(--t));border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:700;color:#0a0a0f;margin:0 auto 1.2rem}
.abn{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700;margin-bottom:.4rem}
.abr{font-size:12px;color:var(--t);letter-spacing:2px;text-transform:uppercase;margin-bottom:1.5rem}
.abch{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:1.5rem}
.slnks{display:flex;flex-direction:column;gap:.75rem;margin-top:1.5rem}
.slnk{display:flex;align-items:center;gap:12px;background:var(--bg3);border:1px solid var(--br);border-radius:12px;padding:12px 16px;text-decoration:none;color:var(--tx);font-size:13px;font-weight:500;transition:border-color .2s,transform .2s;text-align:left}
.slnk:hover{border-color:var(--bh);transform:translateX(4px)}
.abtx p{color:var(--mu);line-height:1.88;font-size:1.05rem;margin-bottom:1.5rem}
.abtx h3{font-family:'Playfair Display',serif;font-size:1.4rem;color:var(--tx);margin:2.5rem 0 1rem}
.statbar{background:var(--bg2);border-top:1px solid var(--br);border-bottom:1px solid var(--br);padding:4rem 2rem}
.statg{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:2rem;max-width:800px;margin:0 auto;text-align:center}
.stnum{font-family:'Playfair Display',serif;font-size:3rem;font-weight:700;background:linear-gradient(135deg,var(--p),var(--t));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.expg{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.2rem;margin-top:3rem}
.expc{background:var(--bg2);border:1px solid var(--br);border-radius:var(--r);padding:1.5rem;display:flex;align-items:flex-start;gap:1rem}
@media(max-width:768px){.abwrap{grid-template-columns:1fr;gap:2rem}.abcard{position:static}}
</style>`;
  const body = `
<div class="abwrap">
  <div class="rv">
    <div class="abcard">
      <div class="abav">T</div>
      <div class="abn">Teemie</div>
      <div class="abr">✦ Senior Travel Consultant</div>
      <div class="abch" id="abch"></div>
      <div class="slnks">
        <a href="#" data-tk class="slnk" target="_blank"><span style="font-size:1.3rem">🎵</span><div><div>@Teemiethevisagirlie</div><div style="font-size:11px;color:var(--fa)">TikTok</div></div></a>
        <a href="#" data-wa class="slnk"><span style="font-size:1.3rem">💬</span><div><div>WhatsApp</div><div style="font-size:11px;color:var(--fa)">+234 810 114 9438</div></div></a>
        <a href="#" data-ig class="slnk" target="_blank"><span style="font-size:1.3rem">📸</span><div><div>Instagram</div><div style="font-size:11px;color:var(--fa)">@teemiethevisagirlie</div></div></a>
        <a href="#" data-em class="slnk"><span style="font-size:1.3rem">✉️</span><div><div>Email Me</div><div style="font-size:11px;color:var(--fa)">teemie@visagirlie.com</div></div></a>
      </div>
    </div>
  </div>
  <div class="abtx rv d2" style="padding-top:2rem">
    <p class="lbl">Who I am</p>
    <h1 class="ttl" id="abh">The story behind the visa girlie</h1>
    <div id="abbio"></div>
    <h3>My Expertise</h3>
    <p>As both a <strong>Senior Travel Consultant</strong> and an <strong>Event Project Manager</strong>, I bring a dual lens to every client relationship. My TikTok <strong>@Teemiethevisagirlie</strong> has helped thousands understand visa processes and plan international travel with confidence.</p>
    <div style="margin-top:2rem"><a href="/contact" class="btn btnp">Work With Me</a></div>
  </div>
</div>
<div class="statbar"><div class="statg" id="statg"></div></div>
<div class="sec">
  <p class="lbl rv">Specialisations</p>
  <h2 class="ttl rv">What I do best</h2>
  <div class="expg">
    <div class="expc rv"><span style="font-size:1.8rem">🛂</span><div><div style="font-weight:600;font-size:14px;margin-bottom:4px">Visa Processing</div><div style="font-size:13px;color:var(--mu)">Tourist, student, business — handled with expertise and precision.</div></div></div>
    <div class="expc rv d1"><span style="font-size:1.8rem">📋</span><div><div style="font-weight:600;font-size:14px;margin-bottom:4px">Project Management</div><div style="font-size:13px;color:var(--mu)">End-to-end coordination — from proposals to corporate retreats.</div></div></div>
    <div class="expc rv d2"><span style="font-size:1.8rem">🎓</span><div><div style="font-weight:600;font-size:14px;margin-bottom:4px">International Admissions</div><div style="font-size:13px;color:var(--mu)">University applications, offer letters, student visa processing.</div></div></div>
    <div class="expc rv d3"><span style="font-size:1.8rem">🌍</span><div><div style="font-weight:600;font-size:14px;margin-bottom:4px">Full Travel Packages</div><div style="font-size:13px;color:var(--mu)">Flights + Hotels + Transfers + Visa — one consultant, full service.</div></div></div>
    <div class="expc rv d4"><span style="font-size:1.8rem">📱</span><div><div style="font-weight:600;font-size:14px;margin-bottom:4px">Content Creation</div><div style="font-size:13px;color:var(--mu)">Educating thousands on TikTok about visas, travel, study abroad.</div></div></div>
    <div class="expc rv d5"><span style="font-size:1.8rem">💍</span><div><div style="font-weight:600;font-size:14px;margin-bottom:4px">Proposal Planning</div><div style="font-size:13px;color:var(--mu)">Destination proposals and romantic experiences, curated perfectly.</div></div></div>
  </div>
</div>
<div style="text-align:center;padding:4rem 2rem 6rem;border-top:1px solid var(--br)">
  <h2 class="ttl rv">Let's work together</h2>
  <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem" class="rv">
    <a href="/contact" class="btn btnp">Book a Consultation</a>
    <a href="/services" class="btn btno">View My Services</a>
  </div>
</div>
<script>
function pageInit(d){
  const a=d.about||{};
  const ac=document.getElementById('abch');if(ac)ac.innerHTML=(a.chips||[]).map(c=>'<span class="chip cp">'+c+'</span>').join('');
  const ab=document.getElementById('abbio');if(ab)ab.innerHTML=(a.bio||[]).map(p=>'<p>'+p+'</p>').join('');
  const ah=document.getElementById('abh');if(ah)ah.textContent=a.heading||'';
  const sg=document.getElementById('statg');
  if(sg&&d.home&&d.home.stats)sg.innerHTML=d.home.stats.map(s=>'<div class="rv"><div class="stnum">'+s.num+'</div><div style="font-size:13px;color:var(--fa);text-transform:uppercase;letter-spacing:1.5px;margin-top:4px">'+s.label+'</div></div>').join('');
}
<\/script>`;
  return shell('About — Teemie The Visa Girlie','about',css,body);
}

/* ─────────────────────────────────────────────────────────────────
   PAGE: TESTIMONIALS
───────────────────────────────────────────────────────────────── */
function pgTestimonials() {
  const css = `<style>
.tgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-top:3rem}
.tc{background:var(--bg2);border:1px solid var(--br);border-radius:var(--rl);padding:2rem;transition:border-color .3s,transform .3s;display:flex;flex-direction:column}
.tc:hover{border-color:var(--bh);transform:translateY(-4px)}
.thd{display:flex;align-items:center;gap:12px;margin-bottom:1rem}
.tav{width:48px;height:48px;background:linear-gradient(135deg,var(--p),var(--t));border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:#0a0a0f;flex-shrink:0}
.ttx{font-size:14px;color:var(--mu);line-height:1.75;font-style:italic;margin:.75rem 0 1rem;flex:1}
.tsvc{font-size:11px;color:var(--p);letter-spacing:1px;text-transform:uppercase;border:1px solid rgba(180,120,255,.25);padding:4px 10px;border-radius:100px;display:inline-block;margin-top:auto}
.tbar{background:var(--bg2);border-top:1px solid var(--br);border-bottom:1px solid var(--br);padding:3.5rem 2rem}
.tbg{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:2rem;max-width:900px;margin:0 auto;text-align:center}
.tbn{font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:700;background:linear-gradient(135deg,var(--p),var(--t));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
</style>`;
  const body = `
<div class="ph">
  <p class="lbl rv" style="justify-content:center">Client Love</p>
  <h1 class="ttl rv" id="th">What my clients say</h1>
  <p  class="sub rv" id="ts" style="margin:0 auto">Real stories from real travellers I've helped get moving.</p>
</div>
<div class="tbar">
  <div class="tbg">
    <div class="rv"><div class="tbn">100+</div><div style="font-size:13px;color:var(--fa);margin-top:4px">Clients served</div></div>
    <div class="rv d1"><div class="tbn">⭐ 5.0</div><div style="font-size:13px;color:var(--fa);margin-top:4px">Average rating</div></div>
    <div class="rv d2"><div class="tbn">~95%</div><div style="font-size:13px;color:var(--fa);margin-top:4px">Visa success rate</div></div>
    <div class="rv d3"><div class="tbn">3+</div><div style="font-size:13px;color:var(--fa);margin-top:4px">Years experience</div></div>
  </div>
</div>
<div class="sec"><div class="tgrid" id="tgrid"></div></div>
<div style="text-align:center;padding:4rem 2rem 6rem;border-top:1px solid var(--br)">
  <h2 class="ttl rv">Join hundreds of happy travellers</h2>
  <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem" class="rv">
    <a href="/contact" class="btn btnp">Book a Consultation</a>
    <a href="/services" class="btn btno">View Services</a>
  </div>
</div>
<script>
function pageInit(d){
  const t=d.testimonials||{};
  const th=document.getElementById('th');if(th)th.textContent=t.heading||'';
  const ts=document.getElementById('ts');if(ts)ts.textContent=t.subheading||'';
  const tg=document.getElementById('tgrid');
  if(tg)tg.innerHTML=(t.items||[]).map((it,i)=>'<div class="tc rv d'+(i%4+1)+'"><div class="thd"><div class="tav">'+it.name[0]+'</div><div><div style="font-weight:600;font-size:15px">'+it.name+'</div><div style="font-size:12px;color:var(--t)">'+it.location+'</div></div></div><div class="stars">'+'★'.repeat(it.rating||5)+'</div><p class="ttx">"'+it.text+'"</p><span class="tsvc">'+it.service+'</span></div>').join('');
}
<\/script>`;
  return shell('Testimonials — Teemie The Visa Girlie','testimonials',css,body);
}

/* ─────────────────────────────────────────────────────────────────
   PAGE: BLOG
───────────────────────────────────────────────────────────────── */
function pgBlog() {
  const css = `<style>
.bgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-top:3rem}
.bc{background:var(--bg2);border:1px solid var(--br);border-radius:var(--rl);padding:2rem;transition:border-color .3s,transform .3s;cursor:none}
.bc:hover{border-color:var(--bh);transform:translateY(-4px)}
.bcat{font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--p);margin-bottom:.75rem}
.bttl{font-family:'Playfair Display',serif;font-size:1.15rem;font-weight:600;line-height:1.4;margin-bottom:.75rem}
.bexc{font-size:14px;color:var(--mu);line-height:1.72}
.bmeta{display:flex;align-items:center;gap:1rem;margin-top:1.5rem;font-size:12px;color:var(--fa)}
.nlbox{background:var(--bg2);border:1px solid var(--br);border-radius:var(--rl);padding:3rem;text-align:center;margin:4rem 0;position:relative;overflow:hidden}
.nlbox::before{content:'';position:absolute;width:400px;height:400px;background:radial-gradient(circle,rgba(180,120,255,.06) 0%,transparent 65%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
.nlform{display:flex;gap:1rem;max-width:440px;margin:2rem auto 0;flex-wrap:wrap}
.nlinp{flex:1;padding:13px 18px;background:var(--bg);border:1px solid var(--br);border-radius:100px;color:var(--tx);font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s;min-width:200px}
.nlinp::placeholder{color:var(--fa)}
.nlinp:focus{border-color:var(--p)}
</style>`;
  const body = `
<div class="ph">
  <p class="lbl rv" style="justify-content:center">From the desk</p>
  <h1 class="ttl rv" id="bh">Travel Tips &amp; Insights</h1>
  <p  class="sub rv" id="bs" style="margin:0 auto">Straight from the visa girlie's desk — tips, guides, and everything you need to travel smarter.</p>
</div>
<div class="sec">
  <div class="bgrid" id="bgrid"></div>
  <div class="nlbox rv">
    <p class="lbl" style="justify-content:center">Stay informed</p>
    <h2 class="ttl" style="font-size:1.8rem">Get travel tips in your inbox</h2>
    <p style="color:var(--mu);font-size:14px;margin-top:.5rem">Join my newsletter for visa guides, travel deals, and insider tips.</p>
    <div class="nlform">
      <input class="nlinp" type="email" id="nle" placeholder="your@email.com">
      <button class="btn btnp" onclick="nlsub()" style="cursor:none">Subscribe</button>
    </div>
    <p id="nlm" style="font-size:13px;color:var(--t);margin-top:1rem;min-height:20px"></p>
  </div>
  <div style="text-align:center;padding:2rem 0 4rem">
    <h2 class="ttl rv">Watch me on TikTok</h2>
    <p style="color:var(--mu);margin:1rem auto 2rem;max-width:480px;line-height:1.7" class="rv">Get daily visa tips, travel hacks, and behind-the-scenes content.</p>
    <a href="#" data-tk class="btn btnp rv" target="_blank">@Teemiethevisagirlie 🎵</a>
  </div>
</div>
<script>
function pageInit(d){
  const b=d.blog||{};
  const bh=document.getElementById('bh');if(bh)bh.textContent=b.heading||'';
  const bs=document.getElementById('bs');if(bs)bs.textContent=b.subheading||'';
  const bg=document.getElementById('bgrid');
  if(bg)bg.innerHTML=(b.posts||[]).map((p,i)=>'<div class="bc rv d'+(i%4+1)+'"><span style="font-size:2.5rem;display:block;margin-bottom:1rem">'+(p.emoji||'📝')+'</span><div class="bcat">'+p.category+'</div><div class="bttl">'+p.title+'</div><div class="bexc">'+p.excerpt+'</div><div class="bmeta"><span>📅 '+new Date(p.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})+'</span><span>⏱ '+p.readTime+'</span></div></div>').join('');
}
function nlsub(){
  const e=document.getElementById('nle'),m=document.getElementById('nlm');
  if(!e.value||!e.value.includes('@')){m.style.color='var(--pk)';m.textContent='Please enter a valid email.';return}
  m.style.color='var(--t)';m.textContent="✓ You're on the list! Watch out for tips from the visa girlie.";e.value='';
}
<\/script>`;
  return shell('Blog — Teemie The Visa Girlie','blog',css,body);
}

/* ─────────────────────────────────────────────────────────────────
   PAGE: FAQ
───────────────────────────────────────────────────────────────── */
function pgFaq() {
  const css = `<style>
.flist{max-width:750px;margin:3rem auto 0;display:flex;flex-direction:column;gap:1rem}
.fi2{background:var(--bg2);border:1px solid var(--br);border-radius:var(--r);overflow:hidden;transition:border-color .3s}
.fi2:hover{border-color:var(--bh)}
.fi2.open{border-color:rgba(180,120,255,.45)}
.fq{width:100%;text-align:left;background:none;border:none;padding:1.5rem;color:var(--tx);font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;cursor:none;display:flex;align-items:center;justify-content:space-between;gap:1rem}
.ficon{width:28px;height:28px;border:1px solid var(--br);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;transition:transform .3s,background .3s}
.fi2.open .ficon{transform:rotate(45deg);background:rgba(180,120,255,.15);border-color:var(--p)}
.fans{max-height:0;overflow:hidden;transition:max-height .4s ease}
.fans.open{max-height:300px}
.fans-in{padding:0 1.5rem 1.5rem;font-size:14px;color:var(--mu);line-height:1.8}
</style>`;
  const body = `
<div class="ph">
  <p class="lbl rv" style="justify-content:center">Got questions?</p>
  <h1 class="ttl rv" id="fh">Frequently Asked Questions</h1>
  <p  class="sub rv" id="fs" style="margin:0 auto">Quick answers to the questions I get the most.</p>
</div>
<div class="sec" style="padding-top:2rem">
  <div class="flist" id="flist"></div>
  <div style="text-align:center;margin-top:4rem;padding:3rem;background:var(--bg2);border:1px solid var(--br);border-radius:var(--rl)">
    <p style="font-size:2rem;margin-bottom:1rem">💬</p>
    <h3 style="font-family:'Playfair Display',serif;font-size:1.4rem;margin-bottom:.75rem">Still have questions?</h3>
    <p style="color:var(--mu);font-size:14px;line-height:1.7;margin-bottom:2rem">Can't find what you're looking for? Reach out directly — I'll get back to you soon.</p>
    <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
      <a href="/contact" class="btn btnp">Contact Me</a>
      <a href="#" data-wa class="btn btno">WhatsApp Me</a>
    </div>
  </div>
</div>
<script>
function pageInit(d){
  const f=d.faq||{};
  const fh=document.getElementById('fh');if(fh)fh.textContent=f.heading||'';
  const fs=document.getElementById('fs');if(fs)fs.textContent=f.subheading||'';
  const fl=document.getElementById('flist');
  if(fl)fl.innerHTML=(f.items||[]).map((it,i)=>'<div class="fi2 rv d'+(i%4+1)+'" id="fi'+i+'"><button class="fq" onclick="tog('+i+')"><span>'+it.q+'</span><span class="ficon">+</span></button><div class="fans" id="fa'+i+'"><div class="fans-in">'+it.a+'</div></div></div>').join('');
}
function tog(i){
  const item=document.getElementById('fi'+i),ans=document.getElementById('fa'+i);
  const was=item.classList.contains('open');
  document.querySelectorAll('.fi2').forEach(e=>e.classList.remove('open'));
  document.querySelectorAll('.fans').forEach(e=>e.classList.remove('open'));
  if(!was){item.classList.add('open');ans.classList.add('open')}
}
<\/script>`;
  return shell('FAQ — Teemie The Visa Girlie','faq',css,body);
}

/* ─────────────────────────────────────────────────────────────────
   PAGE: CONTACT
───────────────────────────────────────────────────────────────── */
function pgContact() {
  const css = `<style>
.ctwrap{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start}
.chgrid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:2rem}
.chbtn{background:var(--bg2);border:1px solid var(--br);border-radius:var(--r);padding:1.5rem;text-decoration:none;color:var(--tx);display:flex;flex-direction:column;align-items:center;gap:.75rem;text-align:center;transition:border-color .3s,transform .3s}
.chbtn:hover{border-color:var(--bh);transform:translateY(-3px)}
.ctform{background:var(--bg2);border:1px solid var(--br);border-radius:var(--rl);padding:2.5rem}
.fl{display:block;font-size:12px;font-weight:500;color:var(--mu);margin-bottom:6px;letter-spacing:.5px}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.fg{margin-bottom:1.1rem}
.okmsg{background:rgba(125,232,208,.1);border:1px solid rgba(125,232,208,.3);border-radius:9px;padding:1rem 1.25rem;font-size:13px;color:var(--t);margin-top:1rem;display:none}
.ibox{background:var(--bg2);border:1px solid var(--br);border-radius:var(--r);padding:1.5rem;margin-top:1rem}
@media(max-width:768px){.ctwrap{grid-template-columns:1fr;gap:2rem}.frow{grid-template-columns:1fr}}
</style>`;
  const body = `
<div class="ph">
  <p class="lbl rv" style="justify-content:center">Get in touch</p>
  <h1 class="ttl rv" id="ch">Ready to start your journey?</h1>
  <p  class="sub rv" id="cs" style="margin:0 auto">Whether you need visa assistance, a hotel, a flight, or just don't know where to start — reach out.</p>
</div>
<div class="sec" style="padding-top:1rem">
  <div class="ctwrap">
    <div class="rv">
      <p class="lbl">Direct channels</p>
      <h2 class="ttl" style="font-size:1.8rem">Let's connect</h2>
      <p style="color:var(--mu);font-size:14px;line-height:1.7;margin-bottom:.5rem">Reach me on your preferred platform — I typically respond within a few hours.</p>
      <div class="chgrid" id="chgrid"></div>
      <div class="ibox"><p style="font-size:13px;font-weight:600;margin-bottom:.5rem">📍 Based in Lagos, Nigeria</p><p style="font-size:13px;color:var(--mu);line-height:1.6">I work with clients across Nigeria and internationally. All consultations available remotely.</p></div>
      <div class="ibox"><p style="font-size:13px;font-weight:600;margin-bottom:.5rem">⏱ Response Time</p><p style="font-size:13px;color:var(--mu);line-height:1.6">WhatsApp &amp; DMs: 2–4 hours<br>Email: within 24 hours</p></div>
    </div>
    <div class="ctform rv d2">
      <h3 style="font-family:'Playfair Display',serif;font-size:1.3rem;margin-bottom:.5rem">Send a message</h3>
      <p style="font-size:13px;color:var(--mu);margin-bottom:2rem">Fill in your details and I'll get back to you shortly.</p>
      <div class="frow">
        <div class="fg"><label class="fl">Full Name</label><input class="fi" id="cn" placeholder="Your name"></div>
        <div class="fg"><label class="fl">Phone / WhatsApp</label><input class="fi" id="cp" placeholder="+234 xxx xxx xxxx"></div>
      </div>
      <div class="fg"><label class="fl">Email Address</label><input class="fi" id="ce" placeholder="your@email.com"></div>
      <div class="fg"><label class="fl">Service Needed</label>
        <select class="fsl" id="cs2" style="margin-top:0">
          <option value="">Select a service...</option>
          <option>Visa Assistance</option><option>Flight Reservation</option>
          <option>Hotel Reservation</option><option>Airport Transfers</option>
          <option>International Admissions</option><option>Event / Proposal Planning</option>
          <option>Full Travel Package</option><option>General Consultation</option>
        </select>
      </div>
      <div class="fg"><label class="fl">Destination / Country</label><input class="fi" id="cd" placeholder="e.g. Canada, UK, Dubai..."></div>
      <div class="fg"><label class="fl">Message</label><textarea class="fta" id="cm" placeholder="Tell me about your travel plans, timeline, and any specific requirements..."></textarea></div>
      <button class="btn btnp" style="width:100%;justify-content:center;cursor:none" onclick="ctsend()">Send Message ✈️</button>
      <div class="okmsg" id="okmsg">✓ Message sent! I'll reach out within 24 hours. For faster response, send me a WhatsApp message.</div>
    </div>
  </div>
</div>
<script>
function pageInit(d){
  const c=d.contact||{};
  const ch=document.getElementById('ch');if(ch)ch.textContent=c.heading||'';
  const cs=document.getElementById('cs');if(cs)cs.textContent=c.subheading||'';
  const cg=document.getElementById('chgrid');
  if(cg)cg.innerHTML=(c.channels||[]).map(ch=>'<a href="'+ch.url+'" class="chbtn" target="_blank"><span style="font-size:2rem">'+ch.icon+'</span><span style="font-weight:600;font-size:14px">'+ch.label+'</span></a>').join('');
}
function ctsend(){
  const n=document.getElementById('cn').value,e=document.getElementById('ce').value;
  if(!n||!e){alert('Please fill in your name and email.');return}
  document.getElementById('okmsg').style.display='block';
  ['cn','cp','ce','cd','cm'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  document.getElementById('cs2').value='';
}
<\/script>`;
  return shell('Contact — Teemie The Visa Girlie','contact',css,body);
}

/* ─────────────────────────────────────────────────────────────────
   PAGE: ADMIN DASHBOARD
───────────────────────────────────────────────────────────────── */
function pgAdmin() {
  return `<!DOCTYPE html><html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin — Teemie The Visa Girlie</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--p:#b478ff;--t:#7de8d0;--pk:#ff6b9d;--a:#ffb347;--bg:#0a0a0f;--bg2:#0f0f18;--bg3:#141420;--sb:#0c0c16;--tx:#f0ede8;--mu:rgba(240,237,232,.56);--fa:rgba(240,237,232,.24);--br:rgba(255,255,255,.08);--bh:rgba(180,120,255,.35)}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--tx);min-height:100vh}
/* ── Login ── */
#ls{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at top,rgba(180,120,255,.08) 0%,transparent 60%)}
.lcard{background:var(--bg2);border:1px solid var(--br);border-radius:24px;padding:3rem;width:380px;max-width:90vw}
.llogo{font-family:'Playfair Display',serif;font-size:1.3rem;text-align:center;margin-bottom:.4rem}
.lsub{text-align:center;font-size:12px;color:var(--fa);letter-spacing:2px;text-transform:uppercase;margin-bottom:2.5rem}
/* ── Dashboard ── */
#dash{display:none;min-height:100vh}
.layout{display:flex;min-height:100vh}
/* sidebar */
.sb{width:240px;background:var(--sb);border-right:1px solid var(--br);padding:1.5rem;position:fixed;top:0;left:0;bottom:0;overflow-y:auto;z-index:100;display:flex;flex-direction:column}
.sblogo{font-family:'Playfair Display',serif;font-size:1rem;margin-bottom:.25rem}
.sbsub{font-size:11px;color:var(--fa);letter-spacing:1px;margin-bottom:2rem}
.sdiv{height:1px;background:var(--br);margin:1.2rem 0}
.slbl{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--fa);margin-bottom:.65rem;font-weight:500}
.snav{display:flex;flex-direction:column;gap:3px}
.ni{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;font-size:13px;font-weight:500;color:var(--mu);cursor:pointer;transition:background .2s,color .2s;border:none;background:none;width:100%;text-align:left}
.ni:hover{background:rgba(255,255,255,.05);color:var(--tx)}
.ni.on{background:rgba(180,120,255,.12);color:var(--p)}
.sbft{margin-top:auto;padding-top:1rem}
.vslink{display:flex;align-items:center;gap:6px;padding:9px 14px;background:rgba(180,120,255,.1);border:1px solid rgba(180,120,255,.3);border-radius:9px;color:var(--p);font-size:13px;font-weight:500;text-decoration:none;margin-bottom:.75rem}
.lobtn{width:100%;background:rgba(255,107,157,.1);border:1px solid rgba(255,107,157,.25);color:var(--pk);border-radius:10px;padding:9px 12px;font-size:13px;font-weight:500;cursor:pointer;transition:background .2s}
.lobtn:hover{background:rgba(255,107,157,.2)}
/* main */
.main{margin-left:240px;flex:1;padding:2rem}
.topbar{margin-bottom:2rem}
.ptitle{font-family:'Playfair Display',serif;font-size:1.6rem}
.psub{font-size:13px;color:var(--mu);margin-top:2px}
/* panels */
.panel{display:none}.panel.on{display:block}
/* stat strip */
.ss{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;margin-bottom:2rem}
.sc2{background:var(--bg2);border:1px solid var(--br);border-radius:14px;padding:1.25rem;text-align:center}
.scn{font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;background:linear-gradient(135deg,var(--p),var(--t));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.scl{font-size:12px;color:var(--fa);margin-top:4px}
/* edit blocks */
.eb{background:var(--bg2);border:1px solid var(--br);border-radius:14px;padding:1.75rem;margin-bottom:1.5rem}
.ebt{font-weight:600;font-size:15px;margin-bottom:1.25rem;display:flex;align-items:center;gap:8px}
/* form */
.fg{margin-bottom:1.1rem}
.fl{display:block;font-size:12px;font-weight:500;color:var(--mu);margin-bottom:6px;letter-spacing:.5px}
.fi,.fta,.fsl{width:100%;padding:10px 14px;background:var(--bg);border:1px solid var(--br);border-radius:8px;color:var(--tx);font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
.fi::placeholder,.fta::placeholder{color:var(--fa)}
.fi:focus,.fta:focus,.fsl:focus{border-color:var(--p)}
.fsl option{background:var(--bg2);color:var(--tx)}
.fta{resize:vertical;min-height:80px}
.fr2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.sv{background:linear-gradient(135deg,var(--p),var(--t));color:#0a0a0f;border:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .2s;font-family:'DM Sans',sans-serif}
.sv:hover{opacity:.85}
.db{background:rgba(255,107,157,.1);border:1px solid rgba(255,107,157,.3);color:var(--pk);padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif}
.db:hover{background:rgba(255,107,157,.2)}
/* list */
.il{display:flex;flex-direction:column;gap:.75rem;margin-bottom:1.5rem}
.li{background:var(--bg3);border:1px solid var(--br);border-radius:10px;padding:1rem 1.25rem;display:flex;align-items:flex-start;gap:1rem;justify-content:space-between}
.lit{font-weight:600;font-size:14px;margin-bottom:4px}
.lis{font-size:12px;color:var(--mu);line-height:1.5}
.addform{background:var(--bg3);border:1px solid var(--bh);border-radius:12px;padding:1.5rem;margin-top:1rem}
.addtitle{font-size:13px;font-weight:600;margin-bottom:1rem;color:var(--p)}
/* toast */
.toast{position:fixed;bottom:2rem;right:2rem;background:var(--bg2);border:1px solid var(--br);border-radius:12px;padding:1rem 1.5rem;font-size:13px;font-weight:500;z-index:9999;display:none;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,.4);animation:tin .3s}
.toast.show{display:flex}
.tok{border-color:rgba(125,232,208,.4);color:var(--t)}
.terr{border-color:rgba(255,107,157,.4);color:var(--pk)}
@keyframes tin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media(max-width:768px){.sb{width:100%;height:auto;position:static}.main{margin-left:0}.layout{flex-direction:column}.fr2{grid-template-columns:1fr}}
</style>
</head>
<body>

<!-- ── Login Screen ── -->
<div id="ls">
  <div class="lcard">
    <div class="llogo">Teemie ✦ Admin</div>
    <div class="lsub">Dashboard Access</div>
    <div class="fg"><label class="fl">Username</label><input class="fi" id="lu" value="teemie"></div>
    <div class="fg"><label class="fl">Password</label><input class="fi" type="password" id="lp" value="teemie2026"></div>
    <button class="sv" style="width:100%;padding:13px" onclick="doLogin()">Sign In →</button>
    <p id="lerr" style="color:var(--pk);font-size:12px;margin-top:.75rem;text-align:center"></p>
    <p style="font-size:11px;color:var(--fa);margin-top:1.5rem;text-align:center">Default credentials: teemie / teemie2026</p>
  </div>
</div>

<!-- ── Dashboard ── -->
<div id="dash">
 <div class="layout">

  <!-- Sidebar -->
  <aside class="sb">
    <div class="sblogo">Teemie ✦ Admin</div>
    <div class="sbsub">Content Dashboard</div>
    <div class="slbl">Pages</div>
    <div class="snav">
      <button class="ni on" onclick="sp('ov',this)">📊 Overview</button>
      <button class="ni"    onclick="sp('home',this)">🏠 Home Page</button>
      <button class="ni"    onclick="sp('svc',this)">✈️ Services</button>
      <button class="ni"    onclick="sp('ab',this)">👤 About</button>
      <button class="ni"    onclick="sp('te',this)">⭐ Testimonials</button>
      <button class="ni"    onclick="sp('bl',this)">📝 Blog Posts</button>
      <button class="ni"    onclick="sp('fq',this)">❓ FAQ</button>
      <button class="ni"    onclick="sp('ct',this)">💬 Contact</button>
    </div>
    <div class="sdiv"></div>
    <div class="slbl">Settings</div>
    <div class="snav">
      <button class="ni" onclick="sp('gl',this)">⚙️ Global Settings</button>
      <button class="ni" onclick="sp('pw',this)">🔑 Change Password</button>
    </div>
    <div class="sbft">
      <a href="/" target="_blank" class="vslink">🌐 View Live Site</a>
      <button class="lobtn" onclick="doLogout()">Sign Out</button>
    </div>
  </aside>

  <!-- Main -->
  <main class="main">

    <!-- Overview -->
    <div class="panel on" id="p-ov">
      <div class="topbar"><div class="ptitle">Welcome back, Teemie ✦</div><div class="psub">Manage all your website content from here.</div></div>
      <div class="ss" id="ovss"></div>
      <div class="eb">
        <div class="ebt">🚀 Quick Actions</div>
        <div style="display:flex;flex-wrap:wrap;gap:.75rem">
          <button class="sv" onclick="spn('svc')">Edit Services</button>
          <button class="sv" onclick="spn('te')">Add Testimonial</button>
          <button class="sv" onclick="spn('bl')">Add Blog Post</button>
          <button class="sv" onclick="spn('fq')">Edit FAQs</button>
          <button class="sv" onclick="spn('gl')">Update Contact Info</button>
        </div>
      </div>
      <div class="eb">
        <div class="ebt">📌 Live Pages</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.75rem" id="ovpages"></div>
      </div>
    </div>

    <!-- Home -->
    <div class="panel" id="p-home">
      <div class="topbar"><div class="ptitle">Home Page</div><div class="psub">Edit hero section and quote.</div></div>
      <div class="eb">
        <div class="ebt">🏠 Hero Content</div>
        <div class="fr2">
          <div class="fg"><label class="fl">Your Name</label><input class="fi" id="h_n" placeholder="Teemie"></div>
          <div class="fg"><label class="fl">Subtitle</label><input class="fi" id="h_s" placeholder="The Visa Girlie"></div>
        </div>
        <div class="fr2">
          <div class="fg"><label class="fl">Tagline</label><input class="fi" id="h_t" placeholder="Senior Travel Consultant"></div>
          <div class="fg"><label class="fl">Badge Text</label><input class="fi" id="h_b" placeholder="Available for Bookings"></div>
        </div>
        <div class="fg"><label class="fl">Hero Description</label><textarea class="fta" id="h_d"></textarea></div>
        <div class="fg"><label class="fl">Quote</label><textarea class="fta" id="h_q"></textarea></div>
        <button class="sv" onclick="saveHome()">Save Home Page</button>
      </div>
    </div>

    <!-- Services -->
    <div class="panel" id="p-svc">
      <div class="topbar"><div class="ptitle">Services</div><div class="psub">Manage all service offerings.</div></div>
      <div class="eb">
        <div class="ebt">⚙️ Section Heading</div>
        <div class="fg"><label class="fl">Heading</label><input class="fi" id="sv_h"></div>
        <div class="fg"><label class="fl">Subheading</label><textarea class="fta" id="sv_s" style="min-height:60px"></textarea></div>
        <button class="sv" onclick="saveSvH()">Save Heading</button>
      </div>
      <div class="eb">
        <div class="ebt">📋 Services List</div>
        <div class="il" id="svlist"></div>
        <div class="addform">
          <div class="addtitle">+ Add New Service</div>
          <div class="fr2">
            <div class="fg"><label class="fl">Name</label><input class="fi" id="ns_n" placeholder="Service Name"></div>
            <div class="fg"><label class="fl">Emoji</label><input class="fi" id="ns_e" placeholder="✈️" maxlength="4"></div>
          </div>
          <div class="fg"><label class="fl">Description</label><textarea class="fta" id="ns_d" style="min-height:60px"></textarea></div>
          <div class="fr2">
            <div class="fg"><label class="fl">Price</label><input class="fi" id="ns_p" placeholder="From ₦50,000"></div>
            <div class="fg"><label class="fl">Accent Color</label><input class="fi" id="ns_a" placeholder="#b478ff"></div>
          </div>
          <button class="sv" onclick="addSvc()">Add Service</button>
        </div>
      </div>
    </div>

    <!-- About -->
    <div class="panel" id="p-ab">
      <div class="topbar"><div class="ptitle">About Page</div><div class="psub">Edit your story and bio.</div></div>
      <div class="eb">
        <div class="ebt">👤 About Content</div>
        <div class="fg"><label class="fl">Heading</label><input class="fi" id="ab_h"></div>
        <div class="fg"><label class="fl">Bio — Paragraph 1</label><textarea class="fta" id="ab_b0"></textarea></div>
        <div class="fg"><label class="fl">Bio — Paragraph 2</label><textarea class="fta" id="ab_b1"></textarea></div>
        <div class="fg"><label class="fl">Bio — Paragraph 3</label><textarea class="fta" id="ab_b2"></textarea></div>
        <div class="fg"><label class="fl">Chips (comma-separated)</label><input class="fi" id="ab_c" placeholder="Visa Expert, Project Manager, ..."></div>
        <button class="sv" onclick="saveAbout()">Save About Page</button>
      </div>
    </div>

    <!-- Testimonials -->
    <div class="panel" id="p-te">
      <div class="topbar"><div class="ptitle">Testimonials</div><div class="psub">Add, edit or remove client reviews.</div></div>
      <div class="eb">
        <div class="ebt">⭐ Client Reviews</div>
        <div class="il" id="telist"></div>
        <div class="addform">
          <div class="addtitle">+ Add Testimonial</div>
          <div class="fr2">
            <div class="fg"><label class="fl">Client Name</label><input class="fi" id="nt_n" placeholder="Adaeze O."></div>
            <div class="fg"><label class="fl">Location (From → To)</label><input class="fi" id="nt_l" placeholder="Lagos → Canada"></div>
          </div>
          <div class="fg"><label class="fl">Testimonial Text</label><textarea class="fta" id="nt_t" placeholder="What they said..."></textarea></div>
          <div class="fr2">
            <div class="fg"><label class="fl">Service Used</label><input class="fi" id="nt_s" placeholder="Visa Assistance"></div>
            <div class="fg"><label class="fl">Rating (1–5)</label><input class="fi" id="nt_r" type="number" min="1" max="5" value="5"></div>
          </div>
          <button class="sv" onclick="addTe()">Add Testimonial</button>
        </div>
      </div>
    </div>

    <!-- Blog -->
    <div class="panel" id="p-bl">
      <div class="topbar"><div class="ptitle">Blog Posts</div><div class="psub">Manage travel tips and guides.</div></div>
      <div class="eb">
        <div class="ebt">📝 Published Posts</div>
        <div class="il" id="bllist"></div>
        <div class="addform">
          <div class="addtitle">+ Add Blog Post</div>
          <div class="fr2">
            <div class="fg"><label class="fl">Title</label><input class="fi" id="nb_t" placeholder="Post title"></div>
            <div class="fg"><label class="fl">Category</label><input class="fi" id="nb_c" placeholder="Visa Guide"></div>
          </div>
          <div class="fg"><label class="fl">Excerpt</label><textarea class="fta" id="nb_e" style="min-height:60px" placeholder="Short description..."></textarea></div>
          <div class="fr2">
            <div class="fg"><label class="fl">Emoji</label><input class="fi" id="nb_m" placeholder="✈️" maxlength="4"></div>
            <div class="fg"><label class="fl">Read Time</label><input class="fi" id="nb_r" placeholder="5 min read"></div>
          </div>
          <button class="sv" onclick="addBl()">Publish Post</button>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="panel" id="p-fq">
      <div class="topbar"><div class="ptitle">FAQ</div><div class="psub">Manage frequently asked questions.</div></div>
      <div class="eb">
        <div class="ebt">❓ Questions &amp; Answers</div>
        <div class="il" id="fqlist"></div>
        <div class="addform">
          <div class="addtitle">+ Add FAQ</div>
          <div class="fg"><label class="fl">Question</label><input class="fi" id="nf_q" placeholder="Question..."></div>
          <div class="fg"><label class="fl">Answer</label><textarea class="fta" id="nf_a" placeholder="Answer..."></textarea></div>
          <button class="sv" onclick="addFq()">Add FAQ</button>
        </div>
      </div>
    </div>

    <!-- Contact -->
    <div class="panel" id="p-ct">
      <div class="topbar"><div class="ptitle">Contact Page</div><div class="psub">Edit contact page content.</div></div>
      <div class="eb">
        <div class="ebt">💬 Contact Content</div>
        <div class="fg"><label class="fl">Heading</label><input class="fi" id="ct_h"></div>
        <div class="fg"><label class="fl">Subheading</label><textarea class="fta" id="ct_s" style="min-height:70px"></textarea></div>
        <button class="sv" onclick="saveCt()">Save Contact Page</button>
      </div>
    </div>

    <!-- Global Settings -->
    <div class="panel" id="p-gl">
      <div class="topbar"><div class="ptitle">Global Settings</div><div class="psub">Update contact info across the entire site.</div></div>
      <div class="eb">
        <div class="ebt">🌐 Site Information</div>
        <div class="fr2">
          <div class="fg"><label class="fl">Site Name</label><input class="fi" id="g_sn"></div>
          <div class="fg"><label class="fl">Tagline</label><input class="fi" id="g_tl"></div>
        </div>
        <div class="fr2">
          <div class="fg"><label class="fl">WhatsApp Number</label><input class="fi" id="g_wa" placeholder="+2348101149438"></div>
          <div class="fg"><label class="fl">Email Address</label><input class="fi" id="g_em" placeholder="teemie@visagirlie.com"></div>
        </div>
        <div class="fr2">
          <div class="fg"><label class="fl">TikTok URL</label><input class="fi" id="g_tk"></div>
          <div class="fg"><label class="fl">Instagram URL</label><input class="fi" id="g_ig"></div>
        </div>
        <div class="fg"><label class="fl">Location</label><input class="fi" id="g_lo" placeholder="Lagos, Nigeria"></div>
        <button class="sv" onclick="saveGl()">Save Global Settings</button>
      </div>
    </div>

    <!-- Change Password -->
    <div class="panel" id="p-pw">
      <div class="topbar"><div class="ptitle">Change Password</div></div>
      <div class="eb" style="max-width:400px">
        <div class="fg"><label class="fl">New Password</label><input class="fi" type="password" id="pw1" placeholder="New password"></div>
        <div class="fg"><label class="fl">Confirm Password</label><input class="fi" type="password" id="pw2" placeholder="Confirm password"></div>
        <button class="sv" onclick="chgPw()">Update Password</button>
      </div>
    </div>

  </main>
 </div>
</div>
<div class="toast" id="toast"></div>

<script>
let tok=localStorage.getItem('adm_tok');
let CD={};

/* ── Auth ── */
async function doLogin(){
  const u=document.getElementById('lu').value,p=document.getElementById('lp').value;
  const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
  const d=await r.json();
  if(d.token){tok=d.token;localStorage.setItem('adm_tok',tok);enter();}
  else document.getElementById('lerr').textContent='Invalid username or password.';
}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.getElementById('ls').style.display!=='none')doLogin()});
async function doLogout(){await fetch('/api/admin/logout',{method:'POST'});localStorage.removeItem('adm_tok');location.reload()}
async function enter(){document.getElementById('ls').style.display='none';document.getElementById('dash').style.display='block';await loadCD()}

/* ── API helpers ── */
const H=()=>({'Content-Type':'application/json','Authorization':'Bearer '+tok});
async function aGet(u){return(await fetch(u,{headers:H()})).json()}
async function aPut(u,b){return(await fetch(u,{method:'PUT',headers:H(),body:JSON.stringify(b)})).json()}
async function aPost(u,b){return(await fetch(u,{method:'POST',headers:H(),body:JSON.stringify(b)})).json()}
async function aDel(u){return(await fetch(u,{method:'DELETE',headers:H()})).json()}

async function loadCD(){const r=await fetch('/api/content');CD=await r.json();popAll()}
function popAll(){popOv();popHome();popSvc();popAb();popTe();popBl();popFq();popCt();popGl()}

/* ── Toast ── */
function toast(m,t='ok'){const el=document.getElementById('toast');el.textContent=(t==='ok'?'✓ ':'✗ ')+m;el.className='toast show '+(t==='ok'?'tok':'terr');setTimeout(()=>el.classList.remove('show'),3000)}

/* ── Panel nav ── */
function sp(id,btn){document.querySelectorAll('.panel').forEach(p=>p.classList.remove('on'));document.querySelectorAll('.ni').forEach(n=>n.classList.remove('on'));document.getElementById('p-'+id).classList.add('on');if(btn)btn.classList.add('on')}
function spn(id){document.querySelectorAll('.panel').forEach(p=>p.classList.remove('on'));document.querySelectorAll('.ni').forEach(n=>n.classList.remove('on'));document.getElementById('p-'+id).classList.add('on')}

/* ── Overview ── */
function popOv(){
  document.getElementById('ovss').innerHTML=[
    {n:CD.services?.items?.length||0,l:'Services'},
    {n:CD.testimonials?.items?.length||0,l:'Testimonials'},
    {n:CD.blog?.posts?.length||0,l:'Blog Posts'},
    {n:CD.faq?.items?.length||0,l:'FAQs'}
  ].map(s=>'<div class="sc2"><div class="scn">'+s.n+'</div><div class="scl">'+s.l+'</div></div>').join('');
  document.getElementById('ovpages').innerHTML=[
    {h:'/',label:'🏠 Home'},{h:'/services',label:'✈️ Services'},{h:'/about',label:'👤 About'},
    {h:'/testimonials',label:'⭐ Testimonials'},{h:'/blog',label:'📝 Blog'},{h:'/faq',label:'❓ FAQ'},{h:'/contact',label:'💬 Contact'}
  ].map(p=>'<a href="'+p.h+'" target="_blank" style="display:flex;align-items:center;gap:6px;padding:10px 14px;background:rgba(180,120,255,.08);border:1px solid var(--bh);border-radius:8px;color:var(--p);font-size:13px;text-decoration:none">'+p.label+'</a>').join('');
}

/* ── Home ── */
function popHome(){const h=CD.home||{};const f=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v||''};f('h_n',h.heroName);f('h_s',h.heroSubtitle);f('h_t',h.heroTagline);f('h_b',h.heroBadge);f('h_d',h.heroDescription);f('h_q',h.quote)}
async function saveHome(){const v=id=>document.getElementById(id)?.value;await aPut('/api/admin/content/home',{heroName:v('h_n'),heroSubtitle:v('h_s'),heroTagline:v('h_t'),heroBadge:v('h_b'),heroDescription:v('h_d'),quote:v('h_q'),stats:CD.home?.stats});toast('Home page saved!')}

/* ── Services ── */
function popSvc(){const s=CD.services||{};const f=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v||''};f('sv_h',s.heading);f('sv_s',s.subheading);const l=document.getElementById('svlist');if(l)l.innerHTML=(s.items||[]).map((it,i)=>'<div class="li"><div><div class="lit">'+it.emoji+' '+it.name+'</div><div class="lis">'+it.price+' · '+it.desc.substring(0,65)+'...</div></div><button class="db" onclick="delSvc('+i+')">Remove</button></div>').join('')}
async function saveSvH(){await aPut('/api/admin/content/services',{...CD.services,heading:document.getElementById('sv_h')?.value,subheading:document.getElementById('sv_s')?.value});await loadCD();toast('Heading saved!')}
async function addSvc(){const v=id=>document.getElementById(id)?.value;const it={id:Date.now(),name:v('ns_n'),emoji:v('ns_e')||'✈️',desc:v('ns_d'),price:v('ns_p'),accent:v('ns_a')||'#b478ff'};if(!it.name)return toast('Name required.','err');const items=[...(CD.services?.items||[]),it];await aPut('/api/admin/content/services',{...CD.services,items});await loadCD();toast('Service added!')}
async function delSvc(i){if(!confirm('Remove this service?'))return;const items=[...(CD.services?.items||[])];items.splice(i,1);await aPut('/api/admin/content/services',{...CD.services,items});await loadCD();toast('Removed.')}

/* ── About ── */
function popAb(){const a=CD.about||{};const el=id=>document.getElementById(id);if(el('ab_h'))el('ab_h').value=a.heading||'';(a.bio||[]).forEach((p,i)=>{const e=el('ab_b'+i);if(e)e.value=p});if(el('ab_c'))el('ab_c').value=(a.chips||[]).join(', ')}
async function saveAbout(){const v=id=>document.getElementById(id)?.value;const bio=[0,1,2].map(i=>v('ab_b'+i)).filter(Boolean);const chips=v('ab_c').split(',').map(c=>c.trim()).filter(Boolean);await aPut('/api/admin/content/about',{heading:v('ab_h'),bio,chips});toast('About page saved!')}

/* ── Testimonials ── */
function popTe(){const l=document.getElementById('telist');if(!l)return;l.innerHTML=(CD.testimonials?.items||[]).map((t,i)=>'<div class="li"><div><div class="lit">'+t.name+' · '+t.location+'</div><div class="lis">'+t.service+' · "'+t.text.substring(0,65)+'..."</div></div><button class="db" onclick="delTe('+i+')">Remove</button></div>').join('')}
async function addTe(){const v=id=>document.getElementById(id)?.value;const it={name:v('nt_n'),location:v('nt_l'),text:v('nt_t'),service:v('nt_s'),rating:parseInt(v('nt_r'))||5};if(!it.name||!it.text)return toast('Name and text required.','err');await aPost('/api/admin/testimonials',it);await loadCD();toast('Testimonial added!')}
async function delTe(i){if(!confirm('Remove?'))return;await aDel('/api/admin/testimonials/'+i);await loadCD();toast('Removed.')}

/* ── Blog ── */
function popBl(){const l=document.getElementById('bllist');if(!l)return;l.innerHTML=(CD.blog?.posts||[]).map(p=>'<div class="li"><div><div class="lit">'+(p.emoji||'📝')+' '+p.title+'</div><div class="lis">'+p.category+' · '+p.date+' · '+p.readTime+'</div></div><button class="db" onclick="delBl('+p.id+')">Remove</button></div>').join('')}
async function addBl(){const v=id=>document.getElementById(id)?.value;const p={title:v('nb_t'),category:v('nb_c'),excerpt:v('nb_e'),emoji:v('nb_m')||'📝',readTime:v('nb_r')||'5 min read'};if(!p.title)return toast('Title required.','err');await aPost('/api/admin/blog',p);await loadCD();toast('Post published!')}
async function delBl(id){if(!confirm('Delete?'))return;await aDel('/api/admin/blog/'+id);await loadCD();toast('Deleted.')}

/* ── FAQ ── */
function popFq(){const l=document.getElementById('fqlist');if(!l)return;l.innerHTML=(CD.faq?.items||[]).map((f,i)=>'<div class="li"><div><div class="lit">'+f.q+'</div><div class="lis">'+f.a.substring(0,80)+'...</div></div><button class="db" onclick="delFq('+i+')">Remove</button></div>').join('')}
async function addFq(){const v=id=>document.getElementById(id)?.value;const it={q:v('nf_q'),a:v('nf_a')};if(!it.q||!it.a)return toast('Question and answer required.','err');await aPost('/api/admin/faq',it);await loadCD();toast('FAQ added!')}
async function delFq(i){if(!confirm('Remove?'))return;await aDel('/api/admin/faq/'+i);await loadCD();toast('Removed.')}

/* ── Contact ── */
function popCt(){const c=CD.contact||{};const el=id=>document.getElementById(id);if(el('ct_h'))el('ct_h').value=c.heading||'';if(el('ct_s'))el('ct_s').value=c.subheading||''}
async function saveCt(){const v=id=>document.getElementById(id)?.value;await aPut('/api/admin/content/contact',{...CD.contact,heading:v('ct_h'),subheading:v('ct_s')});toast('Contact page saved!')}

/* ── Global ── */
function popGl(){const g=CD.global||{};const f=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v||''};f('g_sn',g.siteName);f('g_tl',g.tagline);f('g_wa',g.phone);f('g_em',g.email);f('g_tk',g.tiktok);f('g_ig',g.instagram);f('g_lo',g.location)}
async function saveGl(){const v=id=>document.getElementById(id)?.value;const wa=(v('g_wa')||'').replace(/\\D/g,'');await aPut('/api/admin/content/global',{siteName:v('g_sn'),tagline:v('g_tl'),phone:v('g_wa'),whatsapp:'https://wa.me/'+wa,email:v('g_em'),tiktok:v('g_tk'),instagram:v('g_ig'),location:v('g_lo')});toast('Global settings saved!')}

/* ── Password ── */
async function chgPw(){const p=document.getElementById('pw1').value,c=document.getElementById('pw2').value;if(!p||p.length<6)return toast('Min 6 characters.','err');if(p!==c)return toast('Passwords do not match.','err');await aPut('/api/admin/password',{newPassword:p});document.getElementById('pw1').value='';document.getElementById('pw2').value='';toast('Password updated!')}

/* ── Auto-login ── */
if(tok)fetch('/api/content').then(r=>{if(r.ok)enter();else{localStorage.removeItem('adm_tok');tok=null}});
<\/script>
</body></html>`;
}

/* ─────────────────────────────────────────────────────────────────
   HTTP SERVER  (pure Node.js — zero dependencies)
───────────────────────────────────────────────────────────────── */
function body(req) {
  return new Promise((res,rej)=>{
    let s='';
    req.on('data',c=>s+=c);
    req.on('end',()=>{try{res(JSON.parse(s||'{}')}catch{res({})}});
    req.on('error',rej);
  });
}
function json(res,status,data){ const s=JSON.stringify(data); res.writeHead(status,{'Content-Type':'application/json','Content-Length':Buffer.byteLength(s)}); res.end(s); }
function html(res,content){ res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); res.end(content); }
function auth(req){ const a=(req.headers['authorization']||'').replace('Bearer ',''); return a?verify(a):null; }

const PAGES = {
  '/':             pgHome,
  '/services':     pgServices,
  '/about':        pgAbout,
  '/testimonials': pgTestimonials,
  '/blog':         pgBlog,
  '/faq':          pgFaq,
  '/contact':      pgContact,
  '/admin':        pgAdmin,
};

http.createServer(async(req,res)=>{
  const p = url.parse(req.url).pathname.replace(/\/+$/,'')||'/';
  const m = req.method;

  /* ── Public content API ── */
  if(p==='/api/content'&&m==='GET'){
    const {admin,...pub}=readData(); return json(res,200,pub);
  }
  if(p.startsWith('/api/content/')&&m==='GET'){
    const sec=p.split('/')[3]; const d=readData();
    if(!d[sec]||sec==='admin') return json(res,404,{error:'Not found'});
    return json(res,200,d[sec]);
  }

  /* ── Admin auth ── */
  if(p==='/api/admin/login'&&m==='POST'){
    const b=await body(req); const d=readData();
    if(b.username===d.admin.username&&hash(b.password)===d.admin.password)
      return json(res,200,{success:true,token:sign({username:b.username})});
    return json(res,401,{error:'Invalid credentials'});
  }
  if(p==='/api/admin/logout'&&m==='POST') return json(res,200,{success:true});

  /* ── Protected API ── */
  if(p.startsWith('/api/admin/')){
    if(!auth(req)) return json(res,401,{error:'Unauthorized'});
    const b=await body(req); const d=readData();
    const parts=p.split('/').filter(Boolean);

    if(parts[2]==='content'&&parts[3]&&m==='PUT'){
      const sec=parts[3]; if(sec==='admin') return json(res,403,{error:'Forbidden'});
      d[sec]={...d[sec],...b}; writeData(d); return json(res,200,{success:true});
    }
    if(parts[2]==='password'&&m==='PUT'){
      d.admin.password=hash(b.newPassword); writeData(d); return json(res,200,{success:true});
    }
    if(parts[2]==='testimonials'){
      if(m==='POST'){d.testimonials.items.push(b);writeData(d);return json(res,200,{success:true})}
      if(m==='DELETE'&&parts[3]!=null){d.testimonials.items.splice(+parts[3],1);writeData(d);return json(res,200,{success:true})}
    }
    if(parts[2]==='blog'){
      if(m==='POST'){d.blog.posts.unshift({...b,id:Date.now(),date:new Date().toISOString().split('T')[0]});writeData(d);return json(res,200,{success:true})}
      if(m==='DELETE'&&parts[3]){d.blog.posts=d.blog.posts.filter(x=>x.id!==+parts[3]);writeData(d);return json(res,200,{success:true})}
    }
    if(parts[2]==='faq'){
      if(m==='POST'){d.faq.items.push(b);writeData(d);return json(res,200,{success:true})}
      if(m==='DELETE'&&parts[3]!=null){d.faq.items.splice(+parts[3],1);writeData(d);return json(res,200,{success:true})}
    }
    return json(res,404,{error:'Not found'});
  }

  /* ── HTML Pages ── */
  if(PAGES[p]&&m==='GET') return html(res, PAGES[p]());

  json(res,404,{error:'Page not found'});

}).listen(PORT,()=>{
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║   ✦  Teemie The Visa Girlie — Website Live  ✦  ║');
  console.log('╠═══════════════════════════════════════════════╣');
  console.log('║  🌐  Site:   http://localhost:'+PORT+'              ║');
  console.log('║  🔐  Admin:  http://localhost:'+PORT+'/admin        ║');
  console.log('║  👤  Login:  teemie  /  teemie2026          ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
});
