// import express from 'express';
import connectDB from "./db/index.js";
import dotenv from 'dotenv';
import { app } from "./app.js";
dotenv.config({
    path: './env'
});


// const app = express();  // Create the Express app instance

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed", err);
    });
