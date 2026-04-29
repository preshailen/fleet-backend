import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, roles: user.roles },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = () => {
  return uuidv4();
};