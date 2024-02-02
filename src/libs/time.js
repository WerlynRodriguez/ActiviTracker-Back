import { DateTime, Duration } from "luxon";

/**
 * Returns an object with hours, minutes and seconds given a number of seconds.
 * @param {number} seconds
 * @example 552 -> { hours: 0, minutes: 9, seconds: 12 }
 * @returns {{ h: number, m: number, s: number }}
 */
export function secondsToTimeClient(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 3600 % 60);

    return { h, m, s };
}

/**
 * Verify if two dates are the same day.
 * @param {Sting | number} date1
 * @param {Sting | number} date2 if not provided, it will use the current date.
 */
export function isSameDay(date1, date2 = getDateTZ()) {
    return getDateISO(date1) === getDateISO(date2);
}

/**
 * MongoDb doesnt store timezone, so we need to convert the date to the objetive timezone.
 */
export function getTimeZoneDate(){
    // This way is a little bit dumb, but it works in any browser in any timezone
    // always return the date in the objective timezone

    const dateNow = new Date();
    const options = {
        timeZone: "America/Managua",
        hour12: false,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    };

    const formattedDate = dateNow.toLocaleString("es-ES", options);

    const [date, time] = formattedDate.split(", ");
    const [day, month, year] = date.split("/");
    const [hours, minutes, seconds] = time.split(":");

    const currentTime = new Date(
        Date.UTC(
            year,
            month - 1,
            day,
            hours,
            minutes,
            seconds
        )
    );

    return currentTime;
}