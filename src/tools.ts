export {};

// Placeholder tool so the harness has something to call end-to-end.
// Replace this with the real scenario's tools during the interview —
// the loop in agent.ts doesn't need to change.
const toolDefinitions: any[] = [
  {
    name: "get_current_time",
    description: "Get the current server time.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

function runTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "get_current_time": {
      return new Date().toISOString();
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

module.exports = { toolDefinitions, runTool };
