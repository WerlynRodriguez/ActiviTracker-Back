import app from "./app.js";
import { connectDB } from "./db.js";
import { Cinfo, nMod } from "./libs/console.js";
import 'dotenv/config.js'

async function start() {
    await connectDB();
    app.listen(process.env.PORT, () => {
        Cinfo(`Server running on port ${process.env.PORT}`, nMod.app);
    });
}

start();