# Инструкция по развертыванию Venom Agency на сервере

Пошаговая инструкция для развертывания проекта на продакшн сервере (VPS, облако, и т.д.).

## Требования к серверу

- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+ / Windows Server
- **Node.js**: версия 18 или выше
- **npm**: версия 9 или выше
- **База данных**: SQLite (встроена) или PostgreSQL/MySQL для продакшена
- **Веб-сервер**: Nginx (рекомендуется) или Apache
- **Процесс-менеджер**: PM2 (для Node.js)

## Вариант 1: Развертывание на Linux сервере (Ubuntu/Debian)

### Шаг 1: Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка версий
node --version
npm --version

# Установка PM2
sudo npm install -g pm2

# Установка Git
sudo apt install -y git

# Установка Nginx (опционально, для раздачи статики)
sudo apt install -y nginx
```

### Шаг 2: Клонирование репозитория

```bash
# Создать директорию для проекта
sudo mkdir -p /var/www/venom-agency
sudo chown $USER:$USER /var/www/venom-agency

# Клонировать репозиторий
cd /var/www/venom-agency
git clone https://github.com/bergamot1144/VA_website.git .
```

### Шаг 3: Установка зависимостей

```bash
cd /var/www/venom-agency
npm run install:all
```

### Шаг 4: Настройка базы данных

```bash
cd backend

# Сгенерировать Prisma Client
npm run prisma:generate

# Применить миграции (создаст базу данных)
npm run prisma:migrate
```

### Шаг 5: Настройка переменных окружения

```bash
cd backend

# Создать .env файл
nano .env
```

Добавьте в `.env`:

```env
# Обязательные настройки
JWT_SECRET=сгенерируйте-очень-сложный-ключ-минимум-32-символа
PORT=3001
DATABASE_URL="file:./prisma/dev.db"
FRONTEND_URL=https://ваш-домен.com

# Опционально (для PostgreSQL)
# DATABASE_URL="postgresql://user:password@localhost:5432/venom_agency?schema=public"
```

**Важно:** Сгенерируйте безопасный JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Шаг 6: Создание администратора

```bash
cd backend
npm run user:create admin ваш_безопасный_пароль ADMIN
```

### Шаг 7: Сборка проекта

```bash
cd /var/www/venom-agency

# Сборка backend
cd backend
npm run build

# Сборка frontend
cd ../frontend
npm run build
```

### Шаг 8: Настройка PM2 для backend

```bash
cd /var/www/venom-agency/backend

# Создать ecosystem файл
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'venom-agency-backend',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF

# Запустить через PM2
pm2 start ecosystem.config.js

# Сохранить конфигурацию PM2
pm2 save

# Настроить автозапуск при перезагрузке сервера
pm2 startup
# Выполните команду, которую покажет PM2
```

### Шаг 9: Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/venom-agency
```

Добавьте конфигурацию:

```nginx
# Backend API
server {
    listen 80;
    server_name api.ваш-домен.com;  # Или используйте подпуть

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические файлы (видео)
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Access-Control-Allow-Origin *;
        
        # Отключаем кеширование для видео файлов
        location ~* \.(mp4|avi|mov|mkv|webm|m4v)$ {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            add_header Access-Control-Allow-Origin *;
            add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
    }
}

# Frontend
server {
    listen 80;
    server_name ваш-домен.com www.ваш-домен.com;

    root /var/www/venom-agency/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кеширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Прокси для API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Прокси для загрузок
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Access-Control-Allow-Origin *;
        
        # Отключаем кеширование для видео файлов
        location ~* \.(mp4|avi|mov|mkv|webm|m4v)$ {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            add_header Access-Control-Allow-Origin *;
            add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/venom-agency /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 10: Настройка SSL (HTTPS)

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d ваш-домен.com -d www.ваш-домен.com

# Автоматическое обновление
sudo certbot renew --dry-run
```

### Шаг 11: Обновление FRONTEND_URL в .env

После настройки домена обновите `backend/.env`:

```env
FRONTEND_URL=https://ваш-домен.com
```

Перезапустите backend:

```bash
pm2 restart venom-agency-backend
```

## Вариант 2: Развертывание на Windows Server

### Шаг 1: Установка Node.js

1. Скачайте Node.js 18+ с [nodejs.org](https://nodejs.org/)
2. Установите Node.js
3. Установите PM2 глобально: `npm install -g pm2`

### Шаг 2: Клонирование и настройка

```powershell
# Создать папку
New-Item -ItemType Directory -Path "C:\www\venom-agency"

# Клонировать репозиторий
cd C:\www\venom-agency
git clone https://github.com/bergamot1144/VA_website.git .

# Установить зависимости
npm run install:all

# Настроить базу данных
cd backend
npm run prisma:generate
npm run prisma:migrate

# Создать .env файл
Copy-Item .env.example .env
# Отредактируйте .env файл

# Создать администратора
npm run user:create admin ваш_пароль ADMIN

# Собрать проект
cd ..
npm run build
```

### Шаг 3: Запуск через PM2

```powershell
cd C:\www\venom-agency\backend

# Создать ecosystem.config.js
@"
module.exports = {
  apps: [{
    name: 'venom-agency-backend',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
"@ | Out-File -FilePath ecosystem.config.js -Encoding utf8

# Запустить
pm2 start ecosystem.config.js
pm2 save
```

### Шаг 4: Настройка IIS или другого веб-сервера

Настройте IIS для раздачи frontend из `C:\www\venom-agency\frontend\dist` и проксирования `/api` на `http://localhost:3001`.

## Управление на сервере

### Просмотр логов

```bash
# PM2 логи backend
pm2 logs venom-agency-backend

# Мониторинг
pm2 monit
```

### Перезапуск

```bash
pm2 restart venom-agency-backend
```

### Обновление кода

```bash
cd /var/www/venom-agency

# Получить обновления
git pull origin main

# Переустановить зависимости (если изменились)
npm run install:all

# Пересобрать
cd backend && npm run build
cd ../frontend && npm run build

# Перезапустить
pm2 restart venom-agency-backend
```

### Резервное копирование базы данных

```bash
# Создать backup
cp backend/prisma/dev.db backend/prisma/backup-$(date +%Y%m%d-%H%M%S).db

# Или автоматически (добавить в crontab)
0 2 * * * cp /var/www/venom-agency/backend/prisma/dev.db /var/backups/venom-agency-$(date +\%Y\%m\%d).db
```

## Безопасность

1. **Firewall**: Настройте firewall (ufw/iptables)
   ```bash
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw enable
   ```

2. **JWT_SECRET**: Используйте очень сложный ключ (минимум 32 символа)

3. **.env файл**: Убедитесь, что `.env` не доступен публично
   ```bash
   chmod 600 backend/.env
   ```

4. **Обновления**: Регулярно обновляйте систему и зависимости

5. **Мониторинг**: Настройте мониторинг (PM2 Plus, Sentry, и т.д.)

## Использование PostgreSQL в продакшене

Для лучшей производительности в продакшене рекомендуется использовать PostgreSQL:

1. Установите PostgreSQL
2. Создайте базу данных
3. Обновите `DATABASE_URL` в `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/venom_agency?schema=public"
   ```
4. Обновите `provider` в `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Примените миграции: `npm run prisma:migrate`

---

**Готово!** Ваш сайт должен быть доступен по указанному домену.

