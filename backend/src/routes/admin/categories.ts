import express, { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Все маршруты требуют авторизации
router.use(authenticateToken);

// Получить все категории (для админки)
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        sites: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { order: 'asc' },
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
          select: {
            id: true,
            name: true,
          },
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

// Создать категорию
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, order } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Название категории обязательно' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        order: order !== undefined ? order : 0,
      },
      include: {
        sites: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Ошибка создания категории:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить категорию
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, order } = req.body;

    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
    });

    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(order !== undefined && { order }),
      },
      include: {
        sites: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Ошибка обновления категории:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить категорию
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
    });

    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    await prisma.category.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Категория удалена' });
  } catch (error) {
    console.error('Ошибка удаления категории:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

