import * as authService from './auth.service.js';

export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'A required field is missing' });
    }
    if (await authService.checkUserExists(email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    await authService.register(req.body);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(401).json({ message: "Invalid registration" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'A required field is missing' });
    }
    const ip = req.ip;
    const device = req.headers['user-agent'];
    const result = await authService.login(email, password, ip, device);
    
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
      path: "/"
    });
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite:  isProduction ? "none" : "lax",
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

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      maxAge: 15 * 60 * 1000,
      sameSite: isProduction ? "none" : "lax",
      path: "/"
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "none" : "lax",
      path: "/"
    });

    res.json({ accessToken: newAccessToken, user: user });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const checkNonSupplierExists = async (req, res) => {
  try {
    if (!req.params.email) {
      return res.status(400).json({ message: "Email is missing" });
    }
    res.status(200).json(await authService.checkNonSupplierExists(req.params.email));
  } catch (err) {
    res.status(401).json({ message: "Error with email"});
  }
}

export const logout = async (req, res) => {
  try {
    await authService.logout(req.cookies.refreshToken);
    res.clearCookie("refreshToken");
    res.sendStatus(204);
  } catch (err) {
    res.status(401).json({ message: "Invalid logout" });
  }
};