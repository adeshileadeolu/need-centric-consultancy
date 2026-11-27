import {useState,useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import {Routes,Route,Link,NavLink,useParams,useLocation} from 'react-router-dom';
import {brand,social,services,stages,industries,models,articles,countries,photos,stories,visServices,visProblems,problems,questions,principles,why,team,stageOut} from './data.js';

const Seo=({t,d})=>{useEffect(()=>{document.title=t+' | '+brand.name;document.querySelector('meta[name=description]')?.setAttribute('content',d)},[t,d]);return null};
const Head=({k,h,p})=><header className="head"><p className="kick">{k}</p><h1>{h}</h1>{p&&<p className="lead">{p}</p>}</header>;

function Form({type,fields,cta,done}){
  const [v,setV]=useState({}),[err,setErr]=useState({}),[st,setSt]=useState('idle'),[msg,setMsg]=useState('');
  const submit=async e=>{e.preventDefault();const er={};
    fields.forEach(([n,l,t,req])=>{if(req&&!v[n]?.trim())er[n]='Required';if(t==='email'&&v[n]&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v[n]))er[n]='Enter a valid email'});
    setErr(er);if(Object.keys(er).length)return;setSt('sending');
    try{const r=await fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({formType:type,...v})});
      if(!r.ok)throw new Error((await r.json()).error);setSt('done')}catch(x){setMsg(x.message||'Something went wrong.');setSt('error')}};
  if(st==='done')return <div className="card ok" role="status"><h3>Thank you</h3><p>{done}</p></div>;
  return <form className="card form" onSubmit={submit} noValidate>
    <input name="website_hp" tabIndex="-1" autoComplete="off" className="hp" onChange={e=>setV({...v,website_hp:e.target.value})}/>
    {fields.map(([n,l,t,req,opts])=><label key={n}>{l}{req&&' *'}
      {t==='textarea'?<textarea rows="3" onChange={e=>setV({...v,[n]:e.target.value})}/>:t==='select'?<select onChange={e=>setV({...v,[n]:e.target.value})}><option value="">Select…</option>{opts.map(o=><option key={o}>{o}</option>)}</select>:<input type={t} onChange={e=>setV({...v,[n]:e.target.value})}/>}
      {err[n]&&<span className="err" role="alert">{err[n]}</span>}</label>)}
    {st==='error'&&<p className="err" role="alert">{msg}</p>}
    <button className="btn" disabled={st==='sending'}>{st==='sending'?'Sending…':cta}</button></form>;
}
const ind=industries.map(i=>i[0]);
const base=[['org','Organisation name','text',1],['website','Website URL','url'],['industry','Industry','select',1,ind]];
const assessF=[...base,['country','Country','select',1,countries],['name','Contact person','text',1],['email','Business email','email',1],['challenges','Current digital challenges','textarea'],['objectives','Specific objectives','textarea']];
const propF=[...base,['areas','Areas requiring improvement','textarea',1],['objectives','Business objectives','textarea',1],['outcomes','Expected outcomes','textarea'],['budget','Available budget (optional)','text'],['name','Contact person','text',1],['email','Email','email',1],['phone','Phone / WhatsApp','text']];

function PrintReport({r,sp,facts}){
  const iss=r.findings.filter(f=>f.s!=='pass'),ok=r.findings.filter(f=>f.s==='pass'),M=sp.mobile,D=sp.desktop,hasSp=M?.scores||D?.scores;
  const date=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}),v=(x,k)=>x?.scores?.[k]??'n/a',vt=(x,k)=>x?.vitals?.[k]?x.vitals[k].v+' ('+RL[x.vitals[k].r]+')':'n/a';
  return createPortal(<div id="print-root">
    <header className="pr-head"><div><p className="pr-kick">Assessment report</p><h1>Website Assessment Report</h1><p><b>Website:</b> {r.url}</p><p><b>Date issued:</b> {date}</p><p><b>Prepared by:</b> {brand.name}</p></div><div className="pr-brand"><Logo/><p>Visibility Creates Opportunity.</p></div></header>
    <section className="pr-sum"><div className="pr-score"><b>{r.overall}</b><span>/ 100</span></div><div><h2>{lab(r.overall)[0]} overall</h2><p>{verdict(r.overall)} {ok.length} of {r.findings.length} automated checks passed; {iss.length} to review.</p></div></section>
    <h2>Scores by area</h2><table className="pr-t pr-s"><thead><tr><th>Area</th><th>What it tells you</th><th>Score</th><th>Rating</th></tr></thead><tbody>{r.lenses.map(x=><tr key={x.n}><td><b>{x.n}</b></td><td>{PLAIN[x.n][0]}</td><td>{x.v}/100</td><td>{lab(x.v)[0]}</td></tr>)}</tbody></table>
    <h2>Fix these first</h2><ol className="pr-ol">{r.priority.map((x,i)=><li key={i}><b>{x.msg}</b> <em>{IMP(x.w)} impact · {x.lens}</em><br/>{x.fix}</li>)}</ol>
    <h2>Speed · Google PageSpeed Insights</h2>{hasSp?<table className="pr-t pr-p"><thead><tr><th>Measure</th><th>Mobile</th><th>Desktop</th></tr></thead><tbody>{[['Performance','performance'],['Accessibility','accessibility'],['Best practices','best-practices'],['Search (SEO)','seo']].map(([n,k])=><tr key={k}><td>{n}</td><td>{v(M,k)}</td><td>{v(D,k)}</td></tr>)}{Object.keys(VH).map(k=><tr key={k}><td>{k}<small> · {VH[k]}</small></td><td>{vt(M,k)}</td><td>{vt(D,k)}</td></tr>)}</tbody></table>:<p>Speed results were not available when this report was printed.</p>}
    <h2>Findings that need attention</h2>{iss.length?<table className="pr-t pr-i"><thead><tr><th>Area</th><th>Finding</th><th>Recommended action</th><th>Status</th></tr></thead><tbody>{iss.map((f,i)=><tr key={i}><td>{f.lens}</td><td>{f.msg}</td><td>{f.fix}</td><td>{f.s==='fail'?'Fix':'Review'}</td></tr>)}</tbody></table>:<p>No issues were flagged by the automated checks.</p>}
    <h2>Checks passed ({ok.length})</h2><ul className="pr-pass">{ok.map((f,i)=><li key={i}>{f.msg}</li>)}</ul>
    <h2>Site profile</h2><table className="pr-t pr-f"><tbody>{facts.map(([a,b])=><tr key={a}><td>{a}</td><td>{b}</td></tr>)}</tbody></table>
    <footer className="pr-foot"><p><b>About this report.</b> This report contains automated indicators gathered at the time of issue from publicly available information and Google PageSpeed Insights. It is an initial health check, not a strategic assessment, and it does not guarantee search rankings, traffic or revenue. A Business Opportunity Assessment adds competitor, market and positioning analysis that automated tools cannot provide.</p><p>{brand.name} · {brand.email}</p></footer>
  </div>,document.body)}
const PLAIN={Discoverability:['Can people find you on Google?','How easy it is for search engines, and the customers using them, to find and understand your site.'],Positioning:['Does your brand look credible?','How professional and recognisable your brand appears in search results and when links are shared.'],Conversion:['Can interested visitors contact you?','Whether visitors are guided toward getting in touch, and whether you can measure it.'],Trust:['Does the site give reasons to trust you?','The proof and reassurance visitors look for before they enquire.'],Experience:['Is the site fast, safe and phone-friendly?','How the site feels to use, especially on mobile where most visitors browse.'],Technical:['Is the site healthy behind the scenes?','Security and set-up details that protect visitors and help the site run well.']};
const VH={'First Contentful Paint':'How fast something first appears','Largest Contentful Paint':'How fast the main content loads','Total Blocking Time':'How quickly the page reacts to taps','Cumulative Layout Shift':'Whether the page jumps around','Speed Index':'How fast the page fills in'};
const lab=v=>v>=80?['Strong','good']:v>=60?['Fair','ok']:['Needs work','poor'],IMP=w=>w>=3?'High':w>=2?'Medium':'Low',RL={good:'Good',ok:'Needs work',poor:'Poor'};
const verdict=v=>v>=80?'Your site has a strong foundation. What remains are refinements.':v>=60?'Your site is solid in places, but is leaving visibility and enquiries on the table.':'Your site has significant gaps that are likely costing you visitors and enquiries.';
const jf=async u=>{const x=await fetch(u),t=await x.text();let j;try{j=JSON.parse(t)}catch{throw new Error('The assessment service is not reachable. Locally, restart with npm run dev; once deployed, make sure the /api functions are enabled.')}if(!x.ok)throw new Error(j.error);return j};
const SI={pass:'✓',warn:'!',fail:'✕'};
function Quick(){
  const id=useRef(0);
  const [u,setU]=useState(''),[r,setR]=useState(null),[sp,setSp]=useState({}),[st,setSt]=useState('mobile'),[e,setE]=useState(''),[l,setL]=useState(false),[tab,setTab]=useState('overview'),[fl,setFl]=useState('issues');
  const close=()=>{id.current++;setR(null);setSp({});setE('');setL(false)};
  const run=async ev=>{ev.preventDefault();const my=++id.current,ok=()=>id.current===my;setE('');setR(null);setSp({});setTab('overview');setL(true);const q=encodeURIComponent(u);
    ['mobile','desktop'].forEach(s=>jf(`/api/speed?strategy=${s}&url=${q}`).then(d=>ok()&&setSp(p=>({...p,[s]:d}))).catch(z=>ok()&&setSp(p=>({...p,[s]:{error:z.message}}))));
    try{const d=await jf('/api/assess?url='+q);ok()&&setR(d)}catch(z){ok()&&setE(z.message||'Assessment unavailable.')}ok()&&setL(false)};
  const fails=r?r.findings.filter(f=>f.s!=='pass').length:0,P=r?.profile,S=sp[st],lenses=r?r.lenses.map(x=>x.n):[];
  const facts=P?[['Words of text on the page',P.words],['Headings (H1 / H2 / H3)',P.headings.join(' / ')],['Links (internal / external)',P.links.internal+' / '+P.links.external],['Images',P.images.total+' ('+P.images.noAlt+' without descriptions)'],['Social profiles linked',P.socials.join(', ')||'none found'],['Structured data',P.schema.join(', ')||'none'],['Visitor analytics',P.analytics?'detected':'not detected'],['Platform hints',P.tech.join(', ')||'not identified'],['Server',P.server],['robots.txt / sitemap',(P.robots?'yes':'no')+' / '+(P.sitemap?'yes':'no')]]:[];
  const T=[['overview','Overview'],['speed','Speed'],['findings','All findings'],['profile','Site profile']];
  return <div className="card qa"><h3>Website Quick Assessment</h3><p className="muted">Enter your website address for a free, plain-English health check covering how findable, credible, fast and trustworthy it is. It is an automated first look, not a full strategic assessment.</p>
    <form className="row" onSubmit={run}><input aria-label="Website address" placeholder="yourwebsite.com" value={u} onChange={e=>setU(e.target.value)} required/><button className="btn btn-fine" disabled={l}>{l?'Analysing…':'Run Assessment'}</button></form>
    {e&&<p className="err" role="alert">{e}</p>}
    {r&&<PrintReport r={r} sp={sp} facts={facts}/>}
    {r&&<div className="rep"><div className="rtop"><p className="muted">Report for <b>{r.host}</b></p><button className="x2" type="button" onClick={close}>Close report ×</button></div>
      <div className="tabs2" role="tablist">{T.map(([k,n])=><button key={k} role="tab" aria-selected={tab===k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{n}</button>)}</div>
      <div className="pane">
      {tab==='overview'&&<div>
        <div className="rh"><div className={'ring '+lab(r.overall)[1]} style={{'--p':r.overall}}><b>{r.overall}</b></div><div><h3>{lab(r.overall)[0]} overall</h3><p>{verdict(r.overall)}</p><p className="muted">{r.findings.length-fails} of {r.findings.length} checks passed · {fails} to review</p></div></div>
        <p className="legend"><span><i className="pass">✓</i>Good</span><span><i className="warn">!</i>Could be better</span><span><i className="fail">✕</i>Needs fixing</span></p>
        <h4 className="rt">Your six areas</h4><div className="areas">{r.lenses.map(x=>{const [lb,c]=lab(x.v),p=PLAIN[x.n];return <div className="area" key={x.n}><div><b>{x.n}</b><span className={'tag '+c}>{lb}</span></div><p className="qn">{p[0]}</p><div className="b2"><i className={c} style={{width:x.v+'%'}}/></div><p className="muted">{p[1]}</p></div>})}</div>
        <h4 className="rt">Fix these first</h4><ol className="pri">{r.priority.map((x,i)=><li key={i}><div><span className={'tag imp'+IMP(x.w)}>{IMP(x.w)} impact</span><span className="muted"> {x.lens}</span></div><b>{x.msg}</b><p>{x.fix}</p></li>)}</ol></div>}
      {tab==='speed'&&<div><p className="muted">Measured by Google PageSpeed Insights on a simulated phone or desktop. Faster sites keep more visitors and tend to rank better.</p>
        <div className="seg">{['mobile','desktop'].map(s=><button key={s} type="button" className={s===st?'on':''} onClick={()=>setSt(s)}>{s}</button>)}</div>
        {!S?<p className="muted">Google is analysing your site. This can take up to a minute.</p>:S.error?<p className="err">{S.error}</p>:<div>
          <div className="scores">{Object.entries(S.scores).map(([k,s])=><div key={k} className={lab(s)[1]}><b>{s}</b><span>{k==='seo'?'Search (SEO)':k.replace('-',' ')}</span></div>)}</div>
          <h4 className="rt">Loading experience</h4><div className="vit">{Object.entries(S.vitals).map(([k,x])=><div key={k} className={x.r}><span>{k}</span><b>{x.v} · {RL[x.r]}</b><small>{VH[k]}</small></div>)}</div>
          {S.field&&<p className="muted">Real visitors (Google Chrome data): {Object.entries(S.field).map(([k,c])=>k+' '+c.toLowerCase().replace(/_/g,' ')).join(' · ')}</p>}
          {S.opp.length>0&&<><h4 className="rt">Biggest speed wins</h4><ul>{S.opp.map(o=><li key={o.t}>{o.t} <span className="muted">{o.s}</span></li>)}</ul></>}</div>}</div>}
      {tab==='findings'&&<div><div className="seg">{[['issues','Needs attention'],['all','Show all']].map(([k,n])=><button key={k} type="button" className={fl===k?'on':''} onClick={()=>setFl(k)}>{n}</button>)}</div>
        {lenses.map(L=>{const a=r.findings.filter(f=>f.lens===L&&(fl==='all'||f.s!=='pass'));return a.length>0&&<div key={L} className="lens"><h4>{L}</h4>{a.map((f,i)=><details key={i} className={f.s}><summary><i>{SI[f.s]}</i>{f.msg}</summary><p><b>What to do:</b> {f.fix}</p></details>)}</div>})}</div>}
      {tab==='profile'&&<div><p className="muted">The facts we read from your site, for reference.</p><dl className="facts">{facts.map(([a,b])=><div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl></div>}
      </div>
      <div className="next"><p><b>What an automated check cannot tell you.</b> A Business Opportunity Assessment examines what no tool can see:</p><ul><li>How your competitors rank, position and convert against you</li><li>Whether your message is distinctive in your market</li><li>Which audiences and channels you are not yet reaching</li><li>How your customer journey performs end to end</li><li>Where your biggest commercial opportunities sit</li></ul><Link className="btn gold" to="/contact#assessment">Request a strategic assessment</Link> <button className="btn sm ghost-d" type="button" onClick={()=>{try{window.print()}catch(e){alert('Printing is not available in this browser.')}}}>Print / save as PDF</button></div></div>}</div>;
}

function FadeCarousel({items,className,interval=4200,renderItem}){const [i,setI]=useState(0),[p,setP]=useState(false);const tx=useRef(null),mx=useRef(null);
  useEffect(()=>{if(p)return;const t=setInterval(()=>setI(x=>(x+1)%items.length),interval);return()=>clearInterval(t)},[p,items.length,interval]);
  const go=d=>setI(x=>(x+d+items.length)%items.length);
  const onStart=e=>{tx.current=e.touches[0].clientX;setP(true)};
  const onEnd=e=>{if(tx.current==null)return;const dx=e.changedTouches[0].clientX-tx.current;if(Math.abs(dx)>40)go(dx<0?1:-1);tx.current=null;setTimeout(()=>setP(false),3000)};
  // Mouse-drag equivalent for desktop, mirroring the touch swipe above
  const onMDown=e=>{mx.current=e.clientX;setP(true)};
  const onMUp=e=>{if(mx.current==null)return;const dx=e.clientX-mx.current;if(Math.abs(dx)>40)go(dx<0?1:-1);mx.current=null;setTimeout(()=>setP(false),3000)};
  return <div className={'fc '+className} onMouseEnter={()=>setP(true)} onMouseLeave={()=>{setP(false);mx.current=null}} onFocus={()=>setP(true)} onBlur={()=>setP(false)} onTouchStart={onStart} onTouchEnd={onEnd} onMouseDown={onMDown} onMouseUp={onMUp}>
    <div key={i} className="fc-item">{renderItem(items[i],i)}</div>
    <div className="fc-dots">{items.map((x,k)=><button key={k} aria-label={'Show item '+(k+1)} className={k===i?'on':''} onClick={()=>setI(k)}/>)}</div>
  </div>;}
function Principles(){return <FadeCarousel items={principles} className="pcar" renderItem={([t,x])=><><h4>{t}</h4><p>{x}</p></>}/>;}
const Cta=()=><section className="band"><div className="wrap"><p className="kick">Let’s make your business easier to find</p><h2>Discover the opportunities your digital presence is missing.</h2><p className="lead2">Needcentric Consultancy helps close the gap between your business and the people searching for what you offer.</p><Principles/><Link className="btn gold btn-fine" to="/contact#assessment">Improve My Business Visibility</Link></div></section>;

const Rv=({children,c=''})=>{const [i,setI]=useState(false);const r=useRef();useEffect(()=>{const o=new IntersectionObserver(([e])=>e.isIntersecting&&(setI(true),o.disconnect()),{threshold:.15});o.observe(r.current);return()=>o.disconnect()},[]);return <div ref={r} className={'rv '+c+(i?' in':'')}>{children}</div>};
const Logo=()=><span className="lg"><svg viewBox="0 0 48 48" width="42" height="42" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#0b1b33" stroke="#c8a45c" strokeWidth="1.5"/><circle cx="24" cy="24" r="15" fill="none" stroke="#c8a45c" strokeOpacity=".5"/><path d="M15 33V15l18 18V15" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="35" cy="13" r="3" fill="#c8a45c"/></svg><span className="lt"><b>NEED-CENTRIC</b><small>CONSULTANCY</small></span></span>;
const BIZ=[
  {q:'plumber in austin tx',name:'Sterling & Vance Plumbing Co.',cat:'Plumber',city:'Austin, TX',addr:'14 Industrial Pkwy, Austin',stars:4.6,rev:112,close:'7:00pm',rival:'Rival Plumbing LLC · 3.4mi away'},
  {q:'dentist in portland',name:'Northbridge Family Dental',cat:'Dentist',city:'Portland, OR',addr:'220 Elm Avenue, Portland',stars:4.9,rev:203,close:'5:30pm',rival:'Cascade Dental Group · 2.1mi away'},
  {q:'law firm in chicago',name:'Harlow & Reed Law',cat:'Law Firm',city:'Chicago, IL',addr:'900 LaSalle St, Chicago',stars:4.7,rev:68,close:'6:00pm',rival:'Chicago Legal Partners · 1.8mi away'},
  {q:'bakery in denver',name:'Maple & Stone Bakery',cat:'Bakery',city:'Denver, CO',addr:'58 Birchwood Lane, Denver',stars:4.8,rev:86,close:'6:00pm',rival:'Downtown Bake Co. · 0.9mi away'}
];
const Stars=({n})=><span className="stars">{'★★★★★'.slice(0,Math.round(n))}{'☆☆☆☆☆'.slice(0,5-Math.round(n))}</span>;
const Mark=()=><svg viewBox="0 0 48 48" className="mark" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#0b1b33" stroke="#c8a45c" strokeWidth="2"/><circle cx="24" cy="24" r="15" fill="none" stroke="#c8a45c" strokeOpacity=".5"/><path d="M15 33V15l18 18V15" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="35" cy="13" r="3" fill="#c8a45c"/></svg>;
const Win=({t,children})=><div className="win"><div className="wbar"><Mark/><span>{t}</span></div><div className="wbody">{children}</div></div>;
function SearchFrame({b}){return <Win t="Search results"><div className="sbar"><i className="ti">⌕</i><span>{b.q}</span></div>
  <div className="mapstrip"><span className="mlabel">Map</span><span className="mpin">📍</span></div>
  <div className="hit"><b>{b.name}</b><div className="meta"><Stars n={b.stars}/><span>{b.stars} ({b.rev})</span></div><div className="meta2">{b.cat} · {b.city}</div><div className="meta2 open">Open now · Closes {b.close}</div></div>
  <div className="hit dim">{b.rival}</div></Win>}
function ProfileFrame({b}){return <Win t="Business profile"><div className="photo">Photo</div>
  <h4>{b.name}</h4><div className="meta"><Stars n={b.stars}/><span>{b.stars} · {b.rev} reviews · {b.cat}</span></div>
  <div className="row2">📍 {b.addr}</div><div className="row2">🕑 Open now · Closes {b.close}</div>
  <div className="btnrow"><span>Directions</span><span>Website</span><span className="call">Call</span></div></Win>}
function PhoneFrame({b}){return <Win t="Customer's phone"><div className="phonewrap"><div className="phone">
  <div className="pnotch"/><Mark/><p className="psmall">Searching nearby…</p>
  <b className="pname">{b.name}</b><div className="pmeta"><Stars n={b.stars}/><span>{b.stars} · {b.city.split(',')[0]}</span></div>
  <div className="pcall">Call now</div><p className="pdir">Directions</p></div></div></Win>}
const VIEWS=[['Search',SearchFrame],['Profile',ProfileFrame],['Contact',PhoneFrame]];
function HeroVis(){const [i,setI]=useState(0),[p,setP]=useState(false);useEffect(()=>{if(p)return;const t=setInterval(()=>setI(x=>x+1),8000);return()=>clearInterval(t)},[p,i]);const si=i%3,V=VIEWS[si][1],b=BIZ[i%4];
  const tx=useRef(null),mx=useRef(null);
  const onStart=e=>{tx.current=e.touches[0].clientX;setP(true)};
  const onEnd=e=>{if(tx.current==null)return;const dx=e.changedTouches[0].clientX-tx.current;if(Math.abs(dx)>40)setI(x=>x+(dx<0?1:-1));tx.current=null;setTimeout(()=>setP(false),3000)};
  const onMDown=e=>{mx.current=e.clientX;setP(true)};
  const onMUp=e=>{if(mx.current==null)return;const dx=e.clientX-mx.current;if(Math.abs(dx)>40)setI(x=>x+(dx<0?1:-1));mx.current=null;setTimeout(()=>setP(false),3000)};
  return <div className="vis" onMouseEnter={()=>setP(true)} onMouseLeave={()=>{setP(false);mx.current=null}} onFocus={()=>setP(true)} onBlur={()=>setP(false)} onTouchStart={onStart} onTouchEnd={onEnd} onMouseDown={onMDown} onMouseUp={onMUp}><div key={i} className="vf"><V b={b}/></div><div className="vdots" role="tablist">{VIEWS.map(([n],k)=><button key={n} role="tab" aria-label={'Show '+n} aria-selected={k===si} className={k===si?'on':''} onClick={()=>setI(k)}/>)}</div></div>}
const IC={plumb:<><path d="M8 14h20a8 8 0 0 1 8 8v4"/><path d="M8 10v8"/><path d="M36 42c-3-4-5-6-5-8a5 5 0 0 1 10 0c0 2-2 4-5 8z"/></>,salon:<><circle cx="14" cy="34" r="5"/><circle cx="34" cy="34" r="5"/><path d="M17 30L34 8M31 30L14 8"/></>,bolt:<path d="M26 6L12 26h10l-4 16 18-22H26z"/>,clean:<><path d="M24 8l3 10 10 3-10 3-3 10-3-10-10-3 10-3z"/><path d="M38 30l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"/></>,hanger:<><path d="M24 20v-3a4 4 0 1 0-4-4"/><path d="M24 20L6 34h36z"/></>};
const Ico=({k})=><svg viewBox="0 0 48 48" className="ico" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{IC[k]}</svg>;
Object.assign(IC,{building:<path d="M10 42V12h18v30M28 22h10v20M6 42h36M16 18h6M16 26h6M16 34h6"/>,hotel:<path d="M6 36V14M6 28h36v8M6 36h36M14 28v-6h12a6 6 0 0 1 6 6"/>,cross:<path d="M18 8h12v10h10v12H30v10H18V30H8V18h10z"/>,cap:<path d="M4 18L24 8l20 10-20 10zM12 23v10c6 5 18 5 24 0V23"/>,bank:<path d="M6 18L24 8l18 10zM10 20v16M20 20v16M28 20v16M38 20v16M6 40h36"/>,gear:<><circle cx="24" cy="24" r="6"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4"/></>,fan:<><circle cx="24" cy="24" r="3"/><path d="M24 21c-2-8 2-13 8-12-1 6-4 9-8 12zM27 24c8-2 13 2 12 8-6-1-9-4-12-8zM24 27c2 8-2 13-8 12 1-6 4-9 8-12zM21 24c-8 2-13-2-12-8 6 1 9 4 12 8z"/></>,case:<><rect x="6" y="14" width="36" height="24" rx="3"/><path d="M18 14v-4h12v4M6 26h36"/></>,chip:<><rect x="14" y="14" width="20" height="20" rx="2"/><path d="M20 8v6M28 8v6M20 34v6M28 34v6M8 20h6M8 28h6M34 20h6M34 28h6"/></>,heart:<path d="M24 40S8 30 8 19a8 8 0 0 1 16-3 8 8 0 0 1 16 3c0 11-16 21-16 21z"/>,truck:<><path d="M4 14h26v18H4zM30 20h8l6 7v5H30"/><circle cx="14" cy="34" r="4"/><circle cx="36" cy="34" r="4"/></>,store:<path d="M6 18l4-10h28l4 10M6 18h36v22H6zM18 40V28h12v12"/>});
function Stories(){const [i,setI]=useState(0),[full,setFull]=useState(false),s=stories[i],go=n=>{setI((n+stories.length)%stories.length);setFull(false)};
  // Mouse click-and-drag scrolling for the services row — native overflow-x handles touch
  // and trackpad scroll already, but a desktop mouse has no built-in way to drag-scroll.
  const dragRef=useRef(null),drag=useRef(null);
  const dragStart=e=>{const el=dragRef.current;if(!el)return;drag.current={x:e.pageX,left:el.scrollLeft,moved:false};el.classList.add('dragging')};
  const dragMove=e=>{if(!drag.current||!dragRef.current)return;const dx=e.pageX-drag.current.x;if(Math.abs(dx)>4)drag.current.moved=true;dragRef.current.scrollLeft=drag.current.left-dx};
  const dragEnd=()=>{if(dragRef.current)dragRef.current.classList.remove('dragging');drag.current=null};
  const dragClick=e=>{if(drag.current?.moved)e.preventDefault()};
  // Trackpad/mouse-wheel scroll: a two-finger "swipe" sometimes registers as mostly
  // vertical delta rather than horizontal, which a plain overflow-x:auto row won't
  // pick up on its own — so redirect vertical wheel motion into horizontal scroll here.
  const onWheel=e=>{const el=dragRef.current;if(!el)return;const d=Math.abs(e.deltaX)>=Math.abs(e.deltaY)?e.deltaX:e.deltaY;el.scrollLeft+=d};
  const tx=useRef(null),mx=useRef(null);
  const onStart=e=>{tx.current=e.touches[0].clientX};
  const onEnd=e=>{if(tx.current==null)return;const dx=e.changedTouches[0].clientX-tx.current;if(Math.abs(dx)>40)go(i+(dx<0?1:-1));tx.current=null};
  const onMDown=e=>{mx.current=e.clientX};
  const onMUp=e=>{if(mx.current==null)return;const dx=e.clientX-mx.current;if(Math.abs(dx)>40)go(i+(dx<0?1:-1));mx.current=null};
  return <>
  
  <section className="wrap sec tight helpsec"><Rv><p className="kick dk">How we help</p><h2>Seven ways we make your business easier to find</h2><p className="lead dark">Each service answers a specific barrier between your business and the customers searching for it.</p></Rv>
    <p className="hint">→</p><div className="grid" ref={dragRef} onMouseDown={dragStart} onMouseMove={dragMove} onMouseUp={dragEnd} onMouseLeave={dragEnd} onClickCapture={dragClick} onWheel={onWheel}>{visServices.map(([a,b],k)=><div className="card" key={a}><span className="idx">0{k+1}</span><h3>{a}</h3><p>{b}</p></div>)}</div></section>
  <section className="wrap sec tight storysec" id="stories"><Rv><p className="kick dk">Client success stories</p></Rv>
    <blockquote className="pull">Your business may already be providing the right service. We help make it easier for people to find you.</blockquote>
    
    <article className="card viewer" onTouchStart={onStart} onTouchEnd={onEnd} onMouseDown={onMDown} onMouseUp={onMUp} onMouseLeave={()=>{mx.current=null}}><div className="vh"><Ico k={s.ic}/><div><span className="tag ok-tag">{s.industry}</span>{!s.real&&<span className="tag soft">Illustrative scenario</span>}<h3>{s.h}</h3></div></div>
      <div className="vb" key={s.id+full}><h5>The Challenge</h5><p>{s.c}</p>{full&&<><h5>What We Did</h5><ul>{s.d.map(x=><li key={x}>{x}</li>)}</ul></>}<h5>The Transformation</h5><p>{s.t}</p></div>
      <div className="vf2"><button className="rm" aria-expanded={full} onClick={()=>setFull(!full)}>{full?'Show summary':'Read the full story'}</button><div className="nav2"><button aria-label="Previous story" onClick={()=>go(i-1)}>←</button><span>{i+1} / {stories.length}</span><button aria-label="Next story" onClick={()=>go(i+1)}>→</button></div><Link className="more" to="/contact#assessment">Help Customers Find My Business →</Link></div></article></section></>}

function Home(){const [t,setT]=useState(0),s=services[t],{hash}=useLocation();useEffect(()=>{if(!hash)return;const go=()=>document.querySelector(hash)?.scrollIntoView({behavior:'instant',block:'start'});const cancel=()=>t.forEach(clearTimeout);const t=[setTimeout(go,60),setTimeout(go,450)];const evs=['wheel','touchstart','pointerdown'];evs.forEach(ev=>addEventListener(ev,cancel,{passive:true,once:true}));return()=>{cancel();evs.forEach(ev=>removeEventListener(ev,cancel))}},[hash]);return <><Seo t="Digital Growth & Brand Visibility Consultancy" d="We find the digital opportunities your organisation is missing, then build the strategy to pursue them."/>
  <section id="dash" className="hero" style={photos.home?{backgroundImage:`linear-gradient(135deg,#07111fe8,#0b1b33cc),url(${photos.home})`,backgroundSize:'cover',backgroundPosition:'center'}:undefined}><div className="wrap hg"><div><p className="kick">Digital growth consultancy</p><h1>Your digital presence has untapped potential. <em>We find it.</em></h1>
    <p className="lead">Most organisations never see the opportunities hiding in their own digital footprint. We study yours against your market, expose the gaps, and give leadership a clear, evidence-based path to pursue them.</p>
</div><HeroVis/><div className="cta"><Link className="btn gold" to="/contact#assessment">Request a Digital Assessment</Link><Link className="btn ghost" to="/services">Explore Our Services</Link></div><p className="note"><span>Research-led</span><i/><span>Commercially minded</span><i/><span>No guarantees we cannot keep</span></p></div></section>
  <section className="strip"><div className="wrap">{[['opportunity','Opportunity assessment'],['search','Search visibility'],['brand','Brand positioning'],['growth','Growth strategy'],['performance','Conversion']].map(([i,x])=><Link key={i} to={'/services#'+i}>{x}</Link>)}</div></section>
  <section className="wrap sec"><Rv><p className="kick dk">The problem</p><h2>Being good is not the same as being found.</h2><p className="lead dark">Buyers research long before they call. In that quiet phase, the organisations that are visible, clear and credible win the conversation. The rest never learn they were considered.</p></Rv>
    <FadeCarousel items={problems} className="probcar" renderItem={([a,b])=><><h3>{a}</h3><p>{b}</p></>}/></section>
  <section className="dark-sec"><div className="wrap"><Rv><p className="kick">What we do</p><h2>Five lenses on one question: where is your growth being left behind?</h2></Rv>
    <div className="tabs" role="tablist">{services.map((x,i)=><button key={x.id} role="tab" aria-selected={i===t} className={i===t?'on':''} onClick={()=>setT(i)}>{x.n}</button>)}</div>
    <div className="panel" key={s.id}><h3>{s.t}</h3><p className="q">{s.k}</p><p>{s.d}</p><ul>{s.x.map(i=><li key={i}>{i}</li>)}</ul><p><b>Outcome:</b> {s.b}</p><Link to={'/services#'+s.id}>Read the full service →</Link></div></div></section>
  <section className="wrap sec"><Rv><p className="kick dk">Sectors</p><h2>Built for organisations competing for attention</h2><p className="lead dark">Wherever buyers research before they enquire, visibility decides who gets considered. Every business deserves to be found by the people looking for its services. We help local service providers and small businesses establish a stronger digital presence, improve their local search visibility, and make essential business information easier for potential customers to access. We advise across <Link to="/industries" className="inline-link">{industries.length} sectors</Link>.</p></Rv></section>
  <section className="sec qs"><div className="wrap"><Rv><p className="kick dk">The gap</p></Rv><ul className="gaps">{visProblems.map(p=><li key={p}><i>✕</i><span>{p}</span></li>)}</ul><Rv><p className="kick dk gapk">Questions worth asking</p><h2>Could your leadership answer these today?</h2></Rv><ul>{questions.map(q=><li key={q}>{q}</li>)}</ul><Rv><p className="kick dk gapk">Find out with an assessment</p></Rv><Quick/></div></section>
  
  
  
  <Stories/>
  <Cta/></>}

const Band=({k,alt})=>photos[k]?<img className="band-img" src={photos[k]} alt={alt} loading="lazy"/>:null;
const SOC=[['whatsapp','WhatsApp','Text us on WhatsApp',<path d="M24 5C13.5 5 5 13.3 5 23.6c0 4 1.3 7.7 3.5 10.8L6 43l9-2.4a19 19 0 0 0 9 2.3c10.5 0 19-8.3 19-18.6C43 13.3 34.5 5 24 5zm0 34a15 15 0 0 1-7.7-2.1l-.5-.3-5.3 1.4 1.4-5.1-.4-.5A15 15 0 1 1 24 39zm8.3-11.2c-.4-.2-2.7-1.3-3.1-1.5s-.7-.2-1 .2-1.1 1.5-1.4 1.8-.5.3-.9.1a12 12 0 0 1-3.6-2.2 13.4 13.4 0 0 1-2.5-3c-.3-.4 0-.7.2-.9l.6-.7c.2-.2.3-.4.4-.6a.7.7 0 0 0 0-.7c-.1-.2-1-2.3-1.3-3.2-.3-.8-.7-.7-1-.7h-.8a1.6 1.6 0 0 0-1.1.5A4.7 4.7 0 0 0 15 20.3c0 2.6 1.9 5.1 2.2 5.4.3.4 3.8 5.7 9.1 8 1.3.5 2.2.9 3 1.1a7.2 7.2 0 0 0 3.3.2c1-.2 2.7-1.1 3.1-2.1.4-1.1.4-2 .3-2.1-.1-.2-.4-.3-.7-.5z"/>],
['telegram','Telegram','Message us on Telegram',<path d="M43 7L6 21.6c-1.3.5-1.3 1.7-.2 2.1l9.4 2.9 3.6 11.4c.4 1.1.7 1.5 1.5 1.5s1.1-.3 1.7-.9l4.5-4.4 9.4 6.9c1.7 1 2.9.5 3.3-1.6L44.8 9c.6-2.5-.9-3.6-2.8-2zM16.7 25.8l19.1-12c1-.6 1.9-.3 1.1.4L20.4 29.5l-.6 6.3-2.9-9.9z"/>],
['x','X','View our profile on X',<path d="M28.6 20.9L43.6 4h-3.6L27 18.3 16.6 4H4l15.7 21.8L4 44h3.6l14-15.1L32.6 44H44L28.6 20.9z"/>],
['mail','Email','Email us directly',<path d="M6 10h36a2 2 0 0 1 2 2v24a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2zm0 2v.3L24 25l18-12.7V12H6zm0 24h36V16.7L24 29.4 6 16.7V36z"/>]];
const Soc=()=><div className="soc">{SOC.map(([k,name,action,path])=>{const href=social[k],isMail=href&&href.startsWith('mailto:');return href?<a key={k} href={href} {...(isMail?{}:{target:'_blank',rel:'noopener noreferrer'})} aria-label={name+': '+action} title={action}><svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">{path}</svg></a>:<span key={k} className="soc-ph" title={name+' link not set yet'}><svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">{path}</svg></span>})}</div>;
const Person=({p})=><div className="card person"><div className="pc">{p.photo?<img src={p.photo} alt={p.name}/>:<span>Photo</span>}</div><div><h3>{p.name}</h3><p className="muted">{p.role}</p><p>{p.text}</p></div></div>;
function About(){const [w,setW]=useState(null);useEffect(()=>{const k=e=>e.key==='Escape'&&setW(null);addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[]);
return <div className="wrap sec"><Seo t="About" d="Our purpose, philosophy and research-driven approach."/><Band k="about" alt="Need-Centric Consultancy at work"/><Head k="About us" h="Strategic thinking for digital competitiveness" p="Need-Centric Consultancy advises organisations on the question digital activity rarely answers: where, specifically, is growth being left behind? We pair market research and digital diagnostics with commercial judgement, so visibility becomes a deliberate strategic advantage."/>
  <div className="grid">{[['Mission','To help organisations see their digital position as their market sees it, and to turn that clarity into focused, defensible decisions about where to grow.'],['Philosophy','Growth is seldom absent; it is usually unrecognised. Opportunity sits in the gap between what an organisation offers and what its market can find, understand and trust. Our work is to close that gap deliberately.'],['Approach','We diagnose before we prescribe. We study the organisation, its footprint and its competitive context, rank findings by commercial value, and recommend only what the evidence supports, sequenced so leadership can act with confidence.']].map(([a,b])=><div className="card" key={a}><h3>{a}</h3><p>{b}</p></div>)}</div>
  
  <h2>Why work with us</h2><div className="grid whygrid">{why.map((x,i)=><button className="card btnc" key={x[0]} onClick={()=>setW(x)}><span className="idx">0{i+1}</span><h3>{x[0]}</h3><p className="muted">Click to explore →</p></button>)}</div>
  {w&&<div className="ov" onClick={()=>setW(null)}><div className="glass" role="dialog" aria-modal="true" aria-label={w[0]} onClick={e=>e.stopPropagation()}><button className="x" aria-label="Close" onClick={()=>setW(null)}>×</button><h2>{w[0]}</h2><p>{w[1]}</p><ul>{w[2].map(i=><li key={i}>{i}</li>)}</ul></div></div>}
  <div className="thesis"><p className="stmt">Digital competitiveness is not about doing more. It is about being clearly and credibly present where your market is already looking.</p><div className="ideas">{[['Visibility is a strategic asset','What your market can find, understand and trust determines which organisations are considered. Visibility is a commercial position, not a marketing activity.'],['Competitiveness is relative','A digital presence is only strong or weak against alternatives. We measure organisations against the competitors their customers actually compare them with.'],['Sequence beats volume','Doing everything at once dilutes effort. We rank opportunities by value, effort and risk so scarce resources go where the return is clearest.'],['Evidence over assumption','Every conclusion traces back to something observed, so decisions can be defended to boards, partners and investors.']].map(([t,x],i)=><div className="idea" key={t}><span>0{i+1}</span><div><h4>{t}</h4><p>{x}</p></div></div>)}</div></div>
  <h2>Our team</h2><div className="team2">{team.map((p,i)=><div className="card member" key={i}><div className="sq">{p.photo?<img src={p.photo} alt={p.name}/>:<span className={p.mark?'mk':''}>{p.mark||'Photo'}</span>}</div><h3>{p.name}</h3><p className="muted">{p.role}</p><p>{p.text}</p></div>)}</div>
  <div className="ss"><div><p className="kick">Real business needs</p><blockquote><span className="q1">Your business may already be providing the right service.</span><span className="q2">We help make it easier for people to find you.</span></blockquote><Link className="btn gold" to="/#stories">Read our success stories</Link></div><div className="ss-r">{stories.map(s=><div className="ss-i" key={s.id}><Ico k={s.ic}/><span>{s.industry}</span></div>)}</div></div></div>}

function Services(){const {hash}=useLocation();const [act,setAct]=useState(services[0].id);
  useEffect(()=>{if(hash)setTimeout(()=>document.querySelector(hash)?.scrollIntoView(),60)},[hash]);
  useEffect(()=>{const ids=[...services.map(s=>s.id),'models'];const f=()=>{const y=innerHeight*.4;let cur=ids[0];ids.forEach(k=>{const el=document.getElementById(k);if(el&&el.getBoundingClientRect().top<=y)cur=k});if(innerHeight+scrollY>=document.documentElement.scrollHeight-8)cur='models';setAct(cur)};f();addEventListener('scroll',f,{passive:true});addEventListener('resize',f);return()=>{removeEventListener('scroll',f);removeEventListener('resize',f)}},[]);
  return <div className="wrap sec"><Seo t="Services" d="Search visibility, brand positioning, growth strategy, opportunity assessment and conversion optimisation."/><Band k="services" alt="Our services"/><Head k="Our services" h="Strategy before activity" p="We do not guarantee rankings, traffic or revenue. We identify opportunities and recommend practical, evidence-based actions."/>
  <div className="sv"><aside className="side">{services.map((s,i)=><a key={s.id} href={'#'+s.id} className={act===s.id?'on':''}><i>0{i+1}</i>{s.n}</a>)}<a href="#models" className={act==='models'?'on':''}><i>06</i>Engagement</a></aside>
  <div>{services.map((s,i)=><article className="svc" id={s.id} key={s.id}><div className="sh"><span className="num">0{i+1}</span><div><p className="kick dk">{s.n}</p><h2>{s.t}</h2></div></div><p className="q">{s.k}</p><p>{s.d}</p>
    <div className="tri"><div className="box"><h4>The problem</h4><p>{s.p}</p></div><div className="box"><h4>What we examine</h4><ul>{s.x.map(x=><li key={x}>{x}</li>)}</ul></div><div className="box"><h4>The outcome</h4><p>{s.b}</p></div></div></article>)}
  <h2 id="models">Engagement models</h2><div className="grid">{models.map(([a,b,c,e,s],i)=><div className="card eng" key={a}><span className="idx">0{i+1}</span><h3>{a}</h3><p className="sub1">{s}</p><p>{b}</p><p className="bf"><b>Best for:</b> {c}</p><ul>{e.map(x=><li key={x}>{x}</li>)}</ul></div>)}</div><p>Every engagement begins with a scoping conversation, and terms are agreed in writing before work starts. Pricing is tailored to scope. <Link to="/contact#proposal" className="bold-link">Request a customised proposal</Link>.</p></div></div></div>}

function Approach(){const [o,setO]=useState(0);const s=stages[o];return <div className="wrap sec"><Seo t="Our Approach" d="A six-stage consultancy methodology."/><Band k="approach" alt="Our approach"/><Head k="THE NEED-CENTRIC METHOD" h="A structured path from insight to growth" p="Six stages, one discipline: understand first, recommend second."/>
  <div className="ap"><div className="rail">{stages.map(([a],i)=><button key={a} className={i===o?'on':''} onMouseEnter={()=>setO(i)} onFocus={()=>setO(i)} onClick={()=>setO(i)}><span>{i+1}</span>{a}</button>)}</div>
  <div className="stage" key={o}><span className="big">0{o+1}</span><p className="kick">Stage {o+1} of 6</p><h2>{s[0]}</h2><p className="lead">{s[1]}</p><h4>You receive</h4><p>{stageOut[o]}</p><div className="prog"><i style={{width:((o+1)/6*100)+'%'}}/></div></div></div></div>}

function Industries(){return <div className="wrap sec"><Seo t="Industries" d="How digital visibility benefits each sector."/><Band k="industries" alt="Industries we serve"/><Head k="Industries we serve" h="Visibility matters in every sector" p="Every sector competes for attention, trust and preference. How that plays out differs, and so should the strategy."/><div className="indgrid">{industries.map(([a,b,c])=><div className="card" key={a}><h3>{a}</h3><p className="sectag">{b}</p><p>{c}</p></div>)}</div></div>}

function Insights(){return <div className="wrap sec"><Seo t="Insights" d="Articles and practical recommendations on digital growth."/><Head k="Insights & resources" h="Perspectives on digital opportunity"/><div className="grid insightsgrid">{articles.map(a=><Link className="card" to={'/insights/'+a.slug} key={a.slug}><h3>{a.title}</h3><p>{a.summary}</p></Link>)}</div></div>}
function Article(){const {slug}=useParams();const a=articles.find(x=>x.slug===slug);if(!a)return <div className="wrap sec"><h1>Not found</h1></div>;
  const main=a.body.slice(0,-1),cta=a.body[a.body.length-1];
  return <article className="wrap sec narrow"><Seo t={a.title} d={a.summary}/><Head k="Insight" h={a.title}/>{main.map((p,i)=><p key={i}>{p}</p>)}
    <div className="art-cta"><p>{cta}</p><Link className="btn gold" to="/contact#book">Book a Consultation</Link></div>
    <Link to="/insights">← All insights</Link></article>}

function Contact(){const {hash}=useLocation();useEffect(()=>{if(!hash)return;const go=()=>document.querySelector(hash)?.scrollIntoView({behavior:'instant',block:'start'});const cancel=()=>t.forEach(clearTimeout);const t=[setTimeout(go,60),setTimeout(go,450)];const evs=['wheel','touchstart','pointerdown'];evs.forEach(ev=>addEventListener(ev,cancel,{passive:true,once:true}));return()=>{cancel();evs.forEach(ev=>removeEventListener(ev,cancel))}},[hash]);
  const [topic,setTopic]=useState('');
  return <div className="wrap sec"><Seo t="Contact" d="Request an assessment, proposal or consultation."/><Band k="contact" alt="Contact us"/><Head k="Contact us" h="Start the conversation"/>
  <div className="grid"><div className="card"><h3>Reach us</h3><p>Email: <a href={'mailto:'+brand.email}>{brand.email}</a></p><Soc/><p>Digital visibility is not bound by geography. Search engines, buyers and competitors do not stop at a border, and neither does our practice: we serve organisations in Nigeria, across Africa, in Europe, North America, Asia and beyond, meeting in person where proximity allows and working by video and digital collaboration where it does not.</p></div></div><div style={{marginTop:'1.25rem'}}><Quick/></div>
  <h2 id="assessment">Request a Digital Visibility Assessment</h2><Form type="Digital Visibility Assessment" fields={assessF} cta="Request assessment" done="We have received your request and will respond with next steps."/>
  <h2 id="proposal">Request a Business Growth Proposal</h2><Form type="Growth Proposal" fields={propF} cta="Request proposal" done="Thank you. We will review your requirements and respond."/>
  <h2 id="book">Book a Consultation</h2>{brand.booking&&<p><a className="btn" href={brand.booking}>Choose a date and time</a></p>}
  <Form type="Consultation" fields={[['name','Name','text',1],['email','Email','email',1],['topic','Topic','select',1,['Website visibility','Brand positioning','Digital growth strategy','Business opportunity assessment','General consultancy']],['preferred','Preferred dates / times','textarea']]} cta="Request consultation" done="Thank you. We will confirm a time by email."/></div>}

function Legal({t}){return <div className="wrap sec narrow"><Seo t={t} d={t}/><Head k="Legal" h={t}/><p>[Placeholder: have this document drafted or reviewed by a qualified professional before launch.]</p></div>}

export default function App(){const [m,setM]=useState(false);const navRef=useRef(null);const {pathname}=useLocation();const [c,setC]=useState(()=>localStorage.getItem('cc'));
  useEffect(()=>{if(!m)return;const f=e=>{if(navRef.current&&!navRef.current.contains(e.target))setM(false)};document.addEventListener('click',f,true);return()=>document.removeEventListener('click',f,true)},[m]);
  useEffect(()=>{setM(false);if(!window.location.hash)window.scrollTo({top:0,behavior:'instant'})},[pathname]);
  useEffect(()=>{const id=import.meta.env.VITE_GA_ID;if(c==='y'&&id){const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.append(s);window.dataLayer=[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',id)}},[c]);
  const [up,setUp]=useState(false);useEffect(()=>{const f=()=>setUp(scrollY>700);addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[]);
  const L=[['/','Home'],['/about','About'],['/services','Services'],['/approach','Approach'],['/industries','Industries'],['/insights','Insights']];
  return <><a className="skip" href="#main">Skip to content</a>
  <nav className="nav" ref={navRef}><div className="wrap bar"><a href="/" className="logo" aria-label="Need-Centric Consultancy home"><Logo/></a><button className="burger" aria-label="Menu" aria-expanded={m} onClick={()=>setM(!m)}>☰</button>
    <div className={'links '+(m?'open':'')}>{L.map(([p,n])=><NavLink key={p} to={p}>{n}</NavLink>)}<Link className="btn gold sm" to="/contact">Contact</Link></div></div></nav>
  <main id="main" className={pathname==='/'?'':'inner'}><Routes><Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/><Route path="/services" element={<Services/>}/><Route path="/approach" element={<Approach/>}/><Route path="/industries" element={<Industries/>}/><Route path="/insights" element={<Insights/>}/><Route path="/insights/:slug" element={<Article/>}/><Route path="/contact" element={<Contact/>}/><Route path="/privacy" element={<Legal t="Privacy Policy"/>}/><Route path="/terms" element={<Legal t="Terms of Service"/>}/><Route path="*" element={<Legal t="Page not found"/>}/></Routes></main>
  <footer><div className="wrap fg"><div><a href="/" className="logo" aria-label="Need-Centric Consultancy home"><Logo/></a><p className="motto">Visibility Creates Opportunity.</p></div></div><div className="wrap flinks"><nav className="fl"><Link to="/privacy">Privacy and Policy</Link><Link to="/terms">Terms and Condition</Link><Link to="/contact">Contact</Link></nav><Soc/><a className="femail" href={'mailto:'+brand.email}>{brand.email}</a></div><div className="wrap copy"><span>© {new Date().getFullYear()} Need-Centric Consultancy</span></div></footer>
  {up&&<button className="totop" aria-label="Back to top" onClick={()=>scrollTo({top:0,behavior:'smooth'})}>↑</button>}
  {!c&&<div className="cookie" role="dialog" aria-label="Cookies">We use optional analytics cookies. <button className="btn sm" onClick={()=>{localStorage.setItem('cc','y');setC('y')}}>Accept</button> <button className="btn ghost sm" onClick={()=>{localStorage.setItem('cc','n');setC('n')}}>Decline</button></div>}</>}
