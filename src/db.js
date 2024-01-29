import mongoose from "mongoose";
import { Csuccess, Cerror, nMod, Cinfo } from "./libs/console.js";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.7lcidco.mongodb.net/?retryWrites=true&w=majority`)
        Csuccess(`Connected at ${conn.connection.host}`, nMod.db);
    } catch (error) {
        Cerror(error, nMod.db);
        process.exit(1);
    }
}