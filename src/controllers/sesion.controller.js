import { secondsToTimeClient } from "../libs/time.js";
import SesionDay from "../models/sesionDay.model.js";

/**
 * Get all sesions days og the user in a Month and Year
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export async function getSesionsDays(req, res) {
    const id = req.query.id || req.userToken.id;
    const month = req.query.month;
    const year = req.query.year;

    if (!month || !year) return res.status(400).json({ message: "No month or year provided" });

    const sesionsDays = await SesionDay.find({ 
        user: id,
        date: { $gte: `${month}/1/${year}`, $lte: `${month}/31/${year}` }
    })
        .sort("date")
        .select("id date time sesions")
        // Populate sesions, sort by "start" and deselect "sesionDay and __v"
        .populate({
            path: "sesions",
            options: { sort: { start: 1 } },
            select: "-sesionDay -__v"
        });

    res.status(200).json(sesionsDays.map(sesionDay => ({
        id: sesionDay._id,
        date: sesionDay.date,
        time: secondsToTimeClient(sesionDay.time),
        sesions: sesionDay.sesions.map(sesion => ({
            id: sesion._id,
            start: sesion.start,
            end: sesion.end,
            time: secondsToTimeClient(sesion.time)
        }))
    })));
}