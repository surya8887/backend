import mongoose from "mongoose";
import { DB_Name } from "../constant.js";

const connectDB = async (): Promise<void> => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`);

        console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(`Connection failed: ${(error as Error).message}`);
        process.exit(1);
    }
};

export default connectDB;
