import {defineConfig,loadEnv} from 'vite';import react from '@vitejs/plugin-react';
// Serves /api/* during `npm run dev` so forms and the assessment work locally.
const api=()=>({name:'local-api',configureServer(s){s.middlewares.use(async(req,res,next)=>{
  if(!req.url.startsWith('/api/'))return next();
  const u=new URL(req.url,'http://x');
  try{const m=await s.ssrLoadModule('/api/'+u.pathname.slice(5)+'.js');req.query=Object.fromEntries(u.searchParams);
    if(req.method==='POST'){let b='';for await(const c of req)b+=c;req.body=JSON.parse(b||'{}')}
    res.status=c=>{res.statusCode=c;return res};res.json=o=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(o))};
    await m.default(req,res)}
  catch(e){res.statusCode=500;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Server error: '+e.message}))}})}});
export default defineConfig(({mode})=>{Object.assign(process.env,loadEnv(mode,process.cwd(),''));return{plugins:[react(),api()]}});
