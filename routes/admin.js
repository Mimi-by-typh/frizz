const express = require('express');
const { authenticateToken, requireAdmin } = require('./auth');
const Comment = require('../models/Comment');
const News = require('../models/News');
const Product = require('../models/Product');
const User = require('../models/User');
const router = express.Router();

// Применяем middleware для всех админских роутов
router.use(authenticateToken);
router.use(requireAdmin);

// Получить общую статистику
router.get('/stats', async (req, res) => {
    try {
        const [
            totalUsers,
            totalComments,
            totalNews,
            totalProducts,
            pendingComments,
            publishedNews,
            availableProducts
        ] = await Promise.all([
            User.countDocuments(),
            Comment.countDocuments(),
            News.countDocuments(),
            Product.countDocuments(),
            Comment.countDocuments({ isApproved: false }),
            News.countDocuments({ isPublished: true }),
            Product.countDocuments({ isAvailable: true })
        ]);

        // Статистика за последние 30 дней
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            newUsers,
            newComments,
            newNews,
            newProducts
        ] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Comment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            News.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Product.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalComments,
                    totalNews,
                    totalProducts,
                    pendingComments,
                    publishedNews,
                    availableProducts
                },
                recent: {
                    newUsers,
                    newComments,
                    newNews,
                    newProducts
                }
            }
        });
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения статистики'
        });
    }
});

// Управление комментариями
router.get('/comments', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status; // 'pending', 'approved', 'all'

        let query = {};
        if (status === 'pending') {
            query.isApproved = false;
        } else if (status === 'approved') {
            query.isApproved = true;
        }

        const comments = await Comment.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments(query);

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

// Одобрить/отклонить комментарий
router.put('/comments/:id/approve', async (req, res) => {
    try {
        const { isApproved } = req.body;
        
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { isApproved },
            { new: true }
        );

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Комментарий не найден'
            });
        }

        res.json({
            success: true,
            message: isApproved ? 'Комментарий одобрен' : 'Комментарий отклонен',
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

// Удалить комментарий
router.delete('/comments/:id', async (req, res) => {
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

// Управление новостями
router.get('/news', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status; // 'published', 'draft', 'all'

        let query = {};
        if (status === 'published') {
            query.isPublished = true;
        } else if (status === 'draft') {
            query.isPublished = false;
        }

        const news = await News.find(query)
            .sort({ createdAt: -1 })
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

// Публиковать/снять с публикации новость
router.put('/news/:id/publish', async (req, res) => {
    try {
        const { isPublished } = req.body;
        
        const news = await News.findByIdAndUpdate(
            req.params.id,
            { 
                isPublished,
                publishedAt: isPublished ? new Date() : null
            },
            { new: true }
        );

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Новость не найдена'
            });
        }

        res.json({
            success: true,
            message: isPublished ? 'Новость опубликована' : 'Новость снята с публикации',
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

// Управление товарами
router.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status; // 'available', 'unavailable', 'all'

        let query = {};
        if (status === 'available') {
            query.isAvailable = true;
        } else if (status === 'unavailable') {
            query.isAvailable = false;
        }

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Ошибка получения товаров:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения товаров'
        });
    }
});

// Управление пользователями
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const role = req.query.role;

        let query = {};
        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения пользователей'
        });
    }
});

// Изменить роль пользователя
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!['user', 'moderator', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректная роль'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        res.json({
            success: true,
            message: 'Роль пользователя изменена',
            data: user
        });
    } catch (error) {
        console.error('Ошибка изменения роли:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка изменения роли'
        });
    }
});

// Заблокировать/разблокировать пользователя
router.put('/users/:id/status', async (req, res) => {
    try {
        const { isActive } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        res.json({
            success: true,
            message: isActive ? 'Пользователь разблокирован' : 'Пользователь заблокирован',
            data: user
        });
    } catch (error) {
        console.error('Ошибка изменения статуса пользователя:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка изменения статуса пользователя'
        });
    }
});

module.exports = router;
