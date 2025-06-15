import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema({
    comment: {
        type: String,
        required: [true, "Comment is required"],
        trim: true,
        minlength: [10, "Comment must be at least 10 characters long"],
        maxlength: [500, "Comment cannot exceed 500 characters"]
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating must not be more than 5"],
        validate: {
            validator: Number.isInteger,
            message: "Rating must be an integer value"
        }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User reference is required"]
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product reference is required"]
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

// Index for faster querying on common fields
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Virtual populate (if you want to get user details without storing them)
reviewSchema.virtual('userDetails', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true
});

export const Review = mongoose.model('Review', reviewSchema);