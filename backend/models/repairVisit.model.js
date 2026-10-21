import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const RepairVisitModel = createReadModel({
  table: 'repair_visit',
  primaryKey: ["visit_id"],
  columns: [
    'visit_id',
    'request_id',
    'visit_number',
    'scheduled_start',
    'scheduled_end',
    'visit_status',
    'work_performed',
    'follow_up_reason',
    'remaining_work',
    'testing_result',
    'handover_result',
    'technical_completed_at',
    'extension_requested_by',
    'extension_requested_at',
    'proposed_end',
    'extension_reason',
    'extension_status',
    'extension_decided_by',
    'extension_decided_at',
    'extension_decision_notes',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default RepairVisitModel;
