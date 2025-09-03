import { NextRequest, NextResponse } from "next/server";

const ALLOWED_DOMAIN = "https://6f3595e567b7.ngrok-free.app";

export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const referer = request.headers.get("referer") || "";

    // Block if referer is missing or not from allowed domain
    if (!referer.startsWith(ALLOWED_DOMAIN)) {
      return NextResponse.json(
        { error: "Access denied - unauthorized request" },
        { status: 403 }
      );
    }

    // Handle preflight (just in case)
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_DOMAIN,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // Process the actual request
    const response = await handler(request);

    // Add CORS headers (for completeness, but not strictly needed if no cross-origin)
    response.headers.set("Access-Control-Allow-Origin", ALLOWED_DOMAIN);
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
