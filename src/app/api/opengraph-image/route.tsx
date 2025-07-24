import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get("fid");

  const user = fid ? await getNeynarUser(Number(fid)) : null;

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-center items-center relative bg-primary">
        <div tw="flex w-96 h-96 rounded-full overflow-hidden mb-8 border-8 border-white">
          <img
            src={"/logo.jpg"}
            alt="Farcaster Snake"
            tw="w-full h-full object-cover"
          />
        </div>

        <h1 tw="text-8xl text-white">
          {user?.display_name
            ? `Eat, Drink, Poop Repeat`
            : "Eat, Drink, Poop Repeat"}
        </h1>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}
