import { AppError } from '../utils/app-error.js';
// Kiểm tra đầu vào bằng schema strict để từ chối trường lạ; kết quả hợp lệ nằm trong req.validated.
export function validate(schemas) {
  return (req,_res,next)=>{
    const validated={}; const details=[];
    for(const [source,schema] of Object.entries(schemas)) {
      const result=schema.safeParse(req[source]);
      if(result.success) validated[source]=result.data;
      else details.push(...result.error.issues.map(i=>({field:[source,...i.path].join('.'),message:i.message})));
    }
    if(details.length) return next(new AppError(400,'VALIDATION_ERROR','Dữ liệu không hợp lệ.',details));
    req.validated=validated; next();
  };
}
