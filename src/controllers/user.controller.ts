import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { NewUserRequestBody } from "../types/type.js";

interface AuthenticatedRequest extends Request {
    user?: any;
}

const generateAccessAndRefreshTokens = async (userId: string) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};

const setTokenCookies = (res: any, accessToken: string, refreshToken: string) => {
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
    };
    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", refreshToken, options);
};

// <=============== Register User Controller ==================>
const registerUser = asyncHandler(async function (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
) {
    console.log(req.body);
    const { _id, name, email, photo, gender, dob, password } = req.body;

    
    // Validate input
    if ([_id, name, email, photo, gender, dob, password].some(field => !field?.toString().trim())) {
        return next(new ApiError(400, "Please fill in all fields"));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ApiError(409, "User already registered"));
    }

    // Create user
    const user = await User.create({ _id, name, email, photo, gender, dob, password });

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Retrieve newly created user without sensitive fields
    const newUserData = await User.findOne({ email }).select("-password -refreshToken");

    // Respond
    return res.status(201).json(
        new ApiResponse(201, newUserData, "User registered successfully")
    );
});

//  <====================  login controller       ================>

const login = asyncHandler(async function (req, res, next) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new ApiError(404, "User not found"));
    const isValidPassword = await user.validatePassword(password)
    if (!isValidPassword) return next(new ApiError(401, "Invalid password"));
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    setTokenCookies(res, accessToken, refreshToken);
    return res.status(200).json(new ApiResponse(200, user, "User logged in successfully"))

});


//  ><============logout controller ===============>

interface OptionsType {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}

const logout = asyncHandler(async function (
    req: AuthenticatedRequest,
    res: Response,
    next
) {
    const userId = req.user?._id;

    if (!userId) {
        return next(new ApiError(401, "Unauthorized"));
    }

    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });


    const options: OptionsType = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});


const getAllUser = asyncHandler(async function (req, res, next) {
    const users = await User.find().select("-password");
    if (!users) return next(new ApiError(404, "No users found"));
    res.status(200).json(new ApiResponse(200, users, "Users retrieved successfully"));

})

const changePassoword = asyncHandler(async function (req: AuthenticatedRequest, res, next) {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return next(new ApiError(404, "User not found"));
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) return next(new ApiError(401, "Invalid old password"));
    user.password = newPassword;
    await user.save();
    res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
})



export { registerUser, login, logout, getAllUser };


