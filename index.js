import express from "express";
import dotenv from "dotenv/config";
import { publicRouter } from "./src/routes/api-public.js";
import { errorMiddleware } from "./src/middleware/error-middleware.js";
import "./src/middleware/logging-middleware.js"


const port = process.env.PORT
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(publicRouter);
app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`App berjalan di http://localhost:${port}`);
})