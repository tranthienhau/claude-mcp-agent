import Anthropic from '@anthropic-ai/sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { allTools, getToolByName } from '../tools/index.js';
import { EXECUTIVE_ASSISTANT_SYSTEM_PROMPT } from './systemPrompt.js';

/**
 * Executive assistant agent loop built on Anthropic's tool-use API.
 *
 * The flow follows the protocol from the Anthropic docs:
 *   1. Send messages + tool catalog to messages.create
 *   2. If stop_reason is "tool_use", run each requested tool
 *   3. Append tool_result blocks and call messages.create again
 *   4. Loop until stop_reason is "end_turn"
 *
 * The tool catalog is generated automatically from the zod schemas in
 * src/tools, so a new integration only requires adding a file under tools/.
 */
export class ExecutiveAssistantAgent {
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  private buildToolCatalog(): Anthropic.Messages.Tool[] {
    return allTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: zodToJsonSchema(tool.input, { target: 'openApi3' }) as Anthropic.Messages.Tool.InputSchema,
    }));
  }

  async chat(userMessage: string): Promise<string> {
    const messages: Anthropic.Messages.MessageParam[] = [
      { role: 'user', content: userMessage },
    ];

    const tools = this.buildToolCatalog();
    let finalText = '';

    // Cap iterations to keep runaway loops cheap.
    for (let iteration = 0; iteration < 8; iteration++) {
      const response = await this.client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 2048,
        system: EXECUTIVE_ASSISTANT_SYSTEM_PROMPT,
        tools,
        messages,
      });

      // Always append the assistant's full response to keep tool_use ids aligned.
      messages.push({ role: 'assistant', content: response.content });

      if (response.stop_reason === 'end_turn') {
        for (const block of response.content) {
          if (block.type === 'text') finalText += block.text;
        }
        return finalText;
      }

      if (response.stop_reason !== 'tool_use') {
        throw new Error(`Unexpected stop_reason: ${response.stop_reason}`);
      }

      // Execute every tool the model requested in this turn.
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;
        const tool = getToolByName(block.name);
        if (!tool) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            is_error: true,
            content: `Unknown tool: ${block.name}`,
          });
          continue;
        }

        try {
          const parsed = tool.input.parse(block.input);
          const output = await tool.handler(parsed);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(output),
          });
        } catch (err) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            is_error: true,
            content: err instanceof Error ? err.message : String(err),
          });
        }
      }

      messages.push({ role: 'user', content: toolResults });
    }

    throw new Error('Agent exceeded maximum tool-use iterations');
  }
}
