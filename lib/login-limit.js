// Login counters are separate from request quotas and keyed by an HMAC of the account.
export const LOGIN_LUA = `
local op=ARGV[1]
local limit=tonumber(ARGV[2])
local ms=tonumber(ARGV[3])
if op=='reset' then redis.call('DEL',KEYS[1]); return {0,0} end
local n=tonumber(redis.call('GET',KEYS[1]) or '0')
local ttl=redis.call('PTTL',KEYS[1])
if n>=limit and ttl>0 then return {n,ttl} end
if op=='fail' then
 n=redis.call('INCR',KEYS[1])
 if n==1 or n==limit then redis.call('PEXPIRE',KEYS[1],ms) end
 ttl=redis.call('PTTL',KEYS[1])
end
return {n,math.max(0,ttl)}
`;
export function loginMemoryStore({now=Date.now}={}) {
 const entries=new Map();
 return async(key,op,limit,ms)=>{
  const time=now();
  for(const [k,v] of entries)if(v.until<=time)entries.delete(k);
  if(op==='reset'){entries.delete(key);return [0,0];}
  let entry=entries.get(key);
  if(entry?.count>=limit)return [entry.count,entry.until-time];
  if(op==='fail'){
   if(!entry){if(entries.size>=10000)throw Error('Store full');entry={count:0,until:time+ms};entries.set(key,entry);}
   entry.count++;
   if(entry.count===limit)entry.until=time+ms;
  }
  return [entry?.count||0,entry?entry.until-time:0];
 };
}
const local=loginMemoryStore();
// A process-local secret is sufficient for keys that never leave this process.
const localSecret=crypto.randomUUID();
let warnedLocal=false;
export function selectLoginStore(env,log) {
 const configuredRedis=Boolean(env.RATE_LIMIT_REDIS_URL||env.RATE_LIMIT_REDIS_TOKEN);
 const mode=env.RATE_LIMIT_LOGIN_STORE||(configuredRedis?'redis':'memory');
 if(mode==='redis') {
  if(!env.RATE_LIMIT_KEY_SECRET)throw Error('Missing Redis key secret');
  return {store:(...args)=>loginRedisStore(...args,{env}),secret:env.RATE_LIMIT_KEY_SECRET};
 }
 if(mode!=='memory')throw Error('Invalid login store');
 if(env.NODE_ENV==='production'&&!warnedLocal){
  log({event:'login_local_rate_limit',scope:'server_instance'});
  warnedLocal=true;
 }
 return {store:local,secret:env.RATE_LIMIT_KEY_SECRET||localSecret};
}
export async function loginRedisStore(key,op,limit,ms,{env=process.env,fetcher=fetch}={}) {
 const url=env.RATE_LIMIT_REDIS_URL,token=env.RATE_LIMIT_REDIS_TOKEN;
 if(!url||!token||new URL(url).protocol!=='https:')throw Error('Store unavailable');
 const response=await fetcher(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',LOGIN_LUA,1,key,op,String(limit),String(ms)]),signal:AbortSignal.timeout(2000),cache:'no-store',redirect:'error'});
 if(!response.ok)throw Error('Store unavailable');
 const body=await response.json();
 if(body.error||!Array.isArray(body.result)||body.result.length!==2||!body.result.every(v=>Number.isFinite(v)&&v>=0))throw Error('Invalid store result');
 return body.result;
}
export async function attemptLogin(email,signIn,{env=process.env,store,log=entry=>console.warn(JSON.stringify(entry))}={}) {
 let stage='configuration';
 try {
  const limit=Number(env.RATE_LIMIT_LOGIN_MAX||3),seconds=Number(env.RATE_LIMIT_LOGIN_SECONDS||300);
  if(!Number.isSafeInteger(limit)||limit<1||!Number.isSafeInteger(seconds)||seconds<1)throw Error('Invalid policy');
  let secret=env.RATE_LIMIT_KEY_SECRET||localSecret;
  if(!store){const selected=selectLoginStore(env,log);store=selected.store;secret=selected.secret;}
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret||'development-only'),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const hash=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',material,new TextEncoder().encode(email.trim().toLowerCase())))).map(b=>b.toString(16).padStart(2,'0')).join('');
  const key='phs:login-failures:v1:'+hash,ms=seconds*1000;
  const blocked=ttl=>{const retryAfter=Math.ceil(ttl/1000);const minutes=Math.ceil(retryAfter/60);return {error:'Too many failed sign-in attempts. Please wait '+minutes+' minute'+(minutes===1?'':'s')+' before trying again.',retryAfter};};
  stage='counter_check';
  const [failures,ttl]=await store(key,'check',limit,ms);
  if(failures>=limit&&ttl>0)return blocked(ttl);
  stage='authentication';
  const result=await signIn();
  if(result.error||!result.data?.user){
   // Network, configuration and provider outages are not password failures.
   if(result.error?.code!=='invalid_credentials'){log({event:'login_auth_unavailable',status:result.error?.status||0});return {error:'Sign-in is temporarily unavailable. Please try again shortly.'};}
   stage='counter_failure';
   const [count,remaining]=await store(key,'fail',limit,ms);
   if(count>=limit)return blocked(remaining);
   return {error:'The email address or password is incorrect. '+(limit-count)+' attempt'+(limit-count===1?'':'s')+' remaining.'};
  }
  stage='counter_reset';
  await store(key,'reset',limit,ms);
  return result;
 }catch{
  log({event:'login_unavailable',stage});
  return {error:'Sign-in is temporarily unavailable. Please try again shortly.'};
 }
}
