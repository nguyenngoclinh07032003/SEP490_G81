import createReadModel from './readModel.js';

// Model user_information: Hồ sơ cá nhân người dùng (1:1 với user_account, không lưu GPS)
const UserInformationModel = createReadModel({
  table: 'user_information',
  primaryKey: ['user_id'],
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
