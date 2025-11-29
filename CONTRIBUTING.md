# Contributing to LyriFind

Thank you for considering contributing to LyriFind! This document provides guidelines and instructions for contributing.

## 🏗️ Architecture Overview

LyriFind is built as a Turborepo monorepo with two main applications:

### MCP Server (`apps/mcp-server`)
- **Technology**: Node.js, Express, TypeScript
- **Purpose**: Implements the Model Context Protocol (MCP) server
- **Responsibilities**:
  - Expose Genius API as MCP tools
  - Handle SSE transport for MCP connections
  - Validate environment configuration
  - Structured logging

### Next.js Client (`apps/web`)
- **Technology**: Next.js 14, React, TypeScript, Tailwind CSS
- **Purpose**: User-facing chat interface
- **Responsibilities**:
  - Provide chat UI
  - Bridge Vercel AI SDK with MCP client
  - Stream AI responses
  - Handle tool execution

## 🚀 Development Setup

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/LyriFind.git
   cd LyriFind
   ```
3. **Install dependencies:**
   ```bash
   pnpm install
   ```
4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Add your API keys
   ```
5. **Start development:**
   ```bash
   pnpm dev
   ```

## 📝 Code Style

### TypeScript
- Use **strict mode** (already configured)
- Always define types explicitly
- Avoid `any` types when possible
- Use interfaces for objects, types for primitives

### Formatting
- Follow the existing code style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### File Organization
```
src/
├── config/     # Configuration and environment validation
├── tools/      # MCP tool implementations
└── utils/      # Shared utilities
```

## 🧪 Testing

### Type Checking
```bash
pnpm type-check
```

### Running Individual Apps
```bash
# MCP Server only
cd apps/mcp-server
pnpm dev

# Next.js Client only
cd apps/web
pnpm dev
```

## 🎯 Adding New Features

### Adding a New MCP Tool

1. **Create tool implementation:**
   ```typescript
   // apps/mcp-server/src/tools/your-tool.ts
   export async function yourTool(args: YourToolArgs): Promise<string> {
     // Implementation
   }
   ```

2. **Register in server:**
   ```typescript
   // apps/mcp-server/src/index.ts
   mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
     return {
       tools: [
         // ... existing tools
         {
           name: 'your_tool',
           description: 'Description of your tool',
           inputSchema: { /* JSON Schema */ }
         }
       ]
     };
   });
   ```

3. **Add tool handler:**
   ```typescript
   mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
     if (request.params.name === 'your_tool') {
       const result = await yourTool(request.params.arguments);
       return { content: [{ type: 'text', text: result }] };
     }
   });
   ```

### Adding UI Components

1. Create component in `apps/web/components/`
2. Use TypeScript and proper typing
3. Style with Tailwind CSS
4. Make it responsive
5. Add accessibility features (ARIA labels, keyboard navigation)

## 📋 Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, descriptive commit messages
   - Follow the code style
   - Add comments where necessary

3. **Test your changes:**
   ```bash
   pnpm type-check
   pnpm build
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear description
   - Reference any related issues
   - Include screenshots for UI changes

### Commit Message Format

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:
```
feat: add song lyrics fetching tool

- Implement new MCP tool for fetching full lyrics
- Add Genius lyrics API integration
- Update UI to display full lyrics
```

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Step-by-step instructions
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**:
   - Node.js version
   - pnpm version
   - Operating system
6. **Logs**: Relevant error logs

## 💡 Feature Requests

When requesting features:

1. **Use Case**: Describe why you need this feature
2. **Proposed Solution**: How you think it should work
3. **Alternatives**: Any alternative solutions you've considered

## 📚 Resources

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Genius API Docs](https://docs.genius.com/)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others when possible
- Focus on what's best for the community

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🎉 Recognition

Contributors will be recognized in the project README. Thank you for making LyriFind better!
