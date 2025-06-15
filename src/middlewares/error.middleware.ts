import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js"; 

const ErrorMiddleware = (
    err: ApiError | Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = (err instanceof ApiError && err.statusCode) || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

export { ErrorMiddleware };
