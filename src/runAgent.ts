import { ExecutiveAssistantAgent } from './agents/executiveAssistant.js';

/**
 * CLI entrypoint for the executive assistant agent. Reads ANTHROPIC_API_KEY
 * from the environment and accepts a single message as a command-line
 * argument so the agent loop can be exercised end-to-end.
 *
 *   ANTHROPIC_API_KEY=sk-... npm run agent -- "Schedule a 30 min sync with legal tomorrow at 10am"
 */
async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is required');
    process.exit(1);
  }

  const userMessage =
    process.argv.slice(2).join(' ') ||
    'Summarize the Q1 OKR doc at https://docs.example.com/q1 and tell me what is at risk for Q2.';

  const agent = new ExecutiveAssistantAgent(apiKey);
  const reply = await agent.chat(userMessage);

  console.log('\n--- Atlas ---\n');
  console.log(reply);
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
