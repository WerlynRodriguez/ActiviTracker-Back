import Express from "express";
import User from "../models/users.model.js"
import SesionDay from "../models/sesionDay.model.js";
import Sesion from "../models/sesion.model.js";
import { dateDiffInSeconds, getDateISO, getDateTZ, getTimeISO, secondsToTimeClient } from "../libs/time.js";
import { Cerror, nMod } from "../libs/console.js";

function getTimeActive(user, convert = true) {
    let time = 0;
    const dateNow = getDateTZ();

    // Calculate the time the user has been active
    if (user.active) {
        time = dateDiffInSeconds(user.lastTime, dateNow);
    }

    // If the user has a current sesion day
    if (user.currentSesionDay) {
        // Add the time of the current sesion day
        time += user.currentSesionDay.time;
    }

    if (convert) return secondsToTimeClient(time);

    return time;
}

/**
 * Get info of the user, with pagination in each sesion day
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const getInfo = async (req, res) => {
    let id = req.query.id || req.userToken.id;
    let user = null;

    const page = req.query.page || 1;
    const limit = 10;

    // Get the user with sesion days pagination, and exclude sesions from the population
    user = await User.findById(id).populate({
        path: "sesionDays",
        options: {
            skip: (page - 1) * limit,
            limit,
            sort: { date: -1 }
        },
    }).select("-currentSesionDay -lastTime");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
        id: user._id,
        username: user.username,
        sesionDays: user.sesionDays.map(sesionDay => ({
            id: sesionDay._id,
            date: sesionDay.date,
            time: secondsToTimeClient(sesionDay.time)
        }))
    });
}

// The frontend needs:
/*
export type DashboardData = {
    greeting: Greeting;
    me: Omit<UserDashboard, 'id'>;
    pagination: Pagination;
    users: UserDashboard[];
    activeUsers: number;
    maxTimeUser: string;
}
*/

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
                time: getTimeActive(user, false)
            }));
        });

    const me = await User.findById(id).populate("currentSesionDay").select("-sesionDays");
    const activeUsers = await User.find({ active: true }).countDocuments()

    // Get the user with the most time active
    let maxTime = 0;
    let maxTimeUser = "";

    for (let user of users) {
        if (user.time > maxTime) {
            maxTime = user.time;
            maxTimeUser = user.username;
        }
        // Convert time to client format
        user.time = secondsToTimeClient(user.time);
    }

    const meTime = getTimeActive(me, false);
    if (meTime > maxTime) maxTimeUser = me.username;

    res.status(200).json({
        me: {
            active: me.active,
            time: secondsToTimeClient(meTime)
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

    // Timezone of Managua, Nicaragua
    const dateNow = getDateTZ();

    if (!user.active) {
        // If user wants to activate, sets lastTime to now
        await User.findByIdAndUpdate(id, {
            active: true,
            lastTime: dateNow
        });

        return res.status(200).json({ active: true });
    }

    const totalTime = await deactivateUser(id, user);

    await user.save();

    res.status(200).json({ 
        active: false,
        time: secondsToTimeClient(totalTime)
     });
}

export async function deactivateUser(id, user) {
    const dateNow = getDateTZ();

    // Calculate the time the user has been active
    // user.lastTime is the last time he was active, Example: ("2024-01-27T06:23:06.638Z")
    let time = dateDiffInSeconds(user.lastTime, dateNow);
    let sesionDay = null
    
    // Check if he has a sesion day
    if (!user.currentSesionDay) {
        // If he doesn't have a sesion day, create one
        sesionDay = await new SesionDay({
            date: getDateISO(dateNow),
            time,
            user: id
        }).save();

        // push the sesion day to the user
        user.sesionDays.push(sesionDay._id);

        await user.save();
    } else {
        // If he has a sesion day, get it and update the time (add the time he has been active)
        sesionDay = await SesionDay.findById(user.currentSesionDay);

        sesionDay.time += time;
        await sesionDay.save();
    }

    // Create a new sesion if the user has been active for more than 30 minutes
    const ThMinutes = 1800;
    if (time >= ThMinutes) {
        const sesion = await new Sesion({
            start: getTimeISO(user.lastTime),
            end: getTimeISO(dateNow),
            time,
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