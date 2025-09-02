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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-deep-pink to-black flex items-center justify-center">
        <div className="text-soft-pink text-xl">Loading challenge...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-deep-pink to-black flex items-center justify-center">
        <div className="text-soft-pink text-xl">{error}</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-deep-pink to-black flex items-center justify-center">
        <div className="text-soft-pink text-xl">Challenge not found</div>
      </div>
    );
  }

  // If a component is active, show it instead of the challenge page
  if (activeComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-pink to-black">
        <Sidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          onAction={handleSidebarAction}
        />
        <button
          onClick={() => setShowSidebar(true)}
          className="absolute top-4 right-4 bg-bright-pink text-soft-pink p-2 rounded-lg hover:bg-deep-pink transition-colors z-10"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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
      <div className="min-h-screen bg-gradient-to-b from-deep-pink to-black">
        <Sidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          onAction={handleSidebarAction}
        />
        <button
          onClick={() => setShowSidebar(true)}
          className="absolute top-4 right-4 bg-bright-pink text-soft-pink p-2 rounded-lg hover:bg-deep-pink transition-colors z-10"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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
    <div className="min-h-screen bg-gradient-to-b from-deep-pink to-black p-4 flex items-center justify-center relative">
      {/* Sidebar */}
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onAction={handleSidebarAction}
      />

      {/* Sidebar Toggle (Top Left) */}
      <button
        onClick={() => setShowSidebar(true)}
        className="absolute top-4 right-4 bg-bright-pink text-soft-pink p-2 rounded-lg hover:bg-deep-pink transition-colors z-10"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 6H21M3 12H21M3 18H21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Game Card */}
      <div className="w-full max-w-md">
        <div className="bg-soft-pink rounded-2xl p-6 border-2 border-deep-pink shadow-2xl">
          {/* Title */}
          <h1 className="text-deep-pink text-2xl font-bold text-center mb-6">
            Snake Challenge
          </h1>

          {/* Players vs */}
          <div className="flex items-center justify-between mb-6">
            {/* Challenger */}
            <div className="flex flex-col items-center">
              <img
                src={challenge.challenger.pfpUrl}
                alt={challenge.challenger.displayName}
                className="w-16 h-16 rounded-full border-2 border-deep-pink mb-2"
              />
              <div className="text-black font-bold text-sm truncate w-20 text-center">
                {challenge.challenger.displayName ||
                  challenge.challenger.username}
              </div>
              <div className="text-bright-pink font-bold text-xs">
                {challenge.challenger.score} pts
              </div>
            </div>

            {/* VS */}
            <div className="text-deep-pink text-xl font-extrabold">VS</div>

            {/* Challenged */}
            <div className="flex flex-col items-center">
              <img
                src={challenge.challenged.pfpUrl}
                alt={challenge.challenged.displayName}
                className="w-16 h-16 rounded-full border-2 border-deep-pink mb-2"
              />
              <div className="text-black font-bold text-sm truncate w-20 text-center">
                {challenge.challenged.displayName ||
                  challenge.challenged.username}
              </div>
              <div className="text-bright-pink font-bold text-xs">
                {challenge.challenged.score} pts
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="text-center mb-4">
            <div className="text-black font-bold">
              {challenge.status.toUpperCase()}
            </div>
            <div className="text-xs text-gray-600">
              {isChallengeCompleted()
                ? "Both players submitted"
                : "Waiting for submissions"}
            </div>
          </div>

          {/* Winner */}
          {challenge.status === "completed" && challenge.winner && (
            <div className="text-center bg-bright-pink text-soft-pink p-3 rounded-xl mt-4">
              <div className="text-lg font-bold">
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
          <div className="mt-6">
            {challenge.status === "active" &&
              (isCurrentUserChallenger || isCurrentUserChallenged) &&
              (!hasSubmitted ? (
                <button
                  onClick={() => {
                    setShowGame(true);
                    setScoreSubmitted(false);
                  }}
                  className="w-full bg-bright-pink text-soft-pink py-3 rounded-xl font-bold text-base hover:bg-deep-pink transition"
                >
                  Play Now
                </button>
              ) : (
                <div className="text-center bg-blue-100 text-blue-800 p-2 rounded-xl">
                  <div className="font-bold text-sm">Score Submitted</div>
                  <div className="text-xs">You can’t submit again</div>
                </div>
              ))}

            {!isCurrentUserChallenger && !isCurrentUserChallenged && (
              <div className="text-center bg-gray-100 text-gray-800 p-3 rounded-xl">
                <div className="font-bold text-sm">Spectator Mode</div>
                <div className="text-xs">You’re watching this challenge</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
