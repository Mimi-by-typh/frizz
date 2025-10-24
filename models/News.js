const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Заголовок обязателен'],
        trim: true,
        maxlength: [200, 'Заголовок не может быть длиннее 200 символов']
    },
    content: {
        type: String,
        required: [true, 'Содержание обязательно'],
        trim: true
    },
    excerpt: {
        type: String,
        maxlength: [300, 'Краткое описание не может быть длиннее 300 символов']
    },
    image: {
        type: String,
        default: null
    },
    author: {
        type: String,
        default: 'Luka Frizz'
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublished: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    publishedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Автоматически устанавливаем publishedAt при публикации
newsSchema.pre('save', function(next) {
    if (this.isPublished && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

// Индексы
newsSchema.index({ createdAt: -1 });
newsSchema.index({ isPublished: 1, isFeatured: 1 });
newsSchema.index({ tags: 1 });

module.exports = mongoose.model('News', newsSchema);
