import React from "react";

/**
 * Example component demonstrating the new 4-color palette design system
 *
 * This component shows how to use the new color scheme:
 * - #000000 (black) → base color for text and dark backgrounds
 * - #CF0F47 (deep pink-red) → primary brand color
 * - #FF0B55 (bright pink-red) → highlight and call-to-action color
 * - #FFDEDE (soft pink) → background for sections/cards
 */
const ExampleCard: React.FC = () => {
  return (
    <div className="bg-soft-pink rounded-2xl p-6 border-2 border-deep-pink shadow-xl max-w-md mx-auto">
      {/* Card with soft pink background and deep pink border */}
      <div className="text-center space-y-4">
        {/* Heading using deep pink */}
        <h2 className="text-deep-pink text-2xl font-bold">
          🎮 Farcaster Snake
        </h2>

        {/* Text using black on light background */}
        <p className="text-black text-sm leading-relaxed">
          Experience the ultimate snake game with a twist! Eat, drink, and poop
          your way to the top of the leaderboard. Can you survive the longest
          and achieve the highest score?
        </p>

        {/* CTA button using bright pink with hover effect */}
        <button className="bg-bright-pink text-soft-pink px-6 py-3 rounded-xl font-bold hover:bg-deep-pink transition-all duration-200 transform hover:scale-105 shadow-lg">
          Play Now! 🚀
        </button>

        {/* Secondary button with outline style */}
        <button className="border-2 border-deep-pink text-deep-pink bg-transparent px-6 py-3 rounded-xl font-bold hover:bg-deep-pink hover:text-soft-pink transition-all duration-200">
          View Leaderboard 🏆
        </button>
      </div>
    </div>
  );
};

export default ExampleCard;
