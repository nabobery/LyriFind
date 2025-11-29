import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { experimental_createMCPClient as createMCPClient } from '@ai-sdk/mcp';
import { z } from 'zod';

// Prevent timeout on streaming responses
export const maxDuration = 30;

// Singleton MCP client instance for connection pooling
let mcpClientInstance: Awaited<ReturnType<typeof createMCPClient>> | null = null;

async function getMCPClient() {
  if (!mcpClientInstance) {
    mcpClientInstance = await createMCPClient({
      transport: {
        type: 'http',
        url: process.env.MCP_SERVER_URL || 'http://localhost:3001/mcp',
      },
    });
  }
  return mcpClientInstance;
}

// Zod schema for request validation
const ChatRequestSchema = z.object({
  messages: z.array(z.any()).min(1),
});

// System prompt with clear instructions for tool usage
const SYSTEM_PROMPT = `You are LyriFind AI, a specialized music identification assistant that helps users find songs from lyrics.

## Your Tools
You have access to two MCP tools:
1. **identify_song**: Search for songs by lyrics. Returns matches with id, title, artist, url, and album_art_url.
2. **get_song_details**: Get full song details using the numeric song_id from identify_song results.

## Critical Workflow
When a user provides lyrics:
1. Call \`identify_song\` with the lyrics (limit=1 for clear lyrics, limit=3 for ambiguous)
2. From the results, extract the numeric \`id\` field (e.g., 3273329)
3. Call \`get_song_details\` with song_id set to that numeric id
4. Provide a brief confirmation message

## Example Tool Usage
After identify_song returns: {"id": 3273329, "title": "Something Just Like This", ...}
Call get_song_details with: {"song_id": 3273329}

## Response Guidelines
- Be concise - the UI displays song cards from tool results
- After tool calls, say something brief like "Found it! 🎵"
- If no match is found, suggest trying different lyrics
- DON'T repeat song details in text - the cards show everything

## Important
- ALWAYS use the numeric "id" field for get_song_details, NOT the URL
- Keep text responses minimal - let the visual song cards do the work`;

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const result = ChatRequestSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request format',
          ...(process.env.NODE_ENV === 'development' && {
            details: result.error.issues,
          }),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = result.data;

    // Get MCP client instance (reuses connection)
    const mcpClient = await getMCPClient();

    // Get tools from MCP server
    const tools = await mcpClient.tools();

    // Stream response with MCP tools
    const streamResult = streamText({
      model: groq('moonshotai/kimi-k2-instruct-0905'),
      messages: convertToModelMessages(messages),
      tools,
      system: SYSTEM_PROMPT,
      stopWhen: stepCountIs(5),
    });

    // Pass originalMessages to preserve message IDs and ensure tool parts are included
    return streamResult.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch (error) {
    console.error('Chat API error:', error);

    const isDevelopment = process.env.NODE_ENV === 'development';

    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        ...(isDevelopment && {
          details: error instanceof Error ? error.message : 'Unknown error',
        }),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
