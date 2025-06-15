import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser());

// import router 
import userRouter from "./routes/user.route.js";
import productRouter from "./routes/product.route.js";

//  use router
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products',productRouter)

export default app;
