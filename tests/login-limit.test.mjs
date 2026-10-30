import test from 'node:test';
import assert from 'node:assert/strict';
import {attemptLogin,loginMemoryStore,loginRedisStore,LOGIN_LUA} from '../lib/login-limit.js';
const invalid=async()=>({data:{user:null},error:{code:'invalid_credentials'}});
const success=async()=>({data:{user:{id:'staff'}},error:null});
function setup(){let time=0;return {opts:{env:{NODE_ENV:'test'},store:loginMemoryStore({now:()=>time}),log:()=>{}},time:t=>{time=t;}};}
test('three failed credentials start a full five-minute lock; blocked retries do not extend it',async()=>{
 const {opts,time}=setup();
 assert.match((await attemptLogin('staff@example.org',invalid,opts)).error,/2 attempts remaining/);
 time(60000);
 assert.match((await attemptLogin('staff@example.org',invalid,opts)).error,/1 attempt remaining/);
 time(120000);
 assert.equal((await attemptLogin('staff@example.org',invalid,opts)).retryAfter,300);
 let calls=0;const signIn=async()=>{calls++;return success();};
 time(419999);assert.equal((await attemptLogin('staff@example.org',signIn,opts)).retryAfter,1);assert.equal(calls,0);
 time(420000);assert.equal((await attemptLogin('staff@example.org',signIn,opts)).data.user.id,'staff');assert.equal(calls,1);
});
test('successes reset failures; checking never consumes attempts; accounts are isolated and normalized',async()=>{
 const {opts}=setup();
 for(let i=0;i<5;i++)assert.equal((await attemptLogin('a@example.org',success,opts)).data.user.id,'staff');
 await attemptLogin('a@example.org',invalid,opts);
 await attemptLogin('a@example.org',success,opts);
 assert.match((await attemptLogin(' A@EXAMPLE.ORG ',invalid,opts)).error,/2 attempts remaining/);
 await attemptLogin('a@example.org',invalid,opts);
 assert.equal((await attemptLogin('a@example.org',invalid,opts)).retryAfter,300);
 assert.equal((await attemptLogin('b@example.org',success,opts)).data.user.id,'staff');
});
test('outages do not count as bad passwords or show a lockout message',async()=>{
 const {opts}=setup();
 for(let i=0;i<4;i++)assert.match((await attemptLogin('a@example.org',async()=>({error:{code:'unexpected_failure'}}),opts)).error,/temporarily unavailable/);
 assert.match((await attemptLogin('a@example.org',invalid,opts)).error,/2 attempts remaining/);
 assert.match((await attemptLogin('a@example.org',success,{...opts,store:async()=>{throw Error('secret');}})).error,/temporarily unavailable/);
});
test('Redis uses atomic check/fail/reset commands and hashes account identities',async()=>{
 let command;
 const store=(...args)=>loginRedisStore(...args,{env:{RATE_LIMIT_REDIS_URL:'https://redis.invalid',RATE_LIMIT_REDIS_TOKEN:'test'},fetcher:async(_url,init)=>{command=JSON.parse(init.body);return Response.json({result:[0,0]});}});
 const result=await attemptLogin('private@example.org',success,{env:{NODE_ENV:'test'},store});
 assert.equal(result.data.user.id,'staff');assert.equal(command[0],'EVAL');assert.equal(command[1],LOGIN_LUA);assert.equal(command[4],'reset');assert(!command[3].includes('private'));assert.equal(command[5],'3');assert.equal(command[6],'300000');
});

test('production login works without optional Redis settings and still locks after three failures',async()=>{
 const opts={env:{NODE_ENV:'production'},log:()=>{}};
 assert.equal((await attemptLogin('production-success@example.org',success,opts)).data.user.id,'staff');
 assert.match((await attemptLogin('production-failure@example.org',invalid,opts)).error,/2 attempts remaining/);
 assert.match((await attemptLogin('production-failure@example.org',invalid,opts)).error,/1 attempt remaining/);
 assert.equal((await attemptLogin('production-failure@example.org',invalid,opts)).retryAfter,300);
 let calls=0;
 assert.equal((await attemptLogin('production-failure@example.org',async()=>{calls++;return success();},opts)).retryAfter,300);
 assert.equal(calls,0);
});
test('request limiter Redis mode does not accidentally require Redis for login',async()=>{
 const result=await attemptLogin('request-config@example.org',success,{env:{NODE_ENV:'production',RATE_LIMIT_STORE:'redis'},log:()=>{}});
 assert.equal(result.data.user.id,'staff');
});
test('explicit Redis configuration errors fail closed and identify the stage without leaking secrets',async()=>{
 const logs=[];let calls=0;
 const result=await attemptLogin('private@example.org',async()=>{calls++;return success();},{env:{NODE_ENV:'production',RATE_LIMIT_LOGIN_STORE:'redis'},log:e=>logs.push(e)});
 assert.match(result.error,/temporarily unavailable/);assert.equal(calls,0);
 assert.deepEqual(logs,[{event:'login_unavailable',stage:'configuration'}]);
 assert(!JSON.stringify(logs).includes('private'));
});
