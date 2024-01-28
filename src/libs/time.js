/**
 * Converts a date to the timezone
 */
export function getDateTZ() {
    return new Date().toLocaleString("en-US", { timeZone: "America/Managua" });
}

/**
 * Calculates the difference between two dates in seconds.
 * @param {Sting | number} date1
 * @param {Sting | number} date2 
 */
export function dateDiffInSeconds(date1, date2) {
    const utc1 = getDateUTC(date1);
    const utc2 = getDateUTC(date2);
    
    return Math.floor((utc2 - utc1) / 1000);
}

/**
 * Converts a date to UTC.
 * @param {Sting | number} dat
 */
function getDateUTC(dat) {
    const date = new Date(dat);
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
}

/**
 * Returns the current date in ISO format.
 * @param {Sting | number} date
 * @example "2024-01-27"
 */
export function getDateISO(date) {
    return new Date(date).toLocaleDateString("en-US", { timeZone: "America/Managua" });
}

/**
 * Returns the current time in ISO format.
 * @param {Sting | number} date
 * @example "06:23:06"
 */
export function getTimeISO(date) {
    return new Date(date).toLocaleTimeString("en-US", { timeZone: "America/Managua" });
}

/**
 * Returns an objecto with hours, minutes and seconds given a number of seconds.
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