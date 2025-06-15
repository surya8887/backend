import {
    createProduct, deleteProduct, getAdminProduct,
    getSingleProduct, searchProdeuct, updateProduct
} from "../controllers/product.controller.js";
import { verifyJWT, adminOnly } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Admin Product Routes
router.route('/')
    .post(
        verifyJWT,
        adminOnly,
        upload.single('image'), 
        createProduct
    )
    .get(
        verifyJWT,
        adminOnly,
        getAdminProduct 
    );

router.route('/:id')
    .post(getSingleProduct) 
    .patch(
        verifyJWT,
        adminOnly,
        updateProduct
    )
    .delete(
        verifyJWT,
        adminOnly,
        deleteProduct
    );

// Public Search Route
router.route('/search').get(searchProdeuct);

export default router;