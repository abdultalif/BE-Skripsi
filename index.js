import express from "express";
import dotenv from "dotenv/config";
import { router } from "./src/routes/api.js";
import { errorMiddleware } from "./src/middleware/error-middleware.js";
import "./src/middleware/logging-middleware.js";
import cors from "cors";
import { fileURLToPath } from 'url';
import path from "path";
import logger from "./src/middleware/logging-middleware.js";


const port = process.env.PORT;
const app = express();

app.use(cors({
    origin: true,
    credentials: true,
    preflightContinue: false,
    methods: "GET, POST, PUT, PATCH, DELETE, HEAD",
    allowedHeaders: "Content-Type, Authorization, Origin, X-Requested-With, Accept",
}));

app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(router);
app.use(errorMiddleware);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    logger.info(`App berjalan di http://localhost:${port}`);
});