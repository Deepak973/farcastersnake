"use client";

/**
 * HomeTab component displays the main landing content for the mini app.
 *
 * This is the default tab that users see when they first open the mini app.
 * It provides a simple welcome message and placeholder content that can be
 * customized for specific use cases.
 *
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */
export function HomeTab() {
  return (
    <div className="px-6 py-12 md:py-20 lg:py-24 min-h-[calc(100vh-200px)]">
      <div className="text-center w-full max-w-md mx-auto text-sm leading-relaxed text-white font-mono">
        <p className="text-lg font-bold mb-2">Eat, Drink, Poop, Repeat</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          🚀 Live Version (V1)
        </h2>
        <ul className="text-left list-disc list-inside space-y-1">
          <li>
            <strong>Eat</strong> food by guiding your snake to it.
          </li>
          <li>
            After every <strong>2 bites</strong>, you must{" "}
            <strong>drink water 💧</strong>.
          </li>
          <li>
            After every <strong>5 bites</strong>, you need to{" "}
            <strong>poop 🚽</strong>.
          </li>
          <li>
            If you forget to hydrate or poop on time <strong>you die 💀</strong>
            .
          </li>
        </ul>
        <p className="italic mt-4">Eat • Hydrate • Poop • Repeat</p>

        <hr className="my-6 border-white/20" />

        <h2 className="text-xl font-semibold mb-2">🧪 Coming Soon in V2</h2>
        <ul className="text-left list-disc list-inside space-y-1">
          <li>
            🧍 <strong>Eat Your Followers</strong> The snake grows by consuming
            your Farcaster followers.
          </li>
          <li>
            🪙 <strong>Tokenization</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>
                Play for free or pay a small entry fee to join the reward pool.
              </li>
              <li>
                Score <strong>&gt; 50</strong> to earn <code>$SNAKE</code>{" "}
                token.
              </li>
              <li>Weekly reward pool is distributed among top scorers.</li>
            </ul>
          </li>
        </ul>

        {/* Bottom spacing to prevent overlap with footer */}
        <div className="h-20 md:h-32 lg:h-40" />
      </div>
    </div>
  );
}
