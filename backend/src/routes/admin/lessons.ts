import express, { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Все маршруты требуют авторизации
router.use(authenticateToken);

// Получить все уроки (для админки)
router.get('/', async (req: Request, res: Response) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        site: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
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
            category: {
              select: {
                id: true,
                name: true,
              },
            },
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

// Создать урок
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content, videoUrl, siteId, order } = req.body;

    if (!title || !content || !siteId) {
      return res.status(400).json({ error: 'Название, контент и сайт обязательны' });
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return res.status(404).json({ error: 'Сайт не найден' });
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        videoUrl: videoUrl || null,
        siteId,
        order: order !== undefined ? order : 0,
      },
      include: {
        site: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Ошибка создания урока:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить урок
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, content, videoUrl, siteId, order } = req.body;

    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Урок не найден' });
    }

    if (siteId) {
      const site = await prisma.site.findUnique({
        where: { id: siteId },
      });

      if (!site) {
        return res.status(404).json({ error: 'Сайт не найден' });
      }
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl || null }),
        ...(siteId && { siteId }),
        ...(order !== undefined && { order }),
      },
      include: {
        site: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.json(updatedLesson);
  } catch (error) {
    console.error('Ошибка обновления урока:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить урок
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Урок не найден' });
    }

    await prisma.lesson.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Урок удален' });
  } catch (error) {
    console.error('Ошибка удаления урока:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

