import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const ScheduleChangeHistoryModel = createReadModel({
  table: 'schedule_change_history',
  primaryKey: ["change_id"],
  columns: [
    'change_id',
    'visit_id',
    'assignment_id',
    'changed_by',
    'changed_at',
    'old_start',
    'old_end',
    'new_start',
    'new_end',
    'reason',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default ScheduleChangeHistoryModel;
