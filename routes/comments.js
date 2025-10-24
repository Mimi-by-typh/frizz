const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const router = express.Router();

// Получить все одобренные комментарии
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ isApproved: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments({ isApproved: true });

        res.json({
            success: true,
            data: {
                comments,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Ошибка получения комментариев:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения комментариев'
        });
    }
});

// Создать новый комментарий
router.post('/', [
    body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Имя должно быть от 1 до 50 символов'),
    body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Текст должен быть от 1 до 500 символов'),
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

        const { name, text, email } = req.body;
        
        const comment = new Comment({
            name,
            text,
            email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        await comment.save();

        res.status(201).json({
            success: true,
            message: 'Комментарий добавлен и ожидает модерации',
            data: comment
        });
    } catch (error) {
        console.error('Ошибка создания комментария:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка создания комментария'
        });
    }
});

// Получить комментарий по ID
router.get('/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Комментарий не найден'
            });
        }

        res.json({
            success: true,
            data: comment
        });
    } catch (error) {
        console.error('Ошибка получения комментария:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения комментария'
        });
    }
});

// Обновить комментарий (только для админов)
router.put('/:id', async (req, res) => {
    try {
        const { isApproved } = req.body;
        
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { isApproved },
            { new: true, runValidators: true }
        );

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Комментарий не найден'
            });
        }

        res.json({
            success: true,
            message: 'Комментарий обновлен',
            data: comment
        });
    } catch (error) {
        console.error('Ошибка обновления комментария:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка обновления комментария'
        });
    }
});

// Удалить комментарий (только для админов)
router.delete('/:id', async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Комментарий не найден'
            });
        }

        res.json({
            success: true,
            message: 'Комментарий удален'
        });
    } catch (error) {
        console.error('Ошибка удаления комментария:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка удаления комментария'
        });
    }
});

module.exports = router;
