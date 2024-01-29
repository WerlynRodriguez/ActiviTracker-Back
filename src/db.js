import mongoose from "mongoose";
import { Csuccess, Cerror, nMod } from "./libs/console.js";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.7lcidco.mongodb.net/?retryWrites=true&w=majority`)
        Csuccess(`Connected at ${conn.connection.host}`, nMod.db);
    } catch (error) {
        Cerror(error.message, nMod.db);
        Cerror(`User: ${process.env.MONGO_USER} | Pass: ${process.env.MONGO_PASS}`, nMod.db);
        process.exit(1);
    }
}