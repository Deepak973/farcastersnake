import { notificationDetailsSchema } from "@farcaster/miniapp-sdk";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setUserNotificationDetails } from "~/lib/kv";
import { sendMiniAppNotification } from "~/lib/notifs";
import { sendNeynarMiniAppNotification } from "~/lib/neynar";
import { withCors } from "~/lib/cors";

const requestSchema = z.object({
  fid: z.number(),
  notificationDetails: notificationDetailsSchema,
});

async function handler(request: NextRequest) {
  // If Neynar is enabled, we don't need to store notification details
  // as they will be managed by Neynar's system
  const neynarEnabled =
    process.env.NEYNAR_API_KEY && process.env.NEYNAR_CLIENT_ID;

  const requestJson = await request.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return NextResponse.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  // Only store notification details if not using Neynar
  if (!neynarEnabled) {
    await setUserNotificationDetails(
      Number(requestBody.data.fid),
      requestBody.data.notificationDetails
    );
  }

  // Use appropriate notification function based on Neynar status
  const sendNotification = neynarEnabled
    ? sendNeynarMiniAppNotification
    : sendMiniAppNotification;
  const sendResult = await sendNotification({
    fid: Number(requestBody.data.fid),
    title: "Test notification",
    body: "Sent at " + new Date().toISOString(),
  });

  if (sendResult.state === "error") {
    return NextResponse.json(
      { success: false, error: sendResult.error },
      { status: 500 }
    );
  } else if (sendResult.state === "rate_limit") {
    return NextResponse.json(
      { success: false, error: "Rate limited" },
      { status: 429 }
    );
  }

  return NextResponse.json({ success: true });
}

export const POST = withCors(handler);
