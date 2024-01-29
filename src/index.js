import app from "./app.js";
import jobs from "./jobs/index.js";
import { connectDB } from "./db.js";
import { Cinfo, nMod } from "./libs/console.js";
import 'dotenv/config.js'

app.listen(process.env.PORT, async () => {
    Cinfo(`Server running on port ${process.env.PORT}`, nMod.app);
    Cinfo(`Jwt`, process.env.JWT_KEY);
    
    await connectDB();
    await jobs();
});