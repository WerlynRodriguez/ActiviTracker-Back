import app from "./app.js";
import jobs from "./jobs/index.js";
import { connectDB } from "./db.js";
import { PORT } from "./config.js";
import os from "os";
import { Cinfo, nMod } from "./libs/console.js";

connectDB();
jobs();
// Get the ip
const networkInterfaces = os.networkInterfaces();
let serverIp = '';

for (const nameInterface in networkInterfaces) {
    const networkInterface = networkInterfaces[nameInterface];

    for (const network of networkInterface) {
        if (network.family === 'IPv4' && !network.internal) {
            serverIp = network.address;
            break;
        }
    }
}

app.listen(PORT, () => {
    Cinfo(`Iniciado en http://${serverIp}:${PORT}`, nMod.app);
});