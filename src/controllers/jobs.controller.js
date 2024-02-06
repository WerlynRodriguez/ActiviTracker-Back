import { Cerror, Cinfo, Csuccess, nMod } from "../libs/console.js";
import User from "../models/users.model.js";
import { deactivateUser } from "../controllers/user.controller.js";

/*
 * YES!, I know, Cron can do this as a scheduled task, but im using a free hosting and i dont have access to the cron jobs.
 * But there is a branch with the cron jobs, you can check it out.
 */
export const desactivateUsers_job = async (req, res) => {
    const { pass } = req.body;

    if (pass !== process.env.JOB_PASS) {
        Cerror(new Error('Unauthorized'), nMod.job);
        return res.status(401).json({ message: "Unauthorized" });
    }

    Cinfo('Cleaning active users', nMod.job);

    try {
        // Get all users with a sesion day id or lastTime ((currentSesionDay != null) || (lastTime != null))
        const users = await User
        .find({ $or: [{ currentSesionDay: { $ne: null } }, { lastTime: { $ne: null } }] })
        .exec();

        // Iterate users
        for (const user of users) {
            if (user.active) {
                await deactivateUser(user);
            }

            // set currentSesionDay to null and lastTime to null
            user.currentSesionDay = null;
            user.lastTime = null;

            await user.save();
        }

        Csuccess('Cleaned active users', nMod.job);
        return res.status(200).json({ message: "Cleaned active users" });

    } catch (error) {
        Cerror(error, nMod.job);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}