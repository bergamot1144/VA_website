import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import categoriesRoutes from './routes/categories.js';
import sitesRoutes from './routes/sites.js';
import lessonsRoutes from './routes/lessons.js';
import adminUsersRoutes from './routes/admin/users.js';
import adminCategoriesRoutes from './routes/admin/categories.js';
import adminSitesRoutes from './routes/admin/sites.js';
import adminLessonsRoutes from './routes/admin/lessons.js';
import { authenticateToken } from './middleware/auth.js';
import { requireAdmin } from './middleware/requireAdmin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Статическая раздача загруженных файлов (видео, изображения)
// Добавляем CORS заголовки для статических файлов
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Отключаем кеширование только для видео файлов
  const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.m4v'];
  const isVideo = videoExtensions.some(ext => req.path.toLowerCase().endsWith(ext));
  
  if (isVideo) {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
  }
  
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/categories', authenticateToken, categoriesRoutes);
app.use('/api/sites', authenticateToken, sitesRoutes);
app.use('/api/lessons', authenticateToken, lessonsRoutes);

// Admin routes (all require authentication and admin role)
app.use('/api/admin/users', authenticateToken, requireAdmin, adminUsersRoutes);
app.use('/api/admin/categories', authenticateToken, requireAdmin, adminCategoriesRoutes);
app.use('/api/admin/sites', authenticateToken, requireAdmin, adminSitesRoutes);
app.use('/api/admin/lessons', authenticateToken, requireAdmin, adminLessonsRoutes);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

