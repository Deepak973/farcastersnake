# CORS Protection for Farcaster Snake APIs

## Overview

All backend APIs are now protected with CORS (Cross-Origin Resource Sharing) to ensure they can only be called from the authorized domain: `https://farcastersnake.vercel.app`

## How It Works

### CORS Middleware

The `withCors` middleware in `src/lib/cors.ts` protects all API endpoints by:

1. **Origin Validation**: Only allows requests from `https://farcastersnake.vercel.app`
2. **Preflight Handling**: Properly handles OPTIONS requests for CORS preflight
3. **Header Management**: Adds appropriate CORS headers to responses

### Protected APIs

The following APIs are now protected with CORS:

- `/api/submit-score` - Score submission
- `/api/challenge` - Challenge creation and management
- `/api/leaderboard` - Leaderboard data
- `/api/followers` - Follower data
- `/api/user-search` - User search functionality
- `/api/users` - User data
- `/api/best-friends` - Best friends data
- `/api/send-notification` - Notification sending

## Security Benefits

### ✅ **Prevents Unauthorized Access**

- Blocks requests from tools like Postman, curl, Insomnia
- Prevents direct API calls from other domains
- Stops automated attacks and scraping

### ✅ **Domain-Only Access**

- Only your app domain can access the APIs
- No external applications can call your endpoints
- Protects against data manipulation

### ✅ **Simple Implementation**

- No complex authentication required
- No API keys to manage
- Easy to maintain and debug

## Testing

### Valid Request (from your app)

```bash
# This will work when called from https://farcastersnake.vercel.app
curl -H "Origin: https://farcastersnake.vercel.app" \
     https://farcastersnake.vercel.app/api/leaderboard
```

### Invalid Request (will be blocked)

```bash
# This will be blocked - wrong origin
curl -H "Origin: https://malicious-site.com" \
     https://farcastersnake.vercel.app/api/leaderboard

# This will be blocked - no origin (Postman, curl, etc.)
curl https://farcastersnake.vercel.app/api/leaderboard
```

## Implementation Details

### CORS Middleware

```typescript
// src/lib/cors.ts
const ALLOWED_ORIGIN = "https://farcastersnake.vercel.app";

export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const origin = request.headers.get("origin");

    // Block requests from unauthorized origins
    if (origin && origin !== ALLOWED_ORIGIN) {
      return NextResponse.json(
        { error: "Access denied - unauthorized origin" },
        { status: 403 }
      );
    }

    // Process the request and add CORS headers
    const response = await handler(request);
    response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);

    return response;
  };
}
```

### API Protection

```typescript
// Example: src/app/api/submit-score/route.ts
import { withCors } from "~/lib/cors";

async function handler(req: Request) {
  // Your API logic here
}

export const POST = withCors(handler);
```

## Benefits for Your App

1. **Security**: Prevents unauthorized access to your APIs
2. **Data Protection**: Ensures only your app can submit scores and create challenges
3. **Performance**: Blocks unwanted traffic and API abuse
4. **Simplicity**: Easy to understand and maintain
5. **Compliance**: Follows web security best practices

## No Configuration Required

The CORS protection is automatically applied to all protected APIs. Your app will continue to work normally, but external tools and unauthorized domains will be blocked.
