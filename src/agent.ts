require("dotenv/config");
const Anthropic = require("@anthropic-ai/sdk");
const { toolDefinitions, runTool } = require("./tools");

export {};

type MessageParam = { role: "user" | "assistant"; content: any };
type ToolCallTrace = { name: string; input: Record<string, unknown>; result: string };
type AgentRun = { trace: ToolCallTrace[]; finalText: string };

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful agent. Use the available tools to complete the user's task. Be concise.`;

async function runAgent(userTask: string, log = true): Promise<AgentRun> {
  const messages: MessageParam[] = [{ role: "user", content: userTask }];
  const trace: ToolCallTrace[] = [];

  while (true) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: toolDefinitions,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      const finalText = response.content
        .filter((block: any) => block.type === "text")
        .map((block: any) => block.text)
        .join("\n");
      if (log) console.log("\n=== Agent response ===\n" + finalText);
      return { trace, finalText };
    }

    const toolResults: any[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        if (log) console.log(`\n[tool call] ${block.name}(${JSON.stringify(block.input)})`);
        const result = runTool(block.name, block.input as Record<string, unknown>);
        if (log) console.log(`[tool result] ${result}`);
        trace.push({ name: block.name, input: block.input as Record<string, unknown>, result });
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }
    }
    messages.push({ role: "user", content: toolResults });
  }
}

module.exports = { runAgent };

if (require.main === module) {
  const task = process.argv.slice(2).join(" ") || "What time is it right now?";
  console.log(`Task: ${task}`);
  runAgent(task);
}
