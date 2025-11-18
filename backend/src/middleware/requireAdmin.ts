import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from './auth.js';

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Необходима авторизация' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуется роль администратора' });
    }

    next();
  } catch (error) {
    console.error('Ошибка проверки роли:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
};

