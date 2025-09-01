import { NextRequest, NextResponse } from "next/server";

// Allowed origin - only your domain
const ALLOWED_ORIGIN = "https://farcastersnake.vercel.app";

export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const origin = request.headers.get("origin");

    // Block requests without origin OR from unauthorized origins
    if (!origin || origin !== ALLOWED_ORIGIN) {
      return NextResponse.json(
        { error: "Access denied - unauthorized origin" },
        { status: 403 }
      );
    }

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // Process the actual request
    const response = await handler(request);

    // Add CORS headers to the response
    response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return response;
  };
}
