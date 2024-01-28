import { model, Schema } from "mongoose";

const sesionSch = new Schema({
    // From what hour user started the session (format example: hh:mm)
    start: {
        type: String,
        required: true
    },
    // To what hour user ended the session (format example: hh:mm)
    end: {
        type: String,
        required: true
    },
    // Total time in seconds (format example: ss)
    time: {
        type: Number,
        required: true
    },
    sesionDay: {
        type: Schema.Types.ObjectId,
        ref: 'SesionDay',
        required: true
    }
});

export default model('Sesion', sesionSch);