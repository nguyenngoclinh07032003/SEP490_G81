import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { createHealthService } from '../src/services/health.service.js';
// Khởi chạy API ở cổng ngẫu nhiên để test và luôn đóng server sau khi kết thúc.
async function withApi(run,probes={postgres:async()=>{},redis:async()=>{}}) {
 const server=createApp({healthService:createHealthService(probes)}).listen(0,'127.0.0.1');
 await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
 try {await run(base);} finally {server.closeAllConnections();await new Promise(r=>server.close(r));}
}
test('liveness, request ID and no-store envelope',()=>withApi(async base=>{
 const r=await fetch(base+'/api/v1/health');const b=await r.json();
 assert.equal(r.status,200);assert.equal(b.success,true);assert.equal(b.code,'SERVICE_ALIVE');
 assert.equal(b.meta.requestId,r.headers.get('x-request-id'));assert.equal(r.headers.get('cache-control'),'no-store');
}));
test('readiness probes all dependencies',()=>withApi(async base=>{
 const r=await fetch(base+'/api/v1/health/ready');const b=await r.json();assert.equal(r.status,200);assert.deepEqual(b.data.dependencies,{postgres:'up',redis:'up'});
}));
test('dependency failure is sanitized 503',()=>withApi(async base=>{
 const r=await fetch(base+'/api/v1/health/ready');const b=await r.json();assert.equal(r.status,503);assert.equal(b.success,false);assert.equal(b.code,'SERVICE_NOT_READY');assert.ok(!JSON.stringify(b).includes('secret'));
},{postgres:async()=>{throw Error('secret');},redis:async()=>{}}));
test('unknown query rejected',()=>withApi(async base=>{
 const r=await fetch(base+'/api/v1/health?unexpected=1');assert.equal(r.status,400);assert.equal((await r.json()).code,'VALIDATION_ERROR');
}));
test('malformed JSON and missing endpoint use same error contract',()=>withApi(async base=>{
 const invalid=await fetch(base+'/api/v1/health',{method:'POST',headers:{'content-type':'application/json'},body:'{'});
 assert.equal(invalid.status,400);assert.equal((await invalid.json()).code,'INVALID_JSON');
 const missing=await fetch(base+'/api/v1/auth/login');assert.equal(missing.status,404);assert.equal((await missing.json()).code,'NOT_FOUND');
}));
test('oversized body returns 413',()=>withApi(async base=>{
 const r=await fetch(base+'/api/v1/health',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({x:'x'.repeat(40000)})});assert.equal(r.status,413);assert.equal((await r.json()).code,'PAYLOAD_TOO_LARGE');
}));
