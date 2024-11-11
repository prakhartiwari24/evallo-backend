import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model';

const auth = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY as string) as {
      id: string;
    };
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(500).json({ message: 'Unauthorized' });
  }
};

export default auth;
