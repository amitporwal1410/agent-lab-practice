import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, runTool } from "./tools.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a support triage agent. Use the available tools to look up
customers, search the knowledge base, and escalate tickets when needed. Be concise.`;

async function runAgent(userTask: string) {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userTask }];

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
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");
      console.log("\n=== Agent response ===\n" + finalText);
      return;
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        console.log(`\n[tool call] ${block.name}(${JSON.stringify(block.input)})`);
        const result = runTool(block.name, block.input as Record<string, unknown>);
        console.log(`[tool result] ${result}`);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }
    }
    messages.push({ role: "user", content: toolResults });
  }
}

const task = process.argv.slice(2).join(" ") || "Customer cust_101 says their API calls are getting rate limited. Help them.";
console.log(`Task: ${task}`);
runAgent(task);
