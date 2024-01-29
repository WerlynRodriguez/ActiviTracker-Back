import { Cinfo, nMod } from "../libs/console.js";
import cleanActiveJob from "./cleanActive.job.js";

export default async function () {
    Cinfo('Starting jobs', nMod.job);
    
    cleanActiveJob();
}