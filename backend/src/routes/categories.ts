import express, { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Получить все категории
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        sites: {
          orderBy: { name: 'asc' },
        },
      },
    });
    res.json(categories);
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить одну категорию
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        sites: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    res.json(category);
  } catch (error) {
    console.error('Ошибка получения категории:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

