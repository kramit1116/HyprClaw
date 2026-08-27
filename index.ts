#!/usr/bin/env node

import { Command } from "commander";
import { runwakeup } from "./tui/wakeup";
import { runConfigure } from "./config/runtime";

const program = new Command();

program.name("hyprclaw").description("A terminal and Telegram coding assistant.").version("0.1.0");

program.action(async () => {
    await runwakeup();
});

program.command("wakeup").description("Show the banner and pick CLI or Telegram mode.").action(async()=>{
    await runwakeup();
});

program.command("configure").description("Save API and Telegram settings without creating a .env file.").action(async () => {
    await runConfigure();
});

await program.parseAsync(process.argv);
