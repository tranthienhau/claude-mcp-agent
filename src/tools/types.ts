import { z } from 'zod';

/**
 * A single tool definition that is consumed by BOTH the MCP server and the
 * Claude agent loop. Centralizing the descriptor here is the reason this
 * project scales: adding a new integration is one file, not a refactor.
 */
export interface ToolDescriptor<Input extends z.ZodType = z.ZodType> {
  /** Snake-case tool name visible to the model. */
  name: string;
  /** One-paragraph description optimized for Claude tool routing. */
  description: string;
  /** zod schema describing the tool's input. */
  input: Input;
  /** Pure function that executes the tool. */
  handler: (input: z.infer<Input>) => Promise<unknown>;
}

export function defineTool<Input extends z.ZodType>(
  tool: ToolDescriptor<Input>,
): ToolDescriptor<Input> {
  return tool;
}
