import SesionDay from "../models/sesionDay.model.js";

/**
 * Get a sesion Day
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export async function getSesionDay(req, res) {
    const { idSD, idU } = req.body;
    const idUser = idU || req.userToken.id;

    if (!idSD) return res.status(400).json({ message: "No sesion day id provided" });

    // Search the sesion day in the user's sesion days
    const sesionDay = await SesionDay.findOne({ _id: idSD, user: idUser })
    .populate("sesions", {
        // Exclude the sesion day from the population
        sesionDay: 0,
        __v: 0
    }).select("-__v");

    if (!sesionDay) return res.status(404).json({ message: "Sesion day not found" });

    res.status(200).json(sesionDay);
}