import React, { useState, useEffect } from "react";
import { useMiniApp } from "@neynar/react";
import { ShareButton } from "./Share";
import { APP_URL } from "~/lib/constants";
import { useToast } from "./Toast";

type User = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  followerCount: number;
  followingCount: number;
};

type Challenge = {
  id: string;
  challenger: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    score: number;
    submittedAt: string | null;
  };
  challenged: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    score: number;
    submittedAt: string | null;
  };
  createdAt: string;
  expiresAt: string;
  status: string;
  winner?: string;
};

interface ChallengeProps {
  isEmbedded?: boolean;
  setShowCreateChallenge?: (show: boolean) => void;
}

const Challenge: React.FC<ChallengeProps> = ({
  isEmbedded = false,
  setShowCreateChallenge,
}) => {
  const { context } = useMiniApp();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const [challengeLink, setChallengeLink] = useState<string | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);

  // Check if user has submitted a score
  const checkUserScore = async () => {
    if (!context?.user?.fid && !context?.user?.username) return;

    try {
      // Try to find score by FID first, then by username
      let response;
      if (context?.user?.fid) {
        response = await fetch(
          `/api/leaderboard?fid=${context.user.fid}&username=${
            context.user.username || ""
          }`
        );
      } else {
        response = await fetch(
          `/api/leaderboard?username=${context.user.username}`
        );
      }

      const data = await response.json();

      if (data.scores && data.scores.length > 0) {
        // Find score by FID or username
        const userScoreData = data.scores.find(
          (score: any) =>
            score.fid === context.user.fid ||
            score.username === context.user.username
        );
        if (userScoreData) {
          setUserScore(userScoreData.score);
          setHasSubmittedScore(true);
        }
      }
    } catch (error) {
      console.error("Error checking user score:", error);
      showToast("Failed to check your score", "error");
    }
  };

  useEffect(() => {
    checkUserScore();
  }, [context?.user?.fid]);

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/user-search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.users) {
        setSearchResults(data.users);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      showToast("Failed to search users", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const createChallenge = async () => {
    if (!selectedUser || !context?.user) return;

    setIsCreatingChallenge(true);
    try {
      console.log("Creating challenge with data:", {
        challenger: {
          fid: context.user.fid,
          username: context.user.username,
          displayName: context.user.displayName,
          pfpUrl: context.user.pfpUrl,
          score: 0, // Start with 0 for new challenge
        },
        challenged: {
          fid: selectedUser.fid,
          username: selectedUser.username,
          displayName: selectedUser.displayName,
          pfpUrl: selectedUser.pfpUrl,
          score: 0,
        },
      });

      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          challenger: {
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
            score: 0, // Start with 0 for new challenge
          },
          challenged: {
            fid: selectedUser.fid,
            username: selectedUser.username,
            displayName: selectedUser.displayName,
            pfpUrl: selectedUser.pfpUrl,
            score: 0,
          },
        }),
      });

      console.log("Challenge creation response status:", response.status);
      const data = await response.json();
      console.log("Challenge creation response data:", data);
      if (data.challengeId) {
        const link = `${APP_URL}/challenge/${data.challengeId}`;
        setChallengeLink(link);
        setShowChallengeModal(true);
        setShowCreateChallenge?.(false);
        showToast("Challenge created successfully!", "success");
      }
    } catch (error) {
      console.error("Error creating challenge:", error);
      showToast("Failed to create challenge", "error");
    } finally {
      setIsCreatingChallenge(false);
    }
  };

  return (
    <div
      className={`${
        isEmbedded
          ? ""
          : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      }`}
    >
      <div
        className={`bg-soft-pink rounded-2xl p-6 ${
          isEmbedded ? "w-full" : "max-w-md mx-auto"
        } border-2 border-deep-pink shadow-2xl max-h-[80vh] overflow-y-auto`}
      >
        {!isEmbedded && (
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-deep-pink text-xl font-bold">
              ⚔️ Challenge a Friend
            </h3>
            <button
              onClick={() => setShowChallengeModal(false)}
              className="text-deep-pink hover:text-bright-pink text-2xl font-bold"
            >
              ×
            </button>
          </div>
        )}

        {!showChallengeModal ? (
          <div className="space-y-4">
            {/* Challenge Info */}
            <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4 text-blue-800">
              <div className="font-bold mb-2">⚔️ Challenge Rules</div>
              <div className="text-sm">
                <ul>
                  <li>Both players start with 0 points</li>
                  <li>Each player can only play once</li>
                  <li>Play the game to achieve your best score</li>
                  <li>Challenge ends when both players submit scores</li>
                  <li>Highest score wins the challenge</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-black text-sm font-bold mb-2">
                Search for a friend:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter username..."
                  className="flex-1 px-3 py-2 border-2 text-black border-deep-pink rounded-lg focus:outline-none focus:border-bright-pink"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      searchUsers();
                    }
                  }}
                />
                <button
                  onClick={searchUsers}
                  disabled={isSearching || !hasSubmittedScore}
                  className="bg-bright-pink text-soft-pink px-4 py-2 rounded-lg font-bold hover:bg-deep-pink transition-colors disabled:opacity-50"
                >
                  {isSearching ? "🔍" : "Search"}
                </button>
              </div>
            </div>

            {isSearching && (
              <div className="text-center text-black">Searching...</div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-black font-bold">Search Results:</h4>
                {searchResults.map((user) => (
                  <div
                    key={user.fid}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.fid === user.fid
                        ? "bg-bright-pink text-black"
                        : "bg-white hover:bg-gray-100 text-black"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <img
                      src={user.pfpUrl}
                      alt={user.displayName || user.username}
                      className="w-10 h-10 rounded-full border-2 border-deep-pink"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm">
                        {user.displayName || user.username}
                      </div>
                      <div className="text-xs opacity-75">@{user.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedUser && (
              <div className="mt-4">
                <div className="bg-white p-4 rounded-lg border-2 border-deep-pink">
                  <h4 className="font-bold text-black mb-2">
                    Selected Friend:
                  </h4>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedUser.pfpUrl}
                      alt={selectedUser.displayName || selectedUser.username}
                      className="w-12 h-12 rounded-full border-2 border-deep-pink"
                    />
                    <div>
                      <div className="font-bold text-black">
                        {selectedUser.displayName || selectedUser.username}
                      </div>
                      <div className="text-sm text-gray-600">
                        @{selectedUser.username}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={createChallenge}
                  disabled={isCreatingChallenge}
                  className="w-full mt-4 bg-bright-pink text-soft-pink py-3 px-4 rounded-xl font-bold hover:bg-deep-pink transition-colors disabled:opacity-50"
                >
                  {isCreatingChallenge
                    ? "Creating Challenge..."
                    : "Create Challenge"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-2xl">🎉</div>
            <h4 className="text-deep-pink font-bold text-lg">
              Challenge Created!
            </h4>
            <p className="text-black text-sm">
              Share this link with{" "}
              {selectedUser?.displayName || selectedUser?.username} to start the
              challenge:
            </p>
            <div className="bg-white p-3 rounded-lg border border-gray-300">
              <code className="text-xs text-gray-600 break-all">
                {challengeLink}
              </code>
            </div>
            <div className="text-black text-xs">
              ⏰ Both players have 24 hours to submit their best score!
            </div>

            <ShareButton
              buttonText="Share Challenge"
              cast={{
                text: `⚔️ I just challenged @${selectedUser?.username} to a Farcaster Snake duel! Let's see who gets the highest score! 🐍`,
                bestFriends: true,
                embeds: [challengeLink || ""],
              }}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenge;
