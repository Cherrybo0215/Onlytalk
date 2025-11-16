import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const secret = process.env.JWT_SECRET || 'your-secret-key';
  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: '无效的认证令牌' });
    }
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  });
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    jwt.verify(token, secret, (err: any, decoded: any) => {
      if (!err) {
        req.userId = decoded.userId;
        req.user = decoded;
      }
    });
  }
  next();
}

