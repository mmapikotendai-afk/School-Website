// Edge-compatible; server-only configuration must never use NEXT_PUBLIC_ names.
export const LUA = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return {n,redis.call('PTTL',KEYS[1])}";
export const RETRY_MESSAGE = 'The request could not be completed. If you have made several attempts, wait a few minutes before trying again.';
const defaults={attempts:[3,300],ingress:[300,60]};
export function policy(name, env=process.env){const base=defaults[name];if(!base)throw new Error('Unknown rate policy');const prefix='RATE_LIMIT_'+name.toUpperCase();const limit=Number(env[prefix+'_MAX']||base[0]);const seconds=Number(env[prefix+'_SECONDS']||base[1]);if(!Number.isSafeInteger(limit)||limit<1||!Number.isSafeInteger(seconds)||seconds<1)throw new Error('Invalid rate policy');return {limit,ms:seconds*1000};}
export function clientIP(headers,env=process.env){
 // Trust only a header overwritten by an ingress that cannot be bypassed.
 const header=env.RATE_LIMIT_IP_HEADER;if(!header)return 'unknown';
 const parts=(headers.get(header)||'').split(',').map(s=>s.trim());
 const hops=Number(env.RATE_LIMIT_PROXY_HOPS||1);
 if(!Number.isSafeInteger(hops)||hops<1||parts.length<hops)return 'unknown';
 if(header.toLowerCase()!=='x-forwarded-for'&&parts.length!==1)return 'unknown';
 const ip=parts[parts.length-hops];
 if(/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)&&ip.split('.').every(p=>Number(p)<=255))return ip.split('.').map(Number).join('.');
 if(ip.includes(':')&&!ip.includes('%')){try{return new URL('http://['+ip+']/').hostname.toLowerCase();}catch{}}
 return 'unknown';
}
export function memoryStore({now=Date.now,maxKeys=10000}={}){const entries=new Map();return async(key,ms)=>{const time=now();for(const [k,v] of entries)if(v.until<=time)entries.delete(k);let entry=entries.get(key);if(!entry){if(entries.size>=maxKeys)throw new Error('Store full');entry={count:0,until:time+ms};entries.set(key,entry);}entry.count++;return [entry.count,entry.until-time];};}
const local=memoryStore();
export async function redisCount(key,ms,{env=process.env,fetcher=fetch}={}){const url=env.RATE_LIMIT_REDIS_URL;const token=env.RATE_LIMIT_REDIS_TOKEN;if(!url||!token||new URL(url).protocol!=='https:')throw new Error('Store unavailable');const response=await fetcher(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',LUA,1,key,String(ms)]),signal:AbortSignal.timeout(2000),cache:'no-store',redirect:'error'});if(!response.ok)throw new Error('Store unavailable');const body=await response.json();if(body.error||!Array.isArray(body.result)||body.result.length!==2||!body.result.every(Number.isFinite)||body.result[0]<1||body.result[1]<0)throw new Error('Invalid store result');return body.result;}
export async function checkLimit(name,identity,{env=process.env,count,log=entry=>console.warn(JSON.stringify(entry))}={}){
 try{const {limit,ms}=policy(name,env);const mode=env.RATE_LIMIT_STORE||(env.NODE_ENV==='production'?'redis':'memory');if(!count){if(mode==='memory'&&env.NODE_ENV!=='production')count=local;else if(mode==='redis')count=(key,ttl)=>redisCount(key,ttl,{env});else throw new Error('Store configuration');}
 const secret=env.RATE_LIMIT_KEY_SECRET;if(env.NODE_ENV==='production'&&!secret)throw new Error('Key configuration');
 const keyMaterial=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret||'development-only'),{name:'HMAC',hash:'SHA-256'},false,['sign']);const hash=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',keyMaterial,new TextEncoder().encode(identity)))).map(b=>b.toString(16).padStart(2,'0')).join('');
 const [n,ttl]=await count('phs:rl:v1:'+name+':'+hash,ms);if(n<=limit)return null;
 const retry=Math.max(1,Math.ceil(ttl/1000));log({event:'rate_limit_blocked',policy:name,retryAfter:retry});return {status:429,retry,message:RETRY_MESSAGE};
 }catch{log({event:'rate_limit_store_unavailable',policy:name});return {status:503,retry:30,message:'This service is temporarily busy. Please try again in 30 seconds.'};}
}
export function limitResponse(result){return Response.json({error:result.message,retryAfter:result.retry},{status:result.status,headers:{'Retry-After':String(result.retry),'Cache-Control':'no-store'}});}
