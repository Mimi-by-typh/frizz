const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireAdmin } = require('./auth');
const router = express.Router();

// Создаем папки для загрузки, если их нет
const uploadDirs = ['uploads/images', 'uploads/audio', 'uploads/video', 'uploads/documents'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Настройка multer для изображений
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Настройка multer для аудио
const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/audio/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Настройка multer для видео
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/video/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Фильтры файлов
const imageFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый тип изображения. Разрешены: JPEG, PNG, GIF, WebP'), false);
    }
};

const audioFilter = (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый тип аудио. Разрешены: MP3, WAV, MP4, M4A, OGG'), false);
    }
};

const videoFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый тип видео. Разрешены: MP4, WebM, OGG, AVI'), false);
    }
};

// Создаем экземпляры multer
const uploadImage = multer({
    storage: imageStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

const uploadAudio = multer({
    storage: audioStorage,
    fileFilter: audioFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

const uploadVideo = multer({
    storage: videoStorage,
    fileFilter: videoFilter,
    limits: {
        fileSize: 200 * 1024 * 1024 // 200MB
    }
});

// Загрузка изображения
router.post('/image', authenticateToken, requireAdmin, uploadImage.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Файл не был загружен'
            });
        }

        res.json({
            success: true,
            message: 'Изображение загружено',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: `/uploads/images/${req.file.filename}`,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка загрузки изображения'
        });
    }
});

// Загрузка аудио
router.post('/audio', authenticateToken, requireAdmin, uploadAudio.single('audio'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Файл не был загружен'
            });
        }

        res.json({
            success: true,
            message: 'Аудио загружено',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: `/uploads/audio/${req.file.filename}`,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки аудио:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка загрузки аудио'
        });
    }
});

// Загрузка видео
router.post('/video', authenticateToken, requireAdmin, uploadVideo.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Файл не был загружен'
            });
        }

        res.json({
            success: true,
            message: 'Видео загружено',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: `/uploads/video/${req.file.filename}`,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки видео:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка загрузки видео'
        });
    }
});

// Множественная загрузка изображений
router.post('/images', authenticateToken, requireAdmin, uploadImage.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Файлы не были загружены'
            });
        }

        const files = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: `/uploads/images/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype
        }));

        res.json({
            success: true,
            message: `${req.files.length} изображений загружено`,
            data: files
        });
    } catch (error) {
        console.error('Ошибка загрузки изображений:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка загрузки изображений'
        });
    }
});

// Удаление файла
router.delete('/:type/:filename', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { type, filename } = req.params;
        const allowedTypes = ['images', 'audio', 'video', 'documents'];
        
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Неподдерживаемый тип файла'
            });
        }

        const filePath = path.join('uploads', type, filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({
                success: true,
                message: 'Файл удален'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Файл не найден'
            });
        }
    } catch (error) {
        console.error('Ошибка удаления файла:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка удаления файла'
        });
    }
});

// Получить список файлов
router.get('/:type', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { type } = req.params;
        const allowedTypes = ['images', 'audio', 'video', 'documents'];
        
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Неподдерживаемый тип файла'
            });
        }

        const dirPath = path.join('uploads', type);
        
        if (!fs.existsSync(dirPath)) {
            return res.json({
                success: true,
                data: []
            });
        }

        const files = fs.readdirSync(dirPath).map(filename => {
            const filePath = path.join(dirPath, filename);
            const stats = fs.statSync(filePath);
            
            return {
                filename,
                path: `/uploads/${type}/${filename}`,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
        });

        res.json({
            success: true,
            data: files
        });
    } catch (error) {
        console.error('Ошибка получения списка файлов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения списка файлов'
        });
    }
});

// Обработка ошибок multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Файл слишком большой'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Слишком много файлов'
            });
        }
    }
    
    if (error.message.includes('Неподдерживаемый тип')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Ошибка загрузки файла'
    });
});

module.exports = router;
