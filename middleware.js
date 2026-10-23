import { createServerClient } from '@supabase/ssr';
import { updateSession } from '@/lib/supabase/middleware';
import {checkLimit,clientIP,limitResponse} from '@/lib/rate-limit';

export async function middleware(request){
 const path=request.nextUrl.pathname;const mutation=!['GET','HEAD','OPTIONS'].includes(request.method);
 const api=path.startsWith('/api/');const login=/^\/admin\/login\/?$/.test(path)&&mutation;
 const search=path.replace(/\/$/,'')==='/news'&&(request.nextUrl.searchParams.has('category')||request.nextUrl.searchParams.has('page'));
 if(api||mutation||search){
  const ip='ip:'+clientIP(request.headers);
  // A coarse pre-auth guard bounds authentication work even with forged cookies.
  let denied=await checkLimit(login?'login':'ingress',ip);if(denied)return limitResponse(denied);
  if(!login){let identity=ip;
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
   if(url&&key){try{const supabase=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll:()=>{}}});const {data,error}=await supabase.auth.getClaims();if(!error&&data?.claims?.sub)identity='user:'+data.claims.sub;}catch{}}
   const name=identity===ip&&mutation&&!api?'login':path.startsWith('/api/admin/media')?'upload':api?'api':search?'search':'write';
   denied=await checkLimit(name,identity);if(denied)return limitResponse(denied);
  }
 }
 return path.startsWith('/admin')?updateSession(request):undefined;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|social-card.png|fonts/|images/|policies/).*)']};
