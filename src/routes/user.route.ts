import { registerUser,login,logout,getAllUser } from "../controllers/user.controller.js";
import { Router } from "express";
import { verifyJWT,adminOnly } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(login);
router.route('/logout').get(verifyJWT,logout);
router.route('/alldata').get(verifyJWT,adminOnly,getAllUser);







export default router;




