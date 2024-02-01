import Express from "express";
import User from "../models/users.model.js"
import SesionDay from "../models/sesionDay.model.js";
import Sesion from "../models/sesion.model.js";
import { Cerror, nMod } from "../libs/console.js";
import { DateTime, Duration } from "luxon";

/**
 * Get the current active time of the user
 * @param {User} user
 * @returns {Duration}
 */
function getTimeActive(user) {
    const time = Duration.fromObject({ hours: 0, minutes: 0, seconds: 0 });
    const dateNow = DateTime.now().setZone("America/Managua");

    // Calculate the time the user has been active
    if (user.active) {
        time.plus(dateNow.diff(DateTime.fromJSDate(user.lastTime).setZone("America/Managua"), ["hours", "minutes", "seconds"]));
    }

    // If the user has a current sesion day
    if (user.currentSesionDay) {
        // Add the time of the current sesion day
        time.plus(Duration.fromISOTime(user.currentSesionDay.time));
    }

    return time;
}

/**
 * Get info of the user
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const getInfo = async (req, res) => {
    const id = req.query.id || req.userToken.id;

    // Get the user with sesion days pagination, and exclude sesions from the population
    const user = await User.findById(id).populate().select("-currentSesionDay -lastTime -sesionDays");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
        id: user._id,
        username: user.username,
        active: user.active
    });
}

/**
 * Get all info of all users with pagination (used in Dashboard)
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const getInfoAll = async (req, res) => {
    const { id } = req.userToken;
    const page = req.query.page || 1;
    const limit = 10;

    // Exclude my user id
    const users = await User.find({ _id: { $ne: id } })
        .populate("currentSesionDay")
        .select("-sesionDays")
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ username: 1 })
        .then(users => {
            return users.map(user => ({
                id: user._id,
                username: user.username,
                active: user.active,
                time: getTimeActive(user)
            }));
        });

    const me = await User.findById(id).populate("currentSesionDay").select("-sesionDays");
    const activeUsers = await User.find({ active: true }).countDocuments()

    // Get the user with the most time active
    let maxTime = Duration.fromObject({ hours: 0, minutes: 0, seconds: 0 });
    let maxTimeUser = "";

    for (let user of users) {
        if (user.time.valueOf() > maxTime.valueOf()) {
            maxTime = user.time;
            maxTimeUser = user.username;
        }
        // Convert time to client format
        user.time = user.time.toObject();
    }

    const meTime = getTimeActive(me);
    if (meTime > maxTime) maxTimeUser = me.username;

    res.status(200).json({
        me: {
            active: me.active,
            time: meTime.toObject()
        },
        pagination: {
            next: users.length === limit ? true : false,
            page: page
        },
        users,
        activeUsers,
        maxTimeUser
    });
}

/**
 * Update my "active" or "exeded" status
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const setActive = async (req, res) => {
    const { id } = req.userToken;

    let user = await User.findById(id).select("-username")
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.active) {
        // If user wants to activate, sets lastTime to now (lastime type is Date)
        await User.findByIdAndUpdate(id, {
            active: true,
            lastTime: DateTime.now().setZone("America/Managua").toJSDate()
        });

        return res.status(200).json({ active: true });
    }

    const totalTime = await deactivateUser(user);
    console.log("totalTime", totalTime);
    await user.save();

    res.status(200).json({ 
        active: false,
        time: Duration.fromISOTime(totalTime).toObject()
     });
}

/**
 * Logic about deactivate the user
 * @param {User} user 
 * @returns 
 */
export async function deactivateUser(user, dateNow = DateTime.now().setZone("America/Managua")) {
    const lastTime = DateTime.fromJSDate(user.lastTime).setZone("America/Managua");
    console.log("lastTime", lastTime);

    // Calculate the time the user has been active
    // user.lastTime is the last time he was active, Example: ("2024-01-27T06:23:06.638Z")
    let timeActive = dateNow.diff(lastTime, ["hours", "minutes", "seconds"]);
    let sesionDay = null
    const timeActivoISO = timeActive.toISOTime({ suppressMilliseconds: true });
    console.log("timeActivoISO", timeActivoISO);
    
    // Check if he has a sesion day
    if (!user.currentSesionDay) {
        // If he doesn't have a sesion day, create one
        sesionDay = await new SesionDay({
            date: dateNow.toJSDate(),
            time: timeActivoISO,
            user: user._id
        }).save();

        // push the sesion day to the user
        user.sesionDays.push(sesionDay._id);

        await user.save();
    } else {
        // If he has a sesion day, get it and update the time (add the time he has been active)
        sesionDay = await SesionDay.findById(user.currentSesionDay);

        // Add the time the user has been active to the sesion day (exlude milliseconds)
        sesionDay.time = Duration.fromISOTime(sesionDay.time).plus(timeActive).toISOTime({ suppressMilliseconds: true });
        await sesionDay.save();
    }

    // Create a new sesion if the user has been active for more than 30 minutes
    const minSesionTime = 30;
    const timeActiveMinutes = timeActive.as("minutes").toFixed(0);
    console.log("timeActiveMinutes", timeActiveMinutes);

    if (timeActiveMinutes >= minSesionTime) {
        const sesion = await new Sesion({
            start: lastTime.toJSDate(),
            end: dateNow.toISOTime({ suppressMilliseconds: true }),
            time: timeActivoISO,
            sesionDay: sesionDay._id
        }).save();

        sesionDay.sesions.push(sesion._id);

        await sesionDay.save();
    }

    user.active = false;
    user.currentSesionDay = sesionDay._id;
    user.lastTime = null;

    return sesionDay.time;
}

/**
 * Delete my account
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const deleteAccount = async (req, res) => {
    const { id } = req.userToken;

    // Delete the user and all his sesion days and sesions
    const user = await User.findById(id).select("");
    if (!user) return res.status(404).json({ message: "User not found" });

    try {
        // Delete the user
        await user.deleteOne();

        res.clearCookie("token");
        res.sendStatus(200);

    } catch (error) {
        Cerror(error, nMod.app);
        res.sendStatus(500);
    }
}