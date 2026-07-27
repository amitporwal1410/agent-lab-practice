# Agent Lab Practice

A minimal "agent builder harness" for the Microsoft Platform Lab / vibe coding round.
No framework (LangChain/Semantic Kernel/Azure AI Foundry) — this is the tool-use loop
that those frameworks wrap, written by hand in ~50 lines so you can explain every part
of it live.

## How it works

1. `src/tools.ts` — defines what the agent can *do*: each tool has a JSON schema
   (name, description, inputs) the model reads, and a `runTool` function that actually
   executes it (here: fake in-memory data, no real APIs).
2. `src/agent.ts` — the loop:
   - send the conversation + tool list to Claude
   - if Claude responds with `tool_use`, run the matching tool locally, append the
     result as a `tool_result`, and call the model again
   - if Claude responds with plain text (`stop_reason !== "tool_use"`), that's the
     final answer — print it and stop
   That loop *is* an agent: model decides, code executes, result feeds back in.

## Run it

```bash
npm run agent -- "Customer cust_102 wants to know about API rate limits"
```

or with no args, it runs a default scenario (`cust_101` hitting a rate limit).

## Setup

```bash
cp .env.example .env   # then paste your ANTHROPIC_API_KEY into .env
npm install
npm run agent
```

## Practicing for the interview

- **Add a new tool live.** e.g. add `list_open_tickets(customerId)` to `tools.ts`,
  register it in `toolDefinitions`, wire it in `runTool` — practice doing this in
  under 3 minutes while narrating out loud.
- **Change the scenario.** Swap the fake data / system prompt for whatever domain
  they hand you in the actual interview (trip planning, expense approval, whatever) —
  the loop in `agent.ts` doesn't change, only `tools.ts` does. That's the point to
  say out loud: "the agent's capabilities are just this tool list."
- **Break it on purpose once.** Give the model a bad/missing tool result and watch
  how it reacts — gives you something real to say about error handling if asked.
- **Know the vocabulary:** system prompt, tool schema, tool_use / tool_result,
  stop_reason, the agentic loop, orchestration state (the `messages` array).
