import chalk from "chalk";

export const Cinfo = (message, emmiter) => console.log(`${chalk.blue(`[ℹ ${emmiter}]`)} ${message}`);
export const Cerror = (message, emmiter) => console.error(`${chalk.red(`[✖ ${emmiter}]`)} ${message?.message}`);
export const Cadvice = (message, emmiter) => console.log(`${chalk.yellow(`[⚠ ${emmiter}]`)} ${message}`);
export const Csuccess = (message, emmiter) => console.log(`${chalk.green(`[✔ ${emmiter}]`)} ${message}`);

// names Modules
export const nMod = {
    db: 'MongoDB',
    job: 'CRON',
    app: 'ActiviTracker',
    cont: 'Controller',
    midd: 'Middleware',
    mod: 'Model',
}