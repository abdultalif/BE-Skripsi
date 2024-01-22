import express from "express";
import dotenv from "dotenv/config";
import { publicRouter } from "./src/routes/api-public.js";
import { router } from "./src/routes/api.js";
import { errorMiddleware } from "./src/middleware/error-middleware.js";
import "./src/middleware/logging-middleware.js";
import cors from "cors";
import { fileURLToPath } from 'url';
import path from "path";


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


app.use(publicRouter);
app.use(router);
app.use(errorMiddleware);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads/menu', express.static(path.join(__dirname, 'uploads', 'menu')));

app.listen(port, () => {
    console.log(`App berjalan di http://localhost:${port}`);
});