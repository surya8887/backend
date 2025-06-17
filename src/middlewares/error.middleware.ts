import { ErrorRequestHandler,Request,Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";

const ErrorMiddleware: ErrorRequestHandler = (err:ApiError, req:Request, res:Response, next:NextFunction): void => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";
  const errors = err instanceof ApiError ? err.errors : [];
  const data = err instanceof ApiError ? err.data : null;
  const response: any = {
    success: false,
    message,
    errors,
    data,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export { ErrorMiddleware };
