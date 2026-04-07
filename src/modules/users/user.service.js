import User from '../../models/user.model.js';

export const getSuppliers = async () => {
  return await User.find({ roles: 'SUPPLIER'});
}
