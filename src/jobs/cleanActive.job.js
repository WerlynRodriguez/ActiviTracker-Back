import cron from 'node-cron';
import User from '../models/users.model.js';
import { deactivateUser } from '../controllers/user.controller.js';
import { Cerror, Cinfo, Csuccess, nMod } from '../libs/console.js';

// Every day at 0:0
const time = "0 0 * * *";

// Timezone: America/Managua
export default function () {
    cron.schedule(time, async () => {
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

    }, {
        scheduled: true,
        timezone: "America/Managua"
    });
}