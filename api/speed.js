// Google PageSpeed Insights proxy (keeps PSI_API_KEY server-side).
export default async function handler(req,res){
  let u;try{let r=String(req.query.url||'').trim();if(!/^https?:\/\//i.test(r))r='https://'+r;u=new URL(r)}catch{return res.status(400).json({error:'Invalid address.'})}
  const s=req.query.strategy==='desktop'?'desktop':'mobile',q=new URLSearchParams({url:u.href,strategy:s});
  if(process.env.PSI_API_KEY)q.set('key',process.env.PSI_API_KEY);
  ['performance','accessibility','seo','best-practices'].forEach(c=>q.append('category',c));
  let r;try{r=await fetch('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?'+q,{signal:AbortSignal.timeout(55000)})}catch{return res.status(504).json({error:'Google PageSpeed timed out.'})}
  if(r.status===429)return res.status(429).json({error:'Google PageSpeed is rate-limiting requests. Add a PSI_API_KEY to remove the limit.'});
  if(!r.ok)return res.status(502).json({error:'Google PageSpeed could not analyse this page.'});
  const j=await r.json(),L=j.lighthouseResult,a=L.audits,v=id=>({v:a[id]?.displayValue||'n/a',r:a[id]?.score>=.9?'good':a[id]?.score>=.5?'ok':'poor'});
  const fm=j.loadingExperience?.metrics,field=fm?Object.fromEntries([['LCP','LARGEST_CONTENTFUL_PAINT_MS'],['CLS','CUMULATIVE_LAYOUT_SHIFT_SCORE'],['INP','INTERACTION_TO_NEXT_PAINT']].filter(([,k])=>fm[k]).map(([n,k])=>[n,fm[k].category])):null;
  const opp=Object.values(a).filter(x=>x.details?.type==='opportunity'&&x.details.overallSavingsMs>300).sort((x,y)=>y.details.overallSavingsMs-x.details.overallSavingsMs).slice(0,5).map(x=>({t:x.title,s:x.displayValue||''}));
  res.json({strategy:s,scores:Object.fromEntries(Object.entries(L.categories).map(([k,c])=>[k,Math.round(c.score*100)])),vitals:{'First Contentful Paint':v('first-contentful-paint'),'Largest Contentful Paint':v('largest-contentful-paint'),'Total Blocking Time':v('total-blocking-time'),'Cumulative Layout Shift':v('cumulative-layout-shift'),'Speed Index':v('speed-index')},field,opp});
}
