import { DateTime, Duration } from "luxon";
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

    if(month < 1 || month > 12) return res.status(400).json({ message: "Month must be between 1 and 12" });
    const currentYear = DateTime.local().year;
    if(year < 1900 || year > currentYear) return res.status(400).json({ message: `Year must be between 1900 and ${currentYear}` });
    if(year == currentYear && month > DateTime.local().month) return res.status(400).json({ message: "Month is in the future" });

    const startDate = DateTime.fromObject({ year, month, day: 1 }).startOf("month").toJSDate();
    const endDate = DateTime.fromObject({ year, month, day: 1 }).endOf("month").toJSDate();

    const sesionsDays = await SesionDay.find({ 
        user: id,
        date: {
            $gte: startDate,
            $lte: endDate
        }
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
        time: Duration.fromISOTime(sesionDay.time).toObject(),
        sesions: sesionDay.sesions.map(sesion => ({
            id: sesion._id,
            //"start": "13:55:50Z",
            //"end": "18:15:01.342-06:00",
            start: sesion.start.split(":"),
            end: sesion.end.split(":"),
            time: Duration.fromISOTime(sesion.time).toObject()
        }))
    })));
}