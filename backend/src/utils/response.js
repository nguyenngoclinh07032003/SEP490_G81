// Trả phản hồi thành công theo hợp đồng API, luôn kèm requestId của yêu cầu hiện tại.
export function success(res,{status=200,code='OK',message='Thành công.',data=null,meta={}}={}) {
  return res.status(status).json({success:true,code,message,data,meta:{...meta,requestId:res.locals.requestId}});
}
