const CACHE="psp-v1";
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
function wrap(res){
  if(res.status===0)return res;
  const h=new Headers(res.headers);
  h.set("Cross-Origin-Embedder-Policy","credentialless");
  h.set("Cross-Origin-Opener-Policy","same-origin");
  return new Response(res.body,{status:res.status,statusText:res.statusText,headers:h});
}
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET"||r.url.startsWith("blob:")||(r.cache==="only-if-cached"&&r.mode!=="same-origin"))return;
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    const hit=await c.match(r);
    if(hit)return wrap(hit);
    try{
      const res=await fetch(r);
      if(res.ok)c.put(r,res.clone());
      return wrap(res);
    }catch(err){
      return new Response("offline",{status:503});
    }
  })());
});
