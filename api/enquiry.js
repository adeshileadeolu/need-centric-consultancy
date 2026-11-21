// Vercel serverless function. For Netlify, move to netlify/functions and adapt the handler signature.
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const b=req.body||{};
  if(b.website_hp)return res.status(200).json({ok:true});
  const {formType,...f}=b;
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email||''))return res.status(400).json({error:'Valid email required'});
  const rows=Object.entries(f).slice(0,20).map(([k,v])=>`<p><b>${esc(k)}:</b> ${esc(String(v).slice(0,3000))}</p>`).join('');
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},
    body:JSON.stringify({from:process.env.FROM_EMAIL,to:[process.env.NOTIFY_EMAIL],reply_to:f.email,subject:`New ${esc(formType||'enquiry')}`,html:rows})});
  return r.ok?res.status(200).json({ok:true}):res.status(502).json({error:'Could not send. Please email us directly.'});
}
