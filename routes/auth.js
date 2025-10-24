const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Токен доступа не предоставлен'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Недействительный токен'
            });
        }
        req.user = user;
        next();
    });
};

// Middleware для проверки роли админа
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Требуются права администратора'
        });
    }
    next();
};

// Регистрация
router.post('/register', [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Имя пользователя должно быть от 3 до 30 символов'),
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: errors.array()
            });
        }

        const { username, email, password } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Пользователь с таким email или именем уже существует'
            });
        }

        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Пользователь зарегистрирован',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка регистрации'
        });
    }
});

// Вход
router.post('/login', [
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').notEmpty().withMessage('Пароль обязателен')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Находим пользователя
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверные учетные данные'
            });
        }

        // Проверяем пароль
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Неверные учетные данные'
            });
        }

        // Обновляем время последнего входа
        user.lastLogin = new Date();
        await user.save();

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка входа'
        });
    }
});

// Получить профиль пользователя
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        res.json({
            success: true,
            data: user.toJSON()
        });
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения профиля'
        });
    }
});

// Обновить профиль
router.put('/profile', authenticateToken, [
    body('username').optional().trim().isLength({ min: 3, max: 30 }).withMessage('Имя пользователя должно быть от 3 до 30 символов'),
    body('email').optional().isEmail().withMessage('Некорректный email')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: errors.array()
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Профиль обновлен',
            data: user.toJSON()
        });
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка обновления профиля'
        });
    }
});

// Изменить пароль
router.put('/change-password', authenticateToken, [
    body('currentPassword').notEmpty().withMessage('Текущий пароль обязателен'),
    body('newPassword').isLength({ min: 6 }).withMessage('Новый пароль должен быть не менее 6 символов')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        // Проверяем текущий пароль
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Неверный текущий пароль'
            });
        }

        // Обновляем пароль
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Пароль изменен'
        });
    } catch (error) {
        console.error('Ошибка изменения пароля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка изменения пароля'
        });
    }
});

// Проверить токен
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Токен действителен',
        data: req.user
    });
});

module.exports = { router, authenticateToken, requireAdmin };
