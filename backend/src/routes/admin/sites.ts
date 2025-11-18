import express, { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Все маршруты требуют авторизации
router.use(authenticateToken);

// Получить все сайты (для админки)
router.get('/', async (req: Request, res: Response) => {
  try {
    const sites = await prisma.site.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
          },
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
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
          },
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

// Создать сайт
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, url, description, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Название и категория обязательны' });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    const site = await prisma.site.create({
      data: {
        name,
        url: url || '',
        description: description || null,
        categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json(site);
  } catch (error) {
    console.error('Ошибка создания сайта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить сайт
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, url, description, categoryId } = req.body;

    const site = await prisma.site.findUnique({
      where: { id: req.params.id },
    });

    if (!site) {
      return res.status(404).json({ error: 'Сайт не найден' });
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({ error: 'Категория не найдена' });
      }
    }

    const updatedSite = await prisma.site.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(url !== undefined && { url }),
        ...(description !== undefined && { description: description || null }),
        ...(categoryId && { categoryId }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json(updatedSite);
  } catch (error) {
    console.error('Ошибка обновления сайта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить сайт
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const site = await prisma.site.findUnique({
      where: { id: req.params.id },
    });

    if (!site) {
      return res.status(404).json({ error: 'Сайт не найден' });
    }

    await prisma.site.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Сайт удален' });
  } catch (error) {
    console.error('Ошибка удаления сайта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

