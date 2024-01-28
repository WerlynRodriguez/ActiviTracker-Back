import { model, Schema } from "mongoose";
import SesionDay from "./sesionDay.model.js";
import { Cerror, nMod } from "../libs/console.js";

const userSch = new Schema({
    username: {
        type: String,
        required: true,
        trim: true // Remove whitespace
    },
    password: {
        type: String,
        required: true,
        select: false // Don't send password
    },
    active : {
        type: Boolean,
        default: false
    },
    // The id of the current sesion day
    currentSesionDay: {
        type: Schema.Types.ObjectId,
        ref: 'SesionDay',
        default: null
    },
    // Last time the user activated the account
    lastTime: {
        type: String,
        default: null
    },
    sesionDays: [{
        type: Schema.Types.ObjectId,
        ref: 'SesionDay'
    }]
})

// Middleware to delete all the sesion days of the user
userSch.pre('deleteOne', async function(next) {
    // this.getQuery() { _id: new ObjectId('65b58267ba62a7d10c935e96') }
    const { _id } = this.getQuery();
    const id = _id.toString();

    try {
        const sesionDays = await this.model.findById(id).select('sesionDays');

        for (const sesionDayId of sesionDays.sesionDays) {
            const sesionDay = await SesionDay.findById(sesionDayId.toString());
            if (!sesionDay) continue;

            await sesionDay.deleteOne();
        }

        next();
    } catch (error) {
        Cerror(error, nMod.mod);
        next(error);
    }
});

export default model('User', userSch);