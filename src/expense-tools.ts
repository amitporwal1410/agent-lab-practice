export {};

const POLICY: Record<string, { dailyLimit: number; receiptRequiredAbove: number; notes: string }> = {
  meals: { dailyLimit: 75, receiptRequiredAbove: 25, notes: "Per-person, per-day. Client meals count toward this unless itemized as entertainment." },
  lodging: { dailyLimit: 250, receiptRequiredAbove: 0, notes: "Per night. Receipt always required." },
  transportation: { dailyLimit: 500, receiptRequiredAbove: 25, notes: "Flights/trains/rideshare combined, per trip leg." },
  entertainment: { dailyLimit: 150, receiptRequiredAbove: 25, notes: "Client entertainment only, requires attendee names." },
};

const toolDefinitions: any[] = [
  {
    name: "lookup_policy",
    description: "Get the expense policy limit and receipt requirement for a category.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string", enum: Object.keys(POLICY) },
      },
      required: ["category"],
    },
  },
  {
    name: "flag_issue",
    description: "Formally flag a line item as likely to be rejected, with a reason.",
    input_schema: {
      type: "object",
      properties: {
        item: { type: "string" },
        amount: { type: "number" },
        reason: { type: "string" },
      },
      required: ["item", "amount", "reason"],
    },
  },
  {
    name: "list_open_tickets",
    description: "List currently open expense-review tickets awaiting action.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

function runTool(name: string, input: Record<string, any>): string {
  switch (name) {
    case "lookup_policy": {
      const p = POLICY[input.category];
      return p ? JSON.stringify(p) : `No policy found for category: ${input.category}`;
    }
    case "flag_issue": {
      return `FLAGGED: "${input.item}" ($${input.amount}) — ${input.reason}`;
    }
    case "list_open_tickets": {
      return JSON.stringify([
        { id: "EXP-1042", title: "Missing receipt for lodging over $250/night", status: "open" },
        { id: "EXP-1057", title: "Client entertainment missing attendee names", status: "open" },
      ]);
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

module.exports = { toolDefinitions, runTool };
