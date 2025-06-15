import connectDB from './db/db.js';
import dotenv from 'dotenv'
import app from "./app.js";
dotenv.config({
    path: './.env'
})


const port = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`⚙️ Server is running at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });


