# 🚀 Деплой сайта на Netlify + Vercel + MongoDB Atlas

## 📋 Пошаговая инструкция

### 1. **Настройка MongoDB Atlas**

1. Перейдите на [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Создайте бесплатный аккаунт
3. Создайте новый кластер
4. Получите строку подключения:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/luka-frizz
   ```

### 2. **Деплой бэкэнда на Vercel**

1. Установите Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Войдите в Vercel:
   ```bash
   vercel login
   ```

3. В корне проекта запустите:
   ```bash
   vercel
   ```

4. Настройте переменные окружения в Vercel Dashboard:
   - `MONGODB_URI` = ваша строка подключения MongoDB
   - `JWT_SECRET` = ваш секретный ключ
   - `FRONTEND_URL` = URL вашего Netlify сайта

5. Получите URL вашего API (например: `https://your-app.vercel.app`)

### 3. **Деплой фронтенда на Netlify**

1. Перейдите на [Netlify](https://netlify.com)
2. Подключите ваш GitHub репозиторий
3. Настройки сборки:
   - **Build command**: `npm run build` (или оставьте пустым)
   - **Publish directory**: `public`
4. В файле `index.html` замените:
   ```javascript
   const API_BASE_URL = 'https://your-vercel-app.vercel.app';
   ```
   на ваш реальный Vercel URL

### 4. **Альтернативный вариант: Railway**

Если Vercel не подходит, используйте Railway:

1. Перейдите на [Railway](https://railway.app)
2. Подключите GitHub репозиторий
3. Выберите папку с бэкэндом
4. Настройте переменные окружения
5. Получите URL API

### 5. **Настройка CORS**

В файле `api/index.js` обновите:
```javascript
app.use(cors({
    origin: 'https://your-netlify-site.netlify.app',
    credentials: true
}));
```

## 🔧 **Структура проекта для деплоя**

```
your-project/
├── api/                 # Vercel API функции
│   └── index.js
├── public/             # Статические файлы для Netlify
│   ├── index.html
│   └── admin.html
├── routes/             # API маршруты
├── models/             # Модели базы данных
├── config/             # Конфигурация
├── vercel.json         # Конфигурация Vercel
├── netlify.toml        # Конфигурация Netlify
└── package.json
```

## 🌐 **Итоговая архитектура**

- **Фронтенд**: Netlify (статические файлы)
- **Бэкэнд**: Vercel/Railway (API)
- **База данных**: MongoDB Atlas (облачная)
- **Файлы**: Vercel/Railway (загруженные файлы)

## 💰 **Стоимость**

- **Netlify**: Бесплатно (100GB трафика)
- **Vercel**: Бесплатно (100GB трафика)
- **MongoDB Atlas**: Бесплатно (512MB)
- **Railway**: $5/месяц (если используете)

## 🚀 **Автоматический деплой**

После настройки:
1. Push в GitHub → автоматический деплой на Netlify
2. Изменения в API → автоматический деплой на Vercel
3. База данных обновляется автоматически

## 🔒 **Безопасность**

- Все API запросы идут через HTTPS
- JWT токены для авторизации
- CORS настроен для вашего домена
- Rate limiting для защиты от спама

---

**Готово! Ваш сайт будет работать на Netlify с полноценным бэкэндом! 🎵✨**
