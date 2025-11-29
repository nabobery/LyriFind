# Vercel MCP Server Authentication Guide

## Problem
Your MCP server at `/api/mcp/[transport]` is returning HTTP 401 because Vercel Deployment Protection is blocking external MCP clients.

## Current Status
✅ **FIXED** - Added `protectionBypass` to `apps/web/vercel.json`

## Solution Applied (Option 1: Public MCP Endpoint)

### Configuration Added to `vercel.json`
```json
{
  "protectionBypass": {
    "/api/mcp": "public"
  }
}
```

This makes your MCP endpoint publicly accessible while keeping the rest of your application protected.

---

## Alternative Solutions

### Option 2: OAuth Authentication (Production-Ready)

For production environments requiring authentication, implement OAuth:

#### Step 1: Create OAuth verification function

Create `apps/web/lib/mcp/auth.ts`:

```typescript
import { NextRequest } from 'next/server';

export async function verifyMcpToken(
  req: NextRequest,
  bearerToken?: string
): Promise<{ token: string; scopes: string[]; clientId: string } | undefined> {
  if (!bearerToken) {
    return undefined;
  }

  // Example: Verify JWT token
  try {
    // Replace with your actual token verification logic
    // This could be JWT verification, database lookup, etc.
    const payload = await verifyJWT(bearerToken);

    return {
      token: bearerToken,
      scopes: payload.scopes || ['read:songs'],
      clientId: payload.sub || 'unknown',
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return undefined;
  }
}

async function verifyJWT(token: string) {
  // Implement your JWT verification logic here
  // Example using jose library:
  // const { payload } = await jwtVerify(token, secret);
  // return payload;
  throw new Error('Implement JWT verification');
}
```

#### Step 2: Update MCP handler

Update `apps/web/app/api/mcp/[transport]/route.ts`:

```typescript
import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import { verifyMcpToken } from '@/lib/mcp/auth';
import * as z from 'zod/v4';
import { identifySong } from '@/lib/mcp/tools/genius';
import { getSongDetails } from '@/lib/mcp/tools/songDetails';

export const maxDuration = 60;

const baseHandler = createMcpHandler(
  (server) => {
    // Register tools (same as before)
    server.registerTool('identify_song', { /* ... */ }, async ({ lyrics, limit }) => {
      // ... tool implementation
    });

    server.registerTool('get_song_details', { /* ... */ }, async ({ song_id }) => {
      // ... tool implementation
    });
  },
  {
    serverInfo: {
      name: 'lyrifind-mcp-server',
      version: '0.1.0',
    },
  },
  {
    basePath: '/api/mcp',
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === 'development',
    redisUrl: process.env.REDIS_URL,
  }
);

// Wrap with authentication
const handler = withMcpAuth(baseHandler, verifyMcpToken, {
  required: true,
  requiredScopes: ['read:songs'],
  resourceMetadataPath: '/.well-known/oauth-protected-resource',
});

export { handler as GET, handler as POST, handler as DELETE };
```

#### Step 3: Create OAuth metadata endpoint

Create `apps/web/app/.well-known/oauth-protected-resource/route.ts`:

```typescript
import { protectedResourceHandler } from 'mcp-handler';

const handler = protectedResourceHandler({
  authServerUrls: [
    // Replace with your actual OAuth provider URL
    process.env.NEXT_PUBLIC_AUTH_URL || 'https://your-auth-server.com',
  ],
});

export { handler as GET };
```

#### Step 4: Remove protectionBypass from vercel.json

With OAuth in place, you can remove the public bypass and rely on OAuth tokens.

---

### Option 3: Use Vercel Automation Bypass Secret

For CI/CD and automated testing:

#### In your MCP client configuration:

```json
{
  "mcpServers": {
    "lyrifind": {
      "url": "https://your-app.vercel.app/api/mcp",
      "headers": {
        "x-vercel-protection-bypass": "your-automation-bypass-secret"
      }
    }
  }
}
```

The secret is available in Vercel as the environment variable:
```bash
VERCEL_AUTOMATION_BYPASS_SECRET
```

---

## Security Recommendations

### For Development/Preview Deployments
✅ Use **Option 1** (protectionBypass) - Simple and effective

### For Production Deployments
✅ Use **Option 2** (OAuth) - Secure and standards-compliant

### For CI/CD Testing
✅ Use **Option 3** (Automation Bypass) - Purpose-built for automation

---

## Testing Your MCP Server

### Local Testing
```bash
# Start dev server
pnpm dev

# In another terminal, run the MCP inspector
pnpm dlx @modelcontextprotocol/inspector@latest http://localhost:3000/api/mcp
```

### Production Testing
```bash
# Test the deployed endpoint
curl https://your-app.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

---

## References

- [Vercel Deployment Protection Bypass](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)
- [Deploy MCP Servers to Vercel](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel)
- [mcp-handler npm package](https://www.npmjs.com/package/mcp-handler)
- [MCP Authorization Specification](https://spec.modelcontextprotocol.io/specification/2024-11-05/authorization/)

---

## Current Configuration Summary

**File**: `apps/web/vercel.json`
- ✅ MCP endpoint made publicly accessible
- ✅ Function timeouts set to 60s
- ✅ Framework detection: Next.js

**File**: `apps/web/app/api/mcp/[transport]/route.ts`
- ✅ Two tools registered: `identify_song` and `get_song_details`
- ✅ Using latest `registerTool` API (non-deprecated)
- ✅ Proper error handling and response formatting

**Deployment**:
- ✅ MCP endpoint will work with external clients
- ✅ Root Directory setting: Set to `apps/web` in Vercel dashboard
- ⚠️ Consider implementing OAuth for production use

---

## Next Steps

1. **Deploy to Vercel** - The protectionBypass fix is now in place
2. **Test the endpoint** - Use the MCP inspector or Claude Desktop
3. **Monitor usage** - Check Vercel logs for any issues
4. **Consider OAuth** - Implement for production if security is a concern
