const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Имя обязательно'],
        trim: true,
        maxlength: [50, 'Имя не может быть длиннее 50 символов']
    },
    text: {
        type: String,
        required: [true, 'Текст комментария обязателен'],
        trim: true,
        maxlength: [500, 'Комментарий не может быть длиннее 500 символов']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Некорректный email']
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Индексы для быстрого поиска
commentSchema.index({ createdAt: -1 });
commentSchema.index({ isApproved: 1 });

module.exports = mongoose.model('Comment', commentSchema);
