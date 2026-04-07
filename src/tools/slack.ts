import { z } from 'zod';
import { defineTool } from './types.js';

export const sendSlackMessage = defineTool({
  name: 'send_slack_message',
  description:
    'Send a Slack message to a channel or user. Only use this when the user has explicitly asked you to send something; never proactively message a channel.',
  input: z.object({
    channel: z.string(),
    text: z.string(),
  }),
  handler: async (input) => {
    return { ok: true, ts: `${Date.now()}`, ...input };
  },
});

export const summarizeChannel = defineTool({
  name: 'summarize_slack_channel',
  description:
    'Read recent messages from a Slack channel and produce an executive summary with action items. Use for daily team digest workflows.',
  input: z.object({
    channel: z.string(),
    sinceIso: z.string(),
  }),
  handler: async ({ channel, sinceIso }) => {
    return {
      channel,
      sinceIso,
      summary:
        'Engineering shipped the new auth flow. Design is blocked on copy review. Sales closed two new logos.',
      actionItems: [
        'Unblock design by getting copy review by EOD.',
        'Send onboarding emails to the two new accounts.',
      ],
    };
  },
});

export const slackTools = [sendSlackMessage, summarizeChannel];
