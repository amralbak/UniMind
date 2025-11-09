import React, { useEffect, useState } from "react";
import axios from "axios";

interface UniBoardData {
  move_message: string;
  progress: Record<string, number>;
  xp: { total: number; goal: number };
  badges: number;
  board_pos: number;
}

const API_URL = ""; // Flask proxy handled in dev

const UniBoard: React.FC = () => {
  const [data, setData] = useState<UniBoardData | null>(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/uniboard`);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching UniBoard:", err);
      }
    };
    fetchBoard();
  }, []);

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading Wellness Board...
      </div>
    );

  const progressColors = {
    academics: "bg-purple-400",
    mental_health: "bg-green-400",
    life_balance: "bg-blue-400",
    connection: "bg-pink-400",
    creativity: "bg-yellow-400",
  };

  const progressItems = Object.entries(data.progress);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8 flex justify-center">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl p-8 border border-purple-100">
        {/* Today's Move */}
        <div className="flex items-center gap-4 mb-8 bg-purple-50 p-5 rounded-2xl shadow-sm">
          <div className="text-5xl">🧘‍♀️</div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Today's Move</h2>
            <p className="text-gray-600 text-sm">{data.move_message}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="col-span-2 flex justify-center">
            <div className="relative w-[340px] h-[340px] rounded-2xl bg-purple-100 border-4 border-purple-300 flex flex-wrap justify-between p-4">
              {[
                "Self-Care",
                "Routine Master",
                "Mom",
                "Self-Care Session",
                "Career Plan",
                "Curious Circle",
                "Financial Step",
                "Mental Health",
                "Support Circle",
                "Family Care",
                "Campus Circle",
                "Curious Summer",
                "Refrocat",
                "Creative Outlet",
                "Wellness Board",
              ].map((label, i) => (
                <div
                  key={i}
                  className={`w-[65px] h-[65px] bg-white border border-purple-200 rounded-xl text-[10px] font-medium text-center flex items-center justify-center shadow-sm ${
                    i === data.board_pos ? "bg-yellow-100 border-yellow-300" : ""
                  }`}
                >
                  {label}
                </div>
              ))}

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl animate-bounce">🧍‍♀️</div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-1 space-y-6">
            {/* Progress Tracker */}
            <div>
              <h3 className="font-semibold text-lg text-purple-700 mb-3">
                Progress Tracker
              </h3>
              <div className="space-y-3">
                {progressItems.map(([k, v]) => (
                  <div key={k} className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm font-medium text-gray-700 capitalize">
                      <span>{k.replace("_", " ")}</span>
                      <span>{v}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`${progressColors[k as keyof typeof progressColors]} h-2 rounded-full`}
                        style={{ width: `${(v / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* XP Tracker */}
            <div>
              <h3 className="font-semibold text-lg text-purple-700 mb-3">
                Semester XP
              </h3>
              <div className="bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-purple-500 h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${(data.xp.total / data.xp.goal) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {data.xp.total}/{data.xp.goal} XP
              </p>
            </div>

            {/* Badges */}
            <div>
              <h3 className="font-semibold text-lg text-purple-700 mb-3">
                Badges Earned 🏅
              </h3>
              <div className="flex gap-2 flex-wrap text-3xl">
                {Array.from({ length: Math.max(1, data.badges) }).map((_, i) => (
                  <span key={i}>{i % 3 === 0 ? "🥇" : i % 3 === 1 ? "🥈" : "🥉"}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reflection prompt */}
        <div className="mt-10 text-center bg-purple-50 p-6 rounded-xl border border-purple-100 shadow-sm">
          <p className="text-gray-700 mb-3">
            You’ve been consistent with reflection!  
            How are you feeling about your balance this week?
          </p>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Log Reflection
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniBoard;
