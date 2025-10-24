const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const router = express.Router();

// Получить все доступные товары
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const featured = req.query.featured === 'true';
        const search = req.query.search;

        let query = { isAvailable: true };
        
        if (category) {
            query.category = category;
        }
        
        if (featured) {
            query.isFeatured = true;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const products = await Product.find(query)
            .sort({ isFeatured: -1, createdAt: -1 })
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

// Получить товар по ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }

        // Увеличиваем счетчик просмотров
        product.views += 1;
        await product.save();

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Ошибка получения товара:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения товара'
        });
    }
});

// Создать новый товар (только для админов)
router.post('/', [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Название должно быть от 1 до 100 символов'),
    body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Описание должно быть от 1 до 1000 символов'),
    body('price').isNumeric().isFloat({ min: 0 }).withMessage('Цена должна быть положительным числом'),
    body('category').isIn(['nft', 'physical', 'digital', 'service']).withMessage('Некорректная категория'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Количество должно быть неотрицательным числом')
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

        const product = new Product(req.body);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Товар создан',
            data: product
        });
    } catch (error) {
        console.error('Ошибка создания товара:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка создания товара'
        });
    }
});

// Обновить товар (только для админов)
router.put('/:id', [
    body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Название должно быть от 1 до 100 символов'),
    body('description').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Описание должно быть от 1 до 1000 символов'),
    body('price').optional().isNumeric().isFloat({ min: 0 }).withMessage('Цена должна быть положительным числом'),
    body('category').optional().isIn(['nft', 'physical', 'digital', 'service']).withMessage('Некорректная категория')
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

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }

        res.json({
            success: true,
            message: 'Товар обновлен',
            data: product
        });
    } catch (error) {
        console.error('Ошибка обновления товара:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка обновления товара'
        });
    }
});

// Удалить товар (только для админов)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }

        res.json({
            success: true,
            message: 'Товар удален'
        });
    } catch (error) {
        console.error('Ошибка удаления товара:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка удаления товара'
        });
    }
});

// Получить категории товаров
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isAvailable: true });
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Ошибка получения категорий:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения категорий'
        });
    }
});

// Получить статистику товаров
router.get('/stats/overview', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({ isAvailable: true });
        const totalViews = await Product.aggregate([
            { $match: { isAvailable: true } },
            { $group: { _id: null, total: { $sum: '$views' } } }
        ]);
        const totalSales = await Product.aggregate([
            { $match: { isAvailable: true } },
            { $group: { _id: null, total: { $sum: '$sales' } } }
        ]);

        res.json({
            success: true,
            data: {
                totalProducts,
                totalViews: totalViews[0]?.total || 0,
                totalSales: totalSales[0]?.total || 0
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

module.exports = router;
