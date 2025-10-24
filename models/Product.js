const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Название товара обязательно'],
        trim: true,
        maxlength: [100, 'Название не может быть длиннее 100 символов']
    },
    description: {
        type: String,
        required: [true, 'Описание обязательно'],
        trim: true,
        maxlength: [1000, 'Описание не может быть длиннее 1000 символов']
    },
    price: {
        type: Number,
        required: [true, 'Цена обязательна'],
        min: [0, 'Цена не может быть отрицательной']
    },
    currency: {
        type: String,
        default: 'stars',
        enum: ['stars', 'rub', 'usd']
    },
    images: [{
        type: String
    }],
    category: {
        type: String,
        required: [true, 'Категория обязательна'],
        enum: ['nft', 'physical', 'digital', 'service']
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Количество не может быть отрицательным']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    specifications: {
        type: Map,
        of: String
    },
    views: {
        type: Number,
        default: 0
    },
    sales: {
        type: Number,
        default: 0
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Индексы
productSchema.index({ createdAt: -1 });
productSchema.index({ isAvailable: 1, isFeatured: 1 });
productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });

module.exports = mongoose.model('Product', productSchema);
