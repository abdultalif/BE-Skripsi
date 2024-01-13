import express from "express";
import dotenv from "dotenv/config";
import { publicRouter } from "./src/routes/api-public.js";
import { router } from "./src/routes/api.js";
import { errorMiddleware } from "./src/middleware/error-middleware.js";
import "./src/middleware/logging-middleware.js"
import cors from "cors";


const port = process.env.PORT
const app = express();

app.use(cors({
    origin: true,
    credentials: true,
    preflightContinue: false,
    methods: "GET, POST, PUT, PATCH, DELETE, HEAD",
}));

app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(publicRouter);
app.use(router);
app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`App berjalan di http://localhost:${port}`);
})