# LyriFind - Implementation Plan

## 📋 Project Overview

**LyriFind** is a Turborepo-based monorepo that enables users to identify songs from lyrics using an AI-powered chat interface.

### Technology Stack
- **Monorepo Management**: Turborepo
- **Package Manager**: pnpm (v8.15.0+)
- **MCP Server**: Node.js + Express + @modelcontextprotocol/sdk
- **Client**: Next.js 14+ with App Router
- **AI Integration**: Vercel AI SDK + Groq
- **API**: Genius API for song/lyric search
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Logging**: Pino

---

## 🏗️ Architecture Design

### System Flow
```
User Input → Next.js UI → /api/chat → Groq
                              ↓
                         MCP Client
                              ↓
                         MCP Server (SSE)
                              ↓
                         Genius API
                              ↓
                    Song Identification Result
```

### Monorepo Structure
```
LyriFind/
├── package.json                 # Root workspace configuration
├── pnpm-workspace.yaml          # pnpm workspace definition
├── turbo.json                   # Turborepo pipeline configuration
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── README.md                    # Project documentation
├── IMPLEMENTATION_PLAN.md       # This file
│
├── apps/
│   ├── mcp-server/              # MCP Server Application
│   │   ├── src/
│   │   │   ├── index.ts         # Server entry point (Express + SSE)
│   │   │   ├── tools/           # Tool definitions
│   │   │   │   └── genius.ts    # Genius API tool implementation
│   │   │   ├── config/          # Configuration
│   │   │   │   └── env.ts       # Environment validation (Zod)
│   │   │   └── utils/           # Utility functions
│   │   │       └── logger.ts    # Structured logging (Pino)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   └── web/                     # Next.js Client Application
│       ├── app/
│       │   ├── layout.tsx       # Root layout
│       │   ├── page.tsx         # Chat interface
│       │   ├── globals.css      # Global styles
│       │   └── api/
│       │       └── chat/
│       │           └── route.ts # AI SDK + MCP integration
│       ├── components/          # React components
│       │   └── chat-interface.tsx
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       ├── next.config.js
│       └── .env.example
│
└── packages/                    # Shared packages (optional)
    └── types/                   # Shared TypeScript types
        ├── package.json
        ├── tsconfig.json
        └── src/
            └── index.ts         # Shared type definitions
```

---

## 🎯 Implementation Phases

### Phase 1: Monorepo Foundation (30 min)

**Tasks:**
1. Initialize pnpm workspace
2. Configure Turborepo
3. Setup root package.json
4. Create pnpm-workspace.yaml
5. Configure turbo.json
6. Setup .gitignore for monorepo patterns
7. Create .env.example templates

**Key Files:**

**`package.json`:**
```json
{
  "name": "lyrifind",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@8.15.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^1.11.0",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

**`pnpm-workspace.yaml`:**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**`turbo.json`:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

**Deliverables:**
- ✅ Working Turborepo structure
- ✅ pnpm workspace configuration
- ✅ Development scripts

---

### Phase 2: MCP Server Implementation (1 hour)

**Tasks:**
1. Create `apps/mcp-server` directory structure
2. Initialize package.json with dependencies
3. Setup TypeScript configuration
4. Implement environment validation (config/env.ts)
5. Create logger utility (utils/logger.ts)
6. Implement Genius API tool (tools/genius.ts)
7. Create main server with SSE transport (index.ts)
8. Add health check endpoint
9. Configure development scripts

**Dependencies (`apps/mcp-server/package.json`):**
```json
{
  "name": "mcp-server",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "zod": "^3.22.4",
    "dotenv": "^16.3.1",
    "pino": "^8.16.0",
    "pino-pretty": "^10.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0"
  }
}
```

**Tool Schema:**
```typescript
{
  name: "identify_song",
  description: "Identifies a song from lyrics using the Genius API. Returns song title, artist, and link.",
  inputSchema: {
    type: "object",
    properties: {
      lyrics: {
        type: "string",
        description: "The lyric snippet to search for (minimum 3 words recommended)"
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return (1-5)",
        default: 3
      }
    },
    required: ["lyrics"]
  }
}
```

**Key Implementation Points:**
- Use SSEServerTransport for production-ready transport
- Implement proper error handling with try-catch
- Add structured logging with Pino
- Validate environment variables with Zod
- CORS configuration for development
- Health check endpoint at `/health`
- Graceful shutdown handling

**Testing Points:**
- Server starts on port 3001
- SSE endpoint accessible at `/sse`
- POST endpoint accessible at `/messages`
- Health check returns 200 OK
- Tool responds to MCP protocol messages

---

### Phase 3: Next.js Client Setup (1 hour)

**Tasks:**
1. Create Next.js app with TypeScript
2. Install Vercel AI SDK 4.2+ with MCP support
3. Configure Tailwind CSS
4. Implement chat API route using experimental_createMCPClient (app/api/chat/route.ts)
5. Build chat UI component (components/chat-interface.tsx)
6. Create main page (app/page.tsx)
7. Setup environment variables

**Dependencies (`apps/web/package.json`):**
```json
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "ai": "^4.2.0",
    "@ai-sdk/openai": "^1.0.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.4"
  }
}
```

**API Route Architecture:**
```typescript
// app/api/chat/route.ts flow (using AI SDK 4.2+):
1. Receive messages from client
2. Create MCP client using experimental_createMCPClient with SSE transport
3. Call mcpClient.tools() - AI SDK automatically converts MCP tools
4. Pass tools directly to streamText
5. Stream response back to client
6. Clean up client connection in onFinish callback
```

**Key Features:**
- Uses official AI SDK experimental_createMCPClient (v4.2+)
- Automatic tool discovery and conversion (no manual mapping needed)
- Simplified code (~45 lines vs ~85 lines with manual mapping)
- Streaming responses with tool execution
- Proper connection cleanup with onFinish callback
- Error boundary handling
- Loading states
- Responsive design

**Testing Points:**
- Chat UI renders correctly
- Can connect to MCP server on localhost:3001
- Tools are discovered and mapped to AI SDK
- Messages stream correctly
- Tool execution works end-to-end

---

### Phase 4: Integration & Testing (30 min)

**Test Scenarios:**

1. **Basic Song Identification:**
   - Input: "What song goes 'is this the real life'?"
   - Expected: Identifies "Bohemian Rhapsody" by Queen

2. **Popular Song:**
   - Input: "Find the song with lyrics 'never gonna give you up'"
   - Expected: Identifies "Never Gonna Give You Up" by Rick Astley

3. **Error Handling:**
   - Input: "Find song with lyrics 'asdfghjkl qwerty'"
   - Expected: Graceful "No matches found" message

4. **Multiple Results:**
   - Input: "Song with lyrics 'love' in it"
   - Expected: Returns multiple results (limited by schema)

5. **Concurrent Requests:**
   - Test: Send multiple requests rapidly
   - Expected: All requests handled correctly

6. **Server Restart:**
   - Test: Restart MCP server while client is running
   - Expected: Client reconnects gracefully

**Performance Checks:**
- Response time < 3 seconds for typical queries
- No memory leaks in MCP server
- Streaming starts within 500ms

---

### Phase 5: Documentation & Finalization (20 min)

**Documentation Tasks:**
1. Update README.md with:
   - Project overview
   - Prerequisites
   - Installation instructions
   - Running the application
   - Environment variables
   - Architecture diagram
   - Troubleshooting guide

2. Create `.env.example` files:
   - Root `.env.example`
   - `apps/mcp-server/.env.example`
   - `apps/web/.env.local.example`

3. Add inline code documentation:
   - JSDoc comments for complex functions
   - Type definitions for shared types
   - Architecture decision records (ADRs) if needed

4. Create developer guide:
   - How to add new tools to MCP server
   - How to extend the UI
   - Testing guidelines

---

## 🔐 Environment Variables

### Root `.env`
```env
# Genius API Configuration
GENIUS_ACCESS_TOKEN=your_genius_token_here

# Groq Configuration
GROQ_API_KEY=gsk_your_groq_key_here
```

### `apps/mcp-server/.env`
```env
# Server Configuration
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# Genius API (inherited from root or set directly)
GENIUS_ACCESS_TOKEN=your_genius_token_here
```

### `apps/web/.env.local`
```env
# MCP Server URL
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:3001

# Groq API Key (inherited from root or set directly)
GROQ_API_KEY=gsk_your_groq_key_here
```

---

## 🚀 Running the Application

### Prerequisites
- Node.js 18+ installed
- pnpm 8+ installed (`npm install -g pnpm`)
- Genius API access token ([Get it here](https://genius.com/api-clients))
- Groq API key

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd LyriFind

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env and add your API keys

# Start development servers
pnpm dev
```

### Development Workflow
```bash
# Start both apps (MCP server + Next.js)
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint

# Clean all dependencies and build artifacts
pnpm clean
```

### What Happens When You Run `pnpm dev`:
1. Turborepo starts both apps in parallel
2. `mcp-server` starts on http://localhost:3001
   - SSE endpoint: http://localhost:3001/sse
   - Health check: http://localhost:3001/health
3. `web` starts on http://localhost:3000
4. Open http://localhost:3000 in your browser
5. Type lyrics and get song identification!

---

## 📊 Success Criteria

- ✅ Monorepo builds and runs successfully with pnpm
- ✅ MCP server exposes `identify_song` tool via SSE
- ✅ Next.js client can discover and execute MCP tools
- ✅ End-to-end lyric search works correctly
- ✅ Error handling is robust (network errors, API errors, no results)
- ✅ Code follows TypeScript strict mode
- ✅ Environment variables are validated with Zod
- ✅ Structured logging is implemented
- ✅ UI is responsive and accessible
- ✅ Documentation is complete and accurate
- ✅ Hot reload works in development
- ✅ Production build succeeds

---

## 🔧 MCP Server Architecture Details

### Tool Registration Pattern
```typescript
// Using new MCP SDK API
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "identify_song",
        description: "...",
        inputSchema: { /* Zod schema */ }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "identify_song") {
    // Execute tool logic
    return { content: [{ type: "text", text: "..." }] };
  }
  throw new Error("Tool not found");
});
```

### SSE Transport Setup
```typescript
// Separate transport per request (avoid ID collisions)
app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  // Handle incoming MCP messages
  await transport.handlePostMessage(req, res);
});
```

---

## 🎨 Next.js Client Architecture Details

### MCP Client Integration (AI SDK 4.2+)

Using the official AI SDK experimental_createMCPClient:

```typescript
// app/api/chat/route.ts
import { experimental_createMCPClient, streamText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Create MCP client with SSE transport
  const mcpClient = await experimental_createMCPClient({
    transport: {
      type: 'sse',
      url: process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:3001',
    },
  });

  // Get tools - AI SDK automatically converts MCP tools to AI SDK format
  const tools = await mcpClient.tools();

  // Stream response with automatic tool execution
  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    messages,
    tools,
    maxSteps: 5,
    onFinish: async () => {
      await mcpClient.close(); // Clean up connection
    },
  });

  return result.toDataStreamResponse();
}
```

### Key Benefits of AI SDK 4.2+ Approach

- **Automatic Tool Conversion**: No manual mapping from MCP schema to Zod/AI SDK format
- **Simpler Code**: ~45 lines instead of ~85 lines with manual mapping
- **Built-in Connection Management**: Proper cleanup with onFinish callback
- **Type Safety**: Full TypeScript support with inference
- **Production Ready**: Official SDK implementation, not custom wrapper

---

## 🐛 Troubleshooting Guide

### MCP Server Won't Start
- Check if port 3001 is already in use: `lsof -i :3001`
- Verify GENIUS_ACCESS_TOKEN is set in `.env`
- Check logs for detailed error messages

### Next.js Can't Connect to MCP Server
- Ensure MCP server is running on port 3001
- Check NEXT_PUBLIC_MCP_SERVER_URL in `.env.local`
- Verify CORS is enabled in MCP server

### Tool Execution Fails
- Verify Genius API token is valid
- Check network connectivity
- Review MCP server logs for API errors

### pnpm Installation Issues
- Clear pnpm cache: `pnpm store prune`
- Delete node_modules and reinstall: `pnpm clean && pnpm install`
- Verify pnpm version: `pnpm --version` (should be 8.15.0+)

---

## 📚 Additional Resources

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Vercel AI SDK 4.2+](https://sdk.vercel.ai/docs)
- [AI SDK MCP Tools](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools)
- [experimental_createMCPClient Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/create-mcp-client)
- [Genius API Documentation](https://docs.genius.com/)
- [pnpm Workspace Guide](https://pnpm.io/workspaces)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## 🎯 Future Enhancements

- [ ] Add more MCP tools (lyrics fetching, artist info, album details)
- [ ] Implement caching for repeated queries
- [ ] Add user authentication
- [ ] Create shareable song identification links
- [ ] Add Spotify/Apple Music integration
- [ ] Implement rate limiting on client side
- [ ] Add analytics and usage tracking
- [ ] Create mobile-responsive progressive web app
- [ ] Add voice input for lyrics
- [ ] Multi-language support

---

**Plan Version:** 1.0
**Date:** 2025-11-19
**Author:** Claude (AI Assistant)
**Status:** Ready for Implementation
