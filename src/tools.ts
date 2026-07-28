export {};

// Fake in-memory data so the agent has something real to act on without external APIs.
const CUSTOMERS: Record<string, { name: string; plan: string; openTickets: number }> = {
  "cust_101": { name: "Northwind Traders", plan: "Enterprise", openTickets: 2 },
  "cust_102": { name: "Contoso Ltd", plan: "Free", openTickets: 0 },
};

const KB_ARTICLES = [
  { id: "kb_1", title: "Resetting a user password", body: "Go to Settings > Security > Reset Password." },
  { id: "kb_2", title: "Billing cycle FAQ", body: "Enterprise plans bill monthly on the signup date." },
  { id: "kb_3", title: "API rate limits", body: "Free plan: 100 req/day. Enterprise: 100k req/day." },
];

const toolDefinitions: any[] = [
  {
    name: "lookup_customer",
    description: "Look up a customer's plan and open ticket count by customer ID.",
    input_schema: {
      type: "object",
      properties: {
        customerId: { type: "string", description: "e.g. cust_101" },
      },
      required: ["customerId"],
    },
  },
  {
    name: "search_kb",
    description: "Search the support knowledge base by keyword.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
  {
    name: "escalate_ticket",
    description: "Escalate a ticket to a human agent with a reason.",
    input_schema: {
      type: "object",
      properties: {
        customerId: { type: "string" },
        reason: { type: "string" },
      },
      required: ["customerId", "reason"],
    },
  },
];

export function runTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "lookup_customer": {
      const customer = CUSTOMERS[input.customerId as string];
      return customer ? JSON.stringify(customer) : `No customer found with id ${input.customerId}`;
    }
    case "search_kb": {
      const query = String(input.query).toLowerCase();
      const hits = KB_ARTICLES.filter(
        (a) => a.title.toLowerCase().includes(query) || a.body.toLowerCase().includes(query)
      );
      return hits.length ? JSON.stringify(hits) : "No matching articles.";
    }
    case "escalate_ticket": {
      return `Escalated ${input.customerId} to a human agent. Reason: ${input.reason}`;
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

module.exports = { toolDefinitions, runTool };
