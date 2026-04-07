import * as userService from './user.service.js';

export const getSuppliers = async (req, res) => {
  try {
    res.status(200).json(await userService.getSuppliers());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Suppliers', error });
  }    
}