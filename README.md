# 🎵 Luka Frizz - Полнофункциональный сайт с бэкэндом

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/luka-frizz-website)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/luka-frizz-website)

## 🚀 Описание

Современный анимированный сайт для Luka Frizz с полноценным бэкэндом на Node.js, включающий:
- 🎨 Красивый фронтенд с анимациями и видео-фоном
- 💬 Систему комментариев с модерацией
- 📰 Управление новостями и товарами
- 👑 Админ-панель для управления контентом
- 📁 Загрузку файлов (изображения, аудио, видео)
- 🔐 Аутентификацию и авторизацию
- 🎵 Музыкальный плеер с плейлистом
- 📊 Счетчик просмотров
- 📱 Адаптивный дизайн

## 📋 Требования

- Node.js (версия 14 или выше)
- MongoDB (локально или MongoDB Atlas)
- npm или yarn

## 🚀 Быстрый деплой

### **Один клик деплой:**

1. **Fork** этот репозиторий на GitHub
2. **Netlify**: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/luka-frizz-website)
3. **Vercel**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/luka-frizz-website)
4. **MongoDB Atlas**: Создайте бесплатный кластер
5. Настройте переменные окружения
6. Готово! 🎉

## 🛠 Локальная установка и запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

#### Вариант 1: Локальная MongoDB
1. Установите MongoDB локально
2. Запустите MongoDB сервис
3. База данных будет создана автоматически при первом запуске

#### Вариант 2: MongoDB Atlas (облачная база)
1. Создайте аккаунт на [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Создайте кластер
3. Получите строку подключения
4. Замените `MONGODB_URI` в файле `.env`

### 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# Настройки сервера
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# База данных MongoDB
MONGODB_URI=mongodb://localhost:27017/luka-frizz

# JWT секретный ключ (сгенерируйте свой)
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# Админ данные
ADMIN_EMAIL=admin@lukafrizz.com
ADMIN_PASSWORD=admin123
```

### 4. Запуск сервера

#### Режим разработки (с автоперезагрузкой):
```bash
npm run dev
```

#### Продакшн режим:
```bash
npm start
```

### 5. Доступ к сайту

- **Основной сайт**: http://localhost:3000
- **Админ-панель**: http://localhost:3000/admin.html

## 🔧 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Профиль пользователя
- `GET /api/auth/verify` - Проверка токена

### Комментарии
- `GET /api/comments` - Получить комментарии
- `POST /api/comments` - Создать комментарий
- `PUT /api/comments/:id` - Обновить комментарий
- `DELETE /api/comments/:id` - Удалить комментарий

### Новости
- `GET /api/news` - Получить новости
- `GET /api/news/:id` - Получить новость по ID
- `POST /api/news` - Создать новость (только админ)
- `PUT /api/news/:id` - Обновить новость (только админ)
- `DELETE /api/news/:id` - Удалить новость (только админ)

### Товары
- `GET /api/products` - Получить товары
- `GET /api/products/:id` - Получить товар по ID
- `POST /api/products` - Создать товар (только админ)
- `PUT /api/products/:id` - Обновить товар (только админ)
- `DELETE /api/products/:id` - Удалить товар (только админ)

### Загрузка файлов
- `POST /api/upload/image` - Загрузить изображение
- `POST /api/upload/audio` - Загрузить аудио
- `POST /api/upload/video` - Загрузить видео
- `GET /api/upload/:type` - Получить список файлов
- `DELETE /api/upload/:type/:filename` - Удалить файл

### Админ-панель
- `GET /api/admin/stats` - Статистика
- `GET /api/admin/comments` - Управление комментариями
- `GET /api/admin/news` - Управление новостями
- `GET /api/admin/products` - Управление товарами
- `GET /api/admin/users` - Управление пользователями

## 👤 Админ-панель

### Вход в админ-панель
1. Перейдите на http://localhost:3000/admin.html
2. Используйте данные из `.env` файла:
   - Email: `admin@lukafrizz.com`
   - Пароль: `admin123`

### Возможности админ-панели
- 📊 Дашборд со статистикой
- 💬 Модерация комментариев
- 📰 Управление новостями
- 🛍️ Управление товарами
- 👥 Управление пользователями
- 📁 Управление файлами

## 🎨 Особенности фронтенда

- **Адаптивный дизайн** - работает на всех устройствах
- **Анимации при скролле** - плавные переходы между секциями
- **Видео-фон** - красивое видео на главной странице
- **Музыкальный плеер** - встроенный плеер с плейлистом
- **Счетчик просмотров** - отслеживание посещений
- **Система комментариев** - с модерацией

## 🔒 Безопасность

- JWT токены для аутентификации
- Хеширование паролей с bcrypt
- Rate limiting для защиты от спама
- Валидация всех входных данных
- CORS настройки
- Helmet для безопасности заголовков

## 📁 Структура проекта

```
├── config/           # Конфигурация базы данных
├── models/          # Модели MongoDB
├── routes/          # API маршруты
├── uploads/         # Загруженные файлы
├── public/          # Статические файлы
├── server.js        # Основной файл сервера
├── package.json     # Зависимости
└── README.md        # Документация
```

## 🚀 Деплой

### Heroku
1. Создайте приложение на Heroku
2. Подключите MongoDB Atlas
3. Установите переменные окружения
4. Деплойте код

### Vercel
1. Подключите GitHub репозиторий
2. Настройте переменные окружения
3. Деплойте

### DigitalOcean
1. Создайте дроплет
2. Установите Node.js и MongoDB
3. Клонируйте репозиторий
4. Настройте и запустите

## 🤝 Поддержка

Если у вас возникли вопросы или проблемы:
1. Проверьте логи сервера
2. Убедитесь, что MongoDB запущена
3. Проверьте переменные окружения
4. Создайте issue в репозитории

## 📝 Лицензия

MIT License - используйте свободно для своих проектов!

---

**Создано для Luka Frizz** 🎵✨
"# luka-frizz-website" 
