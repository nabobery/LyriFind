import { createMcpHandler } from 'mcp-handler';
import * as z from 'zod/v4';
import { identifySong } from '@/lib/mcp/tools/genius';
import { getSongDetails } from '@/lib/mcp/tools/songDetails';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

// Create MCP handler with tools using the new registerTool API
const handler = createMcpHandler(
  (server) => {
    // Register identify_song tool using the new non-deprecated API
    server.registerTool(
      'identify_song',
      {
        title: 'Identify Song',
        description:
          'Searches the Genius database to identify songs based on lyric snippets. Returns structured song data including title, artist, Genius URL, and album artwork. Use when users provide any lyrics, song fragments, or ask "what song is this" with quoted text. Works best with distinctive, memorable lyrics (minimum 3-5 words recommended).',
        inputSchema: {
          lyrics: z
            .string()
            .describe(
              'The exact lyric snippet or phrase from the song that the user wants to identify. Can be partial lyrics, a chorus line, or any memorable phrase from the song.'
            ),
          limit: z
            .number()
            .int()
            .min(1)
            .max(5)
            .default(3)
            .describe(
              'Maximum number of song matches to return (1-5). Use 1 for high-confidence queries, 3-5 for ambiguous lyrics.'
            ),
        },
      },
      async ({ lyrics, limit }) => {
        const result = await identifySong({ lyrics, limit });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      }
    );

    // Register get_song_details tool using the new non-deprecated API
    server.registerTool(
      'get_song_details',
      {
        title: 'Get Song Details',
        description:
          'Fetches comprehensive details about a specific song from Genius using its numeric ID (obtained from identify_song results). Returns release date, album, featured artists, producers, writers, description, and streaming links (Apple Music, Spotify, YouTube). IMPORTANT: Use the "id" field from identify_song results, NOT the URL.',
        inputSchema: {
          song_id: z
            .number()
            .int()
            .describe(
              'The numeric Genius song ID from identify_song results. Example: 3273329. This is the "id" field returned by identify_song, NOT the URL.'
            ),
        },
      },
      async ({ song_id }) => {
        const result = await getSongDetails({ song_id });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      }
    );
  },
  {
    // Server options
    serverInfo: {
      name: 'lyrifind-mcp-server',
      version: '0.1.0',
    },
  },
  {
    // Handler configuration
    basePath: '/api/mcp',
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === 'development',
    // Redis URL for SSE transport (optional - for session persistence)
    redisUrl: process.env.REDIS_URL,
  }
);

// Export handlers for all HTTP methods
export { handler as GET, handler as POST, handler as DELETE };
