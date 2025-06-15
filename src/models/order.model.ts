import mongoose from "mongoose";
import { Schema } from "mongoose";

const orderSchema = new Schema({
    shippingInfo: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zip: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subTotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        required: true,
        min: 0
    },
    shippingCharge: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'cancelled'], // added 'cancelled' as common status
        default: 'pending',
    },
    orderItems: [{
        name: {
            type: String,
            required: true
        },
        photo: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        }
    }]
}, { 
    timestamps: true 
});

export const Order = mongoose.model('Order', orderSchema);