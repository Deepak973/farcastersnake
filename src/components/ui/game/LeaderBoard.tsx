import { useEffect, useState } from "react";

function LeaderboardTab() {
  const [scores, setScores] = useState<
    {
      _id: string;
      username: string;
      address: string;
      score: number;
      profileImage: string;
    }[]
  >([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setScores(data))
      .catch((err) => console.error("Failed to fetch leaderboard", err));
  }, []);

  return (
    <div className="min-h-screen pt-8 pb-8 px-4">
      <div className="max-w-md mx-auto text-center font-mono">
        <h2 className="text-3xl font-bold text-purple-400 mb-6">
          🏆 Leaderboard
        </h2>

        <ul className="space-y-4">
          {scores.map((entry, index) => (
            <li
              key={entry._id}
              className="flex items-center justify-between bg-gray-900 rounded-xl p-3 shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-300 font-bold text-lg w-6 text-right">
                  {index + 1}.
                </span>
                <img
                  src={entry.profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-white text-sm truncate max-w-[120px]">
                  {entry.username || `${entry.address.slice(0, 6)}...`}
                </span>
              </div>
              <span className="text-cyan-300 font-semibold">
                {entry.score} pts
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default LeaderboardTab;
