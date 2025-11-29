# LyriFind 🎵

AI-powered song identification from lyrics using the Model Context Protocol (MCP) and Genius API.

## 🌟 Features

- **AI-Powered Search**: Natural language interface for finding songs by lyrics
- **MCP Architecture**: Production-ready Model Context Protocol server
- **Modern Stack**: Turborepo monorepo with Next.js 14 and TypeScript
- **Real-time Streaming**: Live AI responses with tool execution
- **Genius Integration**: Comprehensive song database via Genius API

## 🏗️ Architecture

```
User → Next.js UI → Groq → MCP Server → Genius API
```

- **apps/mcp-server**: Express server implementing MCP with SSE transport
- **apps/web**: Next.js 14 client with Vercel AI SDK integration

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher
- [Genius API Access Token](https://genius.com/api-clients)
- [Groq API Key](https://console.groq.com/keys)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
# GENIUS_ACCESS_TOKEN=your_token_here
# GROQ_API_KEY=gsk_your_key_here
```

### 3. Run Development Servers

```bash
pnpm dev
```

This starts:
- MCP Server on http://localhost:3001
- Next.js Client on http://localhost:3000

### 4. Start Searching!

Open http://localhost:3000 and start asking about songs!

**For detailed setup instructions, see [GETTING_STARTED.md](./GETTING_STARTED.md)**

## 📦 Project Structure

```
LyriFind/
├── apps/
│   ├── mcp-server/      # MCP Protocol Server
│   └── web/             # Next.js Client
├── packages/
│   └── types/           # Shared TypeScript types
├── turbo.json           # Turborepo configuration
└── pnpm-workspace.yaml  # pnpm workspace config
```

## 🛠️ Development

```bash
# Start all apps in development mode
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

## 📚 Documentation

- **[Getting Started Guide](./GETTING_STARTED.md)** - Complete setup and usage instructions
- **[Implementation Plan](./IMPLEMENTATION_PLAN.md)** - Architecture and technical details
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project

## 🔧 Technologies

- **Monorepo**: Turborepo + pnpm workspaces
- **MCP Server**: @modelcontextprotocol/sdk + Express
- **Client**: Next.js 14 + Vercel AI SDK
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **API**: Genius API + Groq

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the [Contributing Guide](./CONTRIBUTING.md) before contributing.
