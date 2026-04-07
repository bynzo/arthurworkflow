import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, appendFileSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { globSync } from "glob";
import ora from "ora";
import pc from "picocolors";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CFG = resolve(__dirname, "..", "config");
const TPL = resolve(__dirname, "..", "templates");

export async function initProject(template, opts) {
  const cwd = process.cwd();
  const s = ora();
  const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
  console.log(pc.bold(`\n  ArthurWorkflow v${pkg.version}\n`));

  // 1. Git check
  if (!existsSync(join(cwd, ".git")) && !opts.force) {
    console.log(pc.red("  Not a git repo. Run git init first or use --force.\n"));
    process.exit(1);
  }

  // 2. .opencode/ config
  s.start("Installing .opencode/ config");
  const dirs = ["agents","commands","skills/context-pruning","skills/git-workflow","skills/self-improve","skills/failover","skills/project-scan","hooks"];
  dirs.forEach(d => mkdirSync(join(cwd, ".opencode", d), { recursive: true }));
  copyAll(join(CFG, "agents"), join(cwd, ".opencode/agents"));
  copyAll(join(CFG, "commands"), join(cwd, ".opencode/commands"));
  ["context-pruning","git-workflow","self-improve","failover","project-scan"].forEach(sk =>
    copyAll(join(CFG, "skills", sk), join(cwd, ".opencode/skills", sk)));
  // Copy tiers.yaml
  safeCopy(join(CFG, "tiers.yaml"), join(cwd, "tiers.yaml"), opts.force);
  copyAll(join(CFG, "hooks"), join(cwd, ".opencode/hooks"));
  // Make hooks executable
  globSync("*.sh", { cwd: join(cwd, ".opencode/hooks") }).forEach(f => {
    try { execSync(`chmod +x "${join(cwd, ".opencode/hooks", f)}"`); } catch {}
  });
  s.succeed(".opencode/ config installed");

  // 3. .arthur/ workspace
  s.start("Creating .arthur/ workspace");
  ["memory","sessions"].forEach(d => mkdirSync(join(cwd, ".arthur", d), { recursive: true }));
  const rootTpl = existsSync(join(TPL, template, "memory-root.md"))
    ? join(TPL, template, "memory-root.md") : join(TPL, "default", "memory-root.md");
  safeCopy(rootTpl, join(cwd, ".arthur/memory/root.md"), opts.force);
  if (!existsSync(join(cwd, ".arthur/memory/lessons.md")))
    writeFileSync(join(cwd, ".arthur/memory/lessons.md"), "# Lessons learned\n\n_Auto-populated by /close._\n");
  s.succeed(".arthur/ workspace created");

  // 4. Root files
  s.start("Installing root config");
  safeCopy(join(CFG, "AGENTS.md"), join(cwd, "AGENTS.md"), opts.force);
  safeCopy(join(CFG, "opencode.jsonc"), join(cwd, "opencode.jsonc"), opts.force);
  s.succeed("Root config installed");

  // 5. .gitignore
  const gi = join(cwd, ".gitignore");
  const existing = existsSync(gi) ? readFileSync(gi, "utf-8") : "";
  if (!existing.includes("# ArthurWorkflow"))
    appendFileSync(gi, "\n# ArthurWorkflow\n.arthur/sessions/\n");

  // 6. Tool detection for hooks
  console.log(pc.bold("\n  Hook dependencies:\n"));
  const tools = [
    { name: "eslint", cmd: "npx eslint --version", alt: "npm i -D eslint" },
    { name: "biome", cmd: "npx biome --version", alt: "npm i -D @biomejs/biome" },
    { name: "tsc", cmd: "npx tsc --version", alt: "npm i -D typescript" },
    { name: "npm test", cmd: "node -e \"const p=JSON.parse(require('fs').readFileSync('package.json','utf-8'));if(!p.scripts||!p.scripts.test)process.exit(1)\"", alt: "add a \"test\" script to package.json" },
  ];
  let hasLinter = false;
  for (const t of tools) {
    try {
      execSync(t.cmd, { cwd, stdio: "ignore", timeout: 10000 });
      if (t.name === "eslint" || t.name === "biome") hasLinter = true;
      console.log(`  ${pc.green("✓")} ${t.name} — available`);
    } catch {
      if (t.name === "eslint" || t.name === "biome") {
        if (!hasLinter) console.log(`  ${pc.yellow("○")} ${t.name} — not found (${pc.dim(t.alt)})`);
      } else {
        console.log(`  ${pc.yellow("○")} ${t.name} — not found (${pc.dim(t.alt)})`);
      }
    }
  }
  if (!hasLinter) {
    console.log(pc.yellow("\n  ⚠ No linter found. post-edit hook won't catch style/lint issues."));
    console.log(pc.dim("    Install eslint or biome for deterministic code quality checks."));
  }

  // Done
  console.log(pc.green(pc.bold("\n  ✓ ArthurWorkflow initialized!\n")));
  console.log(`  Template:  ${pc.cyan(template)}`);
  console.log(`  Agents:    queen, architect, scripter, sentinel, documenter, refactor`);
  console.log(`  Commands:  /plan, /review, /close, /improve (optional shortcuts)`);
  console.log(`  Hooks:     post-edit.sh, pre-merge.sh`);
  console.log(`\n  ${pc.yellow("NEXT STEPS:")}`);
  console.log(`  1. Edit ${pc.bold("opencode.jsonc")} — set your model IDs per tier`);
  console.log(`  2. Edit ${pc.bold("tiers.yaml")} — set your failover model chains`);
  console.log(`  3. Run ${pc.bold("arthurworkflow doctor")} to verify`);
  console.log(`  4. Run ${pc.bold("opencode")} and describe what you want — the workflow is automatic\n`);
}

function copyAll(src, dest) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  globSync("**/*", { cwd: src, nodir: true }).forEach(f => {
    mkdirSync(dirname(join(dest, f)), { recursive: true });
    copyFileSync(join(src, f), join(dest, f));
  });
}
function safeCopy(src, dest, force) {
  if (existsSync(dest) && !force) return;
  copyFileSync(src, dest);
}
