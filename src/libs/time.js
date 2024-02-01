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