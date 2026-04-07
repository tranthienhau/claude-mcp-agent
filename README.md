# Claude MCP Agent - Executive Assistant POC

A production-style TypeScript proof-of-concept showing how to build a Claude-powered multi-tool agent on top of the Anthropic API and the Model Context Protocol (MCP). The agent acts as a chief-of-staff style executive assistant: it can read calendars, draft emails, summarize documents, and coordinate tasks across Slack, Notion, and Google Workspace through MCP tool calls.

## Why this POC exists

The "Claude AI Agent Developer" job needs:
- Anthropic Claude API (not OpenAI wrappers)
- Deep MCP server setup and tool-calling architecture
- Multi-integration agents with clean tool routing
- System prompt engineering: persona, task routing, few-shot, chain-of-thought
- Production-ready, documented, handoff-ready code

This repo demonstrates exactly that pattern with three concrete pieces:

1. An MCP server that exposes a set of executive-assistant tools
2. A Claude agent loop that uses Anthropic's tool-use API to call those tools
3. A clean separation between tool definitions, tool execution, and the agent loop so adding a new integration is one file, not a refactor

## Architecture

```
src/
├── tools/
│   ├── types.ts           # Tool descriptor type used by both MCP + Claude
│   ├── calendar.ts        # list_events, create_event, find_conflicts
│   ├── email.ts           # draft_email, summarize_thread
│   ├── docs.ts            # summarize_document, extract_key_clauses
│   └── slack.ts           # send_message, summarize_channel
├── agents/
│   ├── systemPrompt.ts    # Persona + task routing rules + few-shot examples
│   └── executiveAssistant.ts # Claude agent loop with tool-use
├── mcpServer.ts           # Stdio MCP server exposing the tools
└── runAgent.ts            # CLI entrypoint for the Claude agent loop
```

## How tool-use works

The agent loop follows the Anthropic tool-use protocol:

1. Send the user's message plus the tool catalog to `messages.create`
2. If the model returns `stop_reason: "tool_use"`, execute the requested tools
3. Append the tool results as a `tool_result` content block
4. Loop until the model returns `stop_reason: "end_turn"`

Both the MCP server and the agent loop pull tool definitions from the same `tools/*.ts` files. That single source of truth is the key reason this design scales: you can add a tenth integration without touching the agent loop or the MCP server.

## System prompt engineering

`systemPrompt.ts` shows the patterns the job calls out:

- Persona definition (role, voice, scope, hard refusals)
- Task routing rules ("if user asks about a meeting, prefer `find_conflicts` before `create_event`")
- Few-shot examples for high-leverage flows
- Chain-of-thought instructions wrapped in `<thinking>` tags

## Run

```bash
npm install

# Run as a Claude agent (CLI chat loop)
ANTHROPIC_API_KEY=sk-... npm run agent

# Or expose as an MCP server (e.g. for Claude Desktop)
npm run mcp
```

## Stack

- TypeScript 5
- @anthropic-ai/sdk (Claude API)
- @modelcontextprotocol/sdk (MCP server)
- zod for tool input validation
