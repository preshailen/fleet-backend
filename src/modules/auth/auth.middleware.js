import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) { 
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (!roles.includes(req.user.role)) {
      return res.sendStatus(403);
    }
    next();
  };
};