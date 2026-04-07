import bcrypt from 'bcryptjs';
import User from '../../models/user.model.js';
import Session from '../../models/session.model.js';
import { generateAccessToken, generateRefreshToken } from './token.service.js';

export const register = async (model) => {
  const { email, password, role } = model;
  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  const user = await User.create({ email: email, password: hashedPassword, roles: role });
  
  return true;
}

export const login = async (email, password, ip, device) => {

  const user = await User.findOne({ email, isActive: true })
    .select("+password");

  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  await Session.create({
    userId: user._id,
    refreshToken: refreshToken,
    ipAddress: ip,
    device: device,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return { user: { id: user._id, email: user.email, roles: user.roles },
           accessToken,
           refreshToken 
         };
};

export const refresh = async (oldToken) => {

  const session = await Session.findOne({ refreshToken: oldToken, revoked: false })
    .populate("userId");

  if (!session) throw new Error("Invalid token");

  if (session.expiresAt < new Date()) throw new Error("Token expired")

  const newAccessToken = generateAccessToken(session.userId);
  const newRefreshToken = generateRefreshToken();

  session.refreshToken = newRefreshToken;
  await session.save();
  return { newAccessToken, newRefreshToken, user: {
    id: session.userId._id,
    email: session.userId.email,
    roles: session.userId.roles
  } };
};

export const logout = async (oldToken) => {
  const result = await Session.updateOne({ refreshToken: oldToken} , { $set: { revoked: true } } );
  return true;
};

export const checkEmail = async (email) => {
  return !!(await User.exists({ email }));
};