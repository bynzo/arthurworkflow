import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import pc from "picocolors";

export async function doctor() {
  const cwd = process.cwd();
  console.log(pc.bold("\n  ArthurWorkflow Doctor\n"));
  chk("OpenCode CLI", () => {
    const v = execSync("opencode --version", { encoding: "utf-8", stdio: ["pipe","pipe","pipe"] }).trim();
    return v;
  });
  chk(".opencode/ config", () => { if (!existsSync(join(cwd,".opencode"))) throw new Error("missing"); return "found"; });
  chk("AGENTS.md", () => { if (!existsSync(join(cwd,"AGENTS.md"))) throw new Error("missing"); return "found"; });
  chk("opencode.jsonc", () => { if (!existsSync(join(cwd,"opencode.jsonc"))) throw new Error("missing"); return "found"; });
  chk(".arthur/ workspace", () => {
    ["memory","sessions"].forEach(d => { if (!existsSync(join(cwd,".arthur",d))) throw new Error(`missing .arthur/${d}`); });
    return "intact";
  });
  const agents = ["queen","architect","scripter","sentinel","documenter","refactor"];
  chk(`Agents (${agents.length})`, () => {
    const m = agents.filter(a => !existsSync(join(cwd,".opencode/agents",`${a}.md`)));
    if (m.length) throw new Error(`missing: ${m.join(", ")}`);
    return agents.join(", ");
  });
  chk("Hooks", () => {
    ["post-edit.sh","pre-merge.sh"].forEach(h => { if (!existsSync(join(cwd,".opencode/hooks",h))) throw new Error(`missing ${h}`); });
    return "post-edit.sh, pre-merge.sh";
  });
  console.log(`\n  ${pc.dim("Tip: edit opencode.jsonc to configure your model IDs per tier.")}\n`);
}
function chk(label, fn) {
  try { console.log(`  ${pc.green("✓")} ${label}: ${pc.dim(fn())}`); }
  catch(e) { console.log(`  ${pc.red("✗")} ${label}: ${pc.red(e.message)}`); }
}
