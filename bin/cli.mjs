#!/usr/bin/env node
import { Command } from "commander";
import { initProject } from "./init.mjs";
import { doctor } from "./doctor.mjs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));

const program = new Command();
program.name("arthurworkflow").description(pkg.description).version(pkg.version);
program.command("init").description("Initialize ArthurWorkflow in current project")
  .argument("[template]", "pwa | api | default", "default")
  .option("--force", "Overwrite existing files", false)
  .action(initProject);
program.command("doctor").description("Check OpenCode, models, and config health").action(doctor);
program.parse();
