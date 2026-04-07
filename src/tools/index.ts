import { calendarTools } from './calendar.js';
import { docTools } from './docs.js';
import { emailTools } from './email.js';
import { slackTools } from './slack.js';
import type { ToolDescriptor } from './types.js';

export const allTools: ToolDescriptor[] = [
  ...calendarTools,
  ...emailTools,
  ...docTools,
  ...slackTools,
];

export function getToolByName(name: string): ToolDescriptor | undefined {
  return allTools.find((t) => t.name === name);
}
