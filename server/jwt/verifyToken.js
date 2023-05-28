import jwt from 'jsonwebtoken';
import { createError } from '../error/createError.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  const adminToken = req?.headers?.authorization?.split(' ')[1];
  console.log(jwt.decode(adminToken, process.env.JWT_SECRET_KEY));
  if (!token && !adminToken) return next(createError(401, 'You are not authenticated!'));
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) return next(createError(403, 'Token is not valid!'));
      req.user = user;
      next();
    });
  }
  if (adminToken) {
    jwt.verify(adminToken, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) return next(createError(403, 'Token is not valid!'));
      req.user = user;
      next();
    });
  }
};
