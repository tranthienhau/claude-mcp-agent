import { z } from 'zod';
import { defineTool } from './types.js';

export const summarizeDocument = defineTool({
  name: 'summarize_document',
  description:
    'Summarize a long document (Google Doc, Notion page, or PDF) into an executive briefing. Output structure: 1) one-line TLDR, 2) five key points, 3) open questions.',
  input: z.object({
    documentUrl: z.string().url(),
  }),
  handler: async ({ documentUrl }) => {
    return {
      documentUrl,
      tldr: 'Q1 OKRs delivered 87 percent of target with revenue overperforming and hiring underperforming.',
      keyPoints: [
        'Revenue: 112 percent of target driven by enterprise deals.',
        'Hiring: 64 percent of target, blocked by senior IC pipeline.',
        'Product: shipped 4 of 5 launches; mobile slipped to Q2.',
        'Customer health: NPS 52, churn 1.8 percent.',
        'Cash runway: 22 months at current burn.',
      ],
      openQuestions: [
        'Should we backfill the senior IC pipeline with contract-to-hire?',
        'Is the mobile slip a hiring problem or a scope problem?',
      ],
    };
  },
});

export const extractKeyClauses = defineTool({
  name: 'extract_key_clauses',
  description:
    'Extract liability, termination, payment, and IP clauses from a contract document and flag any unusual language for legal review.',
  input: z.object({
    contractUrl: z.string().url(),
  }),
  handler: async ({ contractUrl }) => {
    return {
      contractUrl,
      clauses: {
        liability: 'Capped at 12 months of fees, mutual.',
        termination: 'Either party with 30 days notice.',
        payment: 'Net 45 from invoice date.',
        ip: 'Work product assigned to client on full payment.',
      },
      flags: [
        'Net 45 is longer than the standard Net 30 in our template.',
      ],
    };
  },
});

export const docTools = [summarizeDocument, extractKeyClauses];
