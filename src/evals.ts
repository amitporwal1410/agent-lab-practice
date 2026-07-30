require("dotenv/config");
const { runAgent } = require("./agent");

export {};

type EvalCase = {
  name: string;
  task: string;
  expectedTool?: string;
  checkFinal?: (text: string) => boolean;
};

const cases: EvalCase[] = [
  {
    name: "time question calls get_current_time",
    task: "What time is it right now?",
    expectedTool: "get_current_time",
    checkFinal: (text) => /\d{4}/.test(text),
  },
  {
    name: "non-time question does not call get_current_time",
    task: "Say hello in French.",
    checkFinal: (text) => text.toLowerCase().includes("bonjour"),
  },
];

async function main() {
  let passed = 0;

  for (const c of cases) {
    const { trace, finalText } = await runAgent(c.task, false);
    const toolNames = trace.map((t: { name: string }) => t.name);
    const problems: string[] = [];

    if (c.expectedTool && !toolNames.includes(c.expectedTool)) {
      problems.push(`expected tool "${c.expectedTool}", got [${toolNames.join(", ") || "none"}]`);
    }
    if (!c.expectedTool && toolNames.length > 0) {
      problems.push(`expected no tool calls, got [${toolNames.join(", ")}]`);
    }
    if (c.checkFinal && !c.checkFinal(finalText)) {
      problems.push(`final answer failed check: "${finalText}"`);
    }

    const ok = problems.length === 0;
    console.log(`${ok ? "PASS" : "FAIL"} - ${c.name}`);
    problems.forEach((p) => console.log(`  - ${p}`));
    if (ok) passed++;
  }

  console.log(`\n${passed}/${cases.length} passed`);
  if (passed !== cases.length) process.exitCode = 1;
}

main();
