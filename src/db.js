import mongoose from "mongoose";
import { Csuccess, Cerror, nMod } from "./libs/console.js";
import { MONGO_PASS, MONGO_USER } from "./config.js";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASS}@cluster0.7lcidco.mongodb.net/?retryWrites=true&w=majority`)
        Csuccess(`Connected at ${conn.connection.host}`, nMod.db);
    } catch (error) {
        Cerror(error.message, nMod.db);
        Cerror(`User: ${MONGO_USER} | Pass: ${MONGO_PASS}`, nMod.db);
        process.exit(1);
    }
}