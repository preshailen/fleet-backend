import * as authService from './auth.service.js';

export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body.model;
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'A required field is missing' });
    }
    if (await authService.checkEmail(email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    await authService.register(req.body.model);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(401).json({ message: "Invalid registration" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;
    const device = req.headers['user-agent'];
    const result = await authService.login(email, password, ip, device);
    
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/"
    });
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    res.json({ accessToken: result.accessToken, user: result.user });

  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const oldToken = req.cookies.refreshToken;
    if (!oldToken) return res.sendStatus(401);

    const { newAccessToken, newRefreshToken, user } = await authService.refresh(oldToken);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000,
      sameSite: "lax",
      path: "/"
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      path: "/"
    });

    res.json({ accessToken: newAccessToken, user: user });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req, res) => {
  try {
    await authService.logout(req.cookies.refreshToken);
    res.clearCookie("refreshToken");
    res.sendStatus(204);
  } catch (err) {
    res.status(401).json({ message: "Invalid logout" });
  }
};

export const me = async (req, res) => {
  res.json(req.user);
};