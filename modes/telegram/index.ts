import { Telegraf } from "telegraf";
import chalk from "chalk";
import { WELCOME } from "./constants";
import { registerHandlers } from "./handler";
import { requireTelegramConfig } from "../../config/runtime";


export async function runTelegramMode() {
    const { token, ownerId } = requireTelegramConfig();

    const bot = new Telegraf(token);
    registerHandlers(bot);

    await bot.telegram.sendMessage(ownerId, WELCOME, {parse_mode: "Markdown"});
    console.log(chalk.green('Sent welcome message to Telegram.\n'));

    bot.launch();
    console.log(chalk.green('Telegram bot is running. Press Ctrl+C to stop.\n'));

    await new Promise<void>((resolve)=>{
        const stop = () => {
            bot.stop("SIGINT");
            resolve();
        };
        process.once("SIGINT", stop);
        process.once("SIGTERM", stop);
    });
}
