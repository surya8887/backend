import mongoose, { Schema, Document } from "mongoose";

interface ProductDocument extends Document {
    name: string;
    price: number;
    description?: string; 
    image: any;
    category: string;
    stock: number;
}

const productSchema = new Schema<ProductDocument>({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false, 
        default: null
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

const Product = mongoose.model<ProductDocument>("Product", productSchema);

export default Product;
