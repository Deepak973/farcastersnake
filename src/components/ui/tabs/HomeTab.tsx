"use client";

/**
 * HomeTab component displays the main landing content for the mini app.
 * It now includes game rules and plans for the next version.
 */

export function HomeTab() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)] px-6 text-white">
      <div className="text-left w-full max-w-md mx-auto font-sans">
        <h2 className="text-2xl font-bold mb-4">
          🐍 Farcaster Snake - Game Rules
        </h2>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">🎮 V1 - Live Now</h3>
          <ul className="list-disc list-inside space-y-2 text-white">
            <li>
              Eat{" "}
              <img
                src="/x.png"
                className="inline h-4 w-4 align-middle mx-1"
                alt="Food"
              />{" "}
              to grow.
            </li>
            <li>Drink 💧 after every 2 bites or it’s game over 💀.</li>
            <li>Poop 🚽 after every 5 bites or it’s game over 💀.</li>
            <li>Submit your score and see how you rank!</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">🚀 V2 - Coming Soon</h3>
          <ul className="list-disc list-inside space-y-2 text-white">
            <li>Eat your followers 👥 to grow faster.</li>
            <li>Game tokenization for rewards.</li>
            <li>Play for free, or pay a fee to enter earning mode.</li>
            <li>
              If you score more than 50, you&rsquo;ll receive{" "}
              <strong>Snake Tokens 🐍</strong>.
            </li>
            <li>
              All entry fees go into a prize pool, redeemable weekly based on
              your share.
            </li>
          </ul>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          Powered by Neynar 🪐
        </p>
      </div>
    </div>
  );
}
