import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Product from "../models/product.model.js";
import { Request, Response, NextFunction } from "express";
import { NewProductType, SearchRequestQuery, BaseQuery } from "../types/type.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { isValidObjectId } from "mongoose";

// Create a new product
const createProduct = asyncHandler(
    async (
        req: Request<{}, {}, NewProductType>,
        res: Response,
        next: NextFunction
    ) => {
        const { name, price, description, category, stock } = req.body;

        
        if (
            [name, price, description, category, stock].some(
                (field) => !field?.toString().trim()
            )
        ) {
            return next(new ApiError(400, "All fields are required"));
        }

        // Check if image was uploaded
        const imagePath = req.file?.path;
        if (!imagePath) {
            return next(new ApiError(400, "Product image is required"));
        }

        // Upload to Cloudinary
        const cloudinaryResponse = await uploadOnCloudinary(imagePath);
        if (!cloudinaryResponse?.secure_url) {
            return next(new ApiError(500, "Failed to upload image"));
        }

        // Create product in DB
        const product = await Product.create({
            name,
            price,
            description,
            category,
            stock,
            image: cloudinaryResponse.secure_url,
        });

        return res
            .status(201)
            .json(new ApiResponse(201, product, "Product created successfully"));
    }
);

// Delete a product
const deleteProduct = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        console.log(id);
        
        // Validate id exists and is a string
        if (!id || typeof id !== "string") {
            return next(new ApiError(400, "Product ID is required as a query parameter"));
        }

        // Check if id is a valid MongoDB ObjectId
        if (!isValidObjectId(id)) {
            return next(new ApiError(400, "Invalid Product ID format"));
        }

        const deletedProduct = await Product.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return next(new ApiError(404, "Product not found"));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, deletedProduct, "Product deleted successfully"));
    }
);


// Update a product
const updateProduct = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { name, price, description, category, stock } = req.body;
        const imagePath = req.file?.path;

        // Validate required fields
        if ([name, price, description, category, stock].some(field => !field?.toString().trim())) {
            return next(new ApiError(400, "All fields are required"));
        }

        // Find product first (to handle image updates)
        const product = await Product.findById(id);
        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        // Update image only if a new one is uploaded
        if (imagePath) {
            const cloudinaryResponse = await uploadOnCloudinary(imagePath);
            if (!cloudinaryResponse?.secure_url) {
                return next(new ApiError(500, "Failed to upload image"));
            }
            product.image = cloudinaryResponse.secure_url;
        }

        // Update other fields
        product.name = name;
        product.price = price;
        product.description = description;
        product.category = category;
        product.stock = stock;

        // Save changes
        const updatedProduct = await product.save();

        return res
            .status(200)
            .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
    }
);

// Get all  product to admin
const getAdminProduct = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const products = await Product.find().populate("category");

        return res
            .status(200)
            .json(new ApiResponse(200, products, "Products retrieved successfully"));
    }

);



const getSingleProduct = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const product = await Product.findById(id).populate("category");
    if (!product) {
        return next(new ApiError(404, "Product not found"));
    }
    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product retrieved successfully"));

})

const searchProdeuct = asyncHandler(
    async (req: Request<{}, {}, {}, SearchRequestQuery>, res: Response, next: NextFunction) => {

        const { search, sort, category, price } = req.query;

        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = (page - 1) * limit;


        const baseQuery: BaseQuery = {};

        // Search by name (case-insensitive)
        if (search) {
            baseQuery.name = { $regex: search, $options: 'i' };
        }

        // Filter by category
        if (category) {
            baseQuery.category = category;
        }

        // Filter by price (exact match)
        if (price) {
            baseQuery.price = Number(price);
        }

        // Sorting
        let sortQuery = {};
        if (sort) {
            switch (sort) {
                case 'price_asc':
                    sortQuery = { price: 1 };
                    break;
                case 'price_desc':
                    sortQuery = { price: -1 };
                    break;
                case 'newest':
                    sortQuery = { createdAt: -1 };
                    break;
                case 'oldest':
                    sortQuery = { createdAt: 1 };
                    break;
                default:
                    sortQuery = { createdAt: -1 };
            }
        }

        try {

            const products = await Product.find(baseQuery)
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .populate("category");

            // Count total products (for pagination info)
            const totalProducts = await Product.countDocuments(baseQuery);
            const totalPages = Math.ceil(totalProducts / limit);

            return res.status(200).json(
                new ApiResponse(200, {
                    products,
                    pagination: {
                        totalProducts,
                        totalPages,
                        currentPage: page,
                        productsPerPage: limit,
                    },
                }, "Products retrieved successfully")
            );

        } catch (error) {
            console.error("Error fetching products:", error);
            return next(new ApiError(500, "Internal server error"));
        }
    }
);

export { createProduct, deleteProduct, updateProduct,getSingleProduct, searchProdeuct, getAdminProduct, };