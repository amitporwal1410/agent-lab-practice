# Agent Lab Practice

A minimal "agent builder harness" for the Microsoft Platform Lab / vibe coding round.
No framework (LangChain/Semantic Kernel/Azure AI Foundry) — this is the tool-use loop
that those frameworks wrap, written by hand in ~50 lines so you can explain every part
of it live.

## How it works

1. `src/tools.ts` defines what the agent can *do*: each tool has a JSON schema
   (name, description, inputs) the model reads, and a `runTool` function that actually
   executes it (fake in-memory data, no real APIs, is fine for practice). Right now it
   holds one placeholder tool (`get_current_time`) — just enough to prove the harness
   works end-to-end without baking in any scenario.
2. `src/agent.ts` runs the loop:
   - send the conversation + tool list to Claude
   - if Claude responds with `tool_use`, run the matching tool locally, append the
     result as a `tool_result`, and call the model again
   - if Claude responds with plain text (`stop_reason !== "tool_use"`), that's the
     final answer — print it and stop
   That loop *is* an agent: model decides, code executes, result feeds back in.
   This file doesn't need to change per scenario — only `tools.ts` does.

## Setup

```bash
cp .env.example .env   # then paste your ANTHROPIC_API_KEY into .env
npm install
npm run build
npm run agent           # sanity check: should call get_current_time and answer
```

## Practicing for the interview

- **Build a new scenario live.** Replace the contents of `tools.ts` (schema +
  `runTool` dispatch) for whatever domain they hand you — the loop itself
  never changes, only the tool list does. That's the point to say out loud: "the
  agent's capabilities are just this tool list."
- **Add a new tool live.** Practice adding one function, registering it in
  `toolDefinitions`, and wiring it in `runTool`, in under 3 minutes while narrating
  out loud.
- **Break it on purpose once.** Give the model a bad/missing tool result and watch
  how it reacts — gives you something real to say about error handling if asked.
- **Know the vocabulary:** system prompt, tool schema, tool_use / tool_result,
  stop_reason, the agentic loop, orchestration state (the `messages` array).
