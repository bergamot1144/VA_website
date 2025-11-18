# Папка для хранения видео

Эта папка предназначена для хранения видео файлов, которые используются в уроках.

## Как использовать:

1. **Загрузите видео файл** в эту папку (`backend/uploads/videos/`)

   - Поддерживаемые форматы: mp4, avi, mov, mkv, webm, m4v
   - Рекомендуется использовать формат MP4 для лучшей совместимости

2. **Используйте путь к файлу в уроке:**

   - После загрузки файла (например, `video1.mp4`)
   - В админ-панели при создании/редактировании урока
   - В поле "URL видео" укажите: `http://localhost:3001/uploads/videos/video1.mp4`

   Или для встраивания в HTML:

   ```html
   <video controls width="100%">
     <source
       src="http://localhost:3001/uploads/videos/video1.mp4"
       type="video/mp4"
     />
     Ваш браузер не поддерживает видео.
   </video>
   ```

## Примеры:

- Файл: `backend/uploads/videos/intro.mp4`
- URL для урока: `http://localhost:3001/uploads/videos/intro.mp4`

- Файл: `backend/uploads/videos/registration_tutorial.mp4`
- URL для урока: `http://localhost:3001/uploads/videos/registration_tutorial.mp4`

## Важно:

- Файлы будут доступны по адресу: `http://localhost:3001/uploads/videos/имя_файла.mp4`
- Видео файлы не отслеживаются в Git (добавлены в .gitignore)
- Для продакшена замените `localhost:3001` на ваш домен
