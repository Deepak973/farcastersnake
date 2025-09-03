"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useMiniApp } from "@neynar/react";
import SnakeGame from "~/components/ui/game/SnakeGame";
import Sidebar from "~/components/ui/Sidebar";
import { LeaderboardComponent } from "~/components/ui/game/LeaderboardComponent";
import { RulesComponent } from "~/components/ui/game/RulesComponent";
import { ChallengesComponent } from "~/components/ui/game/ChallengesComponent";
import { useToast } from "~/components/ui/Toast";

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

const ChallengePage: React.FC = () => {
  const params = useParams();
  const { context } = useMiniApp();
  const { showToast } = useToast();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [_finalScore, setFinalScore] = useState<number | null>(null);
  const [_submitting, setSubmitting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [previousBestScore, setPreviousBestScore] = useState<number | null>(
    null
  );
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await fetch(`/api/challenge?id=${params.id}`);
        const data = await response.json();

        if (data.challenge) {
          setChallenge(data.challenge);
        } else {
          setError("Challenge not found");
        }
      } catch (_error) {
        setError("Failed to load challenge");
      } finally {
        setLoading(false);
      }
    };

    const fetchPreviousBestScore = async () => {
      if (!context?.user?.fid && !context?.user?.username) return;

      try {
        // Get the challenge data to find the user's previous score in this challenge
        const response = await fetch(`/api/challenge?id=${params.id}`);
        const data = await response.json();

        if (data.challenge) {
          const challenge = data.challenge;
          const currentUserFid = context.user.fid;

          // Check if current user is challenger or challenged
          if (challenge.challenger.fid === currentUserFid) {
            setPreviousBestScore(challenge.challenger.score || 0);
          } else if (challenge.challenged.fid === currentUserFid) {
            setPreviousBestScore(challenge.challenged.score || 0);
          }
        }
      } catch (error) {
        console.error("Failed to fetch previous best score:", error);
      }
    };

    if (params.id) {
      fetchChallenge();
    }
    fetchPreviousBestScore();
  }, [params.id, context?.user?.fid, context?.user?.username]);

  const submitScore = async (score: number) => {
    if (!challenge || !context?.user) return;

    // Prevent duplicate submissions
    if (scoreSubmitted) {
      console.log("Score already submitted, skipping duplicate submission");
      return;
    }

    // Get current user's score in this challenge
    const currentUserFid = context.user.fid;
    const currentScore =
      challenge.challenger.fid === currentUserFid
        ? challenge.challenger.score
        : challenge.challenged.score;

    // Only submit if score is higher than current score in this challenge
    if (currentScore > 0 && score <= currentScore) {
      console.log(
        `Score ${score} not submitted - current challenge score is ${currentScore}`
      );

      // Show appropriate message only if not already submitted
      if (!scoreSubmitted) {
        if (score === currentScore) {
          showToast(`🏆 Tied your challenge score of ${score} points!`, "info");
        } else {
          showToast(
            `Score: ${score} points (your challenge best is ${currentScore})`,
            "info"
          );
        }
      }
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          challengeId: challenge.id,
          challenger: {
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          },
          score,
        }),
      });

      const data = await response.json();
      if (data.challenge) {
        setChallenge(data.challenge);
        setFinalScore(score);
        setScoreSubmitted(true); // Mark as submitted to prevent duplicates

        // Show success message for score update
        if (hasSubmitted) {
          const currentScore = isCurrentUserChallenger
            ? challenge.challenger.score
            : challenge.challenged.score;

          if (score > currentScore) {
            showToast(
              `New challenge high score! You improved from ${currentScore} to ${score} points!`,
              "success"
            );
          } else if (score === currentScore) {
            showToast(`Tied your challenge score of ${score} points!`, "info");
          } else {
            showToast(
              `Score submitted: ${score} points (your challenge best is ${currentScore})`,
              "info"
            );
          }
        } else {
          // First time submitting to this challenge
          showToast(
            `First challenge score submitted: ${score} points!`,
            "success"
          );
        }

        // Update previous best score if this is a new high score in this challenge
        if (previousBestScore === null || score > previousBestScore) {
          setPreviousBestScore(score);
        }
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const isChallengeCompleted = () => {
    if (!challenge) return false;
    return (
      challenge.status === "completed" ||
      (challenge.challenger.submittedAt && challenge.challenged.submittedAt)
    );
  };

  const handleSidebarAction = (action: string) => {
    if (action === "game") {
      // Stay on current challenge page
      window.location.href = `/`;
    } else {
      // Show component inline
      setActiveComponent(action);
    }
    setShowSidebar(false);
  };

  const closeComponent = () => {
    setActiveComponent(null);
  };

  const isCurrentUserChallenger =
    challenge?.challenger.fid === context?.user?.fid;
  const isCurrentUserChallenged =
    challenge?.challenged.fid === context?.user?.fid;
  const hasSubmitted = isCurrentUserChallenger
    ? challenge?.challenger.submittedAt
    : challenge?.challenged.submittedAt;

  // Header Component
  const GameHeader = ({
    title,
    showSidebarButton = true,
  }: {
    title: string;
    showSidebarButton?: boolean;
  }) => (
    <div className="absolute top-0 left-0 right-0 z-20">
      <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md border-b-2 border-cyan-400/50 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Page Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full shadow-lg"
              style={{ boxShadow: "0 0 15px rgba(0, 255, 255, 0.6)" }}
            ></div>
            <h1
              className="text-2xl font-extrabold font-['Orbitron'] tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400"
              style={{ textShadow: "0 0 20px rgba(0, 255, 255, 0.5)" }}
            >
              {title}
            </h1>
          </div>

          {/* Sidebar Button */}
          {showSidebarButton && (
            <button
              onClick={() => setShowSidebar(true)}
              className="group relative bg-gradient-to-r from-cyan-500/90 to-purple-600/90 hover:from-cyan-400 hover:to-purple-500 text-white p-3 rounded-xl transition-all duration-300 font-['Orbitron'] tracking-wide uppercase text-sm font-bold overflow-hidden border border-cyan-400/50"
              style={{
                boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
                textShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10"
              >
                <path
                  d="M3 12H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 6H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 18H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1)_0%,transparent_50%)]"></div>

        <div
          className="text-cyan-400 text-2xl font-['Orbitron'] tracking-wide uppercase relative z-10 animate-pulse"
          style={{ textShadow: "0 0 20px rgba(0, 255, 255, 0.6)" }}
        >
          Loading challenge...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1)_0%,transparent_50%)]"></div>

        <div
          className="text-red-400 text-2xl font-['Orbitron'] tracking-wide uppercase relative z-10"
          style={{ textShadow: "0 0 20px rgba(239, 68, 68, 0.6)" }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1)_0%,transparent_50%)]"></div>

        <div
          className="text-cyan-400 text-2xl font-['Orbitron'] tracking-wide uppercase relative z-10"
          style={{ textShadow: "0 0 20px rgba(0, 255, 255, 0.6)" }}
        >
          Challenge not found
        </div>
      </div>
    );
  }

  // If a component is active, show it instead of the challenge page
  if (activeComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1)_0%,transparent_50%)]"></div>

        <Sidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          onAction={handleSidebarAction}
        />
        <button
          onClick={() => setShowSidebar(true)}
          className="absolute top-6 left-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-3 rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 z-10 font-['Orbitron'] tracking-wide uppercase text-sm font-bold relative overflow-hidden group"
          style={{
            boxShadow: "0 0 25px rgba(0, 255, 255, 0.4)",
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10"
          >
            <path
              d="M3 12H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 6H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 18H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {activeComponent === "leaderboard" && (
          <LeaderboardComponent onClose={closeComponent} />
        )}
        {activeComponent === "rules" && (
          <RulesComponent onClose={closeComponent} />
        )}
        {activeComponent === "challenges" && (
          <ChallengesComponent onClose={closeComponent} />
        )}
      </div>
    );
  }

  if (showGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1)_0%,transparent_50%)]"></div>

        <Sidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          onAction={handleSidebarAction}
        />
        <button
          onClick={() => setShowSidebar(true)}
          className="absolute top-6 left-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-3 rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 z-10 font-['Orbitron'] tracking-wide uppercase text-sm font-bold relative overflow-hidden group"
          style={{
            boxShadow: "0 0 25px rgba(0, 255, 255, 0.4)",
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10"
          >
            <path
              d="M3 12H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 6H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 18H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <SnakeGame
          onGameOver={(score) => {
            setShowGame(false);
            setFinalScore(score);
            setTimeout(() => {
              submitScore(score);
            }, 0);
          }}
          previousBestScore={previousBestScore}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black p-6 flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1)_0%,transparent_50%)]"></div>

      {/* Header */}
      <GameHeader title="CHALLENGE" />

      {/* Sidebar */}
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onAction={handleSidebarAction}
      />

      {/* Header */}
      <GameHeader title="CHALLENGE" />

      {/* Game Card */}
      <div className="w-full max-w-lg relative z-10">
        <div
          className="group bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-3xl p-8 border-2 border-cyan-400/50 hover:border-cyan-400 transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
          style={{ boxShadow: "0 0 40px rgba(0, 255, 255, 0.3)" }}
        >
          {/* Hover glow effect */}
          <div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: "inset 0 0 30px rgba(0, 255, 255, 0.1)" }}
          ></div>

          {/* Title */}
          <h1
            className="text-cyan-400 text-3xl font-bold text-center mb-8 font-['Orbitron'] tracking-wide uppercase relative z-10"
            style={{ textShadow: "0 0 20px rgba(0, 255, 255, 0.6)" }}
          >
            Snake Challenge
          </h1>

          {/* Players vs */}
          <div className="flex items-center justify-between mb-8 relative z-10">
            {/* Challenger */}
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <img
                  src={challenge.challenger.pfpUrl}
                  alt={challenge.challenger.displayName}
                  className="w-20 h-20 rounded-2xl border-2 border-cyan-400 transition-all duration-300 group-hover:scale-110"
                  style={{ boxShadow: "0 0 25px rgba(0, 255, 255, 0.4)" }}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div
                className="text-white font-bold text-sm truncate w-24 text-center font-['Rajdhani'] mb-2"
                style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.3)" }}
              >
                {challenge.challenger.displayName ||
                  challenge.challenger.username}
              </div>
              <div className="text-cyan-300 font-bold text-sm font-['Rajdhani']">
                {challenge.challenger.score} pts
              </div>
            </div>

            {/* VS */}
            <div
              className="text-cyan-400 text-3xl font-extrabold font-['Orbitron'] tracking-wider uppercase"
              style={{ textShadow: "0 0 20px rgba(0, 255, 255, 0.6)" }}
            >
              VS
            </div>

            {/* Challenged */}
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <img
                  src={challenge.challenged.pfpUrl}
                  alt={challenge.challenged.displayName}
                  className="w-20 h-20 rounded-2xl border-2 border-cyan-400 transition-all duration-300 group-hover:scale-110"
                  style={{ boxShadow: "0 0 25px rgba(0, 255, 255, 0.4)" }}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div
                className="text-white font-bold text-sm truncate w-24 text-center font-['Rajdhani'] mb-2"
                style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.3)" }}
              >
                {challenge.challenged.displayName ||
                  challenge.challenged.username}
              </div>
              <div className="text-cyan-300 font-bold text-sm font-['Rajdhani']">
                {challenge.challenged.score} pts
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="text-center mb-6 relative z-10">
            <div
              className="text-cyan-300 font-bold font-['Orbitron'] tracking-wide uppercase mb-2"
              style={{ textShadow: "0 0 10px rgba(0, 255, 255, 0.5)" }}
            >
              {challenge.status.toUpperCase()}
            </div>
            <div className="text-sm text-cyan-200 font-['Rajdhani']">
              {isChallengeCompleted()
                ? "Both players submitted"
                : "Waiting for submissions"}
            </div>
          </div>

          {/* Winner */}
          {challenge.status === "completed" && challenge.winner && (
            <div
              className="text-center bg-gradient-to-r from-cyan-900/30 to-purple-900/30 text-cyan-200 p-4 rounded-2xl mt-6 border border-cyan-400/30 backdrop-blur-sm relative z-10"
              style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)" }}
            >
              <div className="text-lg font-bold font-['Orbitron'] tracking-wide uppercase">
                Winner:{" "}
                {challenge.winner === "challenger"
                  ? challenge.challenger.displayName ||
                    challenge.challenger.username
                  : challenge.challenged.displayName ||
                    challenge.challenged.username}
              </div>
            </div>
          )}

          {/* Action / Spectator */}
          <div className="mt-8 relative z-10">
            {challenge.status === "active" &&
              (isCurrentUserChallenger || isCurrentUserChallenged) &&
              (!hasSubmitted ? (
                <button
                  onClick={() => {
                    setShowGame(true);
                    setScoreSubmitted(false);
                  }}
                  className="group w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-['Orbitron'] tracking-wide uppercase relative overflow-hidden"
                  style={{
                    boxShadow: "0 0 25px rgba(0, 255, 255, 0.4)",
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Play Now!</span>
                </button>
              ) : (
                <div
                  className="text-center bg-gradient-to-r from-blue-900/30 to-blue-800/30 text-blue-200 p-4 rounded-2xl border border-blue-400/30 backdrop-blur-sm"
                  style={{ boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)" }}
                >
                  <div className="font-bold text-sm font-['Rajdhani'] mb-1">
                    Score Submitted
                  </div>
                  <div className="text-xs font-['Rajdhani']">
                    You can&apos;t submit again
                  </div>
                </div>
              ))}

            {!isCurrentUserChallenger && !isCurrentUserChallenged && (
              <div
                className="text-center bg-gradient-to-r from-slate-700/30 to-slate-800/30 text-slate-200 p-4 rounded-2xl border border-slate-400/30 backdrop-blur-sm"
                style={{ boxShadow: "0 0 20px rgba(148, 163, 184, 0.2)" }}
              >
                <div className="font-bold text-sm font-['Rajdhani'] mb-1">
                  Spectator Mode
                </div>
                <div className="text-xs font-['Rajdhani']">
                  You&apos;re watching this challenge
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
