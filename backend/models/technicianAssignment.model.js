import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const TechnicianAssignmentModel = createReadModel({
  table: 'technician_assignment',
  primaryKey: ["assignment_id"],
  columns: [
    'assignment_id',
    'assigned_by',
    'technician_id',
    'visit_id',
    'assigned_at',
    'ended_at',
    'assignment_status',
    'planned_start',
    'planned_end',
    'started_at',
    'completed_at',
    'completion_note',
    'active_technician_id',
    'notes',
    'created_at',
    'updated_at',
  ],
  // Cột do DB tự tính (Generated Column).
  generatedColumns: ["active_technician_id"],
  hiddenColumns: [],
});

export default TechnicianAssignmentModel;
