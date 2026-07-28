require("dotenv/config");
const Anthropic = require("@anthropic-ai/sdk");
const { toolDefinitions, runTool } = require("./expense-tools");

export {};

type MessageParam = { role: "user" | "assistant"; content: any };

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expense report drafting assistant. Given a rough description
of a business trip, break it into line items. For each line item, look up the relevant policy
category and flag anything that exceeds the daily limit or is missing a required receipt.
Finish with a clear draft report: line items, flags, and a short summary of what the employee
should fix before submitting.`;

async function runAgent(userTask: string) {
  const messages: MessageParam[] = [{ role: "user", content: userTask }];

  while (true) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
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
      console.log("\n=== Draft expense report ===\n" + finalText);
      return;
    }

    const toolResults: any[] = [];
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

const task =
  process.argv.slice(2).join(" ") ||
  "I went to Seattle for 3 days for a client meeting. Flight was $420. Hotel was $310/night for 3 nights. I took a client to dinner one night and it was $95, but I forgot to keep the receipt.";
console.log(`Task: ${task}`);
runAgent(task);
