import express from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import * as z from 'zod/v4';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { identifySong, type IdentifySongArgs } from './tools/genius.js';
import { getSongDetails, type SongDetailsArgs } from './tools/songDetails.js';

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create MCP Server
const mcpServer = new McpServer({
  name: 'lyrifind-mcp-server',
  version: '0.1.0',
});

// Register the identify_song tool
mcpServer.registerTool(
  'identify_song',
  {
    title: 'Identify Song',
    description:
      'Searches the Genius database to identify songs based on lyric snippets. Returns structured song data including title, artist, Genius URL, and album artwork. Use when users provide any lyrics, song fragments, or ask "what song is this" with quoted text. Works best with distinctive, memorable lyrics (minimum 3-5 words recommended).',
    inputSchema: {
      lyrics: z.string().describe('The exact lyric snippet or phrase from the song that the user wants to identify. Can be partial lyrics, a chorus line, or any memorable phrase from the song.'),
      limit: z
        .number()
        .min(1)
        .max(5)
        .default(3)
        .describe('Maximum number of song matches to return (1-5). Use 1 for high-confidence queries, 3-5 for ambiguous lyrics.'),
    },
  },
  async (args) => {
    logger.info({ args }, 'Tool execution requested');

    try {
      const result = await identifySong(args as IdentifySongArgs);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      };
    } catch (error) {
      logger.error({ error }, 'Tool execution failed');
      throw error;
    }
  }
);

// Register the get_song_details tool
mcpServer.registerTool(
  'get_song_details',
  {
    title: 'Get Song Details',
    description: 'Fetches comprehensive details about a specific song from Genius using its numeric ID (obtained from identify_song results). Returns release date, album, featured artists, producers, writers, description, and streaming links (Apple Music, Spotify, YouTube). IMPORTANT: Use the "id" field from identify_song results, NOT the URL.',
    inputSchema: {
      song_id: z.number().describe('The numeric Genius song ID from identify_song results. Example: 3273329. This is the "id" field returned by identify_song, NOT the URL.'),
    },
  },
  async (args) => {
    logger.info({ args }, 'get_song_details tool execution requested');
    try {
      const result = await getSongDetails(args as SongDetailsArgs);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      };
    } catch (error) {
      logger.error({ error }, 'get_song_details tool execution failed');
      throw error;
    }
  }
);

// HTTP endpoint for MCP connections
app.post('/mcp', async (req, res) => {
  logger.info('New MCP request received');

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on('close', () => {
      logger.info('MCP connection closed');
      transport.close();
    });

    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    logger.error({ error }, 'Failed to handle MCP request');
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'lyrifind-mcp-server',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'LyriFind MCP Server',
    version: '0.1.0',
    description: 'Model Context Protocol server for song identification via Genius API',
    endpoints: {
      mcp: '/mcp',
      health: '/health',
    },
  });
});

// Start server
const PORT = env.PORT;
const server = app.listen(PORT, () => {
  logger.info(`LyriFind MCP Server running on http://localhost:${PORT}`);
  logger.info(`   MCP endpoint: http://localhost:${PORT}/mcp`);
  logger.info(`   Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
