# LyriFind 🎵

AI-powered song identification from lyrics using the Model Context Protocol (MCP) and Genius API.

## Features

- 🔍 **Song Identification**: Search for songs using lyrics snippets via the Genius API
- 🎨 **Beautiful UI**: Modern, responsive chat interface built with Next.js and Shadcn UI
- 🤖 **AI-Powered**: Uses Groq's LLM for intelligent conversation and tool orchestration
- 🔌 **MCP Protocol**: Implements Model Context Protocol for standardized AI tool integration
- ⚡ **Streaming**: Real-time streaming responses for instant feedback
- 🚀 **Vercel Ready**: Optimized for deployment on Vercel with serverless functions

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel Deployment                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │   Next.js App   │    │        API Routes               │ │
│  │                 │    │  ┌──────────────────────────┐   │ │
│  │  - Chat UI      │───▶│  │  /api/chat               │   │ │
│  │  - Song Cards   │    │  │  (AI SDK + MCP Client)   │   │ │
│  │  - Visualizer   │    │  └──────────────────────────┘   │ │
│  └─────────────────┘    │              │                  │ │
│                         │              ▼                  │ │
│                         │  ┌──────────────────────────┐   │ │
│                         │  │  /api/mcp/[transport]    │   │ │
│                         │  │  (MCP Server Handler)    │   │ │
│                         │  │  - identify_song         │   │ │
│                         │  │  - get_song_details      │   │ │
│                         │  └──────────────────────────┘   │ │
│                         └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │   Genius API    │
                          │  (Song Data)    │
                          └─────────────────┘
```

## Tech Stack

- **Frontend**: Next.js 16, React 18, Tailwind CSS, Shadcn UI, Framer Motion
- **AI/LLM**: Vercel AI SDK, Groq (Kimi K2 model)
- **MCP Server**: mcp-handler (Vercel's MCP adapter)
- **API**: Genius API for song data
- **Deployment**: Vercel (serverless)
- **Build**: Turborepo, pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Genius API access token ([Get one here](https://genius.com/api-clients))
- Groq API key ([Get one here](https://console.groq.com/keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nabobery/LyriFind.git
   cd LyriFind
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` in `apps/web/`:
   ```env
   # Required
   GENIUS_ACCESS_TOKEN=your_genius_access_token
   GROQ_API_KEY=your_groq_api_key
   
   # Optional (for local development with external MCP server)
   # MCP_SERVER_URL=http://localhost:3001/mcp
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open the app**
   
   Visit [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### One-Click Deploy

Click the "Deploy with Vercel" button at the top of this README.

### Manual Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect the monorepo structure

3. **Configure Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables, add:
   
   | Variable | Description | Required |
   |----------|-------------|----------|
   | `GENIUS_ACCESS_TOKEN` | Genius API access token | ✅ |
   | `GROQ_API_KEY` | Groq API key | ✅ |
   | `REDIS_URL` | Redis URL for SSE sessions (optional) | ❌ |

4. **Deploy**
   
   Vercel will automatically build and deploy your app.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GENIUS_ACCESS_TOKEN` | Your Genius API access token for song search | Yes |
| `GROQ_API_KEY` | Your Groq API key for AI chat | Yes |
| `REDIS_URL` | Redis connection URL for SSE session persistence | No |
| `MCP_SERVER_URL` | External MCP server URL (dev only) | No |

## Project Structure

```
LyriFind/
├── apps/
│   ├── web/                    # Next.js application
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── chat/       # AI chat endpoint
│   │   │   │   └── mcp/        # MCP server endpoint
│   │   │   ├── page.tsx        # Main page
│   │   │   └── layout.tsx      # Root layout
│   │   ├── components/         # React components
│   │   ├── lib/
│   │   │   ├── mcp/
│   │   │   │   └── tools/      # MCP tool implementations
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   └── vercel.json         # Vercel function config
│   └── mcp-server/             # Standalone MCP server (optional)
├── vercel.json                 # Root Vercel config
├── turbo.json                  # Turborepo config
├── pnpm-workspace.yaml
└── package.json
```

## MCP Tools

### `identify_song`

Searches the Genius database to identify songs based on lyric snippets.

**Input:**
- `lyrics` (string): The lyric snippet to search for
- `limit` (number, 1-5): Maximum number of results

**Output:**
```json
{
  "success": true,
  "count": 3,
  "songs": [
    {
      "id": 3273329,
      "title": "Something Just Like This",
      "primary_artist": "The Chainsmokers & Coldplay",
      "url": "https://genius.com/...",
      "album_art_url": "https://..."
    }
  ]
}
```

### `get_song_details`

Fetches comprehensive details about a specific song.

**Input:**
- `song_id` (number): The Genius song ID from `identify_song` results

**Output:**
```json
{
  "success": true,
  "details": {
    "id": 3273329,
    "title": "Something Just Like This",
    "release_date": "February 22, 2017",
    "album": { "name": "Memories...Do Not Open", "url": "..." },
    "primary_artist": { "name": "The Chainsmokers", "url": "..." },
    "featured_artists": ["Coldplay"],
    "producers": ["The Chainsmokers"],
    "writers": ["Chris Martin", "..."],
    "apple_music_url": "...",
    "spotify_uri": "...",
    "youtube_url": "..."
  }
}
```

## Using as an MCP Server

You can connect to the deployed MCP server from any MCP-compatible client:

### Cursor IDE

Add to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "lyrifind": {
      "url": "https://your-app.vercel.app/api/mcp/mcp"
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop config:
```json
{
  "mcpServers": {
    "lyrifind": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://your-app.vercel.app/api/mcp/mcp"]
    }
  }
}
```

## Development

### Available Scripts

```bash
# Development
pnpm dev          # Start all apps in development mode

# Build
pnpm build        # Build all apps

# Lint
pnpm lint         # Lint all apps

# Type Check
pnpm type-check   # Type check all apps

# Clean
pnpm clean        # Clean all build artifacts
```

### Local Development with Standalone MCP Server

If you prefer running the MCP server separately:

1. Start the MCP server:
   ```bash
   cd apps/mcp-server
   pnpm dev
   ```

2. Set `MCP_SERVER_URL` in `apps/web/.env.local`:
   ```env
   MCP_SERVER_URL=http://localhost:3001/mcp
   ```

3. Start the web app:
   ```bash
   cd apps/web
   pnpm dev
   ```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Genius API](https://genius.com/developers) for song data
- [Vercel](https://vercel.com) for hosting and MCP adapter
- [Groq](https://groq.com) for LLM inference
- [Model Context Protocol](https://modelcontextprotocol.io) for the MCP specification
