import Express from "express";
import morgan from "morgan";
import routes from "./routes/index.js";
import cookieParser from "cookie-parser";
import Cors from "./middlewares/Cors.js";

const app = Express();

app.use(morgan("dev"));
app.use(Express.json());
app.use(cookieParser());
app.use(Cors);
app.use('/api', routes);

export default app;