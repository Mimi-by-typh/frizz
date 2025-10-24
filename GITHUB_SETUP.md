# 🚀 Публикация проекта на GitHub

## 📋 Пошаговая инструкция

### 1. **Создание репозитория на GitHub**

1. Перейдите на [GitHub.com](https://github.com)
2. Нажмите кнопку **"New repository"** (зеленая кнопка)
3. Заполните данные:
   - **Repository name**: `luka-frizz-website`
   - **Description**: `Luka Frizz - Full-stack website with backend, admin panel, and database`
   - **Visibility**: Public (или Private)
   - **НЕ** ставьте галочки на "Add a README file", "Add .gitignore", "Choose a license"
4. Нажмите **"Create repository"**

### 2. **Подключение локального репозитория к GitHub**

Выполните команды в терминале (замените `YOUR_USERNAME` на ваш GitHub username):

```bash
# Добавить удаленный репозиторий
git remote add origin https://github.com/YOUR_USERNAME/luka-frizz-website.git

# Переименовать ветку в main (если нужно)
git branch -M main

# Отправить код на GitHub
git push -u origin main
```

### 3. **Альтернативный способ через GitHub CLI**

Если у вас установлен GitHub CLI:

```bash
# Создать репозиторий и отправить код
gh repo create luka-frizz-website --public --source=. --remote=origin --push
```

### 4. **Настройка для деплоя**

После публикации на GitHub:

#### **Для Netlify:**
1. Перейдите на [Netlify](https://netlify.com)
2. Нажмите **"New site from Git"**
3. Выберите **GitHub** и ваш репозиторий
4. Настройки:
   - **Build command**: оставьте пустым
   - **Publish directory**: `public`
5. Нажмите **"Deploy site"**

#### **Для Vercel:**
1. Перейдите на [Vercel](https://vercel.com)
2. Нажмите **"New Project"**
3. Импортируйте ваш GitHub репозиторий
4. Настройте переменные окружения:
   - `MONGODB_URI` = ваша строка подключения MongoDB
   - `JWT_SECRET` = ваш секретный ключ
   - `FRONTEND_URL` = URL вашего Netlify сайта
5. Нажмите **"Deploy"**

### 5. **Настройка MongoDB Atlas**

1. Перейдите на [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Создайте бесплатный аккаунт
3. Создайте новый кластер
4. Получите строку подключения
5. Добавьте IP адрес в whitelist (0.0.0.0/0 для всех)

### 6. **Обновление URL API**

После получения URL от Vercel, обновите в файле `index.html`:

```javascript
// Замените на ваш реальный Vercel URL
const API_BASE_URL = 'https://your-app-name.vercel.app';
```

### 7. **Финальная настройка**

1. **В Netlify** - добавьте redirect в `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-vercel-app.vercel.app/api/:splat"
     status = 200
   ```

2. **В Vercel** - обновите CORS в `api/index.js`:
   ```javascript
   app.use(cors({
       origin: 'https://your-netlify-site.netlify.app',
       credentials: true
   }));
   ```

## 🎯 **Итоговая архитектура**

```
GitHub Repository
├── Frontend (Netlify) ← Статические файлы
├── Backend (Vercel) ← API функции  
└── Database (MongoDB Atlas) ← Облачная база данных
```

## 🔗 **Полезные ссылки**

- [GitHub](https://github.com) - Хостинг кода
- [Netlify](https://netlify.com) - Хостинг фронтенда
- [Vercel](https://vercel.com) - Хостинг бэкэнда
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Облачная база данных

## 💰 **Стоимость**

- **GitHub**: Бесплатно
- **Netlify**: Бесплатно (100GB трафика)
- **Vercel**: Бесплатно (100GB трафика)
- **MongoDB Atlas**: Бесплатно (512MB)

---

**Готово! Ваш сайт будет доступен по адресу Netlify! 🎵✨**
