import { z } from 'zod';
import { defineTool } from './types.js';

export const draftEmail = defineTool({
  name: 'draft_email',
  description:
    'Draft an email in the user\'s defined voice. Use the executive voice profile from the system prompt; do not invent recipients or facts that are not present in the input.',
  input: z.object({
    to: z.array(z.string().email()),
    subject: z.string(),
    body: z.string(),
    cc: z.array(z.string().email()).default([]),
  }),
  handler: async (input) => {
    return { draftId: `draft_${Date.now()}`, ...input };
  },
});

export const summarizeThread = defineTool({
  name: 'summarize_thread',
  description:
    'Summarize an email thread into a 3-bullet executive summary plus a single recommended action.',
  input: z.object({
    threadId: z.string(),
  }),
  handler: async ({ threadId }) => {
    return {
      threadId,
      bullets: [
        'Vendor confirmed Q2 delivery slip of two weeks.',
        'Legal flagged liability clause section 4.2.',
        'Counterparty open to renegotiating payment terms.',
      ],
      recommendedAction: 'Schedule a 30-minute renegotiation call this week.',
    };
  },
});

export const emailTools = [draftEmail, summarizeThread];
