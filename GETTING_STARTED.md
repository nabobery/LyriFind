# Getting Started with LyriFind

This guide will help you set up and run LyriFind on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** version 18.0.0 or higher
- **pnpm** version 8.0.0 or higher
- A **Genius API Access Token** ([Get one here](https://genius.com/api-clients))
- A **Groq API Key** ([Get one here](https://console.groq.com/keys))

### Installing pnpm

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

Verify installation:

```bash
pnpm --version
# Should output 8.0.0 or higher
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/nabobery/LyriFind.git
cd LyriFind
```

### 2. Install Dependencies

Install all dependencies for both the MCP server and Next.js client:

```bash
pnpm install
```

This will install dependencies for:
- Root workspace
- `apps/mcp-server` (MCP Server)
- `apps/web` (Next.js Client)

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```env
# Genius API Configuration
GENIUS_ACCESS_TOKEN=your_actual_genius_token_here

# Groq Configuration
GROQ_API_KEY=gsk_your_actual_groq_key_here
```

#### Getting Your API Keys

**Genius API Token:**
1. Visit [Genius API Clients](https://genius.com/api-clients)
2. Sign in or create an account
3. Create a new API client
4. Generate an access token
5. Copy the token to your `.env` file

**Groq API Key:**
1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign in or create an account
3. Create a new API key
4. Copy the key to your `.env` file

### 4. Start Development Servers

Start both the MCP server and Next.js client:

```bash
pnpm dev
```

Turborepo will start both applications in parallel:

- **MCP Server**: http://localhost:3001
- **Next.js Client**: http://localhost:3000

You should see output similar to:

```
web:dev: ready - started server on 0.0.0.0:3000, url: http://localhost:3000
mcp-server:dev: 🎵 LyriFind MCP Server running on http://localhost:3001
```

### 5. Open the Application

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the LyriFind chat interface!

## 🎵 Using LyriFind

### Example Queries

Try asking LyriFind to identify songs using natural language:

1. **By lyrics:**
   - "What song has the lyrics 'walking on sunshine'?"
   - "Find a song with 'imagine all the people'"

2. **By partial lyrics:**
   - "Which song goes 'we are the champions'?"
   - "Song with 'hello from the other side'"

3. **Conversational:**
   - "I'm trying to remember a song that says something about dreams"
   - "What's that song with the line about dancing?"

### How It Works

1. You type your query in the chat interface
2. Groq processes your natural language query
3. The AI decides to use the `identify_song` tool
4. The MCP server queries the Genius API
5. Results are returned and formatted by the AI
6. You see the song title, artist, and link!

## 🛠️ Development Commands

### Run All Apps

```bash
pnpm dev
```

### Build for Production

```bash
pnpm build
```

### Type Checking

```bash
pnpm type-check
```

### Run Linting

```bash
pnpm lint
```

### Clean Everything

Remove all node_modules and build artifacts:

```bash
pnpm clean
```

## 🏗️ Project Structure

```
LyriFind/
├── apps/
│   ├── mcp-server/          # MCP Server (Express + Genius API)
│   │   ├── src/
│   │   │   ├── index.ts     # Server entry point
│   │   │   ├── config/      # Environment validation
│   │   │   ├── tools/       # Genius API tool
│   │   │   └── utils/       # Logger
│   │   └── package.json
│   │
│   └── web/                 # Next.js Client
│       ├── app/             # Next.js App Router
│       │   ├── page.tsx     # Main chat UI
│       │   └── api/chat/    # AI SDK + MCP bridge
│       ├── lib/             # MCP client wrapper
│       └── package.json
│
├── package.json             # Root workspace config
├── pnpm-workspace.yaml      # pnpm workspace definition
├── turbo.json               # Turborepo pipeline
└── .env                     # Environment variables
```

## 🔍 Verifying the Setup

### Check MCP Server Health

The MCP server provides a health check endpoint:

```bash
curl http://localhost:3001/health
```

Should return:

```json
{
  "status": "healthy",
  "service": "lyrifind-mcp-server",
  "version": "0.1.0",
  "timestamp": "2024-11-19T..."
}
```

### Check MCP Server Info

```bash
curl http://localhost:3001/
```

Should return server information and available endpoints.

### Test SSE Connection

The MCP server uses Server-Sent Events (SSE):

```bash
curl http://localhost:3001/sse
```

You should see an SSE connection establish (it will hang, which is normal).

## 🐛 Troubleshooting

### Port Already in Use

If you see an error that port 3000 or 3001 is already in use:

**Find and kill the process:**

```bash
# For port 3000
lsof -ti:3000 | xargs kill -9

# For port 3001
lsof -ti:3001 | xargs kill -9
```

### API Key Errors

**Error: Missing GENIUS_ACCESS_TOKEN**
- Make sure you created a `.env` file in the root directory
- Verify your Genius API token is correct
- The token should not be in quotes

**Error: Groq API Error**
- Verify your Groq API key is correct
- Make sure the key starts with `gsk_`

### Dependencies Won't Install

**Clear pnpm cache and reinstall:**

```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

### MCP Server Won't Start

**Check the logs:**
- Look for error messages in the terminal
- Verify all environment variables are set
- Make sure no other process is using port 3001

### Next.js Build Errors

**Clear Next.js cache:**

```bash
rm -rf apps/web/.next
pnpm dev
```

## 📚 Next Steps

- Read [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for architecture details
- Explore the MCP server tools in `apps/mcp-server/src/tools/`
- Customize the UI in `apps/web/app/page.tsx`
- Add more tools to the MCP server

## 🤝 Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Review the [Implementation Plan](./IMPLEMENTATION_PLAN.md)
3. Check the terminal logs for error messages
4. Verify all prerequisites are installed correctly

## 🎉 Success!

If you've made it this far and everything is working, congratulations! You now have a fully functional AI-powered song identification system running on your machine.

Try asking it to identify your favorite songs!
