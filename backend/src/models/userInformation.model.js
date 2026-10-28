import createReadModel from './readModel.js';

// Mô tả hồ sơ cá nhân, dùng user_id làm khóa chính.
const UserInformationModel = createReadModel({
  table: 'user_information',
  primaryKey: ["user_id"],
  columns: [
    'user_id',
    'full_name',
    'phone',
    'ava_storage_reference',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default UserInformationModel;
