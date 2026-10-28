import { z } from 'zod';
// Health không nhận tham số query; trường lạ sẽ bị từ chối.
export const emptyQuery=z.object({}).strict();
