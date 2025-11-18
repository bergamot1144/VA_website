import express, { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Получить все уроки
router.get('/', async (req: Request, res: Response) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        site: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
    res.json(lessons);
  } catch (error) {
    console.error('Ошибка получения уроков:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить уроки по сайту
router.get('/site/:siteId', async (req: Request, res: Response) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { siteId: req.params.siteId },
      include: {
        site: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
    res.json(lessons);
  } catch (error) {
    console.error('Ошибка получения уроков:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить один урок
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: {
        site: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Урок не найден' });
    }

    res.json(lesson);
  } catch (error) {
    console.error('Ошибка получения урока:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

