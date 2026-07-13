#!/usr/bin/env bun

import { Command } from "commander";
import { runwakeup } from "./tui/wakeup";

const program = new Command();

program.name("HyprClaw").description("A CLI tool like OpenClaw made by kramit1116").version("0.0.1");

program.command("wakeup").description("Show the banner and pick CLI or Telegram mode.").action(async()=>{
    await runwakeup();
});

await program.parseAsync(process.argv);