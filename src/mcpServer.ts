import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { allTools, getToolByName } from './tools/index.js';

/**
 * MCP server that exposes the same tool catalog used by the Claude agent
 * loop. Run this with any MCP-compatible client (Claude Desktop, etc.) to
 * give the model access to the executive assistant tools.
 *
 *   npm run mcp
 */
const server = new Server(
  { name: 'executive-assistant', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: zodToJsonSchema(tool.input, { target: 'openApi3' }) as Record<string, unknown>,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = getToolByName(request.params.name);
  if (!tool) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Unknown tool: ${request.params.name}` }],
    };
  }

  try {
    const parsed = tool.input.parse(request.params.arguments ?? {});
    const result = await tool.handler(parsed);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      isError: true,
      content: [
        { type: 'text', text: err instanceof Error ? err.message : String(err) },
      ],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
