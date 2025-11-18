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

# Создать .env файл (Linux/Mac)
nano .env

# Или для Windows
notepad .env
```

#### Генерация JWT_SECRET

**JWT_SECRET** - это секретный ключ для подписи JWT токенов. Это критически важный параметр безопасности!

**⚠️ ВАЖНО:** 
- Никогда не используйте простые или предсказуемые значения
- Используйте случайно сгенерированную строку минимум 32 символа
- Держите этот ключ в секрете, не коммитьте в Git

**Способы генерации JWT_SECRET:**

1. **Через Node.js** (если Node.js установлен):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Это выдаст строку вида: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

2. **Через OpenSSL** (если установлен):
   ```bash
   openssl rand -hex 32
   ```

3. **Онлайн генератор:**
   - Перейдите на https://generate-secret.vercel.app/32
   - Или используйте любой другой надежный генератор случайных строк

4. **Вручную** (не рекомендуется, но возможно):
   - Используйте длинную случайную строку из букв, цифр и символов
   - Минимум 32 символа, лучше 64+

#### Создание .env файла

Создайте файл `backend/.env` со следующим содержимым:

```env
# ==========================================
# ОБЯЗАТЕЛЬНЫЕ НАСТРОЙКИ
# ==========================================

# JWT_SECRET - секретный ключ для подписи токенов авторизации
# СГЕНЕРИРУЙТЕ СВОЙ УНИКАЛЬНЫЙ КЛЮЧ! Используйте один из методов выше.
# Пример сгенерированного ключа:
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# PORT - порт, на котором будет работать backend сервер
# Обычно 3001, но можете изменить если нужно
PORT=3001

# DATABASE_URL - путь к базе данных SQLite
# Для продакшена оставьте как есть (SQLite), или используйте PostgreSQL (см. ниже)
DATABASE_URL="file:./prisma/dev.db"

# FRONTEND_URL - URL вашего frontend приложения
# Для продакшена укажите полный URL с https://
# Для разработки используйте http://localhost:5173
FRONTEND_URL=https://ваш-домен.com
# Или для локальной разработки:
# FRONTEND_URL=http://localhost:5173
```

#### Пример заполненного .env файла для продакшена:

```env
# Пример конфигурации для продакшена
JWT_SECRET=7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2
PORT=3001
DATABASE_URL="file:./prisma/dev.db"
FRONTEND_URL=https://venom-agency.com
```

#### Пример заполненного .env файла для разработки:

```env
# Пример конфигурации для локальной разработки
JWT_SECRET=dev-secret-key-change-in-production-12345678901234567890
PORT=3001
DATABASE_URL="file:./prisma/dev.db"
FRONTEND_URL=http://localhost:5173
```

#### Опционально: Использование PostgreSQL вместо SQLite

Для лучшей производительности в продакшене можно использовать PostgreSQL:

1. Установите PostgreSQL на сервере
2. Создайте базу данных:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE venom_agency;
   CREATE USER venom_user WITH PASSWORD 'ваш_пароль';
   GRANT ALL PRIVILEGES ON DATABASE venom_agency TO venom_user;
   \q
   ```

3. Обновите `.env`:
   ```env
   DATABASE_URL="postgresql://venom_user:ваш_пароль@localhost:5432/venom_agency?schema=public"
   ```

4. Обновите `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Измените с "sqlite" на "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

5. Примените миграции:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

#### Проверка .env файла

После создания `.env` файла убедитесь что:

1. ✅ Файл находится в папке `backend/.env` (не `backend/backend/.env`)
2. ✅ JWT_SECRET длиной минимум 32 символа
3. ✅ Нет лишних пробелов вокруг знака `=`
4. ✅ Значения в кавычках (если содержат пробелы или специальные символы)
5. ✅ FRONTEND_URL указан правильно (для продакшена с https://)

**Важно для безопасности:**
- Никогда не коммитьте `.env` в Git (он уже в .gitignore)
- Храните `.env` в безопасном месте
- Регулярно меняйте JWT_SECRET в продакшене (это разлогинит всех пользователей, делайте осторожно)

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

После настройки домена и получения SSL сертификата обновите `backend/.env`:

```env
FRONTEND_URL=https://ваш-домен.com
```

**Почему это важно:**
- FRONTEND_URL используется для CORS (Cross-Origin Resource Sharing)
- Если указан неправильно, frontend не сможет делать запросы к API
- После изменения обязательно перезапустите backend

Перезапустите backend:

```bash
pm2 restart venom-agency-backend

# Проверьте логи на наличие ошибок
pm2 logs venom-agency-backend
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
```

### Шаг 3: Создание .env файла (Windows)

```powershell
cd backend

# Создать .env файл
# Вариант 1: Через Notepad
notepad .env

# Вариант 2: Через PowerShell
New-Item -ItemType File -Path .env
notepad .env
```

**Генерация JWT_SECRET на Windows:**

Если Node.js установлен:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Или используйте онлайн генератор: https://generate-secret.vercel.app/32

**Содержимое .env файла:**

Создайте файл `backend\.env` со следующим содержимым (замените значения на свои):

```env
# JWT_SECRET - секретный ключ для подписи токенов
# СГЕНЕРИРУЙТЕ СВОЙ УНИКАЛЬНЫЙ КЛЮЧ! Минимум 32 символа
JWT_SECRET=ваш-сгенерированный-64-символьный-ключ-из-букв-и-цифр-123456789012

# PORT - порт backend сервера
PORT=3001

# DATABASE_URL - путь к базе данных
DATABASE_URL="file:./prisma/dev.db"

# FRONTEND_URL - URL frontend приложения
# Для продакшена:
FRONTEND_URL=https://ваш-домен.com
# Для локальной разработки:
# FRONTEND_URL=http://localhost:5173
```

**Пример заполненного .env:**

```env
JWT_SECRET=7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2
PORT=3001
DATABASE_URL="file:./prisma/dev.db"
FRONTEND_URL=https://venom-agency.com
```

**Важно:** 
- Сохраните файл в папке `backend\.env` (не в корне проекта)
- Убедитесь что файл сохранен как `.env` (не `.env.txt`)
- В Windows Explorer может скрывать файлы начинающиеся с точки - включите показ скрытых файлов

### Шаг 4: Создание администратора

```powershell
cd backend
npm run user:create admin ваш_безопасный_пароль ADMIN
```

### Шаг 5: Сборка проекта

```powershell
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

