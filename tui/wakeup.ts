import {select, isCancel} from "@clack/prompts";
import chalk from "chalk";
import { runCliMode } from "../modes/cli";
import { runTelegramMode } from "../modes/telegram";
import { ensureOpenRouterConfig, ensureTelegramConfig } from "../config/runtime";

const HYPRCLAW_BANNER = `
 ██╗  ██╗██╗   ██╗██████╗ ██████╗  ██████╗██╗      █████╗ ██╗    ██╗
 ██║  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗██╔════╝██║     ██╔══██╗██║    ██║
 ███████║ ╚████╔╝ ██████╔╝██████╔╝██║     ██║     ███████║██║ █╗ ██║
 ██╔══██║  ╚██╔╝  ██╔═══╝ ██╔══██╗██║     ██║     ██╔══██║██║███╗██║
 ██║  ██║   ██║   ██║     ██║  ██║╚██████╗███████╗██║  ██║╚███╔███╔╝
 ╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝ ╚══════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝
`;

const SHADOW = chalk.hex('#5b4d9e');
const FACE = chalk.hex('#e8dcf8').bold;

function printBannerwithShadow(ascii: string) {
    const bannerLines = ascii.replace(/\s+$/, '').split('\n');
    const maxLen = Math.max(...bannerLines.map((l) => l.length), 0);
    const rowWidth = maxLen + 2;

    for (const line of bannerLines) {
        console.log(SHADOW(('  '+line).padEnd(rowWidth)));
    }
    process.stdout.write(`\x1b[${bannerLines.length}A`);
    for (const line of bannerLines) {
        console.log(FACE(line.padEnd(rowWidth)));
    } 
    console.log();   
}
export async function runwakeup() {
    printBannerwithShadow(HYPRCLAW_BANNER);

    const mode = await select({
        message: "Which mode do you want to proceed with?",
        options:[
            {value:"cli", label:"CLI"},
            {value:"telegram", label:"Telegram"},
            {value:"exit", label:"Exit"}
        ]
    });

    if(isCancel(mode || mode === "exit")) {
        console.log(chalk.dim('\n Goodbye! \n'));
        return;
    }

    if(mode === "cli") {
        if (!(await ensureOpenRouterConfig())) return;
        await runCliMode()
    }
    else if(mode === "telegram") {
        if (!(await ensureOpenRouterConfig())) return;
        if (!(await ensureTelegramConfig())) return;
        await runTelegramMode()
    }
}
