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
          : "fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      }`}
    >
      <div
        className={`bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-3xl p-8 ${
          isEmbedded ? "w-full" : "max-w-lg mx-auto"
        } border-2 border-cyan-400/50 shadow-2xl max-h-[80vh] overflow-y-auto backdrop-blur-sm relative overflow-hidden`}
        style={{
          boxShadow: "0 0 40px rgba(0, 255, 255, 0.3)",
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: "inset 0 0 30px rgba(0, 255, 255, 0.1)" }}
        ></div>

        {!isEmbedded && (
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3
              className="text-cyan-400 text-2xl font-bold font-['Orbitron'] tracking-wide uppercase"
              style={{ textShadow: "0 0 15px rgba(0, 255, 255, 0.6)" }}
            >
              ⚔️ Challenge a Friend
            </h3>
            <button
              onClick={() => setShowChallengeModal(false)}
              className="text-cyan-400 hover:text-white text-3xl font-bold transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-cyan-400/20"
              style={{ textShadow: "0 0 15px rgba(0, 255, 255, 0.6)" }}
            >
              ×
            </button>
          </div>
        )}

        {!showChallengeModal ? (
          <div className="space-y-6 relative z-10">
            {/* Challenge Info */}
            <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-2 border-cyan-400/50 rounded-2xl p-6 text-cyan-200 backdrop-blur-sm">
              <div className="font-bold mb-3 text-lg font-['Orbitron'] tracking-wide uppercase text-cyan-300">
                ⚔️ Challenge Rules
              </div>
              <div className="text-sm font-['Rajdhani'] space-y-2">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">•</span>
                    Both players start with 0 points
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">•</span>
                    Each player can only play once
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">•</span>
                    Play the game to achieve your best score
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">•</span>
                    Challenge ends when both players submit scores
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">•</span>
                    Highest score wins the challenge
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-cyan-300 text-sm font-bold mb-3 font-['Rajdhani']">
                Search for a friend:
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter username..."
                  className="flex-1 px-4 py-3 border-2 text-white bg-slate-700/80 border-cyan-400/50 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-slate-700 transition-all duration-300 font-['Rajdhani'] placeholder-cyan-300/50 backdrop-blur-sm"
                  style={{
                    boxShadow: "0 0 15px rgba(0, 255, 255, 0.1)",
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      searchUsers();
                    }
                  }}
                />
                <button
                  onClick={searchUsers}
                  disabled={isSearching || !hasSubmittedScore}
                  className="group bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 font-['Orbitron'] tracking-wide uppercase relative overflow-hidden"
                  style={{
                    boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">
                    {isSearching ? "🔍" : "Search"}
                  </span>
                </button>
              </div>
            </div>

            {isSearching && (
              <div className="text-center text-cyan-300 font-['Rajdhani'] animate-pulse">
                Searching...
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-cyan-300 font-bold font-['Rajdhani'] text-lg">
                  Search Results:
                </h4>
                {searchResults.map((user) => (
                  <div
                    key={user.fid}
                    className={`group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                      selectedUser?.fid === user.fid
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400 text-white"
                        : "bg-slate-700/80 hover:bg-slate-600/80 text-white border-2 border-transparent hover:border-cyan-400/50"
                    }`}
                    onClick={() => setSelectedUser(user)}
                    style={{
                      boxShadow:
                        selectedUser?.fid === user.fid
                          ? "0 0 20px rgba(0, 255, 255, 0.3)"
                          : "0 0 10px rgba(0, 255, 255, 0.1)",
                    }}
                  >
                    <img
                      src={user.pfpUrl}
                      alt={user.displayName || user.username}
                      className="w-12 h-12 rounded-xl border-2 border-cyan-400 transition-all duration-300 group-hover:scale-110"
                      style={{ boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)" }}
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm font-['Rajdhani']">
                        {user.displayName || user.username}
                      </div>
                      <div className="text-xs opacity-75 font-['Rajdhani']">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedUser && (
              <div className="mt-6">
                <div
                  className="bg-gradient-to-r from-slate-700/80 to-slate-800/80 p-6 rounded-2xl border-2 border-cyan-400/50 backdrop-blur-sm"
                  style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)" }}
                >
                  <h4 className="font-bold text-cyan-300 mb-3 font-['Rajdhani'] text-lg">
                    Selected Friend:
                  </h4>
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedUser.pfpUrl}
                      alt={selectedUser.displayName || selectedUser.username}
                      className="w-14 h-14 rounded-xl border-2 border-cyan-400 transition-all duration-300 hover:scale-110"
                      style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)" }}
                    />
                    <div>
                      <div className="font-bold text-white font-['Rajdhani'] text-lg">
                        {selectedUser.displayName || selectedUser.username}
                      </div>
                      <div className="text-sm text-cyan-300 font-['Rajdhani']">
                        @{selectedUser.username}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={createChallenge}
                  disabled={isCreatingChallenge}
                  className="group w-full mt-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 font-['Orbitron'] tracking-wide uppercase text-lg relative overflow-hidden"
                  style={{
                    boxShadow: "0 0 25px rgba(0, 255, 255, 0.4)",
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">
                    {isCreatingChallenge
                      ? "Creating Challenge..."
                      : "Create Challenge"}
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6 relative z-10">
            <div className="text-4xl animate-bounce">🎉</div>
            <h4
              className="text-cyan-400 font-bold text-xl font-['Orbitron'] tracking-wide uppercase"
              style={{ textShadow: "0 0 15px rgba(0, 255, 255, 0.6)" }}
            >
              Challenge Created!
            </h4>
            <p className="text-cyan-200 text-sm font-['Rajdhani']">
              Share this link with{" "}
              {selectedUser?.displayName || selectedUser?.username} to start the
              challenge:
            </p>
            <div className="bg-slate-700/80 p-4 rounded-xl border border-cyan-400/30 backdrop-blur-sm">
              <code className="text-xs text-cyan-300 break-all font-['Rajdhani']">
                {challengeLink}
              </code>
            </div>
            <div className="text-cyan-300 text-xs font-['Rajdhani']">
              ⏰ Both players have 24 hours to submit their best score!
            </div>

            <ShareButton
              buttonText="Share Challenge"
              cast={{
                text: `⚔️ I just challenged @${selectedUser?.username} to a Farcaster Snake duel! Let's see who gets the highest score! 🐍`,
                bestFriends: false,
                embeds: [challengeLink || ""],
              }}
              className="w-full group bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-4 rounded-2xl font-bold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-['Orbitron'] tracking-wide uppercase relative overflow-hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenge;
