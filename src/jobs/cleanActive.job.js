import User from '../models/users.model.js';
import { deactivateUser } from '../controllers/user.controller.js';
import { Cerror, Cinfo, Csuccess, nMod } from '../libs/console.js';
import fs from 'fs';
import { getDateTZ, isSameDay } from '../libs/time.js';

// Every day at 0:0
const time = "0 0 * * *";
const options = {
    scheduled: true,
    timezone: "America/Managua"
};

// Timezone: America/Managua
async function CleanActiveUser () {
    Cinfo('Cleaning active users', nMod.job);

    try {
        // Get all users with a sesion day id or lastTime ((currentSesionDay != null) || (lastTime != null))
        const users = await User
        .find({ $or: [{ currentSesionDay: { $ne: null } }, { lastTime: { $ne: null } }] })
        .exec();

        // Iterate users
        for (const user of users) {
            if (user.active) {
                await deactivateUser(user._id, user);
            }

            // set currentSesionDay to null and lastTime to null
            user.currentSesionDay = null;
            user.lastTime = null;

            await user.save();
        }

        Csuccess('Cleaned active users', nMod.job);

    } catch (error) {
        Cerror(error, nMod.job);
    }
}

/*
 * This function is used to clean active users with Cron.
 * But in my case, im using a free server so i can't use cron.
 * (The server is not always on, for save resources, it turns off when no one is using it.)
 * So, i will use fs for save a var called lastTime and compare it with the current day.
export default function () { 
    cron.schedule(time, CleanActiveUser, options);
}
*/

export default async function () {
    const today = getDateTZ();

    // Check if lastTime exists
    if (fs.existsSync('lastTime.txt')) {
        const lastTime = fs.readFileSync('lastTime.txt', 'utf8');

        // If today is different than lastTime, then clean active users
        if (!isSameDay(lastTime)) {
            await CleanActiveUser();
            fs.writeFileSync('lastTime.txt', today);
        }
    } else {
        fs.writeFileSync('lastTime.txt', today);
    }
}