import createReadModel from "./readModel.js";

// Cấu hình model theo bảng trong schema.
const AcceptanceRecordModel = createReadModel({
  table: "acceptance_record",
  primaryKey: ["acceptance_id"],
  columns: [
    "acceptance_id",
    "recorded_by",
    "request_id",
    "acceptance_date",
    "acceptance_outcome",
    "customer_confirmation_method",
    "notes",
    "created_at",
    "updated_at",
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default AcceptanceRecordModel;
