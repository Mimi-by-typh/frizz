const express = require('express');
const { body, validationResult } = require('express-validator');
const News = require('../models/News');
const router = express.Router();

// Получить все опубликованные новости
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const featured = req.query.featured === 'true';

        let query = { isPublished: true };
        if (featured) {
            query.isFeatured = true;
        }

        const news = await News.find(query)
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await News.countDocuments(query);

        res.json({
            success: true,
            data: {
                news,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Ошибка получения новостей:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения новостей'
        });
    }
});

// Получить новость по ID
router.get('/:id', async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        
        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Новость не найдена'
            });
        }

        // Увеличиваем счетчик просмотров
        news.views += 1;
        await news.save();

        res.json({
            success: true,
            data: news
        });
    } catch (error) {
        console.error('Ошибка получения новости:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения новости'
        });
    }
});

// Создать новую новость (только для админов)
router.post('/', [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Заголовок должен быть от 1 до 200 символов'),
    body('content').trim().isLength({ min: 1 }).withMessage('Содержание обязательно'),
    body('excerpt').optional().trim().isLength({ max: 300 }).withMessage('Краткое описание не может быть длиннее 300 символов'),
    body('tags').optional().isArray().withMessage('Теги должны быть массивом')
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

        const { title, content, excerpt, tags, isPublished, isFeatured, image } = req.body;
        
        const news = new News({
            title,
            content,
            excerpt: excerpt || content.substring(0, 300) + '...',
            tags: tags || [],
            isPublished: isPublished || false,
            isFeatured: isFeatured || false,
            image
        });

        await news.save();

        res.status(201).json({
            success: true,
            message: 'Новость создана',
            data: news
        });
    } catch (error) {
        console.error('Ошибка создания новости:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка создания новости'
        });
    }
});

// Обновить новость (только для админов)
router.put('/:id', [
    body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Заголовок должен быть от 1 до 200 символов'),
    body('content').optional().trim().isLength({ min: 1 }).withMessage('Содержание обязательно'),
    body('excerpt').optional().trim().isLength({ max: 300 }).withMessage('Краткое описание не может быть длиннее 300 символов')
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

        const news = await News.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Новость не найдена'
            });
        }

        res.json({
            success: true,
            message: 'Новость обновлена',
            data: news
        });
    } catch (error) {
        console.error('Ошибка обновления новости:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка обновления новости'
        });
    }
});

// Удалить новость (только для админов)
router.delete('/:id', async (req, res) => {
    try {
        const news = await News.findByIdAndDelete(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Новость не найдена'
            });
        }

        res.json({
            success: true,
            message: 'Новость удалена'
        });
    } catch (error) {
        console.error('Ошибка удаления новости:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка удаления новости'
        });
    }
});

// Лайк новости
router.post('/:id/like', async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        
        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Новость не найдена'
            });
        }

        news.likes += 1;
        await news.save();

        res.json({
            success: true,
            message: 'Лайк добавлен',
            data: { likes: news.likes }
        });
    } catch (error) {
        console.error('Ошибка добавления лайка:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка добавления лайка'
        });
    }
});

module.exports = router;
