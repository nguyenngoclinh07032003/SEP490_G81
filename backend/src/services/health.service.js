import { checkPostgres,checkRedis } from '../repositories/health.repository.js';
// Tổng hợp tình trạng hoạt động của API và các kết nối phụ thuộc.
export function createHealthService(probes={postgres:checkPostgres,redis:checkRedis}) {
  return {
    // Trả trạng thái tiến trình mà không gọi DB/Redis.
    live:()=>({status:'ok',service:'hrmss-api'}),
    // Kiểm tra các phụ thuộc song song và đánh dấu từng kết nối up/down.
    ready:async()=>{
      const entries=await Promise.all(Object.entries(probes).map(async([name,probe])=>{
        try {await probe();return [name,'up'];} catch {return [name,'down'];}
      }));
      const dependencies=Object.fromEntries(entries);
      return {status:entries.every(([,state])=>state==='up')?'ready':'not_ready',dependencies};
    },
  };
}
