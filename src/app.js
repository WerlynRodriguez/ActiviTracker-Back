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
    // two origins are allowed to access the server (Dev testing)
    origin: [
        "https://activitracker.onrender.com", 
        "https://activitracker-cronjob.vercel.app/"
    ]
}));
app.use('/api', routes);

export default app;