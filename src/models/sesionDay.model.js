import { model, Schema } from "mongoose";
import Sesion from "./sesion.model.js";
import { Cerror, nMod } from "../libs/console.js";

const sesionDaySch = new Schema({
    // The date of the sesion day
    date: {
        type: Date,
        required: true
    },
    // All time the user has been active in this day
    time: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sesions: [{
        type: Schema.Types.ObjectId,
        ref: 'Sesion'
    }]
});

// Middleware to delete all the sesions of the sesion day
sesionDaySch.pre('deleteOne', async function(next) {
    // this.getQuery() { _id: new ObjectId('65b58267ba62a7d10c935e96') }
    const { _id } = this.getQuery();
    const id = _id.toString();

    try {
        const sesions = await this.model.findById(id).select('sesions');

        for (const sesionId of sesions.sesions) {
            await Sesion.findByIdAndDelete(sesionId.toString());
        }

        next();
    } catch (error) {
        Cerror(error, nMod.mod);
        next(error);
    }
});

export default model('SesionDay', sesionDaySch);