import express, { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Получить все сайты
router.get('/', async (req: Request, res: Response) => {
  try {
    const sites = await prisma.site.findMany({
      include: {
        category: true,
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(sites);
  } catch (error) {
    console.error('Ошибка получения сайтов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить сайты по категории
router.get('/category/:categoryId', async (req: Request, res: Response) => {
  try {
    const sites = await prisma.site.findMany({
      where: { categoryId: req.params.categoryId },
      include: {
        category: true,
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(sites);
  } catch (error) {
    console.error('Ошибка получения сайтов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить один сайт
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const site = await prisma.site.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!site) {
      return res.status(404).json({ error: 'Сайт не найден' });
    }

    res.json(site);
  } catch (error) {
    console.error('Ошибка получения сайта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

