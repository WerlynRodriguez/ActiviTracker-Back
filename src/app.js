import Express from "express";
import morgan from "morgan";
import routes from "./routes/index.js";
import cookieParser from "cookie-parser";
import Cors from "cors";

const app = Express();

app.use(morgan("dev"));
app.use(Express.json());
app.use(cookieParser());
app.use(Cors({ 
    credentials: true,
    origin: "http://localhost:5173"
}));
app.use('/api', routes);

export default app;