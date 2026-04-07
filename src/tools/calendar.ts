import { z } from 'zod';
import { defineTool } from './types.js';

// In a production agent these handlers would call the Google Calendar API.
// For the POC we use deterministic stub data so the agent flow is exercisable
// end-to-end without credentials.

const fakeEvents = [
  { id: 'evt_1', title: 'Board sync', start: '2026-04-08T10:00:00Z', end: '2026-04-08T11:00:00Z' },
  { id: 'evt_2', title: 'Investor pitch', start: '2026-04-08T14:00:00Z', end: '2026-04-08T15:00:00Z' },
];

export const listEvents = defineTool({
  name: 'list_events',
  description:
    'List upcoming calendar events for the user within a date range. Use this to ground any scheduling answer in real data before drafting follow-ups.',
  input: z.object({
    fromIso: z.string().describe('Inclusive start of the range as ISO-8601.'),
    toIso: z.string().describe('Exclusive end of the range as ISO-8601.'),
  }),
  handler: async ({ fromIso, toIso }) => {
    return fakeEvents.filter((e) => e.start >= fromIso && e.start < toIso);
  },
});

export const findConflicts = defineTool({
  name: 'find_conflicts',
  description:
    'Check whether a proposed meeting time conflicts with any existing event. Always call this BEFORE create_event when scheduling.',
  input: z.object({
    startIso: z.string(),
    endIso: z.string(),
  }),
  handler: async ({ startIso, endIso }) => {
    const conflicts = fakeEvents.filter(
      (e) => !(endIso <= e.start || startIso >= e.end),
    );
    return { hasConflict: conflicts.length > 0, conflicts };
  },
});

export const createEvent = defineTool({
  name: 'create_event',
  description:
    'Create a new calendar event. Only call this after find_conflicts has been run and returned hasConflict=false (or the user has explicitly accepted the conflict).',
  input: z.object({
    title: z.string(),
    startIso: z.string(),
    endIso: z.string(),
    attendees: z.array(z.string().email()).default([]),
  }),
  handler: async (input) => {
    return { id: `evt_${Date.now()}`, ...input };
  },
});

export const calendarTools = [listEvents, findConflicts, createEvent];
